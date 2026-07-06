import { useEffect, useState } from 'react';
import { saveToken, type AuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function CallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      setError('Código OAuth2 ausente na URL.');
      return;
    }

    fetch(`/api/auth/42/callback?code=${encodeURIComponent(code)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Auth falhou: ${res.status}`);
        return res.json() as Promise<{ token: string; user: AuthUser }>;
      })
      .then((data) => {
        saveToken(data.token, data.user);
        window.location.replace('/chat');
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
        <Card className="w-full max-w-sm p-8 flex flex-col gap-6 text-center">
          <div>
            <p className="text-status-error text-sm uppercase tracking-wider font-semibold mb-3">
              Erro na autenticação
            </p>
            <p className="text-content-secondary text-sm leading-relaxed">
              {error}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.href = '/login'}
            className="w-full uppercase tracking-wider font-semibold"
          >
            Voltar ao login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-8">
        <p className="text-content-secondary text-sm uppercase tracking-widest font-semibold text-center animate-pulse">
          Autenticando...
        </p>
      </Card>
    </div>
  );
}
