import { useCallback, useEffect, useMemo, useState, type ElementType, type ReactNode } from 'react';
import {
    BarChart3,
    Bell,
    Brain,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit2,
    Lightbulb,
    List,
    Loader2,
    Plus,
    RefreshCw,
    Save,
    Search,
    Settings,
    Sparkles,
    Trash2,
    Users,
    Wand2,
    X,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

interface FollowupSequence {
    id: string;
    name: string;
    pipeline_stage: string | null;
    active: boolean;
    ai_mode: boolean;
    step_count: number;
    active_queue_count?: number;
    next_scheduled_at?: string | null;
}

interface FollowupStep {
    id: string;
    sequence_id: string;
    step_number: number;
    delay_minutes: number;
    message_template: string;
    media_url: string | null;
    followup_type: string;
}

interface FollowupSettings {
    enabled: boolean;
    ai_mode_enabled: boolean;
    max_followups_per_lead: number;
    quente_delay_minutes: number;
    morno_delay_minutes: number;
    frio_delay_minutes: number;
}

interface QueueEntry {
    id: string;
    remote_jid: string;
    sequence_id: string | null;
    current_step: number;
    total_steps: number;
    scheduled_at: string;
    status: string;
    conversation_temperature: string;
    pipeline_stage: string | null;
    followup_trigger_reason: string | null;
    detected_objection: string | null;
    detected_product_interest: string | null;
    intent_score: number;
    lead_name?: string | null;
    lead_score?: number;
    lead_briefing?: string | null;
    lead_summary?: string | null;
    next_recommendation?: string | null;
    assigned_vendor_name?: string | null;
    sequence_name?: string | null;
    sequence_ai_mode?: boolean;
}

interface DashboardData {
    kpis: {
        recovered: number;
        responseRate: number;
        avgReplyMinutes: number;
        conversions: number;
        activeQueue?: number;
        activeSequences?: number;
    };
    byStep: Array<{ step_number: number; sent: number; replied: number }>;
    trend: Array<{ day: string; sent: number; replied: number }>;
    statusBreakdown?: Array<{ status: string; count: number }>;
    temperatureBreakdown?: Array<{ name: string; value: number }>;
    sequencePerformance?: Array<{ name: string; queued: number; replied: number; conversions: number }>;
}

const PIPELINE_STAGES = ['Novo Lead', 'Qualificacao', 'Interesse', 'Proposta', 'Negociacao', 'Fechamento'];
const FOLLOWUP_TYPES = [
    { value: 'reminder', label: 'Lembrete leve' },
    { value: 'value', label: 'Entrega de valor' },
    { value: 'urgency', label: 'Urgencia' },
    { value: 'reengagement', label: 'Reengajamento' },
    { value: 'objection_price', label: 'Objecao de preco' },
];

const TABS = [
    { key: 'sequences', label: 'Sequencias', icon: List },
    { key: 'queue', label: 'Fila ativa', icon: Bell },
    { key: 'dashboard', label: 'Desempenho', icon: BarChart3 },
    { key: 'settings', label: 'Configuracoes', icon: Settings },
] as const;

const STATUS_STYLES: Record<string, string> = {
    pending: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
    sent: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
    replied: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
    cancelled: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
};

const TEMP_STYLES: Record<string, string> = {
    quente: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
    morno: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
    frio: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
};

type ActiveTab = typeof TABS[number]['key'];

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function Surface({ className, children }: { className?: string; children: ReactNode }) {
    return (
        <div className={cn(
            'rounded-[32px] border border-black/[0.06] bg-white/[0.86] shadow-[0_24px_70px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.03] dark:shadow-none',
            className,
        )}>
            {children}
        </div>
    );
}

function HeaderStat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="rounded-[24px] border border-black/[0.06] bg-white/75 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {hint && <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>}
        </div>
    );
}

function EmptyState({
    icon: Icon,
    title,
    copy,
    action,
}: {
    icon: ElementType;
    title: string;
    copy: string;
    action?: ReactNode;
}) {
    return (
        <Surface className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.08] text-primary">
                <Icon size={24} />
            </div>
            <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">{title}</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{copy}</p>
            {action && <div className="mt-6">{action}</div>}
        </Surface>
    );
}

function formatDelay(minutes: number) {
    if (minutes < 60) return `${minutes} min`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
}

function formatDateTime(value?: string | null) {
    if (!value) return 'Sem horario';
    return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatDay(value: string) {
    return new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatPercent(value: number) {
    return `${Math.round(value * 100)}%`;
}

function jidLabel(value?: string | null) {
    return (value || '').replace('@s.whatsapp.net', '').replace('@g.us', '') || 'Contato sem identificacao';
}

export function FollowupManager() {
    const { token } = useAuth();
    const headers = useMemo(() => ({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    }), [token]);

    const [activeTab, setActiveTab] = useState<ActiveTab>('sequences');
    const [searchQuery, setSearchQuery] = useState('');

    const [sequences, setSequences] = useState<FollowupSequence[]>([]);
    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [dashData, setDashData] = useState<DashboardData | null>(null);
    const [settings, setSettings] = useState<FollowupSettings>({
        enabled: true,
        ai_mode_enabled: false,
        max_followups_per_lead: 4,
        quente_delay_minutes: 30,
        morno_delay_minutes: 120,
        frio_delay_minutes: 720,
    });

    const [stepsBySeq, setStepsBySeq] = useState<Record<string, FollowupStep[]>>({});
    const [selectedSequenceId, setSelectedSequenceId] = useState<string | null>(null);
    const [showNewSeq, setShowNewSeq] = useState(false);
    const [addingStepFor, setAddingStepFor] = useState<string | null>(null);
    const [editingStepId, setEditingStepId] = useState<string | null>(null);

    const [newSeqName, setNewSeqName] = useState('');
    const [newSeqStage, setNewSeqStage] = useState('');
    const [newSeqAI, setNewSeqAI] = useState(false);

    const [newStep, setNewStep] = useState({ delay_minutes: 60, message_template: '', followup_type: 'reminder', media_url: '' });
    const [stepDraft, setStepDraft] = useState({ delay_minutes: 60, message_template: '', followup_type: 'reminder', media_url: '' });

    const [loadingSeqs, setLoadingSeqs] = useState(true);
    const [loadingQueue, setLoadingQueue] = useState(true);
    const [loadingDash, setLoadingDash] = useState(true);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [pageRefreshing, setPageRefreshing] = useState(false);
    const [savingStep, setSavingStep] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const pushFlash = useCallback((type: 'success' | 'error', text: string) => {
        setFlash({ type, text });
        window.setTimeout(() => setFlash(null), 3000);
    }, []);

    const fetchSequences = useCallback(async () => {
        setLoadingSeqs(true);
        try {
            const res = await fetch('/api/followup/sequences', { headers });
            if (!res.ok) throw new Error('Falha ao carregar sequencias');
            const data = await res.json();
            setSequences(data);
            setSelectedSequenceId((current) => current && data.some((item: FollowupSequence) => item.id === current) ? current : data[0]?.id || null);
        } catch (error) {
            console.error(error);
            pushFlash('error', 'Nao foi possivel carregar as sequencias.');
        } finally {
            setLoadingSeqs(false);
        }
    }, [headers, pushFlash]);

    const fetchQueue = useCallback(async () => {
        setLoadingQueue(true);
        try {
            const res = await fetch('/api/followup/queue', { headers });
            if (!res.ok) throw new Error('Falha ao carregar fila');
            setQueue(await res.json());
        } catch (error) {
            console.error(error);
            pushFlash('error', 'Nao foi possivel carregar a fila ativa.');
        } finally {
            setLoadingQueue(false);
        }
    }, [headers, pushFlash]);

    const fetchDashboard = useCallback(async () => {
        setLoadingDash(true);
        try {
            const res = await fetch('/api/followup/dashboard', { headers });
            if (!res.ok) throw new Error('Falha ao carregar dashboard');
            setDashData(await res.json());
        } catch (error) {
            console.error(error);
            pushFlash('error', 'Nao foi possivel carregar o desempenho da recuperacao.');
        } finally {
            setLoadingDash(false);
        }
    }, [headers, pushFlash]);

    const fetchSettings = useCallback(async () => {
        setLoadingSettings(true);
        try {
            const res = await fetch('/api/followup/settings', { headers });
            if (!res.ok) throw new Error('Falha ao carregar configuracoes');
            setSettings(await res.json());
        } catch (error) {
            console.error(error);
            pushFlash('error', 'Nao foi possivel carregar as configuracoes.');
        } finally {
            setLoadingSettings(false);
        }
    }, [headers, pushFlash]);

    const fetchSteps = useCallback(async (sequenceId: string) => {
        const res = await fetch(`/api/followup/sequences/${sequenceId}/steps`, { headers });
        if (!res.ok) throw new Error('Falha ao carregar passos');
        const steps = await res.json();
        setStepsBySeq((current) => ({ ...current, [sequenceId]: steps }));
        return steps as FollowupStep[];
    }, [headers]);

    const refreshAll = useCallback(async () => {
        setPageRefreshing(true);
        await Promise.all([fetchSequences(), fetchQueue(), fetchDashboard(), fetchSettings()]);
        setPageRefreshing(false);
    }, [fetchDashboard, fetchQueue, fetchSequences, fetchSettings]);

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    useEffect(() => {
        if (!selectedSequenceId || stepsBySeq[selectedSequenceId]) return;
        fetchSteps(selectedSequenceId).catch((error) => {
            console.error(error);
            pushFlash('error', 'Nao foi possivel abrir os passos da sequencia.');
        });
    }, [fetchSteps, pushFlash, selectedSequenceId, stepsBySeq]);

    const selectedSequence = useMemo(
        () => sequences.find((sequence) => sequence.id === selectedSequenceId) || null,
        [selectedSequenceId, sequences],
    );
    const selectedSteps = selectedSequenceId ? stepsBySeq[selectedSequenceId] || [] : [];

    const filteredSequences = useMemo(() => {
        const term = searchQuery.trim().toLowerCase();
        if (!term) return sequences;
        return sequences.filter((sequence) =>
            sequence.name.toLowerCase().includes(term) ||
            (sequence.pipeline_stage || '').toLowerCase().includes(term),
        );
    }, [searchQuery, sequences]);

    const filteredQueue = useMemo(() => {
        const term = searchQuery.trim().toLowerCase();
        if (!term) return queue;
        return queue.filter((item) =>
            (item.lead_name || '').toLowerCase().includes(term) ||
            (item.sequence_name || '').toLowerCase().includes(term) ||
            (item.pipeline_stage || '').toLowerCase().includes(term) ||
            jidLabel(item.remote_jid).toLowerCase().includes(term),
        );
    }, [queue, searchQuery]);

    const activeSequenceCount = sequences.filter((item) => item.active).length;
    const pendingQueueCount = queue.filter((item) => item.status === 'pending').length;
    const reengagedCount = queue.filter((item) => item.status === 'replied').length;

    const chartTrend = (dashData?.trend || []).map((item) => ({ name: formatDay(item.day), Enviados: item.sent, Respondidos: item.replied }));
    const chartSteps = (dashData?.byStep || []).map((item) => ({ name: `P${item.step_number}`, Enviados: item.sent, Respondidos: item.replied }));

    const createSequence = async () => {
        if (!newSeqName.trim()) return;
        const res = await fetch('/api/followup/sequences', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: newSeqName.trim(), pipeline_stage: newSeqStage || null, ai_mode: newSeqAI }),
        });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel criar a sequencia.');
        setShowNewSeq(false);
        setNewSeqName('');
        setNewSeqStage('');
        setNewSeqAI(false);
        pushFlash('success', 'Sequencia criada.');
        await fetchSequences();
    };

    const toggleSequence = async (sequence: FollowupSequence) => {
        const res = await fetch(`/api/followup/sequences/${sequence.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ active: !sequence.active }),
        });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel alterar o status da sequencia.');
        pushFlash('success', sequence.active ? 'Sequencia pausada.' : 'Sequencia ativada.');
        await Promise.all([fetchSequences(), fetchQueue()]);
    };

    const deleteSequence = async (sequence: FollowupSequence) => {
        if (!window.confirm(`Excluir "${sequence.name}" e todos os passos?`)) return;
        const res = await fetch(`/api/followup/sequences/${sequence.id}`, { method: 'DELETE', headers });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel excluir a sequencia.');
        setSelectedSequenceId((current) => current === sequence.id ? null : current);
        pushFlash('success', 'Sequencia removida.');
        await Promise.all([fetchSequences(), fetchQueue(), fetchDashboard()]);
    };

    const addStep = async (sequenceId: string) => {
        if (!newStep.message_template.trim()) return;
        const res = await fetch(`/api/followup/sequences/${sequenceId}/steps`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                delay_minutes: newStep.delay_minutes,
                message_template: newStep.message_template,
                followup_type: newStep.followup_type,
                media_url: newStep.media_url || null,
            }),
        });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel adicionar o passo.');
        setAddingStepFor(null);
        setNewStep({ delay_minutes: 60, message_template: '', followup_type: 'reminder', media_url: '' });
        pushFlash('success', 'Passo adicionado.');
        await Promise.all([fetchSteps(sequenceId), fetchSequences()]);
    };

    const startStepEdit = (step: FollowupStep) => {
        setEditingStepId(step.id);
        setStepDraft({
            delay_minutes: step.delay_minutes,
            message_template: step.message_template,
            followup_type: step.followup_type,
            media_url: step.media_url || '',
        });
    };

    const saveStep = async (sequenceId: string, stepId: string) => {
        setSavingStep(true);
        try {
            const res = await fetch(`/api/followup/steps/${stepId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    delay_minutes: stepDraft.delay_minutes,
                    message_template: stepDraft.message_template,
                    followup_type: stepDraft.followup_type,
                    media_url: stepDraft.media_url || null,
                }),
            });
            if (!res.ok) return pushFlash('error', 'Nao foi possivel salvar o passo.');
            setEditingStepId(null);
            pushFlash('success', 'Passo atualizado.');
            await fetchSteps(sequenceId);
        } finally {
            setSavingStep(false);
        }
    };

    const deleteStep = async (sequenceId: string, step: FollowupStep) => {
        if (!window.confirm(`Excluir o passo ${step.step_number}?`)) return;
        const res = await fetch(`/api/followup/steps/${step.id}`, { method: 'DELETE', headers });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel excluir o passo.');
        pushFlash('success', 'Passo removido.');
        await Promise.all([fetchSteps(sequenceId), fetchSequences()]);
    };

    const cancelQueue = async (id: string) => {
        const res = await fetch(`/api/followup/queue/${id}`, { method: 'DELETE', headers });
        if (!res.ok) return pushFlash('error', 'Nao foi possivel cancelar o follow-up.');
        pushFlash('success', 'Follow-up cancelado.');
        await Promise.all([fetchQueue(), fetchDashboard(), fetchSequences()]);
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch('/api/followup/settings', {
                method: 'PUT',
                headers,
                body: JSON.stringify(settings),
            });
            if (!res.ok) return pushFlash('error', 'Nao foi possivel salvar as configuracoes.');
            setSettings(await res.json());
            pushFlash('success', 'Configuracoes salvas.');
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-6 py-8">
                <Surface className="overflow-hidden">
                    <div className="rounded-[32px] bg-[radial-gradient(circle_at_top_right,rgba(255,120,51,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,120,51,0.08),transparent_28%)] p-8 sm:p-10">
                        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                            <div className="max-w-3xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                    <Wand2 size={13} />
                                    Revenue Recovery
                                </span>
                                <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Recuperacao de receita</h1>
                                <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                                    Organize o follow-up do WhatsApp com mais contexto, menos atrito e melhor previsibilidade para o time.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:min-w-[520px]">
                                <div className="flex h-[58px] items-center gap-3 rounded-[22px] border border-black/[0.06] bg-white/78 px-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                                    <Search size={18} className="text-muted-foreground" />
                                    <input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Buscar por nome, etapa ou contexto"
                                        className="w-full border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={refreshAll}
                                        type="button"
                                        className="inline-flex h-[58px] w-[58px] items-center justify-center rounded-[22px] border border-black/[0.06] bg-white/78 text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]"
                                    >
                                        {pageRefreshing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('sequences'); setShowNewSeq(true); }}
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-[22px] bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.32)]"
                                    >
                                        <Plus size={16} />
                                        Nova sequencia
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 grid gap-4 lg:grid-cols-4">
                            <HeaderStat label="Sequencias ativas" value={activeSequenceCount} hint="Fluxos prontos para operar." />
                            <HeaderStat label="Fila agendada" value={pendingQueueCount} hint="Leads aguardando proximo toque." />
                            <HeaderStat label="Leads reativados" value={reengagedCount} hint="Contatos que voltaram a responder." />
                            <HeaderStat label="Taxa de resposta" value={dashData ? formatPercent(dashData.kpis.responseRate) : '--'} hint={settings.enabled ? 'Engine ligada.' : 'Engine pausada.'} />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <span className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold',
                                settings.enabled
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
                            )}>
                                <span className={cn('h-2 w-2 rounded-full', settings.enabled ? 'bg-emerald-500' : 'bg-slate-400')} />
                                {settings.enabled ? 'Engine ativa' : 'Engine pausada'}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3 py-1.5 text-xs font-medium text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                <Brain size={13} className="text-primary" />
                                {sequences.filter((item) => item.ai_mode).length} fluxos com IA
                            </span>
                        </div>
                    </div>
                </Surface>

                {flash && (
                    <div className={cn(
                        'inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium',
                        flash.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                            : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
                    )}>
                        {flash.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                        {flash.text}
                    </div>
                )}

                <div className="flex flex-wrap gap-3">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            type="button"
                            className={cn(
                                'flex min-w-[180px] flex-1 items-center gap-3 rounded-[26px] border px-4 py-4 text-left transition-all duration-300',
                                activeTab === key
                                    ? 'border-primary/15 bg-primary/[0.08] shadow-[0_14px_35px_rgba(245,121,59,0.12)]'
                                    : 'border-black/[0.06] bg-white/72 hover:border-primary/15 hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.04]',
                            )}
                        >
                            <div className={cn(
                                'rounded-2xl border p-2.5',
                                activeTab === key
                                    ? 'border-primary/15 bg-primary/[0.08] text-primary'
                                    : 'border-black/[0.06] bg-white text-muted-foreground dark:border-white/[0.08] dark:bg-[#151518]',
                            )}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {key === 'sequences' && 'Desenhe as cadencias da operacao.'}
                                    {key === 'queue' && 'Veja quem vai receber follow-up.'}
                                    {key === 'dashboard' && 'Leia resposta, conversao e saude.'}
                                    {key === 'settings' && 'Ajuste limites, delays e IA.'}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {activeTab === 'sequences' && (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px]">
                        <div className="space-y-6">
                            {showNewSeq && (
                                <Surface className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Novo fluxo</p>
                                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Criar sequencia de follow-up</h2>
                                        </div>
                                        <button onClick={() => setShowNewSeq(false)} className="rounded-2xl border border-black/[0.06] p-2 text-muted-foreground dark:border-white/[0.08]" type="button">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <input value={newSeqName} onChange={(event) => setNewSeqName(event.target.value)} placeholder="Nome da sequencia" className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                        <select value={newSeqStage} onChange={(event) => setNewSeqStage(event.target.value)} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <option value="">Todas as etapas</option>
                                            {PIPELINE_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                                        </select>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between rounded-[24px] border border-black/[0.06] bg-[#F8F8FA] p-4 dark:border-white/[0.08] dark:bg-[#111214]">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Modo IA</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Ajusta a mensagem final ao contexto de cada conversa.</p>
                                        </div>
                                        <button type="button" onClick={() => setNewSeqAI((current) => !current)} className={cn('relative h-7 w-12 rounded-full', newSeqAI ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700')}>
                                            <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', newSeqAI ? 'translate-x-6' : 'translate-x-1')} />
                                        </button>
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button onClick={createSequence} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 py-3 text-sm font-semibold text-white" type="button">
                                            <Save size={15} />
                                            Salvar sequencia
                                        </button>
                                    </div>
                                </Surface>
                            )}

                            {loadingSeqs ? (
                                <Surface className="flex items-center justify-center p-12"><Loader2 size={22} className="animate-spin text-primary" /></Surface>
                            ) : filteredSequences.length === 0 ? (
                                <EmptyState
                                    icon={Sparkles}
                                    title="Nenhuma sequencia encontrada"
                                    copy={searchQuery ? 'Ajuste a busca para localizar os fluxos ativos.' : 'Crie sua primeira sequencia para transformar silencio em nova oportunidade.'}
                                    action={!searchQuery ? (
                                        <button onClick={() => setShowNewSeq(true)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 py-3 text-sm font-semibold text-white" type="button">
                                            <Plus size={15} />
                                            Criar primeira sequencia
                                        </button>
                                    ) : null}
                                />
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {filteredSequences.map((sequence) => (
                                        <Surface key={sequence.id} className={cn('p-5', selectedSequenceId === sequence.id && 'border-primary/20 shadow-[0_30px_80px_rgba(245,121,59,0.12)]')}>
                                            <div className="flex items-start justify-between gap-4">
                                                <button onClick={() => setSelectedSequenceId(sequence.id)} className="min-w-0 text-left" type="button">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{sequence.pipeline_stage || 'Multi etapa'}</p>
                                                    <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{sequence.name}</h3>
                                                </button>
                                                <button onClick={() => setSelectedSequenceId((current) => current === sequence.id ? null : sequence.id)} className="rounded-2xl border border-black/[0.06] p-2 text-muted-foreground dark:border-white/[0.08]" type="button">
                                                    {selectedSequenceId === sequence.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                </button>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', sequence.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200')}>
                                                    {sequence.active ? 'Ativa' : 'Pausada'}
                                                </span>
                                                <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-[#17181A]">
                                                    {sequence.step_count} passo{sequence.step_count !== 1 ? 's' : ''}
                                                </span>
                                                {sequence.ai_mode && <span className="rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-xs font-semibold text-primary">IA contextual</span>}
                                            </div>
                                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                                <div className="rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Fila atual</p>
                                                    <p className="mt-2 text-lg font-semibold text-foreground">{sequence.active_queue_count || 0}</p>
                                                </div>
                                                <div className="rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Proximo disparo</p>
                                                    <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(sequence.next_scheduled_at)}</p>
                                                </div>
                                            </div>
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <button onClick={() => toggleSequence(sequence)} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]" type="button">
                                                    {sequence.active ? 'Pausar' : 'Ativar'}
                                                </button>
                                                <button onClick={() => deleteSequence(sequence)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200" type="button">
                                                    Excluir
                                                </button>
                                            </div>
                                        </Surface>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {selectedSequence ? (
                                <Surface className="p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Sequencia em foco</p>
                                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{selectedSequence.name}</h2>
                                    <div className="mt-5 space-y-3">
                                        {selectedSteps.map((step) => {
                                            const editing = editingStepId === step.id;
                                            return (
                                                <div key={step.id} className="rounded-[24px] border border-black/[0.06] bg-[#F8F8FA] p-4 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/[0.08] font-bold text-primary">{step.step_number}</div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-[#17181A]">{formatDelay(step.delay_minutes)}</span>
                                                                <span className="rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-xs font-semibold text-primary">{FOLLOWUP_TYPES.find((item) => item.value === step.followup_type)?.label || step.followup_type}</span>
                                                            </div>
                                                            {editing ? (
                                                                <div className="mt-4 space-y-4">
                                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                                        <input type="number" min={1} value={stepDraft.delay_minutes} onChange={(event) => setStepDraft((current) => ({ ...current, delay_minutes: Number(event.target.value) || 60 }))} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                                                        <select value={stepDraft.followup_type} onChange={(event) => setStepDraft((current) => ({ ...current, followup_type: event.target.value }))} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]">
                                                                            {FOLLOWUP_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <textarea rows={5} value={stepDraft.message_template} onChange={(event) => setStepDraft((current) => ({ ...current, message_template: event.target.value }))} className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                                                    <input value={stepDraft.media_url} onChange={(event) => setStepDraft((current) => ({ ...current, media_url: event.target.value }))} placeholder="URL de imagem opcional" className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                                                    <div className="flex flex-wrap gap-3">
                                                                        <button onClick={() => saveStep(selectedSequence.id, step.id)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-4 py-3 text-sm font-semibold text-white" type="button">
                                                                            {savingStep ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                                                            Salvar
                                                                        </button>
                                                                        <button onClick={() => setEditingStepId(null)} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]" type="button">
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="mt-4 text-sm leading-7 text-foreground/90">{step.message_template}</p>
                                                                    {step.media_url && <p className="mt-3 text-xs font-medium text-muted-foreground">Midia: {step.media_url}</p>}
                                                                    <div className="mt-4 flex flex-wrap gap-3">
                                                                        <button onClick={() => startStepEdit(step)} className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]" type="button">
                                                                            <Edit2 size={15} />
                                                                            Editar
                                                                        </button>
                                                                        <button onClick={() => deleteStep(selectedSequence.id, step)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200" type="button">
                                                                            <Trash2 size={15} />
                                                                            Excluir
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {addingStepFor === selectedSequence.id ? (
                                        <div className="mt-5 rounded-[28px] border border-primary/15 bg-primary/[0.05] p-5">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <input type="number" min={1} value={newStep.delay_minutes} onChange={(event) => setNewStep((current) => ({ ...current, delay_minutes: Number(event.target.value) || 60 }))} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                                <select value={newStep.followup_type} onChange={(event) => setNewStep((current) => ({ ...current, followup_type: event.target.value }))} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]">
                                                    {FOLLOWUP_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                                </select>
                                            </div>
                                            <textarea rows={5} value={newStep.message_template} onChange={(event) => setNewStep((current) => ({ ...current, message_template: event.target.value }))} placeholder="Mensagem com variaveis da conversa" className="mt-3 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                            <input value={newStep.media_url} onChange={(event) => setNewStep((current) => ({ ...current, media_url: event.target.value }))} placeholder="URL de imagem opcional" className="mt-3 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button onClick={() => addStep(selectedSequence.id)} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-4 py-3 text-sm font-semibold text-white" type="button">
                                                    <Save size={15} />
                                                    Salvar passo
                                                </button>
                                                <button onClick={() => setAddingStepFor(null)} className="rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]" type="button">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setAddingStepFor(selectedSequence.id)} className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-5 py-3 text-sm font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]" type="button">
                                            <Plus size={15} />
                                            Adicionar passo
                                        </button>
                                    )}
                                </Surface>
                            ) : (
                                <EmptyState icon={Lightbulb} title="Selecione uma sequencia" copy="Escolha um fluxo para revisar passos, editar mensagens e ajustar a cadencia." />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'queue' && (
                    <div className="space-y-6">
                        {loadingQueue ? (
                            <Surface className="flex items-center justify-center p-12"><Loader2 size={22} className="animate-spin text-primary" /></Surface>
                        ) : filteredQueue.length === 0 ? (
                            <EmptyState
                                icon={Bell}
                                title="Nenhum follow-up na fila"
                                copy={searchQuery ? 'Ajuste a busca para localizar contatos agendados.' : 'Quando a IA encontrar inatividade relevante, os contatos aparecem aqui com contexto e proxima acao.'}
                            />
                        ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                                {filteredQueue.map((entry) => (
                                    <Surface key={entry.id} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{entry.pipeline_stage || 'Pipeline sem etapa'}</p>
                                                <h3 className="mt-3 truncate text-2xl font-bold tracking-tight text-foreground">{entry.lead_name || jidLabel(entry.remote_jid)}</h3>
                                                <p className="mt-1 truncate text-sm text-muted-foreground">{entry.sequence_name || 'Sequencia sem nome'} · Passo {entry.current_step}/{entry.total_steps}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', STATUS_STYLES[entry.status] || STATUS_STYLES.pending)}>{entry.status}</span>
                                                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', TEMP_STYLES[entry.conversation_temperature] || TEMP_STYLES.frio)}>{entry.conversation_temperature}</span>
                                            </div>
                                        </div>
                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Agendado para</p>
                                                <p className="mt-2 text-sm font-semibold text-foreground">{formatDateTime(entry.scheduled_at)}</p>
                                            </div>
                                            <div className="rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Score atual</p>
                                                <p className="mt-2 text-sm font-semibold text-foreground">{entry.lead_score || entry.intent_score || 0}/100</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 rounded-[24px] border border-black/[0.06] bg-white/85 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Resumo da IA</p>
                                            <p className="mt-2 text-sm leading-7 text-foreground/90">{entry.lead_briefing || 'Sem briefing curto disponivel.'}</p>
                                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.next_recommendation || entry.lead_summary || 'Monitorar a janela e revisar o contexto antes do envio.'}</p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {entry.assigned_vendor_name && <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/[0.08] dark:bg-[#17181A]">Vendedor: {entry.assigned_vendor_name}</span>}
                                                {entry.detected_product_interest && <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">Produto: {entry.detected_product_interest}</span>}
                                                {entry.detected_objection && <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">Objecao: {entry.detected_objection}</span>}
                                            </div>
                                        </div>
                                        {entry.status === 'pending' && (
                                            <div className="mt-5 flex justify-end">
                                                <button onClick={() => cancelQueue(entry.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200" type="button">
                                                    Cancelar follow-up
                                                </button>
                                            </div>
                                        )}
                                    </Surface>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {loadingDash ? (
                            <Surface className="flex items-center justify-center p-12"><Loader2 size={22} className="animate-spin text-primary" /></Surface>
                        ) : !dashData ? (
                            <EmptyState icon={BarChart3} title="Sem dados de recuperacao ainda" copy="Assim que o motor comecar a operar, o painel mostra resposta, conversao e leitura por sequencia." />
                        ) : (
                            <>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <HeaderStat label="Leads reativados" value={dashData.kpis.recovered} />
                                    <HeaderStat label="Taxa de resposta" value={formatPercent(dashData.kpis.responseRate)} />
                                    <HeaderStat label="Tempo medio" value={dashData.kpis.avgReplyMinutes < 60 ? `${dashData.kpis.avgReplyMinutes} min` : `${Math.round(dashData.kpis.avgReplyMinutes / 60)}h`} />
                                    <HeaderStat label="Conversoes" value={dashData.kpis.conversions} />
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
                                    <Surface className="p-6">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Cadencia</p>
                                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Ultimos 14 dias</h2>
                                        <div className="mt-6 h-[260px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartTrend}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} />
                                                    <Line type="monotone" dataKey="Enviados" stroke="#F97316" strokeWidth={3} dot={false} />
                                                    <Line type="monotone" dataKey="Respondidos" stroke="#10B981" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Surface>

                                    <Surface className="p-6">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Radar operacional</p>
                                        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Estado da fila</h2>
                                        <div className="mt-6 space-y-3">
                                            {(dashData.statusBreakdown || []).map((item) => (
                                                <div key={item.status} className="flex items-center justify-between rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', STATUS_STYLES[item.status] || STATUS_STYLES.pending)}>{item.status}</span>
                                                    <span className="text-lg font-bold tracking-tight text-foreground">{item.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            {(dashData.temperatureBreakdown || []).map((item) => (
                                                <div key={item.name} className="flex items-center justify-between rounded-[22px] border border-black/[0.06] bg-[#F8F8FA] px-4 py-3 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', TEMP_STYLES[item.name] || TEMP_STYLES.frio)}>{item.name}</span>
                                                    <span className="text-lg font-bold tracking-tight text-foreground">{item.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </Surface>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-2">
                                    <Surface className="p-6">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Resposta por passo</p>
                                        <div className="mt-6 h-[250px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartSteps}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, color: '#fff' }} />
                                                    <Bar dataKey="Enviados" fill="#F97316" radius={[8, 8, 0, 0]} />
                                                    <Bar dataKey="Respondidos" fill="#10B981" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Surface>
                                    <Surface className="p-6">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Leitura por sequencia</p>
                                        <div className="mt-6 space-y-3">
                                            {(dashData.sequencePerformance || []).slice(0, 5).map((item) => (
                                                <div key={item.name} className="rounded-[24px] border border-black/[0.06] bg-[#F8F8FA] p-4 dark:border-white/[0.08] dark:bg-[#111214]">
                                                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">{item.queued} leads · {item.replied} respostas · {item.conversions} conversoes</p>
                                                </div>
                                            ))}
                                        </div>
                                    </Surface>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <Surface className="p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Governanca do motor</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Controle do follow-up automatico</h2>
                            {loadingSettings ? (
                                <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin text-primary" />Carregando configuracoes...</div>
                            ) : (
                                <>
                                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                                        <div className="rounded-[28px] border border-black/[0.06] bg-[#F8F8FA] p-5 dark:border-white/[0.08] dark:bg-[#111214]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Engine automatica</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">Liga ou pausa o disparo automatico.</p>
                                                </div>
                                                <button type="button" onClick={() => setSettings((current) => ({ ...current, enabled: !current.enabled }))} className={cn('relative h-7 w-12 rounded-full', settings.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700')}>
                                                    <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', settings.enabled ? 'translate-x-6' : 'translate-x-1')} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="rounded-[28px] border border-black/[0.06] bg-[#F8F8FA] p-5 dark:border-white/[0.08] dark:bg-[#111214]">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Modo IA global</p>
                                                    <p className="mt-1 text-xs text-muted-foreground">Mantem o texto mais contextual.</p>
                                                </div>
                                                <button type="button" onClick={() => setSettings((current) => ({ ...current, ai_mode_enabled: !current.ai_mode_enabled }))} className={cn('relative h-7 w-12 rounded-full', settings.ai_mode_enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700')}>
                                                    <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', settings.ai_mode_enabled ? 'translate-x-6' : 'translate-x-1')} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 rounded-[28px] border border-black/[0.06] bg-[#F8F8FA] p-5 dark:border-white/[0.08] dark:bg-[#111214]">
                                        <p className="text-sm font-semibold text-foreground">Limite por lead</p>
                                        <input type="number" min={1} max={20} value={settings.max_followups_per_lead} onChange={(event) => setSettings((current) => ({ ...current, max_followups_per_lead: Number(event.target.value) || 4 }))} className="mt-3 w-full max-w-[220px] rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                                        {[
                                            { key: 'quente_delay_minutes' as const, label: 'Lead quente' },
                                            { key: 'morno_delay_minutes' as const, label: 'Lead morno' },
                                            { key: 'frio_delay_minutes' as const, label: 'Lead frio' },
                                        ].map((item) => (
                                            <div key={item.key} className="rounded-[28px] border border-black/[0.06] bg-[#F8F8FA] p-5 dark:border-white/[0.08] dark:bg-[#111214]">
                                                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                                                <input type="number" min={5} value={settings[item.key]} onChange={(event) => setSettings((current) => ({ ...current, [item.key]: Number(event.target.value) || 60 }))} className="mt-3 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                                <p className="mt-2 text-xs text-muted-foreground">{formatDelay(settings[item.key])}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-5">
                                        <button onClick={saveSettings} disabled={savingSettings} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 py-3 text-sm font-semibold text-white" type="button">
                                            {savingSettings ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                            Salvar configuracoes
                                        </button>
                                    </div>
                                </>
                            )}
                        </Surface>

                        <Surface className="p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Playbook</p>
                            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Boas praticas</h2>
                            <div className="mt-5 space-y-3">
                                {[
                                    { icon: Lightbulb, title: 'CTA unica por passo', copy: 'Cada mensagem deve empurrar o lead para uma unica acao clara.' },
                                    { icon: Clock, title: 'Delay acompanha a temperatura', copy: 'Lead quente pede velocidade. Lead frio precisa de mais espaco.' },
                                    { icon: Users, title: 'Humano assume com contexto', copy: 'CRM e Live Chat precisam exibir resumo, temperatura e proxima acao.' },
                                ].map((item) => (
                                    <div key={item.title} className="rounded-[24px] border border-black/[0.06] bg-[#F8F8FA] p-4 dark:border-white/[0.08] dark:bg-[#111214]">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-2xl border border-primary/15 bg-primary/[0.08] p-2 text-primary"><item.icon size={16} /></div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.copy}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Surface>
                    </div>
                )}
            </div>
        </div>
    );
}
