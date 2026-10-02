import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserSearch } from 'lucide-react';
import { Avatar, StudentStatusBadge } from '@/components/ui';
import { searchStudents } from '@/components/admin/StudentPicker';
import { useData } from '@/hooks/useData';
import { useClickOutside } from '@/hooks/misc';
import { getDisplayStatus } from '@/services/rules';
import { cn } from '@/utils/misc';

/** Busca global: aluno, matrícula ou CPF. Atalho: Ctrl+K ou "/". */
export function GlobalSearch() {
  const { db } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  const results = useMemo(() => (q.trim() ? searchStudents(db.students, q).slice(0, 7) : []), [db.students, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest('input, textarea, select');
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (id: string) => {
    navigate(`/admin/alunos/${id}`);
    setQ('');
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-500" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1));
          if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
          if (e.key === 'Enter' && results[active]) go(results[active].id);
          if (e.key === 'Escape') setOpen(false);
        }}
        placeholder="Buscar aluno, matrícula ou CPF..."
        className="h-10 w-full rounded-lg border border-white/5 bg-white/[0.03] pr-14 pl-9 text-sm text-white placeholder:text-zinc-500 transition outline-none focus:border-brand-500/50 focus:bg-ink-800"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-500 sm:block">
        Ctrl K
      </kbd>
      {open && q.trim() && (
        <div className="animate-scale-in absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/60">
          <p className="border-b border-white/5 px-4 py-2 text-[10px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
            {results.length} resultado{results.length === 1 ? '' : 's'}
          </p>
          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-zinc-500">
              <UserSearch className="size-6" />
              Nenhum aluno encontrado para “{q}”.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((s, i) => (
                <li key={s.id}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(s.id)}
                    className={cn('flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left', i === active && 'bg-white/5')}
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
