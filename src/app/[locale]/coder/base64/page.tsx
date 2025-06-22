'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, Download, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';
import { encodeBase64, decodeBase64, fileToBase64 } from '@/lib/coder';

export default function Base64Page() {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error(t('base64.errors.empty_input'));
      return;
    }

    try {
      const result = mode === 'encode' ? encodeBase64(input) : decodeBase64(input);
      
      if (result.success && result.data) {
        setOutput(result.data);
        toast.success(mode === 'encode' ? t('base64.success.encoded') : t('base64.success.decoded'));
      } else {
        toast.error(result.error || t('base64.errors.conversion_failed'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('base64.errors.conversion_failed'));
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success(t('base64.success.copied'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await fileToBase64(file);
      if (result.success && result.data) {
        setInput(result.data);
      } else {
        toast.error(result.error || t('base64.errors.file_upload_failed'));
      }
    }
  };

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `base64_${mode === 'encode' ? 'encoded' : 'decoded'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="base64.title"
        subtitleKey="base64.description"
        features={[
          { key: 'base64.features.text_encoding', color: 'blue' },
          { key: 'base64.features.file_support', color: 'green' },
          { key: 'base64.features.chinese_support', color: 'purple' }
        ]}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">{t('base64.tabs.encode')}</TabsTrigger>
          <TabsTrigger value="decode">{t('base64.tabs.decode')}</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('base64.encode.title')}</CardTitle>
              <CardDescription>
                {t('base64.encode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('base64.encode.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('base64.encode.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('base64.encode.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('base64.common.clear')}
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('base64.common.upload_file')}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="*/*"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('base64.decode.title')}</CardTitle>
              <CardDescription>
                {t('base64.decode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('base64.decode.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('base64.decode.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('base64.decode.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('base64.common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {output && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('base64.result.title')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('base64.common.copy')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('base64.common.download')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              rows={6}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('base64.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>{t('base64.instructions.encode_mode')}</strong>{t('base64.instructions.encode_desc')}</p>
          <p><strong>{t('base64.instructions.decode_mode')}</strong>{t('base64.instructions.decode_desc')}</p>
          <p><strong>{t('base64.instructions.file_support')}</strong>{t('base64.instructions.file_desc')}</p>
          <p><strong>{t('base64.instructions.notes')}</strong>{t('base64.instructions.notes_desc')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 