import { useEffect, useRef, useState, type DragEvent as ReactDragEvent } from 'react';
import {
    Bell,
    Brain,
    Calendar,
    DollarSign,
    Globe,
    Lightbulb,
    Mail,
    MoreHorizontal,
    Phone,
    Sparkles,
    Trash2,
    User,
    UserCheck,
} from 'lucide-react';
import { Lead } from '../types';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';

const INTENT_CONFIG = {
    HOT: { label: 'QUENTE', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/25', ring: '#D8893C', cardBorder: 'border-accent/35' },
    WARM: { label: 'MORNO', color: 'text-primary-light', bg: 'bg-primary-light/10', border: 'border-primary-light/25', ring: '#1AA0A4', cardBorder: 'border-primary-light/30' },
    COLD: { label: 'FRIO', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/25', ring: '#60a5fa', cardBorder: 'border-border/50' },
} as const;

const FOLLOWUP_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
    pending: {
        label: 'FOLLOW-UP AGENDADO',
        className: 'border-primary/25 bg-primary/10 text-primary',
    },
    sent: {
        label: 'FOLLOW-UP ENVIADO',
        className: 'border-sky-500/25 bg-sky-500/10 text-sky-500',
    },
    replied: {
        label: 'LEAD REATIVADO',
        className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500',
    },
    cancelled: {
        label: 'FOLLOW-UP CANCELADO',
        className: 'border-slate-500/25 bg-slate-500/10 text-slate-500',
    },
};

interface Vendedor {
    id: string;
    nome: string;
}

interface FollowupState {
    status: string;
    current_step?: number;
    total_steps?: number;
    scheduled_at?: string | null;
    conversation_temperature?: string | null;
    sequence_name?: string | null;
    next_recommendation?: string | null;
    assigned_vendor_name?: string | null;
}

interface KanbanCardProps {
    lead: Lead;
    onDragStart: (e: ReactDragEvent<HTMLDivElement>, leadId: string) => void;
    onDelete?: (leadId: string) => void;
    onOpenDetails?: (lead: Lead) => void;
    onMarkAsClient?: (leadId: string) => void;
    vendedores?: Vendedor[];
    token?: string;
}

export function KanbanCard({
    lead,
    onDragStart,
    onDelete,
    onOpenDetails,
    onMarkAsClient,
    vendedores = [],
    token,
}: KanbanCardProps) {
    if (!lead) return null;

    const [showMenu, setShowMenu] = useState(false);
    const [intelligence, setIntelligence] = useState<any>(null);
    const [followupState, setFollowupState] = useState<FollowupState | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!token || !lead.id) return;
        fetch(`${apiBase}/api/leads/${lead.id}/opportunity-score`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data?.hasScore) setIntelligence(data);
            })
            .catch(() => { });
    }, [lead.id, token]);

    useEffect(() => {
        if (!token || !lead.phone) {
            setFollowupState(null);
            return;
        }

        const jid = encodeURIComponent(lead.phone.replace(/\D/g, '') + '@s.whatsapp.net');
        fetch(`${apiBase}/api/followup/status/${jid}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (data && data.status !== 'none') {
                    setFollowupState(data);
                    return;
                }
                setFollowupState(null);
            })
            .catch(() => setFollowupState(null));
    }, [lead.phone, token]);

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const intentCfg = lead.intentLabel ? INTENT_CONFIG[lead.intentLabel] : null;
    const score = lead.score ?? 0;
    const circumference = 2 * Math.PI * 10;
    const assignedVendedor = vendedores.find((vendedor) => vendedor.id === (lead as any).assignedTo);
    const followupBadge = followupState ? FOLLOWUP_BADGE_CONFIG[followupState.status] || FOLLOWUP_BADGE_CONFIG.pending : null;

    const formatValue = (value: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }).format(new Date(dateString));
        } catch {
            return dateString;
        }
    };

    const followupSchedule = followupState?.scheduled_at
        ? new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(followupState.scheduled_at))
        : null;

    const followupDetail = followupState?.next_recommendation
        || (followupSchedule ? `Proximo toque em ${followupSchedule}.` : 'Acompanhe a proxima acao sugerida pela IA.');

    return (
        <div
            draggable
            onDragStart={(event) => onDragStart(event, lead.id)}
            onClick={() => onOpenDetails?.(lead)}
            className={`mb-2 cursor-pointer overflow-hidden rounded-lg border bg-surface p-2.5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.99] ${intentCfg ? intentCfg.cardBorder : 'border-border/50'} group animate-fade-in`}
            title="Abrir detalhes do lead"
        >
            <div className="mb-2 flex items-start justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="relative flex-shrink-0">
                        {intentCfg && score > 0 ? (
                            <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0">
                                <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="10"
                                    fill="none"
                                    stroke={intentCfg.ring}
                                    strokeWidth="3"
                                    strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                        ) : null}
                        <div className="relative z-10 m-[2px] flex h-8 w-8 items-center justify-center rounded-full border border-white/5 bg-gradient-to-br from-gray-700 to-gray-800 text-xs font-bold text-white">
                            {(lead.name || 'Sem Nome')
                                .split(' ')
                                .map((name) => name[0])
                                .join('')
                                .substring(0, 2)
                                .toUpperCase()}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-semibold leading-tight text-text-primary" title="Abrir detalhes do lead">
                                {lead.name || 'Sem Nome'}
                            </h4>

                            {intentCfg && score > 0 && (
                                <span className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${intentCfg.bg} ${intentCfg.color} border ${intentCfg.border}`}>
                                    {intentCfg.label} {score}
                                </span>
                            )}

                            {intelligence && !intentCfg && (
                                <div
                                    className={`flex flex-shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold tracking-wide ${intelligence.temperature === 'quente'
                                        ? 'border border-accent/25 bg-accent/10 text-accent'
                                        : intelligence.temperature === 'morno'
                                            ? 'border border-primary-light/25 bg-primary-light/10 text-primary-light'
                                            : 'border border-sky-500/25 bg-sky-500/10 text-sky-400'
                                        }`}
                                >
                                    <Brain size={10} />
                                    {intelligence.temperature === 'quente' ? 'Score quente' : intelligence.temperature === 'morno' ? 'Score morno' : 'Score frio'} {intelligence.score}
                                </div>
                            )}

                            {followupBadge && (
                                <span className={`flex flex-shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold ${followupBadge.className}`}>
                                    <Bell size={8} />
                                    {followupBadge.label}
                                </span>
                            )}

                            {intelligence?.needs_human_attention && (
                                <span
                                    className="flex flex-shrink-0 items-center gap-1 rounded border border-red-500/25 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-500"
                                    title={intelligence.human_attention_reason || 'Lead com atencao humana prioritaria'}
                                >
                                    <Sparkles size={8} />
                                    ATENCAO HUMANA
                                </span>
                            )}

                            {lead.hasAiSummary && (
                                <span
                                    title="A IA ja gerou um resumo operacional para este lead"
                                    className="inline-flex items-center justify-center rounded-full border border-accent/25 bg-accent/10 p-1 text-accent"
                                >
                                    <Lightbulb size={11} />
                                </span>
                            )}
                        </div>

                        {lead.phone && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                                <Phone size={10} />
                                {lead.phone}
                            </p>
                        )}
                        {lead.email && (
                            <p className="mt-0.5 flex max-w-[180px] items-center gap-1 truncate text-xs text-text-secondary" title={lead.email}>
                                <Mail size={10} />
                                {lead.email}
                            </p>
                        )}
                        {lead.source && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-text-secondary">
                                <Globe size={10} />
                                {lead.source}
                            </p>
                        )}
                        {lead.briefing && (
                            <p className="mt-0.5 line-clamp-1 text-[10px] italic leading-tight text-text-muted" title={lead.briefing}>
                                {lead.briefing}
                            </p>
                        )}

                        {intelligence && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                                {intelligence.intent && (
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary-light">
                                        {intelligence.intent}
                                    </span>
                                )}
                                {intelligence.product_interest && intelligence.product_interest !== 'N/A' && (
                                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-400">
                                        Produto: {intelligence.product_interest}
                                    </span>
                                )}
                                {intelligence.top_objection && (
                                    <span
                                        className="max-w-[100px] truncate rounded-full border border-accent/20 bg-accent/10 px-1.5 py-0.5 text-[9px] font-medium text-accent"
                                        title={intelligence.top_objection}
                                    >
                                        Objecao: {intelligence.top_objection}
                                    </span>
                                )}
                                {intelligence.human_attention_reason && (
                                    <span
                                        className="max-w-[120px] truncate rounded-full border border-red-500/20 bg-red-500/10 px-1.5 py-0.5 text-[9px] font-medium text-red-400"
                                        title={intelligence.human_attention_reason}
                                    >
                                        {intelligence.human_attention_reason}
                                    </span>
                                )}
                            </div>
                        )}

                        {!intentCfg && lead.temperature && !intelligence && (
                            <div className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${lead.temperature.includes('Quente')
                                ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                : lead.temperature.includes('Morno')
                                    ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600'
                                    : 'border-blue-500/20 bg-blue-500/10 text-blue-500'
                                }`}>
                                <span>{lead.temperature}</span>
                            </div>
                        )}

                        {followupState && (
                            <div className="mt-2.5 rounded-xl border border-primary/15 bg-primary/[0.05] px-2.5 py-2">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                                        <Sparkles size={10} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                                            Recovery OS
                                        </p>
                                        <p className="mt-1 text-[11px] font-semibold text-text-primary">
                                            {followupState.sequence_name || 'Sequencia automatica'}
                                            {followupState.current_step ? ` · passo ${followupState.current_step}/${followupState.total_steps || followupState.current_step}` : ''}
                                        </p>
                                        <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                                            {followupDetail}
                                        </p>
                                        {(followupSchedule || followupState.assigned_vendor_name) && (
                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                {followupSchedule && (
                                                    <span className="rounded-full border border-black/5 bg-white/70 px-2 py-0.5 text-[9px] font-semibold text-text-secondary">
                                                        {followupSchedule}
                                                    </span>
                                                )}
                                                {followupState.assigned_vendor_name && (
                                                    <span className="rounded-full border border-black/5 bg-white/70 px-2 py-0.5 text-[9px] font-semibold text-text-secondary">
                                                        Vendedor: {followupState.assigned_vendor_name}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative ml-1 flex-shrink-0" ref={menuRef}>
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowMenu((value) => !value);
                        }}
                        className="rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary focus:outline-none"
                        title="Acoes"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-52 origin-top-right overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-xl">
                            {onMarkAsClient && lead.status !== 'Cliente' && (
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (confirm(`Marcar ${lead.name} como Cliente?`)) {
                                            onMarkAsClient(lead.id);
                                        }
                                        setShowMenu(false);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-xs text-green-500 transition-colors hover:bg-green-500/10"
                                >
                                    <UserCheck size={14} />
                                    Fechar negocio
                                </button>
                            )}

                            {onDelete && (
                                <div className="mt-1 border-t border-border/30 pt-1">
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            if (confirm('Excluir este lead?')) {
                                                onDelete(lead.id);
                                            }
                                            setShowMenu(false);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-500 transition-colors hover:bg-red-500/10"
                                    >
                                        <Trash2 size={14} />
                                        Excluir lead
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {assignedVendedor && (
                <div className="mb-1.5 flex items-center gap-1">
                    <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <User size={9} />
                        {assignedVendedor.nome}
                    </span>
                </div>
            )}

            <div className="mt-1 flex items-center justify-between border-t border-border/30 pt-2 text-[10px] text-text-secondary">
                <div className="flex items-center gap-1.5 font-medium text-text-primary/80">
                    <DollarSign size={10} className="text-green-500" />
                    {formatValue(lead.value || 0)}
                </div>
                <div className="flex items-center gap-1.5" title={lead.lastContact}>
                    <Calendar size={10} />
                    {formatDate(lead.lastContact)}
                </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {lead.tags.map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-text-primary/5 bg-text-primary/5 px-1.5 py-0.5 text-[9px] font-medium text-text-secondary"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
