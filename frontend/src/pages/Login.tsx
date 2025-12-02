import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const [, setLocation] = useLocation();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const result = await login(username, password);
		if (result.success) {
			setLocation("/");
		} else {
			setError(result.error);
		}
		setIsLoading(false);
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-stone-100 to-stone-50 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 text-center">
					<h1 className="text-2xl font-semibold tracking-tight text-stone-900">
						feedaka
					</h1>
					<p className="mt-2 text-sm text-stone-500">Sign in to your account</p>
				</div>
				<div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="username"
								className="mb-1.5 block text-sm font-medium text-stone-700"
							>
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 transition-all duration-200 placeholder:text-stone-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-70"
								disabled={isLoading}
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="mb-1.5 block text-sm font-medium text-stone-700"
							>
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 transition-all duration-200 placeholder:text-stone-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-70"
								disabled={isLoading}
							/>
						</div>
						{error && (
							<div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
								{error}
							</div>
						)}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isLoading ? "Signing in..." : "Sign in"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
