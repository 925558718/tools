/**
 * QR码工具
 */

export interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface QRCodeResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

export interface QRDecodeResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * 生成QR码
 */
export async function generateQRCode(
  content: string, 
  options: QRCodeOptions = {
    width: 256,
    margin: 4,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M'
  }
): Promise<QRCodeResult> {
  try {
    // 动态导入QRCode库
    const QRCode = (await import('qrcode')).default;
    
    const dataUrl = await QRCode.toDataURL(content, {
      width: options.width,
      margin: options.margin,
      color: {
        dark: options.color.dark,
        light: options.color.light
      },
      errorCorrectionLevel: options.errorCorrectionLevel
    });
    
    return { success: true, dataUrl };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'QR code generation failed' 
    };
  }
}

/**
 * 解码QR码
 */
export async function decodeQRCode(file: File): Promise<QRDecodeResult> {
  try {
    // 动态导入jsQR库
    const jsQR = (await import('jsqr')).default;
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ success: false, error: 'Unable to process image' });
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            resolve({ success: true, text: code.data });
          } else {
            resolve({ success: false, error: 'Unable to recognize QR code' });
          }
        };
        img.onerror = () => {
          resolve({ success: false, error: 'Image loading failed' });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'File reading failed' });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'QR code decoding failed' 
    };
  }
}

/**
 * 验证QR码内容格式
 */
export function validateQRContent(content: string): boolean {
  if (!content || content.trim().length === 0) {
    return false;
  }
  
  // 检查常见格式
  const patterns = [
    /^https?:\/\/.+/, // URL
    /^[0-9]+$/, // 纯数字
    /^[A-Za-z0-9\s]+$/, // 英文和数字
    /^[\u4e00-\u9fa5\s]+$/, // 中文
    /^WIFI:T:WPA;S:.+;P:.+;;$/, // WiFi配置
    /^BEGIN:VCARD[\s\S]*END:VCARD$/, // vCard
  ];
  
  return patterns.some(pattern => pattern.test(content));
}

/**
 * 获取QR码错误纠正级别信息
 */
export function getErrorCorrectionInfo(level: 'L' | 'M' | 'Q' | 'H') {
  const info = {
    L: { name: '低', description: '可恢复约7%的数据', capacity: '低' },
    M: { name: '中', description: '可恢复约15%的数据', capacity: '中' },
    Q: { name: '高', description: '可恢复约25%的数据', capacity: '中高' },
    H: { name: '最高', description: '可恢复约30%的数据', capacity: '高' }
  };
  
  return info[level];
} 