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

interface User {
	id: string;
	username: string;
}

interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<boolean>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [, executeLogin] = useMutation(LoginDocument);
	const [, executeLogout] = useMutation(LogoutDocument);
	const [currentUserResult, reexecuteCurrentUser] = useQuery({
		query: GetCurrentUserDocument,
	});

	// Update user from CurrentUser query
	useEffect(() => {
		if (currentUserResult.data?.currentUser) {
			setUser(currentUserResult.data.currentUser);
		} else {
			setUser(null);
		}
		if (!currentUserResult.fetching) {
			setIsLoading(false);
		}
	}, [currentUserResult.data, currentUserResult.fetching]);

	const login = async (
		username: string,
		password: string,
	): Promise<boolean> => {
		try {
			const result = await executeLogin({ username, password });

			if (result.data?.login?.user) {
				setUser(result.data.login.user);
				// Refetch CurrentUser query to ensure session is established
				reexecuteCurrentUser({ requestPolicy: "network-only" });
				return true;
			}

			return false;
		} catch (error) {
			console.error("Login failed:", error);
			return false;
		}
	};

	const logout = async () => {
		try {
			await executeLogout({});
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setUser(null);
			// Refetch CurrentUser query to ensure session is cleared
			reexecuteCurrentUser({ requestPolicy: "network-only" });
		}
	};

	return (
		<AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
