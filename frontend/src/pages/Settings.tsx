import { useQuery } from "urql";
import { AddFeedForm, FeedList } from "../components";
import { GetFeedsDocument } from "../graphql/generated/graphql";

export function Settings() {
	const [, refetchFeeds] = useQuery({
		query: GetFeedsDocument,
	});

	const handleFeedAdded = () => {
		refetchFeeds();
	};

	const handleFeedUnsubscribed = () => {
		refetchFeeds();
	};

	return (
		<div className="mx-auto max-w-3xl space-y-10">
			<section>
				<AddFeedForm onFeedAdded={handleFeedAdded} />
			</section>

			<section>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-900">
					Your Feeds
				</h2>
				<FeedList onFeedUnsubscribed={handleFeedUnsubscribed} />
			</section>
		</div>
	);
}
