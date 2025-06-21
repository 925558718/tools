'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';
import { Copy, RotateCcw, Clock, User, Shield, Download, Upload, Key } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  decodeJWT, 
  generateJWT, 
  generateJWTWithPrivateKey,
  verifyJWTWithPublicKey,
  isTokenExpired,
  formatTimestamp,
  type DecodedToken
} from '@/lib/jwt';
import { getSupportedAlgorithms, getAlgorithmInfo } from '@/lib/keygen';

export default function JWTPage() {
  const t = useTranslations('jwt');
  const params = useParams();
  const locale = params.locale as string;
  const [activeTab, setActiveTab] = useState('generate');
  
  // 生成token状态
  const [generatePayload, setGeneratePayload] = useState('{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}');
  const [generateSecret, setGenerateSecret] = useState('');
  const [generateAlgorithm, setGenerateAlgorithm] = useState('HS256');
  const [generateTokenResult, setGenerateTokenResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 解码token状态
  const [decodeTokenInput, setDecodeTokenInput] = useState('');
  const [decodeSecret, setDecodeSecret] = useState('');
  const [decodeResult, setDecodeResult] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);

  const algorithms = getSupportedAlgorithms();
  const allAlgorithms = [...algorithms.RSA, ...algorithms.ECDSA, ...algorithms.EdDSA];

  const handleGenerateToken = async () => {
    if (!generatePayload.trim()) {
      toast.error(t('errors.payloadRequired'));
      return;
    }
    if (!generateSecret.trim()) {
      toast.error(t('errors.secretRequired'));
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateJWT(generatePayload, generateSecret, generateAlgorithm);
      
      if (result.success) {
        setGenerateTokenResult(result.token);
        toast.success(t('generate.success'));
      } else {
        toast.error(result.error || t('generate.error'));
      }
    } catch (error) {
      toast.error(t('generate.error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDecodeToken = async () => {
    if (!decodeTokenInput.trim()) {
      toast.error(t('errors.tokenRequired'));
      return;
    }

    setIsDecoding(true);
    try {
      const result = decodeJWT(decodeTokenInput, decodeSecret);
      setDecodeResult(JSON.stringify(result, null, 2));
      toast.success(t('decode.success'));
    } catch (error) {
      toast.error(t('decode.error'));
    } finally {
      setIsDecoding(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied'));
  };

  const getAlgorithmDescription = (algorithm: string) => {
    const info = getAlgorithmInfo(algorithm);
    if (!info) return '';
    
    if (algorithm.startsWith('RS')) {
      return `${info.name} (${info.keySize}位, 安全性: ${info.security})`;
    }if (algorithm.startsWith('ES')) {
      return `${info.name} (${info.curve}, 安全性: ${info.security})`;
    }
      return `${info.name} (${info.curve}, 安全性: ${info.security})`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">{t('generate.title')}</TabsTrigger>
          <TabsTrigger value="decode">{t('decode.title')}</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('generate.title')}</CardTitle>
              <CardDescription>{t('generate.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payload">{t('generate.payload')}</Label>
                <Textarea
                  id="payload"
                  value={generatePayload}
                  onChange={(e) => setGeneratePayload(e.target.value)}
                  placeholder={t('generate.payloadPlaceholder')}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="algorithm">{t('generate.algorithm')}</Label>
                <Select value={generateAlgorithm} onValueChange={setGenerateAlgorithm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allAlgorithms.map((alg) => (
                      <SelectItem key={alg} value={alg}>
                        {alg} - {getAlgorithmDescription(alg)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">{t('generate.secret')}</Label>
                <Input
                  id="secret"
                  type="text"
                  value={generateSecret}
                  onChange={(e) => setGenerateSecret(e.target.value)}
                  placeholder={t('generate.secretPlaceholder')}
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={handleGenerateToken} 
                  disabled={isGenerating}
                  className="flex-1"
                >
                  {isGenerating ? t('generate.generating') : t('generate.generate')}
                </Button>
                <Link href={`/${locale}/cryption/keygen`}>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>{t('generate.generateKeys')}</span>
                  </Button>
                </Link>
              </div>

              {generateTokenResult && (
                <div className="space-y-2">
                  <Label>{t('generate.result')}</Label>
                  <div className="relative">
                    <Textarea
                      value={generateTokenResult}
                      readOnly
                      rows={8}
                      className="pr-12"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(generateTokenResult)}
                    >
                      {t('common.copy')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('decode.title')}</CardTitle>
              <CardDescription>{t('decode.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">{t('decode.token')}</Label>
                <Textarea
                  id="token"
                  value={decodeTokenInput}
                  onChange={(e) => setDecodeTokenInput(e.target.value)}
                  placeholder={t('decode.tokenPlaceholder')}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="decode-secret">{t('decode.secret')}</Label>
                <Input
                  id="decode-secret"
                  type="text"
                  value={decodeSecret}
                  onChange={(e) => setDecodeSecret(e.target.value)}
                  placeholder={t('decode.secretPlaceholder')}
                />
              </div>

              <Button 
                onClick={handleDecodeToken} 
                disabled={isDecoding}
                className="w-full"
              >
                {isDecoding ? t('decode.decoding') : t('decode.decode')}
              </Button>

              {decodeResult && (
                <div className="space-y-2">
                  <Label>{t('decode.result')}</Label>
                  <div className="relative">
                    <Textarea
                      value={decodeResult}
                      readOnly
                      rows={8}
                      className="pr-12"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(decodeResult)}
                    >
                      {t('common.copy')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 