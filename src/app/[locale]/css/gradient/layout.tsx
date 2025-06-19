import type { Metadata } from "next";
import {
  getNormalizedLocale,
  defaultLocale,
  supportedLocales,
  loadDictionaryByRoute,
} from "@/i18n/langMap";

export async function generateMetadata({
  params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  // 等待参数解析并标准化语言代码
  const resolvedParams = await params;
  const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

  // 根据当前路径动态加载对应语言的字典
  const dictionary = await loadDictionaryByRoute("/css/gradient", locale);

  // 标题和描述支持多语言
  const title =
    dictionary.meta.title
  const description =
    dictionary.meta.description
  const keywords =
    dictionary.meta.keywords

  // 构建基础URL
  const baseUrl = "https://tools.limgx.com";

  // 构建当前语言的URL (默认语言不需要语言前缀)
  const currentUrl =
    locale === defaultLocale 
      ? `${baseUrl}/dev/gradient` 
      : `${baseUrl}/${locale}/dev/gradient`;

  // 构建备用语言链接
  const languageAlternates: Record<string, string> = {};

  // 添加默认语言链接
  languageAlternates[defaultLocale] = `${baseUrl}/dev/gradient`;

  // 添加其他语言链接
  for (const lang of supportedLocales) {
    if (lang !== defaultLocale) {
      languageAlternates[lang] = `${baseUrl}/${lang}/dev/gradient`;
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
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: currentUrl,
      languages: languageAlternates,
    }
  };
}

export default function GradientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 