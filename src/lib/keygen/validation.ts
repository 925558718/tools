import * as jose from 'jose';
import { KeyPair } from './index';

/**
 * 验证密钥对格式
 */
export const validateKeyPair = (keyPair: KeyPair): boolean => {
  try {
    // 基本格式检查
    if (!keyPair.privateKey || !keyPair.publicKey) {
      return false;
    }

    // 根据格式进行验证
    switch (keyPair.format) {
      case 'PEM':
        return validatePEMFormat(keyPair);
      case 'JWK':
        return validateJWKFormat(keyPair);
      case 'DER':
        return validateDERFormat(keyPair);
      default:
        return false;
    }
  } catch (error) {
    return false;
  }
};

/**
 * 验证PEM格式
 */
const validatePEMFormat = (keyPair: KeyPair): boolean => {
  const privateKeyRegex = /-----BEGIN PRIVATE KEY-----[\s\S]*-----END PRIVATE KEY-----/;
  const publicKeyRegex = /-----BEGIN PUBLIC KEY-----[\s\S]*-----END PUBLIC KEY-----/;
  
  return privateKeyRegex.test(keyPair.privateKey) && publicKeyRegex.test(keyPair.publicKey);
};

/**
 * 验证JWK格式
 */
const validateJWKFormat = (keyPair: KeyPair): boolean => {
  try {
    JSON.parse(keyPair.privateKey);
    JSON.parse(keyPair.publicKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * 验证DER格式
 */
const validateDERFormat = (keyPair: KeyPair): boolean => {
  // DER格式是十六进制字符串
  const hexRegex = /^[0-9a-fA-F]+$/;
  return hexRegex.test(keyPair.privateKey) && hexRegex.test(keyPair.publicKey);
};

/**
 * 测试密钥对功能
 */
export const testKeyPair = async (keyPair: KeyPair): Promise<boolean> => {
  try {
    // 导入密钥
    const importedKeys = await importKeyPair(keyPair);
    if (!importedKeys) return false;

    // 创建测试数据
    const testData = new TextEncoder().encode('test message');
    
    // 使用私钥签名
    const signature = await jose.SignJWT({ test: 'data' })
      .setProtectedHeader({ alg: keyPair.algorithm })
      .sign(importedKeys.privateKey);

    // 使用公钥验证
    const verified = await jose.jwtVerify(signature, importedKeys.publicKey);
    
    return verified.payload.test === 'data';
  } catch (error) {
    return false;
  }
};

/**
 * 导入密钥对
 */
const importKeyPair = async (keyPair: KeyPair) => {
  try {
    switch (keyPair.format) {
      case 'PEM':
        const privateKey = await jose.importPKCS8(keyPair.privateKey);
        const publicKey = await jose.importSPKI(keyPair.publicKey);
        return { privateKey, publicKey };
      
      case 'JWK':
        const privateJWK = await jose.importJWK(JSON.parse(keyPair.privateKey));
        const publicJWK = await jose.importJWK(JSON.parse(keyPair.publicKey));
        return { privateKey: privateJWK, publicKey: publicJWK };
      
      default:
        return null;
    }
  } catch (error) {
    return null;
  }
}; 