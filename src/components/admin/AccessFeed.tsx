import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AccessOriginBadge, AccessResultBadge, Avatar, EmptyState, Table, Td } from '@/components/ui';
import { useData } from '@/hooks/useData';
import type { AccessLog } from '@/types';
import { formatTime, isSameDay, formatDate } from '@/utils/date';
import { cn } from '@/utils/misc';

/** Tabela "Últimos acessos". */
export function AccessTable({ logs, highlightId, showDate }: { logs: AccessLog[]; highlightId?: string; showDate?: boolean }) {
  const { db } = useData();
  if (logs.length === 0) return <EmptyState title="Nenhum acesso registrado" description="Os acessos aparecerão aqui em tempo real." />;
  return (
    <Table head={['Aluno', showDate ? 'Data / horário' : 'Horário', 'Acesso', 'Origem', 'Status']}>
      {logs.map((l) => {
        const s = l.studentId ? db.students.find((x) => x.id === l.studentId) : undefined;
        return (
          <tr key={l.id} className={cn('transition hover:bg-white/[0.02]', l.id === highlightId && 'animate-slide-in')}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={l.studentName} src={s?.photo} size="xs" />
                {s ? (
                  <Link to={`/admin/alunos/${s.id}`} className="font-medium text-white hover:text-brand-400">
                    {l.studentName}
                  </Link>
                ) : (
                  <span className="font-medium text-white">{l.studentName}</span>
                )}
              </div>
            </Td>
            <Td className="text-zinc-300 tabular-nums">
              {showDate && !isSameDay(l.timestamp) ? `${formatDate(l.timestamp)} ` : ''}
              {formatTime(l.timestamp)}
            </Td>
            <Td className="text-zinc-400">{l.gate}</Td>
            <Td>
              <AccessOriginBadge origin={l.origin} />
            </Td>
            <Td>
              <div className="flex items-center gap-2">
                <AccessResultBadge result={l.result} />
                {l.reason && l.result === 'bloqueado' && <span className="text-xs text-zinc-500">{l.reason}</span>}
                {l.manualReason && <span className="text-xs text-amber-400/80">Manual: {l.manualReason}</span>}
              </div>
            </Td>
          </tr>
        );
      })}
    </Table>
  );
}

/** Lista estilo "timeline" para a Central de Acessos. */
export function AccessTimeline({ logs, newestId }: { logs: AccessLog[]; newestId?: string }) {
  const { db } = useData();
  if (logs.length === 0) return <EmptyState title="Sem acessos" />;
  return (
    <ul className="divide-y divide-white/[0.04]">
      {logs.map((l) => {
        const s = l.studentId ? db.students.find((x) => x.id === l.studentId) : undefined;
        const ok = l.result === 'liberado';
        return (
          <li
            key={l.id}
            className={cn('flex items-center gap-4 px-5 py-3.5 transition hover:bg-white/[0.02]', l.id === newestId && 'animate-slide-in')}
          >
            <span className="font-display w-14 text-lg font-semibold text-zinc-300 tabular-nums">{formatTime(l.timestamp)}</span>
            <span className={cn('h-10 w-1 rounded-full', ok ? 'bg-emerald-500' : 'bg-brand-500')} />
            <Avatar name={l.studentName} src={s?.photo} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{l.studentName}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <AccessOriginBadge origin={l.origin} />
                <span>{l.gate}</span>
                {l.reason && !ok && <span className="text-brand-400/80">· {l.reason}</span>}
                {l.manualReason && <span className="text-amber-400/80">· {l.manualReason}</span>}
              </div>
            </div>
            <span
              className={cn(
                'font-display hidden items-center gap-1.5 text-sm font-semibold tracking-wider uppercase sm:inline-flex',
                ok ? 'text-emerald-400' : 'text-brand-400',
              )}
            >
              {ok ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
              {ok ? 'Liberado' : 'Bloqueado'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
