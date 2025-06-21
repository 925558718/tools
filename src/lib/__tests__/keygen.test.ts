import { describe, it, expect } from 'vitest';
import { 
  generateKeyPair, 
  getSupportedAlgorithms, 
  getAlgorithmInfo,
  validateKeyPairFormat 
} from '../keygen';

describe('KeyGen Library', () => {
  describe('getSupportedAlgorithms', () => {
    it('should return supported algorithms', () => {
      const algorithms = getSupportedAlgorithms();
      
      expect(algorithms).toHaveProperty('RSA');
      expect(algorithms).toHaveProperty('ECDSA');
      expect(algorithms).toHaveProperty('EdDSA');
      
      expect(algorithms.RSA).toContain('RS256');
      expect(algorithms.RSA).toContain('RS384');
      expect(algorithms.RSA).toContain('RS512');
      
      expect(algorithms.ECDSA).toContain('ES256');
      expect(algorithms.ECDSA).toContain('ES384');
      expect(algorithms.ECDSA).toContain('ES512');
      
      expect(algorithms.EdDSA).toContain('EdDSA');
    });
  });

  describe('getAlgorithmInfo', () => {
    it('should return algorithm info for RS256', () => {
      const info = getAlgorithmInfo('RS256');
      
      expect(info).toBeDefined();
      expect(info?.name).toBe('RSA SHA-256');
      expect(info?.keySize).toBe(2048);
      expect(info?.security).toBe('高');
    });

    it('should return algorithm info for ES256', () => {
      const info = getAlgorithmInfo('ES256');
      
      expect(info).toBeDefined();
      expect(info?.name).toBe('ECDSA SHA-256');
      expect(info?.curve).toBe('P-256');
      expect(info?.security).toBe('高');
    });

    it('should return null for unsupported algorithm', () => {
      const info = getAlgorithmInfo('UNSUPPORTED');
      expect(info).toBeNull();
    });
  });

  describe('generateKeyPair', () => {
    it('should generate RSA key pair', async () => {
      const result = await generateKeyPair({
        algorithm: 'RS256',
        keySize: 2048,
        format: 'PEM'
      });

      expect(result.success).toBe(true);
      expect(result.keyPair).toBeDefined();
      expect(result.keyPair?.algorithm).toBe('RS256');
      expect(result.keyPair?.format).toBe('PEM');
      expect(result.keyPair?.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.keyPair?.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    });

    it('should generate ECDSA key pair', async () => {
      const result = await generateKeyPair({
        algorithm: 'ES256',
        curve: 'P-256',
        format: 'PEM'
      });

      expect(result.success).toBe(true);
      expect(result.keyPair).toBeDefined();
      expect(result.keyPair?.algorithm).toBe('ES256');
      expect(result.keyPair?.curve).toBe('P-256');
      expect(result.keyPair?.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.keyPair?.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    });

    it('should generate EdDSA key pair', async () => {
      const result = await generateKeyPair({
        algorithm: 'EdDSA',
        format: 'PEM'
      });

      expect(result.success).toBe(true);
      expect(result.keyPair).toBeDefined();
      expect(result.keyPair?.algorithm).toBe('EdDSA');
      expect(result.keyPair?.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.keyPair?.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    });

    it('should return error for unsupported algorithm', async () => {
      const result = await generateKeyPair({
        algorithm: 'UNSUPPORTED',
        format: 'PEM'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('不支持的算法');
    });
  });

  describe('validateKeyPairFormat', () => {
    it('should validate PEM format key pair', () => {
      const keyPair = {
        privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----',
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
        format: 'PEM' as const,
        algorithm: 'RS256'
      };

      const isValid = validateKeyPairFormat(keyPair);
      expect(isValid).toBe(true);
    });

    it('should validate JWK format key pair', () => {
      const keyPair = {
        privateKey: '{"kty":"RSA","n":"...","e":"AQAB","d":"...","p":"...","q":"..."}',
        publicKey: '{"kty":"RSA","n":"...","e":"AQAB"}',
        format: 'JWK' as const,
        algorithm: 'RS256'
      };

      const isValid = validateKeyPairFormat(keyPair);
      expect(isValid).toBe(true);
    });

    it('should reject invalid key pair', () => {
      const keyPair = {
        privateKey: '',
        publicKey: '',
        format: 'PEM' as const,
        algorithm: 'RS256'
      };

      const isValid = validateKeyPairFormat(keyPair);
      expect(isValid).toBe(false);
    });
  });
}); 