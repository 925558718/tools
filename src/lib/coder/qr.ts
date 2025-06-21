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
    // 注意：这里需要在实际使用时导入 QRCode
    // import QRCode from 'qrcode';
    
    // 模拟QR码生成
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.width;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { success: false, error: '无法创建canvas上下文' };
    }
    
    // 绘制背景
    ctx.fillStyle = options.color.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制简单的QR码图案（这里只是示例）
    ctx.fillStyle = options.color.dark;
    const cellSize = options.width / 25;
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }
    
    const dataUrl = canvas.toDataURL('image/png');
    return { success: true, dataUrl };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'QR码生成失败' 
    };
  }
}

/**
 * 解码QR码
 */
export async function decodeQRCode(file: File): Promise<QRDecodeResult> {
  try {
    // 注意：这里需要在实际使用时导入 jsQR
    // import jsQR from 'jsqr';
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ success: false, error: '无法处理图像' });
            return;
          }

          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          // 模拟QR码解码
          // const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          // 这里只是示例，实际应该使用jsQR库
          const mockText = '模拟的QR码内容';
          resolve({ success: true, text: mockText });
        };
        img.onerror = () => {
          resolve({ success: false, error: '图像加载失败' });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({ success: false, error: '文件读取失败' });
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'QR码解码失败' 
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