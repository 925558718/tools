/**
 * 哈希计算工具
 */

export interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

export interface HashOptions {
  salt?: string;
}

export interface HashAlgorithm {
  name: string;
  func: (input: string) => any;
  description: string;
}

// 注意：这里需要在实际使用时导入 CryptoJS
// import CryptoJS from 'crypto-js';

/**
 * 计算单个哈希值
 */
export function calculateHash(
  input: string, 
  algorithm: HashAlgorithm, 
  options: HashOptions = {}
): HashResult {
  const { salt } = options;
  let hash: any;
  
  if (salt) {
    hash = algorithm.func(input + salt);
  } else {
    hash = algorithm.func(input);
  }
  
  return {
    algorithm: algorithm.name,
    hash: hash.toString(),
    length: hash.toString().length
  };
}

/**
 * 计算多个哈希值
 */
export function calculateMultipleHashes(
  input: string, 
  algorithms: HashAlgorithm[], 
  options: HashOptions = {}
): HashResult[] {
  return algorithms.map(algorithm => calculateHash(input, algorithm, options));
}

/**
 * 验证哈希值格式
 */
export function isValidHash(hash: string, algorithm: string): boolean {
  const patterns: Record<string, RegExp> = {
    'MD5': /^[a-fA-F0-9]{32}$/,
    'SHA1': /^[a-fA-F0-9]{40}$/,
    'SHA256': /^[a-fA-F0-9]{64}$/,
    'SHA512': /^[a-fA-F0-9]{128}$/,
    'RIPEMD160': /^[a-fA-F0-9]{40}$/,
    'SHA3': /^[a-fA-F0-9]{64}$/
  };
  
  const pattern = patterns[algorithm];
  return pattern ? pattern.test(hash) : true;
}

/**
 * 从文件读取内容
 */
export function fileToText(file: File): Promise<{ success: boolean; data?: string; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve({ success: true, data: result });
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'File reading failed' });
    };
    reader.readAsText(file);
  });
} 