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
		<div className="flex justify-center items-center min-h-screen bg-gray-100">
			<div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
				<h1 className="mb-6 text-center text-2xl font-bold">Feedaka Login</h1>
				<form onSubmit={handleSubmit}>
					<div className="mb-4">
						<label htmlFor="username" className="block mb-2">
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full p-2 border border-gray-300 rounded disabled:opacity-70 disabled:cursor-not-allowed"
							disabled={isLoading}
						/>
					</div>
					<div className="mb-4">
						<label htmlFor="password" className="block mb-2">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full p-2 border border-gray-300 rounded disabled:opacity-70 disabled:cursor-not-allowed"
							disabled={isLoading}
						/>
					</div>
					{error && (
						<div className="text-red-600 mb-4 p-2 bg-red-50 rounded">
							{error}
						</div>
					)}
					<button
						type="submit"
						disabled={isLoading}
						className="w-full p-3 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}
