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
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">Loading feeds...</p>
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
	if (!data?.feeds || data.feeds.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">No feeds added yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
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
