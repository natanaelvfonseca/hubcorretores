import {
    CalendarCheck2,
    CircleDollarSign,
    Filter,
    KanbanSquare,
    MessageCircle,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConstrutoraPresentationData } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';
import {
    journeyStatusLabel,
    journeyStatusStyles,
    statusLabel,
    statusStyles,
} from './construtoraUi';

const stageSurfaceMap: Record<string, string> = {
    novo_lead: 'from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900',
    em_atendimento: 'from-cyan-100 via-white to-sky-50 dark:from-cyan-950/60 dark:via-slate-950 dark:to-slate-900',
    qualificado: 'from-teal-100 via-white to-emerald-50 dark:from-teal-950/60 dark:via-slate-950 dark:to-slate-900',
    visita_agendada: 'from-indigo-100 via-white to-violet-50 dark:from-indigo-950/60 dark:via-slate-950 dark:to-slate-900',
    proposta_enviada: 'from-amber-100 via-white to-orange-50 dark:from-amber-950/60 dark:via-slate-950 dark:to-slate-900',
    negociacao: 'from-rose-100 via-white to-pink-50 dark:from-rose-950/60 dark:via-slate-950 dark:to-slate-900',
    venda_fechada: 'from-emerald-100 via-white to-lime-50 dark:from-emerald-950/60 dark:via-slate-950 dark:to-slate-900',
};

const stageAccentMap: Record<string, string> = {
    novo_lead: 'from-slate-500 to-slate-700',
    em_atendimento: 'from-cyan-500 to-sky-700',
    qualificado: 'from-teal-500 to-emerald-700',
    visita_agendada: 'from-indigo-500 to-violet-700',
    proposta_enviada: 'from-amber-500 to-orange-700',
    negociacao: 'from-rose-500 to-pink-700',
    venda_fechada: 'from-emerald-500 to-lime-700',
};

export function ConstrutoraCRM() {
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

    const summaryCards = [
        {
            label: 'Leads no pipeline',
            value: data.leads.length.toLocaleString('pt-BR'),
            icon: Users,
        },
        {
            label: 'Em atendimento',
            value: (data.crmStages.find((stage) => stage.id === 'em_atendimento')?.leads.length ?? 0).toLocaleString('pt-BR'),
            icon: MessageCircle,
        },
        {
            label: 'Visitas agendadas',
            value: (data.crmStages.find((stage) => stage.id === 'visita_agendada')?.leads.length ?? 0).toLocaleString('pt-BR'),
            icon: CalendarCheck2,
        },
        {
            label: 'Vendas fechadas',
            value: (data.crmStages.find((stage) => stage.id === 'venda_fechada')?.leads.length ?? 0).toLocaleString('pt-BR'),
            icon: CircleDollarSign,
        },
    ];

    return (
        <div className="space-y-6 pb-6">
            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">CRM</p>
                        <h1 className="mt-2 text-3xl font-display text-text-primary">Pipeline de vendas por empreendimento</h1>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            Visualize com clareza onde cada oportunidade esta, quem esta atendendo e o que falta para virar venda.
                        </p>
                    </div>

                    <div className="w-full max-w-sm rounded-[24px] border border-border/70 bg-background/80 p-4">
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                            <Filter size={14} />
                            Empreendimento
                        </label>
                        <select
                            value={data.activeEmpreendimento.id}
                            onChange={(event) => setSelectedEmpreendimentoId(event.target.value)}
                            className="h-[52px] w-full rounded-[18px] border border-border/80 bg-surface px-4 py-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary/35"
                        >
                            {data.accessibleEmpreendimentos.map((empreendimento) => (
                                <option key={empreendimento.id} value={empreendimento.id}>
                                    {empreendimento.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-[26px] border border-border/70 bg-surface/92 p-5 shadow-[0_18px_50px_rgba(8,23,38,0.06)]"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon size={20} />
                            </div>
                            <p className="mt-5 text-sm font-semibold text-text-secondary">{card.label}</p>
                            <p className="mt-1 text-3xl font-display text-text-primary">{card.value}</p>
                        </article>
                    );
                })}
            </section>

            <section className="rounded-[32px] border border-border/70 bg-surface/92 p-4 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-5">
                <div className="flex items-center justify-between gap-3 px-2 pb-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Visao Kanban</p>
                        <h2 className="mt-2 text-2xl font-display text-text-primary">Andamento comercial em tempo real</h2>
                    </div>
                    <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-text-secondary lg:inline-flex">
                        <KanbanSquare size={16} className="text-primary" />
                        {data.activeEmpreendimento.nome}
                    </div>
                </div>

                <div className="overflow-x-auto pb-2">
                    <div className="grid min-w-[1450px] grid-cols-7 gap-4">
                        {data.crmStages.map((stage) => (
                            <article
                                key={stage.id}
                                className={cn(
                                    'rounded-[28px] border border-border/70 bg-gradient-to-b p-4 shadow-[0_18px_44px_rgba(8,23,38,0.05)]',
                                    stageSurfaceMap[stage.id],
                                )}
                            >
                                <div className="rounded-[22px] border border-black/5 bg-white/75 p-4 backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-lg font-semibold text-text-primary">{stage.label}</p>
                                            <p className="mt-2 text-sm leading-6 text-text-secondary">{stage.resumo}</p>
                                        </div>
                                        <span
                                            className={cn(
                                                'inline-flex min-w-11 items-center justify-center rounded-full bg-gradient-to-br px-3 py-1 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(8,23,38,0.18)]',
                                                stageAccentMap[stage.id],
                                            )}
                                        >
                                            {stage.leads.length}
                                        </span>
                                    </div>

                                    <div className="mt-4 h-1.5 rounded-full bg-black/5 dark:bg-white/10">
                                        <div
                                            className={cn('h-full rounded-full bg-gradient-to-r', stageAccentMap[stage.id])}
                                            style={{ width: `${Math.max((stage.leads.length / Math.max(data.leads.length, 1)) * 100 * 2.4, 14)}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {stage.leads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="rounded-[24px] border border-border/70 bg-white/90 p-4 shadow-[0_14px_34px_rgba(8,23,38,0.05)] dark:bg-surface"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-base font-semibold text-text-primary">{lead.nome}</h3>
                                                    <p className="mt-1 text-sm text-text-secondary">{lead.interesse}</p>
                                                </div>
                                                <span className="rounded-full border border-border/80 bg-background/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                                                    {lead.regiao}
                                                </span>
                                            </div>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', journeyStatusStyles[lead.jornada_status])}>
                                                    {journeyStatusLabel(lead.jornada_status)}
                                                </span>
                                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[lead.status])}>
                                                    {statusLabel(lead.status)}
                                                </span>
                                            </div>

                                            <div className="mt-4 rounded-[18px] border border-border/70 bg-background/70 p-3">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Atendimento</p>
                                                <p className="mt-1 text-sm font-semibold text-text-primary">{lead.corretor_nome}</p>
                                                <p className="mt-2 text-sm leading-6 text-text-secondary">{lead.ultima_atualizacao}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
