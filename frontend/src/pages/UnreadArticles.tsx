import { useQuery } from "urql";
import { ArticleList } from "../components";
import { GetUnreadArticlesDocument } from "../graphql/generated/graphql";

export function UnreadArticles() {
	const [{ data, fetching, error }] = useQuery({
		query: GetUnreadArticlesDocument,
	});

	if (fetching) {
		return <div className="p-4">Loading unread articles...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">Error: {error.message}</div>;
	}

	return (
		<div>
			<div className="border-b border-gray-200 bg-white px-4 py-3">
				<h1 className="text-xl font-semibold text-gray-900">Unread Articles</h1>
				{data?.unreadArticles && (
					<p className="text-sm text-gray-500">
						{data.unreadArticles.length} article
						{data.unreadArticles.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
			{data?.unreadArticles && (
				<ArticleList articles={data.unreadArticles} showReadStatus={true} />
			)}
		</div>
	);
}
