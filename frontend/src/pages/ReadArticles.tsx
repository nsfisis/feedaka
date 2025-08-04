import { useQuery } from "urql";
import { ArticleList } from "../components";
import { GetReadArticlesDocument } from "../graphql/generated/graphql";

export function ReadArticles() {
	const [{ data, fetching, error }] = useQuery({
		query: GetReadArticlesDocument,
	});

	if (fetching) {
		return <div className="p-4">Loading read articles...</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">Error: {error.message}</div>;
	}

	return (
		<div>
			<div className="border-b border-gray-200 bg-white px-4 py-3">
				<h1 className="text-xl font-semibold text-gray-900">Read Articles</h1>
				{data?.readArticles && (
					<p className="text-sm text-gray-500">
						{data.readArticles.length} article
						{data.readArticles.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
			{data?.readArticles && <ArticleList articles={data.readArticles} />}
		</div>
	);
}
