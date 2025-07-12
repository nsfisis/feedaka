export function NotFound() {
	return (
		<div className="flex min-h-96 flex-col items-center justify-center">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-900">404</h1>
				<h2 className="mt-4 text-2xl font-semibold text-gray-700">
					Page Not Found
				</h2>
				<p className="mt-2 text-gray-500">
					The page you're looking for doesn't exist.
				</p>
			</div>
		</div>
	);
}
