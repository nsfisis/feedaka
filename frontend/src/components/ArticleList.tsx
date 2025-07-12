import {
	faCheck,
	faCircle,
	faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "urql";
import type {
	GetReadArticlesQuery,
	GetUnreadArticlesQuery,
} from "../graphql/generated/graphql";
import {
	MarkArticleReadDocument,
	MarkArticleUnreadDocument,
} from "../graphql/generated/graphql";

interface Props {
	articles: NonNullable<
		| GetUnreadArticlesQuery["unreadArticles"]
		| GetReadArticlesQuery["readArticles"]
	>;
	showReadStatus?: boolean;
}

export function ArticleList({ articles, showReadStatus = true }: Props) {
	const [, markArticleRead] = useMutation(MarkArticleReadDocument);
	const [, markArticleUnread] = useMutation(MarkArticleUnreadDocument);

	const handleToggleRead = async (
		articleId: string,
		isCurrentlyRead: boolean,
	) => {
		if (isCurrentlyRead) {
			await markArticleUnread({ id: articleId });
		} else {
			await markArticleRead({ id: articleId });
		}
	};

	const handleArticleClick = async (article: (typeof articles)[0]) => {
		// Open article in new tab and mark as read if it's unread
		window.open(article.url, "_blank");
		if (!article.isRead) {
			await markArticleRead({ id: article.id });
		}
	};

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
							<div
								key={article.id}
								className={`group flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 ${
									article.isRead
										? "border-gray-200 bg-white"
										: "border-blue-200 bg-blue-50"
								}`}
							>
								{showReadStatus && (
									<button
										type="button"
										onClick={() => handleToggleRead(article.id, article.isRead)}
										className={`flex-shrink-0 rounded p-1 transition-colors ${
											article.isRead
												? "text-gray-400 hover:text-gray-600"
												: "text-blue-600 hover:text-blue-700"
										}`}
										title={article.isRead ? "Mark as unread" : "Mark as read"}
									>
										<FontAwesomeIcon
											icon={article.isRead ? faCheck : faCircle}
											className="w-4 h-4"
										/>
									</button>
								)}
								<div className="flex-1 min-w-0">
									<button
										type="button"
										onClick={() => handleArticleClick(article)}
										className={`text-left w-full group-hover:text-blue-600 transition-colors ${
											article.isRead
												? "text-gray-700"
												: "text-gray-900 font-medium"
										}`}
									>
										<div className="flex items-center gap-2">
											<span className="truncate">{article.title}</span>
											<FontAwesomeIcon
												icon={faExternalLinkAlt}
												className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
											/>
										</div>
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
