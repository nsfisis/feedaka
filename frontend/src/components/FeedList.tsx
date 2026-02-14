import { useAtomValue } from "jotai";
import { feedsAtom } from "../atoms";
import { FeedItem } from "./FeedItem";

export function FeedList() {
	const { data: feeds } = useAtomValue(feedsAtom);

	if (feeds.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-sm text-stone-400">No feeds added yet.</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{feeds.map((feed) => (
				<FeedItem key={feed.id} feed={feed} />
			))}
		</div>
	);
}
