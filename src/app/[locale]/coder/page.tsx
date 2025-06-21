import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import PageTitle from '@/components/PageTitle';
import { 
  Code2, 
  FileText, 
  Hash, 
  Image, 
  Lock, 
  QrCode, 
  Binary, 
  Globe,
  ArrowRight
} from 'lucide-react';

const tools = [
  {
    id: 'base64',
    name: 'Base64',
    description: 'Base64编码和解码工具',
    icon: Code2,
    href: '/coder/base64',
    color: 'text-blue-600'
  },
  {
    id: 'url',
    name: 'URL编码',
    description: 'URL编码和解码工具',
    icon: Globe,
    href: '/coder/url',
    color: 'text-green-600'
  },
  {
    id: 'hash',
    name: '哈希计算',
    description: 'MD5、SHA1、SHA256等哈希算法',
    icon: Hash,
    href: '/coder/hash',
    color: 'text-purple-600'
  },
  {
    id: 'jwt',
    name: 'JWT工具',
    description: 'JWT令牌解码和验证',
    icon: Lock,
    href: '/coder/jwt',
    color: 'text-red-600'
  },
  {
    id: 'qr',
    name: '二维码',
    description: '二维码生成和解码',
    icon: QrCode,
    href: '/coder/qr',
    color: 'text-orange-600'
  },
  {
    id: 'hex',
    name: '十六进制',
    description: '十六进制编码转换',
    icon: Binary,
    href: '/coder/hex',
    color: 'text-indigo-600'
  },
  {
    id: 'json',
    name: 'JSON格式化',
    description: 'JSON格式化和压缩',
    icon: FileText,
    href: '/coder/json',
    color: 'text-teal-600'
  },
  {
    id: 'image',
    name: '图片编码',
    description: '图片Base64编码转换',
    icon: Image,
    href: '/coder/image',
    color: 'text-pink-600'
  }
];

export default async function CoderPage() {
  const t = await getTranslations('coder');

  return (
    <div className="space-y-8">
      <PageTitle 
        titleKey="title"
        subtitleKey="description"
        features={[
          { key: 'features.encoding.title', color: 'blue' },
          { key: 'features.security.title', color: 'purple' }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} href={tool.href}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <tool.icon className={`w-8 h-8 ${tool.color}`} />
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  {t(`tools.${tool.id}.name`, { fallback: tool.name })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {t(`tools.${tool.id}.description`, { fallback: tool.description })}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t('features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {t('features.encoding.title')}
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Base64 编码/解码</li>
              <li>• URL 编码/解码</li>
              <li>• 十六进制转换</li>
              <li>• 图片Base64编码</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {t('features.security.title')}
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 多种哈希算法</li>
              <li>• JWT 令牌解析</li>
              <li>• 安全验证</li>
              <li>• 实时计算</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 