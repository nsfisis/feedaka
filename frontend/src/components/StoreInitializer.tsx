import type { ReactNode } from "react";
import { useAuthInit } from "../atoms";

interface StoreInitializerProps {
	children: ReactNode;
}

export function StoreInitializer({ children }: StoreInitializerProps) {
	useAuthInit();
	return <>{children}</>;
}
