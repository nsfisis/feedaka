package main

import (
	"context"
	"database/sql"
	"embed"
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

	"undef.ninja/x/feedaka/graphql"
)

var (
	db *sql.DB
	//go:embed static/*
	staticFS embed.FS
)

func initDB(db *sql.DB) error {
	_, err := db.Exec(`
CREATE TABLE IF NOT EXISTS feeds (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	url        TEXT NOT NULL,
	title      TEXT NOT NULL,
	fetched_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
	id      INTEGER PRIMARY KEY AUTOINCREMENT,
	feed_id INTEGER NOT NULL,
	guid    TEXT NOT NULL,
	title   TEXT NOT NULL,
	url     TEXT NOT NULL,
	is_read INTEGER NOT NULL
);
`)
	return err
}

func fetchOneFeed(feedID int, url string, ctx context.Context) error {
	log.Printf("Fetching %s...\n", url)
	fp := gofeed.NewParser()
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()
	feed, err := fp.ParseURLWithContext(url, ctx)
	if err != nil {
		return fmt.Errorf("Failed to fetch %s: %v\n", url, err)
	}
	_, err = db.Exec(
		`UPDATE feeds SET title = ?, fetched_at = ? WHERE id = ?`,
		feed.Title,
		time.Now().UTC().Format(time.RFC3339),
		feedID,
	)
	if err != nil {
		return err
	}
	rows, err := db.Query(`SELECT guid FROM articles WHERE feed_id = ?`, feedID)
	if err != nil {
		return err
	}
	defer rows.Close()
	existingArticleGUIDs := make(map[string]bool)
	for rows.Next() {
		var guid string
		err := rows.Scan(&guid)
		if err != nil {
			return err
		}
		existingArticleGUIDs[guid] = true
	}
	for _, item := range feed.Items {
		if existingArticleGUIDs[item.GUID] {
			_, err := db.Exec(
				`UPDATE articles SET title = ?, url = ? WHERE feed_id = ? AND guid = ?`,
				item.Title,
				item.Link,
				feedID,
				item.GUID,
			)
			if err != nil {
				return err
			}
		} else {
			_, err := db.Exec(
				`INSERT INTO articles (feed_id, guid, title, url, is_read) VALUES (?, ?, ?, ?, ?)`,
				feedID,
				item.GUID,
				item.Title,
				item.Link,
				0,
			)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

func listFeedsToBeFetched() (map[int]string, error) {
	rows, err := db.Query(`SELECT id, url, fetched_at FROM feeds`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	feeds := make(map[int]string)
	for rows.Next() {
		var feedID int
		var url string
		var fetchedAt string
		err := rows.Scan(&feedID, &url, &fetchedAt)
		if err != nil {
			log.Fatal(err)
		}
		fetchedAtTime, err := time.Parse(time.RFC3339, fetchedAt)
		if err != nil {
			log.Fatal(err)
		}
		now := time.Now().UTC()
		if now.Sub(fetchedAtTime).Minutes() <= 10 {
			continue
		}
		feeds[feedID] = url
	}
	return feeds, nil
}

func fetchAllFeeds(ctx context.Context) error {
	feeds, err := listFeedsToBeFetched()
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
	port := os.Getenv("FEEDAKA_PORT")

	var err error
	db, err = sql.Open("sqlite3", "feedaka.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = initDB(db)
	if err != nil {
		log.Fatal(err)
	}

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/static/*", echo.WrapHandler(http.FileServer(http.FS(staticFS))))

	// Setup GraphQL server
	srv := handler.New(graphql.NewExecutableSchema(graphql.Config{Resolvers: &graphql.Resolver{DB: db}}))

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
