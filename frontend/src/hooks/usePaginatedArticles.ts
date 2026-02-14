import { useCallback, useEffect, useState } from "react";
import type { components } from "../api/generated";
import { api } from "../services/api-client";

export type ArticleType = components["schemas"]["Article"];

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
	const [articles, setArticles] = useState<ArticleType[]>([]);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [endCursor, setEndCursor] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const fetchArticles = useCallback(
		async (after: string | null, append: boolean) => {
			const query: { feedId?: string; after?: string } = {};
			if (feedId) query.feedId = feedId;
			if (after) query.after = after;

			const endpoint = isReadView
				? "/api/articles/read"
				: "/api/articles/unread";

			const { data } = await api.GET(endpoint, {
				params: { query },
			});

			if (!data) {
				setError(new Error("Failed to fetch articles"));
				return;
			}

			if (data) {
				setArticles((prev) =>
					append ? [...prev, ...data.articles] : data.articles,
				);
				setHasNextPage(data.pageInfo.hasNextPage);
				setEndCursor(data.pageInfo.endCursor ?? null);
				setError(null);
			}
		},
		[isReadView, feedId],
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
