import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';

interface SyncResult {
  success: boolean;
  totalUsers: number;
  profilesCreated: number;
  profilesUpdated: number;
  errors: number;
  message: string;
  error?: string;
}

export function SyncUserProfiles() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('sync-user-profiles');
      
      if (error) {
        setResult({
          success: false,
          totalUsers: 0,
          profilesCreated: 0,
          profilesUpdated: 0,
          errors: 1,
          message: 'Erro ao executar sincronização',
          error: error.message
        });
      } else {
        setResult(data);
      }
    } catch (error) {
      setResult({
        success: false,
        totalUsers: 0,
        profilesCreated: 0,
        profilesUpdated: 0,
        errors: 1,
        message: 'Erro de conexão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Sincronização de Perfis de Usuários
        </CardTitle>
        <CardDescription>
          Sincroniza todos os usuários do Auth com a tabela de perfis e ativa todos os planos para teste.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Este script irá:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Buscar todos os usuários do Supabase Auth</li>
            <li>Criar perfis na tabela public.profiles para usuários que não possuem</li>
            <li>Ativar o plano (plano_ativo = true) para todos os usuários</li>
            <li>Sincronizar e-mails entre Auth e profiles</li>
          </ul>
        </div>

        <Button 
          onClick={handleSync} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            'Executar Sincronização'
          )}
        </Button>

        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{result.message}</p>
                  {result.success && (
                    <div className="text-sm space-y-1">
                      <p>• Total de usuários: {result.totalUsers}</p>
                      <p>• Perfis criados: {result.profilesCreated}</p>
                      <p>• Perfis atualizados: {result.profilesUpdated}</p>
                      {result.errors > 0 && (
                        <p className="text-red-600">• Erros: {result.errors}</p>
                      )}
                    </div>
                  )}
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">Erro: {result.error}</p>
                  )}
                </div>
              </AlertDescription>
            </div>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}