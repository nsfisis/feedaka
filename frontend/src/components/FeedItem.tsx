import { faCheck, faCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "urql";
import type { GetFeedsQuery } from "../graphql/generated/graphql";
import {
	MarkFeedReadDocument,
	MarkFeedUnreadDocument,
	UnsubscribeFeedDocument,
} from "../graphql/generated/graphql";

type Feed = NonNullable<GetFeedsQuery["feeds"]>[0];

interface Props {
	feed: Feed;
	onFeedUnsubscribed?: () => void;
}

export function FeedItem({ feed, onFeedUnsubscribed }: Props) {
	const [, markFeedRead] = useMutation(MarkFeedReadDocument);
	const [, markFeedUnread] = useMutation(MarkFeedUnreadDocument);
	const [, unsubscribeFeed] = useMutation(UnsubscribeFeedDocument);

	const handleMarkAllRead = async (feedId: string) => {
		await markFeedRead({ id: feedId });
	};

	const handleMarkAllUnread = async (feedId: string) => {
		await markFeedUnread({ id: feedId });
	};

	const handleUnsubscribeFeed = async (feedId: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to unsubscribe from this feed?",
		);
		if (confirmed) {
			await unsubscribeFeed({ id: feedId });
			onFeedUnsubscribed?.();
		}
	};

	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900">{feed.title}</h3>
					<p className="mt-1 text-sm text-gray-500">
						<a href={feed.url} target="_blank" rel="noreferrer">
							{feed.url}
						</a>
					</p>
					<div className="mt-2 flex items-center gap-4 text-sm">
						<span className="text-gray-400">
							Last fetched: {new Date(feed.fetchedAt).toLocaleString()}
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => handleMarkAllRead(feed.id)}
						className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
						title="Mark all as read"
					>
						<FontAwesomeIcon icon={faCheck} />
					</button>
					<button
						type="button"
						onClick={() => handleMarkAllUnread(feed.id)}
						className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
						title="Mark all as unread"
					>
						<FontAwesomeIcon icon={faCircle} />
					</button>
					<button
						type="button"
						onClick={() => handleUnsubscribeFeed(feed.id)}
						className="rounded p-2 text-red-600 hover:bg-red-50 hover:text-red-700"
						title="Unsubscribe from feed"
					>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
		</div>
	);
}
