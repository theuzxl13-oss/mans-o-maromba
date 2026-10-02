import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, CheckCircle2, Fingerprint, IdCard, Save, UserPlus, X } from 'lucide-react';
import { Avatar, Button, Card, CardHeader, EmptyState, Field, Input, Modal, PageHeader, Select, Textarea } from '@/components/ui';
import { EnrollBiometryModal } from '@/components/admin/EnrollBiometryModal';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import type { PaymentMethod, Student, StudentInput, StudentOrigin } from '@/types';
import { addMonths, today } from '@/utils/date';
import { formatCurrency, maskCEP, maskCPF, maskPhone, onlyDigits, paymentMethodLabel } from '@/utils/format';

const UF = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

type FormState = Omit<StudentInput, 'planId'> & { planId: string };

const empty = (): FormState => ({
  name: '',
  cpf: '',
  birthDate: '',
  phone: '',
  whatsapp: '',
  email: '',
  cep: '',
  address: '',
  number: '',
  district: '',
  city: 'São Paulo',
  state: 'SP',
  emergencyContact: '',
  planId: 'plan_mensal',
  enrollmentDate: today(),
  dueDate: addMonths(today(), 1),
  paymentMethod: 'pix',
  notes: '',
  photo: undefined,
  origin: 'mansao',
});

/** Reduz a foto para não estourar o limite do localStorage. */
function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function StudentForm() {
  const { id } = useParams();
  const editing = !!id;
  const { db, getStudent, addStudent, updateStudent } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const existing = id ? getStudent(id) : undefined;
  const [form, setForm] = useState<FormState>(() => (existing ? { ...existing, planId: existing.planId ?? '' } : empty()));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Student | null>(null);
  const [bioOpen, setBioOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activePlans = useMemo(() => db.plans.filter((p) => p.active || p.id === form.planId), [db.plans, form.planId]);
  const plan = db.plans.find((p) => p.id === form.planId);

  // Recalcula o vencimento ao trocar plano ou data de matrícula (somente no cadastro).
  useEffect(() => {
    if (editing || !plan || !form.enrollmentDate) return;
    setForm((f) => ({ ...f, dueDate: addMonths(f.enrollmentDate, plan.durationMonths) }));
  }, [plan, form.enrollmentDate, editing]);

  if (editing && !existing) {
    return <EmptyState title="Aluno não encontrado" action={<Button onClick={() => navigate('/admin/alunos')}>Voltar</Button>} />;
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (form.name.trim().split(' ').length < 2) e.name = 'Informe nome e sobrenome';
    if (onlyDigits(form.cpf).length !== 11) e.cpf = 'CPF deve ter 11 dígitos';
    else if (db.students.some((s) => s.id !== id && onlyDigits(s.cpf) === onlyDigits(form.cpf))) e.cpf = 'CPF já cadastrado';
    if (onlyDigits(form.phone).length < 10) e.phone = 'Telefone inválido';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'E-mail inválido';
    if (form.origin === 'mansao' && !form.planId) e.planId = 'Selecione um plano';
    if (!form.enrollmentDate) e.enrollmentDate = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Verifique os campos destacados');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    const data = { ...form, planId: form.planId || null, whatsapp: form.whatsapp || form.phone };
    if (editing && id) {
      updateStudent(id, data);
      toast.success('Cadastro atualizado', form.name);
      navigate(`/admin/alunos/${id}`);
    } else {
      const s = addStudent(data);
      setCreated(s);
      toast.success('Aluno cadastrado com sucesso', `Matrícula ${s.matricula} gerada.`);
    }
    setSaving(false);
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      set('photo', await resizeImage(file));
    } catch {
      toast.error('Não foi possível carregar a imagem');
    }
  };

  const createdLive = created ? getStudent(created.id) : undefined;

  return (
    <>
      <PageHeader
        eyebrow={editing ? 'Editar cadastro' : 'Cadastro'}
        title={editing ? existing!.name : 'Novo aluno'}
        subtitle={editing ? `Matrícula ${existing!.matricula}` : 'A matrícula será gerada automaticamente ao salvar.'}
        actions={
          <Button variant="ghost" icon={<ArrowLeft className="size-4" />} onClick={() => navigate(-1)}>
            Voltar
          </Button>
        }
      />

      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card className="animate-fade-up">
            <CardHeader title="Dados pessoais" subtitle="Informações de identificação do aluno" />
            <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="group relative cursor-pointer rounded-full"
                  aria-label="Selecionar foto"
                >
                  <Avatar name={form.name || '?'} src={form.photo} size="xl" />
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <Camera className="size-6 text-white" />
                  </span>
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
                <div className="flex gap-2 text-xs">
                  <button type="button" className="cursor-pointer text-brand-400 hover:text-brand-300" onClick={() => fileRef.current?.click()}>
                    {form.photo ? 'Trocar foto' : 'Adicionar foto'}
                  </button>
                  {form.photo && (
                    <button type="button" className="cursor-pointer text-zinc-500 hover:text-white" onClick={() => set('photo', undefined)}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nome completo *" error={errors.name} className="sm:col-span-2">
                  <Input value={form.name} invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex.: João da Silva" autoFocus={!editing} />
                </Field>
                <Field label="CPF *" error={errors.cpf}>
                  <Input value={form.cpf} invalid={!!errors.cpf} onChange={(e) => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" inputMode="numeric" />
                </Field>
                <Field label="Data de nascimento">
                  <Input type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader title="Contato" />
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Telefone *" error={errors.phone}>
                <Input value={form.phone} invalid={!!errors.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
              </Field>
              <Field label="WhatsApp" hint="Deixe em branco para usar o telefone">
                <Input value={form.whatsapp} onChange={(e) => set('whatsapp', maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="tel" />
              </Field>
              <Field label="E-mail" error={errors.email}>
                <Input type="email" value={form.email} invalid={!!errors.email} onChange={(e) => set('email', e.target.value)} placeholder="aluno@email.com" />
              </Field>
              <Field label="Contato de emergência" className="sm:col-span-2 lg:col-span-3">
                <Input value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} placeholder="Nome — telefone" />
              </Field>
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader title="Endereço" />
            <div className="grid gap-4 p-5 sm:grid-cols-6">
              <Field label="CEP" className="sm:col-span-2">
                <Input value={form.cep} onChange={(e) => set('cep', maskCEP(e.target.value))} placeholder="00000-000" inputMode="numeric" />
              </Field>
              <Field label="Endereço" className="sm:col-span-3">
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rua, avenida..." />
              </Field>
              <Field label="Número" className="sm:col-span-1">
                <Input value={form.number} onChange={(e) => set('number', e.target.value)} />
              </Field>
              <Field label="Bairro" className="sm:col-span-2">
                <Input value={form.district} onChange={(e) => set('district', e.target.value)} />
              </Field>
              <Field label="Cidade" className="sm:col-span-3">
                <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Estado" className="sm:col-span-1">
                <Select value={form.state} onChange={(e) => set('state', e.target.value)}>
                  {UF.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="animate-fade-up">
            <CardHeader title="Plano e matrícula" />
            <div className="space-y-4 p-5">
              <Field label="Origem do aluno">
                <Select value={form.origin} onChange={(e) => set('origin', e.target.value as StudentOrigin)}>
                  <option value="mansao">Mansão Maromba (mensalidade)</option>
                  <option value="wellhub">Wellhub</option>
                  <option value="totalpass">TotalPass</option>
                </Select>
              </Field>
              <Field label="Plano *" error={errors.planId}>
                <Select value={form.planId} onChange={(e) => set('planId', e.target.value)} disabled={form.origin !== 'mansao'}>
                  <option value="">Selecione...</option>
                  {activePlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de matrícula" error={errors.enrollmentDate}>
                  <Input type="date" value={form.enrollmentDate} onChange={(e) => set('enrollmentDate', e.target.value)} />
                </Field>
                <Field label="Vencimento">
                  <Input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} disabled={form.origin !== 'mansao'} />
                </Field>
              </div>
              <Field label="Forma de pagamento">
                <Select value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value as PaymentMethod)} disabled={form.origin !== 'mansao'}>
                  {(Object.keys(paymentMethodLabel) as PaymentMethod[]).map((m) => (
                    <option key={m} value={m}>
                      {paymentMethodLabel[m]}
                    </option>
                  ))}
                </Select>
              </Field>
              {plan && form.origin === 'mansao' && (
                <div className="rounded-xl border border-brand-500/20 bg-gradient-to-br from-brand-500/10 to-transparent p-4">
                  <p className="text-[11px] font-semibold tracking-widest text-brand-400 uppercase">Resumo</p>
                  <p className="font-display mt-1 text-2xl font-semibold text-white">{formatCurrency(plan.price)}</p>
                  <p className="text-xs text-zinc-400">
                    Plano {plan.name} · {plan.durationMonths} {plan.durationMonths === 1 ? 'mês' : 'meses'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="animate-fade-up">
            <CardHeader title="Observações" />
            <div className="p-5">
              <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Restrições médicas, objetivos, observações gerais..." />
            </div>
          </Card>

          <div className="flex gap-2 xl:sticky xl:top-20">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={saving} icon={editing ? <Save className="size-4" /> : <UserPlus className="size-4" />}>
              {editing ? 'Salvar alterações' : 'Cadastrar aluno'}
            </Button>
          </div>
        </div>
      </form>

      <Modal open={!!created && !bioOpen} onClose={() => navigate('/admin/alunos')} size="sm">
        {createdLive && (
          <div className="text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="size-9" />
            </div>
            <p className="font-display mt-4 text-xl tracking-wider text-white uppercase">Aluno cadastrado!</p>
            <p className="mt-1 text-sm text-zinc-400">{createdLive.name}</p>
            <div className="mt-5 rounded-xl border border-white/10 bg-ink-900 p-4">
              <p className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500 uppercase">
                <IdCard className="size-4" /> Matrícula gerada
              </p>
              <p className="font-display mt-1 text-3xl font-bold tracking-widest text-brand-500">{createdLive.matricula}</p>
            </div>
            <div className="mt-6 grid gap-2">
              {!createdLive.biometry ? (
                <Button icon={<Fingerprint className="size-4" />} onClick={() => setBioOpen(true)}>
                  Cadastrar digital agora
                </Button>
              ) : (
                <p className="text-sm font-semibold text-emerald-400">✓ Biometria cadastrada</p>
              )}
              <Button variant="secondary" onClick={() => navigate(`/admin/alunos/${createdLive.id}`)}>
                Ver perfil do aluno
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setCreated(null);
                  setForm(empty());
                }}
              >
                Cadastrar outro aluno
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <EnrollBiometryModal open={bioOpen} student={createdLive ?? null} onClose={() => setBioOpen(false)} />
    </>
  );
}
