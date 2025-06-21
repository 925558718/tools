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
  const t = useTranslations('keygen');
  const commonT = useTranslations();
  
  // Key pair generation state
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
        toast.success(t('success'));
      } else {
        toast.error(result.error || t('error'));
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setIsGeneratingKeys(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(commonT('copied'));
  };

  const getAlgorithmDescription = (algorithm: string) => {
    const info = getAlgorithmInfo(algorithm);
    if (!info) return '';
    
    if (algorithm.startsWith('RS')) {
      return `${t(`algorithms.${algorithm}`)} (${info.keySize}${t('bits')}, ${t('security')})`;
    }if (algorithm.startsWith('ES')) {
      return `${t(`algorithms.${algorithm}`)} (${info.curve}, ${t('security')})`;
    }
      return `${t(`algorithms.${algorithm}`)} (${info.curve}, ${t('security')})`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageTitle titleKey="keygen.title" subtitleKey="keygen.description" />

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keygen-algorithm">{t('algorithm')}</Label>
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
              <Label htmlFor="keygen-keysize">{t('keySize')}</Label>
              <Select value={keyGenKeySize.toString()} onValueChange={(value) => setKeyGenKeySize(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024 {t('bits')}</SelectItem>
                  <SelectItem value="2048">2048 {t('bits')}</SelectItem>
                  <SelectItem value="4096">4096 {t('bits')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {keyGenAlgorithm.startsWith('ES') && (
            <div className="space-y-2">
              <Label htmlFor="keygen-curve">{t('curve')}</Label>
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
            <Label htmlFor="keygen-format">{t('format')}</Label>
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
            <Label htmlFor="keygen-passphrase">{t('passphrase')}</Label>
            <Input
              id="keygen-passphrase"
              type="text"
              value={keyGenPassphrase}
              onChange={(e) => setKeyGenPassphrase(e.target.value)}
              placeholder={t('passphrasePlaceholder')}
            />
          </div>

          <Button 
            onClick={handleGenerateKeyPair} 
            disabled={isGeneratingKeys}
            className="w-full"
          >
            {isGeneratingKeys ? t('generating') : t('generate')}
          </Button>

          {generatedKeyPair && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('privateKey')}</Label>
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
                    {commonT('copy')}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('publicKey')}</Label>
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
                    {commonT('copy')}
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