/**
 * Base64 编码解码工具
 */

export interface Base64Result {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * 编码文本为Base64
 */
export function encodeBase64(text: string): Base64Result {
  try {
    const result = btoa(unescape(encodeURIComponent(text)));
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Encoding failed' 
    };
  }
}

/**
 * 解码Base64为文本
 */
export function decodeBase64(text: string): Base64Result {
  try {
    const result = decodeURIComponent(escape(atob(text)));
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Decoding failed' 
    };
  }
}

/**
 * 验证Base64字符串是否有效
 */
export function isValidBase64(text: string): boolean {
  // 严格的base64正则（支持标准和带=补位的）
  const base64Regex = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  if (!base64Regex.test(text)) return false;
  try {
    atob(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从文件读取Base64
 */
export function fileToBase64(file: File): Promise<Base64Result> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // 移除 data:image/...;base64, 前缀
      const base64 = result.split(',')[1];
      resolve({ success: true, data: base64 });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'File reading failed' });
    };
    reader.readAsDataURL(file);
  });
} 