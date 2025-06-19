"use client";

import { useTranslations } from 'next-intl';

export default function HomePageContent() {
	const t = useTranslations();

	return (
		<main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
			<div className="text-center max-w-4xl mx-auto">
				<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-6 animate-gradient-x">
					{t('hero_title')}
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground mb-12">
					{t('hero_subtitle')}
				</p>
				
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
					<div className="group bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-6 hover:bg-card/70 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer">
						<div className="flex items-center space-x-3 mb-3">
							<div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
								<svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
									<rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth={1.5} />
									<circle cx="8" cy="8" r="1.5" fill="currentColor" />
									<circle cx="16" cy="16" r="1.5" fill="currentColor" />
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 8L16 16" strokeDasharray="2 2" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
								{t('nav_gradient_generator')}
							</h3>
						</div>
						<p className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
							{t('gradient_generator_desc')}
						</p>
					</div>
					
					{/* 可以添加更多工具卡片 */}
				</div>
			</div>
		</main>
	);
} 