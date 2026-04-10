import { ArrowRight, Building2, Filter, Flame, MessageSquare, Target, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConstrutoraPresentationData } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';
import { formatPercentage } from './construtoraUi';

export function ConstrutoraDashboard() {
    const { user } = useAuth();

    if (!isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const initialData = getConstrutoraPresentationData();
    const [selectedEmpreendimentoId, setSelectedEmpreendimentoId] = useState(initialData.activeEmpreendimento.id);
    const data = useMemo(
        () => getConstrutoraPresentationData(selectedEmpreendimentoId),
        [selectedEmpreendimentoId],
    );

    const overviewCards = [
        {
            label: 'Leads gerados',
            value: data.overview.leadsGerados.toLocaleString('pt-BR'),
            icon: TrendingUp,
            accent: 'from-[#1AA0A4] to-[#0A4B66]',
        },
        {
            label: 'Leads qualificados',
            value: data.overview.leadsQualificados.toLocaleString('pt-BR'),
            icon: Building2,
            accent: 'from-[#0F7B8C] to-[#157F9B]',
        },
        {
            label: 'Em atendimento',
            value: data.overview.emAtendimento.toLocaleString('pt-BR'),
            icon: MessageSquare,
            accent: 'from-[#2E8E9B] to-[#145B73]',
        },
        {
            label: 'Vendas estimadas',
            value: data.overview.vendasEstimadas.toLocaleString('pt-BR'),
            icon: Target,
            accent: 'from-[#D8893C] to-[#A45C23]',
        },
        {
            label: 'Taxa de conversao',
            value: formatPercentage(data.overview.taxaConversao),
            icon: Flame,
            accent: 'from-[#C97524] to-[#8B4818]',
        },
    ];

    return (
        <div className="space-y-6 pb-6">
            <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(216,137,60,0.18),_transparent_30%),linear-gradient(135deg,rgba(4,19,31,0.98),rgba(7,44,68,0.96))] p-8 text-white shadow-[0_30px_80px_rgba(8,23,38,0.28)] sm:p-10">
                <div className="absolute left-8 top-10 h-36 w-36 rounded-full bg-[#5EEAD4]/12 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#D8893C]/14 blur-3xl" />

                <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A5E8E1] backdrop-blur">
                            <Building2 size={16} />
                            Construtora Alpha
                        </div>

                        <h1 className="mt-6 max-w-3xl text-4xl font-display leading-tight text-white sm:text-5xl">
                            Construtora Alpha
                        </h1>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.82] sm:text-base">
                            Acompanhamento completo da geracao de leads, atendimento e vendas dos seus empreendimentos.
                        </p>

                        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/[0.72]">
                            Todos os dados apresentados sao exclusivos da Construtora Alpha.
                        </p>
                    </div>

                    <div className="rounded-[30px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A5E8E0]">
                            Empreendimento
                        </p>
                        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/10 p-4">
                            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                                <Filter size={14} />
                                Selecione
                            </label>
                            <select
                                value={data.activeEmpreendimento.id}
                                onChange={(event) => setSelectedEmpreendimentoId(event.target.value)}
                                className="h-[52px] w-full rounded-[18px] border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white/25"
                            >
                                {data.accessibleEmpreendimentos.map((empreendimento) => (
                                    <option key={empreendimento.id} value={empreendimento.id} className="text-slate-900">
                                        {empreendimento.nome}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-3 text-xs leading-6 text-white/68">
                                Selecione um empreendimento para visualizar as metricas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Visao geral</p>
                    <h2 className="text-2xl font-display text-text-primary sm:text-3xl">Desempenho do empreendimento</h2>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {overviewCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <article
                                key={card.label}
                                className="group relative overflow-hidden rounded-[26px] border border-border/70 bg-background/80 p-5 transition hover:-translate-y-1 hover:border-primary/25"
                            >
                                <div className={cn('inline-flex rounded-2xl bg-gradient-to-br p-[1px] shadow-[0_12px_28px_rgba(15,23,42,0.08)]', card.accent)}>
                                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900 dark:bg-surface dark:text-white">
                                        <Icon size={20} />
                                    </span>
                                </div>
                                <p className="mt-5 text-sm font-semibold text-text-secondary">{card.label}</p>
                                <p className="mt-1 text-3xl font-display text-text-primary">{card.value}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Funil de vendas</p>
                    <h2 className="text-2xl font-display text-text-primary sm:text-3xl">Da chegada do lead ate a venda</h2>
                </div>

                <div className="mt-6 grid gap-3 xl:grid-cols-6">
                    {data.funnel.map((step, index) => (
                        <article
                            key={step.id}
                            className="relative overflow-hidden rounded-[26px] border border-border/70 bg-background/80 p-5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                    Etapa {index + 1}
                                </span>
                                {index < data.funnel.length - 1 && (
                                    <ArrowRight size={15} className="text-text-muted" />
                                )}
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.label}</h3>
                            <p className="mt-2 text-3xl font-display text-text-primary">
                                {step.total.toLocaleString('pt-BR')}
                            </p>

                            <div className="mt-4 h-2 rounded-full bg-surface-hover/90">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#0F7B8C,#1AA0A4,#D8893C)]"
                                    style={{ width: `${Math.max(step.ratio * 100, 12)}%` }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
}
