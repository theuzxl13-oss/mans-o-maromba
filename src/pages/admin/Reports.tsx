import { useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  DollarSign,
  DoorOpen,
  FileDown,
  FileText,
  Handshake,
  Play,
  Receipt,
  ScanLine,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button, Card, CardHeader, EmptyState, Field, Input, PageHeader, Select, Table, TableSkeleton, Td } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { exportReportPDF, generateReport, REPORT_TITLES, type ReportFilters, type ReportResult, type ReportType } from '@/services/reports';
import { addDays, today } from '@/utils/date';
import { cn, sleep } from '@/utils/misc';

const CARDS: { type: ReportType; icon: typeof Users; desc: string }[] = [
  { type: 'alunos', icon: Users, desc: 'Cadastro completo de alunos' },
  { type: 'ativos', icon: UserCheck, desc: 'Alunos com acesso liberado' },
  { type: 'inadimplentes', icon: AlertTriangle, desc: 'Mensalidades em atraso' },
  { type: 'checkins', icon: CalendarCheck, desc: 'Frequência por período' },
  { type: 'acessos', icon: DoorOpen, desc: 'Liberados e bloqueados' },
  { type: 'wellhub', icon: ScanLine, desc: 'Check-ins de parceiros' },
  { type: 'totalpass', icon: Handshake, desc: 'Check-ins de parceiros' },
  { type: 'financeiro', icon: DollarSign, desc: 'Movimentação financeira' },
  { type: 'mensalidades', icon: Receipt, desc: 'Pagas, pendentes e vencidas' },
  { type: 'receita', icon: TrendingUp, desc: 'Receita recebida no período' },
];

const STATUS_OPTIONS: Partial<Record<ReportType, { value: string; label: string }[]>> = {
  alunos: [
    { value: 'ativo', label: 'Ativos' },
    { value: 'vencido', label: 'Vencidos' },
    { value: 'inativo', label: 'Inativos' },
    { value: 'bloqueado', label: 'Bloqueados' },
  ],
  acessos: [
    { value: 'liberado', label: 'Liberados' },
    { value: 'bloqueado', label: 'Bloqueados' },
  ],
  financeiro: [
    { value: 'pago', label: 'Pagos' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'vencido', label: 'Vencidos' },
  ],
  mensalidades: [
    { value: 'pago', label: 'Pagas' },
    { value: 'pendente', label: 'Pendentes' },
    { value: 'vencido', label: 'Vencidas' },
  ],
};

export default function Reports() {
  const { db } = useData();
  const toast = useToast();
  const [type, setType] = useState<ReportType>('alunos');
  const [filters, setFilters] = useState<ReportFilters>({ from: addDays(today(), -30), to: today(), status: 'todos', planId: 'todos' });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    await sleep(900);
    setResult(generateReport(db, type, filters));
    setLoading(false);
  };

  const exportPdf = async () => {
    setExporting(true);
    const r = result ?? generateReport(db, type, filters);
    await sleep(600);
    exportReportPDF(r, filters, db.settings.gymName);
    setExporting(false);
    toast.success('PDF exportado', `${r.title} — ${r.rows.length} registros.`);
  };

  return (
    <>
      <PageHeader eyebrow="Análises" title="Central de relatórios" subtitle="Gere relatórios por período e exporte em PDF." />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map(({ type: t, icon: Icon, desc }, i) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setResult(null);
              setFilters((f) => ({ ...f, status: 'todos' }));
            }}
            className={cn(
              'card animate-fade-up group cursor-pointer p-4 text-left transition hover:-translate-y-0.5 hover:border-white/15',
              type === t && 'border-brand-500/50 bg-gradient-to-br from-brand-500/15 to-ink-850',
            )}
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <span className={cn('flex size-9 items-center justify-center rounded-lg', type === t ? 'bg-brand-500 text-white' : 'bg-white/5 text-zinc-400 group-hover:text-white')}>
              <Icon className="size-[18px]" />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">{REPORT_TITLES[t]}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{desc}</p>
          </button>
        ))}
      </div>

      <Card className="animate-fade-up mt-6">
        <CardHeader title={REPORT_TITLES[type]} subtitle="Filtros do relatório" icon={<BarChart3 className="size-4" />} />
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <Field label="Data inicial">
            <Input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </Field>
          <Field label="Data final">
            <Input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </Field>
          <Field label="Status">
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} disabled={!STATUS_OPTIONS[type]}>
              <option value="todos">Todos</option>
              {STATUS_OPTIONS[type]?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Plano">
            <Select value={filters.planId} onChange={(e) => setFilters({ ...filters, planId: e.target.value })}>
              <option value="todos">Todos</option>
              {db.plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
            <Button onClick={generate} loading={loading} icon={<Play className="size-4" />} className="flex-1">
              Gerar relatório
            </Button>
            <Button variant="secondary" onClick={exportPdf} loading={exporting} icon={<FileDown className="size-4" />} className="flex-1">
              Exportar PDF
            </Button>
          </div>
        </div>

        <div className="border-t border-white/5">
          {loading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : !result ? (
            <EmptyState icon={<FileText className="size-6" />} title="Nenhum relatório gerado" description="Defina os filtros e clique em “Gerar relatório” para visualizar os dados." />
          ) : (
            <div className="animate-fade-in">
              <div className="flex flex-wrap gap-3 p-5">
                {result.summary.map((s) => (
                  <div key={s.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] tracking-widest text-zinc-500 uppercase">{s.label}</p>
                    <p className="font-display text-xl font-semibold text-white">{s.value}</p>
                  </div>
                ))}
              </div>
              {result.rows.length === 0 ? (
                <EmptyState title="Sem registros para os filtros selecionados" />
              ) : (
                <Table head={result.columns}>
                  {result.rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.02]">
                      {row.map((c, j) => (
                        <Td key={j} className={j === 0 || j === 1 ? 'text-white' : 'text-zinc-400'}>
                          {c}
                        </Td>
                      ))}
                    </tr>
                  ))}
                </Table>
              )}
              {result.rows.length > 50 && (
                <p className="border-t border-white/5 px-5 py-3 text-xs text-zinc-500">Exibindo 50 de {result.rows.length} registros. Exporte o PDF para ver todos.</p>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
