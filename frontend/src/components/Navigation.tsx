import {
	faBookOpen,
	faCircleCheck,
	faGear,
	faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue, useSetAtom } from "jotai";
import { Link } from "wouter";
import { isLoggedInAtom, logoutAtom } from "../atoms";
import { MenuItem } from "./MenuItem";

export function Navigation() {
	const isLoggedIn = useAtomValue(isLoggedInAtom);
	const logout = useSetAtom(logoutAtom);

	const handleLogout = async () => {
		await logout();
	};

	return (
		<nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-stone-200/60">
			<div className="mx-auto max-w-5xl px-6">
				<div className="flex items-center justify-between h-14">
					<Link
						href="/"
						className="text-lg font-semibold tracking-tight text-stone-900"
					>
						feedaka
					</Link>
					<div className="flex items-center gap-1">
						<MenuItem path="/unread" label="Unread" icon={faBookOpen} />
						<MenuItem path="/read" label="Read" icon={faCircleCheck} />
						<MenuItem path="/settings" label="Settings" icon={faGear} />
						{isLoggedIn && (
							<button
								type="button"
								onClick={handleLogout}
								className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all duration-200"
								title="Logout"
							>
								<FontAwesomeIcon icon={faRightFromBracket} />
								<span className="hidden sm:inline text-sm font-medium">
									Logout
								</span>
							</button>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
