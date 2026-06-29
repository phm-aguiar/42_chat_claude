import { buildOAuthUrl, saveToken, type AuthUser } from '@/lib/auth';

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
    <div className="min-h-screen bg-[#1B1B1B] flex flex-col items-center justify-center gap-8">
      {/* dot grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Logo / título */}
      <div className="relative text-center">
        <h1 className="text-[#FFFFFF] text-4xl font-bold uppercase tracking-[0.2em]">
          42 Chat
        </h1>
        <p className="text-[#29292E] text-sm mt-2 tracking-widest uppercase">
          São Paulo
        </p>
      </div>

      {/* Botões */}
      <div className="relative flex flex-col gap-3 w-64">
        <button
          onClick={handleOAuth}
          className="w-full bg-[#00BABC] text-[#1B1B1B] font-bold text-sm py-3 px-6 uppercase tracking-wider hover:bg-[#04809F] transition-colors"
        >
          Entrar com a 42
        </button>

        {devMode && (
          <button
            onClick={handleDevLogin}
            className="w-full bg-[#202026] text-[#29292E] font-bold text-xs py-2 px-6 uppercase tracking-wider border border-[#29292E] hover:text-[#FFFFFF] hover:border-[#FFFFFF] transition-colors"
          >
            Dev Login (marvin)
          </button>
        )}
      </div>
    </div>
  );
}
