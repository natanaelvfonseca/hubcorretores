import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHubModuleById, hubModules } from '../../data/hubPlatform';
import { canAccessHubModule } from '../../lib/portalAccess';

interface HubModulePageProps {
    sectionId: string;
}

export function HubModulePage({ sectionId }: HubModulePageProps) {
    const { user } = useAuth();
    const module = getHubModuleById(sectionId);

    if (!module || !canAccessHubModule(user, sectionId)) {
        return <Navigate to="/dashboard" replace />;
    }

    const Icon = module.icon;
    const relatedModules = hubModules
        .filter((item) => item.id !== module.id && item.id !== 'dashboard')
        .slice(0, 3);

    return (
        <div className="space-y-8 pb-6">
            <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.18),_transparent_34%),linear-gradient(135deg,rgba(6,30,45,0.98),rgba(9,52,74,0.96))] p-8 text-white shadow-[0_24px_70px_rgba(8,23,38,0.22)] sm:p-10">
                <div className="absolute right-[-8%] top-[-12%] h-56 w-56 rounded-full bg-[#6EE7D8]/15 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[18%] h-44 w-44 rounded-full bg-[#F8B46A]/18 blur-3xl" />

                <div className="relative grid gap-7 lg:grid-cols-[1.3fr_0.9fr]">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A4E8E1] backdrop-blur">
                            <Icon size={16} />
                            {module.eyebrow}
                        </div>
                        <h1 className="mt-6 text-4xl font-display leading-tight text-white sm:text-5xl">{module.title}</h1>
                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.76] sm:text-base">{module.summary}</p>

                        <div className="mt-8 flex flex-wrap gap-2">
                            {module.audience.map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/[0.85]"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9BE8E0]">Promessa do módulo</p>
                        <div className="mt-5 space-y-4">
                            {module.spotlight.map((item) => (
                                <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                                    <CheckCircle2 size={18} className="mt-0.5 text-[#7EE7DA]" />
                                    <p className="text-sm leading-6 text-white/[0.78]">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Funcionalidades</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">O que este módulo entrega</h2>
                    <div className="mt-6 space-y-3">
                        {module.capabilities.map((item) => (
                            <div key={item} className="flex gap-3 rounded-[22px] border border-border/70 bg-background/80 p-4">
                                <span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-accent" />
                                <p className="text-sm leading-7 text-text-secondary">{item}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Mapa de páginas</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Como a navegação interna se organiza</h2>
                    <div className="mt-6 space-y-4">
                        {module.pages.map((page) => (
                            <div key={page.title} className="rounded-[22px] border border-border/70 bg-background/80 p-5">
                                <h3 className="text-lg font-semibold text-text-primary">{page.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">{page.description}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Fluxo recomendado</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Como o membro usa esse ambiente</h2>
                    <div className="mt-6 grid gap-4">
                        {module.workflow.map((step) => (
                            <div key={step} className="rounded-[22px] border border-border/70 bg-background/80 p-5">
                                <p className="text-sm leading-7 text-text-secondary">{step}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Integração com WhatsApp</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Camada de apoio, sem virar dependência</h2>
                    <div className="mt-6 rounded-[24px] border border-primary/[0.18] bg-primary/[0.06] p-5">
                        <p className="text-sm leading-7 text-text-secondary">{module.supportNote}</p>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-border/70 bg-background/80 p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">Posicionamento do produto</p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            Este módulo foi pensado para aumentar a percepção de valor da HUB, profissionalizar a
                            operação e criar memória institucional própria para a comunidade.
                        </p>
                    </div>
                </article>
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Próximos ambientes</p>
                        <h2 className="mt-2 text-3xl font-display text-text-primary">Módulos conectados a esta jornada</h2>
                    </div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Voltar ao dashboard
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                    {relatedModules.map((item) => {
                        const RelatedIcon = item.icon;

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className="group rounded-[24px] border border-border/70 bg-background/80 p-5 transition hover:-translate-y-1 hover:border-primary/30"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="rounded-[18px] bg-primary/10 p-3 text-primary">
                                        <RelatedIcon size={18} />
                                    </div>
                                    <ArrowRight size={16} className="text-text-secondary transition group-hover:translate-x-1 group-hover:text-primary" />
                                </div>
                                <h3 className="mt-5 text-2xl font-display text-text-primary">{item.navLabel}</h3>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">{item.summary}</p>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
