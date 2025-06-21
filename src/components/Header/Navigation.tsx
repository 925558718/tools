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
import { Code2, Palette, Key } from "lucide-react";

interface NavigationItem {
	href: string;
	labelKey: string;
	description?: string;
	icon?: React.ReactNode;
}

interface NavigationGroup {
	key: string;
	labelKey: string;
	icon: React.ReactNode;
	items: NavigationItem[];
}

function Navigation() {
	const t = useTranslations();
	const pathname = usePathname();

	// 导航组配置
	const navigationGroups: NavigationGroup[] = [
		{
			key: 'css',
			labelKey: 'CSS',
			icon: <Palette className="w-4 h-4" />,
			items: [
				{
					href: "/css/gradient",
					labelKey: "nav_gradient_generator",
					description: "gradient_generator_desc",
					icon: <Palette className="w-4 h-4" />,
				},
			],
		},
		{
			key: 'coder',
			labelKey: 'nav_coder',
			icon: <Code2 className="w-4 h-4" />,
			items: [
				{
					href: "/coder/base64",
					labelKey: "nav_base64",
					description: "nav_base64_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/url",
					labelKey: "nav_url_encoding",
					description: "nav_url_encoding_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/hash",
					labelKey: "nav_hash_calculator",
					description: "nav_hash_calculator_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/jwt",
					labelKey: "nav_jwt_tools",
					description: "nav_jwt_tools_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/qr",
					labelKey: "nav_qr_code",
					description: "nav_qr_code_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/hex",
					labelKey: "nav_hex_converter",
					description: "nav_hex_converter_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/json",
					labelKey: "nav_json_formatter",
					description: "nav_json_formatter_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
				{
					href: "/coder/image",
					labelKey: "nav_image_encoding",
					description: "nav_image_encoding_desc",
					icon: <Code2 className="w-4 h-4" />,
				},
			],
		},
		{
			key: 'cryption',
			labelKey: 'nav_cryption',
			icon: <Key className="w-4 h-4" />,
			items: [
				{
					href: "/cryption/keygen",
					labelKey: "nav_keygen",
					description: "nav_keygen_desc",
					icon: <Key className="w-4 h-4" />,
				},
			],
		},
	];

	const renderNavigationItem = (item: NavigationItem) => {
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
									? "text-primary" 
									: "text-muted-foreground"
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
	};

	return (
		<NavigationMenu>
			<NavigationMenuList>
				{navigationGroups.map((group) => (
					<NavigationMenuItem key={group.key}>
						<NavigationMenuTrigger className="flex items-center space-x-2">
							{/* 图标 */}
							<div className="text-muted-foreground">
								{group.icon}
							</div>
							<span className="hidden sm:inline-block">
								{group.key === 'css' ? 'CSS' : t(group.labelKey)}
							</span>
						</NavigationMenuTrigger>
						<NavigationMenuContent>
							<ul className="grid w-[320px] gap-2 p-3">
								{group.items.map(renderNavigationItem)}
							</ul>
						</NavigationMenuContent>
					</NavigationMenuItem>
				))}
			</NavigationMenuList>
		</NavigationMenu>
	);
}

export default Navigation;