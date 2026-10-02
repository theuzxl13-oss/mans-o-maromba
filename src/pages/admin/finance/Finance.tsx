import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock, DollarSign, Percent } from 'lucide-react';
import { Avatar, Card, CardHeader, PageHeader, Skeleton, StatCard, Table, Td } from '@/components/ui';
import { MethodDonut, RevenueChart } from '@/components/charts/Charts';
import { monthlyRevenue, revenueByMethodBase } from '@/data/charts';
import { useData } from '@/hooks/useData';
import { useStats } from '@/hooks/useStats';
import { useFakeLoading } from '@/hooks/misc';
import { formatDateTime, isSameMonth } from '@/utils/date';
import { formatCurrency, paymentMethodLabel } from '@/utils/format';

export default function Finance() {
  const { db } = useData();
  const stats = useStats();
  const loading = useFakeLoading(600);

  const revenue = useMemo(() => monthlyRevenue(stats.revenueMonth), [stats.revenueMonth]);
  const byMethod = useMemo(() => {
    const totals = { ...revenueByMethodBase };
    for (const p of db.payments) if (p.paidAt && p.method && isSameMonth(p.paidAt)) totals[p.method] += p.amount;
    return [
      { name: 'PIX', value: totals.pix },
      { name: 'Crédito', value: totals.credito },
      { name: 'Débito', value: totals.debito },
      { name: 'Dinheiro', value: totals.dinheiro },
    ];
  }, [db.payments]);

  const recent = useMemo(
    () =>
      db.payments
        .filter((p) => p.paidAt)
        .sort((a, b) => b.paidAt!.localeCompare(a.paidAt!))
        .slice(0, 6)
        .map((p) => ({ p, s: db.students.find((x) => x.id === p.studentId) })),
    [db.payments, db.students],
  );

  const yearTotal = revenue.reduce((a, r) => a + r.receita, 0);

  return (
    <>
      <PageHeader eyebrow="Gestão" title="Financeiro" subtitle="Receitas, recebimentos e indicadores financeiros." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Receita hoje" value={formatCurrency(stats.revenueToday)} icon={<CalendarDays className="size-[18px]" />} tone="sky" trend={{ value: '+5%', up: true }} hint="vs. média" loading={loading} />
        <StatCard label="Receita este mês" value={formatCurrency(stats.revenueMonth)} icon={<DollarSign className="size-[18px]" />} tone="green" trend={{ value: '+8,7%', up: true }} loading={loading} delay={50} />
        <StatCard label="A receber" value={formatCurrency(stats.receivable)} icon={<Clock className="size-[18px]" />} tone="amber" loading={loading} delay={100} />
        <StatCard label="Inadimplência" value={`${stats.delinquencyRate.toFixed(1).replace('.', ',')}%`} icon={<Percent className="size-[18px]" />} tone="red" hint={formatCurrency(stats.overdueAmount)} loading={loading} delay={150} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="animate-fade-up xl:col-span-3">
          <CardHeader
            title="Receita mensal"
            subtitle={`Janeiro a Dezembro de ${new Date().getFullYear()} · acumulado ${formatCurrency(yearTotal)}`}
            action={
              <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-brand-500" /> Realizado
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-sm bg-zinc-700" /> Projeção
                </span>
              </div>
            }
          />
          <div className="px-2 pt-4 pb-3">{loading ? <Skeleton className="mx-3 h-[290px]" /> : <RevenueChart data={revenue} />}</div>
        </Card>
        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader title="Receita por forma de pagamento" subtitle="Mês atual" />
          <div className="p-5">{loading ? <Skeleton className="h-48" /> : <MethodDonut data={byMethod} />}</div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader title="Últimos recebimentos" />
          <div className="mt-3">
            <Table head={['Aluno', 'Valor', 'Forma', 'Data']}>
              {recent.map(({ p, s }) => (
                <tr key={p.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s?.name ?? '?'} src={s?.photo} size="xs" />
                      <span className="font-medium text-white">{s?.name}</span>
                    </div>
                  </Td>
                  <Td className="font-semibold text-emerald-400">+ {formatCurrency(p.amount)}</Td>
                  <Td className="text-zinc-400">{p.method ? paymentMethodLabel[p.method] : '—'}</Td>
                  <Td className="text-zinc-400">{formatDateTime(p.paidAt)}</Td>
                </tr>
              ))}
            </Table>
          </div>
        </Card>
        <Card className="animate-fade-up p-5">
          <h3 className="font-display text-base font-semibold tracking-wide text-white uppercase">Fluxo do mês</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ['Mensalidades', stats.revenueMonth * 0.86, true],
              ['Avaliações físicas', stats.revenueMonth * 0.06, true],
              ['Loja / suplementos', stats.revenueMonth * 0.08, true],
              ['Folha de pagamento', 18900, false],
              ['Energia e água', 4320, false],
              ['Manutenção de equipamentos', 1650, false],
            ].map(([label, v, inc]) => (
              <li key={label as string} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-zinc-300">
                  {inc ? <ArrowUpRight className="size-4 text-emerald-400" /> : <ArrowDownRight className="size-4 text-brand-400" />}
                  {label as string}
                </span>
                <span className={inc ? 'font-semibold text-emerald-400' : 'font-semibold text-brand-400'}>
                  {inc ? '+' : '−'} {formatCurrency(v as number)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-xs tracking-widest text-zinc-500 uppercase">Resultado estimado</span>
            <span className="font-display text-xl font-semibold text-white">{formatCurrency(stats.revenueMonth - 18900 - 4320 - 1650)}</span>
          </div>
        </Card>
      </div>
    </>
  );
}
