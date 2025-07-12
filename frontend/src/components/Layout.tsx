import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
	children: ReactNode;
}

export function Layout({ children }: Props) {
	return (
		<div className="min-h-screen bg-gray-50">
			<Navigation />
			<main className="container mx-auto px-4 py-8">{children}</main>
		</div>
	);
}
