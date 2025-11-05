import { Client, cacheExchange, fetchExchange } from "urql";

export const client = new Client({
	url: "/graphql",
	exchanges: [cacheExchange, fetchExchange],
	fetchOptions: {
		// Include cookies for session management
		credentials: "include",
	},
});
