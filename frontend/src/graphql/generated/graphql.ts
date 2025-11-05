/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

/** Represents an individual article/post from a feed */
export type Article = {
  /** The feed this article belongs to */
  feed: Feed;
  /** ID of the feed this article belongs to */
  feedId: Scalars['ID']['output'];
  /** GUID from the RSS/Atom feed (unique identifier from feed) */
  guid: Scalars['String']['output'];
  /** Unique identifier for the article */
  id: Scalars['ID']['output'];
  /** Whether the article has been marked as read */
  isRead: Scalars['Boolean']['output'];
  /** Title of the article */
  title: Scalars['String']['output'];
  /** URL/link to the original article */
  url: Scalars['String']['output'];
};

/** Authentication payload returned from login mutation */
export type AuthPayload = {
  /** The authenticated user */
  user: User;
};

/** Represents a feed subscription in the system */
export type Feed = {
  /** Articles belonging to this feed */
  articles: Array<Article>;
  /** Timestamp when the feed was last fetched */
  fetchedAt: Scalars['DateTime']['output'];
  /** Unique identifier for the feed */
  id: Scalars['ID']['output'];
  /** Whether the user is currently subscribed to this feed */
  isSubscribed: Scalars['Boolean']['output'];
  /** Title of the feed (extracted from feed metadata) */
  title: Scalars['String']['output'];
  /** URL of the RSS/Atom feed */
  url: Scalars['String']['output'];
};

/** Root mutation type for modifying data */
export type Mutation = {
  /** Add a new feed subscription */
  addFeed: Feed;
  /** Login with username and password. Creates a session cookie. */
  login: AuthPayload;
  /** Logout the current user and destroy the session */
  logout: Scalars['Boolean']['output'];
  /** Mark an article as read */
  markArticleRead: Article;
  /** Mark an article as unread */
  markArticleUnread: Article;
  /** Mark all articles in a feed as read */
  markFeedRead: Feed;
  /** Mark all articles in a feed as unread */
  markFeedUnread: Feed;
  /** Unsubscribe from a feed (preserves feed and article data) */
  unsubscribeFeed: Scalars['Boolean']['output'];
};


/** Root mutation type for modifying data */
export type MutationAddFeedArgs = {
  url: Scalars['String']['input'];
};


/** Root mutation type for modifying data */
export type MutationLoginArgs = {
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};


/** Root mutation type for modifying data */
export type MutationMarkArticleReadArgs = {
  id: Scalars['ID']['input'];
};


/** Root mutation type for modifying data */
export type MutationMarkArticleUnreadArgs = {
  id: Scalars['ID']['input'];
};


/** Root mutation type for modifying data */
export type MutationMarkFeedReadArgs = {
  id: Scalars['ID']['input'];
};


/** Root mutation type for modifying data */
export type MutationMarkFeedUnreadArgs = {
  id: Scalars['ID']['input'];
};


/** Root mutation type for modifying data */
export type MutationUnsubscribeFeedArgs = {
  id: Scalars['ID']['input'];
};

/** Root query type for reading data */
export type Query = {
  /** Get a specific article by ID */
  article?: Maybe<Article>;
  /** Get the currently authenticated user */
  currentUser?: Maybe<User>;
  /** Get a specific feed by ID */
  feed?: Maybe<Feed>;
  /** Get all feeds with their metadata */
  feeds: Array<Feed>;
  /** Get all read articles across all feeds */
  readArticles: Array<Article>;
  /** Get all unread articles across all feeds */
  unreadArticles: Array<Article>;
};


/** Root query type for reading data */
export type QueryArticleArgs = {
  id: Scalars['ID']['input'];
};


/** Root query type for reading data */
export type QueryFeedArgs = {
  id: Scalars['ID']['input'];
};

/** Represents a user in the system */
export type User = {
  /** Unique identifier for the user */
  id: Scalars['ID']['output'];
  /** Username of the user */
  username: Scalars['String']['output'];
};

export type AddFeedMutationVariables = Exact<{
  url: Scalars['String']['input'];
}>;


export type AddFeedMutation = { addFeed: { id: string, url: string, title: string, fetchedAt: string } };

export type UnsubscribeFeedMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type UnsubscribeFeedMutation = { unsubscribeFeed: boolean };

export type MarkArticleReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkArticleReadMutation = { markArticleRead: { id: string, feedId: string, guid: string, title: string, url: string, isRead: boolean } };

export type MarkArticleUnreadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkArticleUnreadMutation = { markArticleUnread: { id: string, feedId: string, guid: string, title: string, url: string, isRead: boolean } };

export type MarkFeedReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkFeedReadMutation = { markFeedRead: { id: string, url: string, title: string, fetchedAt: string } };

export type MarkFeedUnreadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkFeedUnreadMutation = { markFeedUnread: { id: string, url: string, title: string, fetchedAt: string } };

export type LoginMutationVariables = Exact<{
  username: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { login: { user: { id: string, username: string } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: boolean };

export type GetFeedsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFeedsQuery = { feeds: Array<{ id: string, url: string, title: string, fetchedAt: string, isSubscribed: boolean, articles: Array<{ id: string, isRead: boolean }> }> };

export type GetUnreadArticlesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnreadArticlesQuery = { unreadArticles: Array<{ id: string, feedId: string, guid: string, title: string, url: string, isRead: boolean, feed: { id: string, title: string, isSubscribed: boolean } }> };

export type GetReadArticlesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetReadArticlesQuery = { readArticles: Array<{ id: string, feedId: string, guid: string, title: string, url: string, isRead: boolean, feed: { id: string, title: string, isSubscribed: boolean } }> };

export type GetFeedQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetFeedQuery = { feed?: { id: string, url: string, title: string, fetchedAt: string, isSubscribed: boolean, articles: Array<{ id: string, guid: string, title: string, url: string, isRead: boolean }> } | null };

export type GetArticleQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetArticleQuery = { article?: { id: string, feedId: string, guid: string, title: string, url: string, isRead: boolean, feed: { id: string, title: string, isSubscribed: boolean } } | null };

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCurrentUserQuery = { currentUser?: { id: string, username: string } | null };


export const AddFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"url"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addFeed"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"url"},"value":{"kind":"Variable","name":{"kind":"Name","value":"url"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fetchedAt"}}]}}]}}]} as unknown as DocumentNode<AddFeedMutation, AddFeedMutationVariables>;
export const UnsubscribeFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnsubscribeFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsubscribeFeed"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UnsubscribeFeedMutation, UnsubscribeFeedMutationVariables>;
export const MarkArticleReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkArticleRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markArticleRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedId"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<MarkArticleReadMutation, MarkArticleReadMutationVariables>;
export const MarkArticleUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkArticleUnread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markArticleUnread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedId"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<MarkArticleUnreadMutation, MarkArticleUnreadMutationVariables>;
export const MarkFeedReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkFeedRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markFeedRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fetchedAt"}}]}}]}}]} as unknown as DocumentNode<MarkFeedReadMutation, MarkFeedReadMutationVariables>;
export const MarkFeedUnreadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkFeedUnread"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markFeedUnread"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fetchedAt"}}]}}]}}]} as unknown as DocumentNode<MarkFeedUnreadMutation, MarkFeedUnreadMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"username"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"username"},"value":{"kind":"Variable","name":{"kind":"Name","value":"username"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const GetFeedsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeeds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feeds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fetchedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSubscribed"}},{"kind":"Field","name":{"kind":"Name","value":"articles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]}}]} as unknown as DocumentNode<GetFeedsQuery, GetFeedsQueryVariables>;
export const GetUnreadArticlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnreadArticles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadArticles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedId"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"feed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isSubscribed"}}]}}]}}]}}]} as unknown as DocumentNode<GetUnreadArticlesQuery, GetUnreadArticlesQueryVariables>;
export const GetReadArticlesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetReadArticles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readArticles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedId"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"feed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isSubscribed"}}]}}]}}]}}]} as unknown as DocumentNode<GetReadArticlesQuery, GetReadArticlesQueryVariables>;
export const GetFeedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetFeed"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"feed"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"fetchedAt"}},{"kind":"Field","name":{"kind":"Name","value":"isSubscribed"}},{"kind":"Field","name":{"kind":"Name","value":"articles"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]}}]} as unknown as DocumentNode<GetFeedQuery, GetFeedQueryVariables>;
export const GetArticleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetArticle"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"article"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"feedId"}},{"kind":"Field","name":{"kind":"Name","value":"guid"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"feed"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"isSubscribed"}}]}}]}}]}}]} as unknown as DocumentNode<GetArticleQuery, GetArticleQueryVariables>;
export const GetCurrentUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCurrentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentUser"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]} as unknown as DocumentNode<GetCurrentUserQuery, GetCurrentUserQueryVariables>;