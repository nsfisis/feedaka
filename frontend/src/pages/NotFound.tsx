import { Link } from "wouter";

export function NotFound() {
	return (
		<div className="flex min-h-96 flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-semibold tracking-tight text-stone-900">
					404
				</h1>
				<h2 className="mt-4 text-xl font-medium text-stone-700">
					Page Not Found
				</h2>
				<p className="mt-2 text-sm text-stone-400">
					The page you're looking for doesn't exist.
				</p>
				<Link
					href="/"
					className="mt-6 inline-block rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-700"
				>
					Go back home
				</Link>
			</div>
		</div>
	);
}
