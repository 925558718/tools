import * as jose from 'jose';

/**
 * 导出为PEM格式
 */
export const exportToPEM = async (keyPair: any, passphrase?: string) => {
  const privateKey = await jose.exportPKCS8(keyPair.privateKey);
  const publicKey = await jose.exportSPKI(keyPair.publicKey);
  
  // jose.exportPKCS8 和 jose.exportSPKI 已经返回完整的PEM格式，无需再添加头尾
  return {
    privateKey,
    publicKey
  };
};

/**
 * 导出为JWK格式
 */
export const exportToJWK = async (keyPair: any) => {
  const privateKey = await jose.exportJWK(keyPair.privateKey);
  const publicKey = await jose.exportJWK(keyPair.publicKey);
  
  return {
    privateKey: JSON.stringify(privateKey, null, 2),
    publicKey: JSON.stringify(publicKey, null, 2)
  };
};

/**
 * 导出为DER格式
 */
export const exportToDER = async (keyPair: any) => {
  const privateKey = await jose.exportPKCS8(keyPair.privateKey);
  const publicKey = await jose.exportSPKI(keyPair.publicKey);
  
  return {
    privateKey: Buffer.from(privateKey, 'base64').toString('hex'),
    publicKey: Buffer.from(publicKey, 'base64').toString('hex')
  };
};

/**
 * 从PEM格式导入密钥
 */
export const importFromPEM = async (privateKeyPEM: string, publicKeyPEM: string, passphrase?: string) => {
  const privateKey = await jose.importPKCS8(privateKeyPEM, 'RS256');
  const publicKey = await jose.importSPKI(publicKeyPEM, 'RS256');
  
  return { privateKey, publicKey };
};

/**
 * 从JWK格式导入密钥
 */
export const importFromJWK = async (privateKeyJWK: string, publicKeyJWK: string) => {
  const privateKey = await jose.importJWK(JSON.parse(privateKeyJWK));
  const publicKey = await jose.importJWK(JSON.parse(publicKeyJWK));
  
  return { privateKey, publicKey };
}; 