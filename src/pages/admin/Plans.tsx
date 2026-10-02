import { useState } from 'react';
import { Check, Pencil, Plus, Power, Star, Ticket, Trash2 } from 'lucide-react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, Modal, PageHeader, Textarea } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import type { Plan } from '@/types';
import { formatCurrency } from '@/utils/format';
import { cn } from '@/utils/misc';

type Draft = { id?: string; name: string; price: string; durationMonths: string; benefits: string; highlight: boolean; active: boolean };
const emptyDraft: Draft = { name: '', price: '', durationMonths: '1', benefits: '', highlight: false, active: true };

export default function Plans() {
  const { db, savePlan, togglePlan, deletePlan } = useData();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Plan | null>(null);

  const studentsIn = (id: string) => db.students.filter((s) => s.planId === id && s.origin === 'mansao').length;

  const open = (p?: Plan) =>
    setDraft(
      p
        ? { id: p.id, name: p.name, price: p.price.toFixed(2), durationMonths: String(p.durationMonths), benefits: p.benefits.join('\n'), highlight: !!p.highlight, active: p.active }
        : emptyDraft,
    );

  const save = () => {
    if (!draft) return;
    const price = Number(draft.price.replace(',', '.'));
    const months = Number(draft.durationMonths);
    if (!draft.name.trim() || !price || !months) return toast.error('Preencha nome, preço e duração');
    savePlan({
      id: draft.id,
      name: draft.name.trim(),
      price,
      durationMonths: months,
      benefits: draft.benefits.split('\n').map((b) => b.trim()).filter(Boolean),
      highlight: draft.highlight,
      active: draft.active,
    });
    toast.success(draft.id ? 'Plano atualizado' : 'Plano criado', draft.name);
    setDraft(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        title="Planos"
        subtitle="Gerencie os planos oferecidos pela academia."
        actions={
          <Button icon={<Plus className="size-4" />} onClick={() => open()}>
            Criar plano
          </Button>
        }
      />

      {db.plans.length === 0 ? (
        <Card>
          <EmptyState icon={<Ticket className="size-6" />} title="Nenhum plano cadastrado" action={<Button onClick={() => open()}>Criar plano</Button>} />
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {db.plans.map((p, i) => (
            <Card
              key={p.id}
              className={cn(
                'animate-fade-up relative flex flex-col p-6 transition hover:-translate-y-0.5',
                p.highlight && p.active && 'border-brand-500/40 bg-gradient-to-b from-brand-500/10 to-ink-850',
                !p.active && 'opacity-60',
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-xl font-semibold tracking-wider text-white uppercase">{p.name}</p>
                  <p className="text-xs text-zinc-500">
                    {p.durationMonths} {p.durationMonths === 1 ? 'mês' : 'meses'} · {studentsIn(p.id)} alunos
                  </p>
                </div>
                {p.active ? (
                  p.highlight ? (
                    <Badge tone="red">
                      <Star className="size-3" /> Destaque
                    </Badge>
                  ) : (
                    <Badge tone="green" dot>
                      Ativo
                    </Badge>
                  )
                ) : (
                  <Badge tone="zinc">Desativado</Badge>
                )}
              </div>
              <p className="font-display mt-5 text-3xl font-bold text-white">{formatCurrency(p.price)}</p>
              <p className="text-xs text-zinc-500">{formatCurrency(p.price / p.durationMonths)} / mês</p>
              <ul className="mt-5 flex-1 space-y-2">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand-400" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <Button size="sm" variant="secondary" icon={<Pencil className="size-3.5" />} onClick={() => open(p)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant={p.active ? 'ghost' : 'success'}
                  icon={<Power className="size-3.5" />}
                  onClick={() => {
                    togglePlan(p.id);
                    toast.info(p.active ? 'Plano desativado' : 'Plano reativado', p.name);
                  }}
                >
                  {p.active ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="danger" icon={<Trash2 className="size-3.5" />} onClick={() => setToDelete(p)} aria-label="Excluir plano">
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Editar plano' : 'Criar plano'}
        icon={<Ticket className="size-5" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={save} icon={<Check className="size-4" />}>
              Salvar plano
            </Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <Field label="Nome do plano">
              <Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Ex.: Bimestral" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Preço (R$)">
                <Input inputMode="decimal" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} placeholder="0,00" />
              </Field>
              <Field label="Duração (meses)">
                <Input type="number" min={1} value={draft.durationMonths} onChange={(e) => setDraft({ ...draft, durationMonths: e.target.value })} />
              </Field>
            </div>
            <Field label="Benefícios" hint="Um benefício por linha">
              <Textarea value={draft.benefits} onChange={(e) => setDraft({ ...draft, benefits: e.target.value })} placeholder={'Musculação livre\nAvaliação física'} />
            </Field>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-zinc-300">
                <input type="checkbox" className="accent-brand-500" checked={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })} />
                Destacar plano
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-zinc-300">
                <input type="checkbox" className="accent-brand-500" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
                Ativo
              </label>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir plano"
        confirmLabel="Excluir"
        message={
          toDelete && studentsIn(toDelete.id) > 0 ? (
            <>
              O plano <strong className="text-white">{toDelete.name}</strong> possui {studentsIn(toDelete.id)} alunos vinculados. Recomendamos desativá-lo em vez de
              excluir. Deseja excluir mesmo assim?
            </>
          ) : (
            <>
              Deseja excluir o plano <strong className="text-white">{toDelete?.name}</strong>?
            </>
          )
        }
        onConfirm={() => {
          if (!toDelete) return;
          deletePlan(toDelete.id);
          toast.success('Plano excluído', toDelete.name);
        }}
      />
    </>
  );
}
