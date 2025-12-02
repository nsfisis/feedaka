import { useQuery } from "urql";
import { ArticleList } from "../components";
import { GetReadArticlesDocument } from "../graphql/generated/graphql";

const urqlContextArticle = { additionalTypenames: ["Article"] };

export function ReadArticles() {
	const [{ data, fetching, error }] = useQuery({
		query: GetReadArticlesDocument,
		context: urqlContextArticle,
	});

	if (fetching) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">Loading read articles...</p>
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
				<h1 className="text-xl font-semibold text-stone-900">Read</h1>
				{data?.readArticles && (
					<p className="mt-1 text-sm text-stone-400">
						{data.readArticles.length} article
						{data.readArticles.length !== 1 ? "s" : ""}
					</p>
				)}
			</div>
			{data?.readArticles && (
				<ArticleList articles={data.readArticles} isReadView={true} />
			)}
		</div>
	);
}
