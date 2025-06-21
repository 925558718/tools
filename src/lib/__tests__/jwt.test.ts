/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { 
  decodeJWT, 
  generateJWT, 
  generateJWTWithPrivateKey,
  verifyJWTWithPublicKey,
  isTokenExpired,
  formatTimestamp
} from '../jwt';
import { generateKeyPair } from '../keygen';

describe('JWT Library', () => {
  const testPayload = {
    sub: '1234567890',
    name: 'John Doe',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };

  describe('generateJWT', () => {
    it('should generate HMAC JWT token', async () => {
      const payload = JSON.stringify(testPayload);
      const secret = 'test-secret';
      const algorithm = 'HS256';

      const result = await generateJWT(payload, secret, algorithm);

      expect(result.success).toBe(true);
      expect(result.token).toBeTruthy();
      expect(result.token.split('.')).toHaveLength(3);
    });

    it('should fail for unsupported algorithm', async () => {
      const payload = JSON.stringify(testPayload);
      const secret = 'test-secret';
      const algorithm = 'RS256';

      const result = await generateJWT(payload, secret, algorithm);

      expect(result.success).toBe(false);
      expect(result.error).toBe('不支持的算法，请使用HMAC算法');
    });
  });

  describe('decodeJWT', () => {
    it('should decode JWT token without verification', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const result = decodeJWT(token);

      expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' });
      expect(result.payload).toEqual({ sub: '1234567890', name: 'John Doe', iat: 1516239022 });
      expect(result.signature).toBe('SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
    });

    it('should verify JWT token with correct secret', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      const secret = 'your-256-bit-secret';

      const result = decodeJWT(token, secret);

      expect(result.isValid).toBe(true);
    });
  });

  describe('generateJWTWithPrivateKey', () => {
    it('should generate JWT with RSA private key', async () => {
      const payload = JSON.stringify(testPayload);
      const algorithm = 'RS256';
      
      // Generate key pair first
      const keyPairResult = await generateKeyPair({ algorithm });
      expect(keyPairResult.success).toBe(true);
      expect(keyPairResult.keyPair).toBeTruthy();
      
      if (!keyPairResult.keyPair) {
        throw new Error('Failed to generate key pair');
      }
      
      const result = await generateJWTWithPrivateKey(payload, keyPairResult.keyPair.privateKey, algorithm);

      expect(result.success).toBe(true);
      expect(result.token).toBeTruthy();
      expect(result.token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyJWTWithPublicKey', () => {
    it('should verify JWT with RSA public key', async () => {
      const payload = JSON.stringify(testPayload);
      const algorithm = 'RS256';
      
      // Generate key pair first
      const keyPairResult = await generateKeyPair({ algorithm });
      expect(keyPairResult.success).toBe(true);
      expect(keyPairResult.keyPair).toBeTruthy();
      
      if (!keyPairResult.keyPair) {
        throw new Error('Failed to generate key pair');
      }
      
      // Generate token
      const tokenResult = await generateJWTWithPrivateKey(payload, keyPairResult.keyPair.privateKey, algorithm);
      
      // Verify token
      const verifyResult = await verifyJWTWithPublicKey(tokenResult.token, keyPairResult.keyPair.publicKey, algorithm);

      expect(verifyResult.isValid).toBe(true);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', () => {
      const exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      expect(isTokenExpired(exp)).toBe(true);
    });

    it('should return false for valid token', () => {
      const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      
      expect(isTokenExpired(exp)).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const timestamp = 1516239022;
      
      const formatted = formatTimestamp(timestamp);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date format
    });
  });
}); 