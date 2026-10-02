import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/misc';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_8px_24px_-8px_rgb(225_29_46/0.6)] active:bg-brand-700',
  secondary: 'bg-ink-700 text-zinc-100 hover:bg-ink-600 border border-white/5',
  ghost: 'text-zinc-300 hover:bg-white/5 hover:text-white',
  danger: 'bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500/20',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_8px_24px_-8px_rgb(16_185_129/0.5)]',
  outline: 'border border-white/15 text-white hover:border-white/30 hover:bg-white/5',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-sm gap-2.5',
  icon: 'size-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg font-semibold tracking-wide whitespace-nowrap transition-all duration-150 select-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});
