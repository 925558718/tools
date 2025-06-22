'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Download, Upload, QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { generateQRCode, decodeQRCode, QRCodeOptions } from '@/lib/coder';

export default function QRPage() {
  const t = useTranslations();
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

  const handleGenerateQRCode = async () => {
    if (!input.trim()) {
      toast.error(t('qr.errors.empty_content'));
      return;
    }

    try {
      const result = await generateQRCode(input, options);
      
      if (result.success && result.dataUrl) {
        setQrCodeUrl(result.dataUrl);
        toast.success(t('qr.success.generated'));
      } else {
        toast.error(result.error || t('qr.errors.generation_failed'));
      }
    } catch (error) {
      toast.error(t('qr.errors.generation_failed'));
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('qr.errors.invalid_format'));
      return;
    }

    try {
      const result = await decodeQRCode(file);
      
      if (result.success && result.text) {
        setDecodedText(result.text);
        toast.success('QR码解码成功');
      } else {
        setDecodedText('无法识别QR码，请确保图片清晰且包含有效的QR码');
        toast.error(result.error || '无法识别QR码');
      }
    } catch (error) {
      toast.error(t('qr.errors.decode_failed'));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('qr.success.copied'));
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
    { value: 'L', label: t('qr.options.error_correction_low'), description: t('qr.options.error_correction_low_desc') },
    { value: 'M', label: t('qr.options.error_correction_medium'), description: t('qr.options.error_correction_medium_desc') },
    { value: 'Q', label: t('qr.options.error_correction_high'), description: t('qr.options.error_correction_high_desc') },
    { value: 'H', label: t('qr.options.error_correction_highest'), description: t('qr.options.error_correction_highest_desc') }
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="qr.title"
        subtitleKey="qr.description"
        features={[
          { key: 'qr.features.multiple_types', color: 'blue' },
          { key: 'qr.features.customizable', color: 'green' },
          { key: 'qr.features.download', color: 'purple' }
        ]}
      />

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">{t('qr.tabs.generate')}</TabsTrigger>
          <TabsTrigger value="decode">{t('qr.tabs.decode')}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('qr.generate.title')}</CardTitle>
              <CardDescription>
                {t('qr.generate.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('qr.input.content_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('placeholders.enter')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">{t('qr.options.size_label')}</Label>
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
                  <Label htmlFor="margin">{t('qr.options.margin_label')}</Label>
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
                  <Label htmlFor="dark-color">{t('qr.options.foreground_color')}</Label>
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
                  <Label htmlFor="light-color">{t('qr.options.background_color')}</Label>
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
                <Label htmlFor="error-correction">{t('qr.options.error_correction_label')}</Label>
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
                <Button onClick={handleGenerateQRCode}>{t('qr.input.generate_button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('qr.common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {qrCodeUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('qr.result.title')}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      {t('qr.result.download_png')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(input)}>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('qr.result.copy_content')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src={qrCodeUrl}
                    alt={t('qr.result.alt_text')}
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
              <CardTitle>{t('qr.decode.title')}</CardTitle>
              <CardDescription>
                {t('qr.decode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-upload">{t('qr.decode.upload_label')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('qr.decode.upload_button')}
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('qr.common.clear')}
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
                  {t('qr.decode.supported_formats')}
                </p>
              </div>
            </CardContent>
          </Card>

          {decodedText && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('qr.decode.result_title')}</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleCopy(decodedText)}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('qr.common.copy')}
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
          <CardTitle>{t('qr.examples.title')}</CardTitle>
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
          <CardTitle>{t('qr.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>{t('qr.instructions.content')}</strong>{t('qr.instructions.content_desc')}</p>
          <p><strong>{t('qr.instructions.size')}</strong>{t('qr.instructions.size_desc')}</p>
          <p><strong>{t('qr.instructions.error_correction')}</strong>{t('qr.instructions.error_correction_desc')}</p>
          <p><strong>{t('qr.instructions.types')}</strong>{t('qr.instructions.types_desc')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 