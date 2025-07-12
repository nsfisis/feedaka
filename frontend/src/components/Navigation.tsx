import {
	faBookOpen,
	faCircleCheck,
	faGear,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "wouter";
import { MenuItem } from "./MenuItem";

export function Navigation() {
	return (
		<nav className="bg-white shadow-sm border-b border-gray-200">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center space-x-8">
						<Link href="/" className="text-xl font-bold text-gray-900">
							feedaka
						</Link>
						<div className="flex space-x-6">
							<MenuItem path="/unread" label="Unread" icon={faBookOpen} />
							<MenuItem path="/read" label="Read" icon={faCircleCheck} />
							<MenuItem path="/settings" label="Settings" icon={faGear} />
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
}
