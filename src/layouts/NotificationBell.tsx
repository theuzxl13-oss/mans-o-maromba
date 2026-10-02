import { useRef, useState } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCheck, CheckCircle2, Info, ShieldX } from 'lucide-react';
import { useData } from '@/hooks/useData';
import { useClickOutside } from '@/hooks/misc';
import type { NotificationKind } from '@/types';
import { relativeTime } from '@/utils/date';
import { cn } from '@/utils/misc';

const kindIcon: Record<NotificationKind, [typeof Info, string]> = {
  info: [Info, 'text-sky-400 bg-sky-500/10'],
  success: [CheckCircle2, 'text-emerald-400 bg-emerald-500/10'],
  warning: [AlertTriangle, 'text-amber-400 bg-amber-500/10'],
  danger: [ShieldX, 'text-brand-400 bg-brand-500/10'],
};

export function NotificationBell() {
  const { db, markNotificationsRead, clearNotifications } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);
  const unread = db.notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 transition hover:text-white"
        aria-label="Notificações"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white ring-2 ring-ink-900">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="animate-scale-in absolute right-0 z-50 mt-2 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div>
              <p className="font-semibold text-white">Notificações</p>
              <p className="text-xs text-zinc-500">{unread} não lida{unread === 1 ? '' : 's'}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={markNotificationsRead}
                className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <CheckCheck className="size-3.5" /> Marcar lidas
              </button>
              <button
                onClick={clearNotifications}
                className="cursor-pointer rounded-md px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                Limpar
              </button>
            </div>
          </div>
          {db.notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-sm text-zinc-500">
              <BellOff className="size-6" /> Nenhuma notificação.
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-white/[0.04] overflow-y-auto">
              {db.notifications.map((n) => {
                const [Icon, cls] = kindIcon[n.kind];
                return (
                  <li key={n.id} className={cn('flex gap-3 px-4 py-3 transition hover:bg-white/[0.02]', !n.read && 'bg-brand-500/[0.04]')}>
                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', cls)}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200">{n.message}</p>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {n.title} · {relativeTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-500" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
