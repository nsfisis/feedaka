package cmd

import (
	"context"
	"database/sql"
	"embed"
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
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/vektah/gqlparser/v2/ast"

	"undef.ninja/x/feedaka/auth"
	"undef.ninja/x/feedaka/config"
	"undef.ninja/x/feedaka/db"
	"undef.ninja/x/feedaka/feed"
	"undef.ninja/x/feedaka/graphql"
	"undef.ninja/x/feedaka/graphql/resolver"
)

func fetchOneFeed(feedID int64, url string, ctx context.Context, queries *db.Queries) error {
	log.Printf("Fetching %s...\n", url)
	f, err := feed.Fetch(ctx, url)
	if err != nil {
		return err
	}
	return feed.Sync(ctx, queries, feedID, f)
}

func listFeedsToBeFetched(ctx context.Context, queries *db.Queries) (map[int64]string, error) {
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

func fetchAllFeeds(ctx context.Context, queries *db.Queries) error {
	feeds, err := listFeedsToBeFetched(ctx, queries)
	if err != nil {
		return err
	}

	var result *multierror.Error
	for feedID, url := range feeds {
		err := fetchOneFeed(feedID, url, ctx, queries)
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

func RunServe(database *sql.DB, cfg *config.Config, publicFS embed.FS) {
	err := db.ValidateSchemaVersion(database)
	if err != nil {
		log.Fatal(err)
	}

	queries := db.New(database)

	sessionConfig := auth.NewSessionConfig(cfg.SessionSecret, cfg.DevNonSecureCookie)

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())
	e.Use(session.Middleware(sessionConfig.GetStore()))

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		HTML5:      true,
		Root:       "public",
		Filesystem: http.FS(publicFS),
	}))

	// Setup GraphQL server
	srv := handler.New(graphql.NewExecutableSchema(graphql.Config{Resolvers: &resolver.Resolver{
		DB:            database,
		Queries:       queries,
		SessionConfig: sessionConfig,
	}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})

	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// GraphQL endpoints with authentication middleware
	graphqlGroup := e.Group("/graphql")
	graphqlGroup.Use(auth.SessionAuthMiddleware(sessionConfig))
	graphqlGroup.POST("", func(c echo.Context) error {
		// Add Echo context to GraphQL context
		ctx := context.WithValue(c.Request().Context(), "echo", c)
		req := c.Request().WithContext(ctx)
		srv.ServeHTTP(c.Response(), req)
		return nil
	})
	graphqlGroup.GET("", func(c echo.Context) error {
		// Add Echo context to GraphQL context
		ctx := context.WithValue(c.Request().Context(), "echo", c)
		req := c.Request().WithContext(ctx)
		srv.ServeHTTP(c.Response(), req)
		return nil
	})

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	scheduled(ctx, 1*time.Hour, func() {
		err := fetchAllFeeds(ctx, queries)
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

	log.Printf("Server starting on port %s...\n", cfg.Port)
	err = e.Start(":" + cfg.Port)
	if err != nil && err != http.ErrServerClosed {
		log.Printf("Server error: %v\n", err)
	}
	log.Println("Server stopped")
}
