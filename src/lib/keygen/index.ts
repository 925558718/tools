import * as jose from 'jose';
import { generateRSAKeyPair, generateECDSAKeyPair, generateEdDSAKeyPair } from './algorithms';
import { exportToPEM, exportToJWK, exportToDER } from './formats';
import { validateKeyPair, testKeyPair } from './validation';

export interface KeyPair {
  privateKey: string;
  publicKey: string;
  format: 'PEM' | 'JWK' | 'DER';
  algorithm: string;
  keySize?: number;
  curve?: string;
}

export interface KeyGenOptions {
  algorithm: string;
  keySize?: number;
  curve?: string;
  format?: 'PEM' | 'JWK' | 'DER';
  passphrase?: string;
}

export interface KeyGenResult {
  success: boolean;
  keyPair?: KeyPair;
  error?: string;
}

/**
 * Main function to generate key pairs
 */
export const generateKeyPair = async (options: KeyGenOptions): Promise<KeyGenResult> => {
  try {
    const { algorithm, keySize = 2048, curve, format = 'PEM', passphrase } = options;
    
    let rawKeyPair: any;
    
    // Generate raw key pair based on algorithm
    if (algorithm.startsWith('RS')) {
      rawKeyPair = await generateRSAKeyPair(keySize);
    } else if (algorithm.startsWith('ES')) {
      rawKeyPair = await generateECDSAKeyPair(curve || 'P-256');
    } else if (algorithm === 'EdDSA') {
      rawKeyPair = await generateEdDSAKeyPair();
    } else {
      return { success: false, error: 'Unsupported algorithm' };
    }

    // Export to specified format
    const exportedKeyPair = await exportToFormat(rawKeyPair, format, passphrase);
    
    const keyPair: KeyPair = {
      privateKey: exportedKeyPair.privateKey,
      publicKey: exportedKeyPair.publicKey,
      format,
      algorithm,
      keySize: algorithm.startsWith('RS') ? keySize : undefined,
      curve: algorithm.startsWith('ES') ? curve : undefined
    };

    return { success: true, keyPair };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Key pair generation failed' 
    };
  }
};

/**
 * Export to specified format
 */
const exportToFormat = async (
  keyPair: any, 
  format: string, 
  passphrase?: string
): Promise<{ privateKey: string; publicKey: string }> => {
  switch (format) {
    case 'PEM':
      return await exportToPEM(keyPair, passphrase);
    case 'JWK':
      return await exportToJWK(keyPair);
    case 'DER':
      return await exportToDER(keyPair);
    default:
      return await exportToPEM(keyPair, passphrase);
  }
};

/**
 * Validate key pair
 */
export const validateKeyPairFormat = (keyPair: KeyPair): boolean => {
  return validateKeyPair(keyPair);
};

/**
 * Test key pair functionality
 */
export const testKeyPairFunctionality = async (keyPair: KeyPair): Promise<boolean> => {
  return await testKeyPair(keyPair);
};

/**
 * Get supported algorithms list
 */
export const getSupportedAlgorithms = () => {
  return {
    RSA: ['RS256', 'RS384', 'RS512'],
    ECDSA: ['ES256', 'ES384', 'ES512'],
    EdDSA: ['EdDSA']
  };
};

/**
 * Get algorithm details
 */
export const getAlgorithmInfo = (algorithm: string) => {
  const info: Record<string, any> = {
    RS256: { name: 'RSA SHA-256', keySize: 2048, security: 'High' },
    RS384: { name: 'RSA SHA-384', keySize: 2048, security: 'High' },
    RS512: { name: 'RSA SHA-512', keySize: 2048, security: 'High' },
    ES256: { name: 'ECDSA SHA-256', curve: 'P-256', security: 'High' },
    ES384: { name: 'ECDSA SHA-384', curve: 'P-384', security: 'High' },
    ES512: { name: 'ECDSA SHA-512', curve: 'P-521', security: 'High' },
    EdDSA: { name: 'Edwards-curve Digital Signature', curve: 'Ed25519', security: 'High' }
  };
  
  return info[algorithm] || null;
}; 