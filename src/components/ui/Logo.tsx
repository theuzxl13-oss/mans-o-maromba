import { useState } from 'react';
import { cn } from '@/utils/misc';

/** Logo oficial completa (`public/logo.png`) e versão ícone (`public/logo-mark.png`). */
export const LOGO_URL = `${import.meta.env.BASE_URL}logo.png`;
export const LOGO_MARK_URL = `${import.meta.env.BASE_URL}logo-mark.png`;

function FallbackMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#e11d2e" />
      <path d="M14 46V18l18 16 18-16v28" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackMark className={cn('size-9', className)} />;
  return (
    <img
      src={LOGO_MARK_URL}
      alt="Mansão Maromba"
      onError={() => setFailed(true)}
      className={cn('size-9 rounded-lg border border-white/10 bg-black object-cover', className)}
    />
  );
}

export function Logo({ collapsed, className, subtitle = true }: { collapsed?: boolean; className?: string; subtitle?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark className="size-10 shrink-0" />
      {!collapsed && (
        <div className="leading-none">
          <p className="font-display text-lg font-bold tracking-[0.08em] whitespace-nowrap text-white uppercase">
            Mansão <span className="text-brand-500">Maromba</span>
          </p>
          {subtitle && <p className="mt-1 text-[9px] font-semibold tracking-[0.32em] text-zinc-500 uppercase">Gym Management</p>}
        </div>
      )}
    </div>
  );
}
