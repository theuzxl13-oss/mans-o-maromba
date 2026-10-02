import { useMemo, useRef, useState } from 'react';
import { CheckCircle2, Fingerprint, KeyRound, Loader2, RotateCcw, ScanFace, ShieldCheck, Wifi, XCircle } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, StudentStatusBadge } from '@/components/ui';
import { StudentPicker } from '@/components/admin/StudentPicker';
import { ReasonModal } from '@/components/admin/ReasonModal';
import { AccessTimeline } from '@/components/admin/AccessFeed';
import { TurnstileGraphic, type TurnstileLight } from '@/components/admin/Turnstile';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { useClock } from '@/hooks/misc';
import { biometricReader, turnstile } from '@/services/integrations';
import { evaluateAccess, getDisplayStatus, type AccessDecision } from '@/services/rules';
import type { Student } from '@/types';
import { formatDate } from '@/utils/date';
import { studentOriginLabel } from '@/utils/format';
import { beep } from '@/utils/sound';
import { cn, sleep } from '@/utils/misc';

type Phase = 'idle' | 'reading' | 'identified' | 'granted' | 'denied' | 'manual';

const GATE = 'Catraca 01';

/**
 * CONTROLE DE ACESSO — SIMULAÇÃO PARA DEMONSTRAÇÃO.
 * Fluxo: leitura biométrica → identificação → regra de acesso → giro da catraca → histórico.
 */
export default function AccessControl() {
  const { db, getPlan, registerAccess } = useData();
  const toast = useToast();
  const now = useClock();
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [current, setCurrent] = useState<Student | null>(null);
  const [decision, setDecision] = useState<AccessDecision | null>(null);
  const [rotation, setRotation] = useState(0);
  const [manualOpen, setManualOpen] = useState(false);
  const [newestId, setNewestId] = useState<string>();
  const runId = useRef(0);

  const busy = phase === 'reading' || phase === 'identified';
  const light: TurnstileLight =
    phase === 'granted' || phase === 'manual' ? 'granted' : phase === 'denied' ? 'denied' : busy ? 'reading' : 'idle';

  // Atalhos de demonstração: um aluno regular e um inadimplente.
  const demoStudents = useMemo(() => {
    const ok = db.students.filter((s) => s.biometry && evaluateAccess(s, 'biometria').allowed);
    const overdue = db.students.filter((s) => getDisplayStatus(s) === 'vencido');
    const newest = [...db.students].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return [
      { s: newest, tag: 'Último cadastro' },
      { s: ok.find((x) => x.name === 'Lucas Ferreira') ?? ok[0], tag: 'Ativo' },
      { s: overdue.find((x) => x.name === 'Carlos Henrique') ?? overdue[0], tag: 'Inadimplente' },
    ].filter((x, i, arr) => x.s && arr.findIndex((y) => y.s?.id === x.s?.id) === i) as { s: Student; tag: string }[];
  }, [db.students]);

  const spin = async () => {
    await turnstile.release('catraca-01');
    setRotation((r) => r + 120);
  };

  const simulate = async () => {
    const student = db.students.find((s) => s.id === selected);
    if (!student) {
      toast.warning('Selecione um aluno', 'Escolha o aluno que irá posicionar o dedo no leitor.');
      return;
    }
    const id = ++runId.current;
    setCurrent(student);
    setDecision(null);
    setPhase('reading');
    await biometricReader.identify(student.id);
    if (id !== runId.current) return;
    setPhase('identified');
    await sleep(1100);
    if (id !== runId.current) return;

    const result = evaluateAccess(student, 'biometria', db.settings.graceDays, db.settings.autoBlockOverdue);
    setDecision(result);
    const log = registerAccess({
      studentId: student.id,
      studentName: student.name,
      origin: 'biometria',
      result: result.allowed ? 'liberado' : 'bloqueado',
      reason: result.reason,
      gate: GATE,
    });
    setNewestId(log.id);
    if (db.settings.soundOnAccess) beep(result.allowed ? 'ok' : 'error');
    if (result.allowed) {
      setPhase('granted');
      spin();
    } else {
      setPhase('denied');
    }
  };

  const manualRelease = (reason: string) => {
    if (!current) return;
    const log = registerAccess({
      studentId: current.id,
      studentName: current.name,
      origin: 'manual',
      result: 'liberado',
      manualReason: reason,
      gate: GATE,
    });
    setNewestId(log.id);
    setPhase('manual');
    if (db.settings.soundOnAccess) beep('ok');
    spin();
    toast.success('Acesso liberado pelo administrador', `${current.name} — ${reason}`);
  };

  const reset = () => {
    runId.current++;
    setPhase('idle');
    setCurrent(null);
    setDecision(null);
  };

  const plan = current ? getPlan(current.planId) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Simulação de hardware"
        title="Controle de acesso"
        subtitle="Simule a leitura biométrica e a liberação da catraca em tempo real."
        actions={<Badge tone="amber">Modo demonstração</Badge>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        {/* Painel da catraca */}
        <Card className="animate-fade-up relative overflow-hidden">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 transition-opacity duration-500',
              light === 'granted' && 'bg-[radial-gradient(circle_at_70%_40%,rgb(16_185_129/0.18),transparent_60%)]',
              light === 'denied' && 'bg-[radial-gradient(circle_at_70%_40%,rgb(225_29_46/0.22),transparent_60%)]',
            )}
          />
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div>
              <p className="font-display text-lg font-semibold tracking-wider text-white uppercase">Catraca 01 — Entrada</p>
              <p className="text-xs text-zinc-500">Leitor biométrico + catraca tripé · Recepção</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                ONLINE
              </span>
              <span className="font-display text-2xl font-semibold text-white tabular-nums">
                {now.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="relative grid items-center gap-6 p-5 md:grid-cols-[170px_1fr] md:p-6">
            <div className="mx-auto h-56 w-48 md:h-64 md:w-full">
              <TurnstileGraphic light={light} rotation={rotation} />
            </div>

            {/* Display */}
            <div className="min-h-[300px] rounded-2xl border border-white/10 bg-ink-950/80 p-6 shadow-inner" aria-live="polite">
              {phase === 'idle' && (
                <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                    <Fingerprint className="size-8 text-zinc-500" />
                  </div>
                  <p className="font-display mt-4 text-xl tracking-wider text-zinc-300 uppercase">Aguardando leitura</p>
                  <p className="mt-1 text-sm text-zinc-500">Selecione um aluno e clique em “Simular biometria”.</p>
                </div>
              )}

              {phase === 'reading' && (
                <div className="flex h-full min-h-[250px] flex-col items-center justify-center text-center">
                  <div className="relative flex size-20 items-center justify-center">
                    <span className="animate-pulse-ring absolute inset-0 rounded-full border-2 border-amber-400/60" />
                    <Fingerprint className="size-12 animate-pulse text-amber-400" />
                  </div>
                  <p className="font-display mt-5 text-xl tracking-wider text-amber-400 uppercase">Lendo impressão digital...</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                    <Loader2 className="size-3.5 animate-spin" /> Comparando com a base de digitais
                  </p>
                </div>
              )}

              {current && (phase === 'identified' || phase === 'granted' || phase === 'denied' || phase === 'manual') && (
                <div className="animate-fade-in">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
                    <ScanFace className="size-4" /> Aluno identificado
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <Avatar name={current.name} src={current.photo} size="lg" ring />
                    <div className="min-w-0">
                      <p className="font-display truncate text-2xl font-semibold tracking-wide text-white uppercase">{current.name}</p>
                      <div className="mt-1 grid gap-x-4 text-sm text-zinc-400 sm:grid-cols-2">
                        <span>
                          Matrícula: <span className="text-zinc-200">{current.matricula}</span>
                        </span>
                        <span>
                          Plano: <span className="text-zinc-200">{current.origin === 'mansao' ? (plan?.name ?? '—') : studentOriginLabel[current.origin]}</span>
                        </span>
                        {current.origin === 'mansao' && (
                          <span>
                            Vencimento: <span className="text-zinc-200">{formatDate(current.dueDate)}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1.5">
                          Status: <StudentStatusBadge status={getDisplayStatus(current)} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {phase === 'identified' && (
                    <p className="mt-8 flex items-center justify-center gap-2 text-sm text-zinc-400">
                      <Loader2 className="size-4 animate-spin" /> Validando permissões de acesso...
                    </p>
                  )}

                  {phase === 'granted' && (
                    <div className="animate-scale-in mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
                      <p className="font-display flex items-center justify-center gap-3 text-3xl font-bold tracking-wider text-emerald-400 uppercase 2xl:text-5xl">
                        <CheckCircle2 className="size-9 2xl:size-12" /> Acesso liberado
                      </p>
                      <p className="mt-2 text-sm text-emerald-300/80">Catraca liberada · Bom treino!</p>
                    </div>
                  )}

                  {phase === 'denied' && (
                    <div className="animate-scale-in mt-6 rounded-xl border border-brand-500/50 bg-brand-500/10 p-5 text-center">
                      <p className="font-display flex items-center justify-center gap-3 text-3xl font-bold tracking-wider text-brand-500 uppercase 2xl:text-5xl">
                        <XCircle className="size-9 2xl:size-12" /> Acesso negado
                      </p>
                      <p className="mt-2 text-sm text-zinc-300">
                        Motivo: <span className="font-display font-semibold tracking-wider text-brand-300 uppercase">{decision?.reason}</span>
                      </p>
                      <Button className="mt-4" variant="outline" icon={<KeyRound className="size-4" />} onClick={() => setManualOpen(true)}>
                        Liberar manualmente
                      </Button>
                    </div>
                  )}

                  {phase === 'manual' && (
                    <div className="animate-scale-in mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-center">
                      <p className="font-display flex items-center justify-center gap-3 text-2xl font-bold tracking-wider text-amber-400 uppercase sm:text-3xl">
                        <ShieldCheck className="size-8" /> Acesso liberado pelo administrador
                      </p>
                      <p className="mt-2 text-sm text-zinc-400">Liberação registrada no histórico de acessos.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Painel de comando */}
        <div className="space-y-6">
          <Card className="animate-fade-up">
            <CardHeader title="Simulador" subtitle="Escolha quem está na catraca" icon={<Fingerprint className="size-4" />} />
            <div className="space-y-4 p-5">
              <StudentPicker value={selected} onChange={(id) => { setSelected(id); if (!busy) reset(); }} />
              <div className="flex flex-wrap gap-2">
                {demoStudents.map(({ s, tag }) => (
                  <button
                    key={s.id}
                    disabled={busy}
                    onClick={() => {
                      setSelected(s.id);
                      reset();
                    }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition disabled:opacity-50',
                      selected === s.id ? 'border-brand-500/50 bg-brand-500/10 text-white' : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white',
                    )}
                  >
                    <Avatar name={s.name} src={s.photo} size="xs" className="size-5 text-[8px]" />
                    {s.name.split(' ')[0]}
                    <span className="text-zinc-500">· {tag}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Button size="lg" onClick={simulate} loading={busy} icon={<Fingerprint className="size-5" />} disabled={!selected}>
                  Simular biometria
                </Button>
                <Button size="lg" variant="secondary" onClick={reset} disabled={busy} aria-label="Reiniciar">
                  <RotateCcw className="size-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-500">
                <Wifi className="size-4 shrink-0 text-emerald-400" />
                {biometricReader.deviceName} conectado à Catraca 01.
              </div>
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader title="Últimos acessos" subtitle="Histórico em tempo real" />
            <div className="mt-2 max-h-[380px] overflow-y-auto">
              <AccessTimeline logs={db.accessLogs.slice(0, 8)} newestId={newestId} />
            </div>
          </Card>
        </div>
      </div>

      <ReasonModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Liberar manualmente"
        description={current ? `${current.name} — ${decision?.reason}` : undefined}
        icon={<KeyRound className="size-5" />}
        confirmLabel="Liberar acesso"
        variant="success"
        suggestions={['Pagamento será feito hoje na recepção', 'Aluno apresentou comprovante', 'Cortesia da gerência', 'Falha no leitor']}
        onConfirm={manualRelease}
      />
    </>
  );
}
