/**
 * URL 编码解码工具
 */

export interface UrlResult {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * URL编码
 */
export function encodeUrl(text: string): UrlResult {
  try {
    const result = encodeURIComponent(text);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Encoding failed' 
    };
  }
}

/**
 * URL解码
 */
export function decodeUrl(text: string): UrlResult {
  try {
    const result = decodeURIComponent(text);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Decoding failed' 
    };
  }
}

/**
 * 验证URL格式
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查是否是完整的URL（包含协议）
 */
export function isCompleteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * 提取URL参数
 */
export function extractUrlParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

/**
 * 构建URL参数
 */
export function buildUrlParams(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
} 