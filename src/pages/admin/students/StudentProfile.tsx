import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  Clock,
  Fingerprint,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  ShieldAlert,
  Ticket,
  Unlock,
  Wallet,
} from 'lucide-react';
import {
  AccessOriginBadge,
  AccessResultBadge,
  Avatar,
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Modal,
  PaymentStatusBadge,
  Select,
  StatCard,
  StudentOriginBadge,
  StudentStatusBadge,
  Table,
  Td,
} from '@/components/ui';
import { EnrollBiometryModal } from '@/components/admin/EnrollBiometryModal';
import { PaymentModal } from '@/components/admin/PaymentModal';
import { ReasonModal } from '@/components/admin/ReasonModal';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { getDisplayStatus, getPaymentStatus } from '@/services/rules';
import { addMonths, diffDays, formatDate, formatDateTime, formatTime, isSameMonth, relativeTime, today } from '@/utils/date';
import { formatCurrency, paymentMethodLabel, studentOriginLabel } from '@/utils/format';

export default function StudentProfile() {
  const { id = '' } = useParams();
  const { db, getStudent, getPlan, setBlocked, renewPlan } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const s = getStudent(id);
  const [bioOpen, setBioOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewPlanId, setRenewPlanId] = useState('');

  const logs = useMemo(() => db.accessLogs.filter((l) => l.studentId === id), [db.accessLogs, id]);
  const payments = useMemo(
    () => db.payments.filter((p) => p.studentId === id).sort((a, b) => b.dueDate.localeCompare(a.dueDate)),
    [db.payments, id],
  );

  if (!s) {
    return (
      <EmptyState
        title="Aluno não encontrado"
        description="O cadastro pode ter sido excluído."
        action={<Button onClick={() => navigate('/admin/alunos')}>Voltar para alunos</Button>}
      />
    );
  }

  const status = getDisplayStatus(s);
  const plan = getPlan(s.planId);
  const checkinsMonth = logs.filter((l) => l.result === 'liberado' && isSameMonth(l.timestamp)).length;
  const lastAccess = s.lastAccess ?? logs.find((l) => l.result === 'liberado')?.timestamp;
  const daysToDue = diffDays(today(), s.dueDate);

  const info: [typeof Phone, string, string][] = [
    [Phone, 'Telefone', s.phone],
    [Mail, 'E-mail', s.email || '—'],
    [CalendarDays, 'Data da matrícula', formatDate(s.enrollmentDate)],
    [CalendarClock, 'Vencimento', s.origin === 'mansao' ? formatDate(s.dueDate) : 'Via parceiro'],
    [Ticket, 'Plano', s.origin === 'mansao' ? (plan?.name ?? '—') : studentOriginLabel[s.origin]],
    [MapPin, 'Endereço', s.address ? `${s.address}, ${s.number} — ${s.district}, ${s.city}/${s.state}` : '—'],
  ];

  return (
    <>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-500 transition hover:text-white">
        <ArrowLeft className="size-4" /> Voltar
      </button>

      <Card className="animate-fade-up relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-brand-600/30 via-brand-500/10 to-transparent" />
        <div className="grid-bg absolute inset-x-0 top-0 h-28 opacity-60" />
        <div className="relative flex flex-col gap-6 p-6 pt-14 lg:flex-row lg:items-end">
          <Avatar name={s.name} src={s.photo} size="xl" ring />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase sm:text-3xl">{s.name}</h1>
              <StudentStatusBadge status={status} />
              <StudentOriginBadge origin={s.origin} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-zinc-400">
              <span className="font-mono text-zinc-300">{s.matricula}</span>
              <span>CPF {s.cpf}</span>
              <span className="inline-flex items-center gap-1.5">
                <Fingerprint className={s.biometry ? 'size-4 text-sky-400' : 'size-4 text-zinc-600'} />
                Biometria: {s.biometry ? <span className="font-semibold text-sky-400">CADASTRADA</span> : <span className="text-zinc-500">NÃO CADASTRADA</span>}
              </span>
            </div>
            {s.blockReason && status === 'bloqueado' && (
              <p className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm text-brand-300">
                <ShieldAlert className="size-4" /> Motivo do bloqueio: {s.blockReason}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={<Pencil className="size-3.5" />} onClick={() => navigate(`/admin/alunos/${s.id}/editar`)}>
              Editar
            </Button>
            {s.origin === 'mansao' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="size-3.5" />}
                  onClick={() => {
                    setRenewPlanId(s.planId ?? db.plans[0]?.id ?? '');
                    setRenewOpen(true);
                  }}
                >
                  Renovar
                </Button>
                <Button variant="success" size="sm" icon={<Wallet className="size-3.5" />} onClick={() => setPayOpen(true)}>
                  Registrar pagamento
                </Button>
              </>
            )}
            <Button size="sm" icon={<Fingerprint className="size-3.5" />} onClick={() => setBioOpen(true)}>
              {s.biometry ? 'Recadastrar digital' : 'Cadastrar digital'}
            </Button>
            {s.status === 'bloqueado' ? (
              <Button
                variant="outline"
                size="sm"
                icon={<Unlock className="size-3.5" />}
                onClick={() => {
                  setBlocked(s.id, false);
                  toast.success('Aluno desbloqueado', s.name);
                }}
              >
                Desbloquear
              </Button>
            ) : (
              <Button variant="danger" size="sm" icon={<Lock className="size-3.5" />} onClick={() => setBlockOpen(true)}>
                Bloquear aluno
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Plano atual" value={s.origin === 'mansao' ? (plan?.name ?? '—') : studentOriginLabel[s.origin]} icon={<Ticket className="size-[18px]" />} tone="red" hint={plan && s.origin === 'mansao' ? formatCurrency(plan.price) : 'Parceiro'} />
        <StatCard
          label="Próximo vencimento"
          value={s.origin === 'mansao' ? formatDate(s.dueDate) : '—'}
          icon={<CalendarClock className="size-[18px]" />}
          tone={status === 'vencido' ? 'amber' : 'green'}
          hint={s.origin !== 'mansao' ? 'Sem mensalidade direta' : daysToDue < 0 ? `Vencido há ${-daysToDue} dias` : daysToDue === 0 ? 'Vence hoje' : `Em ${daysToDue} dias`}
          delay={50}
        />
        <StatCard label="Check-ins no mês" value={checkinsMonth} icon={<CalendarDays className="size-[18px]" />} tone="sky" hint="acessos liberados" delay={100} />
        <StatCard label="Último acesso" value={lastAccess ? formatTime(lastAccess) : '—'} icon={<Clock className="size-[18px]" />} tone="violet" hint={lastAccess ? relativeTime(lastAccess) : 'Nenhum acesso'} delay={150} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="animate-fade-up">
          <CardHeader title="Informações" />
          <ul className="space-y-4 p-5">
            {info.map(([Icon, label, value]) => (
              <li key={label} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-400">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] tracking-wider text-zinc-500 uppercase">{label}</p>
                  <p className="text-sm break-words text-white">{value}</p>
                </div>
              </li>
            ))}
            <li className="flex gap-3 border-t border-white/5 pt-4">
              <div>
                <p className="text-[11px] tracking-wider text-zinc-500 uppercase">Contato de emergência</p>
                <p className="text-sm text-white">{s.emergencyContact || '—'}</p>
              </div>
            </li>
            {s.notes && (
              <li className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm text-zinc-300">
                <p className="mb-1 text-[11px] tracking-wider text-zinc-500 uppercase">Observações</p>
                {s.notes}
              </li>
            )}
          </ul>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card className="animate-fade-up">
            <CardHeader title="Histórico de acessos" subtitle={`${logs.length} registros`} />
            <div className="mt-3">
              {logs.length === 0 ? (
                <EmptyState title="Nenhum acesso registrado" description="Simule um acesso no Controle de Acesso." />
              ) : (
                <Table head={['Data / horário', 'Catraca', 'Origem', 'Status']}>
                  {logs.slice(0, 8).map((l) => (
                    <tr key={l.id} className="hover:bg-white/[0.02]">
                      <Td className="text-zinc-300 tabular-nums">{formatDateTime(l.timestamp)}</Td>
                      <Td className="text-zinc-400">{l.gate}</Td>
                      <Td>
                        <AccessOriginBadge origin={l.origin} />
                      </Td>
                      <Td>
                        <AccessResultBadge result={l.result} />
                      </Td>
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </Card>

          {s.origin === 'mansao' && (
            <Card className="animate-fade-up">
              <CardHeader title="Mensalidades" />
              <div className="mt-3">
                {payments.length === 0 ? (
                  <EmptyState title="Sem mensalidades" />
                ) : (
                  <Table head={['Vencimento', 'Valor', 'Pago em', 'Forma', 'Status']}>
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02]">
                        <Td className="text-zinc-300">{formatDate(p.dueDate)}</Td>
                        <Td className="font-semibold text-white">{formatCurrency(p.amount)}</Td>
                        <Td className="text-zinc-400">{p.paidAt ? formatDate(p.paidAt) : '—'}</Td>
                        <Td className="text-zinc-400">{p.method ? paymentMethodLabel[p.method] : '—'}</Td>
                        <Td>
                          <PaymentStatusBadge status={getPaymentStatus(p)} />
                        </Td>
                      </tr>
                    ))}
                  </Table>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <EnrollBiometryModal open={bioOpen} student={s} onClose={() => setBioOpen(false)} />
      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} studentId={s.id} />
      <ReasonModal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Bloquear aluno"
        description={`${s.name} não conseguirá acessar a academia até ser desbloqueado.`}
        icon={<Lock className="size-5" />}
        confirmLabel="Bloquear aluno"
        suggestions={['Inadimplência', 'Comportamento inadequado', 'Solicitação do aluno', 'Atestado pendente']}
        onConfirm={(reason) => {
          setBlocked(s.id, true, reason);
          toast.warning('Aluno bloqueado', `${s.name} — ${reason}`);
        }}
      />
      <Modal
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renovar plano"
        icon={<RefreshCw className="size-5" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setRenewOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                renewPlan(s.id, renewPlanId);
                setRenewOpen(false);
                toast.success('Plano renovado', 'Uma nova mensalidade foi gerada como pendente.');
              }}
            >
              Confirmar renovação
            </Button>
          </>
        }
      >
        <Field label="Plano">
          <Select value={renewPlanId} onChange={(e) => setRenewPlanId(e.target.value)}>
            {db.plans
              .filter((p) => p.active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatCurrency(p.price)}
                </option>
              ))}
          </Select>
        </Field>
        {(() => {
          const p = db.plans.find((x) => x.id === renewPlanId);
          if (!p) return null;
          const base = s.dueDate >= today() ? s.dueDate : today();
          return (
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-300">
              Novo vencimento: <Badge tone="green">{formatDate(addMonths(base, p.durationMonths))}</Badge>
              <span className="text-zinc-500">· valor {formatCurrency(p.price)}</span>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
