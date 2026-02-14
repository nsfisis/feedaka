package feed

import (
	"net/url"
	"strings"
	"testing"
)

func mustParseURL(s string) *url.URL {
	u, err := url.Parse(s)
	if err != nil {
		panic(err)
	}
	return u
}

func TestDiscoverFeeds_AtomAndRSS(t *testing.T) {
	html := `<!DOCTYPE html>
<html>
<head>
    <link rel="alternate" type="application/atom+xml" href="/feed.atom" title="Atom Feed">
    <link rel="alternate" type="application/rss+xml" href="/feed.rss" title="RSS Feed">
</head>
<body></body>
</html>`

	base := mustParseURL("https://example.com/blog")
	links := discoverFeeds(strings.NewReader(html), base)

	if len(links) != 2 {
		t.Fatalf("expected 2 links, got %d", len(links))
	}
	if links[0].URL != "https://example.com/feed.atom" || links[0].Type != "atom" {
		t.Errorf("unexpected first link: %+v", links[0])
	}
	if links[1].URL != "https://example.com/feed.rss" || links[1].Type != "rss" {
		t.Errorf("unexpected second link: %+v", links[1])
	}
}

func TestDiscoverFeeds_AbsoluteURL(t *testing.T) {
	html := `<html><head>
    <link rel="alternate" type="application/atom+xml" href="https://other.com/feed.xml">
</head><body></body></html>`

	base := mustParseURL("https://example.com")
	links := discoverFeeds(strings.NewReader(html), base)

	if len(links) != 1 {
		t.Fatalf("expected 1 link, got %d", len(links))
	}
	if links[0].URL != "https://other.com/feed.xml" {
		t.Errorf("expected absolute URL preserved, got %s", links[0].URL)
	}
}

func TestDiscoverFeeds_NoFeeds(t *testing.T) {
	html := `<html><head><title>No feeds</title></head><body></body></html>`
	links := discoverFeeds(strings.NewReader(html), mustParseURL("https://example.com"))
	if len(links) != 0 {
		t.Fatalf("expected 0 links, got %d", len(links))
	}
}

func TestDiscoverFeeds_IgnoresNonAlternate(t *testing.T) {
	html := `<html><head>
    <link rel="stylesheet" type="text/css" href="/style.css">
    <link rel="alternate" type="application/atom+xml" href="/feed.atom">
</head><body></body></html>`

	links := discoverFeeds(strings.NewReader(html), mustParseURL("https://example.com"))
	if len(links) != 1 {
		t.Fatalf("expected 1 link, got %d", len(links))
	}
}

func TestDiscoverFeeds_IgnoresUnknownTypes(t *testing.T) {
	html := `<html><head>
    <link rel="alternate" type="application/json" href="/feed.json">
    <link rel="alternate" type="application/rss+xml" href="/feed.rss">
</head><body></body></html>`

	links := discoverFeeds(strings.NewReader(html), mustParseURL("https://example.com"))
	if len(links) != 1 {
		t.Fatalf("expected 1 link, got %d", len(links))
	}
	if links[0].Type != "rss" {
		t.Errorf("expected rss, got %s", links[0].Type)
	}
}

func TestDiscoverFeeds_StopsAtBody(t *testing.T) {
	html := `<html><head></head><body>
    <link rel="alternate" type="application/atom+xml" href="/feed.atom">
</body></html>`

	links := discoverFeeds(strings.NewReader(html), mustParseURL("https://example.com"))
	if len(links) != 0 {
		t.Fatalf("expected 0 links (should stop at body), got %d", len(links))
	}
}

func TestSelectFeed_PrefersAtom(t *testing.T) {
	links := []feedLink{
		{URL: "https://example.com/rss", Type: "rss"},
		{URL: "https://example.com/atom", Type: "atom"},
	}
	got := selectFeed(links)
	if got != "https://example.com/atom" {
		t.Errorf("expected Atom URL, got %s", got)
	}
}

func TestSelectFeed_FallsBackToRSS(t *testing.T) {
	links := []feedLink{
		{URL: "https://example.com/rss", Type: "rss"},
	}
	got := selectFeed(links)
	if got != "https://example.com/rss" {
		t.Errorf("expected RSS URL, got %s", got)
	}
}

func TestSelectFeed_EmptyList(t *testing.T) {
	got := selectFeed(nil)
	if got != "" {
		t.Errorf("expected empty string, got %s", got)
	}
}
