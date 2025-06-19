"use client";

import { GithubIcon } from "lucide-react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import ThemeToggle from "./ThemeToggle";

function Header() {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/20 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/5">
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
							className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 transition-all duration-200 hover:scale-105"
							title="View source on GitHub"
							aria-label="在GitHub上查看源代码"
						>
							<GithubIcon className="w-5 h-5" />
							<span className="sr-only">在GitHub上查看源代码</span>
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
