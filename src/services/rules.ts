// Regras de negócio puras (sem efeitos colaterais).
// Podem ser reaproveitadas no backend futuramente (ex.: Edge Functions do Supabase).

import type { AccessOrigin, Payment, PaymentStatus, Student, StudentDisplayStatus } from '@/types';
import { addDays, today } from '@/utils/date';

export function getDisplayStatus(s: Student, graceDays = 0): StudentDisplayStatus {
  if (s.status === 'bloqueado') return 'bloqueado';
  if (s.status === 'inativo') return 'inativo';
  // Alunos de parceiros (Wellhub/TotalPass) não pagam mensalidade direta.
  if (s.origin === 'mansao' && addDays(s.dueDate, graceDays) < today()) return 'vencido';
  return 'ativo';
}

export function getPaymentStatus(p: Payment): PaymentStatus {
  if (p.paidAt) return 'pago';
  return p.dueDate < today() ? 'vencido' : 'pendente';
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  /** Código curto do motivo para exibição. */
  code?: 'BLOQUEADO' | 'VENCIDO' | 'INATIVO' | 'SEM_DIGITAL';
}

export function evaluateAccess(s: Student, origin: AccessOrigin, graceDays = 0, blockOverdue = true): AccessDecision {
  const raw = getDisplayStatus(s, graceDays);
  const status = raw === 'vencido' && !blockOverdue ? 'ativo' : raw;
  if (status === 'bloqueado')
    return { allowed: false, code: 'BLOQUEADO', reason: s.blockReason ? `Aluno bloqueado — ${s.blockReason}` : 'Aluno bloqueado pela administração' };
  if (status === 'inativo') return { allowed: false, code: 'INATIVO', reason: 'Matrícula inativa' };
  if (status === 'vencido') return { allowed: false, code: 'VENCIDO', reason: 'Mensalidade vencida' };
  if (origin === 'biometria' && !s.biometry)
    return { allowed: false, code: 'SEM_DIGITAL', reason: 'Digital não cadastrada' };
  return { allowed: true };
}
