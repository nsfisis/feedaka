import { useCallback, useEffect, useState } from "react";
import type { components } from "../api/generated";
import { api } from "../services/api-client";
import { FeedItem } from "./FeedItem";

type Feed = components["schemas"]["Feed"];

interface Props {
	onFeedUnsubscribed?: () => void;
}

export function FeedList({ onFeedUnsubscribed }: Props) {
	const [feeds, setFeeds] = useState<Feed[]>([]);
	const [fetching, setFetching] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchFeeds = useCallback(async () => {
		setFetching(true);
		const { data } = await api.GET("/api/feeds");
		if (data) {
			setFeeds(data);
			setError(null);
		} else {
			setError("Failed to load feeds");
		}
		setFetching(false);
	}, []);

	useEffect(() => {
		fetchFeeds();
	}, [fetchFeeds]);

	const handleFeedUnsubscribed = () => {
		fetchFeeds();
		onFeedUnsubscribed?.();
	};

	const handleFeedChanged = () => {
		fetchFeeds();
	};

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
				Error: {error}
			</div>
		);
	}
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
				<FeedItem
					key={feed.id}
					feed={feed}
					onFeedUnsubscribed={handleFeedUnsubscribed}
					onFeedChanged={handleFeedChanged}
				/>
			))}
		</div>
	);
}
