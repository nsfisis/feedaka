import { useState } from "react";
import type { components } from "../api/generated";
import { ArticleItem } from "./ArticleItem";

type Article = components["schemas"]["Article"];

interface Props {
	articles: Article[];
	isReadView?: boolean;
	isSingleFeed?: boolean;
	hasNextPage?: boolean;
	loadingMore?: boolean;
	onLoadMore?: () => void;
}

export function ArticleList({
	articles,
	isReadView,
	isSingleFeed,
	hasNextPage,
	loadingMore,
	onLoadMore,
}: Props) {
	const [hiddenArticleIds, setHiddenArticleIds] = useState<Set<string>>(
		new Set(),
	);

	const handleArticleReadChange = (articleId: string, isRead: boolean) => {
		if (isReadView !== isRead) {
			setHiddenArticleIds((prev) => new Set(prev).add(articleId));
		}
	};

	const visibleArticles = articles.filter(
		(article) => !hiddenArticleIds.has(article.id),
	);

	if (visibleArticles.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">No articles found.</p>
			</div>
		);
	}

	if (isSingleFeed) {
		return (
			<div className="space-y-1">
				{visibleArticles.map((article) => (
					<ArticleItem
						key={article.id}
						article={article}
						onReadChange={handleArticleReadChange}
					/>
				))}
				<LoadMoreButton
					hasNextPage={hasNextPage}
					loadingMore={loadingMore}
					onLoadMore={onLoadMore}
				/>
			</div>
		);
	}

	// Group articles by feed
	const articlesByFeed = visibleArticles.reduce(
		(acc, article) => {
			const feedId = article.feed.id;
			if (!acc[feedId]) {
				acc[feedId] = {
					feed: article.feed,
					articles: [],
				};
			}
			acc[feedId].articles.push(article);
			return acc;
		},
		{} as Record<
			string,
			{ feed: { id: string; title: string }; articles: Article[] }
		>,
	);

	return (
		<div className="space-y-8">
			{Object.values(articlesByFeed).map(({ feed, articles: feedArticles }) => (
				<div key={feed.id} className="space-y-3">
					<h3 className="border-b border-stone-200 pb-2 text-sm font-semibold uppercase tracking-wide text-stone-900">
						{feed.title}
						<span className="ml-2 text-xs font-normal normal-case tracking-normal text-stone-400">
							{feedArticles.length} article
							{feedArticles.length !== 1 ? "s" : ""}
						</span>
					</h3>
					<div className="space-y-1">
						{feedArticles.map((article) => (
							<ArticleItem
								key={article.id}
								article={article}
								onReadChange={handleArticleReadChange}
							/>
						))}
					</div>
				</div>
			))}
			<LoadMoreButton
				hasNextPage={hasNextPage}
				loadingMore={loadingMore}
				onLoadMore={onLoadMore}
			/>
		</div>
	);
}

function LoadMoreButton({
	hasNextPage,
	loadingMore,
	onLoadMore,
}: {
	hasNextPage?: boolean;
	loadingMore?: boolean;
	onLoadMore?: () => void;
}) {
	if (!hasNextPage || !onLoadMore) return null;

	return (
		<div className="pt-4 text-center">
			<button
				type="button"
				onClick={onLoadMore}
				disabled={loadingMore}
				className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 disabled:opacity-50"
			>
				{loadingMore ? "Loading..." : "Load more"}
			</button>
		</div>
	);
}
