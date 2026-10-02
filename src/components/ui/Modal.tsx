import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/misc';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Impede fechar clicando fora (ex.: durante uma simulação). */
  locked?: boolean;
}

const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, description, icon, children, footer, size = 'md', locked }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !locked && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, locked]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !locked && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'animate-scale-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-ink-850 shadow-2xl shadow-black/60 sm:rounded-2xl',
          widths[size],
        )}
      >
        {(title || icon) && (
          <div className="flex items-start gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
            {icon && <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">{icon}</div>}
            <div className="min-w-0 flex-1">
              {title && <h2 className="font-display text-lg font-semibold tracking-wide text-white uppercase">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-zinc-400">{description}</p>}
            </div>
            {!locked && (
              <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white" aria-label="Fechar">
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-white/5 bg-ink-900/50 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
