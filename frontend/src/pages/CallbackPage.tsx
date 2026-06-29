import { useEffect, useState } from 'react';
import { saveToken, type AuthUser } from '@/lib/auth';

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
      <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#EC3391] text-sm uppercase tracking-wider mb-4">
            Erro no login
          </p>
          <p className="text-[#29292E] text-xs mb-6">{error}</p>
          <a
            href="/"
            className="text-[#00BABC] text-xs uppercase tracking-wider hover:text-[#04809F]"
          >
            Tentar novamente
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B1B1B] flex items-center justify-center">
      <p className="text-[#29292E] text-sm uppercase tracking-widest animate-pulse">
        Autenticando...
      </p>
    </div>
  );
}
