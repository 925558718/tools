import { SupportedLocale } from '@/i18n/langMap';

export interface ColorStop {
  id: string;
  color: string;
  position: number;
}

export interface GradientConfig {
  type: "linear" | "radial";
  direction: string;
  stops: ColorStop[];
}

// 默认配置
export const defaultGradientConfig: GradientConfig = {
  type: "linear",
  direction: "90deg",
  stops: [
    { id: "1", color: "#2A7B9B", position: 0 },
    { id: "2", color: "#57C785", position: 50 },
    { id: "3", color: "#EDDD53", position: 100 }
  ]
};

// 线性渐变方向选项
export const getLinearDirections = (t: any) => [
  { value: "90deg", label: t('gradient.directions.to_right') },
  { value: "0deg", label: t('gradient.directions.to_top') },
  { value: "180deg", label: t('gradient.directions.to_bottom') },
  { value: "270deg", label: t('gradient.directions.to_left') },
  { value: "45deg", label: t('gradient.directions.to_top_right') },
  { value: "135deg", label: t('gradient.directions.to_bottom_right') },
  { value: "225deg", label: t('gradient.directions.to_bottom_left') },
  { value: "315deg", label: t('gradient.directions.to_top_left') }
];

// 径向渐变形状选项
export const getRadialShapes = (t: any) => [
  { value: "circle", label: t('gradient.shapes.circle') },
  { value: "ellipse", label: t('gradient.shapes.ellipse') },
  { value: "circle at center", label: t('gradient.shapes.circle_center') },
  { value: "ellipse at center", label: t('gradient.shapes.ellipse_center') },
  { value: "circle at top", label: t('gradient.shapes.circle_top') },
  { value: "circle at bottom", label: t('gradient.shapes.circle_bottom') }
];

// Tailwind 颜色映射表
export const tailwindColorMap: { [key: string]: string } = {
  // Reds
  "#fee2e2": "red-50", "#fecaca": "red-100", "#fca5a5": "red-200", "#f87171": "red-300",
  "#ef4444": "red-500", "#dc2626": "red-600", "#b91c1c": "red-700", "#991b1b": "red-800",
  // Blues  
  "#eff6ff": "blue-50", "#dbeafe": "blue-100", "#bfdbfe": "blue-200", "#93c5fd": "blue-300",
  "#60a5fa": "blue-400", "#3b82f6": "blue-500", "#2563eb": "blue-600", "#1d4ed8": "blue-700", "#1e40af": "blue-800",
  // Greens
  "#f0fdf4": "green-50", "#dcfce7": "green-100", "#bbf7d0": "green-200", "#86efac": "green-300",
  "#4ade80": "green-400", "#22c55e": "green-500", "#16a34a": "green-600", "#15803d": "green-700", "#166534": "green-800",
  // Purples & Violets
  "#faf5ff": "purple-50", "#f3e8ff": "purple-100", "#e9d5ff": "purple-200", "#c4b5fd": "purple-300",
  "#a78bfa": "purple-400", "#8b5cf6": "purple-500", "#7c3aed": "purple-600", "#6d28d9": "purple-700", "#5b21b6": "purple-800",
  "#5f27cd": "purple-600", // Custom mapping for your gradient color
  // Yellows & Ambers
  "#fefce8": "yellow-50", "#fef3c7": "yellow-100", "#fde68a": "yellow-200", "#fcd34d": "yellow-300",
  "#facc15": "yellow-400", "#eab308": "yellow-500", "#ca8a04": "yellow-600", "#a16207": "yellow-700", "#854d0e": "yellow-800",
  "#eddd53": "yellow-400", // Custom mapping for your gradient color
  // Teals & Cyans
  "#f0fdfa": "teal-50", "#ccfbf1": "teal-100", "#99f6e4": "teal-200", "#5eead4": "teal-300",
  "#2dd4bf": "teal-400", "#14b8a6": "teal-500", "#0d9488": "teal-600", "#0f766e": "teal-700",
  "#57c785": "emerald-400", // Custom mapping for your gradient color
  // Custom colors from your example
  "#2a7b9b": "sky-600", // Custom mapping for your gradient color
  // Grays
  "#f9fafb": "gray-50", "#f3f4f6": "gray-100", "#e5e7eb": "gray-200", "#d1d5db": "gray-300",
  "#9ca3af": "gray-400", "#6b7280": "gray-500", "#4b5563": "gray-600", "#374151": "gray-700",
  "#1f2937": "gray-800", "#111827": "gray-900",
  // Indigos
  "#eef2ff": "indigo-50", "#e0e7ff": "indigo-100", "#c7d2fe": "indigo-200", "#a5b4fc": "indigo-300",
  "#818cf8": "indigo-400", "#6366f1": "indigo-500", "#4f46e5": "indigo-600", "#4338ca": "indigo-700",
  // Sky colors
  "#f0f9ff": "sky-50", "#e0f2fe": "sky-100", "#bae6fd": "sky-200", "#7dd3fc": "sky-300",
  "#38bdf8": "sky-400", "#0ea5e9": "sky-500", "#0284c7": "sky-600", "#0369a1": "sky-700",
  // Others
  "#000000": "black", "#ffffff": "white"
};

// 随机颜色生成
export const generateRandomColor = (): string => {
  const colors = [
    "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57",
    "#ff9ff3", "#54a0ff", "#5f27cd", "#00d2d3", "#ff9f43",
    "#10ac84", "#ee5253", "#0abde3", "#3867d6", "#8c7ae6"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 生成随机渐变配置
export const generateRandomGradientConfig = (t: any): GradientConfig => {
  const randomType = Math.random() > 0.5 ? "linear" : "radial";
  const linearDirections = getLinearDirections(t);
  const radialShapes = getRadialShapes(t);
  
  const randomDirection = randomType === "linear" 
    ? linearDirections[Math.floor(Math.random() * linearDirections.length)].value
    : radialShapes[Math.floor(Math.random() * radialShapes.length)].value;
  
  const stopCount = Math.floor(Math.random() * 3) + 2; // 2-4 stops
  const stops: ColorStop[] = [];
  
  for (let i = 0; i < stopCount; i++) {
    stops.push({
      id: (i + 1).toString(),
      color: generateRandomColor(),
      position: i === 0 ? 0 : i === stopCount - 1 ? 100 : Math.floor(Math.random() * 80) + 10
    });
  }
  
  // Sort stops by position
  stops.sort((a, b) => a.position - b.position);
  
  return {
    type: randomType,
    direction: randomDirection,
    stops
  };
};

// 工具函数
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: Number.parseInt(result[1], 16),
    g: Number.parseInt(result[2], 16),
    b: Number.parseInt(result[3], 16)
  } : null;
};

// 计算颜色距离
export const colorDistance = (hex1: string, hex2: string): number => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return Number.POSITIVE_INFINITY;
  
  return Math.sqrt(
    (rgb1.r - rgb2.r)**2 +
    (rgb1.g - rgb2.g)**2 +
    (rgb1.b - rgb2.b)**2
  );
};

// 将十六进制颜色转换为最接近的 Tailwind 颜色
export const hexToTailwindColor = (hex: string): string => {
  const normalizedHex = hex.toLowerCase();
  
  // Direct match
  if (tailwindColorMap[normalizedHex]) {
    return tailwindColorMap[normalizedHex];
  }
  
  // Find closest color by RGB distance (simplified)
  let closestColor = `[${hex}]`;
  let minDistance = Number.POSITIVE_INFINITY;
  
  for (const [colorHex, tailwindClass] of Object.entries(tailwindColorMap)) {
    const distance = colorDistance(hex, colorHex);
    if (distance < minDistance && distance < 80) { // Increased threshold for better matching
      minDistance = distance;
      closestColor = tailwindClass;
    }
  }
  
  // If we found a reasonably close match, use it
  if (minDistance < 80) {
    return closestColor;
  }
  
  return `[${hex}]`;
};

// 生成 CSS 渐变字符串
export const generateCSS = (config: GradientConfig): string => {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  const stopsString = sortedStops
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(", ");

  if (config.type === "linear") {
    return `linear-gradient(${config.direction}, ${stopsString})`;
  } 
  return `radial-gradient(${config.direction}, ${stopsString})`;
};

// 生成 Tailwind CSS 类
export const generateTailwind = (config: GradientConfig, tailwindVersion: "v3" | "v4"): string => {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  
  // Get direction string based on version
  const getDirection = () => {
    if (config.type === "linear") {
      const v4Directions: { [key: string]: string } = {
        "0deg": "bg-linear-to-t",
        "45deg": "bg-linear-to-tr", 
        "90deg": "bg-linear-to-r",
        "135deg": "bg-linear-to-br",
        "180deg": "bg-linear-to-b",
        "225deg": "bg-linear-to-bl",
        "270deg": "bg-linear-to-l",
        "315deg": "bg-linear-to-tl"
      };
      
      const v3Directions: { [key: string]: string } = {
        "0deg": "bg-gradient-to-t",
        "45deg": "bg-gradient-to-tr",
        "90deg": "bg-gradient-to-r", 
        "135deg": "bg-gradient-to-br",
        "180deg": "bg-gradient-to-b",
        "225deg": "bg-gradient-to-bl",
        "270deg": "bg-gradient-to-l",
        "315deg": "bg-gradient-to-tl"
      };
      
      const directions = tailwindVersion === "v4" ? v4Directions : v3Directions;
      return directions[config.direction] || (tailwindVersion === "v4" ? "bg-linear-to-r" : "bg-gradient-to-r");
    } 
    return tailwindVersion === "v4" ? "bg-radial" : "bg-gradient-radial";
  };

  // Try to generate Tailwind classes with position support
  const classes = [getDirection()];
  
  // Handle different numbers of stops
  if (sortedStops.length === 2) {
    const fromColor = hexToTailwindColor(sortedStops[0].color);
    const toColor = hexToTailwindColor(sortedStops[1].color);
    
    // Add from color and position
    classes.push(`from-${fromColor}`);
    if (sortedStops[0].position !== 0) {
      classes.push(`from-${sortedStops[0].position}%`);
    }
    
    // Add to color and position
    classes.push(`to-${toColor}`);
    if (sortedStops[1].position !== 100) {
      classes.push(`to-${sortedStops[1].position}%`);
    }
    
    // Only use standard classes if colors are in Tailwind palette
    if (!fromColor.includes('[') && !toColor.includes('[')) {
      return classes.join(' ');
    }
  } 
  
  if (sortedStops.length === 3) {
    const fromColor = hexToTailwindColor(sortedStops[0].color);
    const viaColor = hexToTailwindColor(sortedStops[1].color);
    const toColor = hexToTailwindColor(sortedStops[2].color);
    
    // Add from color and position
    classes.push(`from-${fromColor}`);
    if (sortedStops[0].position !== 0) {
      classes.push(`from-${sortedStops[0].position}%`);
    }
    
    // Add via color and position
    classes.push(`via-${viaColor}`);
    if (sortedStops[1].position !== 50) {
      classes.push(`via-${sortedStops[1].position}%`);
    }
    
    // Add to color and position
    classes.push(`to-${toColor}`);
    if (sortedStops[2].position !== 100) {
      classes.push(`to-${sortedStops[2].position}%`);
    }
    
    // Only use standard classes if colors are in Tailwind palette
    if (!fromColor.includes('[') && !viaColor.includes('[') && !toColor.includes('[')) {
      return classes.join(' ');
    }
  }
  
  if (sortedStops.length > 3) {
    // For more than 3 colors, we can still try to use Tailwind syntax with arbitrary values
    // Use first color as from, last as to, and try to fit middle colors as via
    const fromColor = hexToTailwindColor(sortedStops[0].color);
    const toColor = hexToTailwindColor(sortedStops[sortedStops.length - 1].color);
    
    classes.push(`from-${fromColor}`);
    if (sortedStops[0].position !== 0) {
      classes.push(`from-${sortedStops[0].position}%`);
    }
    
    // Add middle colors as via with arbitrary values if needed
    const middleStops = sortedStops.slice(1, -1);
    if (middleStops.length === 1) {
      const viaColor = hexToTailwindColor(middleStops[0].color);
      classes.push(`via-${viaColor}`);
      if (middleStops[0].position !== 50) {
        classes.push(`via-${middleStops[0].position}%`);
      }
    }
    
    if (middleStops.length > 1) {
      // For multiple middle colors, use arbitrary value for via
      const viaColors = middleStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
      classes.push(`via-[${viaColors}]`);
    }
    
    classes.push(`to-${toColor}`);
    if (sortedStops[sortedStops.length - 1].position !== 100) {
      classes.push(`to-${sortedStops[sortedStops.length - 1].position}%`);
    }
    
    // Check if we can use standard classes
    if (!fromColor.includes('[') && !toColor.includes('[') && middleStops.length <= 1) {
      const viaColor = middleStops.length > 0 ? hexToTailwindColor(middleStops[0].color) : '';
      if (middleStops.length === 0 || !viaColor.includes('[')) {
        return classes.join(' ');
      }
    }
  }
  
  // Fallback to arbitrary value for complex gradients
  const fallbackCSS = generateCSS(config).replace(/\s+/g, '_');
  return `bg-[${fallbackCSS}]`;
};

// 简化渐变为3种颜色
export const simplifyGradient = (config: GradientConfig): GradientConfig => {
  const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
  
  if (sortedStops.length <= 3) {
    // Already simple, just adjust positions
    const newStops = sortedStops.map((stop, index) => ({
      ...stop,
      position: index === 0 ? 0 : index === sortedStops.length - 1 ? 100 : 50
    }));
    return { ...config, stops: newStops };
  }
  
  // Reduce to 3 colors: first, middle, last
  const firstStop = sortedStops[0];
  const lastStop = sortedStops[sortedStops.length - 1];
  const middleIndex = Math.floor(sortedStops.length / 2);
  const middleStop = sortedStops[middleIndex];
  
  const newStops = [
    { ...firstStop, position: 0 },
    { ...middleStop, position: 50 },
    { ...lastStop, position: 100 }
  ];
  
  return {
    ...config,
    stops: newStops
  };
}; 