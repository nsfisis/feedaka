import { useState } from "react";
import type {
	GetReadArticlesQuery,
	GetUnreadArticlesQuery,
} from "../graphql/generated/graphql";
import { ArticleItem } from "./ArticleItem";

interface Props {
	articles: NonNullable<
		| GetUnreadArticlesQuery["unreadArticles"]
		| GetReadArticlesQuery["readArticles"]
	>;
	isReadView?: boolean;
}

export function ArticleList({ articles, isReadView }: Props) {
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
			{ feed: { id: string; title: string }; articles: typeof articles }
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
		</div>
	);
}
