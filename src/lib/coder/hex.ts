/**
 * 十六进制转换工具
 */

export interface HexResult {
  success: boolean;
  data?: string;
  error?: string;
}

export type ConversionMode = 'text-to-hex' | 'hex-to-text' | 'text-to-binary' | 'binary-to-text';

/**
 * 文本转十六进制
 */
export function textToHex(text: string): HexResult {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const result = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
}

/**
 * 十六进制转文本
 */
export function hexToText(hex: string): HexResult {
  try {
    const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
    if (cleanHex.length % 2 !== 0) {
      return { success: false, error: 'Invalid hexadecimal format' };
    }
    
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = Number.parseInt(cleanHex.substr(i, 2), 16);
      if (Number.isNaN(byte)) {
        return { success: false, error: 'Invalid hexadecimal format' };
      }
      bytes[i / 2] = byte;
    }
    
    const decoder = new TextDecoder('utf-8');
    const result = decoder.decode(bytes);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
}

/**
 * 文本转二进制
 */
export function textToBinary(text: string): HexResult {
  try {
    // 检查是否是纯数字（包括小数）
    const numberRegex = /^-?\d+(\.\d+)?$/;
    if (numberRegex.test(text.trim())) {
      // 如果是数字，转换为数字的二进制
      const num = Number(text);
      if (Number.isInteger(num)) {
        return { success: true, data: num.toString(2) };
      }
      // 对于小数，显示整数部分的二进制
      return { success: true, data: Math.floor(num).toString(2) };
    }
    
    // 如果是文本，转换为ASCII码的二进制
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const result = Array.from(bytes).map(byte => byte.toString(2).padStart(8, '0')).join(' ');
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
}

/**
 * 二进制转文本
 */
export function binaryToText(binary: string): HexResult {
  try {
    const cleanBinary = binary.replace(/[^01]/g, '');
    if (cleanBinary.length % 8 !== 0) {
      return { success: false, error: 'Invalid binary format' };
    }
    
    const bytes = new Uint8Array(cleanBinary.length / 8);
    for (let i = 0; i < cleanBinary.length; i += 8) {
      const byte = Number.parseInt(cleanBinary.substr(i, 8), 2);
      if (Number.isNaN(byte)) {
        return { success: false, error: 'Invalid binary format' };
      }
      bytes[i / 8] = byte;
    }
    
    const decoder = new TextDecoder('utf-8');
    const result = decoder.decode(bytes);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    };
  }
}

/**
 * 通用转换函数
 */
export function convertText(input: string, mode: ConversionMode): HexResult {
  switch (mode) {
    case 'text-to-hex':
      return textToHex(input);
    case 'hex-to-text':
      return hexToText(input);
    case 'text-to-binary':
      return textToBinary(input);
    case 'binary-to-text':
      return binaryToText(input);
    default:
      return { success: false, error: 'Unsupported conversion mode' };
  }
}

/**
 * 验证十六进制格式
 */
export function isValidHex(hex: string): boolean {
  return /^[0-9a-fA-F]+$/.test(hex) && hex.length % 2 === 0;
}

/**
 * 验证二进制格式
 */
export function isValidBinary(binary: string): boolean {
  return /^[01]+$/.test(binary) && binary.length % 8 === 0;
} 