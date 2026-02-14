import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "Feedaka API" })
@server("http://localhost:8080", "Development server")
namespace Feedaka;

// ── Models ──────────────────────────────────────────────────────────

model Feed {
  id: string;
  url: string;
  title: string;
  fetchedAt: string;
  isSubscribed: boolean;
  unreadCount: int32;
}

model Article {
  id: string;
  feedId: string;
  guid: string;
  title: string;
  url: string;
  isRead: boolean;
  feed: ArticleFeed;
}

model ArticleFeed {
  id: string;
  url: string;
  title: string;
  isSubscribed: boolean;
}

model PageInfo {
  hasNextPage: boolean;
  endCursor?: string;
}

model ArticleConnection {
  articles: Article[];
  pageInfo: PageInfo;
}

model User {
  id: string;
  username: string;
}

model ErrorResponse {
  message: string;
}

// ── Auth ────────────────────────────────────────────────────────────

model LoginRequest {
  username: string;
  password: string;
}

model LoginResponse {
  user: User;
}

@route("/api/auth")
namespace Auth {
  @post
  @route("/login")
  op login(@body body: LoginRequest): LoginResponse | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  };

  @post
  @route("/logout")
  op logout(): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  };

  @get
  @route("/me")
  op getCurrentUser(): User | {
    @statusCode statusCode: 401;
    @body body: ErrorResponse;
  };
}

// ── Feeds ───────────────────────────────────────────────────────────

model AddFeedRequest {
  url: string;
}

@route("/api/feeds")
namespace Feeds {
  @get
  op listFeeds(): Feed[];

  @post
  op addFeed(@body body: AddFeedRequest): {
    @statusCode statusCode: 201;
    @body body: Feed;
  } | {
    @statusCode statusCode: 400;
    @body body: ErrorResponse;
  };

  @get
  @route("/{feedId}")
  op getFeed(@path feedId: string): Feed | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };

  @delete
  @route("/{feedId}")
  op unsubscribeFeed(@path feedId: string): {
    @statusCode statusCode: 204;
  } | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };

  @post
  @route("/{feedId}/read")
  op markFeedRead(@path feedId: string): Feed | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };

  @post
  @route("/{feedId}/unread")
  op markFeedUnread(@path feedId: string): Feed | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };
}

// ── Articles ────────────────────────────────────────────────────────

@route("/api/articles")
namespace Articles {
  @get
  @route("/unread")
  op listUnreadArticles(
    @query feedId?: string,
    @query after?: string,
    @query first?: int32,
  ): ArticleConnection;

  @get
  @route("/read")
  op listReadArticles(
    @query feedId?: string,
    @query after?: string,
    @query first?: int32,
  ): ArticleConnection;

  @get
  @route("/{articleId}")
  op getArticle(@path articleId: string): Article | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };

  @post
  @route("/{articleId}/read")
  op markArticleRead(@path articleId: string): Article | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };

  @post
  @route("/{articleId}/unread")
  op markArticleUnread(@path articleId: string): Article | {
    @statusCode statusCode: 404;
    @body body: ErrorResponse;
  };
}
