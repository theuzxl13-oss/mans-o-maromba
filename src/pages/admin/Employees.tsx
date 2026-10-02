import { useMemo, useState } from 'react';
import { Pencil, Search, Trash2, UserCog, UserPlus } from 'lucide-react';
import { Avatar, Badge, Button, Card, ConfirmDialog, EmptyState, Field, FilterChips, Input, Modal, PageHeader, Select, Table, Td, Tooltip, type Tone } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import type { Employee, EmployeeRole } from '@/types';
import { maskPhone } from '@/utils/format';
import { normalize } from '@/utils/misc';

const ROLES: EmployeeRole[] = ['Administrador', 'Gerente', 'Recepcionista', 'Professor', 'Financeiro'];
const roleTone: Record<EmployeeRole, Tone> = { Administrador: 'red', Gerente: 'violet', Recepcionista: 'sky', Professor: 'green', Financeiro: 'amber' };

type Draft = Omit<Employee, 'id'> & { id?: string };
const empty: Draft = { name: '', role: 'Recepcionista', phone: '', email: '', active: true };

export default function Employees() {
  const { db, saveEmployee, deleteEmployee } = useData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [role, setRole] = useState<'todos' | EmployeeRole>('todos');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  const list = useMemo(
    () => db.employees.filter((e) => (role === 'todos' || e.role === role) && (!q || normalize(e.name).includes(normalize(q)))),
    [db.employees, role, q],
  );

  const save = () => {
    if (!draft) return;
    if (!draft.name.trim() || !/^\S+@\S+\.\S+$/.test(draft.email)) return toast.error('Informe nome e e-mail válidos');
    saveEmployee(draft);
    toast.success(draft.id ? 'Funcionário atualizado' : 'Funcionário cadastrado', draft.name);
    setDraft(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Equipe"
        title="Funcionários"
        subtitle={`${db.employees.filter((e) => e.active).length} colaboradores ativos`}
        actions={
          <Button icon={<UserPlus className="size-4" />} onClick={() => setDraft(empty)}>
            Novo funcionário
          </Button>
        }
      />
      <Card className="animate-fade-up">
        <div className="flex flex-col gap-3 border-b border-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="lg:w-72">
            <Input icon={<Search className="size-4" />} placeholder="Pesquisar funcionário..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <FilterChips value={role} onChange={setRole} options={[{ value: 'todos' as const, label: 'Todos' }, ...ROLES.map((r) => ({ value: r, label: r }))]} />
        </div>
        {list.length === 0 ? (
          <EmptyState icon={<UserCog className="size-6" />} title="Nenhum funcionário encontrado" />
        ) : (
          <Table head={['Nome', 'Cargo', 'Telefone', 'E-mail', 'Status', 'Ações']}>
            {list.map((e) => (
              <tr key={e.id} className="hover:bg-white/[0.02]">
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} src={e.photo} size="sm" />
                    <span className="font-medium text-white">{e.name}</span>
                  </div>
                </Td>
                <Td>
                  <Badge tone={roleTone[e.role]}>{e.role}</Badge>
                </Td>
                <Td className="text-zinc-300">{e.phone}</Td>
                <Td className="text-zinc-400">{e.email}</Td>
                <Td>
                  {e.active ? (
                    <Badge tone="green" dot>
                      Ativo
                    </Badge>
                  ) : (
                    <Badge tone="zinc" dot>
                      Inativo
                    </Badge>
                  )}
                </Td>
                <Td>
                  <div className="flex gap-1">
                    <Tooltip label="Editar">
                      <Button size="icon" variant="ghost" onClick={() => setDraft(e)} aria-label="Editar">
                        <Pencil className="size-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip label="Excluir">
                      <Button size="icon" variant="ghost" className="hover:text-brand-400" onClick={() => setToDelete(e)} aria-label="Excluir">
                        <Trash2 className="size-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Editar funcionário' : 'Novo funcionário'}
        icon={<UserCog className="size-5" />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar</Button>
          </>
        }
      >
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" className="sm:col-span-2">
              <Input autoFocus value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Field>
            <Field label="Cargo">
              <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as EmployeeRole })}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Telefone">
              <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: maskPhone(e.target.value) })} />
            </Field>
            <Field label="E-mail" className="sm:col-span-2">
              <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" className="accent-brand-500" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
              Ativo
            </label>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir funcionário"
        confirmLabel="Excluir"
        message={
          <>
            Deseja excluir <strong className="text-white">{toDelete?.name}</strong>? O acesso ao sistema será revogado.
          </>
        }
        onConfirm={() => {
          if (!toDelete) return;
          deleteEmployee(toDelete.id);
          toast.success('Funcionário excluído', toDelete.name);
        }}
      />
    </>
  );
}
