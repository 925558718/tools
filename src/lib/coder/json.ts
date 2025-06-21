/**
 * JSON 处理工具
 */

export interface JsonResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface JsonValidationResult {
  isValid: boolean;
  error?: string;
  size: number;
}

export type JsonMode = 'format' | 'minify' | 'validate';

/**
 * 格式化JSON
 */
export function formatJSON(json: string, indent = 2): JsonResult {
  try {
    const parsed = JSON.parse(json);
    const result = JSON.stringify(parsed, null, indent);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? `JSON解析错误: ${error.message}` : '无效的JSON格式' 
    };
  }
}

/**
 * 压缩JSON
 */
export function minifyJSON(json: string): JsonResult {
  try {
    const parsed = JSON.parse(json);
    const result = JSON.stringify(parsed);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? `JSON解析错误: ${error.message}` : '无效的JSON格式' 
    };
  }
}

/**
 * 验证JSON
 */
export function validateJSON(json: string): JsonValidationResult {
  try {
    const parsed = JSON.parse(json);
    const size = JSON.stringify(parsed).length;
    return { isValid: true, size };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : '未知错误',
      size: 0
    };
  }
}

/**
 * 通用JSON处理函数
 */
export function processJSON(json: string, mode: JsonMode, indent = 2): JsonResult {
  switch (mode) {
    case 'format':
      return formatJSON(json, indent);
    case 'minify':
      return minifyJSON(json);
    case 'validate': {
      const validation = validateJSON(json);
      if (validation.isValid) {
        return { 
          success: true, 
          data: `✅ JSON格式有效\n字符数: ${validation.size}` 
        };
      }
      return { 
        success: false, 
        error: `❌ JSON格式无效\n错误详情: ${validation.error}` 
      };
    }
    default:
      return { success: false, error: '不支持的JSON处理模式' };
  }
}

/**
 * 检查字符串是否为有效的JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全解析JSON
 */
export function safeParseJSON(json: string): any {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * 美化JSON对象
 */
export function beautifyJSON(obj: any, indent = 2): string {
  return JSON.stringify(obj, null, indent);
}

/**
 * 从文件读取JSON
 */
export function fileToJSON(file: File): Promise<JsonResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve({ success: true, data: content });
    };
    reader.onerror = () => {
      resolve({ success: false, error: '文件读取失败' });
    };
    reader.readAsText(file);
  });
} 