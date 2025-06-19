"use client";

import { GithubIcon } from "lucide-react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";

function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-primary/20 dark:border-primary/30 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* 左侧：Logo */}
					<div className="flex items-center">
						<Logo />
					</div>

					{/* 中间：导航 */}
					<div className="flex-1 flex justify-center">
						<Navigation />
					</div>

					{/* 右侧：GitHub链接和主题切换 */}
					<div className="flex items-center gap-3">
						{/* GitHub 链接 */}
						<a
							href="https://github.com/925558718/tools"
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center justify-center w-9 h-9 rounded-lg text-secondary/50 transition-all duration-200 hover:scale-105 hover:shadow-md hover:shadow-secondary/20 hover:border-secondary/50 dark:hover:border-secondary/40"
							title="View source on GitHub"
							aria-label="在GitHub上查看源代码"
						>
							<GithubIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
						</a>
						
						{/* 主题切换 */}
						<ThemeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
