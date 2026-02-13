import { useCallback, useEffect, useState } from "react";
import { useClient } from "urql";
import type {
	GetReadArticlesQuery,
	GetUnreadArticlesQuery,
} from "../graphql/generated/graphql";
import {
	GetReadArticlesDocument,
	GetUnreadArticlesDocument,
} from "../graphql/generated/graphql";

type ArticleType =
	| GetUnreadArticlesQuery["unreadArticles"]["articles"][number]
	| GetReadArticlesQuery["readArticles"]["articles"][number];

interface UsePaginatedArticlesOptions {
	isReadView: boolean;
	feedId: string | null;
}

interface UsePaginatedArticlesResult {
	articles: ArticleType[];
	hasNextPage: boolean;
	loading: boolean;
	loadingMore: boolean;
	loadMore: () => void;
	error: Error | null;
}

export function usePaginatedArticles({
	isReadView,
	feedId,
}: UsePaginatedArticlesOptions): UsePaginatedArticlesResult {
	const client = useClient();
	const [articles, setArticles] = useState<ArticleType[]>([]);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [endCursor, setEndCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchArticles = useCallback(
		async (after: string | null, append: boolean) => {
			const variables: Record<string, unknown> = {};
			if (feedId) variables.feedId = feedId;
			if (after) variables.after = after;

			let connection: {
				articles: ArticleType[];
				pageInfo: { hasNextPage: boolean; endCursor?: string | null };
			} | null = null;

			if (isReadView) {
				const result = await client
					.query(GetReadArticlesDocument, variables, {
						additionalTypenames: ["Article"],
					})
					.toPromise();
				if (result.error) {
					setError(new Error(result.error.message));
					return;
				}
				connection = result.data?.readArticles ?? null;
			} else {
				const result = await client
					.query(GetUnreadArticlesDocument, variables, {
						additionalTypenames: ["Article"],
					})
					.toPromise();
				if (result.error) {
					setError(new Error(result.error.message));
					return;
				}
				connection = result.data?.unreadArticles ?? null;
			}

			if (connection) {
				setArticles((prev) =>
					append ? [...prev, ...connection.articles] : connection.articles,
				);
				setHasNextPage(connection.pageInfo.hasNextPage);
				setEndCursor(connection.pageInfo.endCursor ?? null);
				setError(null);
			}
		},
		[client, isReadView, feedId],
	);

	// Reset and fetch on feedId or view change
	useEffect(() => {
		setArticles([]);
		setEndCursor(null);
		setHasNextPage(false);
		setLoading(true);
		setError(null);
		fetchArticles(null, false).finally(() => setLoading(false));
	}, [fetchArticles]);

	const loadMore = useCallback(() => {
		if (!hasNextPage || loadingMore) return;
		setLoadingMore(true);
		fetchArticles(endCursor, true).finally(() => setLoadingMore(false));
	}, [fetchArticles, endCursor, hasNextPage, loadingMore]);

	return { articles, hasNextPage, loading, loadingMore, loadMore, error };
}
