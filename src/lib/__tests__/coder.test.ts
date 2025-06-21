/**
 * Coder 模块测试
 */

import { describe, test, expect } from 'vitest';
import { 
  encodeBase64, 
  decodeBase64, 
  isValidBase64,
  encodeUrl,
  decodeUrl,
  isValidUrl,
  textToHex,
  hexToText,
  isValidHex,
  formatJSON,
  minifyJSON,
  validateJSON,
  isValidJSON,
  validateQRContent,
  formatFileSize,
  validateImageFile
} from '../coder';

describe('Base64 工具', () => {
  test('编码和解码', () => {
    const original = 'Hello, 世界!';
    const encoded = encodeBase64(original);
    expect(encoded.success).toBe(true);
    expect(encoded.data).toBeDefined();
    
    if (encoded.data) {
      const decoded = decodeBase64(encoded.data);
      expect(decoded.success).toBe(true);
      expect(decoded.data).toBe(original);
    }
  });

  test('验证Base64格式', () => {
    expect(isValidBase64('SGVsbG8=')).toBe(true);
    expect(isValidBase64('invalid')).toBe(false);
  });
});

describe('URL 工具', () => {
  test('编码和解码', () => {
    const original = 'Hello 世界!';
    const encoded = encodeUrl(original);
    expect(encoded.success).toBe(true);
    expect(encoded.data).toBe('Hello%20%E4%B8%96%E7%95%8C!');
    
    if (encoded.data) {
      const decoded = decodeUrl(encoded.data);
      expect(decoded.success).toBe(true);
      expect(decoded.data).toBe(original);
    }
  });

  test('验证URL格式', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('not-a-url')).toBe(false);
  });
});

describe('十六进制工具', () => {
  test('文本转十六进制', () => {
    const result = textToHex('Hello');
    expect(result.success).toBe(true);
    expect(result.data).toBe('48656c6c6f');
  });

  test('十六进制转文本', () => {
    const result = hexToText('48656c6c6f');
    expect(result.success).toBe(true);
    expect(result.data).toBe('Hello');
  });

  test('验证十六进制格式', () => {
    expect(isValidHex('48656c6c6f')).toBe(true);
    expect(isValidHex('invalid')).toBe(false);
    expect(isValidHex('48656c6c6')).toBe(false); // 奇数长度
  });
});

describe('JSON 工具', () => {
  const testJson = '{"name":"张三","age":25}';

  test('格式化JSON', () => {
    const result = formatJSON(testJson);
    expect(result.success).toBe(true);
    expect(result.data).toContain('"name"');
    expect(result.data).toContain('"张三"');
  });

  test('压缩JSON', () => {
    const formatted = formatJSON(testJson);
    if (formatted.data) {
      const minified = minifyJSON(formatted.data);
      expect(minified.success).toBe(true);
      expect(minified.data).toBe(testJson);
    }
  });

  test('验证JSON', () => {
    const result = validateJSON(testJson);
    expect(result.isValid).toBe(true);
    expect(result.size).toBeGreaterThan(0);
  });

  test('检查JSON有效性', () => {
    expect(isValidJSON(testJson)).toBe(true);
    expect(isValidJSON('invalid json')).toBe(false);
  });
});

describe('QR码工具', () => {
  test('验证QR码内容', () => {
    expect(validateQRContent('https://example.com')).toBe(true);
    expect(validateQRContent('123456789')).toBe(true);
    expect(validateQRContent('Hello World')).toBe(true);
    expect(validateQRContent('')).toBe(false);
  });
});

describe('图像工具', () => {
  test('格式化文件大小', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  test('验证图像文件', () => {
    // 模拟文件对象
    const mockFile = {
      type: 'image/png',
      size: 1024 * 1024 // 1MB
    } as File;

    expect(validateImageFile(mockFile)).toBe(true);
  });
}); 