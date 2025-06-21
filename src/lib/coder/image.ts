/**
 * 图像编码解码工具
 */

export interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  base64: string;
}

export interface ImageResult {
  success: boolean;
  data?: ImageInfo;
  error?: string;
}

export interface Base64ImageResult {
  success: boolean;
  dataUrl?: string;
  error?: string;
}

/**
 * 图像转Base64
 */
export function imageToBase64(file: File): Promise<ImageResult> {
  return new Promise((resolve) => {
    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      resolve({ success: false, error: '文件过大，请选择小于10MB的图片' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const base64 = e.target?.result as string;
        const imageInfo: ImageInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          base64: base64
        };
        resolve({ success: true, data: imageInfo });
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
}

/**
 * Base64转图像
 */
export function base64ToImage(base64: string): Promise<Base64ImageResult> {
  return new Promise((resolve) => {
    try {
      // 检查是否是有效的Base64图片
      if (!base64.startsWith('data:image/')) {
        // 尝试添加data URL前缀
        const testUrl = `data:image/png;base64,${base64}`;
        const img = new Image();
        img.onload = () => {
          resolve({ success: true, dataUrl: testUrl });
        };
        img.onerror = () => {
          resolve({ success: false, error: '无效的Base64格式' });
        };
        img.src = testUrl;
      } else {
        const img = new Image();
        img.onload = () => {
          resolve({ success: true, dataUrl: base64 });
        };
        img.onerror = () => {
          resolve({ success: false, error: '无效的Base64格式' });
        };
        img.src = base64;
      }
    } catch (error) {
      resolve({ success: false, error: 'Base64解码失败' });
    }
  });
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 计算Base64大小
 */
export function getBase64Size(base64: string): number {
  // 移除data:image/...;base64,前缀
  const base64Data = base64.split(',')[1];
  return Math.ceil((base64Data.length * 3) / 4);
}

/**
 * 验证图像文件
 */
export function validateImageFile(file: File): boolean {
  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    return false;
  }
  
  // 检查文件大小 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }
  
  return true;
}

/**
 * 验证Base64图像格式
 */
export function isValidBase64Image(base64: string): boolean {
  try {
    // 检查是否是data URL格式
    if (base64.startsWith('data:image/')) {
      return true;
    }
    
    // 检查是否是纯Base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(base64);
  } catch {
    return false;
  }
}

/**
 * 压缩图像
 */
export function compressImage(
  file: File, 
  maxWidth = 800, 
  quality = 0.8
): Promise<ImageResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve({ success: false, error: '无法创建canvas上下文' });
          return;
        }
        
        // 计算新的尺寸
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Base64
        const compressedBase64 = canvas.toDataURL(file.type, quality);
        
        const imageInfo: ImageInfo = {
          name: file.name,
          size: getBase64Size(compressedBase64),
          type: file.type,
          width,
          height,
          base64: compressedBase64
        };
        
        resolve({ success: true, data: imageInfo });
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
} 