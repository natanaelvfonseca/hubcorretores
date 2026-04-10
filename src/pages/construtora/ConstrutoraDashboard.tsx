import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
    ArrowRight,
    BrainCircuit,
    Building2,
    CheckCircle2,
    Clock3,
    Filter,
    Flame,
    MessageSquare,
    ShieldCheck,
    Sparkles,
    Target,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import {
    getConstrutoraDashboardSnapshot,
    type ConstrutoraLeadScore,
    type ConstrutoraLeadStatus,
    type ConstrutoraDashboardSnapshot,
} from '../../data/construtoraMockData';
import { cn } from '../../utils/cn';

const scoreStyles: Record<ConstrutoraLeadScore, string> = {
    alto: 'border-emerald-200/90 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
    medio: 'border-amber-200/90 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
    baixo: 'border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
};

const statusStyles: Record<ConstrutoraLeadStatus, string> = {
    quente: 'border-orange-200/90 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200',
    morno: 'border-yellow-200/90 bg-yellow-50 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-200',
    frio: 'border-sky-200/90 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
};

function formatPercentage(value: number) {
    return `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    }).format(value);
}

function formatResponseTime(minutes: number) {
    return `${minutes} min`;
}

function formatMessageTime(value: string) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function scoreLabel(score: ConstrutoraLeadScore) {
    return score.charAt(0).toUpperCase() + score.slice(1);
}

function statusLabel(status: ConstrutoraLeadStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function SectionCard({
    eyebrow,
    title,
    description,
    children,
    className,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7',
                className,
            )}
        >
            <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">{eyebrow}</p>
                <h2 className="text-2xl font-display text-text-primary sm:text-3xl">{title}</h2>
                <p className="max-w-3xl text-sm leading-7 text-text-secondary">{description}</p>
            </div>

            <div className="mt-6">{children}</div>
        </section>
    );
}

function ConstrutoraConversationModal({
    snapshot,
    activeLeadId,
    onClose,
}: {
    snapshot: ConstrutoraDashboardSnapshot;
    activeLeadId: string | null;
    onClose: () => void;
}) {
    const activeLead = activeLeadId
        ? snapshot.qualifiedLeads.find((lead) => lead.id === activeLeadId) ?? null
        : null;
    const activeConversation = activeLead ? snapshot.conversationsByLeadId[activeLead.id] : null;

    useEffect(() => {
        if (!activeConversation) return;

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [activeConversation, onClose]);

    if (!activeLead || !activeConversation) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0"
                aria-label="Fechar conversa"
            />

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-surface shadow-[0_32px_90px_rgba(4,19,31,0.34)] lg:grid-cols-[1.15fr_0.85fr]">
                <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(53,151,143,0.18),_transparent_28%),linear-gradient(180deg,#e8efe7,#dfeae2)]">
                    <div className="flex items-center justify-between border-b border-black/5 bg-[#0b3a55] px-5 py-4 text-white">
                        <div>
                            <p className="text-sm font-semibold">{activeLead.nome}</p>
                            <p className="text-xs text-white/70">
                                IA qualificando lead do {snapshot.activeEmpreendimento.nome}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-3 px-4 py-5 sm:px-5">
                        {activeConversation.messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'flex',
                                    message.autor === 'ia' ? 'justify-end' : 'justify-start',
                                )}
                            >
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-[22px] px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
                                        message.autor === 'ia'
                                            ? 'rounded-tr-md bg-[#dcf8c6] text-slate-900'
                                            : 'rounded-tl-md bg-white text-slate-800',
                                    )}
                                >
                                    <p className="text-sm leading-6">{message.texto}</p>
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <span className="text-[11px] text-slate-500">{formatMessageTime(message.enviado_em)}</span>
                                        {message.autor === 'ia' && (
                                            <CheckCircle2 size={14} className="text-[#0f7b8c]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="bg-surface px-6 py-6">
                    <div className="rounded-[26px] border border-primary/15 bg-primary/[0.05] p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/70">
                            Resumo da IA
                        </p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            {activeConversation.thread.resumo_ia}
                        </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Lead</p>
                            <p className="mt-2 text-lg font-semibold text-text-primary">{activeLead.nome}</p>
                            <p className="mt-1 text-sm text-text-secondary">{activeLead.interesse}</p>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Escopo</p>
                            <p className="mt-2 text-lg font-semibold text-text-primary">{snapshot.activeEmpreendimento.nome}</p>
                            <p className="mt-1 text-sm text-text-secondary">emp_id {snapshot.activeEmpreendimento.id}</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Classificacao</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', scoreStyles[activeLead.score])}>
                                    Score {scoreLabel(activeLead.score)}
                                </span>
                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[activeLead.status])}>
                                    Status {statusLabel(activeLead.status)}
                                </span>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Ultima acao</p>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">{activeLead.ultima_acao}</p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-emerald-200/80 bg-emerald-50/80 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">
                            Regra de visibilidade
                        </p>
                        <p className="mt-2 text-sm leading-7 text-emerald-800/90 dark:text-emerald-100/85">
                            Esta conversa foi exibida porque pertence ao mesmo construtora_id e empreendimento_id do perfil logado.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export function ConstrutoraDashboard() {
    const initialSnapshot = getConstrutoraDashboardSnapshot();
    const [selectedEmpreendimentoId, setSelectedEmpreendimentoId] = useState(
        initialSnapshot.activeEmpreendimento.id,
    );
    const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

    const snapshot = useMemo(
        () => getConstrutoraDashboardSnapshot(selectedEmpreendimentoId),
        [selectedEmpreendimentoId],
    );

    const overviewCards = [
        {
            label: 'Leads gerados',
            value: snapshot.overview.leadsGerados.toLocaleString('pt-BR'),
            icon: TrendingUp,
            accent: 'from-[#1AA0A4] to-[#0A4B66]',
            note: 'Origem ativa com foco em demanda do empreendimento.',
        },
        {
            label: 'Leads qualificados',
            value: snapshot.overview.leadsQualificados.toLocaleString('pt-BR'),
            icon: BrainCircuit,
            accent: 'from-[#0F7B8C] to-[#157F9B]',
            note: 'Leads validados pela IA para o contexto do Vista Mar.',
        },
        {
            label: 'Em atendimento',
            value: snapshot.overview.emAtendimento.toLocaleString('pt-BR'),
            icon: MessageSquare,
            accent: 'from-[#2E8E9B] to-[#145B73]',
            note: 'Conversas e tratativas comerciais em andamento.',
        },
        {
            label: 'Vendas estimadas',
            value: snapshot.overview.vendasEstimadas.toLocaleString('pt-BR'),
            icon: Target,
            accent: 'from-[#D8893C] to-[#A45C23]',
            note: 'Projecao atual baseada em leads quentes e propostas.',
        },
        {
            label: 'Taxa de conversao',
            value: formatPercentage(snapshot.overview.taxaConversao),
            icon: Flame,
            accent: 'from-[#C97524] to-[#8B4818]',
            note: 'Leitura executiva do funil filtrado por empreendimento.',
        },
    ];

    const corretoresAtivos = snapshot.brokerPerformance.map((row) => row.nome);

    return (
        <div className="space-y-6 pb-6">
            <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(216,137,60,0.18),_transparent_30%),linear-gradient(135deg,rgba(4,19,31,0.98),rgba(7,44,68,0.96))] p-8 text-white shadow-[0_30px_80px_rgba(8,23,38,0.28)] sm:p-10">
                <div className="absolute left-8 top-10 h-36 w-36 rounded-full bg-[#5EEAD4]/12 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[#D8893C]/14 blur-3xl" />

                <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A5E8E1] backdrop-blur">
                            <Building2 size={16} />
                            Perfil construtora
                        </div>

                        <h1 className="mt-6 max-w-3xl text-4xl font-display leading-tight text-white sm:text-5xl">
                            Painel executivo da {snapshot.construtora.nome} com visao clara da demanda, qualificacao e venda.
                        </h1>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.78] sm:text-base">
                            Tudo aqui foi filtrado para um unico contexto de negocio: apenas leads, conversas e corretores
                            relacionados ao {snapshot.activeEmpreendimento.nome}.
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Construtora</p>
                                <p className="mt-2 text-xl font-display text-white">{snapshot.construtora.nome}</p>
                                <p className="mt-1 text-xs text-white/70">const_id {snapshot.construtora.id}</p>
                            </div>

                            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Status</p>
                                <p className="mt-2 text-xl font-display text-white">Premium</p>
                                <p className="mt-1 text-xs text-white/70">Acesso executivo mockado</p>
                            </div>

                            <div className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Ticket medio</p>
                                <p className="mt-2 text-xl font-display text-white">
                                    {formatCurrency(snapshot.activeEmpreendimento.ticket_medio)}
                                </p>
                                <p className="mt-1 text-xs text-white/70">{snapshot.activeEmpreendimento.cidade}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[30px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A5E8E0]">
                                    Escopo visivel
                                </p>
                                <h2 className="mt-2 text-2xl font-display text-white">Visao por empreendimento</h2>
                            </div>

                            <div className="rounded-full border border-white/15 bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
                                Bloqueio contextual
                            </div>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-white/10 bg-black/10 p-4">
                            <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/65">
                                <Filter size={14} />
                                Empreendimento
                            </label>
                            <select
                                value={snapshot.activeEmpreendimento.id}
                                onChange={(event) => setSelectedEmpreendimentoId(event.target.value)}
                                className="h-[52px] w-full rounded-[18px] border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-white/25"
                            >
                                {snapshot.accessibleEmpreendimentos.map((empreendimento) => (
                                    <option key={empreendimento.id} value={empreendimento.id} className="text-slate-900">
                                        {empreendimento.nome}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-3 text-xs leading-6 text-white/68">
                                Este login enxerga somente empreendimentos autorizados em `accessible_empreendimento_ids`.
                            </p>
                        </div>

                        <div className="mt-5 space-y-3">
                            {[
                                'Sem acesso a outros empreendimentos.',
                                'Sem acesso a outros clientes dos corretores.',
                                'Sem acesso a conversas fora do empreendimento selecionado.',
                            ].map((rule) => (
                                <div key={rule} className="flex gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                                    <ShieldCheck size={18} className="mt-0.5 text-[#95E7DE]" />
                                    <p className="text-sm leading-6 text-white/[0.8]">{rule}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <SectionCard
                eyebrow="1. Visao geral"
                title="Indicadores executivos do empreendimento"
                description="Leitura objetiva da geracao de demanda, avancos de qualificacao e estimativa comercial no contexto da construtora."
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
                                <p className="mt-3 text-xs leading-6 text-text-secondary">{card.note}</p>
                            </article>
                        );
                    })}
                </div>
            </SectionCard>

            <SectionCard
                eyebrow="2. Funil de vendas"
                title="Fluxo do lead ate a venda"
                description="Visual simples do pipeline filtrado por origem e empreendimento, com quedas de volume visiveis em cada etapa."
            >
                <div className="grid gap-3 xl:grid-cols-6">
                    {snapshot.funnel.map((step, index) => (
                        <article
                            key={step.id}
                            className="relative overflow-hidden rounded-[26px] border border-border/70 bg-background/80 p-5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                    Etapa {index + 1}
                                </span>
                                {index < snapshot.funnel.length - 1 && (
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
                            <p className="mt-3 text-xs text-text-secondary">
                                {Math.round(step.ratio * 100)}% da base inicial do empreendimento.
                            </p>
                        </article>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard
                    eyebrow="3. Qualificacao com IA"
                    title="Leads priorizados para o empreendimento"
                    description="Lista mockada com sinais reais de interesse, score, temperatura e acesso rapido ao historico de conversa qualificado pela IA."
                >
                    <div className="space-y-3">
                        {snapshot.qualifiedLeads.map((lead) => (
                            <article
                                key={lead.id}
                                className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-background/80 p-5 lg:flex-row lg:items-center lg:justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold text-text-primary">{lead.nome}</h3>
                                        <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                                            {lead.id}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                            {lead.interesse}
                                        </span>
                                        <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                            Regiao {lead.regiao}
                                        </span>
                                        <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', scoreStyles[lead.score])}>
                                            Score {scoreLabel(lead.score)}
                                        </span>
                                        <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[lead.status])}>
                                            {statusLabel(lead.status)}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-sm leading-7 text-text-secondary">{lead.ultima_acao}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                                        Corretor responsavel {lead.corretor_nome}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveLeadId(lead.id)}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/15"
                                >
                                    Ver conversa
                                    <ArrowRight size={16} />
                                </button>
                            </article>
                        ))}
                    </div>
                </SectionCard>

                <SectionCard
                    eyebrow="4. Performance dos corretores"
                    title="Atendimento dentro do contexto da construtora"
                    description="Leitura sintetica apenas dos corretores e leads vinculados ao empreendimento selecionado."
                    className="h-full"
                >
                    <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/80">
                        <div className="hidden grid-cols-[1.2fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-border/70 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted md:grid">
                            <span>Corretor</span>
                            <span>Leads</span>
                            <span>Tempo medio</span>
                            <span>Conversao</span>
                        </div>

                        <div className="divide-y divide-border/70">
                            {snapshot.brokerPerformance.map((row) => (
                                <div
                                    key={row.id}
                                    className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.7fr_0.8fr_0.7fr] md:items-center"
                                >
                                    <div>
                                        <p className="text-base font-semibold text-text-primary">{row.nome}</p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">{row.equipe}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">{row.leads_recebidos} leads</p>
                                        <p className="mt-1 text-xs text-text-secondary">Escopo {snapshot.activeEmpreendimento.id}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                                        <Clock3 size={16} className="text-primary" />
                                        {formatResponseTime(row.tempo_medio_resposta_min)}
                                    </div>
                                    <div className="inline-flex w-fit items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        {row.taxa_conversao}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            </div>

            <SectionCard
                eyebrow="5. Visao por empreendimento"
                title={snapshot.activeEmpreendimento.nome}
                description="Consolidado final do projeto selecionado, mantendo a construtora dentro de um unico recorte de negocio."
            >
                <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                        {[
                            {
                                label: 'Leads gerados',
                                value: snapshot.empreendimentoView.leadsGerados.toLocaleString('pt-BR'),
                                icon: TrendingUp,
                            },
                            {
                                label: 'Conversas relacionadas',
                                value: snapshot.empreendimentoView.conversasRelacionadas.toLocaleString('pt-BR'),
                                icon: MessageSquare,
                            },
                            {
                                label: 'Corretores ativos',
                                value: snapshot.empreendimentoView.corretoresAtivos.toLocaleString('pt-BR'),
                                icon: Users,
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.label}
                                    className="rounded-[24px] border border-border/70 bg-background/80 p-5"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                                            <Icon size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                                {item.label}
                                            </p>
                                            <p className="mt-1 text-2xl font-display text-text-primary">{item.value}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                Conversas e origem dominante
                            </p>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                A maior parte da demanda qualificada deste painel veio de
                                {' '}
                                <span className="font-semibold text-text-primary">{snapshot.empreendimentoView.origemPrincipal}</span>
                                , sempre vinculada ao empreendimento selecionado.
                            </p>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                Corretores que atenderam este empreendimento
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {corretoresAtivos.map((nome) => (
                                    <span
                                        key={nome}
                                        className="rounded-full border border-border/80 bg-surface px-4 py-2 text-sm font-semibold text-text-primary"
                                    >
                                        {nome}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-sky-200/80 bg-sky-50/85 p-5 dark:border-sky-500/20 dark:bg-sky-500/10">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-sky-500/12 p-3 text-sky-700 dark:text-sky-200">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-sky-200">
                                        Leitura executiva
                                    </p>
                                    <p className="mt-2 text-sm leading-7 text-sky-900/85 dark:text-sky-100/85">
                                        A construtora enxerga o que importa: volume de demanda, qualidade dos leads,
                                        capacidade de resposta e impacto estimado em vendas, tudo sem exposicao a dados
                                        de outros projetos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionCard>

            <ConstrutoraConversationModal
                snapshot={snapshot}
                activeLeadId={activeLeadId}
                onClose={() => setActiveLeadId(null)}
            />
        </div>
    );
}
