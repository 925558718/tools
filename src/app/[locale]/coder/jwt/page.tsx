'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { Button } from '@/components/shadcn/button';
import { Textarea } from '@/components/shadcn/textarea';
import { Label } from '@/components/shadcn/label';
import { Input } from '@/components/shadcn/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/tabs';
import { Copy, RotateCcw, Eye, EyeOff, Clock, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import jwt from 'jsonwebtoken';
import PageTitle from '@/components/PageTitle';
import { useTranslations } from 'next-intl';

interface DecodedToken {
  header: any;
  payload: any;
  signature: string;
  isValid: boolean;
  error?: string;
}

export default function JwtPage() {
  const t = useTranslations();
  const [token, setToken] = useState('');
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  
  // 生成JWT相关状态
  const [payload, setPayload] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [algorithm, setAlgorithm] = useState('HS256');

  const decodeToken = () => {
    if (!token.trim()) {
      toast.error(t('jwt.errors.empty_token'));
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('无效的JWT格式');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      const signature = parts[2];

      let isValid = false;
      let error = '';

      if (secret) {
        try {
          jwt.verify(token, secret);
          isValid = true;
        } catch (verifyError) {
          isValid = false;
          error = t('jwt.result.signature_invalid');
        }
      }

      setDecodedToken({
        header,
        payload,
        signature,
        isValid,
        error
      });

      toast.success(t('jwt.success.token_parsed'));
    } catch (error) {
      toast.error(t('jwt.errors.token_parse_failed'));
    }
  };

  const generateToken = () => {
    if (!payload.trim()) {
      toast.error(t('jwt.errors.empty_payload'));
      return;
    }

    if (!secret.trim()) {
      toast.error(t('jwt.errors.empty_secret'));
      return;
    }

    try {
      const payloadObj = JSON.parse(payload);
      const token = jwt.sign(payloadObj, secret, { algorithm: algorithm as any });
      setGeneratedToken(token);
      toast.success(t('jwt.success.token_generated'));
    } catch (error) {
      toast.error(t('jwt.errors.token_generation_failed'));
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('jwt.success.copied'));
  };

  const handleClear = () => {
    setToken('');
    setDecodedToken(null);
    setSecret('');
    setPayload('');
    setGeneratedToken('');
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (exp: number) => {
    return Date.now() / 1000 > exp;
  };

  const examplePayload = {
    "sub": "1234567890",
    "name": "John Doe",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  };

  const loadExample = () => {
    setPayload(JSON.stringify(examplePayload, null, 2));
  };

  return (
    <div className="space-y-6">
      <PageTitle 
        titleKey="jwt.title"
        subtitleKey="jwt.description"
        features={[
          { key: 'jwt.features.token_decoding', color: 'blue' },
          { key: 'jwt.features.signature_validation', color: 'green' },
          { key: 'jwt.features.token_generation', color: 'purple' }
        ]}
      />

      <Tabs defaultValue="decode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="decode">{t('jwt.tabs.decode')}</TabsTrigger>
          <TabsTrigger value="generate">{t('jwt.tabs.generate')}</TabsTrigger>
        </TabsList>

        <TabsContent value="decode" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('jwt.decode.title')}</CardTitle>
              <CardDescription>
                {t('jwt.decode.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">{t('jwt.decode.token_label')}</Label>
                <Textarea
                  id="token"
                  placeholder={t('placeholders.enter')}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secret">{t('jwt.decode.secret_label')}</Label>
                <div className="relative">
                  <Input
                    id="secret"
                    type={showSecret ? "text" : "password"}
                    placeholder={t('placeholders.enter')}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={decodeToken}>{t('jwt.decode.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('jwt.common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {decodedToken && (
            <Card>
              <CardHeader>
                <CardTitle>{t('jwt.result.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      {t('jwt.result.header_info')}
                    </h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(decodedToken.header, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      {t('jwt.result.payload_info')}
                    </h4>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
                      {JSON.stringify(decodedToken.payload, null, 2)}
                    </pre>
                  </div>
                </div>

                {decodedToken.payload.exp && (
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="font-medium">{t('jwt.result.expiration_time')}:</span>
                    <span className={`ml-2 ${isExpired(decodedToken.payload.exp) ? 'text-red-500' : 'text-green-500'}`}>
                      {formatDate(decodedToken.payload.exp)}
                      {isExpired(decodedToken.payload.exp) && ` ${t('jwt.result.expired')}`}
                    </span>
                  </div>
                )}

                {secret && (
                  <div>
                    <h4 className="font-semibold mb-2">{t('jwt.result.signature_validation')}</h4>
                    <div className={`flex items-center ${decodedToken.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {decodedToken.isValid ? t('jwt.result.signature_valid') : t('jwt.result.signature_invalid')}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2">{t('jwt.result.signature')}</h4>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm break-all">
                    {decodedToken.signature}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('jwt.generate.title')}</CardTitle>
              <CardDescription>
                {t('jwt.generate.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payload">{t('jwt.generate.payload_label')}</Label>
                <Textarea
                  id="payload"
                  placeholder={t('placeholders.enter')}
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={6}
                />
                <Button variant="outline" size="sm" onClick={loadExample}>
                  {t('jwt.generate.load_example')}
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="generate-secret">{t('jwt.generate.secret_label')}</Label>
                <Input
                  id="generate-secret"
                  type="password"
                  placeholder={t('placeholders.enter')}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="algorithm">{t('jwt.generate.algorithm_label')}</Label>
                <select
                  id="algorithm"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="HS256">HS256</option>
                  <option value="HS384">HS384</option>
                  <option value="HS512">HS512</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateToken}>{t('jwt.generate.button')}</Button>
                <Button variant="outline" onClick={handleClear}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {t('jwt.common.clear')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedToken && (
            <Card>
              <CardHeader>
                <CardTitle>{t('jwt.result.generated_token')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono text-sm break-all">
                  {generatedToken}
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(generatedToken)}>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('common.copy')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>{t('jwt.instructions.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <span className="font-medium">{t('jwt.instructions.structure')}</span>
            {t('jwt.instructions.structure_desc')}
          </div>
          <div>
            <span className="font-medium">{t('jwt.instructions.header')}</span>
            {t('jwt.instructions.header_desc')}
          </div>
          <div>
            <span className="font-medium">{t('jwt.instructions.payload')}</span>
            {t('jwt.instructions.payload_desc')}
          </div>
          <div>
            <span className="font-medium">{t('jwt.instructions.signature')}</span>
            {t('jwt.instructions.signature_desc')}
          </div>
          <div>
            <span className="font-medium">{t('jwt.instructions.common_fields')}</span>
            {t('jwt.instructions.common_fields_desc')}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 