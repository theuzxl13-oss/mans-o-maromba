// Séries históricas demonstrativas para os gráficos.

import type { AccessLog } from '@/types';
import { isSameDay, MONTHS, MONTHS_SHORT } from '@/utils/date';

const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22];
/** Movimento típico por faixa de horário (pico 18h–20h). */
const BASE_MOVEMENT = [14, 12, 9, 11, 6, 15, 42, 38, 9];

export function hourlyMovement(logs: AccessLog[]) {
  const counts = new Array(HOURS.length).fill(0);
  for (const l of logs) {
    if (!isSameDay(l.timestamp) || l.result !== 'liberado') continue;
    const h = new Date(l.timestamp).getHours();
    let idx = HOURS.findIndex((x, i) => h >= x && h < (HOURS[i + 1] ?? 24));
    if (idx === -1) idx = 0;
    counts[idx]++;
  }
  return HOURS.map((h, i) => ({
    hour: `${String(h).padStart(2, '0')}h`,
    value: BASE_MOVEMENT[i] + counts[i],
    peak: h === 18 || h === 20,
  }));
}

/** Novos alunos nos últimos 12 meses (o mês atual usa o valor ao vivo). */
export function newStudentsByMonth(current: number) {
  const base = [18, 21, 26, 24, 19, 23, 28, 31, 27, 25, 29];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { month: MONTHS_SHORT[d.getMonth()], value: i === 11 ? current : base[i] };
  });
}

/** Receita mensal Jan–Dez do ano atual (meses futuros = projeção). */
export function monthlyRevenue(currentMonthRevenue: number) {
  const base = [38420, 36980, 41250, 42870, 40110, 43560, 45890, 46210, 44730, 47120, 48900, 51200];
  const m = new Date().getMonth();
  return MONTHS.map((name, i) => ({
    month: MONTHS_SHORT[i],
    fullMonth: name,
    receita: i < m ? base[i] : i === m ? Math.round(currentMonthRevenue) : 0,
    projecao: i > m ? base[i] : 0,
  }));
}

export const revenueByMethodBase = { pix: 21480, credito: 14320, debito: 7650, dinheiro: 4400 };
