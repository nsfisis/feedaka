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
			className={`group flex items-center gap-3 rounded-lg p-3 transition-all duration-200 ${
				article.isRead
					? "bg-white hover:bg-stone-50"
					: "border-l-2 border-l-sky-500 bg-sky-50/50"
			}`}
		>
			<button
				type="button"
				onClick={() => handleToggleRead(article.id, article.isRead)}
				className={`flex-shrink-0 rounded-md p-1.5 transition-all duration-150 ${
					article.isRead
						? "text-stone-300 hover:bg-stone-100 hover:text-stone-500"
						: "text-sky-500 hover:bg-sky-100 hover:text-sky-600"
				}`}
				title={article.isRead ? "Mark as unread" : "Mark as read"}
			>
				<FontAwesomeIcon
					icon={article.isRead ? faCheck : faCircle}
					className="h-4 w-4"
				/>
			</button>
			<div className="min-w-0 flex-1">
				<button
					type="button"
					onClick={() => handleArticleClick(article)}
					className={`w-full text-left transition-colors duration-150 group-hover:text-sky-700 ${
						article.isRead ? "text-stone-500" : "font-medium text-stone-900"
					}`}
				>
					<span className="break-words">{article.title}</span>
				</button>
			</div>
		</div>
	);
}
