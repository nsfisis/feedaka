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
	showReadStatus?: boolean;
}

export function ArticleList({ articles, showReadStatus = true }: Props) {
	if (articles.length === 0) {
		return (
			<div className="p-4 text-center text-gray-500">No articles found.</div>
		);
	}

	// Group articles by feed
	const articlesByFeed = articles.reduce(
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
		<div className="space-y-6 p-4">
			{Object.values(articlesByFeed).map(({ feed, articles: feedArticles }) => (
				<div key={feed.id} className="space-y-2">
					<h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
						{feed.title}
						<span className="ml-2 text-sm font-normal text-gray-500">
							({feedArticles.length} article
							{feedArticles.length !== 1 ? "s" : ""})
						</span>
					</h3>
					<div className="space-y-1">
						{feedArticles.map((article) => (
							<ArticleItem
								key={article.id}
								article={article}
								showReadStatus={showReadStatus}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
