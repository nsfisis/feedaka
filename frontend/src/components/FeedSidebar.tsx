import { useQuery } from "urql";
import { useLocation, useSearch } from "wouter";
import { GetFeedsDocument } from "../graphql/generated/graphql";

interface Props {
	basePath: string;
}

const urqlContextFeed = { additionalTypenames: ["Feed", "Article"] };

export function FeedSidebar({ basePath }: Props) {
	const search = useSearch();
	const [, setLocation] = useLocation();
	const params = new URLSearchParams(search);
	const selectedFeedId = params.get("feed");

	const [{ data, fetching }] = useQuery({
		query: GetFeedsDocument,
		context: urqlContextFeed,
	});

	const handleSelect = (feedId: string | null) => {
		if (feedId) {
			setLocation(`${basePath}?feed=${feedId}`);
		} else {
			setLocation(basePath);
		}
	};

	return (
		<nav className="w-56 shrink-0">
			<h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">
				Feeds
			</h2>
			<ul className="space-y-0.5">
				<li>
					<button
						type="button"
						onClick={() => handleSelect(null)}
						className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
							!selectedFeedId
								? "bg-stone-200 font-medium text-stone-900"
								: "text-stone-600 hover:bg-stone-100"
						}`}
					>
						All feeds
					</button>
				</li>
				{fetching && (
					<li className="px-3 py-1.5 text-xs text-stone-400">Loading...</li>
				)}
				{data?.feeds.map((feed) => (
					<li key={feed.id}>
						<button
							type="button"
							onClick={() => handleSelect(feed.id)}
							className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
								selectedFeedId === feed.id
									? "bg-stone-200 font-medium text-stone-900"
									: "text-stone-600 hover:bg-stone-100"
							}`}
						>
							<span className="min-w-0 truncate">{feed.title}</span>
							{feed.unreadCount > 0 && (
								<span className="ml-2 shrink-0 rounded-full bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-700">
									{feed.unreadCount}
								</span>
							)}
						</button>
					</li>
				))}
			</ul>
		</nav>
	);
}
