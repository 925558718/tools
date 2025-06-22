import { MetadataRoute } from "next";
import { supportedLocales, defaultLocale } from "@/i18n/langMap";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://tools.limgx.com";

  // 按优先级和功能分类的路由列表
  const routes = [
    // 主要页面
    {
      path: "/", // 主页
      priority: 1.0,
      changeFreq: "weekly" as const,
      description: "工具集合主页",
    },
    
    // Coder 工具页面（编解码工具）
    {
      path: "/coder/base64", // Base64编解码
      priority: 0.8,
      changeFreq: "monthly" as const,
      description: "Base64编解码工具",
    },
    {
      path: "/coder/url", // URL编解码
      priority: 0.8,
      changeFreq: "monthly" as const,
      description: "URL编解码工具",
    },
    {
      path: "/coder/hex", // 十六进制编解码
      priority: 0.7,
      changeFreq: "monthly" as const,
      description: "十六进制编解码工具",
    },
    {
      path: "/coder/hash", // 哈希生成
      priority: 0.7,
      changeFreq: "monthly" as const,
      description: "哈希值生成工具",
    },
    {
      path: "/coder/json", // JSON格式化
      priority: 0.8,
      changeFreq: "monthly" as const,
      description: "JSON格式化工具",
    },
    {
      path: "/coder/jwt", // JWT解析
      priority: 0.7,
      changeFreq: "monthly" as const,
      description: "JWT令牌解析工具",
    },
    {
      path: "/coder/qr", // 二维码生成
      priority: 0.8,
      changeFreq: "monthly" as const,
      description: "二维码生成器",
    },
    {
      path: "/coder/image", // 图像处理
      priority: 0.7,
      changeFreq: "monthly" as const,
      description: "图像处理工具",
    },
    
    // CSS 工具页面
    {
      path: "/css/gradient", // CSS渐变生成器
      priority: 0.8,
      changeFreq: "weekly" as const,
      description: "CSS渐变生成器工具",
    },
    
    // Cryption 工具页面（密码学工具）
    {
      path: "/cryption/keygen", // 密钥生成
      priority: 0.7,
      changeFreq: "monthly" as const,
      description: "密钥生成工具",
    },
  ];

  const currentDate = new Date().toISOString();

  // 生成所有语言和路由的组合
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // 为每个路由和每种语言生成条目
  for (const route of routes) {
    // 为默认语言生成无语言前缀的URL（默认路径）
    sitemapEntries.push({
      url: `${baseUrl}${route.path}`,
      lastModified: currentDate,
      changeFrequency: route.changeFreq,
      priority: route.priority,
    });
    
    // 为每种支持的语言生成带语言前缀的URL
    for (const locale of supportedLocales) {
      // 默认语言已经添加过了（没有前缀）
      if (locale === defaultLocale) continue;

      // 添加带语言前缀的URL
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: currentDate,
        changeFrequency: route.changeFreq,
        priority: route.priority,
      });
    }
  }

  return sitemapEntries;
}
