import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    hubModules,
    hubPillars,
    hubSnapshotMetrics,
    hubSupportSignals,
} from '../../data/hubPlatform';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { ConstrutoraDashboard } from '../construtora/ConstrutoraDashboard';

const featuredModules = hubModules.filter((module) => module.id !== 'dashboard');

export function HubDashboard() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <ConstrutoraDashboard />;
    }

    return (
        <div className="space-y-8 pb-6">
            <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.18),_transparent_32%),linear-gradient(135deg,rgba(4,19,31,0.98),rgba(8,47,73,0.96))] p-8 text-white shadow-[0_30px_80px_rgba(8,23,38,0.24)] sm:p-10">
                <div className="absolute inset-y-0 right-0 hidden w-[32%] border-l border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] lg:block" />
                <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-[#5EEAD4]/15 blur-3xl" />
                <div className="absolute bottom-6 right-12 h-32 w-32 rounded-full bg-[#F8B46A]/20 blur-3xl" />

                <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.9fr]">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#9EE7DE]">
                            HUB Corretores do Litoral SC
                        </p>
                        <h1 className="mt-5 max-w-2xl text-4xl font-display leading-tight text-white sm:text-5xl">
                            A base oficial para transformar comunidade em ecossistema imobiliário proprietário.
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/[0.78] sm:text-base">
                            O HUB substitui a lógica de grupos soltos por uma plataforma premium de networking,
                            oportunidades, diretórios, vantagens e presença institucional para o mercado imobiliário
                            do litoral catarinense.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link
                                to="/networking"
                                className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#062133] shadow-[0_18px_40px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5"
                            >
                                Explorar networking
                                <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/oportunidades"
                                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/[0.12]"
                            >
                                Ver oportunidades
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {hubSnapshotMetrics.map((metric) => (
                                <article
                                    key={metric.label}
                                    className="rounded-[28px] border border-white/12 bg-white/[0.07] p-4 backdrop-blur"
                                >
                                    <p className="text-2xl font-display text-white">{metric.value}</p>
                                    <p className="mt-1 text-sm font-semibold text-white/92">{metric.label}</p>
                                    <p className="mt-2 text-xs leading-6 text-white/[0.68]">{metric.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="relative lg:pl-8">
                        <div className="rounded-[30px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#A5E8E0]">
                                        Painel de posicionamento
                                    </p>
                                    <h2 className="mt-2 text-2xl font-display text-white">
                                        {user?.name ? `Olá, ${user.name.split(' ')[0]}.` : 'Olá.'}
                                    </h2>
                                </div>
                                <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
                                    Premium
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {[
                                    'Comunidade digital proprietária, com o HUB como centro oficial.',
                                    'Negócios, imóveis e indicações organizados com contexto e rastreabilidade.',
                                    'Clube de vantagens, eventos e parceiros reforçando valor recorrente.',
                                ].map((item) => (
                                    <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                                        <CheckCircle2 size={18} className="mt-0.5 text-[#7EE7DA]" />
                                        <p className="text-sm leading-6 text-white/[0.78]">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 rounded-[24px] border border-[#5EEAD4]/18 bg-[#061E2D]/70 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-[#5EEAD4]/12 p-3 text-[#9BE9E0]">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">WhatsApp como apoio, não como estrutura</p>
                                        <p className="mt-2 text-xs leading-6 text-white/70">
                                            O HUB concentra contexto, regras, memória e reputação. O WhatsApp só entra
                                            quando a conversa precisa de velocidade ou continuidade operacional.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-4">
                {hubPillars.map((pillar) => (
                    <article
                        key={pillar.title}
                        className="rounded-[28px] border border-border/70 bg-surface/92 p-6 shadow-[0_20px_45px_rgba(8,23,38,0.06)]"
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/75">Pilar</p>
                        <h2 className="mt-3 text-2xl font-display text-text-primary">{pillar.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{pillar.description}</p>
                    </article>
                ))}
            </section>

            <section className="rounded-[32px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)] sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">Mapa da plataforma</p>
                        <h2 className="mt-2 text-3xl font-display text-text-primary">Arquitetura completa do HUB</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
                            Cada módulo foi desenhado para substituir dependências informais por fluxos organizados,
                            profissionais e escaláveis dentro de um único produto.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-3">
                    {featuredModules.map((module) => {
                        const Icon = module.icon;

                        return (
                            <Link
                                key={module.id}
                                to={module.path}
                                className="group rounded-[28px] border border-border/70 bg-background/80 p-5 transition hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_18px_40px_rgba(15,118,110,0.12)]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="rounded-[20px] bg-primary/10 p-3 text-primary">
                                        <Icon size={20} />
                                    </div>
                                    <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                                        Módulo
                                    </span>
                                </div>

                                <h3 className="mt-5 text-2xl font-display text-text-primary">{module.navLabel}</h3>
                                <p className="mt-3 text-sm leading-7 text-text-secondary">{module.summary}</p>

                                <div className="mt-5 space-y-2">
                                    {module.spotlight.slice(0, 2).map((item) => (
                                        <div key={item} className="flex gap-2">
                                            <span className="mt-[11px] h-1.5 w-1.5 rounded-full bg-accent" />
                                            <p className="text-sm leading-6 text-text-secondary">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                    Abrir estrutura
                                    <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <article className="rounded-[32px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">Fluxo oficial</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Como a operação se organiza dentro do produto</h2>
                    <div className="mt-6 space-y-4">
                        {[
                            {
                                title: '1. Descoberta e posicionamento',
                                description: 'Perfis, diretórios e networking estruturam quem está no ecossistema e como cada membro é encontrado.',
                            },
                            {
                                title: '2. Negócios e circulação',
                                description: 'Feed de oportunidades, imóveis em destaque, mural e segmentos organizam a geração de negócios.',
                            },
                            {
                                title: '3. Valor recorrente e retenção',
                                description: 'Clube de vantagens, agenda, parceiros e notificações mantêm a comunidade viva, útil e memorável.',
                            },
                        ].map((step) => (
                            <div key={step.title} className="rounded-[24px] border border-border/70 bg-background/75 p-5">
                                <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[32px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">Camada de apoio</p>
                    <h2 className="mt-2 text-3xl font-display text-text-primary">Comunicação integrada sem dependência estrutural</h2>
                    <div className="mt-6 space-y-4">
                        {hubSupportSignals.map((signal) => (
                            <div key={signal.title} className="rounded-[24px] border border-border/70 bg-background/75 p-5">
                                <h3 className="text-lg font-semibold text-text-primary">{signal.title}</h3>
                                <p className="mt-2 text-sm leading-7 text-text-secondary">{signal.description}</p>
                            </div>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
}
