import { useMemo, useState } from 'react';
import { Fingerprint, Search, ShieldCheck, Usb, UserX } from 'lucide-react';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, FilterChips, Input, PageHeader, StatCard, StudentStatusBadge, Table, Td } from '@/components/ui';
import { FingerprintScanner } from '@/components/admin/Fingerprint';
import { EnrollBiometryModal } from '@/components/admin/EnrollBiometryModal';
import { StudentPicker, searchStudents } from '@/components/admin/StudentPicker';
import { useData } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { biometricReader } from '@/services/integrations';
import { getDisplayStatus } from '@/services/rules';
import type { Student } from '@/types';
import { formatDate } from '@/utils/date';

type Filter = 'todos' | 'cadastrada' | 'pendente';

export default function Biometrics() {
  const { db } = useData();
  const toast = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [modalFor, setModalFor] = useState<Student | null>(null);
  const [filter, setFilter] = useState<Filter>('todos');
  const [q, setQ] = useState('');

  const withBio = db.students.filter((s) => s.biometry).length;
  const list = useMemo(
    () =>
      searchStudents(
        db.students.filter((s) => filter === 'todos' || (filter === 'cadastrada' ? s.biometry : !s.biometry)),
        q,
      ),
    [db.students, filter, q],
  );
  const selectedStudent = db.students.find((s) => s.id === selected);

  return (
    <>
      <PageHeader
        eyebrow="Simulação de hardware"
        title="Biometria"
        subtitle="Cadastro de impressões digitais para acesso à catraca."
        actions={<Badge tone="amber">Leitor simulado</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Digitais cadastradas" value={withBio} icon={<Fingerprint className="size-[18px]" />} tone="sky" hint={`de ${db.students.length} alunos`} />
        <StatCard label="Sem biometria" value={db.students.length - withBio} icon={<UserX className="size-[18px]" />} tone="amber" hint="aguardando cadastro" delay={50} />
        <StatCard label="Leitor" value="Online" icon={<Usb className="size-[18px]" />} tone="green" hint={biometricReader.deviceName} delay={100} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card className="animate-fade-up h-fit">
          <CardHeader title="Cadastrar digital" subtitle="Selecione o aluno" icon={<Fingerprint className="size-4" />} />
          <div className="space-y-5 p-5">
            <StudentPicker value={selected} onChange={setSelected} />
            <div className="rounded-2xl border border-white/5 bg-ink-900 py-8">
              <FingerprintScanner state={selectedStudent?.biometry ? 'success' : 'idle'} />
              <p className="mt-4 text-center text-sm text-zinc-400">
                {!selectedStudent
                  ? 'Nenhum aluno selecionado'
                  : selectedStudent.biometry
                    ? 'Biometria: CADASTRADA'
                    : 'Biometria: NÃO CADASTRADA'}
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              icon={<Fingerprint className="size-5" />}
              onClick={() => {
                if (!selectedStudent) return toast.warning('Selecione um aluno primeiro');
                setModalFor(selectedStudent);
              }}
            >
              {selectedStudent?.biometry ? 'Recadastrar digital' : 'Cadastrar digital'}
            </Button>
            <p className="flex items-start gap-2 text-xs text-zinc-500">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              Na versão final, apenas o template criptografado da digital é armazenado — nunca a imagem da impressão.
            </p>
          </div>
        </Card>

        <Card className="animate-fade-up">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:w-72">
              <Input icon={<Search className="size-4" />} placeholder="Pesquisar aluno..." value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <FilterChips<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'cadastrada', label: 'Cadastradas' },
                { value: 'pendente', label: 'Pendentes' },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <EmptyState title="Nenhum aluno encontrado" />
          ) : (
            <Table head={['Aluno', 'Matrícula', 'Status', 'Biometria', 'Cadastrada em', '']}>
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-white/[0.02]">
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} src={s.photo} size="xs" />
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-zinc-400">{s.matricula}</Td>
                  <Td>
                    <StudentStatusBadge status={getDisplayStatus(s)} />
                  </Td>
                  <Td>{s.biometry ? <Badge tone="sky">Cadastrada</Badge> : <Badge tone="zinc">Pendente</Badge>}</Td>
                  <Td className="text-zinc-400">{s.biometry ? formatDate(s.biometryRegisteredAt) : '—'}</Td>
                  <Td>
                    <Button size="sm" variant={s.biometry ? 'ghost' : 'secondary'} icon={<Fingerprint className="size-3.5" />} onClick={() => setModalFor(s)}>
                      {s.biometry ? 'Recadastrar' : 'Cadastrar'}
                    </Button>
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <EnrollBiometryModal open={!!modalFor} student={modalFor} onClose={() => setModalFor(null)} />
    </>
  );
}
