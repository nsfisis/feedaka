import { faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
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

type Article = NonNullable<
	| GetUnreadArticlesQuery["unreadArticles"]
	| GetReadArticlesQuery["readArticles"]
>[0];

interface Props {
	article: Article;
	onReadChange?: (articleId: string, isRead: boolean) => void;
}

const urqlContextArticle = { additionalTypenames: ["Article"] };

export function ArticleItem({ article, onReadChange }: Props) {
	const [, markArticleRead] = useMutation(MarkArticleReadDocument);
	const [, markArticleUnread] = useMutation(MarkArticleUnreadDocument);

	const handleToggleRead = async (
		articleId: string,
		isCurrentlyRead: boolean,
	) => {
		const newReadState = !isCurrentlyRead;
		onReadChange?.(articleId, newReadState);

		if (isCurrentlyRead) {
			await markArticleUnread({ id: articleId }, urqlContextArticle);
		} else {
			await markArticleRead({ id: articleId }, urqlContextArticle);
		}
	};

	const handleArticleClick = async (article: Article) => {
		// Open article in new tab and mark as read if it's unread
		window.open(article.url, "_blank", "noreferrer");
		if (!article.isRead) {
			onReadChange?.(article.id, true);
			await markArticleRead({ id: article.id }, urqlContextArticle);
		}
	};

	return (
		<div
			className={`group flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 ${
				article.isRead
					? "border-gray-200 bg-white"
					: "border-blue-200 bg-blue-50"
			}`}
		>
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
			<div className="flex-1 min-w-0">
				<button
					type="button"
					onClick={() => handleArticleClick(article)}
					className={`text-left w-full group-hover:text-blue-600 transition-colors ${
						article.isRead ? "text-gray-700" : "text-gray-900 font-medium"
					}`}
				>
					<div className="flex items-center gap-2 break-words">
						{article.title}
					</div>
				</button>
			</div>
		</div>
	);
}
