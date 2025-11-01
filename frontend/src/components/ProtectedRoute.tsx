import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "../contexts/AuthContext";

interface Props {
	children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
	const { user, isLoading } = useAuth();

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

	if (!user) {
		return <Redirect to="/login" />;
	}

	return <>{children}</>;
}
