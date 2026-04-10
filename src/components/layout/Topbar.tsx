import { BellRing, Building2, MoonStar, SunMedium, UserCircle2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { useAuth } from '../../context/AuthContext';
import { getHubModuleByPath } from '../../data/hubPlatform';
import { getConstrutoraDashboardSnapshot } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';

export function Topbar() {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isConstrutora = isConstrutoraUser(user);
    const currentModule = getHubModuleByPath(location.pathname);
    const construtoraSnapshot = isConstrutora ? getConstrutoraDashboardSnapshot() : null;
    const formattedDate = useMemo(
        () =>
            new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: 'long',
                weekday: 'long',
            }).format(new Date()),
        [],
    );

    const headerEyebrow = isConstrutora
        ? 'Visao executiva da construtora'
        : 'Ecossistema oficial do litoral catarinense';
    const headerTitle = isConstrutora
        ? 'Painel Construtora'
        : currentModule?.navLabel || 'HUB Corretores';
    const headerSummary = isConstrutora
        ? `Dados filtrados por ${construtoraSnapshot?.activeEmpreendimento.nome || 'empreendimento'} com foco em demanda, leads qualificados e vendas.`
        : currentModule?.summary || 'Plataforma proprietaria para networking, negocios, vantagens e governanca da comunidade.';

    return (
        <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/75">
                        {headerEyebrow}
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                        <h1 className="truncate text-2xl font-display text-text-primary">
                            {headerTitle}
                        </h1>
                        <span className="hidden rounded-full border border-border/80 bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-secondary md:inline-flex">
                            {formattedDate}
                        </span>
                        {isConstrutora && construtoraSnapshot && (
                            <span className="hidden rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary xl:inline-flex">
                                {construtoraSnapshot.activeEmpreendimento.nome}
                            </span>
                        )}
                    </div>
                    <p className="mt-2 max-w-2xl truncate text-sm text-text-secondary">
                        {headerSummary}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {isConstrutora ? (
                        <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-surface px-4 py-2 text-sm text-text-secondary xl:flex">
                            <Building2 size={16} className="text-primary" />
                            <span className="font-semibold text-text-primary">Escopo restrito</span>
                            {construtoraSnapshot?.activeEmpreendimento.id}
                        </div>
                    ) : (
                        <>
                            <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-surface px-4 py-2 text-sm text-text-secondary xl:flex">
                                <span className="font-semibold text-text-primary">12.800+</span>
                                profissionais conectados
                            </div>

                            <Link
                                to="/notificacoes"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-surface text-text-secondary transition hover:border-primary/30 hover:text-primary"
                                title="Central de notificacoes"
                            >
                                <BellRing size={18} />
                            </Link>
                        </>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/80 bg-surface text-text-secondary transition hover:border-primary/30 hover:text-primary"
                        title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
                    </button>

                    {!isConstrutora && (
                        <button
                            onClick={() => navigate('/perfil')}
                            className="inline-flex items-center gap-3 rounded-2xl border border-border/80 bg-surface px-3 py-2 transition hover:border-primary/30"
                            title="Abrir perfil"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <UserCircle2 size={16} />
                            </span>
                            <span className="hidden text-left md:block">
                                <span className="block text-sm font-semibold text-text-primary">
                                    {user?.name || 'Membro HUB'}
                                </span>
                                <span className="block text-[11px] text-text-secondary">
                                    {user?.role === 'admin' ? 'Gestao da plataforma' : 'Comunidade HUB'}
                                </span>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
