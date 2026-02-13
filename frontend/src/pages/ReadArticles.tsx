import { useSearch } from "wouter";
import { ArticleList, FeedSidebar } from "../components";
import { usePaginatedArticles } from "../hooks/usePaginatedArticles";

export function ReadArticles() {
	const search = useSearch();
	const params = new URLSearchParams(search);
	const feedId = params.get("feed");

	const { articles, hasNextPage, loading, loadingMore, loadMore, error } =
		usePaginatedArticles({ isReadView: true, feedId });

	return (
		<div className="flex gap-8">
			<FeedSidebar basePath="/read" />
			<div className="min-w-0 flex-1">
				<div className="mb-6">
					<h1 className="text-xl font-semibold text-stone-900">Read</h1>
					{!loading && articles.length > 0 && (
						<p className="mt-1 text-sm text-stone-400">
							{articles.length}
							{hasNextPage ? "+" : ""} article
							{articles.length !== 1 ? "s" : ""}
						</p>
					)}
				</div>
				{loading ? (
					<div className="py-8 text-center">
						<p className="text-sm text-stone-400">Loading read articles...</p>
					</div>
				) : error ? (
					<div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
						Error: {error.message}
					</div>
				) : (
					<ArticleList
						articles={articles}
						isReadView={true}
						isSingleFeed={!!feedId}
						hasNextPage={hasNextPage}
						loadingMore={loadingMore}
						onLoadMore={loadMore}
					/>
				)}
			</div>
		</div>
	);
}
