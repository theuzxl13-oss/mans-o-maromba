import { useMemo, useState } from 'react';
import { Building2, CalendarCheck, Handshake, ScanLine, Search } from 'lucide-react';
import { AccessOriginBadge, AccessResultBadge, Avatar, Card, EmptyState, FilterChips, Input, PageHeader, StatCard, Table, TableSkeleton, Td } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useStats } from '@/hooks/useStats';
import { useFakeLoading } from '@/hooks/misc';
import { formatDate, formatTime, isSameDay } from '@/utils/date';
import { normalize } from '@/utils/misc';

type Filter = 'todos' | 'hoje' | 'mansao' | 'wellhub' | 'totalpass';

export default function Checkins() {
  const { db } = useData();
  const stats = useStats();
  const loading = useFakeLoading(500);
  const [filter, setFilter] = useState<Filter>('hoje');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const n = normalize(q);
    return db.accessLogs
      .filter((l) => l.result === 'liberado')
      .filter((l) => {
        if (filter === 'hoje') return isSameDay(l.timestamp);
        if (filter === 'wellhub') return l.origin === 'wellhub';
        if (filter === 'totalpass') return l.origin === 'totalpass';
        if (filter === 'mansao') return l.origin !== 'wellhub' && l.origin !== 'totalpass';
        return true;
      })
      .filter((l) => !n || normalize(l.studentName).includes(n))
      .slice(0, 80);
  }, [db.accessLogs, filter, q]);

  const own = stats.checkinsToday - stats.checkinsWellhub - stats.checkinsTotalpass;

  return (
    <>
      <PageHeader eyebrow="Frequência" title="Check-ins" subtitle="Entradas liberadas por origem." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Check-ins hoje" value={stats.checkinsToday} icon={<CalendarCheck className="size-[18px]" />} tone="sky" trend={{ value: '+12%', up: true }} hint="vs. ontem" loading={loading} />
        <StatCard label="Check-ins Wellhub" value={stats.checkinsWellhub} icon={<ScanLine className="size-[18px]" />} tone="violet" hint="hoje" loading={loading} delay={50} />
        <StatCard label="Check-ins TotalPass" value={stats.checkinsTotalpass} icon={<Handshake className="size-[18px]" />} tone="teal" hint="hoje" loading={loading} delay={100} />
        <StatCard label="Check-ins Mansão Maromba" value={own} icon={<Building2 className="size-[18px]" />} tone="red" hint="alunos próprios" loading={loading} delay={150} />
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
              { value: 'hoje', label: 'Hoje' },
              { value: 'todos', label: 'Últimos 30 dias' },
              { value: 'mansao', label: 'Mansão Maromba' },
              { value: 'wellhub', label: 'Wellhub' },
              { value: 'totalpass', label: 'TotalPass' },
            ]}
          />
        </div>
        {loading ? (
          <TableSkeleton />
        ) : list.length === 0 ? (
          <EmptyState icon={<CalendarCheck className="size-6" />} title="Nenhum check-in encontrado" description="Tente outro filtro ou simule um acesso." />
        ) : (
          <Table head={['Aluno', 'Data', 'Horário', 'Origem', 'Status']}>
            {list.map((l) => {
              const s = db.students.find((x) => x.id === l.studentId);
              return (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={l.studentName} src={s?.photo} size="xs" />
                      <span className="font-medium text-white">{l.studentName}</span>
                    </div>
                  </Td>
                  <Td className="text-zinc-300">{formatDate(l.timestamp)}</Td>
                  <Td className="text-zinc-300 tabular-nums">{formatTime(l.timestamp)}</Td>
                  <Td>
                    <AccessOriginBadge origin={l.origin} />
                  </Td>
                  <Td>
                    <AccessResultBadge result={l.result} />
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </>
  );
}
