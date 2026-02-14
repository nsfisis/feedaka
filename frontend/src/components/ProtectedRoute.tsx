import { useAtomValue } from "jotai";
import type { ReactNode } from "react";
import { Redirect } from "wouter";
import { authLoadingAtom, isLoggedInAtom } from "../atoms";

interface Props {
	children: ReactNode;
}

export function ProtectedRoute({ children }: Props) {
	const isLoggedIn = useAtomValue(isLoggedInAtom);
	const isLoading = useAtomValue(authLoadingAtom);

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
