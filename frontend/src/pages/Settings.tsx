import { useCallback, useState } from "react";
import { AddFeedForm, FeedList } from "../components";

export function Settings() {
	const [refreshKey, setRefreshKey] = useState(0);

	const handleChange = useCallback(() => {
		setRefreshKey((k) => k + 1);
	}, []);

	return (
		<div className="mx-auto max-w-3xl space-y-10">
			<section>
				<AddFeedForm onFeedAdded={handleChange} />
			</section>

			<section>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-900">
					Your Feeds
				</h2>
				<FeedList key={refreshKey} onFeedUnsubscribed={handleChange} />
			</section>
		</div>
	);
}
