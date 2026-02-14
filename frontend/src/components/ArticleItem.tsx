import { faCheck, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { components } from "../api/generated";
import { api } from "../services/api-client";

type Article = components["schemas"]["Article"];

interface Props {
	article: Article;
	onReadChange?: (articleId: string, isRead: boolean) => void;
}

export function ArticleItem({ article, onReadChange }: Props) {
	const handleToggleRead = async (
		articleId: string,
		isCurrentlyRead: boolean,
	) => {
		const newReadState = !isCurrentlyRead;
		onReadChange?.(articleId, newReadState);

		if (isCurrentlyRead) {
			await api.POST("/api/articles/{articleId}/unread", {
				params: { path: { articleId } },
			});
		} else {
			await api.POST("/api/articles/{articleId}/read", {
				params: { path: { articleId } },
			});
		}
	};

	const handleArticleClick = async (article: Article) => {
		window.open(article.url, "_blank", "noreferrer");
		if (!article.isRead) {
			onReadChange?.(article.id, true);
			await api.POST("/api/articles/{articleId}/read", {
				params: { path: { articleId: article.id } },
			});
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
