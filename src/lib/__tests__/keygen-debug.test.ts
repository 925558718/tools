import { describe, it, expect } from 'vitest';
import * as jose from 'jose';

describe('KeyGen Debug', () => {
  it('should generate RSA key pair directly with jose', async () => {
    try {
      const keyPair = await jose.generateKeyPair('RS256', {
        modulusLength: 2048,
      });
      
      const privateKey = await jose.exportPKCS8(keyPair.privateKey);
      const publicKey = await jose.exportSPKI(keyPair.publicKey);
      
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
      
      console.log('Private key length:', privateKey.length);
      console.log('Public key length:', publicKey.length);
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });

  it('should generate ECDSA key pair directly with jose', async () => {
    try {
      const keyPair = await jose.generateKeyPair('ES256', {
        crv: 'P-256',
      });
      
      const privateKey = await jose.exportPKCS8(keyPair.privateKey);
      const publicKey = await jose.exportSPKI(keyPair.publicKey);
      
      expect(privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(publicKey).toContain('-----BEGIN PUBLIC KEY-----');
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
}); 