'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';

export default function UrlPage() {
  const t = useTranslations('coder.url');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const encodeUrl = (text: string) => {
    try {
      return encodeURIComponent(text);
    } catch (error) {
      throw new Error(t('errors.conversion_failed'));
    }
  };

  const decodeUrl = (text: string) => {
    try {
      return decodeURIComponent(text);
    } catch (error) {
      throw new Error(t('errors.conversion_failed'));
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error(t('errors.empty_input'));
      return;
    }

    try {
      const result = mode === 'encode' ? encodeUrl(input) : decodeUrl(input);
      setOutput(result);
      toast.success(mode === 'encode' ? t('success.encoded') : t('success.decoded'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.conversion_failed'));
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success(t('success.copied'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleTestUrl = () => {
    if (output) {
      try {
        // 检查是否是完整的URL
        if (output.startsWith('http://') || output.startsWith('https://')) {
          window.open(output, '_blank');
        } else {
          toast.error(t('errors.invalid_url'));
        }
      } catch (error) {
        toast.error(t('errors.conversion_failed'));
      }
    }
  };

  const handleQuickEncode = (text: string) => {
    setInput(text);
    setMode('encode');
  };

  const handleQuickDecode = (text: string) => {
    setInput(text);
    setMode('decode');
  };

  const examples = [
    {
      name: t('examples.chinese_text'),
      original: '你好世界',
      encoded: '%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C'
    },
    {
      name: t('examples.special_chars'),
      original: 'Hello World!@#$%',
      encoded: 'Hello%20World!%40%23%24%25'
    },
    {
      name: t('examples.url_params'),
      original: 'name=张三&age=25',
      encoded: 'name%3D%E5%BC%A0%E4%B8%89%26age%3D25'
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey={t('title')}
        subtitleKey={t('description')}
        features={[
          { key: t('features.url_safe'), color: 'blue' },
          { key: t('features.chinese_support'), color: 'green' },
          { key: t('features.parameter_encoding'), color: 'purple' }
        ]}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">{t('tabs.encode')}</TabsTrigger>
          <TabsTrigger value="decode">{t('tabs.decode')}</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('encode.title')}</CardTitle>
              <CardDescription>
                {t('encode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('encode.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('encode.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('encode.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('decode.title')}</CardTitle>
              <CardDescription>
                {t('decode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('decode.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('decode.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('decode.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('common.clear')}
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
              <CardTitle>{t('result.title')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('common.copy')}
                </Button>
                {mode === 'decode' && (
                  <Button variant="outline" size="sm" onClick={handleTestUrl}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('common.test_link')}
                  </Button>
                )}
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('examples.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {examples.map((example) => (
              <div key={example.name} className="space-y-2">
                <div className="font-medium">{example.name}</div>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">{t('examples.original_text')}:</span> {example.original}</div>
                  <div><span className="font-medium">{t('examples.encoded_result')}:</span> {example.encoded}</div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickEncode(example.original)}
                  >
                    {t('examples.encode')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickDecode(example.encoded)}
                  >
                    {t('examples.decode')}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('instructions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-medium">{t('instructions.url_encoding')}</span>
              {t('instructions.url_encoding_desc')}
            </div>
            <div>
              <span className="font-medium">{t('instructions.common_encoding')}</span>
              {t('instructions.common_encoding_desc')}
            </div>
            <div>
              <span className="font-medium">{t('instructions.use_cases')}</span>
              {t('instructions.use_cases_desc')}
            </div>
            <div>
              <span className="font-medium">{t('instructions.notes')}</span>
              {t('instructions.notes_desc')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 