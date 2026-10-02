import type { ReactNode } from 'react';
import type { AccessOrigin, AccessResult, PaymentStatus, StudentDisplayStatus, StudentOrigin } from '@/types';
import { cn } from '@/utils/misc';
import { accessOriginLabel, studentOriginLabel } from '@/utils/format';

export type Tone = 'green' | 'red' | 'amber' | 'zinc' | 'sky' | 'violet' | 'teal';

const tones: Record<Tone, string> = {
  green: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/25',
  red: 'bg-brand-500/10 text-brand-400 ring-brand-500/30',
  amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/25',
  zinc: 'bg-zinc-500/10 text-zinc-400 ring-zinc-500/25',
  sky: 'bg-sky-500/10 text-sky-400 ring-sky-500/25',
  violet: 'bg-fuchsia-500/10 text-fuchsia-400 ring-fuchsia-500/25',
  teal: 'bg-teal-500/10 text-teal-300 ring-teal-500/25',
};
const dots: Record<Tone, string> = {
  green: 'bg-emerald-400',
  red: 'bg-brand-400',
  amber: 'bg-amber-400',
  zinc: 'bg-zinc-400',
  sky: 'bg-sky-400',
  violet: 'bg-fuchsia-400',
  teal: 'bg-teal-300',
};

export function Badge({ tone = 'zinc', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wider whitespace-nowrap uppercase ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 rounded-full', dots[tone])} />}
      {children}
    </span>
  );
}

const studentStatusMap: Record<StudentDisplayStatus, [Tone, string]> = {
  ativo: ['green', 'Ativo'],
  vencido: ['amber', 'Vencido'],
  inativo: ['zinc', 'Inativo'],
  bloqueado: ['red', 'Bloqueado'],
};
export const StudentStatusBadge = ({ status }: { status: StudentDisplayStatus }) => (
  <Badge tone={studentStatusMap[status][0]} dot>
    {studentStatusMap[status][1]}
  </Badge>
);

const paymentStatusMap: Record<PaymentStatus, [Tone, string]> = {
  pago: ['green', 'Pago'],
  pendente: ['amber', 'Pendente'],
  vencido: ['red', 'Vencido'],
};
export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <Badge tone={paymentStatusMap[status][0]} dot>
    {paymentStatusMap[status][1]}
  </Badge>
);

export const AccessResultBadge = ({ result }: { result: AccessResult }) =>
  result === 'liberado' ? (
    <Badge tone="green">✓ Liberado</Badge>
  ) : (
    <Badge tone="red">✕ Bloqueado</Badge>
  );

const originTone: Record<AccessOrigin, Tone> = {
  biometria: 'sky',
  wellhub: 'violet',
  totalpass: 'teal',
  manual: 'amber',
  recepcao: 'zinc',
};
export const AccessOriginBadge = ({ origin }: { origin: AccessOrigin }) => (
  <Badge tone={originTone[origin]}>{accessOriginLabel[origin]}</Badge>
);

const studentOriginTone: Record<StudentOrigin, Tone> = { mansao: 'red', wellhub: 'violet', totalpass: 'teal' };
export const StudentOriginBadge = ({ origin }: { origin: StudentOrigin }) => (
  <Badge tone={studentOriginTone[origin]}>{studentOriginLabel[origin]}</Badge>
);
