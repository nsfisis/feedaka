import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider as UrqlProvider } from "urql";
import { registerSW } from "virtual:pwa-register";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { client } from "./services/graphql-client";

// Register Service Worker for PWA auto-update
registerSW({ immediate: true });

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<UrqlProvider value={client}>
			<AuthProvider>
				<App />
			</AuthProvider>
		</UrqlProvider>
	</StrictMode>,
);
