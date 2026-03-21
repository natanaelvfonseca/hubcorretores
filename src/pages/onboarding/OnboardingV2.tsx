import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    Check, ChevronRight, Zap,
    Brain, Upload, Loader2, Send, Bot,
    Rocket, Trophy, MessageSquare, GitBranch, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from '../../components/branding/BrandLogo';
import { formatCurrencyInputBRL, getCurrencyEditingValue, sanitizeCurrencyEditingValue } from '../../lib/currencyInput';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
    agentObjective: string;
    industry: string;
    industryDetail: string;
    companyName: string;
    aiName: string;
    mainProduct: string;
    customerPain: string;
    customerDesires: string;
    differentiators: string;
    productPrice: string;
    targetAudience: string[];
    channels: string[];
    salesCycle: string;
    revenueGoal: string;
    unknownBehavior: string;
    voiceTone: string;
    humanHandoffPolicy: string;
    buyingSignals: string;
    qualificationCriteria: string;
    objectionHandling: string;
    idealNextStep: string;
    agendaPolicy: string;
    objections: string[];
    restrictions: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

const EMPTY_FORM: FormData = {
    agentObjective: '', industry: '', industryDetail: '',
    companyName: '', aiName: '',
    mainProduct: '', customerPain: '', customerDesires: '', differentiators: '', productPrice: '',
    targetAudience: [], channels: [], salesCycle: '',
    revenueGoal: '', unknownBehavior: '', voiceTone: '',
    humanHandoffPolicy: '', buyingSignals: '', qualificationCriteria: '', objectionHandling: '', idealNextStep: '', agendaPolicy: '', objections: [], restrictions: '',
    name: '', email: '', phone: '', password: '', confirmPassword: '',
};

const TOTAL_STEPS = 18;

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChoiceCard({ label, desc, selected, onClick }: {
    label: string; desc?: string; value?: string; selected: boolean; onClick: () => void;
}) {
    return (
        <button type="button" onClick={onClick}
            className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-200 relative group ${selected
                ? 'border-[#FF4C00] bg-[#FF4C00]/8 shadow-lg shadow-[#FF4C00]/10'
                : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'}`}>
            {selected && (
                <span className="absolute top-3 right-3 w-5 h-5 bg-[#FF4C00] rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                </span>
            )}
            <p className={`text-sm font-semibold ${selected ? 'text-[#FF4C00]' : 'text-gray-800'}`}>{label}</p>
            {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
        </button>
    );
}

function MultiChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 border ${selected
                ? 'border-[#FF4C00] bg-[#FF4C00]/10 text-[#FF4C00]'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-800'}`}>
            {selected && <Check className="w-3 h-3 inline mr-1" />}{label}
        </button>
    );
}

function FieldLabel({ children, counter }: { children: React.ReactNode; counter?: React.ReactNode }) {
    return (
        <div className="flex items-end justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{children}</label>
            {counter && <span className="text-[10px] font-mono">{counter}</span>}
        </div>
    );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input {...props}
            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#FF4C00]/60 focus:bg-white transition-all ${props.className || ''}`}
        />
    );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea {...props}
            className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#FF4C00]/60 transition-all resize-none ${props.className || ''}`}
        />
    );
}

function ErrorBanner({ msg }: { msg: string }) {
    return (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm mb-4">
            <X className="w-4 h-4 shrink-0" /> {msg}
        </div>
    );
}

function NextBtn({ onClick, loading, label = 'Continuar' }: { onClick: () => void; loading?: boolean; label?: string }) {
    return (
        <button onClick={onClick} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#FF4C00]/20 disabled:opacity-50 mt-6">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{label} <ChevronRight className="w-4 h-4" /></>}
        </button>
    );
}

// ── Progress Sidebar ──────────────────────────────────────────────────────────
const STEP_LABELS = [
    'Conta', 'Agente', 'Mercado', 'Identidade', 'Produto',
    'Público', 'Canais', 'Ciclo', 'Meta', 'Objecoes',
    'Conducao', 'Conhecimento', 'Pipeline', 'Ativacao', 'Teste',
    'Melhorar', 'WhatsApp', 'Concluído'
];


function MobileProgress({ step }: { step: number }) {
    return (
        <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-mono">Passo {step} de {TOTAL_STEPS}</span>
                <span className="text-[#FF4C00] font-semibold">{STEP_LABELS[step - 1]}</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] rounded-full transition-all duration-500"
                    style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function OnboardingV2() {
    const navigate = useNavigate();
    const { refreshUser, token: authToken, user } = useAuth();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [createdAgentId, setCreatedAgentId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [accountReady, setAccountReady] = useState(() => {
        if (typeof window === 'undefined') return false;
        return Boolean(window.localStorage.getItem('kogna_token'));
    });
    // Step 16 improvement
    const [improvementSelected, setImprovementSelected] = useState<string | null>(null);
    const [improvementDetail, setImprovementDetail] = useState('');
    const [improvementSending, setImprovementSending] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [msgsUsed, setMsgsUsed] = useState(0);
    const [sessionId] = useState(() => {
        const fallback = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        if (typeof window === 'undefined') return fallback;
        const existing = window.sessionStorage.getItem('kogna_onboarding_session_id');
        if (existing) return existing;
        window.sessionStorage.setItem('kogna_onboarding_session_id', fallback);
        return fallback;
    });
    const [pipelineVisible, setPipelineVisible] = useState(false);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [wsStatus, setWsStatus] = useState<'idle' | 'connecting' | 'qrcode' | 'connected'>('idle');
    const [wsTtl, setWsTtl] = useState(60);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const token = useRef<string | null>(null);
    const activationAttemptedRef = useRef(false);
    const knowledgeUploadedAgentRef = useRef<string | null>(null);
    const onboardingCompletionRef = useRef<'idle' | 'done'>('idle');

    const set = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));
    const toggleArr = (k: keyof FormData, v: string) => {
        const arr = (form[k] as string[]);
        set(k, arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    };
    const handleCurrencyChange = (key: 'productPrice' | 'revenueGoal', value: string) => {
        set(key, sanitizeCurrencyEditingValue(value));
    };
    const handleCurrencyBlur = (key: 'productPrice' | 'revenueGoal', value: string) => {
        set(key, formatCurrencyInputBRL(value));
    };
    const handleCurrencyFocus = (key: 'productPrice' | 'revenueGoal', value: string) => {
        set(key, getCurrencyEditingValue(value));
    };

    const go = (n: number) => { setError(''); setStep(n); window.scrollTo(0, 0); };

    useEffect(() => {
        const storedToken = authToken || (typeof window !== 'undefined' ? window.localStorage.getItem('kogna_token') : null);
        token.current = storedToken;
        setAccountReady(Boolean(storedToken));
    }, [authToken]);

    useEffect(() => {
        if (!user) return;
        setForm((current) => ({
            ...current,
            name: current.name || user.name || '',
            email: current.email || user.email || '',
            phone: current.phone || '',
        }));
    }, [user]);

    useEffect(() => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const currentToken = token.current;
        if (currentToken) {
            headers.Authorization = `Bearer ${currentToken}`;
        }

        void fetch('/api/onboarding/track-step', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                session_id: sessionId,
                step,
                total_steps: TOTAL_STEPS,
                email: form.email || undefined,
                phone: form.phone || undefined,
                metadata: {
                    source: 'OnboardingV2',
                },
            }),
        }).catch(() => { });
    }, [sessionId, step]);

    const buildObjectionPlaybook = () => (
        form.objections.map((label, index) => ({
            label,
            signals: [label],
            recommended_approach: form.objectionHandling || 'Reposicione valor, contexto e proximo passo com clareza.',
            cta_after_resolution: form.idealNextStep || 'Conduza para o proximo passo mais simples da jornada.',
            priority: index + 1,
        }))
    );

    const buildCompanyProfilePayload = () => ({
        companyName: form.companyName,
        agentName: form.aiName,
        companyProduct: form.mainProduct,
        revenueGoal: form.revenueGoal,
        agentObjective: form.agentObjective,
        unknownBehavior: form.unknownBehavior,
        voiceTone: form.voiceTone,
        restrictions: form.restrictions || '',
        customerPain: form.customerPain || '',
        customerDesires: form.customerDesires || '',
        differentiators: form.differentiators || '',
        productPrice: form.productPrice || '',
        targetAudience: form.targetAudience.join(', '),
        industry: form.industry || '',
        industryDetail: form.industryDetail || '',
        channels: form.channels,
        salesCycle: form.salesCycle || '',
        humanHandoffPolicy: form.humanHandoffPolicy || '',
        buyingSignals: form.buyingSignals || '',
        qualificationCriteria: form.qualificationCriteria || '',
        objectionHandling: form.objectionHandling || '',
        idealNextStep: form.idealNextStep || '',
        agendaPolicy: form.agendaPolicy || '',
        objectionPlaybook: buildObjectionPlaybook(),
    });

    // ── Step validators ──────────────────────────────────────────────────────
    const validate: Record<number, () => boolean> = {
        1: () => {
            if (accountReady) return true;
            if (!form.name.trim()) { setError('Informe seu nome.'); return false; }
            if (!form.email.trim() || !form.email.includes('@')) { setError('Informe um e-mail valido.'); return false; }
            if (!form.phone.trim()) { setError('Informe seu WhatsApp.'); return false; }
            if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return false; }
            if (form.password !== form.confirmPassword) { setError('As senhas nao coincidem.'); return false; }
            return true;
        },
        2: () => { if (!form.agentObjective) { setError('Selecione o objetivo do agente.'); return false; } return true; },
        3: () => { if (!form.industry) { setError('Selecione o mercado de atuação.'); return false; } return true; },
        4: () => {
            if (!form.companyName.trim()) { setError('Informe o nome da empresa.'); return false; }
            if (!form.aiName.trim()) { setError('Dê um nome para sua IA.'); return false; }
            return true;
        },
        5: () => {
            if (form.mainProduct.length < 100) { setError(`Descreva o produto com pelo menos 100 caracteres (${form.mainProduct.length}/100).`); return false; }
            if (form.customerPain.length < 50) { setError(`Descreva a dor do cliente com pelo menos 50 caracteres (${form.customerPain.length}/50).`); return false; }
            return true;
        },
        6: () => { if (form.targetAudience.length === 0) { setError('Selecione pelo menos um público.'); return false; } return true; },
        7: () => { if (form.channels.length === 0) { setError('Selecione pelo menos um canal.'); return false; } return true; },
        8: () => { if (!form.salesCycle) { setError('Selecione o ciclo de venda.'); return false; } return true; },
        9: () => { if (!form.revenueGoal) { setError('Informe sua meta mensal.'); return false; } return true; },
        10: () => {
            if (form.objections.length === 0 && form.objectionHandling.trim().length < 20) {
                setError('Defina pelo menos uma objecao ou explique como a IA deve contorna-las.');
                return false;
            }
            return true;
        },
        11: () => { if (!form.voiceTone) { setError('Selecione o estilo da IA.'); return false; } return true; },
    };

    const next = () => {
        const v = validate[step];
        if (v && !v()) return;
        if (step === 1) { void handleCreateAccount(); return; }
        go(step + 1);
    };

    // ── Registration (Step 14) ───────────────────────────────────────────────
    const handleCreateAccount = async () => {
        if (accountReady) {
            go(2);
            return;
        }
        if (!validate[1]()) return;

        setLoading(true);
        setError('');
        try {
            let affiliateCode: string | undefined;
            try {
                const storedAffiliate = localStorage.getItem('kogna_affiliate_data');
                if (storedAffiliate) {
                    affiliateCode = JSON.parse(storedAffiliate)?.code;
                }
            } catch { }

            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    email: form.email.trim().toLowerCase(),
                    password: form.password,
                    whatsapp: form.phone.trim(),
                    affiliateCode,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao criar conta.');

            localStorage.removeItem('kogna_affiliate_data');
            localStorage.setItem('kogna_token', data.token);
            localStorage.setItem('kogna_user', JSON.stringify(data.user));
            token.current = data.token;
            setAccountReady(true);
            refreshUser().catch(() => { });
            go(2);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const uploadKnowledgeFiles = async (agentId: string, sessionToken: string) => {
        if (files.length === 0 || knowledgeUploadedAgentRef.current === agentId) return;

        const knowledgeData = new FormData();
        files.forEach((file) => knowledgeData.append('files', file));

        const uploadRes = await fetch(`/api/agents/${agentId}/upload`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${sessionToken}` },
            body: knowledgeData,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) {
            throw new Error(uploadData.error || 'Erro ao enviar os materiais para a IA.');
        }

        knowledgeUploadedAgentRef.current = agentId;
    };

    const handleActivateAgent = async () => {
        if (!token.current) {
            setError('Crie sua conta antes de ativar a IA.');
            go(1);
            return;
        }

        setLoading(true);
        setError('');
        try {
            const authHeaders = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token.current}`,
            };

            const profileRes = await fetch('/api/company-profile', {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify(buildCompanyProfilePayload()),
            });
            const profileData = await profileRes.json().catch(() => ({}));
            if (!profileRes.ok) throw new Error(profileData.error || 'Erro ao salvar o perfil da empresa.');

            let agentId = createdAgentId;
            if (!agentId) {
                const agentsRes = await fetch('/api/agents', {
                    headers: { Authorization: `Bearer ${token.current}` },
                });
                const agentsData = await agentsRes.json().catch(() => ([]));
                if (!agentsRes.ok) throw new Error(agentsData.error || 'Erro ao buscar agentes existentes.');

                const existingAgent = Array.isArray(agentsData)
                    ? agentsData.find((agent: any) => agent.name === form.aiName) || agentsData[0]
                    : null;

                if (existingAgent?.id) {
                    agentId = existingAgent.id;
                } else {
                    const createRes = await fetch('/api/agents', {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({
                            name: form.aiName || 'Agente IA',
                            type: 'sdr',
                            use_company_profile: true,
                        }),
                    });
                    const createdAgent = await createRes.json().catch(() => ({}));
                    if (!createRes.ok) throw new Error(createdAgent.error || 'Erro ao criar a IA.');
                    agentId = createdAgent.id || null;
                }
            }

            if (!agentId) {
                throw new Error('Nao foi possivel identificar a IA criada.');
            }

            setCreatedAgentId(agentId);
            await uploadKnowledgeFiles(agentId, token.current);
            refreshUser().catch(() => { });
            go(15);
        } catch (e: any) {
            setError(e.message);
            activationAttemptedRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    // ── AI Chat (Step 15) ────────────────────────────────────────────────────
    const sendChat = useCallback(async () => {
        const msg = chatInput.trim();
        if (!msg || chatLoading || msgsUsed >= 5) return;
        setChatInput('');
        const currentMessages = [...chatMessages, { role: 'user' as const, text: msg }];
        setChatMessages(currentMessages);
        setChatLoading(true);
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token.current) {
                headers.Authorization = `Bearer ${token.current}`;
            }
            const res = await fetch('/api/onboarding/preview-ai', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    session_id: sessionId,
                    message: msg,
                    // Pass full conversation history so AI has memory
                    history: chatMessages, // messages BEFORE the current one
                    onboarding_context: {
                        aiName: form.aiName, companyName: form.companyName,
                        agentObjective: form.agentObjective, mainProduct: form.mainProduct,
                        targetAudience: form.targetAudience, voiceTone: form.voiceTone,
                        industry: form.industry, restrictions: form.restrictions,
                        customerPain: form.customerPain,
                        customerDesires: form.customerDesires,
                        differentiators: form.differentiators,
                        productPrice: form.productPrice,
                        humanHandoffPolicy: form.humanHandoffPolicy,
                        objectionHandling: form.objectionHandling,
                        idealNextStep: form.idealNextStep,
                        objections: form.objections,
                    }
                }),
            });
            const data = await res.json();
            if (data.limitReached && !data.reply) {
                setMsgsUsed(5);
                return;
            }
            if (!res.ok) throw new Error(data.error || 'Erro ao processar mensagem.');
            setChatMessages(m => [...m, { role: 'ai', text: data.reply || '...' }]);
            setMsgsUsed(data.messagesUsed ?? msgsUsed + 1);
        } catch { setChatMessages(m => [...m, { role: 'ai', text: 'Erro ao processar. Tente novamente.' }]); }
        finally { setChatLoading(false); }
    }, [chatInput, chatLoading, msgsUsed, sessionId, form, chatMessages]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    // Initialize chat in step 15
    useEffect(() => {
        if (step === 15 && chatMessages.length === 0) {
            setChatMessages([{ role: 'ai', text: `Oi! Sou ${form.aiName || 'sua IA'} da ${form.companyName || 'sua empresa'}. Me conta rapidamente o que voce esta buscando para eu te conduzir da melhor forma.` }]);
        }
    }, [step]);

    // ── WhatsApp QR (Step 17) ───────────────────────────────────────────────
    const connectWhatsApp = async () => {
        if (!token.current) return;
        setWsStatus('connecting');
        setError('');
        try {
            const res = await fetch('/api/whatsapp/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token.current}` },
                body: JSON.stringify({ email: form.email, connect_agent_id: createdAgentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao conectar.');
            if (data.instance?.status === 'CONNECTED' || data.instance?.status === 'open') {
                setWsStatus('connected'); go(18);
            } else if (data.qrCode) {
                setQrCode(data.qrCode); setWsStatus('qrcode'); setWsTtl(60);
                startWsPolling();
            } else { throw new Error('QR Code não disponível.'); }
        } catch (e: any) { setError(e.message); setWsStatus('idle'); }
    };

    const startWsPolling = () => {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = setInterval(async () => {
            if (!token.current) return;
            try {
                const r = await fetch('/api/instances', { headers: { Authorization: `Bearer ${token.current}` } });
                if (r.ok) {
                    const d = await r.json();
                    const connected = Array.isArray(d) && d.some((i: any) => i.status === 'CONNECTED' || i.status === 'open');
                    if (connected) { setWsStatus('connected'); clearInterval(pollRef.current!); go(18); }
                }
            } catch { }
        }, 2000);
    };

    useEffect(() => {
        let t: ReturnType<typeof setInterval>;
        if (wsStatus === 'qrcode' && wsTtl > 0) { t = setInterval(() => setWsTtl(p => p - 1), 1000); }
        return () => clearInterval(t);
    }, [wsStatus, wsTtl]);

    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    // Auto-advance Step 13 (Pipeline animation)
    useEffect(() => {
        if (step === 13) {
            setPipelineVisible(true);
            const t = setTimeout(() => go(14), 4500);
            return () => clearTimeout(t);
        }
    }, [step]);

    useEffect(() => {
        if (step !== 14 || createdAgentId || activationAttemptedRef.current) return;
        activationAttemptedRef.current = true;
        void handleActivateAgent();
    }, [createdAgentId, step]);

    // Confetti on step 18
    useEffect(() => {
        if (step === 18) {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#FF4C00', '#FF4C00', '#FFB090', '#10B981'] });
        }
    }, [step]);

    useEffect(() => {
        if (step !== 18 || !token.current || onboardingCompletionRef.current === 'done') return;

        let cancelled = false;
        void (async () => {
            try {
                const res = await fetch('/api/onboarding/complete', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token.current}` },
                });
                if (!res.ok) throw new Error('Falha ao concluir onboarding.');
                if (cancelled) return;
                onboardingCompletionRef.current = 'done';
                refreshUser().catch(() => { });
            } catch {
                if (!cancelled) {
                    onboardingCompletionRef.current = 'idle';
                }
            }
        })();

        return () => { cancelled = true; };
    }, [refreshUser, step]);

    // ── Layout ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex overflow-x-hidden">
            {/* Subtle warm glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] bg-[#FF4C00]/4 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-[#FF4C00]/3 rounded-full blur-[120px]" />
            </div>


            {/* Content */}
            <div className="flex-1 flex min-w-0 flex-col items-center justify-start overflow-y-auto overflow-x-hidden px-4 py-8 sm:py-10 relative z-10">
                <div className="w-full max-w-lg min-w-0">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-6">
                        <BrandLogo
                            className="text-gray-900"
                            markWidth={26}
                            markHeight={34}
                            wordSize={29}
                        />
                    </div>
                    <MobileProgress step={step} />
                    {error && <ErrorBanner msg={error} />}
                    <StepContent
                        step={step} form={form} set={set} toggleArr={toggleArr}
                        handleCurrencyChange={handleCurrencyChange}
                        handleCurrencyBlur={handleCurrencyBlur}
                        handleCurrencyFocus={handleCurrencyFocus}
                        next={next} loading={loading} go={go} files={files} setFiles={setFiles}
                        chatMessages={chatMessages} chatInput={chatInput} setChatInput={setChatInput}
                        sendChat={sendChat} chatLoading={chatLoading} msgsUsed={msgsUsed}
                        chatEndRef={chatEndRef} pipelineVisible={pipelineVisible}
                        qrCode={qrCode} wsStatus={wsStatus} wsTtl={wsTtl}
                        connectWhatsApp={connectWhatsApp} navigate={navigate}
                        retryActivation={handleActivateAgent}
                        improvementSelected={improvementSelected}
                        setImprovementSelected={setImprovementSelected}
                        improvementDetail={improvementDetail}
                        setImprovementDetail={setImprovementDetail}
                        improvementSending={improvementSending}
                        setImprovementSending={setImprovementSending}
                        token={token.current || (accountReady ? 'account-ready' : null)}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Step Content ───────────────────────────────────────────────────────────────
function StepContent({ step, form, set, toggleArr, handleCurrencyChange, handleCurrencyBlur, handleCurrencyFocus, next, loading, go, files, setFiles,
    chatMessages, chatInput, setChatInput, sendChat, chatLoading, msgsUsed, chatEndRef,
    pipelineVisible, qrCode, wsStatus, wsTtl, connectWhatsApp, navigate, retryActivation,
    improvementSelected, setImprovementSelected, improvementDetail, setImprovementDetail,
    improvementSending, setImprovementSending, token }: any) {

    const INDUSTRIES = [
        { v: 'imobiliario', l: 'Imobiliário', sub: ['Venda de imóveis', 'Aluguel de imóveis', 'Venda e aluguel'] },
        { v: 'educacao', l: 'Educação', sub: ['Cursos online', 'Escola presencial', 'Mentoria'] },
        { v: 'saude', l: 'Clínicas e Saúde', sub: ['Odontologia', 'Estética', 'Medicina', 'Nutrição'] },
        { v: 'seguros', l: 'Seguros', sub: ['Seguro de vida', 'Seguro auto', 'Seguro empresarial'] },
        { v: 'consultoria', l: 'Consultorias', sub: ['Consultoria empresarial', 'Consultoria de RH', 'Jurídica'] },
        { v: 'tecnologia', l: 'Tecnologia', sub: ['SaaS / Software', 'Suporte TI', 'Desenvolvimento'] },
        { v: 'servicos', l: 'Serviços locais', sub: ['Manutenção', 'Limpeza', 'Reforma', 'Jardinagem'] },
        { v: 'ecommerce', l: 'E-commerce', sub: ['Produto físico', 'Dropshipping', 'Marketplace'] },
        { v: 'outro', l: 'Outro', sub: [] },
    ];

    const selectedIndustry = INDUSTRIES.find(i => i.v === form.industry);

    if (step === 1) return (
        <div className="space-y-5 animate-fade-in">
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF4C00]/20 to-[#FF6A30]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#FF4C00]/20">
                    <Rocket className="w-10 h-10 text-[#FF4C00]" />
                </div>
                <p className="mt-5 text-xs font-bold text-[#FF4C00] uppercase tracking-widest mb-2">Passo 1 - Conta</p>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {token ? 'Sua conta ja esta pronta' : 'Crie sua conta para montar sua IA'}
                </h1>
                <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-sm mx-auto">
                    {token
                        ? 'Agora vamos coletar os dados da operacao para configurar seu primeiro agente de vendas.'
                        : 'Antes de criar sua IA, precisamos registrar sua conta na plataforma para salvar tudo com seguranca.'}
                </p>
            </div>

            {token ? (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-[#FF4C00]/15 bg-[#FF4C00]/5 p-4">
                        <p className="text-sm font-semibold text-gray-900">{form.name || 'Conta criada com sucesso'}</p>
                        <p className="text-xs text-gray-500 mt-1">{form.email || 'Sessao autenticada na Kogna'}</p>
                    </div>
                    <div className="flex flex-col gap-3 text-left">
                        {[
                            { icon: Brain, t: 'Definir objetivo e comportamento do agente' },
                            { icon: GitBranch, t: 'Montar o pipeline e o playbook comercial' },
                            { icon: MessageSquare, t: 'Testar a IA e conectar ao WhatsApp' },
                        ].map(({ icon: Icon, t }) => (
                            <div key={t} className="flex items-center gap-3 text-sm text-gray-600">
                                <div className="w-7 h-7 rounded-lg bg-[#FF4C00]/15 border border-[#FF4C00]/20 flex items-center justify-center shrink-0">
                                    <Icon className="w-3.5 h-3.5 text-[#FF4C00]" />
                                </div>
                                {t}
                            </div>
                        ))}
                    </div>
                    <NextBtn onClick={next} label="Continuar configuracao" />
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        <div><FieldLabel>Nome completo</FieldLabel><Input placeholder="Joao Silva" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                        <div><FieldLabel>E-mail</FieldLabel><Input type="email" placeholder="joao@empresa.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                        <div><FieldLabel>WhatsApp</FieldLabel><Input type="tel" placeholder="DDD + NUMERO" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                        <div><FieldLabel>Senha</FieldLabel><Input type="password" placeholder="Minimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} /></div>
                        <div><FieldLabel>Confirmar senha</FieldLabel><Input type="password" placeholder="Confirme sua senha" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} /></div>
                    </div>
                    <NextBtn onClick={next} loading={loading} label="Criar conta e continuar" />
                    <p className="text-center text-xs text-gray-400">Sem cartao de credito - Gratis para comecar</p>
                </>
            )}
        </div>
    );

    if (step === 101) return (
        <div className="text-center space-y-6 animate-fade-in mt-10 sm:mt-16 min-w-0">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF4C00]/20 to-[#FF6A30]/10 rounded-3xl flex items-center justify-center mx-auto border border-[#FF4C00]/20">
                <Rocket className="w-12 h-12 text-[#FF4C00]" />
            </div>
            <div>
                <p className="text-xs font-bold text-[#FF4C00] uppercase tracking-widest mb-3">Revenue Operating System</p>
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">Bem-vindo à Nova Era<br />das Vendas no WhatsApp</h1>
                <p className="text-gray-500 mt-4 text-lg leading-relaxed max-w-sm mx-auto">
                    Você está a poucos passos de transformar seu WhatsApp em um sistema inteligente de vendas que atende, qualifica e recupera clientes automaticamente.
                </p>
            </div>
            <div className="flex flex-col gap-3 max-w-xs mx-auto text-left mt-6">
                {[
                    { icon: Brain, t: 'Crie sua IA de vendas personalizada' },
                    { icon: GitBranch, t: 'Monte um pipeline automático de oportunidades' },
                    { icon: MessageSquare, t: 'Conecte ao WhatsApp e comece a vender' },
                ].map(({ icon: Icon, t }) => (
                    <div key={t} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-7 h-7 rounded-lg bg-[#FF4C00]/15 border border-[#FF4C00]/20 flex items-center justify-center shrink-0">
                            <Icon className="w-3.5 h-3.5 text-[#FF4C00]" />
                        </div>
                        {t}
                    </div>
                ))}
            </div>
            <NextBtn onClick={next} label="Iniciar Ativação" />
            <p className="text-xs text-gray-400">Sem cartão de crédito · Grátis para começar</p>
        </div>
    );

    if (step === 2) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 2 — Agente</p>
                <h2 className="text-2xl font-bold text-gray-900">Crie seu primeiro Agente de Vendas</h2>
                <p className="text-gray-500 text-sm mt-2">Esse será o primeiro agente da sua empresa responsável por conduzir oportunidades no WhatsApp.</p>
            </div>
            <FieldLabel>Qual o objetivo principal desse agente?</FieldLabel>
            <div className="space-y-3">
                {[
                    { v: 'fechar_venda', l: 'Fechar vendas diretamente no WhatsApp', d: 'IA fecha o negócio sozinha, sem intervenção humana' },
                    { v: 'qualificar_agendar', l: 'Qualificar e agendar reunião com um vendedor', d: 'IA qualifica e transfere para um humano fechar' },
                    { v: 'aquecer_transferir', l: 'Aquecer o lead e transferir para um vendedor', d: 'IA cria interesse e passa o contato qualificado' },
                ].map(o => <ChoiceCard key={o.v} value={o.v} label={o.l} desc={o.d} selected={form.agentObjective === o.v} onClick={() => set('agentObjective', o.v)} />)}
            </div>
            <p className="text-xs text-gray-400 text-center">Você poderá criar outros agentes especializados depois.</p>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 3) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 3 — Mercado</p>
                <h2 className="text-2xl font-bold text-gray-900">Em qual mercado sua empresa atua?</h2>
                <p className="text-gray-500 text-sm mt-2">Isso adapta linguagem, objeções e padrões de conversa da sua IA.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {INDUSTRIES.map(i => (
                    <button key={i.v} onClick={() => set('industry', i.v)}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border text-left transition-all ${form.industry === i.v ? 'border-[#FF4C00] bg-[#FF4C00]/10 text-[#FF4C00]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
                        {form.industry === i.v && <Check className="w-3 h-3 inline mr-1.5 text-[#FF4C00]" />}{i.l}
                    </button>
                ))}
            </div>
            {selectedIndustry && selectedIndustry.sub.length > 0 && (
                <div className="animate-fade-in space-y-2">
                    <FieldLabel>Sua empresa trabalha com:</FieldLabel>
                    <div className="space-y-2">
                        {selectedIndustry.sub.map(s => (
                            <ChoiceCard key={s} value={s} label={s} selected={form.industryDetail === s} onClick={() => set('industryDetail', s)} />
                        ))}
                    </div>
                </div>
            )}
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 4) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 4 — Identidade</p>
                <h2 className="text-2xl font-bold text-gray-900">Quem representará sua empresa?</h2>
                <p className="text-gray-500 text-sm mt-2">Esse será o nome que aparecerá nas conversas do WhatsApp.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <FieldLabel>Nome da empresa</FieldLabel>
                    <Input placeholder="Ex: Clínica Vida+" value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                </div>
                <div>
                    <FieldLabel>Nome da IA</FieldLabel>
                    <Input placeholder="Ex: Ana, Max, Clara..." value={form.aiName} onChange={e => set('aiName', e.target.value)} />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['Ana', 'Max', 'Clara', 'Lia', 'Leo', 'Nina', 'Sol'].map(n => (
                            <button key={n} onClick={() => set('aiName', n)}
                                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-400 hover:border-[#FF4C00]/50 hover:text-[#FF4C00] transition-colors">{n}</button>
                        ))}
                    </div>
                </div>
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 5) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 5 — Produto</p>
                <h2 className="text-2xl font-bold text-gray-900">O que sua empresa vende?</h2>
            </div>
            <div className="space-y-4">
                <div>
                    <FieldLabel counter={<span className={form.mainProduct.length < 100 ? 'text-red-400' : 'text-green-400'}>{form.mainProduct.length}/100</span>}>Produto ou serviço principal</FieldLabel>
                    <Textarea rows={4} placeholder="Descreva detalhadamente o que você vende, diferenciais e o valor que entrega para o cliente..." value={form.mainProduct} onChange={e => set('mainProduct', e.target.value)} />
                </div>
                <div>
                    <FieldLabel counter={<span className={form.customerPain.length < 50 ? 'text-red-400' : 'text-green-400'}>{form.customerPain.length}/50</span>}>Qual problema seu cliente quer resolver?</FieldLabel>
                    <Textarea rows={3} placeholder="Ex: O cliente tem medo de dentista e quer um atendimento humanizado..." value={form.customerPain} onChange={e => set('customerPain', e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <FieldLabel>Qual resultado o cliente deseja?</FieldLabel>
                        <Textarea rows={3} placeholder="Ex: crescer receita com previsibilidade, ganhar tempo, vender com mais clareza..." value={form.customerDesires} onChange={e => set('customerDesires', e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>Quais diferenciais tornam sua oferta forte?</FieldLabel>
                        <Textarea rows={3} placeholder="Ex: implantacao rapida, suporte consultivo, metodologia proprietaria..." value={form.differentiators} onChange={e => set('differentiators', e.target.value)} />
                    </div>
                </div>
                <div>
                    <FieldLabel>Preço ou ticket médio <span className="text-gray-400 normal-case tracking-normal">(opcional)</span></FieldLabel>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none select-none">R$</span>
                        <Input placeholder="1.500,00" value={form.productPrice} className="pl-10" inputMode="decimal"
                            onChange={e => handleCurrencyChange('productPrice', e.target.value)}
                            onBlur={e => handleCurrencyBlur('productPrice', e.target.value)}
                            onFocus={e => handleCurrencyFocus('productPrice', e.target.value)} />
                    </div>
                </div>
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 6) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 6 — Público</p>
                <h2 className="text-2xl font-bold text-gray-900">Para quem você vende?</h2>
                <p className="text-gray-500 text-sm mt-2">Pode selecionar ambos.</p>
            </div>
            <div className="space-y-3">
                {[
                    { v: 'Pessoa Física', d: 'Consumidores individuais, B2C' },
                    { v: 'Pessoa Jurídica', d: 'Empresas e negócios, B2B' },
                ].map(o => <ChoiceCard key={o.v} value={o.v} label={o.v} desc={o.d}
                    selected={form.targetAudience.includes(o.v)} onClick={() => toggleArr('targetAudience', o.v)} />)}
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 7) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 7 — Canais</p>
                <h2 className="text-2xl font-bold text-gray-900">Como seus clientes chegam até você?</h2>
            </div>
            <div className="flex flex-wrap gap-2">
                {['Instagram', 'Google', 'Indicação', 'WhatsApp direto', 'Facebook', 'Anúncios pagos', 'LinkedIn', 'Outros'].map(c => (
                    <MultiChip key={c} label={c} selected={form.channels.includes(c)} onClick={() => toggleArr('channels', c)} />
                ))}
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 8) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 8 — Ciclo</p>
                <h2 className="text-2xl font-bold text-gray-900">Quanto tempo leva para fechar uma venda?</h2>
                <p className="text-gray-500 text-sm mt-2">A IA vai adaptar o timing das mensagens ao seu ciclo.</p>
            </div>
            <div className="space-y-3">
                {[
                    { v: 'horas', l: 'Horas', d: 'Decisão imediata, impulso' },
                    { v: 'dias', l: 'Dias', d: '1 a 7 dias de avaliação' },
                    { v: 'semanas', l: 'Semanas', d: 'Ciclo médio de 1 a 4 semanas' },
                    { v: 'meses', l: 'Meses', d: 'Ciclos longos de negociação' },
                ].map(o => <ChoiceCard key={o.v} value={o.v} label={o.l} desc={o.d} selected={form.salesCycle === o.v} onClick={() => set('salesCycle', o.v)} />)}
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 9) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 9 — Meta</p>
                <h2 className="text-2xl font-bold text-gray-900">Qual sua meta mensal de vendas?</h2>
                <p className="text-gray-500 text-sm mt-2">A Kogna usará essa meta para gerar recomendações e priorizar oportunidades.</p>
            </div>
            <div>
                <FieldLabel>Meta mensal (R$)</FieldLabel>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none select-none">R$</span>
                    <Input placeholder="50.000,00" value={form.revenueGoal} className="pl-10" inputMode="decimal"
                        onChange={e => handleCurrencyChange('revenueGoal', e.target.value)}
                        onBlur={e => handleCurrencyBlur('revenueGoal', e.target.value)}
                        onFocus={e => handleCurrencyFocus('revenueGoal', e.target.value)} />
                </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
                {['5000', '10000', '25000', '50000', '100000', '250000'].map(v => (
                    <button key={v} onClick={() => set('revenueGoal', formatCurrencyInputBRL(v))}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-[#FF4C00]/50 hover:text-[#FF4C00] transition-colors font-mono">
                        R$ {parseInt(v).toLocaleString('pt-BR')}
                    </button>
                ))}
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 10) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 10 - Objecoes</p>
                <h2 className="text-2xl font-bold text-gray-900">Como a IA deve quebrar objecoes?</h2>
                <p className="text-gray-500 text-sm mt-2">Mapeie as objecoes mais comuns, diga o que funciona e qual proximo passo ideal a IA deve puxar.</p>
            </div>
            <div className="space-y-4">
                <div>
                    <FieldLabel>Objecoes mais frequentes</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                        {['Preco', 'Timing', 'Concorrente', 'Preciso pensar', 'Falta de confianca', 'Sem urgencia'].map((label) => (
                            <MultiChip
                                key={label}
                                label={label}
                                selected={form.objections.includes(label)}
                                onClick={() => toggleArr('objections', label)}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <FieldLabel>Como a IA deve contornar essas objecoes</FieldLabel>
                    <Textarea
                        rows={4}
                        value={form.objectionHandling}
                        onChange={e => set('objectionHandling', e.target.value)}
                        placeholder="Ex: primeiro valida a preocupacao, depois conecta valor ao resultado e fecha com uma CTA unica."
                    />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <FieldLabel>Sinais de compra importantes</FieldLabel>
                        <Textarea
                            rows={4}
                            value={form.buyingSignals}
                            onChange={e => set('buyingSignals', e.target.value)}
                            placeholder="Ex: pediu preco, pediu agenda, comparou planos, falou de urgencia..."
                        />
                    </div>
                    <div>
                        <FieldLabel>Proximo passo ideal apos contornar</FieldLabel>
                        <Textarea
                            rows={4}
                            value={form.idealNextStep}
                            onChange={e => set('idealNextStep', e.target.value)}
                            placeholder="Ex: levar para agenda, mostrar proposta, apresentar produto ou pedir contexto."
                        />
                    </div>
                </div>
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 11) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 11 - Conducao</p>
                <h2 className="text-2xl font-bold text-gray-900">Como a IA deve operar no dia a dia?</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                    <FieldLabel>Tom de voz</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {['Consultiva', 'Direta', 'Amigavel', 'Executiva', 'Educadora'].map(tone => (
                            <button key={tone} onClick={() => set('voiceTone', tone)}
                                className={`py-3 px-4 rounded-xl text-sm font-semibold border transition-all ${form.voiceTone === tone ? 'border-[#FF4C00] bg-[#FF4C00]/15 text-[#FF4C00]' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}>
                                {form.voiceTone === tone && <Check className="w-3 h-3 inline mr-1 text-[#FF4C00]" />}{tone}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <FieldLabel>Quando a IA nao souber responder</FieldLabel>
                    <Textarea rows={4} value={form.unknownBehavior} onChange={e => set('unknownBehavior', e.target.value)} placeholder="Ex: reconhece o limite, ganha contexto e oferece um proximo passo seguro." />
                </div>
                <div>
                    <FieldLabel>Quando envolver um humano</FieldLabel>
                    <Textarea rows={4} value={form.humanHandoffPolicy} onChange={e => set('humanHandoffPolicy', e.target.value)} placeholder="Explique quando a equipe deve ser avisada e como a IA continua ate o takeover." />
                </div>
                <div>
                    <FieldLabel>Definicao de bom lead</FieldLabel>
                    <Textarea rows={4} value={form.qualificationCriteria} onChange={e => set('qualificationCriteria', e.target.value)} placeholder="Ex: lead com dor clara, urgencia e abertura para agenda ou proposta." />
                </div>
                <div>
                    <FieldLabel>Politica de agenda</FieldLabel>
                    <Textarea rows={4} value={form.agendaPolicy} onChange={e => set('agendaPolicy', e.target.value)} placeholder="Explique quando vale oferecer agenda, demo ou call comercial." />
                </div>
                <div className="md:col-span-2">
                    <FieldLabel>Coisas que a IA nunca deve dizer</FieldLabel>
                    <Textarea rows={3} value={form.restrictions} onChange={e => set('restrictions', e.target.value)} placeholder="Ex: nao prometer desconto, nao mencionar concorrentes, nao soar defensiva..." />
                </div>
            </div>
            <NextBtn onClick={next} />
        </div>
    );

    if (step === 12) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 12 — Conhecimento</p>
                <h2 className="text-2xl font-bold text-gray-900">Transfira conhecimento para sua IA</h2>
                <p className="text-gray-500 text-sm mt-2">Envie materiais que ajudam a IA a entender melhor seu negócio.</p>
            </div>
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 rounded-2xl py-10 cursor-pointer hover:border-violet-500/40 hover:bg-violet-500/4 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#FF4C00]/15 border border-[#FF4C00]/20 flex items-center justify-center group-hover:bg-[#FF4C00]/25 transition-colors">
                    <Upload className="w-5 h-5 text-[#FF4C00]" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-600 font-medium">PDFs, documentos, manuais, apresentações</p>
                    <p className="text-xs text-gray-400 mt-1">Clique para selecionar (máx. 4MB cada)</p>
                </div>
                <input type="file" multiple accept=".pdf,.txt,.doc,.docx" className="hidden"
                    onChange={e => setFiles(Array.from(e.target.files || []))} />
            </label>
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((f: File, i: number) => (
                        <div key={i} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="w-7 h-7 bg-[#FF4C00]/20 rounded-md flex items-center justify-center shrink-0">
                                <Upload className="w-3.5 h-3.5 text-[#FF4C00]" />
                            </div>
                            <span className="text-xs text-gray-600 truncate flex-1">{f.name}</span>
                            <span className="text-[10px] text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                        </div>
                    ))}
                </div>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => go(13)} className="px-5 py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded-xl sm:flex-none">Pular</button>
                <button onClick={next} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#FF4C00]/20">Continuar <ChevronRight className="w-4 h-4" /></button>
            </div>
        </div>
    );

    if (step === 13) return (
        <div className="space-y-6 animate-fade-in text-center">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 13 — Pipeline</p>
                <h2 className="text-2xl font-bold text-gray-900">Seu sistema de vendas está sendo criado</h2>
                <p className="text-gray-500 text-sm mt-2">A Kogna organiza automaticamente suas conversas em um pipeline inteligente.</p>
            </div>
            <div className="relative py-6">
                {['Novo Lead', 'Qualificação', 'Diagnóstico', 'Proposta', 'Fechamento'].map((stage, i) => (
                    <div key={stage} className={`flex items-center gap-3 mb-4 transition-all duration-500 ${pipelineVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                        style={{ transitionDelay: `${i * 400}ms` }}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4C00] to-[#FF6A30] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#FF4C00]/20 shrink-0 relative z-10">
                            {pipelineVisible ? <Check className="w-4 h-4" /> : i + 1}
                        </div>
                        <div className="flex-1 text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                            <p className="text-sm font-semibold text-gray-900">{stage}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-[#FF4C00] text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Configurando sua inteligência de vendas...
            </div>
            <p className="text-gray-400 text-xs">Cada conversa vira uma oportunidade de negócio.</p>
        </div>
    );

    if (step === 14) return (
        <div className="space-y-6 animate-fade-in text-center">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 14 - Ativacao</p>
                <h2 className="text-2xl font-bold text-gray-900">Estamos criando sua IA agora</h2>
                <p className="text-gray-500 text-sm mt-2">Com a conta pronta, a Kogna esta salvando o perfil da sua empresa e provisionando seu primeiro agente.</p>
            </div>
            <div className="relative py-6">
                {[
                    'Salvando perfil da operacao',
                    'Gerando playbook comercial',
                    'Criando agente principal',
                    'Preparando ambiente para teste',
                ].map((stage, i) => (
                    <div key={stage} className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4C00] to-[#FF6A30] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#FF4C00]/20 shrink-0">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" style={{ animationDelay: `${i * 120}ms` }} /> : i + 1}
                        </div>
                        <div className="flex-1 text-left bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">{stage}</p>
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-gray-400 text-xs">Isso leva alguns segundos e acontece uma vez por conta.</p>
            <button
                onClick={() => void retryActivation?.()}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#FF4C00]/20 disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Tentar novamente <ChevronRight className="w-4 h-4" /></>}
            </button>
        </div>
    );

    if (step === 140) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 14 — Conta</p>
                <h2 className="text-2xl font-bold text-gray-900">Crie sua conta para ativar sua IA</h2>
                <p className="text-gray-500 text-sm mt-2">Falta apenas um passo para ativar sua IA.</p>
            </div>
            <div className="space-y-3">
                <div><FieldLabel>Nome completo</FieldLabel><Input placeholder="João Silva" value={form.name} onChange={e => set('name', e.target.value)} /></div>
                <div><FieldLabel>E-mail</FieldLabel><Input type="email" placeholder="joao@empresa.com" value={form.email} onChange={e => set('email', e.target.value)} /></div>
                <div><FieldLabel>WhatsApp</FieldLabel><Input type="tel" placeholder="DDD + NÚMERO" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                <div><FieldLabel>Senha</FieldLabel><Input type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={e => set('password', e.target.value)} /></div>
                <div><FieldLabel>Confirmar senha</FieldLabel><Input type="password" placeholder="Confirme sua senha" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} /></div>
            </div>
            <NextBtn onClick={next} loading={loading} label="Criar Conta e Ativar IA" />
            <p className="text-center text-xs text-gray-400">Ao continuar, você concorda com os termos de uso da Kogna.</p>
        </div>
    );

    if (step === 15) {
        const isLimitReached = msgsUsed >= 5;
        return (
            <div className="space-y-4 animate-fade-in">
                <div>
                    <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 15 — Teste</p>
                    <h2 className="text-2xl font-bold text-gray-900">Vamos fazer um teste rápido</h2>
                    <p className="text-gray-500 text-sm mt-1">Converse com sua IA como se fosse um cliente. Limite de 5 troca de mensagens.</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-semibold text-gray-900">{form.aiName || 'IA'}</span>
                        <span className={`w-full text-left text-xs font-medium sm:ml-auto sm:w-auto sm:text-right ${isLimitReached ? 'text-red-400' : 'text-gray-400'}`}>
                            {isLimitReached ? 'Limite atingido' : `${5 - msgsUsed} mensagem${5 - msgsUsed !== 1 ? 's' : ''} restante${5 - msgsUsed !== 1 ? 's' : ''}`}
                        </span>
                    </div>
                    <div className="h-72 overflow-y-auto p-4 space-y-3 flex flex-col">
                        {chatMessages.map((m: { role: string; text: string }, i: number) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role === 'ai' && (
                                    <div className="w-6 h-6 rounded-full bg-[#FF4C00] flex items-center justify-center mr-2 shrink-0 mt-1">
                                        <Bot className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[#FF4C00] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex justify-start">
                                <div className="w-6 h-6 rounded-full bg-[#FF4C00] flex items-center justify-center mr-2 shrink-0">
                                    <Bot className="w-3 h-3 text-white" />
                                </div>
                                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                                    {[0, 1, 2].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${d * 150}ms` }} />)}
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    {!isLimitReached ? (
                        <div className="flex min-w-0 gap-2 p-3 border-t border-gray-200">
                            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                                placeholder="Escreva como se fosse um cliente..." disabled={chatLoading}
                                className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF4C00]/60 transition-all" />
                            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                                className="w-10 h-10 rounded-xl bg-[#FF4C00] hover:bg-[#FF6A30] disabled:opacity-40 flex items-center justify-center transition-colors shrink-0">
                                <Send className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 border-t border-gray-200 bg-amber-50/60">
                            <p className="text-xs text-gray-500 text-center">Limite de teste atingido.</p>
                        </div>
                    )}
                </div>

                {isLimitReached ? (
                    <div className="rounded-2xl border border-[#FF4C00]/20 bg-[#FF4C00]/5 p-5 space-y-3 animate-fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#FF4C00] flex items-center justify-center shrink-0">
                                <Rocket className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Teste concluído! 🎉</p>
                                <p className="text-xs text-gray-500">Isso é só o começo — você pode melhorar ainda mais sua IA.</p>
                            </div>
                        </div>
                        <button onClick={() => go(16)}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#FF4C00]/20">
                            Melhorar minha IA <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <NextBtn onClick={() => go(16)} label="Finalizar teste" />
                )}
            </div>
        );
    }

    if (step === 16) return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 16 — Melhorar IA</p>
                <h2 className="text-2xl font-bold text-gray-900">Sua IA já está funcionando</h2>
                <p className="text-gray-500 text-sm mt-2">Mas você pode melhorar ela rapidamente.</p>
            </div>
            <div className="space-y-2">
                {['Ajustar abordagem de vendas', 'Adicionar informações importantes', 'Melhorar resposta de objeções', 'Ajustar tom de voz'].map(opt => (
                    <button key={opt}
                        onClick={() => { setImprovementSelected(opt); setImprovementDetail(''); }}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${improvementSelected === opt
                            ? 'border-[#FF4C00]/60 bg-[#FF4C00]/10 text-[#FF4C00]'
                            : 'border-gray-200 text-gray-600 hover:border-[#FF4C00]/40 hover:text-[#FF4C00] hover:bg-[#FF4C00]/5'
                            }`}>
                        {opt} {improvementSelected === opt ? '✓' : '→'}
                    </button>
                ))}
            </div>
            {improvementSelected && (
                <div className="space-y-3 animate-fade-in">
                    <p className="text-xs text-gray-500">Descreva o que você quer melhorar em <span className="text-[#FF4C00] font-semibold">{improvementSelected}</span>:</p>
                    <textarea
                        value={improvementDetail}
                        onChange={e => setImprovementDetail(e.target.value)}
                        placeholder="Ex: Quero que a IA seja mais direta ao mencionar o preço e não rodeie tanto..."
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF4C00]/60 resize-none transition-all"
                    />
                    <button
                        disabled={!improvementDetail.trim() || improvementSending}
                        onClick={async () => {
                            setImprovementSending(true);
                            try {
                                await fetch('/api/company-profile/feedback', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token.current}` },
                                    body: JSON.stringify({
                                        category: improvementSelected,
                                        detail: improvementDetail,
                                        transcript: chatMessages,
                                    })
                                });
                            } catch (_) { /* best-effort */ } finally {
                                setImprovementSending(false);
                                go(17);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-lg shadow-[#FF4C00]/20">
                        {improvementSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : 'Enviar e continuar →'}
                    </button>
                </div>
            )}
            <div className="flex items-center gap-3">
                <button onClick={() => go(17)} className="flex-1 py-3 text-sm text-gray-400 hover:text-gray-500 border border-gray-200 rounded-xl transition-colors">
                    {improvementSelected ? 'Pular esta melhoria' : 'Concluir treinamento da IA'} →
                </button>
            </div>
        </div>
    );

    if (step === 17) return (
        <div className="space-y-5 animate-fade-in">
            <div>
                <p className="text-xs text-[#FF4C00] font-bold uppercase tracking-widest mb-1">Passo 17 — WhatsApp</p>
                <h2 className="text-2xl font-bold text-gray-900">Conecte sua IA ao WhatsApp</h2>
                <p className="text-gray-500 text-sm mt-2">Agora vamos dar voz à sua IA no WhatsApp.</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-4">
                {wsStatus === 'idle' && (
                    <>
                        <div className="w-16 h-16 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center">
                            <MessageSquare className="w-8 h-8 text-[#25D366]" />
                        </div>
                        <p className="text-sm text-gray-500 text-center">Clique abaixo para gerar o QR Code de conexão.</p>
                        <button onClick={connectWhatsApp}
                            className="px-6 py-3 bg-[#25D366] hover:bg-[#20c45e] text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-[#25D366]/20">
                            Conectar WhatsApp
                        </button>
                    </>
                )}
                {wsStatus === 'connecting' && (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 className="w-8 h-8 text-[#FF4C00] animate-spin" />
                        <p className="text-sm text-gray-500">Gerando QR Code...</p>
                    </div>
                )}
                {wsStatus === 'qrcode' && qrCode && (
                    <>
                        <img src={qrCode} alt="QR Code" className="w-48 h-48 max-w-full rounded-xl border border-gray-200" />
                        <p className="text-xs text-gray-500 text-center">Abra o WhatsApp → Aparelhos conectados → Conectar aparelho</p>
                        <span className="text-xs font-mono text-gray-400">{wsTtl}s</span>
                    </>
                )}
                {wsStatus === 'connected' && (
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
                            <Check className="w-7 h-7 text-green-400" />
                        </div>
                        <p className="text-sm font-semibold text-green-400">WhatsApp conectado!</p>
                    </div>
                )}
            </div>
            <button onClick={() => go(18)} className="w-full py-3 text-sm text-gray-400 hover:text-gray-500 transition-colors">
                Pular e conectar depois →
            </button>
        </div>
    );

    if (step === 18) return (
        <div className="text-center space-y-6 animate-fade-in mt-8">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF4C00]/20 to-green-500/20 rounded-3xl flex items-center justify-center mx-auto border border-[#FF4C00]/20 shadow-2xl shadow-[#FF4C00]/10">
                <Trophy className="w-12 h-12 text-yellow-400" />
            </div>
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF4C00]/15 border border-[#FF4C00]/25 rounded-full text-[#FF4C00] text-xs font-bold mb-4">
                    <Zap className="w-3 h-3" /> Ativação Completa
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{form.aiName || 'Sua IA'} está ativa e pronta</h1>
                <p className="text-gray-500 text-sm mt-3 leading-relaxed max-w-sm mx-auto">
                    A partir de agora ela poderá atender novos leads, qualificar oportunidades e transformar conversas em vendas.
                </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-3">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">O que foi criado para você</p>
                {[
                    { l: `Agente ${form.aiName || 'IA'} configurado` },
                    { l: 'Pipeline de vendas automático' },
                    { l: 'Painel de métricas ativo' },
                    { l: 'Motor de qualificação de leads' },
                ].map(({ l }) => (
                    <div key={l} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-green-500/15 border border-green-500/20 flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <span className="text-sm text-gray-700">{l}</span>
                    </div>
                ))}
            </div>
            <div className="bg-gradient-to-r from-[#FF4C00]/15 to-orange-500/10 border border-[#FF4C00]/25 rounded-2xl p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FF4C00]/20 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-[#FF4C00] fill-[#FF4C00]/50" />
                    </div>
                    <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-[#FF4C00]">+100 Koins creditados</p>
                        <p className="text-xs text-gray-500">As Koins será usada para abastecer sua IA e atender seus clientes</p>
                    </div>
                </div>
            </div>
            <p className="text-gray-400 text-sm">Parabéns, <strong className="text-gray-700">{form.name || 'empreendedor'}</strong>. Seu sistema de vendas no WhatsApp foi criado.</p>
            <button onClick={() => navigate('/dashboard/revenue-metrics')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#FF4C00] to-[#FF6A30] hover:brightness-110 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-[#FF4C00]/20">
                <Rocket className="w-4 h-4" /> Ir para o Dashboard
            </button>
        </div>
    );

    return null;
}
