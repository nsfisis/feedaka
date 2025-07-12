import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useMutation } from "urql";
import { AddFeedDocument } from "../graphql/generated/graphql";

interface Props {
	onFeedAdded?: () => void;
}

export function AddFeedForm({ onFeedAdded }: Props) {
	const [url, setUrl] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [{ fetching }, addFeed] = useMutation(AddFeedDocument);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setError(null);

		try {
			const result = await addFeed({ url: url.trim() });
			if (result.error) {
				setError(result.error.message);
			} else if (result.data) {
				setUrl("");
				onFeedAdded?.();
			}
		} catch (error) {
			setError(error instanceof Error ? error.message : "Failed to add feed");
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
		<form onSubmit={handleSubmit} className="space-y-4 p-4">
			<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">
					Add New Feed
				</h3>
				<div className="flex gap-2">
					<div className="flex-1">
						<input
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/feed.xml"
							className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
								isUrlValid
									? "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
									: "border-red-300 focus:border-red-500 focus:ring-red-500"
							}`}
							disabled={fetching}
						/>
						{!isUrlValid && (
							<p className="mt-1 text-sm text-red-600">
								Please enter a valid URL (http:// or https://)
							</p>
						)}
						{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
					</div>
					<button
						type="submit"
						disabled={fetching || !url.trim() || !isUrlValid}
						className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						{fetching ? (
							<FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
						) : (
							<FontAwesomeIcon icon={faPlus} className="mr-2" />
						)}
						Add Feed
					</button>
				</div>
			</div>
		</form>
	);
}
