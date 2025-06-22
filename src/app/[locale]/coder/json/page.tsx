'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Download, Upload, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { processJSON, fileToJSON, JsonMode } from '@/lib/coder';

export default function JsonPage() {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<JsonMode>('format');
  const [indentSize, setIndentSize] = useState(2);

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error(t('json.errors.empty_input'));
      return;
    }

    try {
      const result = processJSON(input, mode, indentSize);
      
      if (result.success && result.data) {
        setOutput(result.data);
      } else {
        setOutput(result.error || t('json.errors.parse_error'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setOutput(`❌ ${t('json.errors.parse_error')}: ${errorMessage}`);
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success(t('json.success.copied'));
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await fileToJSON(file);
    if (result.success && result.data) {
      setInput(result.data);
    } else {
      toast.error(result.error || t('json.errors.file_upload_failed'));
    }
  };

  const handleDownload = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `json-${mode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const examples = [
    {
      name: '简单对象',
      json: '{"name":"张三","age":25,"city":"北京"}'
    },
    {
      name: '嵌套对象',
      json: '{"user":{"name":"李四","profile":{"email":"lisi@example.com","phone":"13800138000"}},"settings":{"theme":"dark","language":"zh-CN"}}'
    },
    {
      name: '数组对象',
      json: '[{"id":1,"name":"产品A","price":99.99},{"id":2,"name":"产品B","price":199.99},{"id":3,"name":"产品C","price":299.99}]'
    }
  ];

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="json.title"
        subtitleKey="json.description"
        features={[
          { key: 'json.features.formatting', color: 'blue' },
          { key: 'json.features.compression', color: 'green' },
          { key: 'json.features.validation', color: 'purple' }
        ]}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="format">{t('json.tabs.format')}</TabsTrigger>
          <TabsTrigger value="minify">{t('json.tabs.minify')}</TabsTrigger>
          <TabsTrigger value="validate">{t('json.tabs.validate')}</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('json.format.title')}</CardTitle>
              <CardDescription>
                {t('json.format.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('json.format.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('json.format.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Label htmlFor="indent">{t('json.format.indent_label')}:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIndentSize(Math.max(1, indentSize - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{indentSize}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIndentSize(Math.min(8, indentSize + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleProcess}>{t('json.format.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('json.common.clear')}
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  {t('json.common.upload')}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".json,.txt"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="minify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('json.minify.title')}</CardTitle>
              <CardDescription>
                {t('json.minify.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('json.minify.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('json.minify.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess}>{t('json.minify.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('json.common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('json.validate.title')}</CardTitle>
              <CardDescription>
                {t('json.validate.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">{t('json.validate.input_label')}</Label>
                <Textarea
                  id="input"
                  placeholder={t('json.validate.input_placeholder')}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess}>{t('json.validate.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('json.common.clear')}
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
              <CardTitle>{t('json.result.title')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copy')}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('json.common.download')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              rows={12}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('json.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>{t('json.instructions.formatting')}</strong>{t('json.instructions.formatting_desc')}</p>
          <p><strong>{t('json.instructions.validation')}</strong>{t('json.instructions.validation_desc')}</p>
          <p><strong>{t('json.instructions.compression')}</strong>{t('json.instructions.compression_desc')}</p>
          <p><strong>{t('json.instructions.syntax')}</strong>{t('json.instructions.syntax_desc')}</p>
          <p><strong>{t('json.instructions.use_cases')}</strong>{t('json.instructions.use_cases_desc')}</p>
        </CardContent>
      </Card>
    </div>
  );
} 