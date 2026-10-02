import { useEffect, useMemo, useState } from 'react';
import { Banknote, CheckCircle2, CreditCard, QrCode, Wallet } from 'lucide-react';
import { Avatar, Button, Field, Input, Modal, Select } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { paymentGateway } from '@/services/integrations';
import type { PaymentMethod } from '@/types';
import { formatCurrency, paymentMethodLabel } from '@/utils/format';
import { formatDate, today } from '@/utils/date';
import { cn } from '@/utils/misc';

const methods: { value: PaymentMethod; icon: typeof QrCode }[] = [
  { value: 'pix', icon: QrCode },
  { value: 'dinheiro', icon: Banknote },
  { value: 'credito', icon: CreditCard },
  { value: 'debito', icon: Wallet },
];

/** Registrar pagamento — SIMULAÇÃO (nenhuma cobrança real é feita). */
export function PaymentModal({
  open,
  onClose,
  studentId,
  paymentId,
}: {
  open: boolean;
  onClose: () => void;
  studentId?: string;
  paymentId?: string;
}) {
  const { db, registerPayment, getPlan } = useData();
  const toast = useToast();
  const [sid, setSid] = useState(studentId ?? '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const mansaoStudents = useMemo(
    () => db.students.filter((s) => s.origin === 'mansao').sort((a, b) => a.name.localeCompare(b.name)),
    [db.students],
  );
  const student = db.students.find((s) => s.id === sid);
  const payment = paymentId ? db.payments.find((p) => p.id === paymentId) : undefined;

  useEffect(() => {
    if (!open) return;
    setSid(studentId ?? '');
    setDate(today());
    setDone(false);
    setLoading(false);
  }, [open, studentId]);

  useEffect(() => {
    if (!open) return;
    const s = db.students.find((x) => x.id === sid);
    const open_ = db.payments.find((p) => p.studentId === sid && !p.paidAt);
    const value = payment?.amount ?? open_?.amount ?? getPlan(s?.planId ?? null)?.price ?? 0;
    setAmount(value ? value.toFixed(2) : '');
    if (s) setMethod(s.paymentMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid, open]);

  const confirm = async () => {
    if (!student) return toast.error('Selecione um aluno');
    const value = Number(amount.replace(',', '.'));
    if (!value || value <= 0) return toast.error('Informe um valor válido');
    setLoading(true);
    if (method === 'pix') {
      const charge = await paymentGateway.createPixCharge(value, `Mensalidade ${student.matricula}`);
      await paymentGateway.confirm(charge.txid);
    } else {
      await new Promise((r) => setTimeout(r, 900));
    }
    registerPayment({ studentId: student.id, amount: value, date, method, paymentId });
    setLoading(false);
    setDone(true);
    toast.success('Pagamento registrado com sucesso', `${student.name} — ${formatCurrency(value)}`);
  };

  const updated = student ? db.students.find((s) => s.id === student.id) : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      locked={loading}
      title="Registrar pagamento"
      description="Simulação — nenhuma cobrança real é processada."
      icon={<Wallet className="size-5" />}
      footer={
        done ? (
          <Button onClick={onClose}>Fechar</Button>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirm} loading={loading} icon={<CheckCircle2 className="size-4" />}>
              Confirmar pagamento
            </Button>
          </>
        )
      }
    >
      {done && updated ? (
        <div className="animate-scale-in py-4 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="size-9" />
          </div>
          <p className="font-display mt-4 text-xl tracking-wider text-emerald-400 uppercase">Pagamento registrado com sucesso</p>
          <p className="mt-2 text-sm text-zinc-400">
            {updated.name} agora está <span className="font-semibold text-emerald-400">ATIVO</span> — próximo vencimento em{' '}
            <span className="font-semibold text-white">{formatDate(updated.dueDate)}</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Aluno">
            {studentId && student ? (
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-ink-800 p-2.5">
                <Avatar name={student.name} src={student.photo} size="xs" />
                <span className="text-sm font-medium text-white">{student.name}</span>
                <span className="ml-auto text-xs text-zinc-500">{student.matricula}</span>
              </div>
            ) : (
              <Select value={sid} onChange={(e) => setSid(e.target.value)}>
                <option value="">Selecione o aluno...</option>
                {mansaoStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.matricula}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Valor (R$)">
              <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
            </Field>
            <Field label="Data">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Forma de pagamento">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {methods.map(({ value, icon: Icon }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setMethod(value)}
                  className={cn(
                    'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-[11px] font-semibold tracking-wide uppercase transition',
                    method === value
                      ? 'border-brand-500/60 bg-brand-500/10 text-white'
                      : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white',
                  )}
                >
                  <Icon className={cn('size-5', method === value && 'text-brand-400')} />
                  {paymentMethodLabel[value]}
                </button>
              ))}
            </div>
          </Field>
          {method === 'pix' && (
            <p className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-500">
              Na versão final, um QR Code PIX será gerado pelo gateway de pagamento. Nesta demonstração a confirmação é automática.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
