import { buildOAuthUrl, saveToken, type AuthUser } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function LoginPage() {
  const devMode = import.meta.env.VITE_DEV_MODE === 'true';

  function handleOAuth() {
    window.location.href = buildOAuthUrl();
  }

  async function handleDevLogin() {
    try {
      const res = await fetch('/api/auth/dev/login?login=marvin');
      if (!res.ok) throw new Error('dev login falhou');
      const data = await res.json() as { token: string; user: AuthUser };
      saveToken(data.token, data.user);
      window.location.replace('/chat');
    } catch (err) {
      console.error('dev login error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-surface-base flex flex-col items-center justify-center p-4">
      {/* Logo / título */}
      <div className="text-center mb-12">
        <h1 className="text-content-primary text-5xl font-bold uppercase tracking-[0.2em]">
          42 Chat
        </h1>
        <p className="text-content-secondary text-sm mt-3 tracking-widest uppercase">
          São Paulo
        </p>
      </div>

      {/* Painel central */}
      <Card className="w-full max-w-sm p-8 flex flex-col gap-6">
        {/* Botão primário OAuth2 */}
        <Button
          variant="primary"
          size="md"
          onClick={handleOAuth}
          className="w-full uppercase tracking-wider font-semibold"
        >
          Entrar com 42 Intra
        </Button>

        {/* Botão dev-login (apenas em dev) */}
        {devMode && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDevLogin}
            className="w-full uppercase tracking-wider font-semibold"
          >
            Dev Login (marvin)
          </Button>
        )}
      </Card>
    </div>
  );
}
