import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {getNormalizedLocale,  defaultLocale, loadDictionaryByRoute} from './langMap';
 
export default getRequestConfig(async ({locale}) => {
  // 标准化语言代码，处理undefined情况
  const normalizedLocale = getNormalizedLocale(locale || defaultLocale);
  
  // 加载通用翻译
  const dictionary = await loadDictionaryByRoute("/", normalizedLocale);
  
  return {
    locale: normalizedLocale,
    messages: dictionary
  };
});

/**
 * 在服务器组件中获取翻译的辅助函数
 * @param pathname 当前路径
 * @param locale 语言代码
 * @returns 翻译字典
 */
export async function getTranslations(pathname: string, locale: string) {
  return await loadDictionaryByRoute(pathname, locale);
}

/**
 * 获取页面特定翻译的辅助函数
 * @param pagePath 页面路径，例如 '/css/gradient'
 * @param locale 语言代码
 * @returns 页面特定的翻译字典
 */
export async function getPageTranslations(pagePath: string, locale: string) {
  return await loadDictionaryByRoute(pagePath, locale);
}