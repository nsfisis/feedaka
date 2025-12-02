import { useQuery } from "urql";
import { ArticleList } from "../components";
import { GetUnreadArticlesDocument } from "../graphql/generated/graphql";

const urqlContextArticle = { additionalTypenames: ["Article"] };

export function UnreadArticles() {
	const [{ data, fetching, error }] = useQuery({
		query: GetUnreadArticlesDocument,
		context: urqlContextArticle,
	});

	if (fetching) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">Loading unread articles...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
				Error: {error.message}
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<h1 className="text-xl font-semibold text-stone-900">Unread</h1>
				{data?.unreadArticles && (
					<p className="mt-1 text-sm text-stone-400">
						{data.unreadArticles.length} article
						{data.unreadArticles.length !== 1 ? "s" : ""} to read
					</p>
				)}
			</div>
			{data?.unreadArticles && (
				<ArticleList articles={data.unreadArticles} isReadView={false} />
			)}
		</div>
	);
}
