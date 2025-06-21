import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Open_Sans, Inter } from "next/font/google";
import clsx from "clsx";
import { Toaster } from "@/components/shadcn/sonner";
import { Provider as JotaiProvider } from "jotai";
import { NextIntlClientProvider } from "next-intl";
import {

	supportedLocales,
	loadDictionaryByRoute,
	getNormalizedLocale,
} from "@/i18n/langMap";
import BugsnagErrorBoundary from "@/components/Bugsnap";
import { headers } from "next/headers";


const Opensans = Open_Sans({
	subsets: ["latin"],
	variable: "--font_os",
});

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	weight: ["400", "500", "600", "700", "800", "900"],
});

// 动态生成元数据
export async function generateMetadata({
	params,
}: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	// 等待参数解析并标准化语言代码
	const defaultLocale = "en";
	const resolvedParams = await params;
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);

	// 获取当前路径
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") || "/";

	// 根据当前路径加载对应的翻译
	const dictionary = await loadDictionaryByRoute(pathname, locale);

	// 标题和描述支持多语言
	const title = dictionary.meta_title || dictionary.meta?.title || "Developer Tools";
	const description = dictionary.meta_description || dictionary.meta?.description || "Free online developer tools for software development";

	// 构建基础URL
	const baseUrl = "https://limgx.com";

	// 构建当前语言的URL (默认语言不需要语言前缀)
	const currentUrl =
		locale === defaultLocale ? baseUrl : `${baseUrl}/${locale}`;

	// 构建备用语言链接
	const languageAlternates: Record<string, string> = {};

	// 添加默认语言链接
	languageAlternates[defaultLocale] = baseUrl;

	// 添加其他语言链接
	for (const lang of supportedLocales) {
		if (lang !== defaultLocale) {
			languageAlternates[lang] = `${baseUrl}/${lang}`;
		}
	}

	return {
		title,
		description,
		keywords: dictionary.meta_keywords || dictionary.meta?.keywords,
		authors: [{ name: "limgx.com" }],
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

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}>) {
	// 等待参数解析并标准化语言代码
	const resolvedParams = await params;
	const defaultLocale = "en";
	const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);


	return (
		<html lang={locale} suppressHydrationWarning>
			<head>
				{/* 多语言SEO优化 */}
				<meta httpEquiv="content-language" content={locale} />
				<script
					src="https://analytics.ahrefs.com/analytics.js"
					data-key="fAy0GhLZ8HwbJfkrQ3zMOw"
					async
				/>
			</head>
			<body
				className={clsx(
					"bg-background text-foreground",
					Opensans.variable,
					inter.variable,
				)}
			>
				<BugsnagErrorBoundary>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						disableTransitionOnChange
						enableSystem={false}
					>
						<NextIntlClientProvider>
							<JotaiProvider>
								<Header />
								{/* 背景渐变层 - 使用主题色 */}
								<div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5 dark:from-background dark:via-primary/10 dark:to-secondary/10"/>

								{/* 装饰性背景元素 - 使用主题色 */}
								<div className="absolute inset-0 overflow-hidden">
									<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"/>
									<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl"/>
									<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl"/>
								</div>
								
								{/* 页面内容 */}
								{children}
								
								{/* Footer独立显示 */}
								<Footer />
								
								<Toaster />
							</JotaiProvider>
						</NextIntlClientProvider>
					</ThemeProvider>
				</BugsnagErrorBoundary>
				<GoogleAnalytics gaId="G-89618T8EX2" />
			</body>
		</html>
	);
}