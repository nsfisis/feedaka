import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useMutation } from "urql";
import { AddFeedDocument } from "../graphql/generated/graphql";

interface Props {
	onFeedAdded?: () => void;
}

const urqlContextFeed = { additionalTypenames: ["Feed"] };

export function AddFeedForm({ onFeedAdded }: Props) {
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, addFeed] = useMutation(AddFeedDocument);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setError(null);

		try {
			const result = await addFeed({ url: url.trim() }, urqlContextFeed);
			if (result.error) {
				setError(result.error.message);
			} else if (result.data) {
				setUrl("");
				onFeedAdded?.();
			}
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Failed to subscribe to feed",
			);
		}
	};

	const isValidUrl = (urlString: string) => {
		try {
			const url = new URL(urlString);
			return url.protocol === "http:" || url.protocol === "https:";
		} catch {
			return false;
		}
	};

	const isUrlValid = !url || isValidUrl(url);

	return (
		<form onSubmit={handleSubmit}>
			<div className="rounded-xl border border-stone-200 bg-white p-5">
				<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-900">
					Subscribe to New Feed
				</h3>
				<div className="flex gap-3">
					<div className="flex-1">
						<input
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/feed.xml"
							className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
								isUrlValid
									? "border-stone-200 focus:border-sky-500 focus:ring-sky-500/20"
									: "border-red-300 focus:border-red-500 focus:ring-red-500/20"
							}`}
							disabled={fetching}
						/>
						{!isUrlValid && (
							<p className="mt-2 text-sm text-red-600">
								Please enter a valid URL (http:// or https://)
							</p>
						)}
						{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
					</div>
					<button
						type="submit"
						disabled={fetching || !url.trim() || !isUrlValid}
						className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400"
					>
						{fetching ? (
							<FontAwesomeIcon icon={faSpinner} spin />
						) : (
							<FontAwesomeIcon icon={faPlus} />
						)}
						<span>Subscribe</span>
					</button>
				</div>
			</div>
		</form>
	);
}
