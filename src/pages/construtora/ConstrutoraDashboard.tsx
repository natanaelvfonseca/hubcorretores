import {
    AlertTriangle,
    ArrowRight,
    Building2,
    CircleDollarSign,
    Filter,
    Flame,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    Target,
    Timer,
    TrendingUp,
    Trophy,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConstrutoraPresentationData } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';
import {
    alertToneStyles,
    formatCurrency,
    formatDecimal,
    formatPercentage,
} from './construtoraUi';

const rankingStyles = {
    1: {
        surface:
            'border-amber-200/80 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.25),transparent_40%),linear-gradient(180deg,rgba(255,252,242,0.96),rgba(255,247,214,0.96))] shadow-[0_24px_60px_rgba(217,119,6,0.18)] dark:border-amber-500/20 dark:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.28),transparent_40%),linear-gradient(180deg,rgba(69,39,6,0.96),rgba(31,23,10,0.96))]',
        badge: 'bg-gradient-to-br from-[#F5C14D] via-[#D8893C] to-[#A45C23] text-white',
        glow: 'bg-[#F5C14D]/35',
        place: '1o lugar',
    },
    2: {
        surface:
            'border-slate-200/80 bg-[radial-gradient(circle_at_top,rgba(203,213,225,0.24),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,244,248,0.96))] shadow-[0_20px_50px_rgba(100,116,139,0.12)] dark:border-slate-500/20 dark:bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_40%),linear-gradient(180deg,rgba(28,37,49,0.96),rgba(15,23,42,0.96))]',
        badge: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-600 text-slate-950',
        glow: 'bg-slate-300/25',
        place: '2o lugar',
    },
    3: {
        surface:
            'border-orange-200/80 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.2),transparent_40%),linear-gradient(180deg,rgba(255,250,245,0.96),rgba(254,235,214,0.96))] shadow-[0_20px_50px_rgba(194,65,12,0.12)] dark:border-orange-500/20 dark:bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.18),transparent_40%),linear-gradient(180deg,rgba(67,29,8,0.96),rgba(30,20,13,0.96))]',
        badge: 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-700 text-white',
        glow: 'bg-orange-300/20',
        place: '3o lugar',
    },
} as const;

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
                            Boas-vindas ao painel da Construtora Alpha. Aqui voce acompanha a demanda, o atendimento e as vendas em tempo real.
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

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                <article className="relative overflow-hidden rounded-[30px] border border-emerald-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.25),_transparent_34%),linear-gradient(135deg,#062E2B,#0B4E47)] p-6 text-white shadow-[0_24px_70px_rgba(5,46,40,0.26)] sm:p-7">
                    <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/10 p-3 text-emerald-100">
                        <Sparkles size={22} />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-100/80">Previsao de vendas</p>
                    <p className="mt-4 text-4xl font-display">{data.salesForecast.vendasPrevistas30Dias}</p>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">{data.salesForecast.resumo}</p>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <CircleDollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Custo por venda</p>
                            <h2 className="mt-2 text-2xl font-display text-text-primary">Investimento e retorno</h2>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <p className="text-sm font-semibold text-text-secondary">Investimento</p>
                            <p className="mt-2 text-3xl font-display text-text-primary">
                                {formatCurrency(data.salesCost.investimento)}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <p className="text-sm font-semibold text-text-secondary">Vendas</p>
                            <p className="mt-2 text-3xl font-display text-text-primary">
                                {data.salesCost.vendas.toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <div className="rounded-[24px] border border-emerald-200/80 bg-emerald-50/90 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Custo por venda</p>
                            <p className="mt-2 text-3xl font-display text-emerald-900 dark:text-emerald-100">
                                {formatCurrency(data.salesCost.custoPorVenda)}
                            </p>
                        </div>
                    </div>
                </article>
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

            <section className="grid gap-4 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Qualidade do atendimento</p>
                            <h2 className="mt-2 text-2xl font-display text-text-primary">Velocidade e experiencia</h2>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {[
                            {
                                label: 'Tempo medio de resposta',
                                value: `${data.serviceQuality.tempoMedioRespostaMin} minutos`,
                                icon: Timer,
                            },
                            {
                                label: 'Leads respondidos',
                                value: `${data.serviceQuality.leadsRespondidosPercentual}%`,
                                icon: Users,
                            },
                            {
                                label: 'Nota media de atendimento',
                                value: `${formatDecimal(data.serviceQuality.notaMediaAtendimento)}/10`,
                                icon: Sparkles,
                            },
                        ].map((metric) => {
                            const Icon = metric.icon;

                            return (
                                <div
                                    key={metric.label}
                                    className="flex items-center justify-between gap-4 rounded-[22px] border border-border/70 bg-background/80 p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Icon size={18} />
                                        </div>
                                        <p className="text-sm font-semibold text-text-secondary">{metric.label}</p>
                                    </div>
                                    <p className="text-lg font-semibold text-text-primary">{metric.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Origem dos leads</p>
                    <h2 className="mt-2 text-2xl font-display text-text-primary">Canais que mais trazem oportunidades</h2>

                    <div className="mt-6 space-y-4">
                        {data.originBreakdown.map((item) => (
                            <div key={item.origem} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-text-primary">{item.origem}</span>
                                    <span className="text-text-secondary">{item.percentual}%</span>
                                </div>
                                <div className="h-3 rounded-full bg-surface-hover/90">
                                    <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#0F7B8C,#1AA0A4,#D8893C)]"
                                        style={{ width: `${item.percentual}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <AlertTriangle size={20} />
                            </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Alertas</p>
                            <h2 className="mt-2 text-2xl font-display text-text-primary">Pontos que pedem atencao</h2>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {data.alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={cn('rounded-[24px] border p-4', alertToneStyles[alert.tone])}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 rounded-full bg-black/5 p-2 dark:bg-white/10">
                                        {alert.tone === 'urgente' ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{alert.title}</p>
                                        <p className="mt-2 text-sm leading-6 opacity-80">{alert.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Top Corretores</p>
                        <h2 className="mt-2 text-2xl font-display text-text-primary">Quem esta puxando as vendas</h2>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {data.topCorretores.map((corretor) => {
                        const style = rankingStyles[corretor.posicao];

                        return (
                            <article
                                key={corretor.corretor_id}
                                className={cn('relative overflow-hidden rounded-[30px] border p-6', style.surface)}
                            >
                                <div className={cn('absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl', style.glow, corretor.posicao === 1 ? 'animate-pulse' : '')} />
                                <div className="relative">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className={cn('inline-flex rounded-full px-4 py-2 text-sm font-semibold shadow-[0_12px_24px_rgba(8,23,38,0.16)]', style.badge)}>
                                            {style.place}
                                        </span>
                                        <span className="rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary dark:border-white/10 dark:bg-white/5">
                                            {corretor.vendas} vendas
                                        </span>
                                    </div>

                                    <h3 className="mt-6 text-3xl font-display text-text-primary">{corretor.nome}</h3>
                                    <p className="mt-3 text-sm leading-7 text-text-secondary">
                                        Destaque comercial no empreendimento {data.activeEmpreendimento.nome}.
                                    </p>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
