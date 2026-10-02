import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AtSign, CalendarClock, CheckCircle2, Fingerprint, LayoutDashboard, Search, Send, UserRound } from 'lucide-react';
import { Avatar, Button, Field, Input, Logo, Modal, Select, StudentStatusBadge, Textarea } from '@/components/ui';
import { Navbar, NAV_LINKS, scrollToId } from '@/components/site/Navbar';
import { About, ContactInfo, Hero, Partners, PlansSection, Schedule, Structure } from '@/components/site/Sections';
import { searchStudents } from '@/components/admin/StudentPicker';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { getDisplayStatus } from '@/services/rules';
import type { Plan, Student } from '@/types';
import { formatDate } from '@/utils/date';
import { formatCurrency, maskPhone, studentOriginLabel } from '@/utils/format';
import { sleep } from '@/utils/misc';

export default function Home() {
  const { db } = useData();
  const toast = useToast();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [studentArea, setStudentArea] = useState(false);
  const activePlans = db.plans.filter((p) => p.active);

  return (
    <div className="bg-ink-950">
      <Navbar onStudentArea={() => setStudentArea(true)} />
      <Hero />
      <About />
      <Structure />
      <PlansSection plans={activePlans} onChoose={setPlan} />
      <Partners />
      <Schedule />
      <Contact onSent={(name) => toast.success('Mensagem enviada!', `Obrigado, ${name}. Entraremos em contato em breve.`)} />
      <Footer onStudentArea={() => setStudentArea(true)} />
      <PlanInterestModal plan={plan} plans={activePlans} onClose={() => setPlan(null)} />
      <StudentAreaModal open={studentArea} onClose={() => setStudentArea(false)} />
    </div>
  );
}

function Contact({ onSent }: { onSent: (name: string) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await sleep(900);
    setLoading(false);
    onSent(form.name.split(' ')[0] || 'atleta');
    setForm({ name: '', phone: '', message: '' });
  };
  return (
    <section id="contato" className="bg-ink-950 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.3em] text-brand-500 uppercase">
            <span className="h-px w-8 bg-brand-500" /> Contato
          </p>
          <h2 className="font-display text-4xl leading-[1.05] font-bold tracking-wide text-white uppercase sm:text-5xl">
            Venha <span className="text-brand-500">treinar</span>
          </h2>
          <p className="mt-4 mb-10 max-w-md text-zinc-400">Agende uma aula experimental gratuita ou tire suas dúvidas com a nossa equipe.</p>
          <ContactInfo />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-ink-850 p-6 sm:p-8">
          <p className="font-display text-xl font-semibold tracking-wider text-white uppercase">Aula experimental grátis</p>
          <Field label="Nome">
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" />
          </Field>
          <Field label="WhatsApp">
            <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" inputMode="tel" />
          </Field>
          <Field label="Mensagem">
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Qual o seu objetivo?" />
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={loading} icon={<Send className="size-4" />}>
            Quero agendar
          </Button>
        </form>
      </div>
    </section>
  );
}

function Footer({ onStudentArea }: { onStudentArea: () => void }) {
  return (
    <footer className="border-t border-white/5 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo subtitle={false} />
          <p className="mt-4 max-w-sm text-sm text-zinc-500">Onde a disciplina constrói resultados. Estrutura completa para quem leva evolução a sério.</p>
          <div className="mt-5 flex gap-2">
            {[AtSign, UserRound].map((Icon, i) => (
              <span key={i} className="flex size-10 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition hover:border-brand-500 hover:text-white">
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold tracking-[0.25em] text-white uppercase">Navegação</p>
          <ul className="grid grid-cols-2 gap-2 text-sm text-zinc-500 md:grid-cols-1">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <button onClick={() => scrollToId(l.id)} className="cursor-pointer transition hover:text-white">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-4 text-xs font-bold tracking-[0.25em] text-white uppercase">Acesso</p>
          <div className="flex flex-col items-start gap-3">
            <button onClick={onStudentArea} className="cursor-pointer text-sm text-zinc-500 transition hover:text-white">
              Área do aluno
            </button>
            <Link to="/login">
              <Button variant="outline" size="sm" icon={<LayoutDashboard className="size-4" />}>
                Acessar sistema
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-5 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} Mansão Maromba · Protótipo demonstrativo com dados fictícios.
      </div>
    </footer>
  );
}

function PlanInterestModal({ plan, plans, onClose }: { plan: Plan | null; plans: Plan[]; onClose: () => void }) {
  const toast = useToast();
  const { notify } = useData();
  const [form, setForm] = useState({ name: '', phone: '', planId: '' });
  const [loading, setLoading] = useState(false);
  const selected = plans.find((p) => p.id === (form.planId || plan?.id));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await sleep(900);
    setLoading(false);
    notify('Site', `Novo interesse no plano ${selected?.name}: ${form.name}.`, 'info');
    toast.success('Recebemos seu interesse!', `Nossa equipe vai chamar você no WhatsApp para finalizar o plano ${selected?.name}.`);
    setForm({ name: '', phone: '', planId: '' });
    onClose();
  };

  return (
    <Modal open={!!plan} onClose={onClose} title="Quero este plano" description="Preencha seus dados e finalizamos sua matrícula." icon={<CheckCircle2 className="size-5" />}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Plano">
          <Select value={form.planId || plan?.id} onChange={(e) => setForm({ ...form, planId: e.target.value })}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.price)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Nome completo">
          <Input required autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="WhatsApp">
          <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} placeholder="(00) 00000-0000" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Enviar interesse
        </Button>
      </form>
    </Modal>
  );
}

/** Área do aluno simplificada: consulta situação por matrícula ou CPF. */
function StudentAreaModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, getPlan } = useData();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Student | null | undefined>(undefined);

  const search = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await sleep(700);
    setResult(q.trim().length >= 3 ? (searchStudents(db.students, q)[0] ?? null) : null);
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setResult(undefined);
        setQ('');
      }}
      title="Área do aluno"
      description="Consulte sua matrícula, plano e vencimento."
      icon={<UserRound className="size-5" />}
    >
      <form onSubmit={search} className="flex gap-2">
        <div className="flex-1">
          <Input icon={<Search className="size-4" />} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Matrícula (MM-000142) ou CPF" autoFocus />
        </div>
        <Button type="submit" loading={loading}>
          Consultar
        </Button>
      </form>
      {result === null && <p className="mt-4 rounded-lg bg-brand-500/10 p-3 text-sm text-brand-300">Nenhuma matrícula encontrada.</p>}
      {result && (
        <div className="animate-scale-in mt-5 rounded-2xl border border-white/10 bg-ink-900 p-5">
          <div className="flex items-center gap-4">
            <Avatar name={result.name} src={result.photo} size="lg" />
            <div>
              <p className="font-display text-xl font-semibold tracking-wide text-white uppercase">{result.name}</p>
              <p className="text-sm text-zinc-500">{result.matricula}</p>
              <div className="mt-1">
                <StudentStatusBadge status={getDisplayStatus(result)} />
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[10px] tracking-widest text-zinc-500 uppercase">Plano</p>
              <p className="font-semibold text-white">{result.origin === 'mansao' ? getPlan(result.planId)?.name : studentOriginLabel[result.origin]}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="flex items-center gap-1 text-[10px] tracking-widest text-zinc-500 uppercase">
                <CalendarClock className="size-3" /> Vencimento
              </p>
              <p className="font-semibold text-white">{result.origin === 'mansao' ? formatDate(result.dueDate) : '—'}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2 rounded-xl bg-white/[0.03] p-3">
              <Fingerprint className={result.biometry ? 'size-4 text-sky-400' : 'size-4 text-zinc-600'} />
              Biometria {result.biometry ? 'cadastrada' : 'pendente — procure a recepção'}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
