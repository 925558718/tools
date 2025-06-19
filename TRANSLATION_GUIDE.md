# 翻译系统使用指南

## 概述

本项目采用了按页面分离的翻译文件结构，每个页面都有自己独立的翻译文件，便于维护和管理。

## 翻译文件结构

```
public/i18n/
├── common/           # 通用翻译（导航、页脚等）
│   ├── en.json
│   └── zh-CN.json
├── navigation/       # 导航相关翻译
│   ├── en.json
│   └── zh-CN.json
├── home/            # 首页翻译
│   ├── en.json
│   └── zh-CN.json
└── css/
    └── gradient/    # 渐变生成器页面翻译
        ├── en.json
        └── zh-CN.json
```

## 翻译加载逻辑

### 1. 自动合并翻译文件

系统会根据当前页面路径自动加载并合并以下翻译文件：

- **基础翻译**：`common` + `navigation`（所有页面都需要）
- **页面翻译**：根据路径加载对应的页面翻译文件

### 2. 路径匹配规则

- `/` → 加载 `common` + `navigation` + `home`
- `/css/gradient` → 加载 `common` + `navigation` + `css/gradient`
- `/css/*` → 加载 `common` + `navigation` + `css`

### 3. 翻译优先级

翻译键的优先级（从高到低）：
1. 页面特定翻译
2. 导航翻译
3. 通用翻译

## 使用方法

### 在页面组件中使用

```tsx
// 在页面组件中加载页面特定翻译
import { NextIntlClientProvider } from "next-intl";
import { loadDictionaryByRoute } from "@/i18n/langMap";

export default async function MyPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);
  
  // 加载页面特定翻译
  const dictionary = await loadDictionaryByRoute("/my-page", locale);
  
  return (
    <NextIntlClientProvider locale={locale} messages={dictionary}>
      {/* 页面内容 */}
    </NextIntlClientProvider>
  );
}
```

### 在客户端组件中使用

```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 在服务器组件中使用

```tsx
import { getPageTranslations } from '@/i18n/request';

export default async function MyServerComponent({ locale }: { locale: string }) {
  const t = await getPageTranslations('/my-page', locale);
  
  return (
    <div>
      <h1>{t.title}</h1>
      <p>{t.description}</p>
    </div>
  );
}
```

## 添加新页面翻译

### 1. 创建翻译文件

在 `public/i18n/` 下创建对应的目录和文件：

```json
// public/i18n/my-page/en.json
{
  "title": "My Page Title",
  "description": "Page description",
  "meta": {
    "title": "SEO Title",
    "description": "SEO Description",
    "keywords": "seo, keywords"
  }
}
```

```json
// public/i18n/my-page/zh-CN.json
{
  "title": "我的页面标题",
  "description": "页面描述",
  "meta": {
    "title": "SEO标题",
    "description": "SEO描述",
    "keywords": "seo, 关键词"
  }
}
```

### 2. 更新路径匹配规则

在 `src/i18n/langMap.ts` 的 `getDictionaryPathsFromRoute` 函数中添加新路径：

```typescript
export function getDictionaryPathsFromRoute(pathname: string): string[] {
  const basePaths = ['common', 'navigation'];
  
  // 添加新页面路径匹配
  if (pathWithoutLocale.startsWith('my-page')) {
    return [...basePaths, 'my-page'];
  }
  
  // ... 其他路径
}
```

### 3. 创建页面layout（可选）

如果需要页面特定的元数据，可以创建layout.tsx：

```tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { loadDictionaryByRoute } from "@/i18n/langMap";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);
  const dictionary = await loadDictionaryByRoute("/my-page", locale);
  
  return {
    title: dictionary.meta?.title || dictionary.title,
    description: dictionary.meta?.description || dictionary.description,
  };
}

export default async function MyPageLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = getNormalizedLocale(resolvedParams.locale || defaultLocale);
  const dictionary = await loadDictionaryByRoute("/my-page", locale);
  
  return (
    <NextIntlClientProvider locale={locale} messages={dictionary}>
      {children}
    </NextIntlClientProvider>
  );
}
```

## 最佳实践

1. **保持翻译键的一致性**：使用相同的键名在不同页面中表示相同的内容
2. **使用嵌套结构**：对于复杂的翻译，使用嵌套对象组织
3. **提供默认值**：在组件中为翻译键提供默认值，避免显示错误
4. **分离关注点**：将SEO相关的翻译放在 `meta` 对象中
5. **使用TypeScript**：为翻译对象定义类型，提高开发体验

## 故障排除

### 翻译不显示
- 检查翻译文件路径是否正确
- 确认翻译键是否存在
- 验证NextIntlClientProvider是否正确包装

### 翻译文件加载失败
- 检查文件路径和命名
- 确认JSON格式是否正确
- 查看控制台错误信息

### 页面特定翻译不生效
- 确认路径匹配规则是否正确
- 检查页面layout是否正确加载翻译
- 验证翻译文件是否包含所需键 