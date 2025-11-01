import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { useMutation, useQuery } from "urql";
import {
	GetMeDocument,
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
	const [meResult, reexecuteMe] = useQuery({ query: GetMeDocument });

	// Update user from Me query
	useEffect(() => {
		if (meResult.data?.me) {
			setUser(meResult.data.me);
		} else {
			setUser(null);
		}
		if (!meResult.fetching) {
			setIsLoading(false);
		}
	}, [meResult.data, meResult.fetching]);

	const login = async (
		username: string,
		password: string,
	): Promise<boolean> => {
		try {
			const result = await executeLogin({ username, password });

			if (result.data?.login?.user) {
				setUser(result.data.login.user);
				// Refetch Me query to ensure session is established
				reexecuteMe({ requestPolicy: "network-only" });
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
			// Refetch Me query to ensure session is cleared
			reexecuteMe({ requestPolicy: "network-only" });
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
