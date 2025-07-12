/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation AddFeed($url: String!) {\n  addFeed(url: $url) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation UnsubscribeFeed($id: ID!) {\n  unsubscribeFeed(id: $id)\n}\n\nmutation MarkArticleRead($id: ID!) {\n  markArticleRead(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkArticleUnread($id: ID!) {\n  markArticleUnread(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkFeedRead($id: ID!) {\n  markFeedRead(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation MarkFeedUnread($id: ID!) {\n  markFeedUnread(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}": typeof types.AddFeedDocument,
    "query GetFeeds {\n  feeds {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      isRead\n    }\n  }\n}\n\nquery GetUnreadArticles {\n  unreadArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetReadArticles {\n  readArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetFeed($id: ID!) {\n  feed(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      guid\n      title\n      url\n      isRead\n    }\n  }\n}\n\nquery GetArticle($id: ID!) {\n  article(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}": typeof types.GetFeedsDocument,
};
const documents: Documents = {
    "mutation AddFeed($url: String!) {\n  addFeed(url: $url) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation UnsubscribeFeed($id: ID!) {\n  unsubscribeFeed(id: $id)\n}\n\nmutation MarkArticleRead($id: ID!) {\n  markArticleRead(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkArticleUnread($id: ID!) {\n  markArticleUnread(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkFeedRead($id: ID!) {\n  markFeedRead(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation MarkFeedUnread($id: ID!) {\n  markFeedUnread(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}": types.AddFeedDocument,
    "query GetFeeds {\n  feeds {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      isRead\n    }\n  }\n}\n\nquery GetUnreadArticles {\n  unreadArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetReadArticles {\n  readArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetFeed($id: ID!) {\n  feed(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      guid\n      title\n      url\n      isRead\n    }\n  }\n}\n\nquery GetArticle($id: ID!) {\n  article(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}": types.GetFeedsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation AddFeed($url: String!) {\n  addFeed(url: $url) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation UnsubscribeFeed($id: ID!) {\n  unsubscribeFeed(id: $id)\n}\n\nmutation MarkArticleRead($id: ID!) {\n  markArticleRead(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkArticleUnread($id: ID!) {\n  markArticleUnread(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkFeedRead($id: ID!) {\n  markFeedRead(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation MarkFeedUnread($id: ID!) {\n  markFeedUnread(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}"): (typeof documents)["mutation AddFeed($url: String!) {\n  addFeed(url: $url) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation UnsubscribeFeed($id: ID!) {\n  unsubscribeFeed(id: $id)\n}\n\nmutation MarkArticleRead($id: ID!) {\n  markArticleRead(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkArticleUnread($id: ID!) {\n  markArticleUnread(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n  }\n}\n\nmutation MarkFeedRead($id: ID!) {\n  markFeedRead(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}\n\nmutation MarkFeedUnread($id: ID!) {\n  markFeedUnread(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query GetFeeds {\n  feeds {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      isRead\n    }\n  }\n}\n\nquery GetUnreadArticles {\n  unreadArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetReadArticles {\n  readArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetFeed($id: ID!) {\n  feed(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      guid\n      title\n      url\n      isRead\n    }\n  }\n}\n\nquery GetArticle($id: ID!) {\n  article(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}"): (typeof documents)["query GetFeeds {\n  feeds {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      isRead\n    }\n  }\n}\n\nquery GetUnreadArticles {\n  unreadArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetReadArticles {\n  readArticles {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}\n\nquery GetFeed($id: ID!) {\n  feed(id: $id) {\n    id\n    url\n    title\n    fetchedAt\n    isSubscribed\n    articles {\n      id\n      guid\n      title\n      url\n      isRead\n    }\n  }\n}\n\nquery GetArticle($id: ID!) {\n  article(id: $id) {\n    id\n    feedId\n    guid\n    title\n    url\n    isRead\n    feed {\n      id\n      title\n      isSubscribed\n    }\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;