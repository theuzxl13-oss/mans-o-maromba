import type { AccessOrigin, PaymentMethod, StudentOrigin } from '@/types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const num = new Intl.NumberFormat('pt-BR');

export const formatCurrency = (v: number) => brl.format(v);
export const formatNumber = (v: number) => num.format(v);
export const formatCompactCurrency = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : brl.format(v);

export const formatMatricula = (n: number) => `MM-${String(n).padStart(6, '0')}`;

export const onlyDigits = (v: string) => v.replace(/\D/g, '');

export function maskCPF(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

export function maskCEP(v: string) {
  return onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
};

export const accessOriginLabel: Record<AccessOrigin, string> = {
  biometria: 'Biometria',
  wellhub: 'Wellhub',
  totalpass: 'TotalPass',
  manual: 'Liberação manual',
  recepcao: 'Recepção',
};

export const studentOriginLabel: Record<StudentOrigin, string> = {
  mansao: 'Mansão Maromba',
  wellhub: 'Wellhub',
  totalpass: 'TotalPass',
};
