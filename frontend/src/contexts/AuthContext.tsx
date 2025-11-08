import { createContext, type ReactNode, useContext } from "react";
import { useMutation, useQuery } from "urql";
import {
	GetCurrentUserDocument,
	LoginDocument,
	LogoutDocument,
} from "../graphql/generated/graphql";

type LoginResult = { success: true } | { success: false; error: string };

interface AuthContextType {
	isLoggedIn: boolean;
	isLoading: boolean;
	error: string | null;
	login: (username: string, password: string) => Promise<LoginResult>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [, executeLogin] = useMutation(LoginDocument);
	const [, executeLogout] = useMutation(LogoutDocument);
	const [currentUserResult] = useQuery({
		query: GetCurrentUserDocument,
	});

	const isLoggedIn = !!currentUserResult.data?.currentUser;
	const isLoading = currentUserResult.fetching;
	const error = currentUserResult.error?.message ?? null;

	const login = async (
		username: string,
		password: string,
	): Promise<LoginResult> => {
		try {
			const result = await executeLogin({ username, password });

			if (result.error) {
				const errorMessage =
					result.error.graphQLErrors[0]?.message || result.error.message;
				return { success: false, error: errorMessage };
			}

			if (result.data?.login?.user) {
				return { success: true };
			}

			const errorMessage = "Invalid username or password";
			return { success: false, error: errorMessage };
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";
			console.error("Login failed:", error);
			return { success: false, error: errorMessage };
		}
	};

	const logout = async () => {
		try {
			await executeLogout({});
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<AuthContext.Provider
			value={{ isLoggedIn, isLoading, error, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
