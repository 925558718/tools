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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('qr.errors.invalid_format'));
      return;
    }

    setLogoFile(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
    }
  };

  const handleGenerateQRCode = async () => {
    if (!input.trim()) {
      toast.error(t('qr.errors.empty_content'));
      return;
    }

    try {
      // 准备选项
      const qrOptions = { ...options };
      
      // 如果有Logo，添加到选项中
      if (logoFile && logoPreview) {
        qrOptions.logo = {
          src: logoPreview,
          width: 48, // 默认Logo尺寸
          height: 48
        };
        // 使用Logo时建议使用高纠错级别
        qrOptions.errorCorrectionLevel = 'H';
      }

      const result = await generateQRCode(input, qrOptions);
      
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
        toast.success(t('qr.success.decoded'));
      } else {
        setDecodedText(t('qr.errors.no_qr_found'));
        toast.error(result.error || t('qr.errors.decode_failed'));
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
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (logoInputRef.current) {
      logoInputRef.current.value = '';
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
    t('qr.examples.url'),
    t('qr.examples.text'),
    t('qr.examples.number'),
    t('qr.examples.wifi'),
    t('qr.examples.vcard')
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

              <div className="space-y-2">
                <Label htmlFor="logo-upload">{t('qr.logo.title')}</Label>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    onClick={() => logoInputRef.current?.click()}
                    type="button"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('qr.logo.upload')}
                  </Button>
                  {logoFile && (
                    <Button
                      variant="outline"
                      onClick={handleRemoveLogo}
                      type="button"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('qr.logo.remove')}
                    </Button>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleLogoUpload}
                  accept="image/*"
                />
                {logoPreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">{t('qr.logo.preview')}</p>
                    <img
                      src={logoPreview}
                      alt={t('qr.logo.preview_alt')}
                      className="w-16 h-16 object-contain border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t('qr.logo.error_correction_hint')}
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {t('qr.logo.format_hint')}
                </p>
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
          <p><strong>{t('qr.qr_styles.title')}</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>{t('qr.qr_styles.standard')}</strong></li>
            <li><strong>{t('qr.qr_styles.with_logo')}</strong></li>
            <li><strong>{t('qr.qr_styles.colored')}</strong></li>
            <li><strong>{t('qr.qr_styles.artistic')}</strong></li>
          </ul>
          <p><strong>{t('qr.logo_tips.title')}</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>{t('qr.logo_tips.format')}</li>
            <li>{t('qr.logo_tips.size')}</li>
            <li>{t('qr.logo_tips.error_correction')}</li>
            <li>{t('qr.logo_tips.complexity')}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 