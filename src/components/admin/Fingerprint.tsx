import { Fingerprint as FingerprintIcon } from 'lucide-react';
import { cn } from '@/utils/misc';

export type ScanState = 'idle' | 'scanning' | 'success' | 'error';

/** Animação visual de leitura de impressão digital. */
export function FingerprintScanner({ state, size = 'md' }: { state: ScanState; size?: 'md' | 'lg' }) {
  const color =
    state === 'success' ? 'text-emerald-400' : state === 'error' ? 'text-brand-500' : state === 'scanning' ? 'text-brand-400' : 'text-zinc-500';
  const ring =
    state === 'success' ? 'border-emerald-500/40' : state === 'error' ? 'border-brand-500/50' : 'border-white/10';
  const dims = size === 'lg' ? 'size-44' : 'size-36';

  return (
    <div className={cn('relative mx-auto flex items-center justify-center', dims)}>
      {state === 'scanning' && (
        <>
          <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-brand-500/50" />
          <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-brand-500/30 [animation-delay:0.6s]" />
        </>
      )}
      <div className={cn('relative flex size-full items-center justify-center overflow-hidden rounded-full border-2 bg-ink-900 transition-colors duration-300', ring)}>
        <div className="grid-bg absolute inset-0 opacity-60" />
        <FingerprintIcon className={cn('relative transition-colors duration-300', color, size === 'lg' ? 'size-24' : 'size-20')} strokeWidth={1.2} />
        {state === 'scanning' && (
          <div className="animate-scan absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-brand-500/30 to-brand-500/0">
            <div className="absolute bottom-0 h-0.5 w-full bg-brand-400 shadow-[0_0_14px_2px_rgb(225_29_46/0.8)]" />
          </div>
        )}
      </div>
    </div>
  );
}
