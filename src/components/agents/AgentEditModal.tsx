import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    Bot,
    BrainCircuit,
    Cable,
    CheckCircle2,
    FileText,
    Loader2,
    Plus,
    Save,
    Sparkles,
    Trash2,
    Upload,
    Wand2,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    CompanyProfileData,
    EMPTY_COMPANY_PROFILE,
    createEmptyObjection,
    parseListInput,
    serializeListInput,
    type ObjectionPlaybookItem,
} from '../../lib/companyProfile';

interface Agent {
    id: string;
    name: string;
    type: string;
    system_prompt?: string;
    advanced_instructions?: string;
    model_config?: {
        model?: string;
        temperature?: number;
    } | null;
    training_files?: TrainingFile[];
    whatsapp_instance_id?: string | null;
    knowledge_summary?: string | null;
}

interface TrainingFile {
    filename: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
    uploadedAt?: string;
    extractedText?: string;
}

interface WhatsAppInstance {
    id: string;
    instance_name: string;
    status: string;
    connected_agent_id?: string;
    connected_agent_name?: string;
}

interface AgentEditModalProps {
    agent: Agent;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

type AgentSection = 'strategy' | 'objections' | 'knowledge' | 'connection' | 'advanced';

const SECTION_META: Array<{
    id: AgentSection;
    label: string;
    description: string;
    icon: typeof BrainCircuit;
}> = [
    { id: 'strategy', label: 'Estrategia', description: 'Objetivo, tom e conducao.', icon: BrainCircuit },
    { id: 'objections', label: 'Objecoes', description: 'Como contornar entraves.', icon: Sparkles },
    { id: 'knowledge', label: 'Conhecimento', description: 'Arquivos e contexto.', icon: FileText },
    { id: 'connection', label: 'Conexao', description: 'Numero e operacao.', icon: Cable },
    { id: 'advanced', label: 'Avancado', description: 'Ajustes finos.', icon: Wand2 },
];

const TONES = ['Consultiva', 'Direta', 'Amigavel', 'Executiva', 'Educadora'];
const GOALS = [
    { value: 'fechar_venda', label: 'Fechar venda' },
    { value: 'qualificar_agendar', label: 'Qualificar e agendar' },
    { value: 'aquecer_lead', label: 'Aquecer e transferir no momento certo' },
];
const FIXED_AGENT_MODEL = 'gpt-4.1';
const FIXED_AGENT_MODEL_LABEL = 'GPT-4.1';

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={`w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-[#171718] dark:text-white ${props.className || ''}`}
        />
    );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={`w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-[#171718] dark:text-white ${props.className || ''}`}
        />
    );
}

function Surface({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-[28px] border border-black/[0.06] bg-white/[0.92] p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#111111]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
            <h3 className="mt-2 text-xl font-display font-bold tracking-tight text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function ObjectionEditor({
    item,
    index,
    onChange,
    onRemove,
}: {
    item: ObjectionPlaybookItem;
    index: number;
    onChange: (next: ObjectionPlaybookItem) => void;
    onRemove: () => void;
}) {
    return (
        <div className="rounded-[26px] border border-black/[0.06] bg-[#FAFAFA] p-4 dark:border-white/[0.08] dark:bg-[#161618]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Objecao {index + 1}</p>
                    <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.label || 'Nova objecao'}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...item, is_active: !item.is_active })}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${item.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300'}`}
                    >
                        {item.is_active ? 'Ativa' : 'Inativa'}
                    </button>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <FieldLabel>Nome</FieldLabel>
                    <Input value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} placeholder="Ex: Preco" />
                </div>
                <div>
                    <FieldLabel>Prioridade</FieldLabel>
                    <Input type="number" value={item.priority} onChange={(e) => onChange({ ...item, priority: Number(e.target.value) || index + 1 })} />
                </div>
                <div className="md:col-span-2">
                    <FieldLabel>Sinais</FieldLabel>
                    <Input value={serializeListInput(item.signals)} onChange={(e) => onChange({ ...item, signals: parseListInput(e.target.value) })} placeholder="caro, preciso pensar, agora nao..." />
                </div>
                <div className="md:col-span-2">
                    <FieldLabel>Contexto</FieldLabel>
                    <Textarea rows={3} value={item.context} onChange={(e) => onChange({ ...item, context: e.target.value })} placeholder="O que costuma existir por tras dessa objecao?" />
                </div>
                <div>
                    <FieldLabel>Como responder</FieldLabel>
                    <Textarea rows={4} value={item.recommended_approach} onChange={(e) => onChange({ ...item, recommended_approach: e.target.value })} placeholder="Linha mestra de resposta e conducao." />
                </div>
                <div>
                    <FieldLabel>CTA depois de contornar</FieldLabel>
                    <Textarea rows={4} value={item.cta_after_resolution} onChange={(e) => onChange({ ...item, cta_after_resolution: e.target.value })} placeholder="Qual proximo passo puxar?" />
                </div>
                <div>
                    <FieldLabel>Argumentos permitidos</FieldLabel>
                    <Textarea rows={4} value={serializeListInput(item.allowed_arguments)} onChange={(e) => onChange({ ...item, allowed_arguments: parseListInput(e.target.value) })} placeholder="ROI, urgencia, case, prova..." />
                </div>
                <div>
                    <FieldLabel>Frases a evitar</FieldLabel>
                    <Textarea rows={4} value={serializeListInput(item.avoid_phrases)} onChange={(e) => onChange({ ...item, avoid_phrases: parseListInput(e.target.value) })} placeholder="qualquer coisa me chama, se quiser..." />
                </div>
            </div>
        </div>
    );
}

export default function AgentEditModal({ agent, isOpen, onClose, onUpdate }: AgentEditModalProps) {
    const { token } = useAuth();
    const authToken = token || localStorage.getItem('kogna_token') || '';
    const [activeSection, setActiveSection] = useState<AgentSection>('strategy');
    const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>(EMPTY_COMPANY_PROFILE);
    const [advancedInstructions, setAdvancedInstructions] = useState(agent.advanced_instructions || '');
    const [temperature, setTemperature] = useState(agent.model_config?.temperature ?? 0.45);
    const [files, setFiles] = useState<TrainingFile[]>(agent.training_files || []);
    const [whatsappInstanceId, setWhatsappInstanceId] = useState(agent.whatsapp_instance_id || '');
    const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const currentConnection = useMemo(
        () => instances.find((instance) => instance.id === whatsappInstanceId) || null,
        [instances, whatsappInstanceId]
    );

    useEffect(() => {
        if (!isOpen) return;

        setActiveSection('strategy');
        setAdvancedInstructions(agent.advanced_instructions || '');
        setTemperature(agent.model_config?.temperature ?? 0.45);
        setFiles(agent.training_files || []);
        setWhatsappInstanceId(agent.whatsapp_instance_id || '');
        setStatusMessage(null);
        setErrorMessage(null);
        setIsLoading(true);

        Promise.all([
            fetch('/api/company-data', { headers: { Authorization: `Bearer ${authToken}` } }),
            fetch('/api/whatsapp/instances', { headers: { Authorization: `Bearer ${authToken}` } }),
        ])
            .then(async ([profileRes, instancesRes]) => {
                const profilePayload = profileRes.ok ? await profileRes.json() : null;
                const instancesPayload = instancesRes.ok ? await instancesRes.json() : [];
                setCompanyProfile({ ...EMPTY_COMPANY_PROFILE, ...(profilePayload || {}) });
                setInstances(Array.isArray(instancesPayload) ? instancesPayload : []);
            })
            .catch(() => {
                setErrorMessage('Nao foi possivel carregar o contexto da IA agora.');
            })
            .finally(() => setIsLoading(false));
    }, [agent, authToken, isOpen]);

    if (!isOpen) return null;

    const updateObjection = (id: string, next: ObjectionPlaybookItem) => {
        setCompanyProfile((current) => ({
            ...current,
            objectionPlaybook: current.objectionPlaybook.map((item) => (item.id === id ? next : item)),
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage(null);
        setStatusMessage(null);

        try {
            const profileRes = await fetch('/api/company-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(companyProfile),
            });
            const profilePayload = await profileRes.json().catch(() => null);
            if (!profileRes.ok) {
                throw new Error(profilePayload?.details || profilePayload?.error || 'Erro ao salvar estrategia da empresa.');
            }

            const agentRes = await fetch(`/api/agents/${agent.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    advanced_instructions: advancedInstructions,
                    model_config: { model: FIXED_AGENT_MODEL, temperature },
                    whatsapp_instance_id: whatsappInstanceId || null,
                    use_company_profile: true,
                }),
            });
            const agentPayload = await agentRes.json().catch(() => null);
            if (!agentRes.ok) {
                throw new Error(agentPayload?.error || 'Erro ao salvar configuracoes da IA.');
            }

            setStatusMessage('IA atualizada com sucesso.');
            onUpdate();
            setTimeout(() => {
                onClose();
            }, 500);
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar a IA.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;
        setIsUploading(true);
        setErrorMessage(null);

        const formData = new FormData();
        Array.from(event.target.files).forEach((file) => formData.append('files', file));

        try {
            const response = await fetch(`/api/agents/${agent.id}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
                body: formData,
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) throw new Error(payload?.error || 'Erro ao enviar arquivo.');
            setFiles(Array.isArray(payload?.files) ? payload.files : []);
            onUpdate();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Erro ao fazer upload.');
        } finally {
            event.target.value = '';
            setIsUploading(false);
        }
    };

    const handleDeleteFile = async (filename: string) => {
        if (!window.confirm('Deseja remover este arquivo da base de conhecimento?')) return;
        try {
            const response = await fetch(`/api/agents/${agent.id}/knowledge/${encodeURIComponent(filename)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || 'Erro ao remover arquivo.');
            }
            setFiles((current) => current.filter((file) => file.filename !== filename));
            onUpdate();
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Erro ao remover arquivo.');
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md">
            <div className="relative flex h-[min(88vh,920px)] w-full max-w-7xl overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#F7F7F8] shadow-[0_28px_90px_rgba(15,23,42,0.26)] dark:border-white/[0.08] dark:bg-[#0F0F10] dark:shadow-[0_28px_90px_rgba(0,0,0,0.56)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.05),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.16),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.04),_transparent_28%)]" />

                <aside className="relative z-10 hidden w-[300px] flex-none border-r border-black/[0.06] bg-white/[0.92] px-5 py-5 dark:border-white/[0.08] dark:bg-[#121212] lg:flex lg:flex-col">
                    <div className="rounded-[28px] border border-black/[0.06] bg-white/[0.75] p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(245,121,59,0.24)]">
                            <Bot size={26} />
                        </div>
                        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Central da IA</p>
                        <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-gray-900 dark:text-white">{agent.name}</h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Ajuste a IA com foco em venda e operacao.</p>
                    </div>

                    <nav className="mt-5 space-y-2">
                        {SECTION_META.map((section) => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full rounded-[22px] border px-4 py-3 text-left transition ${active ? 'border-primary/25 bg-primary/10 shadow-[0_12px_28px_rgba(245,121,59,0.10)]' : 'border-transparent bg-transparent hover:border-black/[0.06] hover:bg-white/70 dark:hover:border-white/[0.08] dark:hover:bg-white/[0.04]'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`rounded-2xl p-2 ${active ? 'bg-primary text-white' : 'border border-black/[0.06] bg-white text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300'}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{section.label}</p>
                                            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{section.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto rounded-[24px] border border-black/[0.06] bg-white/[0.72] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Conexao ativa</p>
                        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                            {currentConnection?.instance_name || 'Nenhum numero vinculado'}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {currentConnection ? `Status: ${currentConnection.status}` : 'Conecte um numero para operar este agente no WhatsApp.'}
                        </p>
                    </div>
                </aside>

                <div className="relative z-10 flex min-w-0 flex-1 flex-col">
                    <header className="border-b border-black/[0.06] bg-white/[0.82] px-5 py-5 backdrop-blur dark:border-white/[0.08] dark:bg-[#161618]/92 sm:px-7">
                        <div className="flex items-start justify-between gap-4">
                            <div className="max-w-3xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.15] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                                    <BrainCircuit size={13} />
                                    Orquestrador da IA
                                </div>
                                <h3 className="mt-4 text-3xl font-display font-bold tracking-[-0.04em] text-gray-900 dark:text-white">
                                    Configurar {agent.name}
                                </h3>
                                <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">O playbook da empresa guia a IA. Aqui voce refina a operacao.</p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-black/[0.07] bg-white/75 text-gray-500 transition-colors hover:text-gray-900 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-400 dark:hover:text-white"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 lg:hidden">
                            {SECTION_META.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => setActiveSection(section.id)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeSection === section.id ? 'border-primary/25 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300'}`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                        {statusMessage ? (
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <CheckCircle2 size={16} />
                                {statusMessage}
                            </div>
                        ) : null}
                        {errorMessage ? (
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                                <AlertCircle size={16} />
                                {errorMessage}
                            </div>
                        ) : null}

                        {isLoading ? (
                            <div className="flex min-h-[360px] items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {activeSection === 'strategy' && (
                                    <Surface eyebrow="Estrategia" title="Como esta IA deve atuar" description="Defina objetivo, tom e sinais de operacao.">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <FieldLabel>Objetivo principal</FieldLabel>
                                                <div className="grid gap-3 md:grid-cols-3">
                                                    {GOALS.map((goal) => (
                                                        <button
                                                            key={goal.value}
                                                            type="button"
                                                            onClick={() => setCompanyProfile((current) => ({ ...current, agentObjective: goal.value }))}
                                                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${companyProfile.agentObjective === goal.value ? 'border-primary/40 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 hover:border-primary/30 dark:border-white/[0.08] dark:bg-[#171718] dark:text-gray-300'}`}
                                                        >
                                                            {goal.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <FieldLabel>Tom da IA</FieldLabel>
                                                <div className="flex flex-wrap gap-2">
                                                    {TONES.map((tone) => (
                                                        <button
                                                            key={tone}
                                                            type="button"
                                                            onClick={() => setCompanyProfile((current) => ({ ...current, voiceTone: tone }))}
                                                            className={`rounded-full border px-3 py-1.5 text-sm transition ${companyProfile.voiceTone === tone ? 'border-primary/40 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 hover:border-primary/30 dark:border-white/[0.08] dark:bg-[#171718] dark:text-gray-300'}`}
                                                        >
                                                            {tone}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <FieldLabel>Politica de agenda</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.agendaPolicy} onChange={(e) => setCompanyProfile((current) => ({ ...current, agendaPolicy: e.target.value }))} placeholder="Quando a IA deve levar para agenda, demo ou call?" />
                                            </div>
                                            <div>
                                                <FieldLabel>Definicao de lead forte</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.qualificationCriteria} onChange={(e) => setCompanyProfile((current) => ({ ...current, qualificationCriteria: e.target.value }))} placeholder="Quais sinais mostram que vale acelerar a conversa?" />
                                            </div>
                                            <div>
                                                <FieldLabel>Sinais de compra</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.buyingSignals} onChange={(e) => setCompanyProfile((current) => ({ ...current, buyingSignals: e.target.value }))} placeholder="Frases, comportamentos e pedidos que indicam intencao real." />
                                            </div>
                                            <div>
                                                <FieldLabel>Escalada para humano</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.humanHandoffPolicy} onChange={(e) => setCompanyProfile((current) => ({ ...current, humanHandoffPolicy: e.target.value }))} placeholder="Quando a equipe deve ser alertada sem silenciar a IA?" />
                                            </div>
                                            <div>
                                                <FieldLabel>Proximo passo ideal</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.idealNextStep} onChange={(e) => setCompanyProfile((current) => ({ ...current, idealNextStep: e.target.value }))} placeholder="Qual CTA a IA deve puxar quando houver abertura?" />
                                            </div>
                                            <div>
                                                <FieldLabel>Quando nao souber</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.unknownBehavior} onChange={(e) => setCompanyProfile((current) => ({ ...current, unknownBehavior: e.target.value }))} placeholder="Como a IA deve agir quando faltar contexto?" />
                                            </div>
                                        </div>
                                    </Surface>
                                )}

                                {activeSection === 'objections' && (
                                    <Surface eyebrow="Playbook" title="Objecoes da operacao" description="Mapeie objecoes e a resposta certa da IA.">
                                        <div className="space-y-4">
                                            <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.04] p-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                                Isso melhora as respostas da IA em contexto de objecao.
                                            </div>
                                            <div>
                                                <FieldLabel>Diretriz geral de contorno</FieldLabel>
                                                <Textarea rows={4} value={companyProfile.objectionHandling} onChange={(e) => setCompanyProfile((current) => ({ ...current, objectionHandling: e.target.value }))} placeholder="Qual linha mestra a IA deve seguir ao quebrar objecoes?" />
                                            </div>
                                            {companyProfile.objectionPlaybook.map((item, index) => (
                                                <ObjectionEditor
                                                    key={item.id}
                                                    item={item}
                                                    index={index}
                                                    onChange={(next) => updateObjection(item.id, next)}
                                                    onRemove={() => setCompanyProfile((current) => ({
                                                        ...current,
                                                        objectionPlaybook: current.objectionPlaybook.filter((entry) => entry.id !== item.id),
                                                    }))}
                                                />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => setCompanyProfile((current) => ({ ...current, objectionPlaybook: [...current.objectionPlaybook, createEmptyObjection()] }))}
                                                className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/[0.14]"
                                            >
                                                <Plus size={16} />
                                                Adicionar objecao
                                            </button>
                                        </div>
                                    </Surface>
                                )}

                                {activeSection === 'knowledge' && (
                                    <Surface eyebrow="Conhecimento" title="Base do agente" description="Adicione materiais de apoio e oferta.">
                                        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                                            <div>
                                                <label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[26px] border-2 border-dashed border-black/[0.08] bg-white px-6 py-10 text-center transition hover:border-primary/35 hover:bg-primary/[0.04] dark:border-white/[0.08] dark:bg-[#171718] dark:hover:border-primary/25">
                                                    <input type="file" multiple accept=".pdf,.txt,.docx,.md" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
                                                        {isUploading ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {isUploading ? 'Enviando arquivos...' : 'Adicionar conhecimento'}
                                                        </p>
                                                        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                                                            PDF, TXT, DOCX ou markdown.
                                                        </p>
                                                    </div>
                                                </label>

                                                <div className="mt-4 space-y-3">
                                                    {files.length === 0 ? (
                                                        <div className="rounded-2xl border border-dashed border-black/[0.08] bg-white/70 px-4 py-5 text-sm text-gray-500 dark:border-white/[0.10] dark:bg-white/[0.03] dark:text-gray-400">
                                                            Nenhum arquivo carregado ainda.
                                                        </div>
                                                    ) : (
                                                        files.map((file) => (
                                                            <div key={file.filename} className="flex items-start justify-between gap-3 rounded-[22px] border border-black/[0.06] bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-[#171718]">
                                                                <div className="flex min-w-0 gap-3">
                                                                    <div className="mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{file.originalName || file.filename}</p>
                                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                            {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString('pt-BR') : 'Arquivo enviado'}
                                                                        </p>
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                            {file.mimeType ? <span className="rounded-full border border-black/[0.08] bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300">{file.mimeType}</span> : null}
                                                                            {file.extractedText ? <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">Texto ingerido</span> : null}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button type="button" onClick={() => handleDeleteFile(file.filename)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="rounded-[26px] border border-black/[0.06] bg-white/[0.86] p-5 dark:border-white/[0.08] dark:bg-[#171718]">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">Resumo de ingestao</p>
                                                    <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-300">
                                                        {agent.knowledge_summary || 'Use materiais de oferta, contexto, prova e atendimento.'}
                                                    </p>
                                                </div>
                                                <div className="rounded-[26px] border border-primary/18 bg-primary/[0.06] p-5">
                                                    <p className="text-sm font-semibold text-primary">Sugestoes</p>
                                                    <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                                        <li>Materiais comerciais e de oferta.</li>
                                                        <li>FAQ, provas e cases.</li>
                                                        <li>Scripts e politicas internas.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </Surface>
                                )}

                                {activeSection === 'connection' && (
                                    <Surface eyebrow="Conexao" title="Numero vinculado" description="Escolha o numero que esta IA vai operar.">
                                        <div className="space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => setWhatsappInstanceId('')}
                                                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${!whatsappInstanceId ? 'border-primary/25 bg-primary/10' : 'border-black/[0.08] bg-white hover:border-primary/20 dark:border-white/[0.08] dark:bg-[#171718]'}`}
                                            >
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Nenhum numero conectado</p>
                                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Deixe o agente sem numero ativo.</p>
                                                    </div>
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${!whatsappInstanceId ? 'border-primary/20 bg-white text-primary' : 'border-black/[0.08] text-gray-500 dark:border-white/[0.08] dark:text-gray-400'}`}>
                                                        {!whatsappInstanceId ? 'Selecionado' : 'Livre'}
                                                    </span>
                                                </div>
                                            </button>

                                            {instances.map((instance) => {
                                                const selected = whatsappInstanceId === instance.id;
                                                const inUseByAnotherAgent = instance.connected_agent_id && instance.connected_agent_id !== agent.id;
                                                return (
                                                    <button
                                                        key={instance.id}
                                                        type="button"
                                                        disabled={Boolean(inUseByAnotherAgent)}
                                                        onClick={() => setWhatsappInstanceId(instance.id)}
                                                        className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${selected ? 'border-primary/25 bg-primary/10 shadow-[0_12px_28px_rgba(245,121,59,0.10)]' : 'border-black/[0.08] bg-white hover:border-primary/20 dark:border-white/[0.08] dark:bg-[#171718]'} ${inUseByAnotherAgent ? 'cursor-not-allowed opacity-55' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{instance.instance_name}</p>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${String(instance.status).toUpperCase() === 'CONNECTED' || String(instance.status).toLowerCase() === 'open' ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300'}`}>
                                                                        {instance.status}
                                                                    </span>
                                                                    {inUseByAnotherAgent ? (
                                                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                                                                            Em uso por {instance.connected_agent_name}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${selected ? 'border-primary/20 bg-white text-primary' : 'border-black/[0.08] text-gray-500 dark:border-white/[0.08] dark:text-gray-400'}`}>
                                                                {selected ? 'Selecionado' : 'Disponivel'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </Surface>
                                )}

                                {activeSection === 'advanced' && (
                                    <Surface eyebrow="Avancado" title="Refinamentos do agente" description="Ajustes finos sem mexer no playbook central.">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="md:col-span-2">
                                                <FieldLabel>Instrucoes complementares</FieldLabel>
                                                <Textarea rows={6} value={advancedInstructions} onChange={(e) => setAdvancedInstructions(e.target.value)} placeholder="Use este bloco para refinamentos pontuais que fazem sentido so para esta IA." />
                                            </div>
                                            <div>
                                                <FieldLabel>Modelo</FieldLabel>
                                                <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-4 text-sm text-gray-900 dark:border-white/[0.08] dark:bg-[#171718] dark:text-white">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="font-semibold">{FIXED_AGENT_MODEL_LABEL}</span>
                                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                                            Padrao
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                                        A Kogna usa esse modelo automaticamente.
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <FieldLabel>Temperatura</FieldLabel>
                                                <div className="rounded-2xl border border-black/[0.08] bg-white px-4 py-4 dark:border-white/[0.08] dark:bg-[#171718]">
                                                    <div className="mb-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                                                        <span>Precisao operacional</span>
                                                        <strong className="text-gray-900 dark:text-white">{temperature.toFixed(2)}</strong>
                                                    </div>
                                                    <input type="range" min="0" max="1" step="0.05" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full accent-[#F5793B]" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <FieldLabel>Prompt atual gerado</FieldLabel>
                                                <div className="rounded-[24px] border border-black/[0.08] bg-[#111214] p-4 text-xs leading-6 text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                                    <pre className="max-h-[280px] overflow-y-auto whitespace-pre-wrap font-mono">{agent.system_prompt || 'O prompt operacional sera regenerado com base no perfil da empresa ao salvar esta tela.'}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    </Surface>
                                )}
                            </div>
                        )}
                    </div>

                    <footer className="border-t border-black/[0.06] bg-white/[0.86] px-5 py-4 backdrop-blur dark:border-white/[0.08] dark:bg-[#151517]/92 sm:px-7">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Salvar atualiza o perfil e a operacao desta IA.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] bg-white px-5 text-sm font-semibold text-gray-700 transition hover:border-primary/20 hover:text-primary dark:border-white/[0.08] dark:bg-[#171718] dark:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)] transition hover:brightness-105 disabled:opacity-70"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Salvar IA
                                </button>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
