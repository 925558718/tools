
import { NextIntlClientProvider } from "next-intl";
import {
	getNormalizedLocale,
	defaultLocale,
	loadDictionaryByRoute,
} from "@/i18n/langMap";
import HomePageContent from './HomePageContent';

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
			<HomePageContent />
		</NextIntlClientProvider>
	);
}
