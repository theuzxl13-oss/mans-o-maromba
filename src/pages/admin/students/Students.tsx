import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Fingerprint, MoreVertical, Pencil, Search, Trash2, UserPlus, Users, Wallet } from 'lucide-react';
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  FilterChips,
  Input,
  PageHeader,
  StudentOriginBadge,
  StudentStatusBadge,
  Table,
  TableSkeleton,
  Td,
  Tooltip,
} from '@/components/ui';
import { searchStudents } from '@/components/admin/StudentPicker';
import { PaymentModal } from '@/components/admin/PaymentModal';
import { EnrollBiometryModal } from '@/components/admin/EnrollBiometryModal';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { useClickOutside, useFakeLoading } from '@/hooks/misc';
import { getDisplayStatus } from '@/services/rules';
import type { Student } from '@/types';
import { addDays, formatDate, today } from '@/utils/date';
import { cn } from '@/utils/misc';

type Filter = 'todos' | 'ativos' | 'inativos' | 'bloqueados' | 'vencidos' | 'wellhub' | 'totalpass';

export default function Students() {
  const { db, getPlan, deleteStudent } = useData();
  const toast = useToast();
  const navigate = useNavigate();
  const loading = useFakeLoading(500);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  const [toDelete, setToDelete] = useState<Student | null>(null);
  const [payFor, setPayFor] = useState<string | null>(null);
  const [bioFor, setBioFor] = useState<Student | null>(null);

  const counts = useMemo(() => {
    const st = db.students.map((s) => getDisplayStatus(s));
    return {
      todos: db.students.length,
      ativos: st.filter((s) => s === 'ativo').length,
      inativos: st.filter((s) => s === 'inativo').length,
      bloqueados: st.filter((s) => s === 'bloqueado').length,
      vencidos: st.filter((s) => s === 'vencido').length,
      wellhub: db.students.filter((s) => s.origin === 'wellhub').length,
      totalpass: db.students.filter((s) => s.origin === 'totalpass').length,
    };
  }, [db.students]);

  const list = useMemo(() => {
    const byFilter = db.students.filter((s) => {
      const st = getDisplayStatus(s);
      switch (filter) {
        case 'ativos': return st === 'ativo';
        case 'inativos': return st === 'inativo';
        case 'bloqueados': return st === 'bloqueado';
        case 'vencidos': return st === 'vencido';
        case 'wellhub': return s.origin === 'wellhub';
        case 'totalpass': return s.origin === 'totalpass';
        default: return true;
      }
    });
    return searchStudents(byFilter, q);
  }, [db.students, filter, q]);

  return (
    <>
      <PageHeader
        eyebrow="Cadastro"
        title="Alunos"
        subtitle={`${db.students.length} alunos cadastrados nesta demonstração`}
        actions={
          <Button icon={<UserPlus className="size-4" />} onClick={() => navigate('/admin/alunos/novo')}>
            + Novo aluno
          </Button>
        }
      />

      <Card className="animate-fade-up">
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-xs">
            <Input icon={<Search className="size-4" />} placeholder="Pesquisar aluno..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <FilterChips<Filter>
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'todos', label: 'Todos', count: counts.todos },
              { value: 'ativos', label: 'Ativos', count: counts.ativos },
              { value: 'vencidos', label: 'Vencidos', count: counts.vencidos },
              { value: 'inativos', label: 'Inativos', count: counts.inativos },
              { value: 'bloqueados', label: 'Bloqueados', count: counts.bloqueados },
              { value: 'wellhub', label: 'Wellhub', count: counts.wellhub },
              { value: 'totalpass', label: 'TotalPass', count: counts.totalpass },
            ]}
          />
        </div>

        {loading ? (
          <TableSkeleton rows={8} cols={7} />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title="Nenhum aluno encontrado"
            description="Ajuste a pesquisa ou os filtros, ou cadastre um novo aluno."
            action={
              <Button size="sm" icon={<UserPlus className="size-4" />} onClick={() => navigate('/admin/alunos/novo')}>
                Novo aluno
              </Button>
            }
          />
        ) : (
          <Table head={['Foto', 'Matrícula', 'Nome', 'Telefone', 'Plano', 'Vencimento', 'Status', 'Ações']}>
            {list.map((s) => {
              const status = getDisplayStatus(s);
              const plan = getPlan(s.planId);
              const dueSoon = s.origin === 'mansao' && s.dueDate >= today() && s.dueDate <= addDays(today(), 5);
              return (
                <tr key={s.id} className="group cursor-pointer transition hover:bg-white/[0.02]" onClick={() => navigate(`/admin/alunos/${s.id}`)}>
                  <Td>
                    <Avatar name={s.name} src={s.photo} size="sm" />
                  </Td>
                  <Td className="font-mono text-xs text-zinc-400">{s.matricula}</Td>
                  <Td>
                    <p className="font-semibold text-white group-hover:text-brand-400">{s.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {s.origin !== 'mansao' && <StudentOriginBadge origin={s.origin} />}
                      {s.biometry && (
                        <Tooltip label="Biometria cadastrada">
                          <Fingerprint className="size-3.5 text-sky-400" />
                        </Tooltip>
                      )}
                    </div>
                  </Td>
                  <Td className="text-zinc-300">{s.phone}</Td>
                  <Td className="text-zinc-300">{s.origin === 'mansao' ? (plan?.name ?? '—') : <StudentOriginBadge origin={s.origin} />}</Td>
                  <Td className={cn('tabular-nums', status === 'vencido' ? 'text-amber-400' : dueSoon ? 'text-amber-300' : 'text-zinc-300')}>
                    {s.origin === 'mansao' ? formatDate(s.dueDate) : '—'}
                  </Td>
                  <Td>
                    <StudentStatusBadge status={status} />
                  </Td>
                  <Td>
                    <RowActions
                      student={s}
                      onView={() => navigate(`/admin/alunos/${s.id}`)}
                      onEdit={() => navigate(`/admin/alunos/${s.id}/editar`)}
                      onPay={() => setPayFor(s.id)}
                      onBio={() => setBioFor(s)}
                      onDelete={() => setToDelete(s)}
                    />
                  </Td>
                </tr>
              );
            })}
          </Table>
        )}
        {!loading && list.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-xs text-zinc-500">
            <span>
              Exibindo {list.length} de {db.students.length} alunos
            </span>
            <Link to="/admin/relatorios" className="font-semibold text-brand-400 hover:text-brand-300">
              Exportar relatório
            </Link>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir aluno"
        confirmLabel="Excluir"
        message={
          <>
            Deseja realmente excluir <strong className="text-white">{toDelete?.name}</strong> ({toDelete?.matricula})? Esta ação removerá também o histórico de
            mensalidades e não poderá ser desfeita.
          </>
        }
        onConfirm={() => {
          if (!toDelete) return;
          deleteStudent(toDelete.id);
          toast.success('Aluno excluído', toDelete.name);
        }}
      />
      <PaymentModal open={!!payFor} onClose={() => setPayFor(null)} studentId={payFor ?? undefined} />
      <EnrollBiometryModal open={!!bioFor} student={bioFor} onClose={() => setBioFor(null)} />
    </>
  );
}

function RowActions({
  student,
  onView,
  onEdit,
  onPay,
  onBio,
  onDelete,
}: {
  student: Student;
  onView: () => void;
  onEdit: () => void;
  onPay: () => void;
  onBio: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const item = 'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-zinc-300 hover:bg-white/5 hover:text-white';
  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-white"
        aria-label="Ações"
      >
        <MoreVertical className="size-4" />
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 z-20 mt-1 w-52 rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl shadow-black/60">
          <button className={item} onClick={run(onView)}>
            <Eye className="size-4" /> Ver perfil
          </button>
          <button className={item} onClick={run(onEdit)}>
            <Pencil className="size-4" /> Editar
          </button>
          {student.origin === 'mansao' && (
            <button className={item} onClick={run(onPay)}>
              <Wallet className="size-4" /> Registrar pagamento
            </button>
          )}
          <button className={item} onClick={run(onBio)}>
            <Fingerprint className="size-4" /> {student.biometry ? 'Recadastrar digital' : 'Cadastrar digital'}
          </button>
          <div className="my-1 h-px bg-white/5" />
          <button className={cn(item, 'text-brand-400 hover:bg-brand-500/10 hover:text-brand-300')} onClick={run(onDelete)}>
            <Trash2 className="size-4" /> Excluir
          </button>
        </div>
      )}
    </div>
  );
}
