import { useQuery } from "urql";
import { GetFeedsDocument } from "../graphql/generated/graphql";
import { FeedItem } from "./FeedItem";

interface Props {
	onFeedUnsubscribed?: () => void;
}

const urqlContextFeed = { additionalTypenames: ["Feed"] };

export function FeedList({ onFeedUnsubscribed }: Props) {
	const [{ data, fetching, error }] = useQuery({
		query: GetFeedsDocument,
		context: urqlContextFeed,
	});

	if (fetching) {
		return <div className="p-4">Loading feeds...</div>;
	}
	if (error) {
		return <div className="p-4 text-red-600">Error: {error.message}</div>;
	}
	if (!data?.feeds || data.feeds.length === 0) {
		return <div className="p-4 text-gray-500">No feeds added yet.</div>;
	}

	return (
		<div className="space-y-4 p-4">
			{data.feeds.map((feed) => (
				<FeedItem
					key={feed.id}
					feed={feed}
					onFeedUnsubscribed={onFeedUnsubscribed}
				/>
			))}
		</div>
	);
}
