'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Copy, RotateCcw, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import CryptoJS from 'crypto-js';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';

interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

export default function HashPage() {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [salt, setSalt] = useState('');
  const [results, setResults] = useState<HashResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const algorithms = [
    { name: 'MD5', func: CryptoJS.MD5, description: '128位哈希值' },
    { name: 'SHA1', func: CryptoJS.SHA1, description: '160位哈希值' },
    { name: 'SHA256', func: CryptoJS.SHA256, description: '256位哈希值' },
    { name: 'SHA512', func: CryptoJS.SHA512, description: '512位哈希值' },
    { name: 'RIPEMD160', func: CryptoJS.RIPEMD160, description: '160位哈希值' },
    { name: 'SHA3', func: CryptoJS.SHA3, description: 'SHA3哈希值' }
  ];

  const calculateHashes = () => {
    if (!input.trim()) {
      toast.error(t('errors.empty_input'));
      return;
    }

    setIsCalculating(true);
    
    try {
      const newResults: HashResult[] = algorithms.map(({ name, func }) => {
        let hash: CryptoJS.lib.WordArray;
        if (salt) {
          // 使用盐值
          hash = func(input + salt);
        } else {
          hash = func(input);
        }
        
        return {
          algorithm: name,
          hash: hash.toString(),
          length: hash.toString().length
        };
      });

      setResults(newResults);
      toast.success(t('hash.success.calculation_complete'));
    } catch (error) {
      toast.error(t('hash.errors.calculation_failed'));
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success(t('hash.success.copied'));
  };

  const handleClear = () => {
    setInput('');
    setSalt('');
    setResults([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setInput(result);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadResults = () => {
    if (results.length > 0) {
      const content = results.map(result => 
        `${result.algorithm}: ${result.hash}`
      ).join('\n');
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hash_results.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const quickExamples = [
    t('hash.examples.hello_world'),
    t('hash.examples.password'),
    t('hash.examples.admin'),
    t('hash.examples.test_text')
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="hash.title"
        subtitleKey="hash.description"
        features={[
          { key: 'hash.features.multiple_algorithms', color: 'blue' },
          { key: 'hash.features.salt_encryption', color: 'green' },
          { key: 'hash.features.file_support', color: 'purple' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('hash.input.title')}</CardTitle>
          <CardDescription>
            {t('hash.input.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input">{t('hash.input.text_label')}</Label>
            <Textarea
              id="input"
              placeholder={t('hash.input.text_placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="salt">{t('hash.input.salt_label')}</Label>
            <Input
              id="salt"
              placeholder={t('hash.input.salt_placeholder')}
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={calculateHashes} disabled={isCalculating}>
              {isCalculating ? t('hash.input.calculating') : t('hash.input.calculate_button')}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('hash.input.clear')}
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t('hash.input.upload_file')}
            </Button>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".txt,.json,.xml,.html,.css,.js"
            />
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('hash.result.title')}</CardTitle>
              <Button variant="outline" size="sm" onClick={handleDownloadResults}>
                <Download className="w-4 h-4 mr-2" />
                {t('hash.result.download_results')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.algorithm} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{result.algorithm}</h4>
                      <p className="text-sm text-gray-500">
                        {t('hash.result.length')}: {result.length}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopy(result.hash)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {t('hash.result.copy')}
                    </Button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm break-all">
                    {result.hash}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('hash.examples.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickExamples.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setInput(example)}
                  className="w-full justify-start"
                >
                  {example}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('hash.instructions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="font-medium">{t('hash.instructions.md5')}</span>
              {t('hash.instructions.md5_desc')}
            </div>
            <div>
              <span className="font-medium">{t('hash.instructions.sha1')}</span>
              {t('hash.instructions.sha1_desc')}
            </div>
            <div>
              <span className="font-medium">{t('hash.instructions.sha256')}</span>
              {t('hash.instructions.sha256_desc')}
            </div>
            <div>
              <span className="font-medium">{t('hash.instructions.sha512')}</span>
              {t('hash.instructions.sha512_desc')}
            </div>
            <div>
              <span className="font-medium">{t('hash.instructions.salt')}</span>
              {t('hash.instructions.salt_desc')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 