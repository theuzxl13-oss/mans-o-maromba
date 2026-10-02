import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronsLeft, LogOut, X } from 'lucide-react';
import { Logo, Tooltip } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/misc';
import { navigation } from './navigation';

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  // No mobile a sidebar abre sempre expandida.
  const mini = collapsed && !mobileOpen;

  return (
    <>
      <div
        className={cn('fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition lg:hidden', mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onCloseMobile}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/5 bg-ink-950 transition-all duration-300 lg:translate-x-0',
          mini ? 'w-[76px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className={cn('flex h-16 items-center border-b border-white/5', mini ? 'justify-center px-2' : 'justify-between px-5')}>
          <Logo collapsed={mini} />
          <button onClick={onCloseMobile} className="rounded-lg p-1.5 text-zinc-500 hover:text-white lg:hidden" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4">
          {navigation.map((group) => (
            <div key={group.title} className="mb-5">
              {!mini ? (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.22em] text-zinc-600 uppercase">{group.title}</p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const link = (
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition',
                          mini ? 'w-[52px] justify-center' : 'px-3',
                          isActive
                            ? 'bg-gradient-to-r from-brand-500/20 to-brand-500/[0.03] text-white'
                            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r bg-brand-500" />}
                          <item.icon className={cn('size-[18px] shrink-0', isActive ? 'text-brand-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                          {!mini && <span className="truncate">{item.label}</span>}
                        </>
                      )}
                    </NavLink>
                  );
                  return (
                    <li key={item.to}>
                      {mini ? (
                        <Tooltip label={item.label} side="right">
                          {link}
                        </Tooltip>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-white/5 p-3">
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-lg py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-brand-500/10 hover:text-brand-400',
              mini ? 'justify-center' : 'px-3',
            )}
          >
            <LogOut className="size-[18px]" />
            {!mini && 'Sair'}
          </button>
          <button
            onClick={onToggle}
            className={cn(
              'hidden w-full cursor-pointer items-center gap-3 rounded-lg py-2 text-xs text-zinc-500 transition hover:bg-white/[0.04] hover:text-white lg:flex',
              mini ? 'justify-center' : 'px-3',
            )}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            <ChevronsLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
            {!mini && 'Recolher menu'}
          </button>
        </div>
      </aside>
    </>
  );
}
