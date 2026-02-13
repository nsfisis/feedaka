import { useSearch } from "wouter";
import { ArticleList, FeedSidebar } from "../components";
import { usePaginatedArticles } from "../hooks/usePaginatedArticles";

export function UnreadArticles() {
	const search = useSearch();
	const params = new URLSearchParams(search);
	const feedId = params.get("feed");

	const { articles, hasNextPage, loading, loadingMore, loadMore, error } =
		usePaginatedArticles({ isReadView: false, feedId });

	return (
		<div className="flex gap-8">
			<FeedSidebar basePath="/unread" />
			<div className="min-w-0 flex-1">
				<div className="mb-6">
					<h1 className="text-xl font-semibold text-stone-900">Unread</h1>
					{!loading && articles.length > 0 && (
						<p className="mt-1 text-sm text-stone-400">
							{articles.length}
							{hasNextPage ? "+" : ""} article
							{articles.length !== 1 ? "s" : ""} to read
						</p>
					)}
				</div>
				{loading ? (
					<div className="py-8 text-center">
						<p className="text-sm text-stone-400">Loading unread articles...</p>
					</div>
				) : error ? (
					<div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
						Error: {error.message}
					</div>
				) : (
					<ArticleList
						articles={articles}
						isReadView={false}
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
