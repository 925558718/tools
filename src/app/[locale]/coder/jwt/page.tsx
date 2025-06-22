'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';
import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  decodeJWT, 
  generateJWT,
  verifyJWT,
  isTokenExpired,
  formatTimestamp,
  type JWTResult,
  type JWTAlgorithm
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
  const [generatePrivateKey, setGeneratePrivateKey] = useState('');
  const [generateAlgorithm, setGenerateAlgorithm] = useState<JWTAlgorithm>('HS256');
  const [generateTokenResult, setGenerateTokenResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 解码token状态
  const [decodeTokenInput, setDecodeTokenInput] = useState('');
  const [decodeSecret, setDecodeSecret] = useState('');
  const [decodePublicKey, setDecodePublicKey] = useState('');
  const [decodeResult, setDecodeResult] = useState('');
  const [showRawResult, setShowRawResult] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [detectedAlgorithm, setDetectedAlgorithm] = useState<string>('');

  const algorithms = getSupportedAlgorithms();
  const allAlgorithms = [...algorithms.HMAC, ...algorithms.RSA, ...algorithms.ECDSA, ...algorithms.EdDSA] as JWTAlgorithm[];

  const handleGenerateToken = async () => {
    if (!generatePayload.trim()) {
      toast.error(t('errors.payloadRequired'));
      return;
    }

    let payloadObj: any;
    try {
      payloadObj = JSON.parse(generatePayload);
    } catch (error) {
      toast.error(t('errors.invalidPayload'));
      return;
    }

    if (generateAlgorithm.startsWith('HS')) {
      if (!generateSecret.trim()) {
        toast.error(t('errors.secretRequired'));
        return;
      }
    } else {
      if (!generatePrivateKey.trim()) {
        toast.error(t('errors.privateKeyRequired'));
        return;
      }
    }

    setIsGenerating(true);
    try {
      const options = {
        algorithm: generateAlgorithm,
        payload: payloadObj,
        ...(generateAlgorithm.startsWith('HS') 
          ? { secret: generateSecret }
          : { privateKey: generatePrivateKey }
        )
      };
      
      const token = await generateJWT(options);
      setGenerateTokenResult(token);
      toast.success(t('generate.success'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('generate.error');
      toast.error(errorMessage);
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
      let result: JWTResult;
      
      // 首先解码JWT以获取算法信息
      const decodedToken = decodeJWT(decodeTokenInput);
      const algorithm = decodedToken.header.alg;
      setDetectedAlgorithm(algorithm);
      
      if (decodeSecret.trim() || decodePublicKey.trim()) {
        // 验证模式
        const options: any = {
          token: decodeTokenInput
        };

        if (algorithm.startsWith('HS')) {
          // HMAC算法使用密钥
          if (decodeSecret.trim()) {
            options.secret = decodeSecret;
            options.algorithms = [algorithm as JWTAlgorithm];
          } else {
            throw new Error('HMAC算法需要提供密钥');
          }
        } else {
          // 非对称算法使用公钥
          if (decodePublicKey.trim()) {
            options.publicKey = decodePublicKey;
            options.algorithms = [algorithm as JWTAlgorithm];
          } else {
            throw new Error('非对称算法需要提供公钥');
          }
        }
        
        result = await verifyJWT(options);
      } else {
        // 仅解码模式
        result = decodedToken;
      }
      
      // 格式化结果
      const formattedResult = showRawResult 
        ? JSON.stringify(result, null, 2)
        : formatDecodeResult(result);
      
      setDecodeResult(formattedResult);
      toast.success(t('decode.success'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('decode.error');
      toast.error(errorMessage);
    } finally {
      setIsDecoding(false);
    }
  };

  const formatDecodeResult = (result: JWTResult): string => {
    const { header, payload, signature } = result;
    
    // 检查是否是嵌套JWT
    if (payload && typeof payload === 'object' && '_nestedJWT' in payload) {
      const nested = payload as any;
      return JSON.stringify({
        header,
        payload: {
          // 显示实际的payload内容
          ...Object.fromEntries(
            Object.entries(nested).filter(([key]) => !key.startsWith('_'))
          ),
          // 显示嵌套JWT信息
          _nestedJWTInfo: {
            outerHeader: nested._outerHeader,
            outerSignature: nested._outerSignature,
            outerIsValid: nested._outerIsValid,
            outerError: nested._outerError
          }
        },
        signature
      }, null, 2);
    }
    
    return JSON.stringify(result, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('common.copied'));
  };

  const getAlgorithmDescription = (algorithm: string) => {
    const info = getAlgorithmInfo(algorithm);
    if (!info) return '';
    
    if (algorithm.startsWith('HS')) {
      return `${info.name} (${info.keySize}位, 安全性: ${info.security})`;
    }
    if (algorithm.startsWith('RS')) {
      return `${info.name} (${info.keySize}位, 安全性: ${info.security})`;
    }
    if (algorithm.startsWith('ES')) {
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
                <Select value={generateAlgorithm} onValueChange={(value: string) => setGenerateAlgorithm(value as JWTAlgorithm)}>
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

              {generateAlgorithm.startsWith('HS') ? (
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
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="privateKey">{t('generate.privateKey')}</Label>
                  <Textarea
                    id="privateKey"
                    value={generatePrivateKey}
                    onChange={(e) => setGeneratePrivateKey(e.target.value)}
                    placeholder={t('generate.privateKeyPlaceholder')}
                    rows={4}
                  />
                </div>
              )}

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

              {detectedAlgorithm && (
                <div className="p-3 bg-muted rounded-md">
                  <div className="text-sm font-medium">检测到的算法: {detectedAlgorithm}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {detectedAlgorithm?.startsWith('HS') 
                      ? 'HMAC算法，请提供密钥进行验证'
                      : '非对称算法，请提供公钥进行验证'
                    }
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('decode.verification')}</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  {t('decode.verificationDescription')}
                </div>
              </div>

              {detectedAlgorithm?.startsWith('HS') ? (
                <div className="space-y-2">
                  <Label htmlFor="secret">{t('decode.secret')}</Label>
                  <Input
                    id="secret"
                    type="text"
                    value={decodeSecret}
                    onChange={(e) => setDecodeSecret(e.target.value)}
                    placeholder={t('decode.secretPlaceholder')}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="publicKey">{t('decode.publicKey')}</Label>
                  <Textarea
                    id="publicKey"
                    value={decodePublicKey}
                    onChange={(e) => setDecodePublicKey(e.target.value)}
                    placeholder={t('decode.publicKeyPlaceholder')}
                    rows={4}
                  />
                </div>
              )}

              <Button 
                onClick={handleDecodeToken} 
                disabled={isDecoding}
                className="w-full"
              >
                {isDecoding ? t('decode.decoding') : t('decode.decode')}
              </Button>

              {decodeResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('decode.result')}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRawResult(!showRawResult)}
                    >
                      {showRawResult ? t('decode.showFormatted') : t('decode.showRaw')}
                    </Button>
                  </div>
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