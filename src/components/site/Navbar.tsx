import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Menu, X } from 'lucide-react';
import { Button, Logo } from '@/components/ui';
import { cn } from '@/utils/misc';

export const NAV_LINKS = [
  { id: 'inicio', label: 'Início' },
  { id: 'academia', label: 'A Academia' },
  { id: 'estrutura', label: 'Estrutura' },
  { id: 'planos', label: 'Planos' },
  { id: 'parceiros', label: 'Parceiros' },
  { id: 'horarios', label: 'Horários' },
  { id: 'contato', label: 'Contato' },
];

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Navbar({ onStudentArea }: { onStudentArea: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('inicio');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
      const current = [...NAV_LINKS].reverse().find((l) => {
        const el = document.getElementById(l.id);
        return el && el.getBoundingClientRect().top <= 120;
      });
      if (current) setActive(current.id);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled || open ? 'border-b border-white/5 bg-ink-950/90 backdrop-blur-xl' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <button onClick={() => go('inicio')} className="cursor-pointer" aria-label="Início">
          <Logo subtitle={false} />
        </button>
        <nav className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={cn(
                'relative cursor-pointer px-2.5 py-2 text-[12px] font-semibold tracking-wider whitespace-nowrap uppercase transition',
                active === l.id ? 'text-white' : 'text-zinc-400 hover:text-white',
              )}
            >
              {l.label}
              {active === l.id && <span className="absolute inset-x-2.5-bottom-0.5 h-0.5 rounded bg-brand-500" />}
            </button>
          ))}
          <button onClick={onStudentArea} className="cursor-pointer px-2.5 py-2 text-[12px] font-semibold tracking-wider whitespace-nowrap text-zinc-400 uppercase transition hover:text-white">
            Área do Aluno
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button size="md" icon={<LayoutDashboard className="size-4" />}>
              Acessar sistema
            </Button>
          </Link>
          <button onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 text-white xl:hidden" aria-label="Menu">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="animate-fade-in border-t border-white/5 px-4 pb-6 xl:hidden">
          <nav className="flex flex-col py-2">
            {NAV_LINKS.map((l) => (
              <button key={l.id} onClick={() => go(l.id)} className="cursor-pointer border-b border-white/5 py-3.5 text-left text-sm font-semibold tracking-wider text-zinc-300 uppercase">
                {l.label}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                onStudentArea();
              }}
              className="cursor-pointer border-b border-white/5 py-3.5 text-left text-sm font-semibold tracking-wider text-zinc-300 uppercase"
            >
              Área do Aluno
            </button>
          </nav>
          <Link to="/login">
            <Button size="lg" className="mt-4 w-full" icon={<LayoutDashboard className="size-4" />}>
              Acessar sistema
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
