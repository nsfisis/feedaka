package main

import (
	"context"
	"database/sql"
	"embed"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/hashicorp/go-multierror"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/mattn/go-sqlite3"
	"github.com/mmcdole/gofeed"
	"github.com/vektah/gqlparser/v2/ast"

	"undef.ninja/x/feedaka/db"
	"undef.ninja/x/feedaka/graphql"
	"undef.ninja/x/feedaka/graphql/resolver"
)

//go:generate go tool sqlc generate
//go:generate go tool gqlgen generate

var (
	database *sql.DB
	queries  *db.Queries
	//go:embed public/*
	publicFS embed.FS
)

func fetchOneFeed(feedID int64, url string, ctx context.Context) error {
	log.Printf("Fetching %s...\n", url)
	fp := gofeed.NewParser()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	feed, err := fp.ParseURLWithContext(url, ctx)
	if err != nil {
		return fmt.Errorf("Failed to fetch %s: %v\n", url, err)
	}
	err = queries.UpdateFeedMetadata(ctx, db.UpdateFeedMetadataParams{
		Title:     feed.Title,
		FetchedAt: time.Now().UTC().Format(time.RFC3339),
		ID:        feedID,
	})
	if err != nil {
		return err
	}
	guids, err := queries.GetArticleGUIDsByFeed(ctx, feedID)
	if err != nil {
		return err
	}
	existingArticleGUIDs := make(map[string]bool)
	for _, guid := range guids {
		existingArticleGUIDs[guid] = true
	}
	for _, item := range feed.Items {
		if existingArticleGUIDs[item.GUID] {
			err := queries.UpdateArticle(ctx, db.UpdateArticleParams{
				Title:  item.Title,
				Url:    item.Link,
				FeedID: feedID,
				Guid:   item.GUID,
			})
			if err != nil {
				return err
			}
		} else {
			_, err := queries.CreateArticle(ctx, db.CreateArticleParams{
				FeedID: feedID,
				Guid:   item.GUID,
				Title:  item.Title,
				Url:    item.Link,
				IsRead: 0,
			})
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func listFeedsToBeFetched(ctx context.Context) (map[int64]string, error) {
	feeds, err := queries.GetFeedsToFetch(ctx)
	if err != nil {
		return nil, err
	}

	result := make(map[int64]string)
	for _, feed := range feeds {
		fetchedAtTime, err := time.Parse(time.RFC3339, feed.FetchedAt)
		if err != nil {
			log.Fatal(err)
		}
		now := time.Now().UTC()
		if now.Sub(fetchedAtTime).Minutes() <= 10 {
			continue
		}
		result[feed.ID] = feed.Url
	}
	return result, nil
}

func fetchAllFeeds(ctx context.Context) error {
	feeds, err := listFeedsToBeFetched(ctx)
	if err != nil {
		return err
	}

	var result *multierror.Error
	for feedID, url := range feeds {
		err := fetchOneFeed(feedID, url, ctx)
		if err != nil {
			result = multierror.Append(result, err)
		}
		time.Sleep(5 * time.Second)
	}
	return result.ErrorOrNil()
}

func scheduled(ctx context.Context, d time.Duration, fn func()) {
	ticker := time.NewTicker(d)
	go func() {
		for {
			select {
			case <-ticker.C:
				fn()
			case <-ctx.Done():
				return
			}
		}
	}()
}

func main() {
	// Parse command line flags
	var migrate = flag.Bool("migrate", false, "Run database migrations")
	flag.Parse()

	port := os.Getenv("FEEDAKA_PORT")
	if port == "" {
		port = "8080"
	}

	var err error
	database, err = sql.Open("sqlite3", "feedaka.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	// Migration mode
	if *migrate {
		log.Println("Running database migrations...")
		err = db.RunMigrations(database)
		if err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Migrations completed successfully")
		return
	}

	err = db.ValidateSchemaVersion(database)
	if err != nil {
		log.Fatal(err)
	}

	queries = db.New(database)

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5:      true,
		Root:       "public",
		Filesystem: http.FS(publicFS),
	}))

	// Setup GraphQL server
	srv := handler.New(graphql.NewExecutableSchema(graphql.Config{Resolvers: &resolver.Resolver{DB: database, Queries: queries}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// GraphQL endpoints
	e.POST("/graphql", echo.WrapHandler(srv))
	e.GET("/graphql", echo.WrapHandler(srv))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	scheduled(ctx, 1*time.Hour, func() {
		err := fetchAllFeeds(ctx)
		if err != nil {
			log.Printf("Failed to fetch feeds: %v\n", err)
		}
	})

	// Setup graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		cancel()

		// Give time for graceful shutdown
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer shutdownCancel()

		if err := e.Shutdown(shutdownCtx); err != nil {
			log.Printf("Error during shutdown: %v\n", err)
		}
	}()

	log.Printf("Server starting on port %s...\n", port)
	err = e.Start(":" + port)
	if err != nil && err != http.ErrServerClosed {
		log.Printf("Server error: %v\n", err)
	}
	log.Println("Server stopped")
}
