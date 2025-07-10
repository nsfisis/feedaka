package main

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
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
	"golang.org/x/exp/slices"

	"undef.ninja/x/feedaka/graphql"
)

var (
	basePath string
	db       *sql.DB
	//go:embed templates/*
	tmplFS embed.FS
	//go:embed static/*
	staticFS embed.FS
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

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

func getIndex(c echo.Context) error {
	// Redirect to /feeds/unread
	return c.Redirect(http.StatusFound, basePath+"/feeds/unread")
}

func getSettings(c echo.Context) error {
	feedURLs := []string{}
	rows, err := db.Query(`SELECT url FROM feeds`)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var url string
		err := rows.Scan(&url)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		feedURLs = append(feedURLs, url)
	}
	// Sort feedURLs in ascending order.
	slices.Sort(feedURLs)

	return c.Render(http.StatusOK, "settings.html", struct {
		BasePath string
		URLs     string
	}{
		BasePath: basePath,
		URLs:     strings.Join(feedURLs, "\r\n"),
	})
}

func postSettings(c echo.Context) error {
	// Get "urls" from form parameters.
	rawUrls := strings.Split(c.FormValue("urls"), "\r\n")
	urls := make([]string, 0, len(rawUrls))
	for _, rawUrl := range rawUrls {
		url := strings.TrimSpace(rawUrl)
		if url != "" {
			urls = append(urls, url)
		}
	}
	existingURLs := make(map[string]bool)
	rows, err := db.Query(`SELECT url FROM feeds`)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var url string
		err := rows.Scan(&url)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		existingURLs[url] = true
	}
	for _, url := range urls {
		if existingURLs[url] {
			continue
		}
		_, err := db.Exec(
			`INSERT INTO feeds (url, title, fetched_at) VALUES (?, ?, ?)`,
			url,
			"",
			time.Now().AddDate(0, 0, -1).UTC().Format(time.RFC3339),
		)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
	}
	// Remove:
	for existingURL := range existingURLs {
		// If existingURL is not in urls, it will be removed.
		found := false
		for _, url := range urls {
			if existingURL == url {
				found = true
				break
			}
		}
		if found {
			continue
		}
		// Remove feed and articles.
		_, err = db.Exec(`DELETE FROM articles WHERE feed_id = (SELECT id FROM feeds WHERE url = ?)`, existingURL)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		_, err := db.Exec(`DELETE FROM feeds WHERE url = ?`, existingURL)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
	}
	return c.Redirect(http.StatusSeeOther, basePath+"/settings")
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

func getUnreadFeeds(c echo.Context) error {
	rows, err := db.Query(`
SELECT a.id, a.title, f.url, f.title, f.id
FROM articles AS a
INNER JOIN feeds AS f ON a.feed_id = f.id
WHERE is_read = 0
ORDER BY a.id DESC
LIMIT 100
`)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	return renderFeeds(c, "Unread feeds", "unread-feeds.html", rows)
}

func getReadFeeds(c echo.Context) error {
	rows, err := db.Query(`
SELECT a.id, a.title, f.url, f.title, f.id
FROM articles AS a
INNER JOIN feeds AS f ON a.feed_id = f.id
WHERE is_read = 1
ORDER BY a.id DESC
LIMIT 100
`)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	defer rows.Close()

	return renderFeeds(c, "Read feeds", "read-feeds.html", rows)
}

func renderFeeds(c echo.Context, title string, templateName string, rows *sql.Rows) error {
	type Article struct {
		ID    int
		Title string
		URL   string
	}
	type Feed struct {
		ID       int
		URL      string
		Title    string
		Articles []Article
	}
	feeds := make(map[int]*Feed)
	for rows.Next() {
		var articleID int
		var articleTitle string
		var feedURL string
		var feedTitle string
		var feedID int
		err := rows.Scan(&articleID, &articleTitle, &feedURL, &feedTitle, &feedID)
		if err != nil {
			return c.String(http.StatusInternalServerError, err.Error())
		}
		if _, ok := feeds[feedID]; !ok {
			feeds[feedID] = &Feed{
				ID:    feedID,
				URL:   feedURL,
				Title: feedTitle,
			}
		}
		feed := feeds[feedID]
		feed.Articles = append(feed.Articles, Article{
			ID:    articleID,
			Title: articleTitle,
			URL:   fmt.Sprintf("%s/articles/%d", basePath, articleID),
		})
	}

	sortedFeeds := make([]*Feed, 0, len(feeds))
	for _, feed := range feeds {
		sortedFeeds = append(sortedFeeds, feed)
	}
	slices.SortFunc(sortedFeeds, func(a, b *Feed) int {
		// Ascending order by URL.
		if a.URL < b.URL {
			return -1
		} else if a.URL > b.URL {
			return 1
		} else {
			return 0
		}
	})

	return c.Render(http.StatusOK, templateName, struct {
		BasePath string
		Title    string
		Feeds    []*Feed
	}{
		BasePath: basePath,
		Title:    title,
		Feeds:    sortedFeeds,
	})
}

func getArticle(c echo.Context) error {
	rawArticleID := c.Param("articleID")
	articleID, err := strconv.Atoi(rawArticleID)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}
	row := db.QueryRow(`SELECT url FROM articles WHERE id = ?`, articleID)
	if row == nil {
		return c.String(http.StatusNotFound, "Not found")
	}
	var url string
	err = row.Scan(&url)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	// Turn is_read on.
	_, err = db.Exec(`UPDATE articles SET is_read = 1 WHERE id = ?`, articleID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	// Redirect to the article URL.
	return c.Redirect(http.StatusFound, url)
}

func apiPutFeedRead(c echo.Context) error {
	return apiPutFeed(c, "read")
}

func apiPutFeedUnread(c echo.Context) error {
	return apiPutFeed(c, "unread")
}

func apiPutFeed(c echo.Context, op string) error {
	rawFeedID := c.Param("feedID")
	feedID, err := strconv.Atoi(rawFeedID)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}
	// Turn is_read on or off.
	var isReadValue int
	if op == "read" {
		isReadValue = 1
	} else if op == "unread" {
		isReadValue = 0
	}
	_, err = db.Exec(`UPDATE articles SET is_read = ? WHERE feed_id = ?`, isReadValue, feedID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
}

func apiPutArticleRead(c echo.Context) error {
	return apiPutArticle(c, "read")
}

func apiPutArticleUnread(c echo.Context) error {
	return apiPutArticle(c, "unread")
}

func apiPutArticle(c echo.Context, op string) error {
	rawArticleID := c.Param("articleID")
	articleID, err := strconv.Atoi(rawArticleID)
	if err != nil {
		return c.String(http.StatusNotFound, err.Error())
	}
	// Turn is_read on or off.
	var isReadValue int
	if op == "read" {
		isReadValue = 1
	} else if op == "unread" {
		isReadValue = 0
	}
	_, err = db.Exec(`UPDATE articles SET is_read = ? WHERE id = ?`, isReadValue, articleID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	return c.NoContent(http.StatusOK)
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
	basePath = os.Getenv("FEEDAKA_BASE_PATH")
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

	t := &Template{
		templates: template.Must(template.ParseFS(tmplFS, "templates/*.html")),
	}

	e := echo.New()

	e.Renderer = t
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.GET("/", getIndex)
	e.GET("/settings", getSettings)
	e.POST("/settings", postSettings)
	e.GET("/feeds/unread", getUnreadFeeds)
	e.GET("/feeds/read", getReadFeeds)
	e.GET("/articles/:articleID", getArticle)

	e.PUT("/api/feeds/:feedID/read", apiPutFeedRead)
	e.PUT("/api/feeds/:feedID/unread", apiPutFeedUnread)
	e.PUT("/api/articles/:articleID/read", apiPutArticleRead)
	e.PUT("/api/articles/:articleID/unread", apiPutArticleUnread)

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
