import { atom, useSetAtom } from "jotai";
import { useEffect } from "react";
import type { components } from "../api/generated";
import { api } from "../services/api-client";

type User = components["schemas"]["User"];

export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom<boolean>(true);
export const isLoggedInAtom = atom<boolean>((get) => get(userAtom) !== null);

export const loginAtom = atom(
	null,
	async (
		_get,
		set,
		{ username, password }: { username: string; password: string },
	) => {
		const { data, error } = await api.POST("/api/auth/login", {
			body: { username, password },
		});
		if (error) {
			throw new Error(error.message);
		}
		set(userAtom, data.user);
	},
);

export const logoutAtom = atom(null, async (_get, set) => {
	await api.POST("/api/auth/logout");
	set(userAtom, null);
});

export function useAuthInit() {
	const setUser = useSetAtom(userAtom);
	const setAuthLoading = useSetAtom(authLoadingAtom);

	useEffect(() => {
		api.GET("/api/auth/me").then(({ data }) => {
			if (data) {
				setUser(data);
			}
			setAuthLoading(false);
		});
	}, [setUser, setAuthLoading]);
}
