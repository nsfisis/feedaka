import { atomWithSuspenseQuery } from "jotai-tanstack-query";
import { api } from "../services/api-client";

export const feedsAtom = atomWithSuspenseQuery(() => ({
	queryKey: ["feeds"],
	queryFn: async () => {
		const { data } = await api.GET("/api/feeds");
		return data ?? [];
	},
}));
