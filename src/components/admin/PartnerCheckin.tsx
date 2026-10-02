import { useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, DoorOpen, Loader2, Search, ShieldCheck, Smartphone } from 'lucide-react';
import { AccessResultBadge, Avatar, Badge, Button, Card, CardHeader, EmptyState, Input, PageHeader, StatCard, Table, Td } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { useStats } from '@/hooks/useStats';
import type { PartnerCheckin, PartnerCheckinProvider } from '@/services/integrations';
import { evaluateAccess } from '@/services/rules';
import { formatDateTime, formatTime, isSameDay } from '@/utils/date';
import { beep } from '@/utils/sound';
import { cn } from '@/utils/misc';

type Phase = 'idle' | 'loading' | 'found' | 'released' | 'error';

const BRAND = {
  wellhub: { label: 'Wellhub', accent: 'text-fuchsia-400', bg: 'from-fuchsia-500/20', ring: 'border-fuchsia-500/30', tone: 'violet' as const },
  totalpass: { label: 'TotalPass', accent: 'text-teal-300', bg: 'from-teal-500/20', ring: 'border-teal-500/30', tone: 'teal' as const },
};

/**
 * Tela de check-in de parceiros — SIMULAÇÃO PARA DEMONSTRAÇÃO.
 * A validação real dependerá da API oficial do parceiro (credenciais da academia).
 */
export function PartnerCheckinPage({ provider }: { provider: PartnerCheckinProvider }) {
  const key = provider.provider;
  const b = BRAND[key];
  const { db, registerAccess } = useData();
  const stats = useStats();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [checkin, setCheckin] = useState<PartnerCheckin | null>(null);
  const [error, setError] = useState('');

  const partnerStudents = useMemo(() => db.students.filter((s) => s.origin === key), [db.students, key]);
  const history = useMemo(() => db.accessLogs.filter((l) => l.origin === key).slice(0, 12), [db.accessLogs, key]);
  const todayCount = key === 'wellhub' ? stats.checkinsWellhub : stats.checkinsTotalpass;

  const verify = async (e?: FormEvent, q = query) => {
    e?.preventDefault();
    if (!q.trim()) return toast.warning('Digite o CPF ou a matrícula');
    setPhase('loading');
    setError('');
    try {
      const res = await provider.verifyCheckin(q, db.students);
      setCheckin(res);
      setPhase('found');
    } catch (err) {
      setError((err as Error).message);
      setPhase('error');
      if (db.settings.soundOnAccess) beep('error');
    }
  };

  const release = () => {
    if (!checkin) return;
    const d = evaluateAccess(checkin.student, key);
    if (!d.allowed) {
      registerAccess({ studentId: checkin.student.id, studentName: checkin.student.name, origin: key, result: 'bloqueado', reason: d.reason });
      setError(d.reason ?? 'Acesso negado');
      setPhase('error');
      return;
    }
    registerAccess({ studentId: checkin.student.id, studentName: checkin.student.name, origin: key, result: 'liberado' });
    if (db.settings.soundOnAccess) beep('ok');
    setPhase('released');
    toast.success(`Check-in ${b.label} validado`, `${checkin.student.name} — acesso autorizado.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Parceiros"
        title={`Check-in ${b.label}`}
        subtitle={`Valide o check-in feito pelo aluno no app ${b.label} e libere a catraca.`}
        actions={<Badge tone="amber">Simulação para demonstração</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={`Check-ins ${b.label} hoje`} value={todayCount} icon={<Smartphone className="size-[18px]" />} tone={b.tone} />
        <StatCard label="Alunos vinculados" value={partnerStudents.length} icon={<ShieldCheck className="size-[18px]" />} tone="zinc" hint="nesta demonstração" delay={50} />
        <StatCard label="Integração" value="Simulada" icon={<DoorOpen className="size-[18px]" />} tone="amber" hint="pronta para API oficial" delay={100} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card className="animate-fade-up relative overflow-hidden">
          <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent', b.bg)} />
          <div className="relative p-6 sm:p-8">
            <p className={cn('font-display text-3xl font-bold tracking-wider uppercase', b.accent)}>{b.label}</p>
            <p className="mt-1 text-sm text-zinc-400">Digite CPF ou matrícula.</p>
            <form onSubmit={verify} className="mt-6 flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <Input
                  className="h-12 text-base"
                  icon={<Search className="size-4" />}
                  placeholder="000.000.000-00 ou MM-000000"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={phase === 'loading'}
                />
              </div>
              <Button type="submit" size="lg" loading={phase === 'loading'}>
                Verificar check-in
              </Button>
            </form>
            {partnerStudents.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                Exemplos:
                {partnerStudents.slice(0, 3).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="cursor-pointer rounded-md border border-white/10 px-2 py-1 text-zinc-400 transition hover:border-white/25 hover:text-white"
                    onClick={() => {
                      setQuery(s.matricula);
                      verify(undefined, s.matricula);
                    }}
                  >
                    {s.name.split(' ')[0]} · {s.matricula}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 min-h-[260px] rounded-2xl border border-white/10 bg-ink-950/70 p-6" aria-live="polite">
              {phase === 'idle' && (
                <EmptyState icon={<Smartphone className="size-6" />} title="Aguardando consulta" description={`O aluno deve fazer check-in no app ${b.label} antes de chegar à recepção.`} />
              )}
              {phase === 'loading' && (
                <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className={cn('size-10 animate-spin', b.accent)} />
                  <p className="font-display tracking-wider text-zinc-300 uppercase">Consultando {b.label}...</p>
                  <p className="text-xs text-zinc-500">Verificando check-in ativo para hoje</p>
                </div>
              )}
              {phase === 'error' && (
                <div className="animate-scale-in flex min-h-[220px] flex-col items-center justify-center gap-3 text-center">
                  <AlertCircle className="size-12 text-brand-500" />
                  <p className="font-display text-xl tracking-wider text-brand-400 uppercase">Check-in não validado</p>
                  <p className="max-w-sm text-sm text-zinc-400">{error}</p>
                  <Button variant="secondary" size="sm" onClick={() => setPhase('idle')}>
                    Nova consulta
                  </Button>
                </div>
              )}
              {(phase === 'found' || phase === 'released') && checkin && (
                <div className="animate-scale-in">
                  <p className={cn('flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase', b.accent)}>
                    <CheckCircle2 className="size-4" /> {b.label} · Check-in localizado
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <Avatar name={checkin.student.name} src={checkin.student.photo} size="lg" />
                    <div className="space-y-0.5 text-sm">
                      <p className="font-display text-2xl font-semibold tracking-wide text-white uppercase">{checkin.student.name}</p>
                      <p className="text-zinc-400">
                        Horário: <span className="text-white">{formatTime(checkin.checkinAt)}</span>
                      </p>
                      <p className="text-zinc-400">
                        Status: <Badge tone="green">Validado</Badge>
                      </p>
                      <p className="font-mono text-[11px] text-zinc-600">Token: {checkin.token}</p>
                    </div>
                  </div>
                  {phase === 'found' ? (
                    <Button size="lg" variant="success" className="mt-6 w-full" icon={<DoorOpen className="size-5" />} onClick={release}>
                      Liberar acesso
                    </Button>
                  ) : (
                    <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
                      <p className={cn('text-xs font-semibold tracking-[0.2em] uppercase', b.accent)}>
                        {b.label} · Check-in validado
                      </p>
                      <p className="font-display mt-1 text-3xl font-bold tracking-wider text-emerald-400 uppercase">✓ Acesso autorizado</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setPhase('idle');
                          setQuery('');
                        }}
                      >
                        Novo check-in
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader title={`Histórico ${b.label}`} subtitle="Check-ins recentes" />
          <div className="mt-3">
            {history.length === 0 ? (
              <EmptyState title="Nenhum check-in" />
            ) : (
              <Table head={['Aluno', 'Data', 'Status']} className="[&_table]:min-w-0">
                {history.map((l) => {
                  const s = db.students.find((x) => x.id === l.studentId);
                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <Td>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={l.studentName} src={s?.photo} size="xs" />
                          <span className="font-medium text-white">{l.studentName}</span>
                        </div>
                      </Td>
                      <Td className="text-zinc-400 tabular-nums">{isSameDay(l.timestamp) ? `Hoje ${formatTime(l.timestamp)}` : formatDateTime(l.timestamp)}</Td>
                      <Td>
                        <AccessResultBadge result={l.result} />
                      </Td>
                    </tr>
                  );
                })}
              </Table>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
