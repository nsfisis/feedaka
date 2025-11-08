import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
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
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [, executeLogin] = useMutation(LoginDocument);
	const [, executeLogout] = useMutation(LogoutDocument);
	const [currentUserResult, reexecuteCurrentUser] = useQuery({
		query: GetCurrentUserDocument,
	});

	// Update isLoggedIn from CurrentUser query
	useEffect(() => {
		if (currentUserResult.data?.currentUser) {
			setIsLoggedIn(true);
			setError(null);
		} else {
			setIsLoggedIn(false);
		}

		if (currentUserResult.error) {
			setError(currentUserResult.error.message);
		}

		if (!currentUserResult.fetching) {
			setIsLoading(false);
		}
	}, [
		currentUserResult.data,
		currentUserResult.fetching,
		currentUserResult.error,
	]);

	const login = async (
		username: string,
		password: string,
	): Promise<LoginResult> => {
		setError(null);

		try {
			const result = await executeLogin({ username, password });

			if (result.error) {
				const errorMessage =
					result.error.graphQLErrors[0]?.message || result.error.message;
				setError(errorMessage);
				return { success: false, error: errorMessage };
			}

			if (result.data?.login?.user) {
				// Refetch CurrentUser query to ensure session is established
				reexecuteCurrentUser({ requestPolicy: "network-only" });
				return { success: true };
			}

			const errorMessage = "Invalid username or password";
			setError(errorMessage);
			return { success: false, error: errorMessage };
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred";
			console.error("Login failed:", error);
			setError(errorMessage);
			return { success: false, error: errorMessage };
		}
	};

	const logout = async () => {
		try {
			await executeLogout({});
			// Refetch CurrentUser query to ensure session is cleared
			reexecuteCurrentUser({ requestPolicy: "network-only" });
		} catch (error) {
			console.error("Logout failed:", error);
			// Even on error, refetch to get the latest state
			reexecuteCurrentUser({ requestPolicy: "network-only" });
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
