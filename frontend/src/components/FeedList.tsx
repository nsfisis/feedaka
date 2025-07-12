import {
	faCheckDouble,
	faCircle,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery } from "urql";
import {
	GetFeedsDocument,
	MarkFeedReadDocument,
	MarkFeedUnreadDocument,
	UnsubscribeFeedDocument,
} from "../graphql/generated/graphql";

interface Props {
	onFeedUnsubscribed?: () => void;
	selectedFeeds?: Set<string>;
	onSelectFeed?: (feedId: string, selected: boolean) => void;
}

export function FeedList({
	onFeedUnsubscribed,
	selectedFeeds,
	onSelectFeed,
}: Props) {
	const [{ data, fetching, error }] = useQuery({
		query: GetFeedsDocument,
	});

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

	if (fetching) return <div className="p-4">Loading feeds...</div>;
	if (error)
		return <div className="p-4 text-red-600">Error: {error.message}</div>;
	if (!data?.feeds || data.feeds.length === 0) {
		return <div className="p-4 text-gray-500">No feeds added yet.</div>;
	}

	return (
		<div className="space-y-4 p-4">
			{data.feeds.map((feed) => {
				const unreadCount = feed.articles.filter((a) => !a.isRead).length;
				const totalCount = feed.articles.length;

				const isSelected = selectedFeeds?.has(feed.id) ?? false;

				return (
					<div
						key={feed.id}
						className={`rounded-lg border p-4 shadow-sm ${
							isSelected
								? "border-blue-300 bg-blue-50"
								: "border-gray-200 bg-white"
						}`}
					>
						<div className="flex items-start justify-between">
							{selectedFeeds && onSelectFeed && (
								<div className="flex items-start gap-3">
									<input
										type="checkbox"
										checked={isSelected}
										onChange={(e) => onSelectFeed(feed.id, e.target.checked)}
										className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
									/>
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-gray-900">
											{feed.title}
										</h3>
										<p className="mt-1 text-sm text-gray-500">{feed.url}</p>
										<div className="mt-2 flex items-center gap-4 text-sm">
											<span className="text-gray-600">
												{unreadCount} unread / {totalCount} total
											</span>
											<span className="text-gray-400">
												Last fetched:{" "}
												{new Date(feed.fetchedAt).toLocaleString()}
											</span>
										</div>
									</div>
								</div>
							)}
							{(!selectedFeeds || !onSelectFeed) && (
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-gray-900">
										{feed.title}
									</h3>
									<p className="mt-1 text-sm text-gray-500">{feed.url}</p>
									<div className="mt-2 flex items-center gap-4 text-sm">
										<span className="text-gray-600">
											{unreadCount} unread / {totalCount} total
										</span>
										<span className="text-gray-400">
											Last fetched: {new Date(feed.fetchedAt).toLocaleString()}
										</span>
									</div>
								</div>
							)}
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => handleMarkAllRead(feed.id)}
									className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
									title="Mark all as read"
								>
									<FontAwesomeIcon icon={faCheckDouble} />
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
			})}
		</div>
	);
}
