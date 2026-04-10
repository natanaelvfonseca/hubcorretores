import {
    ChevronLeft,
    ChevronRight,
    LogOut,
    ShieldCheck,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getVisibleNavigation, isConstrutoraUser } from '../../lib/portalAccess';
import { BrandLogo } from '../branding/BrandLogo';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isMobile: boolean;
}

export function Sidebar({ collapsed, setCollapsed, isMobile }: SidebarProps) {
    const { user, logout } = useAuth();
    const isConstrutora = isConstrutoraUser(user);
    const navSections = getVisibleNavigation(user);
    const userInitials = user?.name
        ? user.name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'HC';

    return (
        <aside
            className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(3,18,29,0.98),rgba(6,38,57,0.98))] shadow-[0_24px_70px_rgba(4,19,31,0.26)] transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}
        >
            <div className="border-b border-white/10 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                    {!collapsed && (
                        <BrandLogo
                            className="text-white"
                            markWidth={28}
                            markHeight={36}
                            wordSize={28}
                        />
                    )}

                    {isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-white/[0.76] transition hover:bg-white/[0.12]"
                            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    )}
                </div>

                {!collapsed && !isConstrutora && (
                    <p className="mt-4 text-xs leading-6 text-white/55">
                        Ecossistema imobiliario regional com curadoria, networking e negocios organizados.
                    </p>
                )}
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 scrollbar-hide">
                {navSections.map((section) => (
                    <div key={section.title}>
                        {!collapsed && (
                            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                                {section.title}
                            </p>
                        )}

                        <div className="space-y-1.5">
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all ${isActive
                                                ? 'bg-white text-[#062133] shadow-[0_16px_32px_rgba(255,255,255,0.14)]'
                                                : 'text-white/[0.72] hover:bg-white/10 hover:text-white'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <span
                                                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${isActive ? 'bg-[#E8F3F4] text-primary' : 'bg-white/[0.08] text-white/[0.72] group-hover:bg-white/[0.12] group-hover:text-white'}`}
                                                >
                                                    <Icon size={18} />
                                                </span>

                                                {!collapsed && (
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-semibold">{item.navLabel}</p>
                                                        <p className={`truncate text-[11px] ${isActive ? 'text-[#406173]' : 'text-white/46'}`}>
                                                            {item.eyebrow}
                                                        </p>
                                                    </div>
                                                )}

                                                {collapsed && (
                                                    <div className="pointer-events-none absolute left-[4.6rem] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-[#062133] px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                                                        {item.navLabel}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {user?.role === 'admin' && !isConstrutora && (
                    <div className="pt-2">
                        {!collapsed && (
                            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                                Gestao
                            </p>
                        )}

                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all ${isActive
                                    ? 'bg-[#F4E7D8] text-[#7A491A]'
                                    : 'text-[#F6D7B5] hover:bg-[#D8893C]/12 hover:text-[#FFD7AE]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span
                                        className={`flex h-10 w-10 items-center justify-center rounded-2xl transition ${isActive ? 'bg-white/80 text-[#A66328]' : 'bg-[#D8893C]/[0.14] text-[#F6D7B5]'}`}
                                    >
                                        <ShieldCheck size={18} />
                                    </span>
                                    {!collapsed && (
                                        <div>
                                            <p className="font-semibold">Painel administrativo</p>
                                            <p className={`text-[11px] ${isActive ? 'text-[#A36A3A]' : 'text-[#F6D7B5]/70'}`}>
                                                Curadoria, parceiros e governanca
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    </div>
                )}
            </nav>

            <div className="border-t border-white/10 p-4">
                <div className={`rounded-[26px] border border-white/10 bg-white/[0.07] p-3 ${collapsed ? 'space-y-3' : ''}`}>
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5EEAD4] via-[#1AA0A4] to-[#0A4B66] text-sm font-bold text-white shadow-[0_16px_32px_rgba(15,118,110,0.3)]">
                            {userInitials}
                        </div>

                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{user?.name || 'Membro HUB'}</p>
                                <p className="truncate text-xs text-white/54">
                                    {user?.role === 'admin'
                                        ? 'Gestao da plataforma'
                                        : isConstrutora
                                            ? 'Painel da construtora'
                                            : 'Membro da comunidade'}
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
                        className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/[0.12] text-sm font-semibold text-white/[0.76] transition hover:bg-white/10 hover:text-white ${collapsed ? 'w-full' : 'mt-3 w-full'}`}
                    >
                        <LogOut size={16} />
                        {!collapsed && 'Encerrar sessao'}
                    </button>
                </div>
            </div>
        </aside>
    );
}
