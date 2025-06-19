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

	// CSS工具子菜单
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
				<NavigationMenuItem>
					<NavigationMenuTrigger className="flex items-center space-x-2">
						{/* CSS图标 */}
						<div className="text-slate-500 dark:text-slate-400">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
							</svg>
						</div>
						<span className="hidden sm:inline-block">CSS</span>
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[280px] gap-2 p-3">
							{cssTools.map((item) => {
								const isActive = pathname === item.href;
								
								return (
									<li key={item.href}>
										<NavigationMenuLink asChild>
											<Link
												href={item.href}
												className={cn(
													"block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
													isActive && "bg-accent text-accent-foreground"
												)}
											>
												<div className="flex items-center space-x-2">
													{/* 图标 */}
													<div className={cn(
														"transition-colors duration-200",
														isActive 
															? "text-blue-600 dark:text-blue-400" 
															: "text-slate-500 dark:text-slate-400"
													)}>
														{item.icon}
													</div>
													
													{/* 标题 */}
													<div className="text-sm font-medium leading-none">
														{t(item.labelKey)}
													</div>
												</div>
												
												{/* 描述 */}
												{item.description && (
													<p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
														{t(item.description)}
													</p>
												)}
											</Link>
										</NavigationMenuLink>
									</li>
								);
							})}
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

export default Navigation;