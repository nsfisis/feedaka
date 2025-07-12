import { useState } from "react";
import { useMutation, useQuery } from "urql";
import { AddFeedForm, FeedList } from "../components";
import {
	GetFeedsDocument,
	MarkFeedReadDocument,
	MarkFeedUnreadDocument,
	RemoveFeedDocument,
} from "../graphql/generated/graphql";

export function Settings() {
	const [{ data: feedsData }, refetchFeeds] = useQuery({
		query: GetFeedsDocument,
	});
	const [, markFeedRead] = useMutation(MarkFeedReadDocument);
	const [, markFeedUnread] = useMutation(MarkFeedUnreadDocument);
	const [, removeFeed] = useMutation(RemoveFeedDocument);

	const [selectedFeeds, setSelectedFeeds] = useState<Set<string>>(new Set());

	const handleFeedAdded = () => {
		refetchFeeds();
	};

	const handleFeedDeleted = () => {
		refetchFeeds();
		setSelectedFeeds(new Set());
	};

	const handleSelectFeed = (feedId: string, selected: boolean) => {
		const newSelection = new Set(selectedFeeds);
		if (selected) {
			newSelection.add(feedId);
		} else {
			newSelection.delete(feedId);
		}
		setSelectedFeeds(newSelection);
	};

	const handleSelectAll = () => {
		if (!feedsData?.feeds) return;
		if (selectedFeeds.size === feedsData.feeds.length) {
			setSelectedFeeds(new Set());
		} else {
			setSelectedFeeds(new Set(feedsData.feeds.map((feed) => feed.id)));
		}
	};

	const handleBulkMarkRead = async () => {
		const promises = Array.from(selectedFeeds).map((feedId) =>
			markFeedRead({ id: feedId }),
		);
		await Promise.all(promises);
		refetchFeeds();
	};

	const handleBulkMarkUnread = async () => {
		const promises = Array.from(selectedFeeds).map((feedId) =>
			markFeedUnread({ id: feedId }),
		);
		await Promise.all(promises);
		refetchFeeds();
	};

	const handleBulkDelete = async () => {
		const confirmed = window.confirm(
			`Are you sure you want to delete ${selectedFeeds.size} selected feeds?`,
		);
		if (!confirmed) return;

		const promises = Array.from(selectedFeeds).map((feedId) =>
			removeFeed({ id: feedId }),
		);
		await Promise.all(promises);
		handleFeedDeleted();
	};

	const hasFeeds = feedsData?.feeds && feedsData.feeds.length > 0;
	const hasSelectedFeeds = selectedFeeds.size > 0;

	return (
		<div className="mx-auto max-w-4xl">
			<h1 className="mb-6 text-2xl font-bold text-gray-900">Feed Settings</h1>

			{/* Add New Feed Section */}
			<div className="mb-8">
				<h2 className="mb-4 text-xl font-semibold text-gray-800">
					Add New Feed
				</h2>
				<AddFeedForm onFeedAdded={handleFeedAdded} />
			</div>

			{/* Manage Feeds Section */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-800">Manage Feeds</h2>
					{hasFeeds && (
						<div className="flex items-center gap-4">
							<label className="flex items-center gap-2 text-sm text-gray-600">
								<input
									type="checkbox"
									checked={selectedFeeds.size === feedsData.feeds.length}
									onChange={handleSelectAll}
									className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
								/>
								Select All ({feedsData.feeds.length} feeds)
							</label>
						</div>
					)}
				</div>

				{/* Bulk Operations */}
				{hasSelectedFeeds && (
					<div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-blue-900">
								{selectedFeeds.size} feed{selectedFeeds.size > 1 ? "s" : ""}{" "}
								selected
							</span>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleBulkMarkRead}
									className="rounded px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
								>
									Mark All Read
								</button>
								<button
									type="button"
									onClick={handleBulkMarkUnread}
									className="rounded px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-100"
								>
									Mark All Unread
								</button>
								<button
									type="button"
									onClick={handleBulkDelete}
									className="rounded px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-100"
								>
									Delete Selected
								</button>
							</div>
						</div>
					</div>
				)}

				<FeedList
					onFeedDeleted={handleFeedDeleted}
					selectedFeeds={selectedFeeds}
					onSelectFeed={handleSelectFeed}
				/>
			</div>
		</div>
	);
}
