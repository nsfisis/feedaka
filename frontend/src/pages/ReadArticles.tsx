import { useAtomValue, useSetAtom } from "jotai";
import { Suspense, useEffect } from "react";
import { useSearch } from "wouter";
import {
	articleFeedFilterAtom,
	articlesInfiniteAtom,
	articleViewAtom,
} from "../atoms";
import { ArticleList } from "../components/ArticleList";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FeedSidebar } from "../components/FeedSidebar";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function ReadArticles() {
	const search = useSearch();
	const params = new URLSearchParams(search);
	const feedId = params.get("feed");

	const setView = useSetAtom(articleViewAtom);
	const setFeedFilter = useSetAtom(articleFeedFilterAtom);

	useEffect(() => {
		setView("read");
		setFeedFilter(feedId);
	}, [feedId, setView, setFeedFilter]);

	return (
		<div className="flex gap-8">
			<div className="hidden w-56 shrink-0 md:block">
				<ErrorBoundary>
					<Suspense fallback={<LoadingSpinner />}>
						<FeedSidebar basePath="/read" isReadView />
					</Suspense>
				</ErrorBoundary>
			</div>
			<div className="min-w-0 flex-1">
				<ReadArticleList feedId={feedId} />
			</div>
		</div>
	);
}

function ReadArticleList({ feedId }: { feedId: string | null }) {
	const {
		data,
		isLoading,
		isFetchingNextPage,
		hasNextPage,
		fetchNextPage,
		error,
	} = useAtomValue(articlesInfiniteAtom);

	const articles = data?.pages.flatMap((page) => page.articles) ?? [];

	if (isLoading) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">Loading read articles...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
				Error: {error.message}
			</div>
		);
	}

	return (
		<>
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-stone-900">Read</h1>
				{articles.length > 0 && (
					<p className="mt-1 text-sm text-stone-400">
						{articles.length}
						{hasNextPage ? "+" : ""} article
						{articles.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
			<ArticleList
				articles={articles}
				isReadView={true}
				isSingleFeed={!!feedId}
				hasNextPage={hasNextPage}
				loadingMore={isFetchingNextPage}
				onLoadMore={() => fetchNextPage()}
			/>
		</>
	);
}
