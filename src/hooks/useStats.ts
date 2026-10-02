import { useMemo } from 'react';
import { useData } from './useData';
import { getDisplayStatus, getPaymentStatus } from '@/services/rules';
import { isSameDay, isSameMonth } from '@/utils/date';

/**
 * Indicadores consolidados: dados detalhados + base demonstrativa
 * (restante da academia). Toda nova simulação altera os números ao vivo.
 */
export function useStats() {
  const { db } = useData();

  return useMemo(() => {
    const b = db.baseline;
    const grace = db.settings.graceDays;
    const statuses = db.students.map((s) => getDisplayStatus(s, grace));
    const todayLogs = db.accessLogs.filter((l) => isSameDay(l.timestamp));
    const todayAllowed = todayLogs.filter((l) => l.result === 'liberado');
    const open = db.payments.filter((p) => getPaymentStatus(p) !== 'pago');
    const overdue = db.payments.filter((p) => getPaymentStatus(p) === 'vencido');
    const paidMonth = db.payments.filter((p) => p.paidAt && isSameMonth(p.paidAt));
    const paidToday = db.payments.filter((p) => p.paidAt && isSameDay(p.paidAt));
    const sum = (arr: { amount: number }[]) => arr.reduce((a, p) => a + p.amount, 0);

    const revenueMonth = b.revenueMonth + sum(paidMonth);
    const receivable = b.receivable + sum(open);
    const overdueAmount = sum(overdue) + 2310;

    return {
      activeStudents: b.activeStudents + statuses.filter((s) => s === 'ativo').length,
      totalStudents: b.activeStudents + db.students.length + 31,
      checkinsToday: b.checkinsToday + todayAllowed.length,
      checkinsWellhub: b.checkinsWellhub + todayAllowed.filter((l) => l.origin === 'wellhub').length,
      checkinsTotalpass: b.checkinsTotalpass + todayAllowed.filter((l) => l.origin === 'totalpass').length,
      pendingPayments: b.pendingPayments + open.length,
      overdueCount: overdue.length,
      overdueAmount,
      revenueMonth,
      revenueToday: b.revenueToday + sum(paidToday),
      receivable,
      newStudents: b.newStudents + db.students.filter((s) => isSameMonth(s.enrollmentDate)).length,
      blockedAccesses: b.blockedAccesses + todayLogs.filter((l) => l.result === 'bloqueado').length,
      blockedStudents: statuses.filter((s) => s === 'bloqueado').length,
      delinquencyRate: (overdueAmount / (revenueMonth + overdueAmount)) * 100,
    };
  }, [db]);
}
