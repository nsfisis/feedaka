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
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-2xl font-bold text-gray-900">Feed Settings</h1>

			{/* Subscribe to New Feed Section */}
			<div className="mb-8">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					Subscribe to New Feed
				</h2>
				<AddFeedForm onFeedAdded={handleFeedAdded} />
			</div>

			{/* Manage Feeds Section */}
			<div className="mb-8">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					Manage Feeds
				</h2>
				<FeedList onFeedUnsubscribed={handleFeedUnsubscribed} />
			</div>
		</div>
	);
}
