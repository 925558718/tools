
import styles from '@/components/animation/animation.module.scss';
import { NextIntlClientProvider } from "next-intl";
import {
	getNormalizedLocale,
	defaultLocale,
	loadDictionaryByRoute,
} from "@/i18n/langMap";

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 加载首页特定的翻译
	const dictionary = await loadDictionaryByRoute("/", locale);

	return (
		<NextIntlClientProvider locale={locale} messages={dictionary}>
			<main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
				<div className="text-center max-w-4xl mx-auto">
					<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
						{dictionary.hero_title || "Free Image Processing Tools"}
					</h1>
					<p className="text-xl md:text-2xl text-muted-foreground mb-12">
						{dictionary.hero_subtitle || "Professional tools for designers and developers"}
					</p>
					
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
						<div className="bg-card/50 backdrop-blur-sm border rounded-lg p-6 hover:bg-card/70 transition-colors">
							<h3 className="text-xl font-semibold mb-2">
								{dictionary.nav_gradient_generator || "Gradient Generator"}
							</h3>
							<p className="text-muted-foreground">
								{dictionary.gradient_generator_desc || "Create beautiful CSS gradients with live preview"}
							</p>
						</div>
						
						{/* 可以添加更多工具卡片 */}
					</div>
				</div>
			</main>
		</NextIntlClientProvider>
	);
}
