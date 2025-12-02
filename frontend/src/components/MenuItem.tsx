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
			className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
				isActive
					? "bg-sky-50 text-sky-700"
					: "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
			}`}
		>
			<FontAwesomeIcon icon={icon} />
			<span className="hidden sm:inline">{label}</span>
		</Link>
	);
}
