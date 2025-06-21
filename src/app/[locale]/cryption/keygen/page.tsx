'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';
import { Copy, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';
import { getSupportedAlgorithms, getAlgorithmInfo, generateKeyPair, type KeyPair } from '@/lib/keygen';

export default function KeygenPage() {
  const t = useTranslations('cryption');
  
  // 密钥对生成状态
  const [keyGenAlgorithm, setKeyGenAlgorithm] = useState('RS256');
  const [keyGenKeySize, setKeyGenKeySize] = useState(2048);
  const [keyGenCurve, setKeyGenCurve] = useState('P-256');
  const [keyGenFormat, setKeyGenFormat] = useState('PEM');
  const [keyGenPassphrase, setKeyGenPassphrase] = useState('');
  const [generatedKeyPair, setGeneratedKeyPair] = useState<{ privateKey: string; publicKey: string } | null>(null);
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);

  const algorithms = getSupportedAlgorithms();
  const allAlgorithms = [...algorithms.RSA, ...algorithms.ECDSA, ...algorithms.EdDSA];

  const handleGenerateKeyPair = async () => {
    setIsGeneratingKeys(true);
    try {
      const options = {
        algorithm: keyGenAlgorithm,
        keySize: keyGenKeySize,
        curve: keyGenCurve,
        format: keyGenFormat as 'PEM' | 'JWK' | 'DER',
        passphrase: keyGenPassphrase || undefined
      };

      const result = await generateKeyPair(options);
      
      if (result.success && result.keyPair) {
        setGeneratedKeyPair({
          privateKey: result.keyPair.privateKey,
          publicKey: result.keyPair.publicKey
        });
        toast.success(t('keygen.success'));
      } else {
        toast.error(result.error || t('keygen.error'));
      }
    } catch (error) {
      toast.error(t('keygen.error'));
    } finally {
      setIsGeneratingKeys(false);
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
        <h1 className="text-3xl font-bold">{t('keygen.title')}</h1>
        <p className="text-muted-foreground">{t('keygen.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('keygen.title')}</CardTitle>
          <CardDescription>{t('keygen.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keygen-algorithm">{t('keygen.algorithm')}</Label>
            <Select value={keyGenAlgorithm} onValueChange={setKeyGenAlgorithm}>
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

          {keyGenAlgorithm.startsWith('RS') && (
            <div className="space-y-2">
              <Label htmlFor="keygen-keysize">{t('keygen.keySize')}</Label>
              <Select value={keyGenKeySize.toString()} onValueChange={(value) => setKeyGenKeySize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024 位</SelectItem>
                  <SelectItem value="2048">2048 位</SelectItem>
                  <SelectItem value="4096">4096 位</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {keyGenAlgorithm.startsWith('ES') && (
            <div className="space-y-2">
              <Label htmlFor="keygen-curve">{t('keygen.curve')}</Label>
              <Select value={keyGenCurve} onValueChange={setKeyGenCurve}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P-256">P-256</SelectItem>
                  <SelectItem value="P-384">P-384</SelectItem>
                  <SelectItem value="P-521">P-521</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="keygen-format">{t('keygen.format')}</Label>
            <Select value={keyGenFormat} onValueChange={setKeyGenFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PEM">PEM</SelectItem>
                <SelectItem value="JWK">JWK</SelectItem>
                <SelectItem value="DER">DER</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keygen-passphrase">{t('keygen.passphrase')}</Label>
            <Input
              id="keygen-passphrase"
              type="text"
              value={keyGenPassphrase}
              onChange={(e) => setKeyGenPassphrase(e.target.value)}
              placeholder={t('keygen.passphrasePlaceholder')}
            />
          </div>

          <Button 
            onClick={handleGenerateKeyPair} 
            disabled={isGeneratingKeys}
            className="w-full"
          >
            {isGeneratingKeys ? t('keygen.generating') : t('keygen.generate')}
          </Button>

          {generatedKeyPair && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('keygen.privateKey')}</Label>
                <div className="relative">
                  <Textarea
                    value={generatedKeyPair.privateKey}
                    readOnly
                    rows={6}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatedKeyPair.privateKey)}
                  >
                    {t('common.copy')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('keygen.publicKey')}</Label>
                <div className="relative">
                  <Textarea
                    value={generatedKeyPair.publicKey}
                    readOnly
                    rows={6}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generatedKeyPair.publicKey)}
                  >
                    {t('common.copy')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 