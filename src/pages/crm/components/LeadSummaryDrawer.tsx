import { useEffect, useState } from 'react';
import { Bell, BrainCircuit, Building2, Clock3, DollarSign, Globe, Lightbulb, Mail, Phone, Sparkles, Target, Trash2, User, UserCheck, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Lead } from '../types';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';

interface LeadSummaryResponse {
    memory: {
        lead_summary?: string | null;
        next_recommendation?: string | null;
        lead_interest?: string | null;
        main_objection?: string | null;
        top_objection?: string | null;
        pain_point?: string | null;
        company?: string | null;
        last_intent?: string | null;
        last_temperature?: string | null;
        last_agent_decision?: string | null;
        needs_human_attention?: boolean;
        human_attention_reason?: string | null;
        human_attention_since?: string | null;
        updated_at?: string | null;
    } | null;
    state: {
        lead_stage?: string | null;
        next_expected_action?: string | null;
        updated_at?: string | null;
    } | null;
    lead: {
        id?: string;
        name?: string;
        status?: string;
        temperature?: string;
        score?: number;
        last_ia_briefing?: string | null;
        needs_human_attention?: boolean;
        human_attention_reason?: string | null;
        human_attention_since?: string | null;
        top_objection?: string | null;
    } | null;
    summary: {
        text?: string | null;
        recommendation?: string | null;
        stage?: string | null;
        intent?: string | null;
        needs_human_attention?: boolean;
        human_attention_reason?: string | null;
        human_attention_since?: string | null;
        top_objection?: string | null;
    } | null;
}

interface FollowupStatusResponse {
    status: string;
    current_step?: number;
    total_steps?: number;
    scheduled_at?: string | null;
    conversation_temperature?: string | null;
    pipeline_stage?: string | null;
    sequence_name?: string | null;
    next_recommendation?: string | null;
    assigned_vendor_name?: string | null;
    followup_trigger_reason?: string | null;
    needs_human_attention?: boolean;
    human_attention_reason?: string | null;
    human_attention_since?: string | null;
    top_objection?: string | null;
}

const FOLLOWUP_STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending: { label: 'Agendado', className: 'border-primary/20 bg-primary/10 text-primary' },
    sent: { label: 'Enviado', className: 'border-sky-500/20 bg-sky-500/10 text-sky-500' },
    replied: { label: 'Reativado', className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' },
    cancelled: { label: 'Cancelado', className: 'border-slate-500/20 bg-slate-500/10 text-slate-500' },
};

const formatIntent = (intent?: string | null) => {
    const labels: Record<string, string> = {
        buying_intent: 'Interesse de compra',
        asked_price: 'Pedido de preco',
        accepted_meeting: 'Aceitou reuniao',
        gave_objection: 'Objecao ativa',
        asked_info: 'Pedido de informacoes',
        not_interested: 'Sem interesse',
        neutral: 'Conversa em andamento',
    };
    return intent ? (labels[intent] || intent) : 'Sem classificacao';
};

const formatStage = (stage?: string | null) => {
    const labels: Record<string, string> = {
        novo: 'Inicio do contato',
        qualificacao: 'Qualificacao',
        diagnostico: 'Diagnostico',
        apresentacao: 'Apresentacao',
        proposta: 'Proposta',
        agendamento: 'Agendamento',
        followup: 'Follow-up',
    };
    return stage ? (labels[stage] || stage) : 'Em andamento';
};

export function LeadSummaryDrawer({
    lead,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onConvertToClient,
    isProcessing = false,
}: {
    lead: Lead | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onConvertToClient: () => void;
    isProcessing?: boolean;
}) {
    const { token } = useAuth();
    const [data, setData] = useState<LeadSummaryResponse | null>(null);
    const [followupData, setFollowupData] = useState<FollowupStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !lead?.id || !token) return;

        let cancelled = false;
        setLoading(true);

        fetch(`${apiBase}/api/leads/${lead.id}/memory`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (!cancelled) {
                    setData(payload);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setData(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, lead?.id, token]);

    useEffect(() => {
        if (!isOpen || !lead?.phone || !token) {
            setFollowupData(null);
            return;
        }

        let cancelled = false;
        const jid = encodeURIComponent(lead.phone.replace(/\D/g, '') + '@s.whatsapp.net');

        fetch(`${apiBase}/api/followup/status/${jid}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async (response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (cancelled) return;
                if (payload && payload.status !== 'none') {
                    setFollowupData(payload);
                    return;
                }
                setFollowupData(null);
            })
            .catch(() => {
                if (!cancelled) {
                    setFollowupData(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [isOpen, lead?.phone, token]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !lead) return null;

    const summaryText = data?.summary?.text || data?.memory?.lead_summary || lead.briefing || 'A IA ainda nao gerou um resumo detalhado para este lead.';
    const recommendation = data?.summary?.recommendation || data?.memory?.next_recommendation || 'Continuar acompanhando a conversa e registrar o proximo passo.';
    const stage = data?.summary?.stage || data?.state?.lead_stage || lead.status;
    const intent = data?.summary?.intent || data?.memory?.last_intent || null;
    const needsHumanAttention = data?.summary?.needs_human_attention || data?.lead?.needs_human_attention || data?.memory?.needs_human_attention || followupData?.needs_human_attention || false;
    const humanAttentionReason = data?.summary?.human_attention_reason || data?.lead?.human_attention_reason || data?.memory?.human_attention_reason || followupData?.human_attention_reason || null;
    const humanAttentionSince = data?.summary?.human_attention_since || data?.lead?.human_attention_since || data?.memory?.human_attention_since || followupData?.human_attention_since || null;
    const topObjection = data?.summary?.top_objection || data?.lead?.top_objection || data?.memory?.top_objection || data?.memory?.main_objection || followupData?.top_objection || null;
    const canConvertToClient = lead.status !== 'Cliente';
    const followupBadge = followupData ? FOLLOWUP_STATUS_LABELS[followupData.status] || FOLLOWUP_STATUS_LABELS.pending : null;
    const lastContactLabel = lead.lastContact
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(lead.lastContact))
        : 'Nao registrado';
    const followupScheduleLabel = followupData?.scheduled_at
        ? new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(new Date(followupData.scheduled_at))
        : 'Sem envio agendado';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <button
                type="button"
                aria-label="Fechar detalhes do lead"
                onClick={onClose}
                className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            />

            <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-border bg-background shadow-2xl">
                <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-6 py-5 backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">Detalhes do lead</p>
                            <h2 className="mt-2 text-2xl font-bold text-foreground">{lead.name || 'Lead sem nome'}</h2>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-full border border-border bg-surface px-3 py-1 font-medium text-foreground">
                                    Funil: {lead.status}
                                </span>
                                {lead.temperature && (
                                    <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1 font-medium text-accent">
                                        {lead.temperature}
                                    </span>
                                )}
                                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary-light">
                                    Momento: {formatStage(stage)}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-border p-2 text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="space-y-5 px-6 py-6">
                    {loading && (
                        <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
                            Atualizando resumo da conversa...
                        </div>
                    )}

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className={`grid gap-2 ${canConvertToClient ? 'grid-cols-3' : 'grid-cols-2'}`}>
                            <button
                                type="button"
                                onClick={onEdit}
                                disabled={isProcessing}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <User size={15} />
                                Editar lead
                            </button>
                            {canConvertToClient && (
                                <button
                                    type="button"
                                    onClick={onConvertToClient}
                                    disabled={isProcessing}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <UserCheck size={15} />
                                    Converter em cliente
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onDelete}
                                disabled={isProcessing}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Trash2 size={15} />
                                Excluir lead
                            </button>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <User size={17} className="text-sky-400" />
                            <h3 className="text-sm font-semibold text-foreground">Dados do lead</h3>
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Telefone</p>
                                <p className="mt-2 flex items-center gap-2 text-foreground">
                                    <Phone size={14} className="text-muted-foreground" />
                                    {lead.phone || 'Nao informado'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                                <p className="mt-2 flex items-center gap-2 text-foreground">
                                    <Mail size={14} className="text-muted-foreground" />
                                    {lead.email || 'Nao informado'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Empresa</p>
                                <p className="mt-2 flex items-center gap-2 text-foreground">
                                    <Building2 size={14} className="text-muted-foreground" />
                                    {lead.company || data?.memory?.company || 'Nao informado'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Origem</p>
                                <p className="mt-2 flex items-center gap-2 text-foreground">
                                    <Globe size={14} className="text-muted-foreground" />
                                    {lead.source || 'Nao informada'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Valor</p>
                                <p className="mt-2 flex items-center gap-2 text-foreground">
                                    <DollarSign size={14} className="text-muted-foreground" />
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value || 0)}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Resumo curto</p>
                                <p className="mt-2 text-foreground">{lead.briefing || data?.lead?.last_ia_briefing || 'Sem briefing curto ainda'}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Ultimo contato</p>
                                <p className="mt-2 text-foreground">{lastContactLabel}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Score do lead</p>
                                <p className="mt-2 text-foreground">{lead.score ?? data?.lead?.score ?? 0}</p>
                            </div>
                        </div>
                        {lead.tags && lead.tags.length > 0 && (
                            <div className="mt-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tags</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {lead.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-medium text-foreground/85"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <BrainCircuit size={18} className="text-primary" />
                            <h3 className="text-sm font-semibold text-foreground">Resumo da IA</h3>
                        </div>
                        <p className="text-sm leading-7 text-foreground/90">{summaryText}</p>
                    </section>

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles size={17} className="text-red-400" />
                            <h3 className="text-sm font-semibold text-foreground">Prioridade comercial</h3>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Atencao humana</p>
                                <p className="mt-2 text-foreground">{needsHumanAttention ? 'Sim, com prioridade' : 'Nao ha alerta humano pendente'}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {humanAttentionReason || 'A IA pode seguir conduzindo a conversa normalmente.'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Objecao principal</p>
                                <p className="mt-2 text-foreground">{topObjection || 'Nenhuma objecao dominante registrada'}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {humanAttentionSince ? `Sinalizado ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(humanAttentionSince))}` : 'Sem alerta de takeover ate agora.'}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl border border-primary/15 bg-primary/10 p-2 text-primary">
                                    <Bell size={17} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">Recuperacao automatica</h3>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        Contexto do follow-up que o Revenue OS esta preparando para este lead.
                                    </p>
                                </div>
                            </div>
                            {followupBadge && (
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${followupBadge.className}`}>
                                    {followupBadge.label}
                                </span>
                            )}
                        </div>

                        {followupData ? (
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Sequencia</p>
                                    <p className="mt-2 text-foreground">
                                        {followupData.sequence_name || 'Sequencia automatica'}
                                        {followupData.current_step ? ` · passo ${followupData.current_step}/${followupData.total_steps || followupData.current_step}` : ''}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Proximo envio</p>
                                    <p className="mt-2 flex items-center gap-2 text-foreground">
                                        <Clock3 size={14} className="text-muted-foreground" />
                                        {followupScheduleLabel}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Temperatura</p>
                                    <p className="mt-2 text-foreground">{followupData.conversation_temperature || lead.temperature || 'Sem leitura'}</p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Vendedor responsavel</p>
                                    <p className="mt-2 text-foreground">{followupData.assigned_vendor_name || 'Nao atribuido ainda'}</p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-background px-4 py-3 md:col-span-2">
                                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Motivo e proxima acao</p>
                                    <div className="mt-2 flex items-start gap-2">
                                        <Sparkles size={14} className="mt-0.5 text-primary" />
                                        <p className="text-foreground">
                                            {followupData.next_recommendation || followupData.followup_trigger_reason || 'Seguir com o proximo contato recomendado pela IA.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-background px-4 py-4 text-sm text-muted-foreground">
                                Este lead ainda nao entrou em uma sequencia ativa de recuperacao.
                            </div>
                        )}
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl border border-border bg-surface p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Target size={17} className="text-emerald-400" />
                                <h3 className="text-sm font-semibold text-foreground">Momento da conversa</h3>
                            </div>
                            <div className="space-y-2 text-sm text-foreground/85">
                                <p><span className="text-muted-foreground">Etapa:</span> {formatStage(stage)}</p>
                                <p><span className="text-muted-foreground">Intencao:</span> {formatIntent(intent)}</p>
                                {data?.memory?.last_agent_decision && (
                                    <p><span className="text-muted-foreground">Agente:</span> {data.memory.last_agent_decision}</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-border bg-surface p-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Lightbulb size={17} className="text-accent" />
                                <h3 className="text-sm font-semibold text-foreground">Proxima acao recomendada</h3>
                            </div>
                            <p className="text-sm leading-7 text-foreground/90">{recommendation}</p>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-border bg-surface p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <User size={17} className="text-sky-400" />
                            <h3 className="text-sm font-semibold text-foreground">Sinais importantes</h3>
                        </div>
                        <div className="grid gap-3 text-sm md:grid-cols-2">
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Interesse</p>
                                <p className="mt-2 text-foreground">{data?.memory?.lead_interest || 'Nao identificado ainda'}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Objecao principal</p>
                                <p className="mt-2 text-foreground">{topObjection || 'Sem objecao registrada'}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Dor percebida</p>
                                <p className="mt-2 text-foreground">{data?.memory?.pain_point || 'Ainda em descoberta'}</p>
                            </div>
                            <div className="rounded-2xl border border-border/70 bg-background px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Empresa</p>
                                <p className="mt-2 text-foreground">{data?.memory?.company || lead.company || 'Nao informado'}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </aside>
        </div>
    );
}
