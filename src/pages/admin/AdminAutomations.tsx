import { useState, useEffect, useCallback } from 'react';
import {
    Bell, Plus, Play, Trash2, Send,
    CheckCircle, XCircle, X, Loader2, Mail,
    MessageSquare, Monitor, Zap, History, Settings2,
    ToggleLeft, ToggleRight, Tag, Smartphone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface WaInstance {
    instance_name: string;
    agent_name: string | null;
    status: string;
}
interface Automation {
    id: string;
    name: string;
    trigger_event: string;
    trigger_rule: Record<string, any>;
    audience_type: 'all' | 'filtered' | 'specific';
    audience_filter: Record<string, any>;
    channels: string[];
    message_template: string;
    is_active: boolean;
    created_at: string;
}

interface AutoLog {
    id: string;
    automation_name: string;
    sent_at: string;
    recipients_count: number;
    channel: string;
    status: 'sent' | 'error';
    error?: string;
}

const TRIGGER_EVENTS = [
    { value: 'user_created', label: 'Usuário criado' },
    { value: 'onboarding_completed', label: 'Onboarding concluído' },
    { value: 'user_inactive', label: 'Usuário inativo há X dias' },
    { value: 'koins_low', label: 'Koins abaixo de X' },
    { value: 'koins_zero', label: 'Koins zerados' },
    { value: 'agent_created', label: 'IA criada' },
    { value: 'whatsapp_connected', label: 'IA conectada ao WhatsApp' },
    { value: 'ai_tested', label: 'Teste da IA realizado' },
    { value: 'manual', label: 'Disparo manual' },
];

const CHANNEL_OPTIONS = [
    { value: 'email', label: 'E-mail', icon: Mail },
    { value: 'internal', label: 'Notificação Interna', icon: Monitor },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
];

const TEMPLATE_VARS = ['{nome}', '{empresa}', '{koins}', '{email}', '{link_dashboard}', '{link_pagamento}'];

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ children, color = 'purple' }: { children: React.ReactNode; color?: string }) {
    const colors: Record<string, string> = {
        purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        green: 'bg-green-500/15 text-green-400 border-green-500/30',
        red: 'bg-red-500/15 text-red-400 border-red-500/30',
        amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    };
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${colors[color] || colors.purple}`}>
            {children}
        </span>
    );
}

function ChannelChip({ value }: { value: string }) {
    const opt = CHANNEL_OPTIONS.find(c => c.value === value);
    if (!opt) return null;
    const colors: Record<string, string> = { email: 'blue', whatsapp: 'green', internal: 'purple' };
    return <Badge color={colors[value] || 'purple'}>{opt.label}</Badge>;
}

// ── Main Component ────────────────────────────────────────────────────────────
export function AdminAutomations() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<'automations' | 'manual' | 'history'>('automations');
    const [automations, setAutomations] = useState<Automation[]>([]);
    const [logs, setLogs] = useState<AutoLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);
    const [editTarget, setEditTarget] = useState<Automation | null>(null);
    const [triggeringId, setTriggeringId] = useState<string | null>(null);
    const [triggerResult, setTriggerResult] = useState<{ id: string; sent: number; total: number } | null>(null);

    const apiHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    const fetchAutomations = useCallback(async () => {
        const r = await fetch('/api/admin/automations', { headers: apiHeaders() });
        if (r.ok) setAutomations(await r.json());
    }, [apiHeaders]);

    const fetchLogs = useCallback(async () => {
        const r = await fetch('/api/admin/automation-logs', { headers: apiHeaders() });
        if (r.ok) setLogs(await r.json());
    }, [apiHeaders]);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchAutomations(), fetchLogs()]).finally(() => setLoading(false));
    }, [fetchAutomations, fetchLogs]);

    const handleToggleActive = async (auto: Automation) => {
        await fetch(`/api/admin/automations/${auto.id}`, {
            method: 'PATCH',
            headers: apiHeaders(),
            body: JSON.stringify({ is_active: !auto.is_active }),
        });
        fetchAutomations();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deletar esta automação?')) return;
        await fetch(`/api/admin/automations/${id}`, { method: 'DELETE', headers: apiHeaders() });
        fetchAutomations();
    };

    const handleTrigger = async (auto: Automation) => {
        setTriggeringId(auto.id);
        setTriggerResult(null);
        const r = await fetch(`/api/admin/automations/${auto.id}/trigger`, { method: 'POST', headers: apiHeaders() });
        const d = await r.json();
        setTriggerResult({ id: auto.id, sent: d.sent, total: d.total });
        setTriggeringId(null);
        fetchLogs();
    };

    const openCreate = () => { setEditTarget(null); setShowDrawer(true); };
    const openEdit = (a: Automation) => { setEditTarget(a); setShowDrawer(true); };

    const triggerEventLabel = (v: string) => TRIGGER_EVENTS.find(t => t.value === v)?.label || v;

    return (
        <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card/50 border border-purple-500/20 p-5 rounded-2xl shadow-lg shadow-purple-500/5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-amber-400 to-purple-400 bg-clip-text text-transparent">
                            Automações &amp; Notificações
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">Comunique-se com seus usuários via WhatsApp, E-mail e Notificações</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Nova Automação
                </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-card border border-purple-500/20 rounded-xl p-1 w-fit">
                {([
                    { id: 'automations', label: 'Automações', icon: Zap },
                    { id: 'manual', label: 'Envio Manual', icon: Send },
                    { id: 'history', label: 'Histórico', icon: History },
                ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id
                            ? 'bg-gradient-to-r from-purple-600 to-amber-600 text-white shadow'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <>
                    {/* ── AUTOMATIONS TAB ── */}
                    {activeTab === 'automations' && (
                        <div className="space-y-3">
                            {automations.length === 0 && (
                                <div className="text-center py-16 text-muted-foreground border border-dashed border-purple-500/20 rounded-2xl">
                                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Nenhuma automação criada ainda</p>
                                    <p className="text-sm mt-1">Clique em "Nova Automação" para começar</p>
                                </div>
                            )}
                            {automations.map(auto => (
                                <div
                                    key={auto.id}
                                    className="bg-card border border-purple-500/15 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-purple-500/30 transition-all group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-semibold text-sm">{auto.name}</span>
                                            <Badge color={auto.is_active ? 'green' : 'amber'}>
                                                {auto.is_active ? 'Ativo' : 'Pausado'}
                                            </Badge>
                                            {auto.channels.map(c => <ChannelChip key={c} value={c} />)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Gatilho: <span className="text-purple-400">{triggerEventLabel(auto.trigger_event)}</span>
                                            {' · '}Audiência: <span className="text-amber-400">{auto.audience_type === 'all' ? 'Todos os usuários' : auto.audience_type === 'filtered' ? 'Filtro por tag' : 'Usuários específicos'}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {triggerResult?.id === auto.id && (
                                            <span className="text-xs text-green-400 font-mono">
                                                ✓ {triggerResult.sent}/{triggerResult.total} enviados
                                            </span>
                                        )}
                                        <button
                                            onClick={() => handleToggleActive(auto)}
                                            className="p-2 rounded-lg hover:bg-purple-500/10 transition-all"
                                            title={auto.is_active ? 'Pausar' : 'Ativar'}
                                        >
                                            {auto.is_active
                                                ? <ToggleRight className="w-5 h-5 text-green-400" />
                                                : <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => handleTrigger(auto)}
                                            disabled={triggeringId === auto.id}
                                            className="p-2 rounded-lg hover:bg-amber-500/10 hover:text-amber-400 transition-all text-muted-foreground"
                                            title="Disparar agora"
                                        >
                                            {triggeringId === auto.id
                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                : <Play className="w-4 h-4" />
                                            }
                                        </button>
                                        <button
                                            onClick={() => openEdit(auto)}
                                            className="p-2 rounded-lg hover:bg-purple-500/10 hover:text-purple-400 transition-all text-muted-foreground"
                                            title="Editar"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(auto.id)}
                                            className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-all text-muted-foreground"
                                            title="Excluir"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── MANUAL SEND TAB ── */}
                    {activeTab === 'manual' && (
                        <ManualSendPanel apiHeaders={apiHeaders} onSent={fetchLogs} />
                    )}

                    {/* ── HISTORY TAB ── */}
                    {activeTab === 'history' && (
                        <div className="bg-card border border-purple-500/20 rounded-xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-purple-500/20">
                                <h2 className="font-semibold text-sm">Histórico de Envios</h2>
                            </div>
                            {logs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground text-sm">Nenhum envio registrado ainda.</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                                            <tr>
                                                <th className="px-5 py-3">Automação</th>
                                                <th className="px-5 py-3">Data</th>
                                                <th className="px-5 py-3">Destinatários</th>
                                                <th className="px-5 py-3">Canal</th>
                                                <th className="px-5 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-purple-500/10">
                                            {logs.map(log => (
                                                <tr key={log.id} className="hover:bg-purple-500/5 transition-colors">
                                                    <td className="px-5 py-3 font-medium">{log.automation_name}</td>
                                                    <td className="px-5 py-3 text-muted-foreground">
                                                        {new Date(log.sent_at).toLocaleString('pt-BR')}
                                                    </td>
                                                    <td className="px-5 py-3 font-mono text-amber-400">{log.recipients_count}</td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {log.channel.split(',').map(c => <ChannelChip key={c} value={c} />)}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        {log.status === 'sent'
                                                            ? <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3.5 h-3.5" />Enviado</span>
                                                            : <span className="flex items-center gap-1 text-red-400" title={log.error}><XCircle className="w-3.5 h-3.5" />Erro</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Automation Create/Edit Drawer */}
            {showDrawer && (
                <AutomationDrawer
                    automation={editTarget}
                    apiHeaders={apiHeaders}
                    onClose={() => setShowDrawer(false)}
                    onSaved={() => { fetchAutomations(); setShowDrawer(false); }}
                />
            )}
        </div>
    );
}

// ── Automation Drawer (Create/Edit) ───────────────────────────────────────────
function AutomationDrawer({
    automation, apiHeaders, onClose, onSaved
}: {
    automation: Automation | null;
    apiHeaders: () => Record<string, string>;
    onClose: () => void;
    onSaved: () => void;
}) {
    const isEdit = !!automation;
    const [form, setForm] = useState({
        name: automation?.name ?? '',
        trigger_event: automation?.trigger_event ?? 'user_created',
        trigger_rule: automation?.trigger_rule ?? {},
        audience_type: (automation?.audience_type ?? 'all') as 'all' | 'filtered',
        audience_filter: automation?.audience_filter ?? {},
        channels: automation?.channels ?? ['internal'],
        message_template: automation?.message_template ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [tagInput, setTagInput] = useState('');

    const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
        setForm(f => ({ ...f, [k]: v }));

    const toggleCh = (ch: string) => {
        const cur = form.channels;
        set('channels', cur.includes(ch) ? cur.filter(c => c !== ch) : [...cur, ch]);
    };

    const insertVar = (v: string) => set('message_template', form.message_template + v);

    const addTag = () => {
        if (!tagInput.trim()) return;
        const tags: string[] = form.audience_filter.tags ?? [];
        set('audience_filter', { ...form.audience_filter, tags: [...tags, tagInput.trim().toLowerCase()] });
        setTagInput('');
    };

    const removeTag = (tag: string) => {
        const tags: string[] = form.audience_filter.tags ?? [];
        set('audience_filter', { ...form.audience_filter, tags: tags.filter(t => t !== tag) });
    };

    const handleSave = async () => {
        setError('');
        if (!form.name || !form.message_template) { setError('Nome e mensagem são obrigatórios.'); return; }
        if (!form.channels.length) { setError('Selecione pelo menos um canal.'); return; }
        setSaving(true);
        const url = isEdit ? `/api/admin/automations/${automation!.id}` : '/api/admin/automations';
        const method = isEdit ? 'PATCH' : 'POST';
        const r = await fetch(url, { method, headers: apiHeaders(), body: JSON.stringify(form) });
        const d = await r.json();
        setSaving(false);
        if (!r.ok) { setError(d.error ?? 'Erro ao salvar.'); return; }
        onSaved();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="h-full w-full max-w-xl bg-card border-l border-purple-500/20 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-purple-500/20 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="font-bold text-base">{isEdit ? 'Editar Automação' : 'Nova Automação'}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-purple-500/10 transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 p-6 space-y-6">
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            <XCircle className="w-4 h-4 shrink-0" />{error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Nome da automação *
                        </label>
                        <input
                            value={form.name}
                            onChange={e => set('name', e.target.value)}
                            placeholder="Ex: Boas-vindas novo usuário"
                            className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                    </div>

                    {/* Trigger */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Tipo de disparo *
                        </label>
                        <select
                            value={form.trigger_event}
                            onChange={e => set('trigger_event', e.target.value)}
                            className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                        >
                            {TRIGGER_EVENTS.map(t => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        {(form.trigger_event === 'koins_low' || form.trigger_event === 'koins_zero') && (
                            <input
                                type="number"
                                placeholder="Koins abaixo de..."
                                value={form.trigger_rule.koins_threshold ?? ''}
                                onChange={e => set('trigger_rule', { ...form.trigger_rule, koins_threshold: parseInt(e.target.value) })}
                                className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none mt-2"
                            />
                        )}
                        {form.trigger_event === 'user_inactive' && (
                            <input
                                type="number"
                                placeholder="Dias de inatividade"
                                value={form.trigger_rule.inactive_days ?? ''}
                                onChange={e => set('trigger_rule', { ...form.trigger_rule, inactive_days: parseInt(e.target.value) })}
                                className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none mt-2"
                            />
                        )}
                    </div>

                    {/* Audience */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Público
                        </label>
                        <div className="flex flex-col gap-2">
                            {(['all', 'filtered'] as const).map(type => (
                                <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="audience_type"
                                        checked={form.audience_type === type}
                                        onChange={() => set('audience_type', type)}
                                        className="accent-purple-500"
                                    />
                                    {type === 'all' ? 'Todos os usuários' : 'Filtrar por tag'}
                                </label>
                            ))}
                        </div>
                        {form.audience_type === 'filtered' && (
                            <div className="mt-3">
                                <div className="flex gap-2">
                                    <input
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        placeholder="Ex: trial, pagante, inativo"
                                        className="flex-1 bg-background border border-purple-500/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                                        onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
                                    />
                                    <button
                                        onClick={addTag}
                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
                                    >
                                        <Tag className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {((form.audience_filter.tags ?? []) as string[]).map(tag => (
                                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/15 text-purple-400 text-xs rounded-full">
                                            {tag}
                                            <button onClick={() => removeTag(tag)}>
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Channels */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Canais de envio *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CHANNEL_OPTIONS.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => toggleCh(value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${form.channels.includes(value)
                                        ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                                        : 'border-border text-muted-foreground hover:border-purple-500/40'
                                        }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />{label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Template */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Mensagem *
                        </label>
                        <textarea
                            value={form.message_template}
                            onChange={e => set('message_template', e.target.value)}
                            rows={6}
                            placeholder={`Olá {nome},\n\nSeus Koins estão acabando...\n\nRecarregue agora: {link_pagamento}`}
                            className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none resize-none"
                        />
                        <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] text-muted-foreground mr-1">Variáveis:</span>
                            {TEMPLATE_VARS.map(v => (
                                <button
                                    key={v}
                                    onClick={() => insertVar(v)}
                                    className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition font-mono"
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-card border-t border-purple-500/20 px-6 py-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm hover:bg-muted/50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-xl text-sm font-semibold hover:brightness-110 transition disabled:opacity-60"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEdit ? 'Salvar Alterações' : 'Criar Automação'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Manual Send Panel ─────────────────────────────────────────────────────────
function ManualSendPanel({
    apiHeaders, onSent
}: {
    apiHeaders: () => Record<string, string>;
    onSent: () => void;
}) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [channels, setChannels] = useState<string[]>(['internal']);
    const [audienceType, setAudienceType] = useState<'all' | 'filtered'>('all');
    const [tagFilter, setTagFilter] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sent: number; total: number } | null>(null);
    const [error, setError] = useState('');
    const [waInstances, setWaInstances] = useState<WaInstance[]>([]);
    const [waInstance, setWaInstance] = useState('');
    const [notifTitle, setNotifTitle] = useState('Mensagem da Kogna');

    useEffect(() => {
        fetch('/api/admin/whatsapp-instances', { headers: apiHeaders() })
            .then(r => r.ok ? r.json() : [])
            .then(setWaInstances)
            .catch(() => { });
    }, [apiHeaders]);

    const toggleCh = (ch: string) =>
        setChannels(cur => cur.includes(ch) ? cur.filter(c => c !== ch) : [...cur, ch]);

    const insertVar = (v: string) => setMessage(m => m + v);

    const handleSend = async () => {
        setError(''); setResult(null);
        if (!message.trim()) { setError('A mensagem não pode estar vazia.'); return; }
        if (!channels.length) { setError('Selecione pelo menos um canal.'); return; }
        if (channels.includes('whatsapp') && !waInstance) {
            setError('Selecione qual número WhatsApp usar para o envio.'); return;
        }
        const target = audienceType === 'all' ? 'todos os usuários' : `usuários com tag "${tagFilter}"`;
        if (!confirm(`Confirmar envio para ${target}?`)) return;
        setSending(true);
        const body: Record<string, unknown> = {
            message, subject, channels, audience_type: audienceType,
            notification_title: notifTitle || 'Mensagem da Kogna',
        };
        if (audienceType === 'filtered' && tagFilter.trim()) {
            body.filter_tags = tagFilter.split(',').map(t => t.trim()).filter(Boolean);
        }
        if (channels.includes('whatsapp') && waInstance) {
            body.wa_instance = waInstance;
        }
        const r = await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: apiHeaders(),
            body: JSON.stringify(body),
        });
        const d = await r.json();
        setSending(false);
        if (!r.ok) { setError(d.error ?? 'Erro ao enviar.'); return; }
        setResult({ sent: d.sent, total: d.total });
        onSent();
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="bg-card border border-purple-500/20 rounded-2xl p-6 space-y-5">
                <h2 className="font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-purple-400" />
                    Enviar Notificação Manual
                </h2>

                {result && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        {result.sent} mensagem(s) enviada(s) com sucesso!
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        <XCircle className="w-4 h-4 shrink-0" />{error}
                    </div>
                )}

                {/* Audience */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                        Público
                    </label>
                    <div className="flex gap-4 text-sm">
                        {(['all', 'filtered'] as const).map(type => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="manual_aud"
                                    checked={audienceType === type}
                                    onChange={() => setAudienceType(type)}
                                    className="accent-purple-500"
                                />
                                {type === 'all' ? 'Todos os usuários' : 'Filtrar por tag'}
                            </label>
                        ))}
                    </div>
                    {audienceType === 'filtered' && (
                        <input
                            value={tagFilter}
                            onChange={e => setTagFilter(e.target.value)}
                            placeholder="Tags separadas por vírgula: trial, inativo"
                            className="mt-3 w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                    )}
                </div>

                {/* Channels */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                        Canais
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {CHANNEL_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => toggleCh(value)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${channels.includes(value)
                                    ? 'border-purple-500 bg-purple-500/15 text-purple-400'
                                    : 'border-border text-muted-foreground hover:border-purple-500/40'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />{label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* WhatsApp instance selector */}
                {channels.includes('whatsapp') && (
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5" />
                            Número WhatsApp para envio *
                        </label>
                        {waInstances.length === 0 ? (
                            <p className="text-sm text-amber-400/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2.5">
                                Nenhum número WhatsApp conectado encontrado. Conecte um número em <strong>/whatsapp</strong>.
                            </p>
                        ) : (
                            <select
                                value={waInstance}
                                onChange={e => setWaInstance(e.target.value)}
                                className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                            >
                                <option value="">Selecione um número...</option>
                                {waInstances.map(wi => (
                                    <option key={wi.instance_name} value={wi.instance_name}>
                                        {wi.instance_name}{wi.agent_name ? ` — ${wi.agent_name}` : ''} ({wi.status})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Subject (email only) */}
                {channels.includes('email') && (
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Assunto do E-mail
                        </label>
                        <input
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Ex: Atualização importante da Kogna"
                            className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                    </div>
                )}

                {/* Notification Title (internal only) */}
                {channels.includes('internal') && (
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                            Título da Notificação Interna
                        </label>
                        <input
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                            placeholder="Ex: Novidade importante!"
                            className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none"
                        />
                    </div>
                )}

                {/* Message */}
                <div>
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 block">
                        Mensagem *
                    </label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        rows={5}
                        placeholder="Olá {nome}, temos uma novidade para você..."
                        className="w-full bg-background border border-purple-500/20 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/40 outline-none resize-none"
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Variáveis:</span>
                        {TEMPLATE_VARS.map(v => (
                            <button
                                key={v}
                                onClick={() => insertVar(v)}
                                className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded hover:bg-purple-500/20 transition font-mono"
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-amber-600 text-white rounded-xl font-semibold hover:brightness-110 transition disabled:opacity-60"
                >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sending ? 'Enviando...' : 'Enviar Notificação'}
                </button>
            </div>
        </div>
    );
}
