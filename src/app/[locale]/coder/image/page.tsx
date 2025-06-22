"use client";

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Label } from '@/components/shadcn/label';
import { Textarea } from '@/components/shadcn/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Upload, RotateCcw, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { imageToBase64, base64ToImage, formatFileSize, getBase64Size, ImageInfo } from '@/lib/coder';

export default function ImagePage() {
  const t = useTranslations();
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [base64Input, setBase64Input] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await imageToBase64(file);
    if (result.success && result.data) {
      setImageInfo(result.data);
    } else {
      toast.error(result.error || t('image.errors.upload_failed'));
    }
  };

  const handleBase64Decode = async () => {
    if (!base64Input.trim()) {
      toast.error(t('image.errors.empty_input'));
      return;
    }

    try {
      const result = await base64ToImage(base64Input);
      if (result.success && result.dataUrl) {
        setPreviewUrl(result.dataUrl);
      } else {
        toast.error(result.error || t('image.errors.invalid_base64'));
      }
    } catch (error) {
      toast.error(t('image.errors.decode_failed'));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('image.success.copied'));
  };

  const handleClear = () => {
    setImageInfo(null);
    setBase64Input('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'decoded-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="image.title"
        subtitleKey="image.description"
        features={[
          { key: 'image.features.image_to_base64', color: 'blue' },
          { key: 'image.features.base64_to_image', color: 'green' },
          { key: 'image.features.preview_function', color: 'purple' }
        ]}
      />

      <Tabs defaultValue="encode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">{t('image.tabs.encode')}</TabsTrigger>
          <TabsTrigger value="decode">{t('image.tabs.decode')}</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('image.encode.title')}</CardTitle>
              <CardDescription>
                {t('image.encode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">{t('image.encode.select_image')}</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('image.encode.upload_image')}
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('image.encode.clear')}
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
                  {t('image.encode.supported_formats')}
                </p>
              </div>
            </CardContent>
          </Card>

          {imageInfo && (
            <Card>
              <CardHeader>
                <CardTitle>{t('image.image_info.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('image.image_info.file_name')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.name}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('image.image_info.file_size')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{formatFileSize(imageInfo.size)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('image.image_info.dimensions')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.width} × {imageInfo.height}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('image.image_info.file_type')}</p>
                    <p className="text-gray-600 dark:text-gray-400">{imageInfo.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('image.image_info.base64_code')}</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(imageInfo.base64)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('copy')}
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
              <CardTitle>{t('image.decode.title')}</CardTitle>
              <CardDescription>
                {t('image.decode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base64-input">{t('image.decode.input_label')}</Label>
                <Textarea
                  id="base64-input"
                  placeholder={t('image.decode.input_placeholder')}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBase64Decode}>{t('image.decode.decode_button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('image.encode.clear')}
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
              <CardTitle>{t('image.preview.title')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('image.preview.download')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleCopy(previewUrl)}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('image.preview.copy_base64')}
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
                    <p>{t('image.preview.base64_size')}: {formatFileSize(getBase64Size(base64Input))}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('image.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>{t('image.instructions.image_to_base64_desc')}</strong></p>
          <p><strong>{t('image.instructions.base64_to_image_desc')}</strong></p>
          <p><strong>{t('image.instructions.supported_formats_desc')}</strong></p>
          <p><strong>{t('image.instructions.file_limit_desc')}</strong></p>
          <p><strong>{t('image.instructions.use_cases_desc')}</strong></p>
        </CardContent>
      </Card>
    </div>
  );
} 