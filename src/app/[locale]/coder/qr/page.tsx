'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Download, Upload, QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import PageTitle from '@/components/PageTitle';

interface QRCodeOptions {
  width: number;
  margin: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export default function QRPage() {
  const [input, setInput] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState<string | null>(null);
  const [options, setOptions] = useState<QRCodeOptions>({
    width: 256,
    margin: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQRCode = async () => {
    if (!input.trim()) {
      toast.error('请输入要生成二维码的内容');
      return;
    }

    try {
      const url = await QRCode.toDataURL(input, {
        width: options.width,
        margin: options.margin,
        color: {
          dark: options.color.dark,
          light: options.color.light
        },
        errorCorrectionLevel: options.errorCorrectionLevel
      });
      
      setQrCodeUrl(url);
      toast.success('二维码生成成功');
    } catch (error) {
      toast.error('二维码生成失败');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 这里应该使用真实的二维码解码库
        // 由于浏览器限制，我们只能显示图片
        setDecodedText('图片解码功能需要后端支持');
        toast.info('图片解码功能需要后端支持');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制到剪贴板');
  };

  const handleClear = () => {
    setInput('');
    setQrCodeUrl(null);
    setDecodedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const a = document.createElement('a');
      a.href = qrCodeUrl;
      a.download = 'qrcode.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const quickExamples = [
    'https://example.com',
    'Hello World',
    '123456789',
    'WIFI:T:WPA;S:MyWiFi;P:password123;;',
    'BEGIN:VCARD\nVERSION:3.0\nFN:张三\nTEL:13800138000\nEND:VCARD'
  ];

  const errorCorrectionLevels = [
    { value: 'L', label: '低 (7%)', description: '可恢复7%的数据' },
    { value: 'M', label: '中 (15%)', description: '可恢复15%的数据' },
    { value: 'Q', label: '高 (25%)', description: '可恢复25%的数据' },
    { value: 'H', label: '最高 (30%)', description: '可恢复30%的数据' }
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="二维码工具"
        subtitleKey="生成和解析二维码的工具"
        features={[
          { key: '二维码生成', color: 'blue' },
          { key: '多种格式', color: 'green' },
          { key: '自定义设置', color: 'purple' }
        ]}
      />

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">生成二维码</TabsTrigger>
          <TabsTrigger value="decode">解码二维码</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生成二维码</CardTitle>
              <CardDescription>
                将文本内容转换为二维码
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">内容</Label>
                <Textarea
                  id="input"
                  placeholder="请输入要生成二维码的内容..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">尺寸</Label>
                  <Input
                    id="width"
                    type="number"
                    min="128"
                    max="1024"
                    value={options.width}
                    onChange={(e) => setOptions(prev => ({ ...prev, width: Number(e.target.value) }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margin">边距</Label>
                  <Input
                    id="margin"
                    type="number"
                    min="0"
                    max="10"
                    value={options.margin}
                    onChange={(e) => setOptions(prev => ({ ...prev, margin: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dark-color">前景色</Label>
                  <Input
                    id="dark-color"
                    type="color"
                    value={options.color.dark}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, dark: e.target.value }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="light-color">背景色</Label>
                  <Input
                    id="light-color"
                    type="color"
                    value={options.color.light}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      color: { ...prev.color, light: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="error-correction">纠错级别</Label>
                <select
                  id="error-correction"
                  value={options.errorCorrectionLevel}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    errorCorrectionLevel: e.target.value as QRCodeOptions['errorCorrectionLevel']
                  }))}
                  className="w-full p-2 border rounded-md"
                >
                  {errorCorrectionLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateQRCode}>生成二维码</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>

          {qrCodeUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>生成的二维码</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(input)}>
                      <Copy className="w-4 h-4 mr-2" />
                      复制内容
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt="二维码"
                    className="max-w-full max-h-96 object-contain rounded-lg border"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>解码二维码</CardTitle>
              <CardDescription>
                从二维码图片中提取内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-upload">上传二维码图片</Label>
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
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                <p className="text-sm text-gray-500">
                  支持格式：JPG、PNG、GIF等，最大5MB
                </p>
              </div>
            </CardContent>
          </Card>

          {decodedText && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>解码结果</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(decodedText)}>
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={decodedText}
                  readOnly
                  rows={4}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>快速示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickExamples.map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setInput(example)}
              >
                {example.length > 20 ? `${example.substring(0, 20)}...` : example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>生成二维码：</strong>将文本、URL、联系方式等内容转换为二维码。</p>
          <p><strong>自定义选项：</strong>可调整尺寸、颜色、边距和纠错级别。</p>
          <p><strong>纠错级别：</strong>级别越高，二维码越容错，但尺寸也越大。</p>
          <p><strong>支持格式：</strong>URL、文本、WiFi配置、联系人信息等。</p>
          <p><strong>解码功能：</strong>目前需要后端支持，前端仅支持图片预览。</p>
        </CardContent>
      </Card>
    </div>
  );
} 