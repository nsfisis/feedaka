package feed

import (
	"io"
	"net/url"
	"strings"

	"golang.org/x/net/html"
)

type feedLink struct {
	URL  string
	Type string // "atom" or "rss"
}

// discoverFeeds parses an HTML document and extracts feed URLs from
// <link rel="alternate"> tags. It resolves relative URLs against baseURL.
func discoverFeeds(body io.Reader, baseURL *url.URL) []feedLink {
	var links []feedLink
	z := html.NewTokenizer(body)
	for {
		tt := z.Next()
		switch tt {
		case html.ErrorToken:
			return links
		case html.StartTagToken, html.SelfClosingTagToken:
			tn, _ := z.TagName()
			tagName := string(tn)

			if tagName == "body" {
				return links
			}
			if tagName != "link" {
				continue
			}

			attrs := tokenAttrs(z)
			rel := strings.ToLower(attrs["rel"])
			typ := strings.ToLower(attrs["type"])
			href := attrs["href"]

			if rel != "alternate" || href == "" {
				continue
			}

			var feedType string
			switch typ {
			case "application/atom+xml":
				feedType = "atom"
			case "application/rss+xml":
				feedType = "rss"
			default:
				continue
			}

			ref, err := url.Parse(href)
			if err != nil {
				continue
			}
			resolved := baseURL.ResolveReference(ref).String()
			links = append(links, feedLink{URL: resolved, Type: feedType})
		}
	}
}

// selectFeed picks the best feed URL from discovered links.
// Prefers Atom over RSS.
func selectFeed(links []feedLink) string {
	for _, l := range links {
		if l.Type == "atom" {
			return l.URL
		}
	}
	for _, l := range links {
		if l.Type == "rss" {
			return l.URL
		}
	}
	return ""
}

func tokenAttrs(z *html.Tokenizer) map[string]string {
	attrs := make(map[string]string)
	for {
		key, val, more := z.TagAttr()
		if len(key) > 0 {
			attrs[string(key)] = string(val)
		}
		if !more {
			break
		}
	}
	return attrs
}
