import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import {getNormalizedLocale,  defaultLocale, loadI18nDictionary} from './langMap';
 
export default getRequestConfig(async ({requestLocale}) => {
  // 获取请求的语言
  const requested = await requestLocale;
  console.log('Requested locale:', requested);
  
  // 标准化语言代码 - 处理可能的undefined情况
  const locale = requested ? getNormalizedLocale(requested) : defaultLocale;
  
  // 加载对应的字典
  const messages = await loadI18nDictionary("main", locale);
  
  return {
    locale,
    messages
  };
});