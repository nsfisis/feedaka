import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { api } from "../services/api-client";

type LoginResult = { success: true } | { success: false; error: string };

interface AuthContextType {
	isLoggedIn: boolean;
	isLoading: boolean;
	login: (username: string, password: string) => Promise<LoginResult>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const checkAuth = useCallback(async () => {
		const { data } = await api.GET("/api/auth/me");
		setIsLoggedIn(!!data);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	const login = async (
		username: string,
		password: string,
	): Promise<LoginResult> => {
		const { data, error } = await api.POST("/api/auth/login", {
			body: { username, password },
		});

		if (error) {
			return { success: false, error: error.message };
		}

		if (data?.user) {
			setIsLoggedIn(true);
			return { success: true };
		}

		return { success: false, error: "Invalid username or password" };
	};

	const logout = async () => {
		await api.POST("/api/auth/logout");
		setIsLoggedIn(false);
	};

	return (
		<AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
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
