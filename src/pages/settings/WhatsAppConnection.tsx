import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Copy,
    Loader2,
    Plus,
    QrCode,
    RefreshCw,
    Search,
    Smartphone,
    Sparkles,
    Trash2,
    Wifi,
    WifiOff,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { isConstrutoraUser } from '../../lib/portalAccess';

const API_URL = '/api';

type ConnectionStatus = 'checking' | 'idle' | 'connecting' | 'qrcode' | 'connected' | 'error';

interface WhatsAppInstance {
    id: string;
    instance_name: string;
    status: string;
    created_at: string;
    connected_agent_id?: string | null;
    connected_agent_name?: string | null;
}

function isInstanceConnected(status?: string) {
    const normalized = (status || '').toLowerCase();
    return normalized === 'connected' || normalized === 'open';
}

function getInstanceLabel(instanceName: string) {
    if (!instanceName) return 'Conexao sem nome';
    return instanceName.includes('_')
        ? instanceName.split('_').slice(1).join(' ') || instanceName
        : instanceName;
}

function formatConnectionDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Agora';

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function HeaderStat({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-2xl border border-black/[0.05] bg-white/[0.68] px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] backdrop-blur dark:border-border/70 dark:bg-background/80">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">{value}</p>
        </div>
    );
}

function StatusBadge({ connected }: { connected: boolean }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                connected
                    ? 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
                    : 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200'
            )}
        >
            <span className={cn('h-1.5 w-1.5 rounded-full', connected ? 'bg-emerald-500' : 'bg-rose-500')} />
            {connected ? 'Online' : 'Offline'}
        </span>
    );
}

const whatsappAudience = [
    'Linhas organizadas por operacao',
    'Roteamento para agentes',
    'WhatsApp como apoio estrategico',
];

const whatsappSpotlight = [
    'Cada linha ganha contexto, status e papel claro dentro do ecossistema.',
    'A operacao sai do improviso e entra em uma central proprietaria da HUB.',
    'Conexoes, QR code e uso por agentes ficam visiveis em um unico painel.',
];

export function WhatsAppConnection() {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedInstanceId, setCopiedInstanceId] = useState<string | null>(null);

    const [showNewConnectionModal, setShowNewConnectionModal] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const [newLabel, setNewLabel] = useState('');
    const [connectStatus, setConnectStatus] = useState<ConnectionStatus>('idle');
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [connectError, setConnectError] = useState<string | null>(null);
    const [timer, setTimer] = useState(60);

    const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const connectionLimit = user?.organization?.whatsapp_connections_limit || 1;

    useEffect(() => {
        fetchInstances({ showLoader: true });
        return () => {
            stopPolling();
            if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
        };
    }, [user?.email]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (connectStatus === 'qrcode' && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (connectStatus === 'qrcode' && timer === 0) {
            handleCreateConnection(true);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [connectStatus, timer]);

    const stopPolling = () => {
        if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
        }
    };

    const resetConnectionFlow = ({ keepLabel = false }: { keepLabel?: boolean } = {}) => {
        stopPolling();
        setConnectStatus('idle');
        setConnectError(null);
        setQrCode(null);
        setTimer(60);
        if (!keepLabel) {
            setNewLabel('');
        }
    };

    const closeNewConnectionModal = () => {
        setShowNewConnectionModal(false);
        resetConnectionFlow();
    };

    const fetchInstances = async ({
        showLoader = false,
        showRefreshing = false,
    }: {
        showLoader?: boolean;
        showRefreshing?: boolean;
    } = {}) => {
        if (!user) {
            setLoading(false);
            return;
        }

        if (showLoader) setLoading(true);
        if (showRefreshing) setRefreshing(true);

        try {
            const res = await fetch(`${API_URL}/instances`, {
                headers: { Authorization: `Bearer ${token || ''}` },
            });

            if (res.ok) {
                const data = await res.json();
                setInstances(data);
            }
        } catch (err) {
            console.error('Error fetching instances:', err);
        } finally {
            if (showLoader) setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    };

    const openNewConnectionModal = () => {
        if (instances.length >= connectionLimit) {
            setShowLimitModal(true);
            return;
        }

        setShowNewConnectionModal(true);
        resetConnectionFlow();
    };

    const handleCreateConnection = async (isRefresh = false) => {
        if (!user?.email) return;

        if (!isRefresh) {
            setConnectStatus('connecting');
            setConnectError(null);
            setTimer(60);
        }

        try {
            const res = await fetch(`${API_URL}/whatsapp/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token || ''}`,
                },
                body: JSON.stringify({
                    email: user.email,
                    instanceLabel: newLabel,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (data.upgradeRequired) {
                    setShowLimitModal(true);
                    throw new Error('Limite de conexoes atingido. Faca upgrade do plano.');
                }
                throw new Error(data.error || 'Erro ao conectar');
            }

            if (isInstanceConnected(data.instance?.status)) {
                setConnectStatus('connected');
                stopPolling();
                await fetchInstances();
                setTimeout(() => {
                    closeNewConnectionModal();
                }, 1800);
                return;
            }

            if (data.qrCode) {
                setQrCode(data.qrCode);
                setTimer(60);
                setConnectStatus('qrcode');
                if (data.instance?.instance_name) {
                    startPolling(data.instance.instance_name);
                }
                return;
            }

            if (!isRefresh) {
                setConnectError('Nao foi possivel obter o QR code. Tente novamente.');
                setConnectStatus('error');
            }
        } catch (err) {
            console.error('Connect error:', err);
            if (!isRefresh) {
                setConnectError(err instanceof Error ? err.message : 'Erro ao gerar acesso');
                setConnectStatus('error');
            }
        }
    };

    const startPolling = (instanceName: string) => {
        stopPolling();

        pollInterval.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/instances`, {
                    headers: { Authorization: `Bearer ${token || ''}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    const target = data.find((instance: WhatsAppInstance) => instance.instance_name === instanceName);

                    if (target && isInstanceConnected(target.status)) {
                        setInstances(data);
                        setConnectStatus('connected');
                        setQrCode(null);
                        stopPolling();
                        setTimeout(() => {
                            closeNewConnectionModal();
                        }, 1800);
                    }
                }
            } catch {
                // ignore polling noise
            }
        }, 3000);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Tem certeza que deseja desconectar ${name}?`)) return;

        try {
            const res = await fetch(`${API_URL}/instance/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token || ''}` },
            });

            if (!res.ok) {
                throw new Error('Erro ao desconectar');
            }

            fetchInstances();
        } catch (err) {
            console.error('Delete error:', err);
            window.alert('Erro ao desconectar');
        }
    };

    const handleReconnect = (instanceName: string) => {
        setShowNewConnectionModal(true);
        setNewLabel(getInstanceLabel(instanceName));
        resetConnectionFlow({ keepLabel: true });
    };

    const handleCopyId = async (instance: WhatsAppInstance) => {
        try {
            await navigator.clipboard.writeText(instance.instance_name);
            setCopiedInstanceId(instance.id);

            if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
            copiedTimeout.current = setTimeout(() => {
                setCopiedInstanceId(null);
            }, 1600);
        } catch (err) {
            console.error('Copy error:', err);
            window.alert('Nao foi possivel copiar o ID desta conexao.');
        }
    };

    const onlineCount = instances.filter((instance) => isInstanceConnected(instance.status)).length;
    const offlineCount = instances.length - onlineCount;
    const availableSlots = Math.max(connectionLimit - instances.length, 0);

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredInstances = instances.filter((instance) => {
        if (!normalizedQuery) return true;

        const searchBase = [
            getInstanceLabel(instance.instance_name),
            instance.instance_name,
            instance.connected_agent_name || '',
            isInstanceConnected(instance.status) ? 'online conectado whatsapp' : 'offline desconectado reconectar',
        ]
            .join(' ')
            .toLowerCase();

        return searchBase.includes(normalizedQuery);
    });

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="flex w-full max-w-sm flex-col items-center rounded-[28px] border border-black/[0.06] bg-white/80 px-6 py-10 text-center shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-border/70 dark:bg-surface/92 dark:shadow-[0_24px_80px_rgba(4,19,31,0.24)]">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(15,123,140,0.28)]">
                        <Loader2 size={28} className="animate-spin" />
                    </div>
                    <h2 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                        Carregando canais
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-text-secondary">
                        Estamos preparando suas conexoes de WhatsApp para a operacao.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.18),_transparent_34%),linear-gradient(135deg,rgba(6,30,45,0.98),rgba(9,52,74,0.96))] p-8 text-white shadow-[0_24px_70px_rgba(8,23,38,0.22)] sm:p-10" data-tour-id="tour-whatsapp-main">
                    <div className="absolute right-[-8%] top-[-12%] h-56 w-56 rounded-full bg-[#6EE7D8]/15 blur-3xl" />
                    <div className="absolute bottom-[-10%] left-[18%] h-44 w-44 rounded-full bg-[#F8B46A]/18 blur-3xl" />

                    <div className="relative grid gap-7 lg:grid-cols-[1.3fr_0.9fr]">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#A4E8E1] backdrop-blur">
                                <Sparkles size={16} />
                                Canais de comunicacao
                            </div>
                            <h1 className="mt-6 text-4xl font-display leading-tight text-white sm:text-5xl">Conexoes WhatsApp</h1>
                            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/[0.76] sm:text-base">
                                Centralize numeros, acompanhe o status das linhas e conecte novos canais para suas IAs operarem com mais clareza e governanca.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-2">
                                {whatsappAudience.map((item) => (
                                    <span
                                        key={item}
                                        className="rounded-full border border-white/14 bg-white/[0.08] px-4 py-2 text-xs font-semibold text-white/[0.85]"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/12 bg-white/[0.08] p-6 backdrop-blur">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9BE8E0]">Promessa do modulo</p>
                            <div className="mt-5 space-y-4">
                                {whatsappSpotlight.map((item) => (
                                    <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-black/10 p-4">
                                        <CheckCircle2 size={18} className="mt-0.5 text-[#7EE7DA]" />
                                        <p className="text-sm leading-6 text-white/[0.78]">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 rounded-[30px] border border-border/70 bg-surface/92 p-7 shadow-[0_20px_45px_rgba(8,23,38,0.06)]">
                    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Controle de canais</p>
                            <h2 className="mt-2 text-3xl font-display text-text-primary">Busca, conexao e monitoramento das linhas</h2>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
                                Acompanhe o estado das linhas, gere novos QR codes e encaminhe cada canal para a IA certa dentro da operacao.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
                                <div className="relative flex-1">
                                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                    <input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Buscar por nome, ID ou status"
                                        className="h-12 w-full rounded-2xl border border-black/[0.07] bg-white/80 pl-11 pr-4 text-sm text-text-primary shadow-[0_8px_24px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 placeholder:text-text-muted focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-border/70 dark:bg-background/80 dark:focus:border-primary/40 dark:focus:ring-primary/10"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => fetchInstances({ showRefreshing: true })}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-border/70 dark:bg-background/80 dark:text-white dark:hover:border-primary/30 dark:hover:text-primary-light"
                                    >
                                        <RefreshCw size={16} className={cn(refreshing && 'animate-spin')} />
                                        Atualizar
                                    </button>

                                    <button
                                        onClick={openNewConnectionModal}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,123,140,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,123,140,0.4)] active:translate-y-0"
                                    >
                                        <Plus size={18} />
                                        Nova conexao
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    {onlineCount} online
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-rose-50 px-3 py-1 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    {offlineCount} offline
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1">
                                    <Smartphone size={14} className="text-primary" />
                                    {instances.length}/{connectionLimit} em uso no plano
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-4">
                            <HeaderStat label="Total de linhas" value={instances.length} />
                            <HeaderStat label="Online" value={onlineCount} />
                            <HeaderStat label="Offline" value={offlineCount} />
                            <HeaderStat label="Slots livres" value={availableSlots} />
                        </div>
                    </div>
                </section>

                <section className="mt-8">
                    {instances.length === 0 ? (
                        <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-border/70 dark:bg-surface/92 dark:shadow-[0_20px_60px_rgba(4,19,31,0.22)] sm:p-12">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(15,123,140,0.28)]">
                                <Smartphone size={34} />
                            </div>
                            <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                                Sua operacao no WhatsApp comeca aqui
                            </h3>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
                                Conecte seu primeiro numero para habilitar agentes, roteamentos e automacoes em uma central mais premium e clara.
                            </p>
                            <button
                                onClick={openNewConnectionModal}
                                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,123,140,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,123,140,0.4)]"
                            >
                                <Plus size={18} />
                                Conectar primeiro numero
                            </button>
                        </div>
                    ) : filteredInstances.length === 0 ? (
                        <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-border/70 dark:bg-surface/92 dark:shadow-[0_20px_60px_rgba(4,19,31,0.22)] sm:p-12">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary/10 text-primary dark:bg-primary/[0.12]">
                                <Search size={28} />
                            </div>
                            <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                                Nenhuma conexao encontrada
                            </h3>
                            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-text-secondary sm:text-base">
                                Ajuste a busca para localizar conexoes por nome, ID tecnico ou status da linha.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredInstances.map((instance) => {
                                const connected = isInstanceConnected(instance.status);
                                const label = getInstanceLabel(instance.instance_name);
                                const connectedAgentName = instance.connected_agent_name?.trim();

                                return (
                                    <article
                                        key={instance.id}
                                        className="group relative overflow-hidden rounded-[26px] border border-black/[0.06] bg-white/[0.9] p-4 shadow-[0_16px_42px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(15,23,42,0.12)] dark:border-border/70 dark:bg-surface/92 dark:shadow-[0_20px_60px_rgba(4,19,31,0.22)]"
                                    >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(37,211,102,0.08),_transparent_28%)] opacity-80 dark:bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(37,211,102,0.10),_transparent_30%)]" />

                                        <div className="relative flex h-full flex-col gap-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#25D366] via-[#1DB954] to-[#0EA75A] text-white shadow-[0_14px_30px_rgba(37,211,102,0.22)]">
                                                    <Smartphone size={22} />
                                                </div>
                                                <StatusBadge connected={connected} />
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                                                    Canal do WhatsApp
                                                </p>
                                                <h3 className="mt-2 truncate text-xl font-display font-bold tracking-tight text-text-primary">
                                                    {label}
                                                </h3>
                                                <p
                                                    className="mt-1.5 truncate font-mono text-[11px] text-text-muted"
                                                    title={instance.instance_name}
                                                >
                                                    ID tecnico: {instance.instance_name}
                                                </p>
                                            </div>

                                            <div className="rounded-[22px] border border-black/[0.06] bg-white/70 p-3 dark:border-border/70 dark:bg-background/80">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                                    Operacao
                                                </p>
                                                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                                    <div className="rounded-2xl border border-black/[0.06] bg-background/80 px-3 py-2.5 dark:border-border/70 dark:bg-background/80">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                                                            Status da linha
                                                        </p>
                                                        <p className="mt-1.5 text-sm font-semibold text-text-primary">
                                                            {connected ? 'Conectada e pronta' : 'Precisa reconectar'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-2xl border border-black/[0.06] bg-background/80 px-3 py-2.5 dark:border-border/70 dark:bg-background/80">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                                                            Criada em
                                                        </p>
                                                        <p className="mt-1.5 text-sm font-semibold text-text-primary">
                                                            {formatConnectionDate(instance.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 rounded-2xl border border-black/[0.06] bg-background/80 px-3 py-2.5 dark:border-border/70 dark:bg-background/80">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                                                        IA conectada
                                                    </p>
                                                    <p className="mt-1.5 text-sm font-semibold text-text-primary">
                                                        {connectedAgentName || 'Nenhuma IA vinculada'}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-text-secondary">
                                                        {connectedAgentName
                                                            ? 'Esse numero ja esta roteando conversas para esta IA.'
                                                            : 'Conecte esta linha em Minhas IAs para comecar a operar com um agente.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                    {connected ? (
                                                        <Wifi size={16} className="text-emerald-500" />
                                                    ) : (
                                                        <WifiOff size={16} className="text-rose-500" />
                                                    )}
                                                    {connected
                                                        ? 'Pronta para ser usada nas IAs e fluxos da operacao.'
                                                        : 'Gere um novo QR code para colocar esta conexao de volta em operacao.'}
                                                </div>

                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <button
                                                        onClick={() => (connected ? navigate('/brain') : handleReconnect(instance.instance_name))}
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,123,140,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(15,123,140,0.34)]"
                                                    >
                                                        {connected ? <ArrowRight size={16} /> : <QrCode size={16} />}
                                                        {connected ? 'Usar nas IAs' : 'Gerar novo QR'}
                                                    </button>

                                                    <button
                                                        onClick={() => handleCopyId(instance)}
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-border/70 dark:bg-background/80 dark:text-white dark:hover:border-primary/30 dark:hover:text-primary-light"
                                                    >
                                                        <Copy size={16} />
                                                        {copiedInstanceId === instance.id ? 'ID copiado' : 'Copiar ID'}
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleDelete(instance.id, label)}
                                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-red-200/80 bg-red-50 px-4 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-500/30"
                                                >
                                                    <Trash2 size={16} />
                                                    Desconectar
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
            {showLimitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] dark:border-border/70 dark:bg-surface/95 dark:shadow-[0_24px_90px_rgba(4,19,31,0.30)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.12),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.16),_transparent_38%)]" />

                        <div className="relative p-6 sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-red-500/10 text-red-500 dark:bg-red-500/12">
                                        <AlertCircle size={26} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                            Limite do plano
                                        </p>
                                        <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-text-primary">
                                            Limite de conexoes atingido
                                        </h2>
                                        <p className="mt-2 text-sm leading-7 text-text-secondary">
                                            Voce ja esta usando todas as linhas disponiveis no plano atual. Faca upgrade para adicionar mais numeros ao seu painel.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowLimitModal(false)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.07] bg-white/75 text-text-secondary transition-colors hover:text-text-primary dark:border-border/70 dark:bg-background/80 dark:hover:text-white"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-6 rounded-[24px] border border-black/[0.06] bg-white/75 p-5 dark:border-border/70 dark:bg-background/80">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                            Uso atual
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-text-primary">
                                            {instances.length}/{connectionLimit} conexoes em uso
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-primary/15 bg-primary/10 px-4 py-3 text-right dark:border-primary/20 dark:bg-primary/[0.12]">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                                            Conexao extra
                                        </p>
                                        <p className="mt-1 text-lg font-semibold text-text-primary">
                                            R$ 9,90<span className="text-sm font-normal text-text-muted">/mes</span>
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-7 text-text-secondary">
                                    A cobranca e recorrente enquanto a linha adicional estiver ativa no painel.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    onClick={() => setShowLimitModal(false)}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.07] px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:border-border/70 dark:hover:bg-background/80 dark:hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => navigate('/billing')}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,123,140,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,123,140,0.4)]"
                                >
                                    Ir para faturamento
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showNewConnectionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-3xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] dark:border-border/70 dark:bg-surface/95 dark:shadow-[0_24px_90px_rgba(4,19,31,0.30)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.14),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(26,160,164,0.18),_transparent_38%)]" />

                        <div className="relative border-b border-black/[0.06] px-6 py-5 dark:border-border/70">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-primary text-white shadow-[0_16px_34px_rgba(15,123,140,0.28)]">
                                        <Smartphone size={24} />
                                    </div>
                                    <div className="min-w-0 pt-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                            Novo canal
                                        </p>
                                        <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-text-primary sm:text-[30px]">
                                            Nova conexao
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                                            Conecte um numero para operar agentes, automacoes e vendas no WhatsApp com mais controle.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={closeNewConnectionModal}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-text-muted transition-colors hover:border-black/[0.07] hover:bg-black/[0.03] hover:text-text-primary dark:hover:border-border/70 dark:hover:bg-background/80 dark:hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="relative max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-6">
                            {connectError && (
                                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <div>{connectError}</div>
                                </div>
                            )}

                            {(connectStatus === 'idle' || connectStatus === 'error') && (
                                <div className="space-y-5">
                                    <section className="rounded-[28px] border border-black/[0.06] bg-white/[0.88] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-border/70 dark:bg-background/80 dark:shadow-none sm:p-6">
                                        <div className="mb-5">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                Identificacao
                                            </p>
                                            <h3 className="mt-2 text-lg font-display font-bold tracking-tight text-text-primary">
                                                Configure a nova linha
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-text-secondary">
                                                Use um nome para localizar esta conexao no painel e vincular o numero certo aos seus agentes.
                                            </p>
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-text-primary">
                                                Nome da identificacao
                                                <span className="ml-2 text-xs font-medium text-text-muted">opcional</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Vendas, Suporte, Loja 01"
                                                value={newLabel}
                                                onChange={(event) => setNewLabel(event.target.value)}
                                                className="h-12 w-full rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-text-primary outline-none transition-all placeholder:text-text-muted focus:border-primary/35 focus:ring-4 focus:ring-primary/10 dark:border-border/70 dark:bg-background/80"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-black/[0.06] bg-background/80 px-4 py-3 dark:border-border/70 dark:bg-background/80">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                                                    Uso atual
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-text-primary">
                                                    {instances.length}/{connectionLimit} conexoes ativas
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-black/[0.06] bg-background/80 px-4 py-3 dark:border-border/70 dark:bg-background/80">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
                                                    Proximo passo
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-text-primary">
                                                    Gerar QR code e escanear no celular
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleCreateConnection()}
                                            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,123,140,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,123,140,0.4)]"
                                        >
                                            <QrCode size={18} />
                                            Gerar QR code
                                        </button>
                                    </section>
                                </div>
                            )}

                            {connectStatus === 'connecting' && (
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-black/[0.06] bg-white/[0.85] px-6 py-12 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-border/70 dark:bg-background/80">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(15,123,140,0.28)]">
                                        <Loader2 size={28} className="animate-spin" />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                                        Preparando a conexao
                                    </h3>
                                    <p className="mt-2 max-w-md text-sm leading-7 text-text-secondary">
                                        Estamos iniciando a instancia e preparando o QR code para o novo numero.
                                    </p>
                                </div>
                            )}

                            {connectStatus === 'qrcode' && qrCode && (
                                <div className="grid gap-5 lg:grid-cols-[300px,1fr]">
                                    <section className="rounded-[28px] border border-black/[0.06] bg-white/[0.9] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-border/70 dark:bg-background/80">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                    QR code
                                                </p>
                                                <h3 className="mt-2 text-lg font-display font-bold tracking-tight text-text-primary">
                                                    Escaneie no celular
                                                </h3>
                                            </div>
                                            <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary dark:border-primary/20 dark:bg-primary/[0.12]">
                                                {timer}s
                                            </span>
                                        </div>

                                        <div className="mt-5 overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-border/70">
                                            <img src={qrCode} alt="QR Code" className="h-full w-full object-contain" />
                                        </div>

                                        <button
                                            onClick={() => handleCreateConnection(true)}
                                            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-border/70 dark:bg-surface/92 dark:text-white dark:hover:border-primary/30 dark:hover:text-primary-light"
                                        >
                                            <RefreshCw size={16} />
                                            Gerar novo QR agora
                                        </button>
                                    </section>

                                    <div className="space-y-5">
                                        <section className="rounded-[28px] border border-black/[0.06] bg-white/[0.9] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-border/70 dark:bg-background/80">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                Passo a passo
                                            </p>
                                            <h3 className="mt-2 text-lg font-display font-bold tracking-tight text-text-primary">
                                                Conecte seu aparelho
                                            </h3>

                                            <div className="mt-5 space-y-3">
                                                {[
                                                    'Abra o WhatsApp no celular que sera usado pela operacao.',
                                                    'Entre em Aparelhos conectados e escolha Conectar um aparelho.',
                                                    'Aponte a camera para o QR code e aguarde a confirmacao da linha.',
                                                ].map((step, index) => (
                                                    <div
                                                        key={step}
                                                        className="flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-background/80 px-4 py-3 dark:border-border/70 dark:bg-surface/92"
                                                    >
                                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                                            {index + 1}
                                                        </span>
                                                        <p className="text-sm leading-6 text-text-secondary">{step}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>

                                        <section className="rounded-[28px] border border-emerald-200/80 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                                                    <Loader2 size={18} className="animate-spin" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                                                        Aguardando confirmacao
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-emerald-700/80 dark:text-emerald-100/80">
                                                        Assim que o numero for conectado, a linha aparecera pronta para uso no painel.
                                                    </p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            )}

                            {connectStatus === 'connected' && (
                                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-emerald-200/80 bg-emerald-50 px-6 py-12 text-center dark:border-emerald-500/20 dark:bg-emerald-500/10">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-300">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                                        Conexao pronta
                                    </h3>
                                    <p className="mt-2 max-w-md text-sm leading-7 text-text-secondary">
                                        Sua nova linha foi configurada com sucesso e ja pode ser usada pelos agentes da operacao.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="relative flex justify-end border-t border-black/[0.06] px-6 py-4 dark:border-border/70">
                            <button
                                onClick={closeNewConnectionModal}
                                className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/[0.07] px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:border-border/70 dark:hover:bg-background/80 dark:hover:text-white"
                            >
                                {connectStatus === 'connected' ? 'Fechar' : 'Cancelar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
