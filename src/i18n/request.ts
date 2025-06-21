import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
	// Typically corresponds to the `[locale]` segment
	const requested = await requestLocale;
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale;
	const messages = {
		...(await import(`public/messages/${locale}/metadata.json`)).default,
		...(await import(`public/messages/${locale}/home.json`)).default,
		...(await import(`public/messages/${locale}/coder.json`)).default,
		...(await import(`public/messages/${locale}/css.json`)).default,
		...(await import(`public/messages/${locale}/navigation.json`)).default,
		...(await import(`public/messages/${locale}/common.json`)).default,
		// 如果你有其他需要在全局布局中可用的命名空间，也可以在这里导入
		// ...(await import(`public/messages/${locale}/another_global_namespace.json`)).default,
	};
	return {
		locale,
		messages,
	};
});
