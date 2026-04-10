import { BarChart3, Clock3, Filter, MessageSquare, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConstrutoraPresentationData } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';
import { LeadConversationModal } from './components/LeadConversationModal';
import {
    formatCurrency,
    journeyStatusLabel,
    journeyStatusStyles,
    scoreLabel,
    scoreStyles,
    statusLabel,
    statusStyles,
} from './construtoraUi';

export function ConstrutoraLeadQualification() {
    const { user } = useAuth();

    if (!isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const initialData = getConstrutoraPresentationData();
    const [selectedEmpreendimentoId, setSelectedEmpreendimentoId] = useState(initialData.activeEmpreendimento.id);
    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
    const data = useMemo(
        () => getConstrutoraPresentationData(selectedEmpreendimentoId),
        [selectedEmpreendimentoId],
    );

    const metricCards = [
        {
            label: 'Tempo medio ate qualificacao',
            value: `${data.leadMetrics.tempoMedioQualificacaoMin} min`,
            icon: Clock3,
        },
        {
            label: 'Tempo medio ate atendimento',
            value: `${data.leadMetrics.tempoMedioAtendimentoMin} min`,
            icon: MessageSquare,
        },
        {
            label: 'Tempo medio ate fechamento',
            value: `${data.leadMetrics.tempoMedioFechamentoDias} dias`,
            icon: TrendingUp,
        },
        {
            label: 'Investimento em trafego',
            value: formatCurrency(data.leadMetrics.investimentoTrafego),
            icon: BarChart3,
        },
        {
            label: 'Custo por lead',
            value: formatCurrency(data.leadMetrics.custoPorLead),
            icon: Filter,
        },
    ];

    return (
        <div className="space-y-6 pb-6">
            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Qualificacao de Leads</p>
                        <h1 className="mt-2 text-3xl font-display text-text-primary">Leads recebidos e andamento do atendimento</h1>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            Veja quem chegou, como esta o atendimento e quais conversas merecem prioridade agora.
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

            <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Origem dos leads</p>
                    <h2 className="mt-2 text-2xl font-display text-text-primary">Canais que mais trazem oportunidades</h2>

                    <div className="mt-6 space-y-4">
                        {data.leadMetrics.origens.map((item) => (
                            <div key={item.origem} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-semibold text-text-primary">{item.origem}</span>
                                    <span className="text-text-secondary">{item.percentual}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-surface-hover/90">
                                    <div
                                        className="h-full rounded-full bg-[linear-gradient(90deg,#0F7B8C,#1AA0A4,#D8893C)]"
                                        style={{ width: `${item.percentual}%` }}
                                    />
                                </div>
                                <p className="text-xs text-text-muted">{item.total} leads</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {metricCards.map((card) => {
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
                </div>
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Lista de leads</p>
                    <h2 className="text-2xl font-display text-text-primary">Leads em acompanhamento</h2>
                </div>

                <div className="mt-6 space-y-3">
                    {data.leads.map((lead) => (
                        <article
                            key={lead.id}
                            className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/80 p-5 lg:flex-row lg:items-center lg:justify-between"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold text-text-primary">{lead.nome}</h3>
                                    <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                        {lead.origem}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                        {lead.interesse}
                                    </span>
                                    <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                        {lead.regiao}
                                    </span>
                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', journeyStatusStyles[lead.jornada_status])}>
                                        {journeyStatusLabel(lead.jornada_status)}
                                    </span>
                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', scoreStyles[lead.score])}>
                                        Score {scoreLabel(lead.score)}
                                    </span>
                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[lead.status])}>
                                        {statusLabel(lead.status)}
                                    </span>
                                </div>

                                <p className="mt-3 text-sm leading-7 text-text-secondary">{lead.ultima_atualizacao}</p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveLeadId(lead.id)}
                                className="inline-flex h-12 items-center justify-center rounded-[18px] border border-primary/15 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/15"
                            >
                                Ver conversa
                            </button>
                        </article>
                    ))}
                </div>
            </section>

            <LeadConversationModal
                data={data}
                activeLeadId={activeLeadId}
                onClose={() => setActiveLeadId(null)}
            />
        </div>
    );
}
