import { Provider, useStore } from "jotai/react";
import { useHydrateAtoms } from "jotai/react/utils";
import { queryClientAtom } from "jotai-tanstack-query";
import { type ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { StoreInitializer } from "./components/StoreInitializer";
import "./index.css";
import { queryClient } from "./queryClient";

function HydrateQueryClient({ children }: { children: ReactNode }) {
	const store = useStore();
	useHydrateAtoms([[queryClientAtom, queryClient]], { store });
	return <>{children}</>;
}

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<HydrateQueryClient>
				<StoreInitializer>
					<App />
				</StoreInitializer>
			</HydrateQueryClient>
		</Provider>
	</StrictMode>,
);
