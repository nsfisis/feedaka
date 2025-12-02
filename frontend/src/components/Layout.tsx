import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
	children: ReactNode;
}

export function Layout({ children }: Props) {
	return (
		<div className="min-h-screen bg-stone-50">
			<Navigation />
			<main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
		</div>
	);
}
