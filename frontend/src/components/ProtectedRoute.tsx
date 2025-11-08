import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
	const { isLoggedIn, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				Loading...
			</div>
		);
	}

	if (!isLoggedIn) {
		return <Redirect to="/login" />;
	}

	return <>{children}</>;
}
