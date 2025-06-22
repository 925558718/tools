import { SignJWT, jwtVerify, decodeJwt, importJWK, importPKCS8, importSPKI } from 'jose';
import type { JWK } from 'jose';

export interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

export interface JWTPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface JWTResult {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

export type JWTAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'EdDSA';

export interface GenerateJWTOptions {
  algorithm: JWTAlgorithm;
  secret?: string;
  privateKey?: string;
  header?: Partial<JWTHeader>;
  payload: JWTPayload;
}

export interface DecodeJWTOptions {
  token: string;
  secret?: string;
  publicKey?: string;
  algorithms?: JWTAlgorithm[];
}

/**
 * Base64URL解码辅助函数
 */
function base64UrlDecode(str: string): string {
  // 替换URL安全字符
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // 添加padding
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  
  try {
    // 尝试使用atob
    return atob(padded);
  } catch {
    // 如果atob不可用，使用Buffer（Node.js环境）
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf8');
    }
    throw new Error('Unable to decode base64 string');
  }
}

/**
 * 检测密钥格式
 */
function detectKeyFormat(key: string): 'JWK' | 'PEM' | 'UNKNOWN' {
  const cleaned = key.trim();
  
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    return 'JWK';
  }
  
  // 更宽松的PEM检测
  if (cleaned.includes('-----BEGIN') || cleaned.includes('-----END') || 
      cleaned.includes('PRIVATE KEY') || cleaned.includes('PUBLIC KEY')) {
    return 'PEM';
  }
  
  return 'UNKNOWN';
}

/**
 * 清理和标准化PEM格式
 */
function normalizePEMFormat(key: string): string {
  const cleaned = key.trim();
  
  // 如果已经是标准PEM格式，直接返回
  if (cleaned.includes('-----BEGIN') && cleaned.includes('-----END')) {
    return cleaned;
  }
  
  // 如果是base64格式，转换为PEM
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
    // 尝试检测是私钥还是公钥（这里假设是私钥）
    return `-----BEGIN PRIVATE KEY-----\n${cleaned}\n-----END PRIVATE KEY-----`;
  }
  
  return cleaned;
}

/**
 * 清理和验证PEM格式
 */
function validatePEMFormat(key: string): string {
  const cleaned = key.trim();
  
  // 检查是否包含必要的PEM标记
  const hasBegin = cleaned.includes('-----BEGIN');
  const hasEnd = cleaned.includes('-----END');
  const hasPrivateKey = cleaned.includes('PRIVATE KEY');
  const hasPublicKey = cleaned.includes('PUBLIC KEY');
  
  if (!hasBegin && !hasPrivateKey && !hasPublicKey) {
    throw new Error('Invalid PEM format: missing BEGIN marker or key type identifier');
  }
  
  if (!hasEnd && !hasPrivateKey && !hasPublicKey) {
    throw new Error('Invalid PEM format: missing END marker or key type identifier');
  }
  
  // 检查base64内容格式
  const lines = cleaned.split('\n');
  const contentLines = lines.filter(line => 
    !line.startsWith('-----') && 
    line.trim().length > 0
  );
  
  if (contentLines.length === 0) {
    throw new Error('Invalid PEM format: missing key content');
  }
  
  // 验证base64格式
  for (const line of contentLines) {
    if (!/^[A-Za-z0-9+/=]+$/.test(line.trim())) {
      throw new Error('Invalid PEM format: key content is not valid base64 encoding');
    }
  }
  
  return cleaned;
}

/**
 * 清理和验证JWK格式
 */
function validateJWKFormat(key: string): any {
  const cleaned = key.trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`Invalid JWK format: ${error instanceof Error ? error.message : 'JSON parsing failed'}`);
  }
}

/**
 * 根据算法获取正确的密钥导入函数
 */
function getKeyImportFunction(algorithm: string) {
  if (algorithm.startsWith('RS')) {
    return { privateKey: importPKCS8, publicKey: importSPKI };
  }
  if (algorithm.startsWith('ES')) {
    return { privateKey: importPKCS8, publicKey: importSPKI };
  }
  if (algorithm === 'EdDSA') {
    return { privateKey: importPKCS8, publicKey: importSPKI };
  }
  throw new Error(`Unsupported algorithm: ${algorithm}`);
}

/**
 * 检测密钥类型
 */
function detectKeyType(key: string): 'RSA' | 'ECDSA' | 'EdDSA' | 'UNKNOWN' {
  const cleaned = key.trim();
  
  // 检查PEM格式的密钥类型
  if (cleaned.includes('-----BEGIN PRIVATE KEY-----')) {
    // PKCS#8格式，需要进一步检测
    const content = cleaned.replace(/-----BEGIN PRIVATE KEY-----/, '')
                          .replace(/-----END PRIVATE KEY-----/, '')
                          .replace(/\s/g, '');
    
    try {
      // 解码base64并检查OID
      const decoded = atob(content);
      // 这里可以添加更详细的OID检测
      // 暂时返回UNKNOWN，让jose库处理
      return 'UNKNOWN';
    } catch {
      return 'UNKNOWN';
    }
  }
  
  // 检查JWK格式
  if (cleaned.startsWith('{')) {
    try {
      const jwk = JSON.parse(cleaned);
      if (jwk.kty === 'RSA') return 'RSA';
      if (jwk.kty === 'EC') return 'ECDSA';
      if (jwk.kty === 'OKP') return 'EdDSA';
    } catch {
      return 'UNKNOWN';
    }
  }
  
  return 'UNKNOWN';
}

/**
 * 验证算法和密钥类型匹配
 */
function validateAlgorithmKeyMatch(algorithm: string, key: string): void {
  const keyType = detectKeyType(key);
  
  if (algorithm.startsWith('RS') && keyType !== 'RSA' && keyType !== 'UNKNOWN') {
    throw new Error(`Algorithm ${algorithm} requires RSA key, but detected ${keyType} key`);
  }
  
  if (algorithm.startsWith('ES') && keyType !== 'ECDSA' && keyType !== 'UNKNOWN') {
    throw new Error(`Algorithm ${algorithm} requires ECDSA key, but detected ${keyType} key`);
  }
  
  if (algorithm === 'EdDSA' && keyType !== 'EdDSA' && keyType !== 'UNKNOWN') {
    throw new Error(`Algorithm ${algorithm} requires EdDSA key, but detected ${keyType} key`);
  }
}

/**
 * 生成JWT令牌
 */
export async function generateJWT(options: GenerateJWTOptions): Promise<string> {
  const { algorithm, secret, privateKey, header = {}, payload } = options;

  try {
    let key: any;

    if (algorithm.startsWith('HS')) {
      // HMAC algorithm uses secret key
      if (!secret) {
        throw new Error('HMAC algorithm requires secret key');
      }
      key = new TextEncoder().encode(secret);
    } else {
      // Asymmetric algorithm uses private key
      if (!privateKey) {
        throw new Error('Asymmetric algorithm requires private key');
      }
      
      // Validate algorithm and key type match
      validateAlgorithmKeyMatch(algorithm, privateKey);
      
      const keyFormat = detectKeyFormat(privateKey);
      const { privateKey: importPrivateKey } = getKeyImportFunction(algorithm);
      
      if (keyFormat === 'JWK') {
        try {
          const jwk = validateJWKFormat(privateKey);
          key = await importJWK(jwk, algorithm);
        } catch (error) {
          throw new Error(`JWK format error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (keyFormat === 'PEM') {
        try {
          const pemKey = validatePEMFormat(privateKey);
          const normalizedKey = normalizePEMFormat(pemKey);
          console.log('Processing PEM key for algorithm:', algorithm);
          console.log('PEM key preview:', `${normalizedKey.substring(0, 100)}...`);
          key = await importPrivateKey(normalizedKey, algorithm);
        } catch (error) {
          console.error('PEM import error:', error);
          throw new Error(`PEM format error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        throw new Error('Unsupported key format, please use JWK or PEM format');
      }
    }

    const jwt = new SignJWT(payload)
      .setProtectedHeader({ 
        alg: algorithm, 
        typ: 'JWT',
        ...header 
      });

    // Set standard claims
    if (payload.iss) jwt.setIssuer(payload.iss);
    if (payload.sub) jwt.setSubject(payload.sub);
    if (payload.aud) jwt.setAudience(payload.aud);
    if (payload.exp) jwt.setExpirationTime(payload.exp);
    if (payload.nbf) jwt.setNotBefore(payload.nbf);
    if (payload.iat) jwt.setIssuedAt(payload.iat);
    if (payload.jti) jwt.setJti(payload.jti);

    return await jwt.sign(key);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT generation failed: ${error.message}`);
    }
    throw new Error('JWT generation failed: Unknown error');
  }
}

/**
 * Decode JWT token (without signature verification)
 */
export function decodeJWT(token: string): JWTResult {
  try {
    // First validate JWT format
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: token must contain three parts');
    }

    // Manually decode header and payload
    let header: JWTHeader;
    let payload: any;

    try {
      // Decode header
      const headerJson = base64UrlDecode(parts[0]);
      header = JSON.parse(headerJson);
    } catch (error) {
      throw new Error('Invalid JWT header format');
    }

    try {
      // Decode payload
      const payloadJson = base64UrlDecode(parts[1]);
      payload = JSON.parse(payloadJson);
    } catch (error) {
      throw new Error('Invalid JWT payload format');
    }

    // Check if payload contains nested JWT structure
    let processedPayload = payload;

    // If payload contains header, payload, signature fields, it's a nested JWT
    if (payload && typeof payload === 'object' && 
        'header' in payload && 'payload' in payload && 'signature' in payload) {
      
      // Try to decode nested payload
      let nestedPayload = payload.payload;
      if (typeof nestedPayload === 'string') {
        try {
          nestedPayload = JSON.parse(nestedPayload);
        } catch {
          // If parsing fails, keep as is
        }
      }

      processedPayload = {
        _nestedJWT: true,
        _outerHeader: payload.header,
        _outerSignature: payload.signature,
        _outerIsValid: payload.isValid,
        _outerError: payload.error,
        // Actual payload content
        ...nestedPayload
      };
    }

    return {
      header,
      payload: processedPayload as JWTPayload,
      signature: parts[2] || ''
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT decoding failed: ${error.message}`);
    }
    throw new Error('JWT decoding failed: Unknown error');
  }
}

/**
 * Verify JWT token
 */
export async function verifyJWT(options: DecodeJWTOptions): Promise<JWTResult> {
  const { token, secret, publicKey, algorithms } = options;

  try {
    let key: any;

    if (algorithms?.some(alg => alg.startsWith('HS'))) {
      // HMAC algorithm uses secret key
      if (!secret) {
        throw new Error('HMAC algorithm requires secret key');
      }
      key = new TextEncoder().encode(secret);
    } else {
      // Asymmetric algorithm uses public key
      if (!publicKey) {
        throw new Error('Asymmetric algorithm requires public key');
      }
      
      const keyFormat = detectKeyFormat(publicKey);
      const algorithm = algorithms?.[0] || 'RS256';
      const { publicKey: importPublicKey } = getKeyImportFunction(algorithm);
      
      if (keyFormat === 'JWK') {
        try {
          const jwk = validateJWKFormat(publicKey);
          key = await importJWK(jwk, algorithm);
        } catch (error) {
          throw new Error(`JWK format error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (keyFormat === 'PEM') {
        try {
          const pemKey = validatePEMFormat(publicKey);
          const normalizedKey = normalizePEMFormat(pemKey);
          key = await importPublicKey(normalizedKey, algorithm);
        } catch (error) {
          throw new Error(`PEM format error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
              } else {
        throw new Error('Unsupported key format, please use JWK or PEM format');
      }
    }

    const { payload, protectedHeader } = await jwtVerify(token, key, {
      algorithms: algorithms?.length ? algorithms : undefined
    });

    return {
      header: protectedHeader as JWTHeader,
      payload: payload as JWTPayload,
      signature: token.split('.')[2] || ''
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw new Error('JWT verification failed: Unknown error');
  }
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (exp: number): boolean => {
  return Date.now() / 1000 > exp;
};

/**
 * Format timestamp
 */
export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
}; 