import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { Button, Field, Input, Logo, LOGO_URL } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { DEMO_CREDENTIALS } from '@/services/auth';
import { HERO_IMAGE } from '@/assets/images';

export default function Login() {
  const { user, signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Bem-vindo de volta!', 'Login realizado com sucesso.');
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? '/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ink-950 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 size-full object-cover opacity-50 grayscale" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink-950 via-ink-950/80 to-brand-700/30" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <img src={LOGO_URL} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} className="mb-8 w-40 rounded-2xl border border-white/10" />
            <p className="font-display text-5xl leading-[1.05] font-bold tracking-wide text-white uppercase">
              Onde a disciplina
              <br />
              <span className="text-brand-500">constrói resultados.</span>
            </p>
            <p className="mt-4 max-w-md text-zinc-400">
              Gestão completa de alunos, acessos, mensalidades e parceiros em uma única plataforma.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500">
            <span>+500 alunos</span>
            <span>Controle de acesso biométrico</span>
            <span>Wellhub · TotalPass</span>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center p-6">
        <div className="grid-bg absolute inset-0 opacity-50" />
        <div className="animate-fade-up relative w-full max-w-sm">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
            <ArrowLeft className="size-4" /> Voltar ao site
          </Link>
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold tracking-widest text-brand-400 uppercase">
            <ShieldCheck className="size-3.5" /> Área restrita
          </div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white uppercase">Acesso administrativo</h1>
          <p className="mt-1 text-sm text-zinc-400">Entre com suas credenciais para acessar o painel.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="E-mail">
              <Input
                type="email"
                icon={<Mail className="size-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Input
                  type={show ? 'text' : 'password'}
                  icon={<Lock className="size-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-white"
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
            {error && <p className="animate-fade-in rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-2 text-sm text-brand-300">{error}</p>}
            <Button type="submit" size="lg" className="w-full" loading={loading} icon={<LogIn className="size-4" />}>
              Entrar
            </Button>
          </form>

          <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-zinc-400">
            <p className="mb-2 font-semibold tracking-widest text-zinc-300 uppercase">Acesso de demonstração</p>
            <p>
              E-mail: <span className="text-white">{DEMO_CREDENTIALS.email}</span>
            </p>
            <p>
              Senha: <span className="text-white">{DEMO_CREDENTIALS.password}</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setEmail(DEMO_CREDENTIALS.email);
                setPassword(DEMO_CREDENTIALS.password);
              }}
              className="mt-3 cursor-pointer font-semibold text-brand-400 hover:text-brand-300"
            >
              Preencher automaticamente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
