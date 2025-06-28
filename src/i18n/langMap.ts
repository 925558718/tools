/**
 * 语言映射表 - 将各种语言变体映射到标准语言代码
 * 
 * 例如：'zh', 'zh-cn', 'zh-CN', 'zh_CN' 都映射到 'zh-CN'
 * 这样我们只需要维护标准语言代码对应的翻译文件
 */

// 支持的语言列表 - 用于路由和UI展示
export const supportedLocales = ['en', 'zh-CN', 'es', 'fr', 'de', 'ja', 'ru'] as const;
export type SupportedLocale = typeof supportedLocales[number];

// 默认语言
export const defaultLocale: SupportedLocale = 'en';

// 语言变体映射表
export const langVariantMap: Record<string, SupportedLocale> = {
  // 英语变体
  'en': 'en',
  'en-us': 'en',
  'en-US': 'en',
  'en_US': 'en',
  'en-gb': 'en',
  'en-GB': 'en',
  'en_GB': 'en',
  
  // 中文变体
  'zh': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh_CN': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh_Hans': 'zh-CN',
  'zh-SG': 'zh-CN',
  'zh-HK': 'zh-CN',
  'zh-TW': 'zh-CN',
  
  // 西班牙语变体
  'es': 'es',
  'es-ES': 'es',
  'es_ES': 'es',
  'es-MX': 'es',
  'es-419': 'es',
  
  // 法语变体
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr_FR': 'fr',
  'fr-CA': 'fr',
  'fr_CA': 'fr',
  
  // 德语变体
  'de': 'de',
  'de-DE': 'de',
  'de_DE': 'de',
  
  // 日语变体
  'ja': 'ja',
  'ja-JP': 'ja',
  'ja_JP': 'ja',
  
  // 俄语变体
  'ru': 'ru',
  'ru-RU': 'ru',
  'ru_RU': 'ru'
};

/**
 * 获取规范化的语言代码
 * @param locale 原始语言代码
 * @returns 规范化的语言代码，如果不支持则返回默认语言
 */
export function getNormalizedLocale(locale: string): SupportedLocale {
  // 转为小写并查找映射
  console.log(locale);
  const normalizedLocale = locale.toLowerCase();
  
  // 尝试直接匹配
  if (normalizedLocale in langVariantMap) {
    return langVariantMap[normalizedLocale];
  }
  
  // 尝试匹配语言前缀（例如"zh-anything"都归为"zh-CN"）
  const prefix = normalizedLocale.split(/[-_]/)[0];
  if (prefix in langVariantMap) {
    return langVariantMap[prefix];
  }
  
  // 不支持的语言返回默认语言
  return defaultLocale;
}
