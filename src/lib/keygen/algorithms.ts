import * as jose from 'jose';

/**
 * 生成RSA密钥对
 */
export const generateRSAKeyPair = async (keySize = 2048) => {
  const keyPair = await jose.generateKeyPair('RS256', {
    modulusLength: keySize,
    extractable: true
  });
  return keyPair;
};

/**
 * 生成ECDSA密钥对
 */
export const generateECDSAKeyPair = async (curve = 'P-256') => {
  const keyPair = await jose.generateKeyPair('ES256', {
    crv: curve,
    extractable: true
  });
  return keyPair;
};

/**
 * 生成EdDSA密钥对
 */
export const generateEdDSAKeyPair = async () => {
  const keyPair = await jose.generateKeyPair('EdDSA', {
    extractable: true
  });
  return keyPair;
};

/**
 * 生成指定算法的密钥对
 */
export const generateKeyPairByAlgorithm = async (algorithm: string, options: any = {}) => {
  switch (algorithm) {
    case 'RS256':
    case 'RS384':
    case 'RS512':
      return await generateRSAKeyPair(options.keySize || 2048);
    
    case 'ES256':
      return await generateECDSAKeyPair('P-256');
    case 'ES384':
      return await generateECDSAKeyPair('P-384');
    case 'ES512':
      return await generateECDSAKeyPair('P-521');
    
    case 'EdDSA':
      return await generateEdDSAKeyPair();
    
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}; 