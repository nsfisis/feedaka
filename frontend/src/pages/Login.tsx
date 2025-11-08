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
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				backgroundColor: "#f5f5f5",
			}}
		>
			<div
				style={{
					backgroundColor: "white",
					padding: "2rem",
					borderRadius: "8px",
					boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
					width: "100%",
					maxWidth: "400px",
				}}
			>
				<h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
					Feedaka Login
				</h1>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "1rem" }}>
						<label
							htmlFor="username"
							style={{ display: "block", marginBottom: "0.5rem" }}
						>
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							style={{
								width: "100%",
								padding: "0.5rem",
								border: "1px solid #ccc",
								borderRadius: "4px",
							}}
							disabled={isLoading}
						/>
					</div>
					<div style={{ marginBottom: "1rem" }}>
						<label
							htmlFor="password"
							style={{ display: "block", marginBottom: "0.5rem" }}
						>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							style={{
								width: "100%",
								padding: "0.5rem",
								border: "1px solid #ccc",
								borderRadius: "4px",
							}}
							disabled={isLoading}
						/>
					</div>
					{error && (
						<div
							style={{
								color: "red",
								marginBottom: "1rem",
								padding: "0.5rem",
								backgroundColor: "#fee",
								borderRadius: "4px",
							}}
						>
							{error}
						</div>
					)}
					<button
						type="submit"
						disabled={isLoading}
						style={{
							width: "100%",
							padding: "0.75rem",
							backgroundColor: "#007bff",
							color: "white",
							border: "none",
							borderRadius: "4px",
							cursor: isLoading ? "not-allowed" : "pointer",
							opacity: isLoading ? 0.7 : 1,
						}}
					>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
			</div>
		</div>
	);
}
