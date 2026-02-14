import type { InfiniteData } from "@tanstack/query-core";
import { atom } from "jotai";
import { atomWithInfiniteQuery } from "jotai-tanstack-query";
import type { components } from "../api/generated";
import { api } from "../services/api-client";

type ArticleConnection = components["schemas"]["ArticleConnection"];

export const articleViewAtom = atom<"read" | "unread">("unread");
export const articleFeedFilterAtom = atom<string | null>(null);

export const articlesInfiniteAtom = atomWithInfiniteQuery<
	ArticleConnection,
	Error,
	InfiniteData<ArticleConnection, string | null>,
	string[],
	string | null
>((get) => {
	const view = get(articleViewAtom);
	const feedId = get(articleFeedFilterAtom);

	return {
		queryKey: ["articles", view, feedId ?? "all"],
		queryFn: async ({ pageParam }) => {
			const query: { feedId?: string; after?: string } = {};
			if (feedId) query.feedId = feedId;
			if (pageParam) query.after = pageParam;

			if (view === "read") {
				const { data } = await api.GET("/api/articles/read", {
					params: { query },
				});
				return data ?? { articles: [], pageInfo: { hasNextPage: false } };
			}
			const { data } = await api.GET("/api/articles/unread", {
				params: { query },
			});
			return data ?? { articles: [], pageInfo: { hasNextPage: false } };
		},
		initialPageParam: null as string | null,
		getNextPageParam: (lastPage: ArticleConnection) =>
			lastPage.pageInfo.hasNextPage
				? (lastPage.pageInfo.endCursor ?? null)
				: null,
	};
});
