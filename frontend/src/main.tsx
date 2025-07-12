import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "urql";
import "./index.css";
import App from "./App.tsx";
import { client } from "./services/graphql-client";

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider value={client}>
			<App />
		</Provider>
	</StrictMode>,
);
