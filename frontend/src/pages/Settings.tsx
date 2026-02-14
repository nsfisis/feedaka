import { Suspense } from "react";
import { AddFeedForm } from "../components/AddFeedForm";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { FeedList } from "../components/FeedList";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function Settings() {
	return (
		<div className="mx-auto max-w-3xl space-y-10">
			<section>
				<AddFeedForm />
			</section>

			<section>
				<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-900">
					Your Feeds
				</h2>
				<ErrorBoundary>
					<Suspense fallback={<LoadingSpinner />}>
						<FeedList />
					</Suspense>
				</ErrorBoundary>
			</section>
		</div>
	);
}
