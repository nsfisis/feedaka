import {
	faBookOpen,
	faCircleCheck,
	faGear,
	faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { MenuItem } from "./MenuItem";

export function Navigation() {
	const { logout, user } = useAuth();
	const [, setLocation] = useLocation();

	const handleLogout = async () => {
		await logout();
		setLocation("/login");
	};

	return (
		<nav className="bg-white shadow-sm border-b border-gray-200">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<Link href="/" className="text-xl font-bold text-gray-900">
						feedaka
					</Link>
					<div className="flex items-center space-x-6">
						<MenuItem path="/unread" label="Unread" icon={faBookOpen} />
						<MenuItem path="/read" label="Read" icon={faCircleCheck} />
						<MenuItem path="/settings" label="Settings" icon={faGear} />
						{user && (
							<button
								type="button"
								onClick={handleLogout}
								className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
								title={`Logout (${user.username})`}
							>
								<FontAwesomeIcon icon={faRightFromBracket} />
								<span className="hidden sm:inline">Logout</span>
							</button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
