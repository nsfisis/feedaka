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
			<div className="flex justify-center items-center min-h-screen">
				Loading...
			</div>
		);
	}

	if (!isLoggedIn) {
		return <Redirect to="/login" />;
	}

	return <>{children}</>;
}
