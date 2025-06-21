'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Upload, Download, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  base64: string;
}

export default function ImagePage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [base64Input, setBase64Input] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 检查文件大小（限制为10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // 创建图片对象获取尺寸
      const img = new Image();
      img.onload = () => {
        const info: ImageInfo = {
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          base64: result
        };
        setImageInfo(info);
        setPreviewUrl(result);
        toast.success('图片上传成功');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Decode = () => {
    if (!base64Input.trim()) {
      toast.error('请输入Base64编码');
      return;
    }

    try {
      // 检查是否是有效的Base64图片
      if (!base64Input.startsWith('data:image/')) {
        toast.error('请输入有效的图片Base64编码');
        return;
      }

      setPreviewUrl(base64Input);
      toast.success('Base64解码成功');
    } catch (error) {
      toast.error('Base64解码失败');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handleClear = () => {
    setImageInfo(null);
    setBase64Input('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement('a');
      a.href = previewUrl;
      a.download = imageInfo?.name || 'image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / (k ** i)).toFixed(2))} ${sizes[i]}`;
  };

  const getBase64Size = (base64: string): number => {
    // 移除data:image/...;base64,前缀
    const base64Data = base64.split(',')[1];
    return Math.ceil((base64Data.length * 3) / 4);
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="图片编码工具"
        subtitleKey="图片与Base64编码之间的相互转换工具"
        features={[
          { key: '图片转Base64', color: 'blue' },
          { key: 'Base64转图片', color: 'green' },
          { key: '预览功能', color: 'purple' }
        ]}
      />

      <Tabs defaultValue="encode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">图片转Base64</TabsTrigger>
          <TabsTrigger value="decode">Base64转图片</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>图片转Base64</CardTitle>
              <CardDescription>
                将图片文件转换为Base64编码
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">选择图片</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传图片
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    清空
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500">
                  支持格式：JPG、PNG、GIF、WebP等，最大10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {imageInfo && (
            <Card>
              <CardHeader>
                <CardTitle>图片信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">文件名</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">文件大小</p>
                    <p className="text-gray-600 dark:text-gray-400">{formatFileSize(imageInfo.size)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">图片尺寸</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.width} × {imageInfo.height}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">文件类型</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Base64编码</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(imageInfo.base64)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </Button>
                  </div>
                  <Textarea
                    value={imageInfo.base64}
                    readOnly
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base64转图片</CardTitle>
              <CardDescription>
                将Base64编码转换回图片
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base64-input">Base64编码</Label>
                <Textarea
                  id="base64-input"
                  placeholder="请输入图片的Base64编码..."
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBase64Decode}>解码</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {previewUrl && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>图片预览</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCopy(previewUrl)}>
                  <Copy className="w-4 h-4 mr-2" />
                  复制Base64
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative max-w-full">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="max-w-full max-h-96 object-contain rounded-lg border"
                />
                {base64Input && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    <p>Base64大小: {formatFileSize(getBase64Size(base64Input))}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>图片转Base64：</strong>上传图片文件，自动转换为Base64编码格式。</p>
          <p><strong>Base64转图片：</strong>输入Base64编码，预览和下载对应的图片。</p>
          <p><strong>支持格式：</strong>JPG、PNG、GIF、WebP、SVG等常见图片格式。</p>
          <p><strong>文件限制：</strong>单个文件最大10MB，建议使用压缩后的图片。</p>
          <p><strong>应用场景：</strong>网页内联图片、CSS背景图、邮件附件等。</p>
        </CardContent>
      </Card>
    </div>
  );
} 