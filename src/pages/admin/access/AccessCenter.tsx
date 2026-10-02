import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, CheckCircle2, DoorOpen, KeyRound, Pause, Play, Radio, Server, ShieldX } from 'lucide-react';
import { Badge, Button, Card, CardHeader, FilterChips, PageHeader, StatCard } from '@/components/ui';
import { AccessTimeline } from '@/components/admin/AccessFeed';
import { useData } from '@/hooks/useData';
import { useClock } from '@/hooks/misc';
import { evaluateAccess } from '@/services/rules';
import type { AccessOrigin } from '@/types';
import { isSameDay } from '@/utils/date';
import { cn } from '@/utils/misc';

type Filter = 'todos' | 'liberado' | 'bloqueado';

/** CENTRAL DE ACESSOS — monitor em tempo (quase) real das catracas. */
export default function AccessCenter() {
  const { db, registerAccess } = useData();
  const now = useClock();
  const [filter, setFilter] = useState<Filter>('todos');
  const [auto, setAuto] = useState(false);
  const [flash, setFlash] = useState(false);
  const lastId = useRef(db.accessLogs[0]?.id);

  const todayLogs = useMemo(() => db.accessLogs.filter((l) => isSameDay(l.timestamp)), [db.accessLogs]);
  const filtered = todayLogs.filter((l) => filter === 'todos' || l.result === filter).slice(0, 30);
  const newestId = db.accessLogs[0]?.id;

  // Pisca o indicador quando chega um novo acesso.
  useEffect(() => {
    if (newestId && newestId !== lastId.current) {
      lastId.current = newestId;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
  }, [newestId]);

  // Simulação automática de fluxo de alunos (modo apresentação).
  const dbRef = useRef(db);
  dbRef.current = db;
  useEffect(() => {
    if (!auto) return;
    const tick = () => {
      const { students } = dbRef.current;
      const s = students[Math.floor(Math.random() * students.length)];
      if (!s) return;
      const origin: AccessOrigin = s.origin === 'wellhub' ? 'wellhub' : s.origin === 'totalpass' ? 'totalpass' : 'biometria';
      const d = evaluateAccess(s, origin);
      registerAccess({ studentId: s.id, studentName: s.name, origin, result: d.allowed ? 'liberado' : 'bloqueado', reason: d.reason });
    };
    tick();
    const t = setInterval(tick, 4500);
    return () => clearInterval(t);
  }, [auto, registerAccess]);

  const allowed = todayLogs.filter((l) => l.result === 'liberado').length;
  const blocked = todayLogs.filter((l) => l.result === 'bloqueado').length;
  const manual = todayLogs.filter((l) => l.origin === 'manual').length;
  const lastHour = todayLogs.filter((l) => Date.now() - new Date(l.timestamp).getTime() < 3_600_000).length;

  const gates = [
    { name: 'Catraca 01', dir: 'Entrada', online: true, count: todayLogs.filter((l) => l.gate === 'Catraca 01').length },
    { name: 'Catraca 02', dir: 'Saída', online: true, count: Math.max(0, allowed - 6) },
    { name: 'Porta PCD', dir: 'Entrada assistida', online: true, count: 2 },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Monitoramento"
        title="Central de acessos"
        subtitle="Acompanhe em tempo real todas as entradas registradas nas catracas."
        actions={
          <>
            <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition', flash ? 'bg-brand-500 text-white' : 'bg-white/5 text-zinc-400')}>
              <Radio className="size-3.5" /> AO VIVO · {now.toLocaleTimeString('pt-BR')}
            </span>
            <Button variant={auto ? 'primary' : 'secondary'} icon={auto ? <Pause className="size-4" /> : <Play className="size-4" />} onClick={() => setAuto((a) => !a)}>
              {auto ? 'Pausar fluxo simulado' : 'Simular fluxo de alunos'}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Acessos liberados" value={allowed} icon={<CheckCircle2 className="size-[18px]" />} tone="green" hint="hoje" />
        <StatCard label="Acessos bloqueados" value={blocked} icon={<ShieldX className="size-[18px]" />} tone="red" hint="hoje" delay={50} />
        <StatCard label="Liberações manuais" value={manual} icon={<KeyRound className="size-[18px]" />} tone="amber" hint="hoje" delay={100} />
        <StatCard label="Última hora" value={lastHour} icon={<Activity className="size-[18px]" />} tone="sky" hint="acessos" delay={150} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="animate-fade-up">
          <CardHeader
            title="Fluxo de acessos — hoje"
            subtitle={`${todayLogs.length} registros`}
            action={
              <FilterChips<Filter>
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'todos', label: 'Todos' },
                  { value: 'liberado', label: 'Liberados' },
                  { value: 'bloqueado', label: 'Bloqueados' },
                ]}
              />
            }
          />
          <div className="mt-3 max-h-[640px] overflow-y-auto">
            <AccessTimeline logs={filtered} newestId={newestId} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="animate-fade-up">
            <CardHeader title="Dispositivos" icon={<Server className="size-4" />} />
            <ul className="space-y-2 p-5">
              {gates.map((g) => (
                <li key={g.name} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                    <DoorOpen className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{g.name}</p>
                    <p className="text-xs text-zinc-500">
                      {g.dir} · {g.count} hoje
                    </p>
                  </div>
                  <Badge tone="green" dot>
                    Online
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="animate-fade-up p-5 text-sm text-zinc-400">
            <p className="font-display mb-2 tracking-wider text-white uppercase">Como demonstrar</p>
            <ol className="list-decimal space-y-1.5 pl-4">
              <li>Clique em “Simular fluxo de alunos” para gerar acessos automáticos.</li>
              <li>Ou abra o Controle de Acesso em outra aba e simule uma biometria.</li>
              <li>Os novos acessos aparecem no topo com destaque.</li>
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
