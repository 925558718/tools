/**
 * Image encoding/decoding tools
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
 * Convert image to Base64
 */
export function imageToBase64(file: File): Promise<ImageResult> {
  return new Promise((resolve) => {
    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      resolve({ success: false, error: 'File too large, please select an image smaller than 10MB' });
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
        resolve({ success: false, error: 'Image loading failed' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'File reading failed' });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Base64 to image
 */
export function base64ToImage(base64: string): Promise<Base64ImageResult> {
  return new Promise((resolve) => {
    try {
      // Check if it's a valid Base64 image
      if (!base64.startsWith('data:image/')) {
        // Try adding data URL prefix
        const testUrl = `data:image/png;base64,${base64}`;
        const img = new Image();
        img.onload = () => {
          resolve({ success: true, dataUrl: testUrl });
        };
        img.onerror = () => {
          resolve({ success: false, error: 'Invalid Base64 format' });
        };
        img.src = testUrl;
      } else {
        const img = new Image();
        img.onload = () => {
          resolve({ success: true, dataUrl: base64 });
        };
        img.onerror = () => {
          resolve({ success: false, error: 'Invalid Base64 format' });
        };
        img.src = base64;
      }
    } catch (error) {
      resolve({ success: false, error: 'Base64 decoding failed' });
    }
  });
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Calculate Base64 size
 */
export function getBase64Size(base64: string): number {
  // Remove data:image/...;base64, prefix
  const base64Data = base64.split(',')[1];
  return Math.ceil((base64Data.length * 3) / 4);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): boolean {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return false;
  }
  
  // Check file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return false;
  }
  
  return true;
}

/**
 * Validate Base64 image format
 */
export function isValidBase64Image(base64: string): boolean {
  try {
    // Check if it's data URL format
    if (base64.startsWith('data:image/')) {
      return true;
    }
    
    // Check if it's pure Base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(base64);
  } catch {
    return false;
  }
}

/**
 * Compress image
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
          resolve({ success: false, error: 'Unable to create canvas context' });
          return;
        }
        
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64
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
        resolve({ success: false, error: 'Image loading failed' });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ success: false, error: 'File reading failed' });
    };
    reader.readAsDataURL(file);
  });
} 
