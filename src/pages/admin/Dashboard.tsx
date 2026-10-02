import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarCheck, DollarSign, DoorOpen, Receipt, ShieldX, UserPlus, Users, Zap } from 'lucide-react';
import { Button, Card, CardHeader, PageHeader, StatCard, TableSkeleton, Skeleton } from '@/components/ui';
import { MovementChart, NewStudentsChart } from '@/components/charts/Charts';
import { AccessTable } from '@/components/admin/AccessFeed';
import { hourlyMovement, newStudentsByMonth } from '@/data/charts';
import { useData } from '@/hooks/useData';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/hooks/useAuth';
import { useFakeLoading } from '@/hooks/misc';
import { formatCurrency, formatNumber } from '@/utils/format';

export default function Dashboard() {
  const { db } = useData();
  const { user } = useAuth();
  const stats = useStats();
  const loading = useFakeLoading(650);
  const navigate = useNavigate();

  const movement = useMemo(() => hourlyMovement(db.accessLogs), [db.accessLogs]);
  const newByMonth = useMemo(() => newStudentsByMonth(stats.newStudents), [stats.newStudents]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <>
      <PageHeader
        eyebrow="Visão geral"
        title="Dashboard"
        subtitle={`${greeting}, ${user?.name.split(' ')[0]}. Aqui está o resumo da academia hoje.`}
        actions={
          <>
            <Button variant="secondary" icon={<DoorOpen className="size-4" />} onClick={() => navigate('/admin/controle-acesso')}>
              Controle de acesso
            </Button>
            <Button icon={<UserPlus className="size-4" />} onClick={() => navigate('/admin/alunos/novo')}>
              Novo aluno
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard loading={loading} delay={0} label="Alunos ativos" value={formatNumber(stats.activeStudents)} icon={<Users className="size-[18px]" />} tone="green" trend={{ value: '+4,2%', up: true }} hint="vs. mês anterior" />
        <StatCard loading={loading} delay={50} label="Check-ins hoje" value={formatNumber(stats.checkinsToday)} icon={<CalendarCheck className="size-[18px]" />} tone="sky" trend={{ value: '+12%', up: true }} hint="vs. ontem" />
        <StatCard loading={loading} delay={100} label="Mensalidades pendentes" value={formatNumber(stats.pendingPayments)} icon={<Receipt className="size-[18px]" />} tone="amber" trend={{ value: '-3', up: false, good: true }} hint="vs. semana passada" />
        <StatCard loading={loading} delay={150} label="Receita do mês" value={formatCurrency(stats.revenueMonth).replace(',00', '')} icon={<DollarSign className="size-[18px]" />} tone="red" trend={{ value: '+8,7%', up: true }} hint="vs. mês anterior" />
        <StatCard loading={loading} delay={200} label="Novos alunos" value={formatNumber(stats.newStudents)} icon={<UserPlus className="size-[18px]" />} tone="violet" trend={{ value: '+6', up: true }} hint="neste mês" />
        <StatCard loading={loading} delay={250} label="Acessos bloqueados" value={formatNumber(stats.blockedAccesses)} icon={<ShieldX className="size-[18px]" />} tone="red" hint="hoje na catraca" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="animate-fade-up xl:col-span-3">
          <CardHeader
            title="Movimento da academia"
            subtitle="Acessos por horário — hoje"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/10 px-2.5 py-1 text-[11px] font-semibold text-brand-400">
                <Zap className="size-3.5" /> Pico: 18h – 20h
              </span>
            }
          />
          <div className="px-2 pt-4 pb-3">{loading ? <Skeleton className="mx-3 h-[250px]" /> : <MovementChart data={movement} />}</div>
        </Card>
        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader title="Novos alunos por mês" subtitle="Últimos 12 meses" />
          <div className="px-2 pt-4 pb-3">{loading ? <Skeleton className="mx-3 h-[250px]" /> : <NewStudentsChart data={newByMonth} />}</div>
        </Card>
      </div>

      <Card className="animate-fade-up mt-6">
        <CardHeader
          title="Últimos acessos"
          subtitle="Atualizado em tempo real a cada simulação"
          action={
            <Link to="/admin/catraca" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 hover:text-brand-300">
              Central de acessos <ArrowRight className="size-3.5" />
            </Link>
          }
        />
        <div className="mt-3">{loading ? <TableSkeleton rows={5} /> : <AccessTable logs={db.accessLogs.slice(0, 8)} />}</div>
      </Card>
    </>
  );
}
