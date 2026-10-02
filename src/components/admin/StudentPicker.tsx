import { useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Avatar, StudentStatusBadge } from '@/components/ui';
import { useData } from '@/hooks/useData';
import { useClickOutside } from '@/hooks/misc';
import { getDisplayStatus } from '@/services/rules';
import type { Student } from '@/types';
import { cn, normalize } from '@/utils/misc';
import { onlyDigits } from '@/utils/format';

export function searchStudents(students: Student[], q: string) {
  const n = normalize(q.trim());
  if (!n) return students;
  const digits = onlyDigits(q);
  return students.filter(
    (s) =>
      normalize(s.name).includes(n) ||
      s.matricula.toLowerCase().includes(n) ||
      (digits.length >= 3 && (onlyDigits(s.cpf).includes(digits) || onlyDigits(s.matricula).includes(digits))),
  );
}

/** Campo de busca/seleção de aluno com lista suspensa. */
export function StudentPicker({
  value,
  onChange,
  filter,
  placeholder = 'Pesquisar/selecionar aluno...',
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  filter?: (s: Student) => boolean;
  placeholder?: string;
}) {
  const { db } = useData();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const pool = useMemo(() => (filter ? db.students.filter(filter) : db.students), [db.students, filter]);
  const results = useMemo(() => searchStudents(pool, q).slice(0, 8), [pool, q]);
  const selected = db.students.find((s) => s.id === value);

  return (
    <div ref={ref} className="relative">
      {selected && !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-12 w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-ink-800 px-3 text-left transition hover:border-white/20"
        >
          <Avatar name={selected.name} src={selected.photo} size="xs" />
          <span className="truncate text-sm font-medium text-white">{selected.name}</span>
          <span className="text-xs text-zinc-500">{selected.matricula}</span>
          <span className="ml-auto flex items-center gap-2">
            <StudentStatusBadge status={getDisplayStatus(selected)} />
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="rounded p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
              aria-label="Limpar seleção"
            >
              <X className="size-4" />
            </span>
          </span>
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            className="input h-12 pl-9"
            placeholder={placeholder}
            value={q}
            autoFocus={open && !!selected}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
          />
        </div>
      )}
      {open && (
        <div className="animate-scale-in absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-white/10 bg-ink-800 p-1.5 shadow-2xl shadow-black/60">
          {results.length === 0 ? (
            <p className="p-4 text-center text-sm text-zinc-500">Nenhum aluno encontrado.</p>
          ) : (
            results.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => {
                  onChange(s.id);
                  setQ('');
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/5',
                  s.id === value && 'bg-brand-500/10',
                )}
              >
                <Avatar name={s.name} src={s.photo} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{s.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    {s.matricula} · CPF {s.cpf}
                  </p>
                </div>
                <StudentStatusBadge status={getDisplayStatus(s)} />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
