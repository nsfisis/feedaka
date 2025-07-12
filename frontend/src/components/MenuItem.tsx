import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation } from "wouter";

interface Props {
	path: string;
	label: string;
	icon: IconDefinition;
}

export function MenuItem({ path, label, icon }: Props) {
	const [location] = useLocation();
	const isActive = location === path;

	return (
		<Link
			href={path}
			className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
				isActive
					? "bg-blue-100 text-blue-700"
					: "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
			}`}
		>
			<FontAwesomeIcon icon={icon} />
			<span>{label}</span>
		</Link>
	);
}
