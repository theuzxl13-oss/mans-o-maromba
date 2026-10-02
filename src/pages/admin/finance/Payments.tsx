import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, MessageCircle, Percent, Receipt, Search, Wallet } from 'lucide-react';
import { Avatar, Button, Card, EmptyState, FilterChips, Input, PageHeader, PaymentStatusBadge, StatCard, Table, TableSkeleton, Td, Tooltip } from '@/components/ui';
import { PaymentModal } from '@/components/admin/PaymentModal';
import { useData } from '@/hooks/useData';
import { useStats } from '@/hooks/useStats';
import { useToast } from '@/hooks/useToast';
import { useFakeLoading } from '@/hooks/misc';
import { getPaymentStatus } from '@/services/rules';
import type { PaymentStatus } from '@/types';
import { formatDate } from '@/utils/date';
import { formatCurrency, paymentMethodLabel } from '@/utils/format';
import { normalize } from '@/utils/misc';

type Filter = 'todos' | PaymentStatus;

export default function Payments() {
  const { db, getPlan } = useData();
  const stats = useStats();
  const toast = useToast();
  const loading = useFakeLoading(500);
  const [filter, setFilter] = useState<Filter>('todos');
  const [q, setQ] = useState('');
  const [modal, setModal] = useState<{ studentId?: string; paymentId?: string } | null>(null);

  const rows = useMemo(() => {
    const order: Record<PaymentStatus, number> = { vencido: 0, pendente: 1, pago: 2 };
    return db.payments
      .map((p) => ({ p, s: db.students.find((x) => x.id === p.studentId), status: getPaymentStatus(p) }))
      .filter((r) => r.s)
      .sort((a, b) => order[a.status] - order[b.status] || (a.status === 'pago' ? b.p.dueDate.localeCompare(a.p.dueDate) : a.p.dueDate.localeCompare(b.p.dueDate)));
  }, [db.payments, db.students]);

  const counts = useMemo(
    () => ({
      todos: rows.length,
      pago: rows.filter((r) => r.status === 'pago').length,
      pendente: rows.filter((r) => r.status === 'pendente').length,
      vencido: rows.filter((r) => r.status === 'vencido').length,
    }),
    [rows],
  );

  const list = rows.filter((r) => (filter === 'todos' || r.status === filter) && (!q || normalize(r.s!.name).includes(normalize(q))));

  return (
    <>
      <PageHeader
        eyebrow="Financeiro"
        title="Mensalidades"
        subtitle="Controle de cobranças, vencimentos e inadimplência."
        actions={
          <Button icon={<Wallet className="size-4" />} onClick={() => setModal({})}>
            Registrar pagamento
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recebido no mês" value={formatCurrency(stats.revenueMonth)} icon={<CheckCircle2 className="size-[18px]" />} tone="green" trend={{ value: '+8,7%', up: true }} loading={loading} />
        <StatCard label="A receber" value={formatCurrency(stats.receivable)} icon={<Clock className="size-[18px]" />} tone="amber" hint={`${stats.pendingPayments} mensalidades`} loading={loading} delay={50} />
        <StatCard label="Vencidas" value={formatCurrency(stats.overdueAmount)} icon={<AlertTriangle className="size-[18px]" />} tone="red" hint={`${counts.vencido} nesta lista`} loading={loading} delay={100} />
        <StatCard label="Inadimplência" value={`${stats.delinquencyRate.toFixed(1).replace('.', ',')}%`} icon={<Percent className="size-[18px]" />} tone="zinc" trend={{ value: '-0,8 p.p.', up: false, good: true }} loading={loading} delay={150} />
      </div>

      <Card className="animate-fade-up mt-6">
        <div className="flex flex-col gap-3 border-b border-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:w-72">
            <Input icon={<Search className="size-4" />} placeholder="Pesquisar aluno..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <FilterChips<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todos', label: 'Todas', count: counts.todos },
              { value: 'vencido', label: 'Vencidas', count: counts.vencido },
              { value: 'pendente', label: 'Pendentes', count: counts.pendente },
              { value: 'pago', label: 'Pagas', count: counts.pago },
            ]}
          />
        </div>
        {loading ? (
          <TableSkeleton rows={8} />
        ) : list.length === 0 ? (
          <EmptyState icon={<Receipt className="size-6" />} title="Nenhuma mensalidade encontrada" />
        ) : (
          <Table head={['Aluno', 'Plano', 'Valor', 'Vencimento', 'Status', 'Forma de pagamento', 'Ações']}>
            {list.map(({ p, s, status }) => (
              <tr key={p.id} className="transition hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={s!.name} src={s!.photo} size="xs" />
                    <div>
                      <p className="font-medium text-white">{s!.name}</p>
                      <p className="text-[11px] text-zinc-500">{s!.matricula}</p>
                    </div>
                  </div>
                </Td>
                <Td className="text-zinc-300">{getPlan(p.planId)?.name ?? '—'}</Td>
                <Td className="font-semibold text-white tabular-nums">{formatCurrency(p.amount)}</Td>
                <Td className={status === 'vencido' ? 'text-brand-400' : 'text-zinc-300'}>{formatDate(p.dueDate)}</Td>
                <Td>
                  <PaymentStatusBadge status={status} />
                </Td>
                <Td className="text-zinc-400">{p.method ? paymentMethodLabel[p.method] : '—'}</Td>
                <Td>
                  {status === 'pago' ? (
                    <span className="text-xs text-zinc-500">Pago em {formatDate(p.paidAt)}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="success" onClick={() => setModal({ studentId: s!.id, paymentId: p.id })}>
                        Receber
                      </Button>
                      <Tooltip label="Enviar lembrete (simulado)">
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Enviar lembrete"
                          onClick={() => toast.info('Lembrete enviado (simulação)', `Mensagem de cobrança para ${s!.name} via WhatsApp.`)}
                        >
                          <MessageCircle className="size-4" />
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <PaymentModal open={!!modal} onClose={() => setModal(null)} studentId={modal?.studentId} paymentId={modal?.paymentId} />
    </>
  );
}
