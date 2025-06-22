"use client";

import { useTranslations } from 'next-intl';

export default function HomePageContent() {
	const t = useTranslations();

	return (
		<main className="min-h-screen flex flex-col items-center justify-center -mt-20">
			<div className="text-center max-w-4xl mx-auto">
				<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent mb-6 animate-gradient-x">
					{t('hero_title')}
				</h1>
				<p className="text-xl md:text-2xl text-muted-foreground mb-12">
					{t('hero_subtitle')}
				</p>
			</div>
		</main>
	);
} 