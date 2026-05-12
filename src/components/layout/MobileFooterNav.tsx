import { Menu, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getVisibleNavigation } from '../../lib/portalAccess';

const primaryMobilePaths = ['/dashboard', '/oportunidades', '/meus-negocios', '/beneficios'];

export function MobileFooterNav() {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const navItems = useMemo(
        () => getVisibleNavigation(user).flatMap((section) => section.items),
        [user],
    );
    const primaryItems = navItems.filter((item) => primaryMobilePaths.includes(item.path));
    const menuItems = navItems.filter((item) => !primaryMobilePaths.includes(item.path));

    return (
        <>
            {menuOpen && (
                <div className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)}>
                    <div
                        className="absolute bottom-[88px] left-3 right-3 overflow-hidden rounded-[28px] border border-border/70 bg-surface shadow-[0_24px_70px_rgba(8,23,38,0.24)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Menu</p>
                                <p className="mt-1 text-lg font-display text-text-primary">Mais áreas do Hub</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 text-text-secondary"
                                aria-label="Fechar menu"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="grid max-h-[52vh] gap-2 overflow-y-auto p-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-text-secondary hover:bg-background hover:text-text-primary'
                                            }`
                                        }
                                    >
                                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary">
                                            <Icon size={18} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate">{item.navLabel}</span>
                                            <span className="block truncate text-xs font-medium opacity-70">{item.eyebrow}</span>
                                        </span>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 z-[70] border-t border-border/70 bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 shadow-[0_-18px_42px_rgba(8,23,38,0.12)] backdrop-blur-xl lg:hidden">
                <div className="grid grid-cols-5 items-center gap-1">
                    {primaryItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex h-14 items-center justify-center rounded-2xl transition ${isActive
                                        ? 'bg-primary text-white shadow-[0_12px_28px_rgba(15,123,140,0.22)]'
                                        : 'text-text-secondary hover:bg-surface hover:text-primary'
                                    }`
                                }
                                aria-label={item.navLabel}
                                title={item.navLabel}
                            >
                                <Icon size={21} />
                            </NavLink>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => setMenuOpen((current) => !current)}
                        className={`flex h-14 items-center justify-center rounded-2xl transition ${menuOpen
                            ? 'bg-primary text-white shadow-[0_12px_28px_rgba(15,123,140,0.22)]'
                            : 'text-text-secondary hover:bg-surface hover:text-primary'
                        }`}
                        aria-label="Abrir menu"
                        title="Menu"
                    >
                        <Menu size={23} />
                    </button>
                </div>
            </nav>
        </>
    );
}
