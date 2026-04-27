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

	"github.com/hashicorp/go-multierror"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"undef.ninja/x/feedaka/api"
	"undef.ninja/x/feedaka/auth"
	"undef.ninja/x/feedaka/config"
	"undef.ninja/x/feedaka/db"
	"undef.ninja/x/feedaka/feed"
)

const (
	minFetchIntervalSeconds = 60 * 60      // 1 hour
	maxFetchIntervalSeconds = 24 * 60 * 60 // 1 day
)

// nextFetchInterval adapts the per-feed poll interval based on whether the
// last fetch yielded new articles. Active feeds converge toward the floor
// quickly (halving) while quiet feeds back off gently (1.5x) so a brief lull
// doesn't push the interval to the ceiling.
func nextFetchInterval(current int64, hadNewArticles bool) int64 {
	var next int64
	if hadNewArticles {
		next = current / 2
	} else {
		next = current * 3 / 2
	}
	if next < minFetchIntervalSeconds {
		next = minFetchIntervalSeconds
	}
	if next > maxFetchIntervalSeconds {
		next = maxFetchIntervalSeconds
	}
	return next
}

func fetchOneFeed(ctx context.Context, queries *db.Queries, f db.GetFeedsToFetchRow) error {
	log.Printf("Fetching %s...\n", f.Url)
	result, err := feed.Fetch(ctx, f.Url)
	if err != nil {
		return err
	}
	newCount, err := feed.Sync(ctx, queries, f.ID, result.Feed)
	if err != nil {
		return err
	}
	next := nextFetchInterval(f.FetchIntervalSeconds, newCount > 0)
	if next != f.FetchIntervalSeconds {
		if err := queries.UpdateFeedFetchInterval(ctx, db.UpdateFeedFetchIntervalParams{
			FetchIntervalSeconds: next,
			ID:                   f.ID,
		}); err != nil {
			return err
		}
	}
	return nil
}

func fetchAllFeeds(ctx context.Context, queries *db.Queries) error {
	feeds, err := queries.GetFeedsToFetch(ctx)
	if err != nil {
		return err
	}

	var result *multierror.Error
	for _, f := range feeds {
		if err := fetchOneFeed(ctx, queries, f); err != nil {
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

	handler := &api.Handler{
		DB:            database,
		Queries:       queries,
		SessionConfig: sessionConfig,
	}

	strictHandler := api.NewStrictHandler(handler, nil)

	// Register REST API routes with auth middleware
	apiGroup := e.Group("", auth.SessionAuthMiddleware(sessionConfig), echoContextMiddleware())
	api.RegisterHandlers(apiGroup, strictHandler)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	scheduled(ctx, 30*time.Minute, func() {
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

// echoContextMiddleware injects echo.Context into request context
// so strict server handlers can access it (needed for session operations)
func echoContextMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := api.WithEchoContext(c.Request().Context(), c)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}
