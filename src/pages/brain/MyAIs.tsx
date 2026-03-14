import { useEffect, useState } from 'react';
import {
    Activity,
    ArrowRight,
    Bot,
    BrainCircuit,
    Building2,
    ChevronLeft,
    Cpu,
    Loader2,
    MessageCircle,
    MoreVertical,
    Pause,
    Play,
    Plus,
    Search,
    Settings2,
    Smartphone,
    Sparkles,
    Wand2,
    X,
    type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import AgentEditModal from '../../components/agents/AgentEditModal';
import { agentTemplates } from '../../data/agentTemplates';
import { getProfileBySlug } from '../../data/industryProfiles';

interface Agent {
    id: string;
    type: string;
    name: string;
    status: 'active' | 'inactive' | 'paused';
    created_at: string;
    whatsapp_instance_name?: string;
    whatsapp_instance_status?: string;
}

interface CompanyData {
    companyName: string;
    companyProduct: string;
    targetAudience: string;
    voiceTone: string;
    unknownBehavior: string;
    restrictions: string;
    agentName: string;
    revenueGoal: string;
    agentObjective: string;
    productPrice: string;
}

type AgentStatus = Agent['status'];

const typeConfig: Record<string, {
    label: string;
    eyebrow: string;
    description: string;
    icon: LucideIcon;
    iconWrap: string;
    badge: string;
    gradient: string;
    accent: string;
}> = {
    sdr: {
        label: 'SDR',
        eyebrow: 'Prospeccao',
        description: 'Qualifica leads, conduz conversas e acelera oportunidades com foco em conversao.',
        icon: Sparkles,
        iconWrap: 'bg-orange-500/[0.12] text-orange-600 dark:bg-orange-500/[0.15] dark:text-orange-300',
        badge: 'border-orange-200/80 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200',
        gradient: 'from-[#FF7A1A] via-[#FF5B22] to-[#F24E1E]',
        accent: 'shadow-[0_18px_40px_rgba(255,104,31,0.26)]',
    },
    vendedor: {
        label: 'Vendedor',
        eyebrow: 'Conversao',
        description: 'Apresenta valor, remove objecoes e conduz o lead ao fechamento com mais seguranca.',
        icon: Activity,
        iconWrap: 'bg-amber-500/[0.12] text-amber-600 dark:bg-amber-500/[0.15] dark:text-amber-300',
        badge: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
        gradient: 'from-[#F6B73C] via-[#F59E0B] to-[#D97706]',
        accent: 'shadow-[0_18px_40px_rgba(245,158,11,0.24)]',
    },
    suporte: {
        label: 'Suporte',
        eyebrow: 'Sucesso do cliente',
        description: 'Resolve duvidas com clareza, reduz atrito e sustenta uma experiencia mais confiavel.',
        icon: MessageCircle,
        iconWrap: 'bg-emerald-500/[0.12] text-emerald-600 dark:bg-emerald-500/[0.15] dark:text-emerald-300',
        badge: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
        gradient: 'from-[#34D399] via-[#10B981] to-[#059669]',
        accent: 'shadow-[0_18px_40px_rgba(16,185,129,0.22)]',
    },
    atendente: {
        label: 'Atendente',
        eyebrow: 'Operacao',
        description: 'Atende, direciona e organiza demandas com contexto para manter fluidez no atendimento.',
        icon: BrainCircuit,
        iconWrap: 'bg-sky-500/[0.12] text-sky-600 dark:bg-sky-500/[0.15] dark:text-sky-300',
        badge: 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
        gradient: 'from-[#38BDF8] via-[#2563EB] to-[#1D4ED8]',
        accent: 'shadow-[0_18px_40px_rgba(37,99,235,0.22)]',
    },
    custom: {
        label: 'Custom',
        eyebrow: 'Personalizado',
        description: 'IA configurada para uma rotina sob medida, com contexto adaptado ao seu processo.',
        icon: Settings2,
        iconWrap: 'bg-slate-500/[0.12] text-slate-700 dark:bg-slate-500/[0.15] dark:text-slate-200',
        badge: 'border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
        gradient: 'from-[#64748B] via-[#475569] to-[#334155]',
        accent: 'shadow-[0_18px_40px_rgba(71,85,105,0.22)]',
    },
};

const statusConfig: Record<AgentStatus, {
    label: string;
    badge: string;
    dot: string;
    copy: string;
}> = {
    active: {
        label: 'Ativo',
        badge: 'border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
        dot: 'bg-emerald-500',
        copy: 'Pronto para atender em tempo real.',
    },
    paused: {
        label: 'Pausado',
        badge: 'border-amber-200/80 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
        dot: 'bg-amber-500',
        copy: 'Pausado temporariamente, sem perder configuracoes.',
    },
    inactive: {
        label: 'Inativo',
        badge: 'border-rose-200/80 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200',
        dot: 'bg-rose-500',
        copy: 'Precisa ser revisado antes de operar novamente.',
    },
};

function getTypeMeta(type: string) {
    return typeConfig[type?.toLowerCase()] || typeConfig.custom;
}

function getAgentDescription(type: string) {
    const template = agentTemplates.find((item) => item.id === type?.toLowerCase());
    return template?.description || getTypeMeta(type).description;
}

function isWhatsAppConnected(status?: string) {
    const normalized = (status || '').toLowerCase();
    return normalized === 'connected' || normalized === 'open';
}

function getWhatsAppLabel(status?: string) {
    return isWhatsAppConnected(status) ? 'Conectado' : 'Desconectado';
}

function HeaderStat({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="rounded-2xl border border-black/[0.05] bg-white/[0.65] px-4 py-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] backdrop-blur dark:border-white/[0.06] dark:bg-white/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">{value}</p>
        </div>
    );
}

export function MyAIs() {
    const { user, token } = useAuth();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('sdr');
    const [isCreating, setIsCreating] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const [createStep, setCreateStep] = useState<'choose' | 'form'>('choose');
    const [createMode, setCreateMode] = useState<'scratch' | 'company' | null>(null);
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [isLoadingCompanyData, setIsLoadingCompanyData] = useState(false);
    const [hasCompanyData, setHasCompanyData] = useState<boolean | null>(null);

    const [industrySlug, setIndustrySlug] = useState<string | null>(null);
    const [installingAgentId, setInstallingAgentId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchAgents();
            fetch('/api/industry/my-profile', { headers: { Authorization: `Bearer ${token}` } })
                .then((response) => (response.ok ? response.json() : null))
                .then((data) => {
                    if (data?.industry_slug && data.industry_slug !== 'generico') {
                        setIndustrySlug(data.industry_slug);
                    }
                })
                .catch(() => { });
        }
    }, [user, token]);

    const fetchAgents = async () => {
        try {
            const res = await fetch('/api/agents', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const data = await res.json();
                setAgents(data);
            }
        } catch (error) {
            console.error('Failed to fetch agents', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTogglePause = async (agent: Agent) => {
        try {
            const res = await fetch(`/api/agents/${agent.id}/toggle-pause`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const data = await res.json();
                setAgents((prev) => prev.map((item) =>
                    item.id === agent.id ? { ...item, status: data.status } : item
                ));
            } else {
                alert('Erro ao alterar status da IA.');
            }
        } catch (error) {
            console.error('Toggle pause error:', error);
            alert('Erro de conexao.');
        } finally {
            setOpenMenuId(null);
        }
    };

    const handleDeleteAgent = async (agentId: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta IA? Esta acao nao pode ser desfeita.')) return;

        try {
            const res = await fetch(`/api/agents/${agentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                await fetchAgents();
            } else {
                let errorMsg = 'Erro desconhecido';
                try {
                    const errorData = await res.json();
                    errorMsg = errorData.error || errorData.details || errorMsg;
                } catch (error) {
                    errorMsg = `Status ${res.status}: ${res.statusText}`;
                }
                alert(`Erro ao excluir agente: ${errorMsg}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`Erro de conexao ao excluir: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setOpenMenuId(null);
        }
    };

    const handleInstallIndustryAgent = async (agent: { id: string; name: string; role: string; systemPrompt?: string }) => {
        setInstallingAgentId(agent.id);
        try {
            const res = await fetch('/api/agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    name: agent.name,
                    type: agent.role?.toLowerCase() || 'atendente',
                    system_prompt: agent.systemPrompt || `Voce e ${agent.name}.`,
                    model_config: {},
                }),
            });
            if (res.ok) {
                await fetchAgents();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setInstallingAgentId(null);
        }
    };

    const handleCreateAgent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            let systemPrompt = '';

            if (createMode === 'company' && companyData) {
                const objectiveText =
                    companyData.agentObjective === 'fechar_venda'
                        ? 'fechar vendas diretamente no WhatsApp'
                        : companyData.agentObjective === 'qualificar_agendar'
                            ? 'qualificar leads e agendar reunioes'
                            : 'aquecer o lead e transferir para um vendedor humano';

                const unknownText =
                    companyData.unknownBehavior === 'transferir_humano'
                        ? 'Transfira imediatamente para um humano.'
                        : companyData.unknownBehavior === 'pedir_contato'
                            ? 'Peca o contato para retorno em breve.'
                            : companyData.unknownBehavior || 'Informe que vai verificar e retornar.';

                systemPrompt = `Voce e ${companyData.agentName || newName}, assistente virtual da empresa ${companyData.companyName}.

OBJETIVO PRINCIPAL: ${objectiveText}.

PRODUTO / SERVICO: ${companyData.companyProduct || 'Nao informado'}.
PRECO MEDIO: ${companyData.productPrice ? 'R$ ' + companyData.productPrice : 'Nao informado'}.
DOR DO CLIENTE / PUBLICO-ALVO: ${companyData.targetAudience || 'Nao informado'}.
ESTILO DE COMUNICACAO: ${companyData.voiceTone || 'Consultiva'}.
QUANDO NAO SOUBER RESPONDER: ${unknownText}
${companyData.restrictions ? 'RESTRICOES: ' + companyData.restrictions : ''}

Seja sempre proativo, orientado a resultados, e conduza o cliente em direcao ao fechamento.`;
            } else {
                systemPrompt = `Voce e um agente especializado em ${newType}. Seja util, claro e orientado ao objetivo do usuario.`;
            }

            const res = await fetch('/api/agents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: newName,
                    type: newType,
                    system_prompt: systemPrompt,
                    model_config: {},
                }),
            });

            if (res.ok) {
                await fetchAgents();
                setShowCreateModal(false);
                setNewName('');
                setNewType('sdr');
                setCreateStep('choose');
                setCreateMode(null);
                setCompanyData(null);
            } else {
                const errorData = await res.json();
                alert(`Erro ao criar agente: ${errorData.error} - ${errorData.details || ''}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexao ou erro inesperado');
        } finally {
            setIsCreating(false);
        }
    };

    const filteredAgents = agents.filter((agent) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        return (
            agent.name.toLowerCase().includes(query) ||
            agent.type.toLowerCase().includes(query) ||
            (agent.whatsapp_instance_name || '').toLowerCase().includes(query)
        );
    });

    const activeCount = agents.filter((agent) => agent.status === 'active').length;
    const pausedCount = agents.filter((agent) => agent.status === 'paused').length;
    const connectedCount = agents.filter((agent) => isWhatsAppConnected(agent.whatsapp_instance_status)).length;

    return (
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[360px] overflow-hidden">
                <div className="absolute left-[-8%] top-12 h-56 w-56 rounded-full bg-primary/[0.16] blur-3xl dark:bg-primary/[0.12]" />
                <div className="absolute right-[6%] top-0 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10" />
            </div>

            <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/[0.85] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111111] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.13),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.05),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_32%)]" />

                <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.15] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary dark:border-primary/20 dark:bg-primary/[0.12]">
                            <Sparkles size={14} />
                            Central de agentes
                        </div>

                        <h1 className="mt-4 text-4xl font-display font-bold tracking-[-0.04em] text-text-primary sm:text-5xl">
                            Minhas IAs
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
                            Gerencie os agentes inteligentes da sua organizacao e escale a operacao no WhatsApp.
                        </p>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <HeaderStat label="Total de agentes" value={agents.length} />
                            <HeaderStat label="Em operacao" value={activeCount} />
                            <HeaderStat label="WhatsApp conectado" value={connectedCount} />
                        </div>
                    </div>

                    <div className="w-full max-w-xl">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <div className="relative flex-1">
                                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Buscar por nome, tipo ou conexao"
                                    className="h-12 w-full rounded-2xl border border-black/[0.07] bg-white/80 pl-11 pr-4 text-sm text-text-primary shadow-[0_8px_24px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 placeholder:text-text-muted focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:border-primary/40 dark:focus:ring-primary/10"
                                />
                            </div>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)] active:translate-y-0"
                            >
                                <Plus size={18} />
                                Criar nova IA
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {activeCount} ativos
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                {pausedCount} pausados
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                                <Smartphone size={14} className="text-primary" />
                                {connectedCount} conectados ao WhatsApp
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {industrySlug && (() => {
                const profile = getProfileBySlug(industrySlug);
                if (!profile || profile.recommendedAgents.length === 0) return null;
                const existing = new Set(agents.map((agent) => agent.name.toLowerCase()));
                const toInstall = profile.recommendedAgents.filter((agent) => !existing.has(agent.name.toLowerCase()));
                if (toInstall.length === 0) return null;

                return (
                    <section className="mt-8 overflow-hidden rounded-[28px] border border-primary/[0.15] bg-white/[0.82] p-6 shadow-[0_16px_50px_rgba(245,121,59,0.08)] backdrop-blur dark:border-primary/[0.15] dark:bg-[#111111] dark:shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.15] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                    <Sparkles size={14} />
                                    Curadoria Kogna
                                </div>
                                <h2 className="mt-4 text-2xl font-display font-bold tracking-tight text-text-primary">
                                    {profile.icon} Agentes recomendados para {profile.name}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-text-secondary">
                                    Sugestoes prontas para acelerar a sua operacao sem mudar o fluxo atual da plataforma.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                            {toInstall.map((agent) => (
                                <div
                                    key={agent.id}
                                    className="rounded-[24px] border border-black/[0.06] bg-background/75 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/[0.06] dark:bg-white/[0.03]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-[0_12px_28px_rgba(15,23,42,0.08)] dark:bg-white/[0.06]">
                                            {agent.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-text-primary">{agent.name}</p>
                                            <p className="mt-2 text-sm leading-6 text-text-secondary">{agent.description}</p>
                                            <button
                                                onClick={() => handleInstallIndustryAgent(agent)}
                                                disabled={installingAgentId === agent.id}
                                                className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.15] disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {installingAgentId === agent.id ? (
                                                    <>
                                                        <Loader2 size={14} className="animate-spin" />
                                                        Instalando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus size={14} />
                                                        Instalar com 1 clique
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })()}

            <section className="mt-8">
                {isLoading ? (
                    <div className="flex min-h-[320px] items-center justify-center rounded-[28px] border border-black/[0.06] bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <Loader2 className="animate-spin text-primary" size={38} />
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {filteredAgents.map((agent) => {
                            const typeMeta = getTypeMeta(agent.type);
                            const statusMeta = statusConfig[agent.status];
                            const TypeIcon = typeMeta.icon;
                            const whatsappConnected = isWhatsAppConnected(agent.whatsapp_instance_status);

                            return (
                                <article
                                    key={agent.id}
                                    className="group relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/[0.92] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:hover:border-primary/25 dark:hover:shadow-[0_24px_70px_rgba(0,0,0,0.48)]"
                                >
                                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-primary/[0.12] blur-3xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-primary/10" />

                                    <div className="relative flex h-full flex-col">
                                        <div className="mb-6 flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-4">
                                                <div className={cn(
                                                    'relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br text-white',
                                                    typeMeta.gradient,
                                                    typeMeta.accent
                                                )}>
                                                    <Bot size={28} />
                                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/80 bg-white text-slate-700 shadow-sm dark:border-[#111111] dark:bg-[#1B1B1B] dark:text-white">
                                                        <TypeIcon size={12} />
                                                    </div>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                                                        {typeMeta.eyebrow}
                                                    </p>
                                                    <h3 className="mt-2 truncate text-2xl font-display font-bold tracking-tight text-text-primary">
                                                        {agent.name}
                                                    </h3>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', typeMeta.badge)}>
                                                            {typeMeta.label}
                                                        </span>
                                                        <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]', statusMeta.badge)}>
                                                            <span className={cn('h-2 w-2 rounded-full', statusMeta.dot)} />
                                                            {statusMeta.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-text-muted transition-all duration-200 hover:border-black/[0.07] hover:bg-black/[0.03] hover:text-text-primary dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {openMenuId === agent.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-black/[0.08] bg-white/95 p-2 shadow-[0_18px_40px_rgba(15,23,42,0.14)] backdrop-blur dark:border-white/[0.08] dark:bg-[#171717] dark:shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
                                                            <button
                                                                onClick={() => handleTogglePause(agent)}
                                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:hover:bg-white/[0.05] dark:hover:text-white"
                                                            >
                                                                {agent.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                                                                {agent.status === 'paused' ? 'Retomar IA' : 'Pausar IA'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAgent(agent.id)}
                                                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                                            >
                                                                <X size={14} />
                                                                Excluir agente
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-black/[0.05] bg-background/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                                            <div className="flex items-start gap-3">
                                                <div className={cn(
                                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                                                    whatsappConnected
                                                        ? 'bg-[#25D366]/[0.12] text-[#25D366]'
                                                        : 'bg-slate-500/10 text-slate-500 dark:bg-slate-400/10 dark:text-slate-300'
                                                )}>
                                                    <Smartphone size={18} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                                        Canal do WhatsApp
                                                    </p>
                                                    {agent.whatsapp_instance_name ? (
                                                        <>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <span className="truncate font-mono text-sm font-semibold text-text-primary">
                                                                    {agent.whatsapp_instance_name}
                                                                </span>
                                                                <span className={cn(
                                                                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                                                                    whatsappConnected
                                                                        ? 'border-[#25D366]/20 bg-[#25D366]/10 text-[#25D366]'
                                                                        : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300'
                                                                )}>
                                                                    <span className={cn('h-1.5 w-1.5 rounded-full', whatsappConnected ? 'bg-[#25D366]' : 'bg-slate-400')} />
                                                                    {getWhatsAppLabel(agent.whatsapp_instance_status)}
                                                                </span>
                                                            </div>
                                                            <p className="mt-2 text-sm text-text-secondary">
                                                                Conexao pronta para roteamento das conversas do agente.
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                                                            Nenhuma conexao de WhatsApp vinculada a esta IA no momento.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex-1">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                                Descricao
                                            </p>
                                            <p className="mt-2 min-h-[72px] text-sm leading-7 text-text-secondary">
                                                {getAgentDescription(agent.type)}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-5 dark:border-white/[0.06]">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-2xl', typeMeta.iconWrap)}>
                                                    <Activity size={15} />
                                                </span>
                                                <span className="max-w-[180px] leading-5">{statusMeta.copy}</span>
                                            </div>

                                            <button
                                                onClick={() => setEditingAgent(agent)}
                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:border-primary/30 dark:hover:text-primary-light"
                                            >
                                                <Cpu size={16} />
                                                Configurar
                                                <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : agents.length === 0 ? (
                    <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-12">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)]">
                            <Bot size={34} />
                        </div>
                        <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                            Sua central de IAs comeca aqui
                        </h3>
                        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
                            Crie seu primeiro agente inteligente para organizar operacao, atendimento e vendas
                            em uma interface mais premium, clara e pronta para escalar.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)]"
                        >
                            <Plus size={18} />
                            Criar minha primeira IA
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-12">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary/10 text-primary dark:bg-primary/[0.12]">
                            <Search size={28} />
                        </div>
                        <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                            Nenhuma IA encontrada
                        </h3>
                        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-text-secondary sm:text-base">
                            Ajuste os termos da busca para localizar agentes por nome, tipo ou conexao do WhatsApp.
                        </p>
                    </div>
                )}
            </section>

            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#171717] dark:shadow-[0_24px_90px_rgba(0,0,0,0.55)]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.16),_transparent_36%)]" />

                        <div className="relative border-b border-black/[0.06] px-6 py-5 dark:border-white/[0.08]">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {createStep === 'form' && (
                                        <button
                                            onClick={() => {
                                                setCreateStep('choose');
                                                setCreateMode(null);
                                            }}
                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.07] bg-white/75 text-text-secondary transition-colors hover:text-text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:text-white"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                    )}
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                            Nova IA
                                        </p>
                                        <h2 className="mt-1 text-2xl font-display font-bold tracking-tight text-text-primary">
                                            Criar inteligencia artificial
                                        </h2>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setCreateStep('choose');
                                        setCreateMode(null);
                                    }}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-text-muted transition-colors hover:border-black/[0.07] hover:bg-black/[0.03] hover:text-text-primary dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {createStep === 'choose' && (
                            <div className="relative space-y-4 p-6">
                                <p className="text-sm leading-6 text-text-secondary">
                                    Escolha a forma de criacao que melhor combina com a sua operacao atual.
                                </p>

                                <button
                                    onClick={() => {
                                        setCreateMode('scratch');
                                        setCreateStep('form');
                                    }}
                                    className="w-full rounded-[24px] border border-black/[0.07] bg-white/80 p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03]"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                                            <Plus size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary">Criar do zero</h3>
                                            <p className="mt-1 text-sm leading-6 text-text-secondary">
                                                Configure manualmente nome, tipo e estrutura inicial do agente.
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={async () => {
                                        setIsLoadingCompanyData(true);
                                        try {
                                            const res = await fetch('/api/company-data', {
                                                headers: { Authorization: `Bearer ${token}` },
                                            });
                                            const data = await res.json();
                                            if (data) {
                                                setCompanyData(data);
                                                setCreateMode('company');
                                                setCreateStep('form');
                                            } else {
                                                setHasCompanyData(false);
                                            }
                                        } catch (error) {
                                            setHasCompanyData(false);
                                        } finally {
                                            setIsLoadingCompanyData(false);
                                        }
                                    }}
                                    disabled={isLoadingCompanyData}
                                    className="w-full rounded-[24px] border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_22px_48px_rgba(245,121,59,0.14)] disabled:opacity-70"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_14px_32px_rgba(245,121,59,0.28)]">
                                                {isLoadingCompanyData ? <Loader2 size={20} className="animate-spin" /> : <Wand2 size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-text-primary">Puxar dados da empresa</h3>
                                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                                    Aproveite o onboarding atual para gerar uma IA mais rapido e com contexto.
                                                </p>
                                            </div>
                                        </div>
                                        <span className="rounded-full border border-primary/[0.15] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary dark:bg-primary/10">
                                            Rapido
                                        </span>
                                    </div>
                                </button>

                                {hasCompanyData === false && (
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                        Nenhum dado da empresa encontrado. Complete o onboarding primeiro ou crie do zero.
                                    </div>
                                )}
                            </div>
                        )}

                        {createStep === 'form' && (
                            <form onSubmit={handleCreateAgent} className="relative space-y-5 p-6">
                                {createMode === 'company' && companyData && (
                                    <div className="rounded-[24px] border border-primary/20 bg-primary/[0.08] p-4 dark:bg-primary/10">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-primary" />
                                            <span className="text-sm font-semibold text-primary">{companyData.companyName}</span>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                                            <p>Vende: {companyData.companyProduct}</p>
                                            <p>Publico: {companyData.targetAudience}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                                        Nome do agente
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newName}
                                        onChange={(event) => setNewName(event.target.value)}
                                        placeholder="Ex: Vendedor Senior"
                                        className="h-12 w-full rounded-2xl border border-black/[0.07] bg-white px-4 text-sm text-text-primary outline-none transition-all focus:border-primary/35 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-white/[0.04]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-primary">
                                        Tipo de funcao
                                    </label>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {agentTemplates.map((template) => {
                                            const active = newType === template.id;
                                            return (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => setNewType(template.id)}
                                                    className={cn(
                                                        'rounded-[22px] border p-4 text-left transition-all duration-300',
                                                        active
                                                            ? 'border-primary/35 bg-primary/10 shadow-[0_16px_34px_rgba(245,121,59,0.12)]'
                                                            : 'border-black/[0.07] bg-white/80 hover:border-primary/20 hover:bg-primary/5 dark:border-white/[0.08] dark:bg-white/[0.03]'
                                                    )}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            'flex h-11 w-11 items-center justify-center rounded-2xl text-lg',
                                                            active
                                                                ? 'bg-primary text-white'
                                                                : 'bg-black/[0.05] dark:bg-white/[0.06]'
                                                        )}>
                                                            {template.icon}
                                                        </div>
                                                        <div>
                                                            <p className={cn('text-sm font-semibold', active ? 'text-primary' : 'text-text-primary')}>
                                                                {template.name}
                                                            </p>
                                                            <p className="mt-1 text-xs leading-5 text-text-secondary">
                                                                {template.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {createMode === 'company' && companyData && (
                                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        O prompt sera gerado automaticamente com os dados da sua empresa.
                                    </div>
                                )}

                                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setCreateStep('choose');
                                            setCreateMode(null);
                                        }}
                                        className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.07] px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-black/[0.03] hover:text-text-primary dark:border-white/[0.08] dark:hover:bg-white/[0.04] dark:hover:text-white"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {isCreating && <Loader2 className="animate-spin" size={18} />}
                                        Criar IA
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {editingAgent && (
                <AgentEditModal
                    agent={editingAgent}
                    isOpen={!!editingAgent}
                    onClose={() => setEditingAgent(null)}
                    onUpdate={fetchAgents}
                />
            )}
        </div>
    );
}
