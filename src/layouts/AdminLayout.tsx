import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Globe, Menu } from 'lucide-react';
import { Avatar, Tooltip } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useClock } from '@/hooks/misc';
import { cn } from '@/utils/misc';
import { Sidebar } from './Sidebar';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

const COLLAPSE_KEY = 'mansao-maromba:sidebar-collapsed';

export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const now = useClock(30_000);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignora */
    }
  }, [collapsed]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen bg-ink-900">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={cn('transition-[padding] duration-300', collapsed ? 'lg:pl-[76px]' : 'lg:pl-64')}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-white/5 bg-ink-900/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs text-zinc-500 capitalize xl:block">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
            <Tooltip label="Ver site" side="bottom">
              <Link
                to="/"
                className="hidden size-10 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-300 transition hover:text-white sm:flex"
              >
                <Globe className="size-[18px]" />
              </Link>
            </Tooltip>
            <NotificationBell />
            <div className="hidden items-center gap-3 border-l border-white/5 pl-3 md:flex">
              <Avatar name={user.name} src="https://randomuser.me/api/portraits/men/41.jpg" size="sm" ring />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{user.name}</p>
                <p className="text-[11px] text-zinc-500">{user.role}</p>
              </div>
            </div>
          </div>
        </header>
        <main key={location.pathname} className="animate-fade-in mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
