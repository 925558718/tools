"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { Copy, Plus, Trash2, RotateCcw, Shuffle, Baby } from "lucide-react";
import { toast } from "sonner";
import { 
  ColorStop, 
  GradientConfig, 
  defaultGradientConfig,
  getLinearDirections,
  getRadialShapes,
  generateRandomColor,
  generateRandomGradientConfig,
  generateCSS,
  generateTailwind,
  simplifyGradient
} from "./config";

const GradientGenerator = () => {
  const t = useTranslations();
  
  const [config, setConfig] = useState<GradientConfig>(defaultGradientConfig);
  const [outputFormat, setOutputFormat] = useState<"css" | "tailwind">("css");
  const [tailwindVersion, setTailwindVersion] = useState<"v3" | "v4">("v4");
  const [dragging, setDragging] = useState<{ id: string; startX: number; startPosition: number } | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [isDragEnd, setIsDragEnd] = useState(false);
  const gradientBarRef = useRef<HTMLDivElement>(null);

  // 获取方向选项
  const linearDirections = getLinearDirections(t);
  const radialShapes = getRadialShapes(t);

  // Handle gradient bar click to add color stop
  const handleGradientBarClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientBarRef.current || dragging || isDragEnd) return;
    
    // Check if click is on a color stop handle or popover content
    const target = event.target as HTMLElement;
    const isColorStop = target.closest('[data-color-stop]');
    const isPopoverContent = target.closest('[data-radix-popper-content-wrapper]') || target.closest('[role="dialog"]');
    if (isColorStop || isPopoverContent) return;
    
    const rect = gradientBarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.round((x / rect.width) * 100);
    
    // Ensure percentage is within bounds
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    // Generate a new color stop
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: generateRandomColor(),
      position: clampedPercentage
    };
    
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    
    toast.success(t('messages.added_color_stop', { percentage: clampedPercentage }));
  };

  // Handle drag start
  const handleDragStart = useCallback((event: React.MouseEvent, stopId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!gradientBarRef.current) return;
    
    const stop = config.stops.find(s => s.id === stopId);
    if (!stop) return;
    
    setIsDragEnd(false);
    setDragging({
      id: stopId,
      startX: event.clientX,
      startPosition: stop.position
    });
  }, [config.stops]);

  // Handle drag with throttling for better performance
  const handleDrag = useCallback((event: MouseEvent) => {
    if (!dragging || !gradientBarRef.current) return;
    
    const rect = gradientBarRef.current.getBoundingClientRect();
    const deltaX = event.clientX - dragging.startX;
    const deltaPercentage = (deltaX / rect.width) * 100;
    const newPosition = Math.max(0, Math.min(100, dragging.startPosition + deltaPercentage));
    
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === dragging.id ? { ...stop, position: Math.round(newPosition) } : stop
      )
    }));
  }, [dragging]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragging(null);
    setIsDragEnd(true);
    
    // Reset the flag after a short delay to prevent accidental clicks
    setTimeout(() => {
      setIsDragEnd(false);
    }, 100);
  }, []);

  // Mouse event listeners with improved performance
  React.useEffect(() => {
    if (dragging) {
      const throttledHandleDrag = (event: MouseEvent) => {
        event.preventDefault();
        handleDrag(event);
      };

      document.addEventListener('mousemove', throttledHandleDrag, { passive: false });
      document.addEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', throttledHandleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [dragging, handleDrag, handleDragEnd]);

  // Add new color stop
  const addColorStop = () => {
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: generateRandomColor(),
      position: 50
    };
    setConfig(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
  };

  // Remove color stop
  const removeColorStop = (id: string) => {
    if (config.stops.length > 2) {
      setConfig(prev => ({
        ...prev,
        stops: prev.stops.filter(stop => stop.id !== id)
      }));
    }
  };

  // Update color stop
  const updateColorStop = (id: string, updates: Partial<ColorStop>) => {
    setConfig(prev => ({
      ...prev,
      stops: prev.stops.map(stop => 
        stop.id === id ? { ...stop, ...updates } : stop
      )
    }));
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('messages.copied'));
  };

  // Reset to default
  const resetGradient = () => {
    setConfig(defaultGradientConfig);
  };

  // Generate random gradient
  const generateRandomGradient = () => {
    setConfig(generateRandomGradientConfig(t));
  };

  // Simplify gradient
  const handleSimplifyGradient = () => {
    const simplifiedConfig = simplifyGradient(config);
    setConfig(simplifiedConfig);
    
    if (config.stops.length <= 3) {
      toast.success(t('messages.positions_adjusted'));
    } else {
      const sortedStops = [...config.stops].sort((a, b) => a.position - b.position);
      const firstStop = sortedStops[0];
      const lastStop = sortedStops[sortedStops.length - 1];
      const middleIndex = Math.floor(sortedStops.length / 2);
      const middleStop = sortedStops[middleIndex];
      const colors = `${firstStop.color}, ${middleStop.color}, ${lastStop.color}`;
      toast.success(t('messages.simplified_to_3', { colors }));
    }
  };

  const cssGradient = generateCSS(config);
  const tailwindGradient = generateTailwind(config, tailwindVersion);

  return (
    <>
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradient-shift 4s ease infinite;
        }
        
        .gradient-title {
          font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-weight: 900;
          font-size: 3.5rem;
          letter-spacing: -0.025em;
          background: linear-gradient(
            -45deg,
            #ee7752,
            #e73c7e,
            #23a6d5,
            #23d5ab,
            #7dd3fc,
            #c084fc,
            #fb7185
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease infinite;
          text-shadow: 0 0 30px rgba(238, 119, 82, 0.3);
          filter: drop-shadow(0 0 10px rgba(199, 125, 255, 0.4));
        }
        
        @media (max-width: 768px) {
          .gradient-title {
            font-size: 2.5rem;
          }
        }
      `}</style>
      
      <div className="min-h-screen w-full relative overflow-hidden">
        {/* 背景渐变装饰 - 与其他页面保持一致 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-indigo-900/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />

        <main className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h1 className="gradient-title mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
            
            {/* 特性标签 */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>{t('features.live_preview')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>{t('features.css_tailwind')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                <span>{t('features.interactive_editor')}</span>
              </div>
            </div>
          </div>

          {/* 玻璃效果容器 - 与其他页面保持一致 */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-slate-700/20 shadow-xl">
            {/* Live Preview at top - Now rectangular */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('preview.title')}</CardTitle>
                <CardDescription>{t('preview.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-64 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm mb-4"
                  style={{ background: cssGradient }}
                />
                
                {/* Interactive Gradient Bar */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t('preview.interactive_bar')}</Label>
                  {/* biome-ignore lint/a11y/useFocusableInteractive: <explanation> */}
<div 
                    ref={gradientBarRef}
                    onClick={handleGradientBarClick}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        // 模拟点击事件
                        const rect = gradientBarRef.current?.getBoundingClientRect();
                        if (rect) {
                          const mockEvent = {
                            clientX: rect.left + rect.width / 2,
                            target: e.target
                          } as React.MouseEvent<HTMLDivElement>;
                          handleGradientBarClick(mockEvent);
                        }
                      }
                    }}
                    className="relative w-full h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-sm"
                    aria-label={t('preview.interactive_bar')}
                    style={{ background: cssGradient }}
                    // biome-ignore lint/a11y/useSemanticElements: <explanation>
                    role="button"
                  >
                    {/* Color stop handles - Now vertical bars with rounded corners */}
                    {config.stops.map((stop) => (
                      <Popover key={stop.id}>
                        <PopoverTrigger asChild>
                          <div
                            data-color-stop="true"
                            className="absolute top-0 h-full flex items-center justify-center group cursor-pointer"
                            style={{ left: `calc(${stop.position}% - 10px)`, width: '20px' }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleDragStart(e, stop.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                          >
                            <div
                              className={`relative h-full w-4 border-2 border-white rounded-lg shadow-lg cursor-grab transform-gpu transition-all duration-200 hover:scale-110 hover:shadow-xl ${dragging?.id === stop.id ? 'scale-110 shadow-xl' : ''}`}
                              style={{ 
                                backgroundColor: stop.color,
                                cursor: dragging?.id === stop.id ? 'grabbing' : 'grab',
                                transformOrigin: 'center'
                              }}
                              title={`Click to edit • ${stop.color} at ${stop.position}%`}
                            />
                            {/* Hover X button for deletion */}
                            {config.stops.length > 2 && (
                              <div
                                className="absolute -top-3 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full text-white text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg border-2 border-white hover:scale-110 z-10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  removeColorStop(stop.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeColorStop(stop.id);
                                  }
                                }}
                                title="Remove color stop"
                                // biome-ignore lint/a11y/useSemanticElements: <explanation>
                                role="button"
                                tabIndex={0}
                              >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4" side="left" align="center" sideOffset={8}>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{t('color_stop.edit')}</h4>
                              <span className="text-xs text-muted-foreground">#{config.stops.findIndex(s => s.id === stop.id) + 1}</span>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">{t('color_stop.color')}</Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="color"
                                    value={stop.color.slice(0, 7)}
                                    onChange={(e) => {
                                      const alpha = stop.color.length > 7 ? stop.color.slice(7) : '';
                                      updateColorStop(stop.id, { color: e.target.value + alpha });
                                    }}
                                    className="w-12 h-9 p-1 rounded border cursor-pointer"
                                    title="Choose color"
                                    aria-label="Choose color"
                                  />
                                  <Input
                                    type="text"
                                    value={stop.color}
                                    onChange={(e) => updateColorStop(stop.id, { color: e.target.value })}
                                    className="flex-1"
                                    placeholder="#000000"
                                    title="Enter hex color value"
                                    aria-label="Enter hex color value"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('color_stop.position')}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={stop.position}
                                    onChange={(e) => updateColorStop(stop.id, { position: Number.parseInt(e.target.value) || 0 })}
                                    className="w-full"
                                    title="Set position percentage"
                                    aria-label="Set position percentage"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium">{t('color_stop.opacity')}</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={Math.round((Number.parseInt(stop.color.slice(7, 9) || 'ff', 16) / 255) * 100)}
                                    onChange={(e) => {
                                      const opacity = Math.max(0, Math.min(100, Number.parseInt(e.target.value) || 100));
                                      const alpha = Math.round((opacity / 100) * 255).toString(16).padStart(2, '0');
                                      const baseColor = stop.color.slice(0, 7);
                                      updateColorStop(stop.id, { color: baseColor + alpha });
                                    }}
                                    className="w-full"
                                    placeholder="100"
                                    title="Set opacity percentage"
                                    aria-label="Set opacity percentage"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('preview.tip')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Controls - Left Column */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('settings.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Gradient Type */}
                    <div className="space-y-2">
                      <Label>{t('settings.type')}</Label>
                      <Tabs value={config.type} onValueChange={(value: string) => setConfig(prev => ({ ...prev, type: value as "linear" | "radial" }))}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="linear">{t('settings.linear')}</TabsTrigger>
                          <TabsTrigger value="radial">{t('settings.radial')}</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>

                    {/* Direction/Shape */}
                    <div className="space-y-2">
                      <Label>{config.type === "linear" ? t('settings.direction') : t('settings.shape')}</Label>
                      <Select 
                        value={config.direction} 
                        onValueChange={(value) => setConfig(prev => ({ ...prev, direction: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(config.type === "linear" ? linearDirections : radialShapes).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button onClick={generateRandomGradient} variant="outline" className="flex-1">
                          <Shuffle className="w-4 h-4 mr-2" />
                          {t('settings.random')}
                        </Button>
                        <Button onClick={resetGradient} variant="outline" className="flex-1">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          {t('settings.reset')}
                        </Button>
                      </div>
                      {config.stops.length > 3 && (
                        <Button onClick={handleSimplifyGradient} variant="outline" className="w-full">
                          <Baby className="w-4 h-4 mr-2" />
                          {t('settings.simplify')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Output Code - Right Columns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{t('code.title')}</CardTitle>
                    <CardDescription>{t('code.description')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={outputFormat} onValueChange={(value: string) => setOutputFormat(value as "css" | "tailwind")}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="css">{t('code.css')}</TabsTrigger>
                        <TabsTrigger value="tailwind">{t('code.tailwind')}</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="css" className="space-y-4">
                        <div className="space-y-2">
                          <Label>{t('code.background_property')}</Label>
                          <div className="relative">
                            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                              <code>{`background: ${cssGradient};`}</code>
                            </pre>
                            <Button
                              onClick={() => copyToClipboard(`background: ${cssGradient};`)}
                              size="sm"
                              className="absolute top-2 right-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>{t('code.css_class')}</Label>
                          <div className="relative">
                            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                              <code>{`.gradient {\n  background: ${cssGradient};\n}`}</code>
                            </pre>
                            <Button
                              onClick={() => copyToClipboard(`.gradient {\n  background: ${cssGradient};\n}`)}
                              size="sm"
                              className="absolute top-2 right-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="tailwind" className="space-y-4">
                        {/* Version Selector */}
                        <div className="space-y-2">
                          <Label>Tailwind CSS {t('versions.version')}</Label>
                          <Tabs value={tailwindVersion} onValueChange={(value: string) => setTailwindVersion(value as "v3" | "v4")}>
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="v3">{t('versions.v3')}</TabsTrigger>
                              <TabsTrigger value="v4">{t('versions.v4')}</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('code.tailwind_classes', { version: tailwindVersion.toUpperCase() })}</Label>
                          <div className="relative">
                            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                              <code>{tailwindGradient}</code>
                            </pre>
                            <Button
                              onClick={() => copyToClipboard(tailwindGradient)}
                              size="sm"
                              className="absolute top-2 right-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t('code.usage_example')}</Label>
                          <div className="relative">
                            <pre className="p-3 bg-muted rounded text-sm overflow-x-auto border">
                              <code>{`<div class="${tailwindGradient}">\n  <!-- Content -->\n</div>`}</code>
                            </pre>
                            <Button
                              onClick={() => copyToClipboard(`<div class="${tailwindGradient}">\n  <!-- Content -->\n</div>`)}
                              size="sm"
                              className="absolute top-2 right-2"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {tailwindVersion === "v4" ? (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <strong>{t('versions.v4')}:</strong> {t('versions.v4_note')}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                            <p className="text-sm text-green-800 dark:text-green-200">
                              <strong>{t('versions.v3')}:</strong> {t('versions.v3_note')}
                            </p>
                          </div>
                        )}
                        
                        {tailwindGradient.includes("bg-[") && (
                          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              <strong>{t('complex_gradient.title')}:</strong> {t('complex_gradient.description')}
                              <br />{t('complex_gradient.reason1')}
                              <br />{t('complex_gradient.reason2')}
                              <br /><br />
                              <strong>{t('complex_gradient.note')}</strong>
                              <br />{t('complex_gradient.position_examples')}
                              <br /><br />
                              <strong>{t('complex_gradient.arbitrary_format')}</strong>
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default GradientGenerator; 