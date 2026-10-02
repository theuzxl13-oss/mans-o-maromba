import type { ReactNode } from 'react';
import { Inbox, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/misc';

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
      <div className="flex items-center gap-3">
        {icon && <div className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-brand-400">{icon}</div>}
        <div>
          <h3 className="font-display text-base font-semibold tracking-wide text-white uppercase">{title}</h3>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="animate-fade-up mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold tracking-[0.2em] text-brand-400 uppercase">{eyebrow}</p>}
        <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export type StatTone = 'red' | 'green' | 'amber' | 'sky' | 'zinc' | 'violet' | 'teal';
const statTones: Record<StatTone, string> = {
  red: 'text-brand-400 bg-brand-500/10',
  green: 'text-emerald-400 bg-emerald-500/10',
  amber: 'text-amber-400 bg-amber-500/10',
  sky: 'text-sky-400 bg-sky-500/10',
  zinc: 'text-zinc-300 bg-white/5',
  violet: 'text-fuchsia-400 bg-fuchsia-500/10',
  teal: 'text-teal-300 bg-teal-500/10',
};

export function StatCard({
  label,
  value,
  icon,
  tone = 'zinc',
  trend,
  hint,
  loading,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone?: StatTone;
  trend?: { value: string; up: boolean; good?: boolean };
  hint?: string;
  loading?: boolean;
  delay?: number;
}) {
  return (
    <div
      className="card animate-fade-up group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/10"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-white/[0.02] transition group-hover:bg-brand-500/[0.06]" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase">{label}</p>
        <div className={cn('flex size-9 items-center justify-center rounded-lg', statTones[tone])}>{icon}</div>
      </div>
      {loading ? (
        <div className="skeleton mt-3 h-8 w-28" />
      ) : (
        <p className="font-display mt-2 text-3xl font-semibold tracking-wide text-white tabular-nums">{value}</p>
      )}
      <div className="mt-2 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 font-semibold',
              (trend.good ?? trend.up) ? 'text-emerald-400' : 'text-brand-400',
            )}
          >
            {trend.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-zinc-500">{hint}</span>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-full" />
          {Array.from({ length: cols - 1 }).map((__, j) => (
            <Skeleton key={j} className={cn('h-4', j === 0 ? 'w-40' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] text-zinc-500">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Tooltip({ label, children, side = 'top' }: { label: string; children: ReactNode; side?: 'top' | 'bottom' | 'right' }) {
  const pos = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    right: 'left-full top-1/2 ml-3 -translate-y-1/2',
  }[side];
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 rounded-md border border-white/10 bg-ink-950 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-zinc-200 opacity-0 shadow-lg transition duration-150 group-hover/tt:opacity-100',
          pos,
        )}
      >
        {label}
      </span>
    </span>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
            value === o.value
              ? 'border-brand-500/50 bg-brand-500/15 text-white'
              : 'border-white/5 bg-white/[0.03] text-zinc-400 hover:border-white/15 hover:text-white',
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn('rounded px-1.5 text-[10px]', value === o.value ? 'bg-brand-500/30' : 'bg-white/5')}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/** Tabela responsiva com rolagem horizontal. */
export function Table({ head, children, className }: { head: ReactNode[]; children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 text-[11px] tracking-[0.12em] text-zinc-500 uppercase">
            {head.map((h, i) => (
              <th key={i} className="px-5 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">{children}</tbody>
      </table>
    </div>
  );
}

export const Td = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <td className={cn('px-5 py-3 whitespace-nowrap', className)}>{children}</td>
);
