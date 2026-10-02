import { useState } from 'react';
import { Building2, Cable, Database, RotateCcw, Save, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Badge, Button, Card, CardHeader, ConfirmDialog, Field, Input, PageHeader } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import type { GymSettings } from '@/types';
import { cn } from '@/utils/misc';

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-zinc-500">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition', checked ? 'bg-brand-500' : 'bg-ink-600')}
      >
        <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition', checked && 'translate-x-5')} />
      </button>
    </label>
  );
}

const INTEGRATIONS = [
  { name: 'Catraca / Controle de acesso', desc: 'Driver TurnstileDriver', file: 'services/integrations' },
  { name: 'Leitor biométrico', desc: 'Interface BiometricReader', file: 'services/integrations' },
  { name: 'Wellhub', desc: 'PartnerCheckinProvider', file: 'services/integrations' },
  { name: 'TotalPass', desc: 'PartnerCheckinProvider', file: 'services/integrations' },
  { name: 'PIX / Gateway de pagamento', desc: 'Interface PaymentGateway', file: 'services/integrations' },
  { name: 'Banco de dados (Supabase/PostgreSQL)', desc: 'Interface DataRepository', file: 'services/repository' },
];

export default function Settings() {
  const { db, updateSettings, resetDemo } = useData();
  const toast = useToast();
  const [form, setForm] = useState<GymSettings>(db.settings);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = <K extends keyof GymSettings>(k: K, v: GymSettings[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader
        eyebrow="Sistema"
        title="Configurações"
        subtitle="Dados da academia, regras de acesso e integrações."
        actions={
          <Button
            icon={<Save className="size-4" />}
            onClick={() => {
              updateSettings(form);
              toast.success('Configurações salvas');
            }}
          >
            Salvar alterações
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="animate-fade-up">
          <CardHeader title="Dados da academia" icon={<Building2 className="size-4" />} />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <Input value={form.gymName} onChange={(e) => set('gymName', e.target.value)} />
            </Field>
            <Field label="CNPJ">
              <Input value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} />
            </Field>
            <Field label="Telefone">
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field label="E-mail" className="sm:col-span-2">
              <Input value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Endereço" className="sm:col-span-2">
              <Input value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="animate-fade-up">
          <CardHeader title="Regras de acesso" icon={<SlidersHorizontal className="size-4" />} />
          <div className="space-y-3 p-5">
            <Field label="Tolerância após vencimento (dias)" hint="Dias em que o aluno ainda pode acessar após o vencimento.">
              <Input type="number" min={0} max={15} value={form.graceDays} onChange={(e) => set('graceDays', Math.max(0, Number(e.target.value)))} />
            </Field>
            <Toggle checked={form.autoBlockOverdue} onChange={(v) => set('autoBlockOverdue', v)} label="Bloquear inadimplentes na catraca" desc="Nega o acesso automaticamente quando a mensalidade vence." />
            <Toggle checked={form.soundOnAccess} onChange={(v) => set('soundOnAccess', v)} label="Som na catraca" desc="Emite um bipe ao liberar ou negar acesso." />
          </div>
        </Card>

        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader title="Integrações" subtitle="Preparadas para substituição pelas integrações reais" icon={<Cable className="size-4" />} />
          <ul className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((i) => (
              <li key={i.name} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div>
                  <p className="text-sm font-semibold text-white">{i.name}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{i.desc}</p>
                  <p className="mt-1 font-mono text-[10px] text-zinc-600">src/{i.file}</p>
                </div>
                <Badge tone="amber">Simulado</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="animate-fade-up xl:col-span-2">
          <CardHeader title="Dados de demonstração" icon={<Database className="size-4" />} />
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm text-zinc-400">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              Os dados ficam salvos apenas neste navegador (localStorage). Restaure para voltar ao estado inicial antes de uma nova apresentação.
            </p>
            <Button variant="danger" icon={<RotateCcw className="size-4" />} onClick={() => setConfirmReset(true)}>
              Restaurar dados de demonstração
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restaurar demonstração"
        confirmLabel="Restaurar"
        message="Todos os cadastros, pagamentos e acessos simulados serão apagados e os dados fictícios iniciais serão recriados."
        onConfirm={() => {
          resetDemo();
          setForm((f) => ({ ...f }));
          toast.success('Dados restaurados', 'A demonstração voltou ao estado inicial.');
        }}
      />
    </>
  );
}
