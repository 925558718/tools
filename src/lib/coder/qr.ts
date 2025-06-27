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
  logo?: {
    src: string; // Logo图片的URL或DataURL
    width: number; // Logo宽度（像素）
    height: number; // Logo高度（像素）
  };
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
 * 生成带Logo的QR码
 */
export async function generateQRCodeWithLogo(
  content: string,
  options: QRCodeOptions
): Promise<QRCodeResult> {
  try {
    // 动态导入QRCode库
    const QRCode = (await import('qrcode')).default;
    
    // 首先生成基础二维码
    const qrDataUrl = await QRCode.toDataURL(content, {
      width: options.width,
      margin: options.margin,
      color: {
        dark: options.color.dark,
        light: options.color.light
      },
      errorCorrectionLevel: options.errorCorrectionLevel
    });

    // 如果没有Logo，直接返回基础二维码
    if (!options.logo) {
      return { success: true, dataUrl: qrDataUrl };
    }

    // 创建Canvas来合成Logo
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return { success: false, error: 'Unable to create canvas context' };
    }

    // 加载二维码图片
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = qrDataUrl;
    });

    // 设置Canvas尺寸
    canvas.width = options.width;
    canvas.height = options.width;

    // 绘制二维码
    ctx.drawImage(qrImage, 0, 0, options.width, options.width);

    // 加载并绘制Logo
    const logoImage = new Image();
    await new Promise((resolve, reject) => {
      logoImage.onload = resolve;
      logoImage.onerror = reject;
      logoImage.src = options.logo?.src || '';
    });

    // 计算Logo位置（居中）
    const logoX = (options.width - (options.logo?.width || 0)) / 2;
    const logoY = (options.width - (options.logo?.height || 0)) / 2;

    // 绘制Logo
    ctx.drawImage(logoImage, logoX, logoY, options.logo?.width || 0, options.logo?.height || 0);

    // 返回合成后的DataURL
    return { success: true, dataUrl: canvas.toDataURL('image/png') };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'QR code generation with logo failed' 
    };
  }
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
  // 如果有Logo选项，使用带Logo的生成方法
  if (options.logo) {
    return generateQRCodeWithLogo(content, options);
  }

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
 * 解码QR码（使用qr-scanner）
 */
export async function decodeQRCode(file: File): Promise<QRDecodeResult> {
  try {
    const QrScanner = (await import('qr-scanner')).default;
    
    try {
      const result = await QrScanner.scanImage(file);
      return { success: true, text: result };
    } catch (error) {
      return { 
        success: false, 
        error: '无法识别二维码，请确保图片清晰且包含有效的二维码' 
      };
    }
  } catch (error) {
    return {
      success: false,
      error: '解码器加载失败'
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