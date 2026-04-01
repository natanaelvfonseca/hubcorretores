import { ShieldCheck } from 'lucide-react';
import {
    hubAdminAreas,
    hubAdminCapabilities,
    hubAdminMetrics,
} from '../../data/hubPlatform';

export function HubAdminPanel() {
    return (
        <div className="space-y-8 pb-6">
            <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.18),_transparent_30%),linear-gradient(135deg,rgba(4,19,31,0.98),rgba(6,39,58,0.98))] p-8 text-white shadow-[0_24px_70px_rgba(8,23,38,0.22)] sm:p-10">
                <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#5EEAD4]/12 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A6E8E1] backdrop-blur">
                            <ShieldCheck size={16} />
                            Painel administrativo
                        </div>
                        <h1 className="mt-6 text-4xl font-display leading-tight text-white sm:text-5xl">
                            Governança da comunidade, da marca e da operação regional.
                        </h1>
                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.76] sm:text-base">
                            O administrativo da HUB organiza entrada de membros, curadoria de oportunidades, gestão do
                            clube de vantagens, agenda institucional e comunicação oficial do ecossistema.
                        </p>
                    </div>

                    <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A5E8E0]">Princípio de gestão</p>
                        <div className="mt-5 space-y-3">
                            {hubAdminCapabilities.slice(0, 3).map((item) => (
                                <div key={item} className="rounded-[22px] border border-white/10 bg-black/10 p-4">
                                    <p className="text-sm leading-6 text-white/80">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
                {hubAdminMetrics.map((metric) => (
                    <article
                        key={metric.label}
                        className="rounded-[28px] border border-border/70 bg-surface/92 p-6 shadow-[0_20px_45px_rgba(8,23,38,0.06)]"
                    >
                        <p className="text-2xl font-display text-text-primary">{metric.value}</p>
                        <p className="mt-2 text-sm font-semibold text-text-primary">{metric.label}</p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{metric.description}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Áreas de gestão</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Frentes administrativas prioritárias</h2>
                    <div className="mt-6 space-y-4">
                        {hubAdminAreas.map((area) => (
                            <div key={area.title} className="rounded-[22px] border border-border/70 bg-background/80 p-5">
                                <h3 className="text-lg font-semibold text-text-primary">{area.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">{area.description}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Funcionalidades do painel</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">O que o time gestor controla aqui</h2>
                    <div className="mt-6 space-y-3">
                        {hubAdminCapabilities.map((item) => (
                            <div key={item} className="rounded-[22px] border border-border/70 bg-background/80 p-4">
                                <p className="text-sm leading-7 text-text-secondary">{item}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}
