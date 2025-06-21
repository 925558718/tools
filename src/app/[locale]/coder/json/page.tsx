'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Download, Upload, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';

export default function JsonPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'format' | 'minify' | 'validate' | 'convert'>('format');
  const [indentSize, setIndentSize] = useState(2);

  const formatJSON = (json: string, indent = 2): string => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, indent);
    } catch (error) {
      throw new Error(`JSON格式错误：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const minifyJSON = (json: string): string => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed);
    } catch (error) {
      throw new Error(`JSON格式错误：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const validateJSON = (json: string): { isValid: boolean; error?: string; size: number } => {
    try {
      const parsed = JSON.parse(json);
      const minified = JSON.stringify(parsed);
      return {
        isValid: true,
        size: minified.length
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : '未知错误',
        size: 0
      };
    }
  };

  const convertToCSV = (json: string): string => {
    try {
      const parsed = JSON.parse(json);
      
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('JSON必须是包含对象的数组');
      }

      const headers = Object.keys(parsed[0]);
      const csvRows = [headers.join(',')];

      for (const row of parsed) {
        const values = headers.map(header => {
          const value = row[header];
          // 如果值包含逗号、引号或换行符，需要用引号包围
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      }

      return csvRows.join('\n');
    } catch (error) {
      throw new Error(`转换失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleProcess = () => {
    if (!input.trim()) {
      toast.error('请输入JSON内容');
      return;
    }

    try {
      let result: string;
      
      switch (mode) {
        case 'format': {
          result = formatJSON(input, indentSize);
          break;
        }
        case 'minify': {
          result = minifyJSON(input);
          break;
        }
        case 'validate': {
          const validation = validateJSON(input);
          if (validation.isValid) {
            result = `✅ JSON格式有效\n文件大小: ${validation.size} 字符`;
            toast.success('JSON格式有效');
          } else {
            result = `❌ JSON格式无效\n错误: ${validation.error}`;
            toast.error('JSON格式无效');
          }
          break;
        }
        case 'convert': {
          result = convertToCSV(input);
          break;
        }
        default:
          throw new Error('未知的处理模式');
      }

      setOutput(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '处理失败');
    }
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('已复制到剪贴板');
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
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

  const handleDownload = () => {
    if (output) {
      const extension = mode === 'convert' ? 'csv' : 'json';
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `json_${mode}.${extension}`;
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
        titleKey="JSON 格式化工具"
        subtitleKey="JSON格式化、压缩、验证和转换为CSV的工具"
        features={[
          { key: '格式化', color: 'blue' },
          { key: '压缩', color: 'green' },
          { key: '验证', color: 'purple' }
        ]}
      />

      <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="format">格式化</TabsTrigger>
          <TabsTrigger value="minify">压缩</TabsTrigger>
          <TabsTrigger value="validate">验证</TabsTrigger>
          <TabsTrigger value="convert">转CSV</TabsTrigger>
        </TabsList>

        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON格式化</CardTitle>
              <CardDescription>
                将压缩的JSON格式化为易读的格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">JSON内容</Label>
                <Textarea
                  id="input"
                  placeholder="请输入要格式化的JSON..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <Label htmlFor="indent">缩进大小:</Label>
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
                <Button onClick={handleProcess}>格式化</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
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
              <CardTitle>JSON压缩</CardTitle>
              <CardDescription>
                将格式化的JSON压缩为单行格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">JSON内容</Label>
                <Textarea
                  id="input"
                  placeholder="请输入要压缩的JSON..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess}>压缩</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON验证</CardTitle>
              <CardDescription>
                验证JSON格式是否正确
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">JSON内容</Label>
                <Textarea
                  id="input"
                  placeholder="请输入要验证的JSON..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess}>验证</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convert" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>JSON转CSV</CardTitle>
              <CardDescription>
                将JSON数组转换为CSV格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input">JSON数组</Label>
                <Textarea
                  id="input"
                  placeholder="请输入JSON数组（如：[{...}, {...}]）..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleProcess}>转换</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  清空
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
              <CardTitle>处理结果</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  复制
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  下载
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
          <CardTitle>JSON示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {examples.map((example) => (
              <div key={example.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{example.name}</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(example.json)}
                  >
                    使用示例
                  </Button>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm overflow-x-auto">
                  <pre>{example.json}</pre>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>格式化：</strong>将压缩的JSON格式化为易读的格式，支持自定义缩进。</p>
          <p><strong>压缩：</strong>将格式化的JSON压缩为单行，减少文件大小。</p>
          <p><strong>验证：</strong>检查JSON格式是否正确，显示文件大小。</p>
          <p><strong>转CSV：</strong>将JSON数组转换为CSV格式，便于在Excel中查看。</p>
          <p><strong>注意事项：</strong>确保JSON格式正确，对象数组转换CSV时所有对象应具有相同的键。</p>
        </CardContent>
      </Card>
    </div>
  );
} 