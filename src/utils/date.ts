// Utilitários de data sem dependências externas.

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local no formato yyyy-mm-dd. */
export function toISODate(d: Date = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export const today = () => toISODate();

export function addDays(date: string, days: number) {
  const d = parseISODate(date);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(date: string, months: number) {
  const d = parseISODate(date);
  d.setMonth(d.getMonth() + months);
  return toISODate(d);
}

/** Diferença em dias (b - a). */
export function diffDays(a: string, b: string) {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / 86_400_000);
}

export function formatDate(s?: string) {
  if (!s) return '—';
  const d = s.length === 10 ? parseISODate(s) : new Date(s);
  return d.toLocaleDateString('pt-BR');
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('pt-BR')} ${formatTime(iso)}`;
}

export function isSameDay(iso: string, ref: Date = new Date()) {
  return toISODate(new Date(iso)) === toISODate(ref);
}

export function isSameMonth(isoOrDate: string, ref: Date = new Date()) {
  const d = isoOrDate.length === 10 ? parseISODate(isoOrDate) : new Date(isoOrDate);
  return d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
}

export function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'ontem' : `há ${days} dias`;
}

export const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
