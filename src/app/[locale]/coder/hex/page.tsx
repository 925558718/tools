'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';

export default function HexPage() {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'text-to-hex' | 'hex-to-text' | 'text-to-binary' | 'binary-to-text'>('text-to-hex');

  const textToHex = (text: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const hexToText = (hex: string) => {
    try {
      const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
      if (cleanHex.length % 2 !== 0) {
        throw new Error(t('errors.invalid_hex'));
      }
      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        const byte = Number.parseInt(cleanHex.substr(i, 2), 16);
        if (Number.isNaN(byte)) {
          throw new Error(t('errors.invalid_hex'));
        }
        bytes[i / 2] = byte;
      }
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : t('errors.conversion_failed'));
    }
  };

  const textToBinary = (text: string) => {
    // 检查是否是纯数字（包括小数）
    const numberRegex = /^-?\d+(\.\d+)?$/;
    if (numberRegex.test(text.trim())) {
      // 如果是数字，转换为数字的二进制
      const num = Number(text);
      if (Number.isInteger(num)) {
        return num.toString(2);
      }
      // 对于小数，显示整数部分的二进制
      return Math.floor(num).toString(2);
    }
    // 如果是文本，转换为ASCII码的二进制
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes).map(byte => byte.toString(2).padStart(8, '0')).join(' ');
  };

  const binaryToText = (binary: string) => {
    try {
      const cleanBinary = binary.replace(/[^01]/g, '');
      if (cleanBinary.length % 8 !== 0) {
        throw new Error(t('errors.invalid_binary'));
      }
      const bytes = new Uint8Array(cleanBinary.length / 8);
      for (let i = 0; i < cleanBinary.length; i += 8) {
        const byte = Number.parseInt(cleanBinary.substr(i, 8), 2);
        if (Number.isNaN(byte)) {
          throw new Error(t('errors.invalid_binary'));
        }
        bytes[i / 8] = byte;
      }
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : t('errors.conversion_failed'));
    }
  };

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error(t('errors.empty_input'));
      return;
    }
    try {
      let result = '';
      switch (mode) {
        case 'text-to-hex':
          result = textToHex(input);
          break;
        case 'hex-to-text':
          result = hexToText(input);
          break;
        case 'text-to-binary':
          result = textToBinary(input);
          break;
        case 'binary-to-text':
          result = binaryToText(input);
          break;
      }
      setOutput(result);
      toast.success(t('success.converted'));
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

  const handleSwap = () => {
    setInput(output);
    setOutput('');
  };

  const examples = [
    {
      name: t('hex.examples.text_to_hex'),
      input: 'Hello World',
      output: '48656c6c6f20576f726c64',
      mode: 'text-to-hex' as const
    },
    {
      name: t('hex.examples.hex_to_text'),
      input: '48656c6c6f20576f726c64',
      output: 'Hello World',
      mode: 'hex-to-text' as const
    },
    {
      name: t('hex.examples.chinese_text'),
      input: '你好世界',
      output: 'e4bda0e5a5bde4b896e7958c',
      mode: 'text-to-hex' as const
    },
    {
      name: t('hex.examples.text_to_binary'),
      input: 'ABC',
      output: '01000001 01000010 01000011',
      mode: 'text-to-binary' as const
    },
    {
      name: t('hex.examples.number_to_binary'),
      input: '42',
      output: '101010',
      mode: 'text-to-binary' as const
    }
  ];

  const loadExample = (example: typeof examples[0]) => {
    setInput(example.input);
    setMode(example.mode);
    setOutput('');
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="hex.title"
        subtitleKey="hex.description"
        features={[
          { key: 'hex.features.text_to_hex', color: 'blue' },
          { key: 'hex.features.hex_to_text', color: 'green' },
          { key: 'hex.features.binary_support', color: 'purple' }
        ]}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="text-to-hex">{t('tabs.text_to_hex')}</TabsTrigger>
          <TabsTrigger value="hex-to-text">{t('tabs.hex_to_text')}</TabsTrigger>
          <TabsTrigger value="text-to-binary">{t('tabs.binary')}</TabsTrigger>
          <TabsTrigger value="binary-to-text">{t('binary.binary_to_text')}</TabsTrigger>
        </TabsList>

        <TabsContent value="text-to-hex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('text_to_hex.title')}</CardTitle>
              <CardDescription>
                {t('text_to_hex.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('text_to_hex.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('text_to_hex.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('text_to_hex.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hex-to-text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('hex_to_text.title')}</CardTitle>
              <CardDescription>
                {t('hex_to_text.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('hex_to_text.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('hex_to_text.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('hex_to_text.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text-to-binary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('binary.title')}</CardTitle>
              <CardDescription>
                {t('binary.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('binary.text_input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('binary.text_input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('binary.convert_to_binary')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="binary-to-text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('binary.binary_to_text')}</CardTitle>
              <CardDescription>
                {t('binary.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('binary.binary_input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('binary.binary_input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvert}>{t('binary.convert_to_text')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('clear')}
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
                  {t('copy')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleSwap}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  {t('clear')}
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
          <CardTitle>{t('hex.examples.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((example) => (
              <div key={example.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{example.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadExample(example)}
                  >
                    {t('hex.examples.load_example')}
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('hex.examples.original')}</p>
                    <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono break-all">
                      {example.input}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">{t('hex.examples.hex')}</p>
                    <p className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono break-all">
                      {example.output}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('hex.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>{t('hex.instructions.text_to_hex')}</strong>{t('hex.instructions.text_to_hex_desc')}</p>
          <p><strong>{t('hex.instructions.hex_to_text')}</strong>{t('hex.instructions.hex_to_text_desc')}</p>
          <p><strong>{t('hex.instructions.binary')}</strong>{t('hex.instructions.binary_desc')}</p>
          <p><strong>{t('hex.instructions.format')}</strong>{t('hex.instructions.format_desc')}</p>
          <p><strong>{t('hex.instructions.use_cases')}</strong>{t('hex.instructions.use_cases_desc')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 