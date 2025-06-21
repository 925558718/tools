import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getNormalizedLocale, defaultLocale, supportedLocales } from "@/i18n/langMap";

export async function generateMetadata({
	params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 用 next-intl/server 的 getTranslations 获取翻译
	const t = await getTranslations("css.gradient");

	// 标题和描述支持多语言
	const title = t("meta.title") || t("title") || "CSS Gradient Generator";
	const description = t("meta.description") || t("subtitle") || "Create beautiful CSS gradients with live preview";
	const keywords = t("meta.keywords") || "CSS gradient, gradient generator, tailwind gradients";

	// 构建基础URL
	const baseUrl = "https://tools.limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale
			? `${baseUrl}/css/gradient`
			: `${baseUrl}/${locale}/css/gradient`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};
	languageAlternates[defaultLocale] = `${baseUrl}/css/gradient`;
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}/css/gradient`;
		}
	}

	return {
		title,
		description,
		keywords,
		authors: [{ name: "tools.limgx.com" }],
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		alternates: {
			canonical: currentUrl,
			languages: languageAlternates,
		},
	};
}

export default function GradientLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
