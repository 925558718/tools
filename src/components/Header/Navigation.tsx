"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { cn } from "@/lib/utils";
import { Link } from '@/i18n/navigation';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/shadcn/navigation-menu";

interface NavigationItem {
	href: string;
	labelKey: string;
	description?: string;
	icon?: React.ReactNode;
}

function Navigation() {
	const t = useTranslations();
	const pathname = usePathname();

	// 只保留 css/gradient 工具
	const cssTools: NavigationItem[] = [
		{
			href: "/css/gradient",
			labelKey: "nav_gradient_generator",
			description: "gradient_generator_desc",
			icon: (
				<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<defs>
						<linearGradient id="gradientIcon" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" stopColor="#3b82f6" />
							<stop offset="50%" stopColor="#8b5cf6" />
							<stop offset="100%" stopColor="#06b6d4" />
						</linearGradient>
					</defs>
					<rect x="4" y="4" width="16" height="16" rx="2" fill="url(#gradientIcon)" fillOpacity="0.3" stroke="currentColor" strokeWidth={1.5} />
					<circle cx="8" cy="8" r="1.5" fill="currentColor" />
					<circle cx="16" cy="16" r="1.5" fill="currentColor" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 8L16 16" strokeDasharray="2 2" />
				</svg>
			),
		},
	];

	return (
		<NavigationMenu>
			<NavigationMenuList>
				{cssTools.map((item) => {
					const isActive = pathname === item.href;
					
					return (
						<NavigationMenuItem key={item.href}>
							<Link href={item.href} legacyBehavior passHref>
								<NavigationMenuLink
									className={cn(
										navigationMenuTriggerStyle(),
										"flex items-center space-x-2",
										isActive && "bg-accent text-accent-foreground"
									)}
									title={item.description ? t(item.description) : undefined}
								>
									{/* 图标 */}
									<div className={cn(
										"transition-colors duration-200",
										isActive 
											? "text-blue-600 dark:text-blue-400" 
											: "text-slate-500 dark:text-slate-400"
									)}>
										{item.icon}
									</div>
									
									{/* 文字标签 */}
									<span className="hidden sm:inline-block">
										{t(item.labelKey)}
									</span>
								</NavigationMenuLink>
							</Link>
						</NavigationMenuItem>
					);
				})}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

export default Navigation;