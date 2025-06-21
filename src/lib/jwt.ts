import * as jose from 'jose';

export interface DecodedToken {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  error?: string;
}

export interface TokenGenerationResult {
  token: string;
  success: boolean;
  error?: string;
}

/**
 * 解码JWT令牌
 */
export const decodeJWT = (token: string, secret?: string): DecodedToken => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('无效的JWT格式');
    }

    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    const signature = parts[2];

    let isValid = false;
    let error = '';

    // 只有在提供了secret时才进行签名验证
    if (secret?.trim()) {
      try {
        // 对于HS256/HS384/HS512算法，使用HMAC密钥
        const key = new TextEncoder().encode(secret);
        jose.jwtVerify(token, key);
        isValid = true;
      } catch (verifyError) {
        isValid = false;
        error = '签名验证失败';
      }
    }

    return {
      header,
      payload,
      signature,
      isValid,
      error
    };
  } catch (error) {
    throw new Error('令牌解析失败');
  }
};

/**
 * 生成JWT令牌
 */
export const generateJWT = async (
  payload: string, 
  secret: string, 
  algorithm: string
): Promise<TokenGenerationResult> => {
  try {
    const payloadObj = JSON.parse(payload);
    
    if (algorithm.startsWith('HS')) {
      // HMAC算法 - 使用对称密钥
      const key = new TextEncoder().encode(secret);
      const token = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: algorithm })
        .sign(key);
      return { token, success: true };
    }
    
    return { 
      token: '', 
      success: false, 
      error: '不支持的算法，请使用HMAC算法' 
    };
  } catch (error) {
    return { 
      token: '', 
      success: false, 
      error: '令牌生成失败' 
    };
  }
};

/**
 * 使用私钥生成JWT令牌（非对称加密）
 */
export const generateJWTWithPrivateKey = async (
  payload: string,
  privateKey: string,
  algorithm: string
): Promise<TokenGenerationResult> => {
  try {
    const payloadObj = JSON.parse(payload);
    
    if (algorithm.startsWith('RS')) {
      // RSA算法
      const key = await jose.importPKCS8(privateKey, algorithm);
      const token = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: algorithm })
        .sign(key);
      return { token, success: true };
    }
    
    if (algorithm.startsWith('ES')) {
      // ECDSA算法
      const key = await jose.importPKCS8(privateKey, algorithm);
      const token = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: algorithm })
        .sign(key);
      return { token, success: true };
    }
    
    if (algorithm === 'EdDSA') {
      // EdDSA算法
      const key = await jose.importPKCS8(privateKey, algorithm);
      const token = await new jose.SignJWT(payloadObj)
        .setProtectedHeader({ alg: algorithm })
        .sign(key);
      return { token, success: true };
    }
    
    return { 
      token: '', 
      success: false, 
      error: '不支持的算法' 
    };
  } catch (error) {
    return { 
      token: '', 
      success: false, 
      error: '令牌生成失败' 
    };
  }
};

/**
 * 使用公钥验证JWT令牌（非对称加密）
 */
export const verifyJWTWithPublicKey = async (
  token: string,
  publicKey: string,
  algorithm: string
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    if (algorithm.startsWith('RS')) {
      // RSA算法
      const key = await jose.importSPKI(publicKey, algorithm);
      await jose.jwtVerify(token, key);
      return { isValid: true };
    }
    
    if (algorithm.startsWith('ES')) {
      // ECDSA算法
      const key = await jose.importSPKI(publicKey, algorithm);
      await jose.jwtVerify(token, key);
      return { isValid: true };
    }
    
    if (algorithm === 'EdDSA') {
      // EdDSA算法
      const key = await jose.importSPKI(publicKey, algorithm);
      await jose.jwtVerify(token, key);
      return { isValid: true };
    }
    
    return { isValid: false, error: '不支持的算法' };
  } catch (error) {
    return { isValid: false, error: '签名验证失败' };
  }
};

/**
 * 检查令牌是否过期
 */
export const isTokenExpired = (exp: number): boolean => {
  return Date.now() / 1000 > exp;
};

/**
 * 格式化时间戳
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
}; 