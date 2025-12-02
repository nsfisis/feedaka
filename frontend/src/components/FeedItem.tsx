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

const urqlContextFeed = { additionalTypenames: ["Feed"] };

export function FeedItem({ feed, onFeedUnsubscribed }: Props) {
	const [, markFeedRead] = useMutation(MarkFeedReadDocument);
	const [, markFeedUnread] = useMutation(MarkFeedUnreadDocument);
	const [, unsubscribeFeed] = useMutation(UnsubscribeFeedDocument);

	const handleMarkAllRead = async (feedId: string) => {
		await markFeedRead({ id: feedId }, urqlContextFeed);
	};

	const handleMarkAllUnread = async (feedId: string) => {
		await markFeedUnread({ id: feedId }, urqlContextFeed);
	};

	const handleUnsubscribeFeed = async (feedId: string) => {
		const confirmed = window.confirm(
			"Are you sure you want to unsubscribe from this feed?",
		);
		if (confirmed) {
			await unsubscribeFeed({ id: feedId }, urqlContextFeed);
			onFeedUnsubscribed?.();
		}
	};

	return (
		<div className="group rounded-xl border border-stone-200 bg-white p-5 transition-all duration-200 hover:border-stone-300 hover:shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-base font-semibold text-stone-900">
						{feed.title}
					</h3>
					<a
						href={feed.url}
						target="_blank"
						rel="noreferrer"
						className="mt-1 block truncate text-sm text-stone-400 transition-colors hover:text-sky-600"
					>
						{feed.url}
					</a>
					<p className="mt-2 text-xs text-stone-400">
						Last fetched: {formatDateTime(new Date(feed.fetchedAt))}
					</p>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={() => handleMarkAllRead(feed.id)}
						className="rounded-lg p-2 text-stone-400 transition-all duration-150 hover:bg-stone-100 hover:text-stone-600"
						title="Mark all as read"
					>
						<FontAwesomeIcon icon={faCheck} />
					</button>
					<button
						type="button"
						onClick={() => handleMarkAllUnread(feed.id)}
						className="rounded-lg p-2 text-stone-400 transition-all duration-150 hover:bg-stone-100 hover:text-stone-600"
						title="Mark all as unread"
					>
						<FontAwesomeIcon icon={faCircle} />
					</button>
					<button
						type="button"
						onClick={() => handleUnsubscribeFeed(feed.id)}
						className="rounded-lg p-2 text-stone-400 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
						title="Unsubscribe from feed"
					>
						<FontAwesomeIcon icon={faTrash} />
					</button>
				</div>
			</div>
		</div>
	);
}

function formatDateTime(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${year}-${month}-${day} ${hours}:${minutes}`;
}
