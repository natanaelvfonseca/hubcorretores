import { useEffect, useMemo, useState } from 'react';
import {
    ArrowDown,
    ArrowUp,
    Copy,
    FileVideo,
    ListChecks,
    MonitorPlay,
    PlayCircle,
    Plus,
    RefreshCcw,
    Save,
    Trash2,
    Wand2,
} from 'lucide-react';

type StepInputType = 'none' | 'choice' | 'text' | 'textarea';

interface VideoOnboardingStep {
    id: string;
    title: string;
    subtitle: string;
    prompt: string;
    videoUrl: string;
    inputType: StepInputType;
    choices: string[];
    ctaLabel: string;
    placeholder: string;
    required: boolean;
}

const STORAGE_KEY = 'kogna-video-onboarding-mvp-definition';

const DEFAULT_STEPS: VideoOnboardingStep[] = [
    {
        id: crypto.randomUUID(),
        title: 'Boas-vindas',
        subtitle: 'Abra a jornada explicando rapidamente o que a Kogna vai organizar para o cliente.',
        prompt: 'Dê o contexto do onboarding em vídeo e prepare a pessoa para responder de forma rápida.',
        videoUrl: '',
        inputType: 'none',
        choices: [],
        ctaLabel: 'Quero continuar',
        placeholder: '',
        required: false,
    },
    {
        id: crypto.randomUUID(),
        title: 'Qual é o momento da operação?',
        subtitle: 'Use uma pergunta curta para entender em que estágio a empresa está.',
        prompt: 'Em poucas palavras, o que mais você quer organizar na sua operação comercial agora?',
        videoUrl: '',
        inputType: 'textarea',
        choices: [],
        ctaLabel: 'Salvar resposta',
        placeholder: 'Ex.: organizar o WhatsApp, melhorar atendimento, estruturar follow-up...',
        required: true,
    },
    {
        id: crypto.randomUUID(),
        title: 'Objetivo principal',
        subtitle: 'Mostre opções prontas para acelerar a escolha e não depender de digitação.',
        prompt: 'Qual destes objetivos representa melhor o que você quer conquistar primeiro?',
        videoUrl: '',
        inputType: 'choice',
        choices: ['Captar mais leads', 'Responder mais rápido', 'Vender pelo WhatsApp', 'Organizar a operação'],
        ctaLabel: 'Avançar',
        placeholder: '',
        required: true,
    },
    {
        id: crypto.randomUUID(),
        title: 'Fechamento do MVP',
        subtitle: 'Finalize com uma tela simples de confirmação do próximo passo.',
        prompt: 'Perfeito. Com essas respostas, já dá para personalizar a próxima fase do onboarding.',
        videoUrl: '',
        inputType: 'none',
        choices: [],
        ctaLabel: 'Concluir jornada',
        placeholder: '',
        required: false,
    },
];

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

function StepInputLabel({ inputType }: { inputType: StepInputType }) {
    const labels: Record<StepInputType, string> = {
        none: 'Sem resposta',
        choice: 'Escolha',
        text: 'Texto curto',
        textarea: 'Texto longo',
    };

    return <span>{labels[inputType]}</span>;
}

function createStep(): VideoOnboardingStep {
    return {
        id: crypto.randomUUID(),
        title: 'Nova etapa',
        subtitle: 'Explique o objetivo desta etapa em uma frase.',
        prompt: 'Escreva aqui o texto principal que acompanha o vídeo.',
        videoUrl: '',
        inputType: 'none',
        choices: [],
        ctaLabel: 'Continuar',
        placeholder: '',
        required: false,
    };
}

function toEmbedUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return null;

    try {
        const parsed = new URL(trimmed);
        if (parsed.hostname.includes('youtube.com')) {
            const videoId = parsed.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
        }
        if (parsed.hostname.includes('youtu.be')) {
            const videoId = parsed.pathname.replace('/', '');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : trimmed;
        }
        if (parsed.hostname.includes('vimeo.com')) {
            const videoId = parsed.pathname.split('/').filter(Boolean).pop();
            return videoId ? `https://player.vimeo.com/video/${videoId}` : trimmed;
        }
        return trimmed;
    } catch {
        return trimmed;
    }
}

export function VideoOnboardingMvp() {
    const [steps, setSteps] = useState<VideoOnboardingStep[]>(() => {
        if (typeof window === 'undefined') return DEFAULT_STEPS;
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_STEPS;
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STEPS;
        } catch {
            return DEFAULT_STEPS;
        }
    });
    const [selectedStepId, setSelectedStepId] = useState<string>(() => DEFAULT_STEPS[0]?.id || '');
    const [runtimeIndex, setRuntimeIndex] = useState(0);
    const [runtimeText, setRuntimeText] = useState('');
    const [runtimeChoice, setRuntimeChoice] = useState('');
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
        if (!steps.some((step) => step.id === selectedStepId)) {
            setSelectedStepId(steps[0]?.id || '');
        }
    }, [selectedStepId, steps]);

    useEffect(() => {
        setRuntimeText('');
        setRuntimeChoice('');
    }, [runtimeIndex]);

    const selectedStep = useMemo(
        () => steps.find((step) => step.id === selectedStepId) || steps[0] || null,
        [selectedStepId, steps],
    );

    const currentRuntimeStep = steps[runtimeIndex] || null;
    const isFinished = runtimeIndex >= steps.length;
    const progress = steps.length > 0 ? Math.min(((runtimeIndex + 1) / steps.length) * 100, 100) : 0;

    const updateSelectedStep = <K extends keyof VideoOnboardingStep>(key: K, value: VideoOnboardingStep[K]) => {
        if (!selectedStep) return;
        setSteps((current) =>
            current.map((step) => (step.id === selectedStep.id ? { ...step, [key]: value } : step)),
        );
    };

    const addStep = () => {
        const nextStep = createStep();
        setSteps((current) => [...current, nextStep]);
        setSelectedStepId(nextStep.id);
    };

    const removeStep = (id: string) => {
        setSteps((current) => current.filter((step) => step.id !== id));
    };

    const moveStep = (id: string, direction: -1 | 1) => {
        setSteps((current) => {
            const index = current.findIndex((step) => step.id === id);
            if (index < 0) return current;
            const targetIndex = index + direction;
            if (targetIndex < 0 || targetIndex >= current.length) return current;
            const next = [...current];
            const [item] = next.splice(index, 1);
            next.splice(targetIndex, 0, item);
            return next;
        });
    };

    const duplicateStep = (id: string) => {
        setSteps((current) => {
            const index = current.findIndex((step) => step.id === id);
            if (index < 0) return current;
            const cloned = { ...current[index], id: crypto.randomUUID(), title: `${current[index].title} (cópia)` };
            const next = [...current];
            next.splice(index + 1, 0, cloned);
            setSelectedStepId(cloned.id);
            return next;
        });
    };

    const resetFlow = () => {
        setSteps(DEFAULT_STEPS);
        setSelectedStepId(DEFAULT_STEPS[0].id);
        setRuntimeIndex(0);
        setRuntimeText('');
        setRuntimeChoice('');
        setAnswers({});
        window.localStorage.removeItem(STORAGE_KEY);
    };

    const copyJson = async () => {
        await navigator.clipboard.writeText(JSON.stringify(steps, null, 2));
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
    };

    const canAdvance = (() => {
        if (!currentRuntimeStep) return false;
        if (!currentRuntimeStep.required) return true;
        if (currentRuntimeStep.inputType === 'choice') return Boolean(runtimeChoice.trim());
        if (currentRuntimeStep.inputType === 'text' || currentRuntimeStep.inputType === 'textarea') return Boolean(runtimeText.trim());
        return true;
    })();

    const advanceRuntime = () => {
        if (!currentRuntimeStep || !canAdvance) return;

        let answer = '';
        if (currentRuntimeStep.inputType === 'choice') answer = runtimeChoice.trim();
        if (currentRuntimeStep.inputType === 'text' || currentRuntimeStep.inputType === 'textarea') answer = runtimeText.trim();

        if (answer) {
            setAnswers((current) => ({ ...current, [currentRuntimeStep.id]: answer }));
        }

        setRuntimeIndex((current) => current + 1);
    };

    return (
        <div className="space-y-8 px-4 py-6 md:px-8">
            <section className="overflow-hidden rounded-[36px] border border-black/[0.06] bg-[radial-gradient(circle_at_top_left,_rgba(255,76,0,0.16),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,249,0.92))] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,76,0,0.18),_transparent_30%),linear-gradient(135deg,rgba(16,18,22,0.98),rgba(11,13,16,0.96))] md:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700 shadow-[0_10px_24px_rgba(255,76,0,0.08)] dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                            <Wand2 className="h-4 w-4" />
                            Laboratório local
                        </div>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary md:text-5xl">
                            MVP de onboarding em vídeo da Kogna
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted md:text-base">
                            Etapas fixas, avanço só por botão e texto, placeholder de vídeo e editor visual local.
                            Nada substitui o onboarding atual e nada aparece em produção.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Etapas</p>
                            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">{steps.length}</p>
                        </div>
                        <div className="rounded-3xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Motor</p>
                            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">Sequencial</p>
                        </div>
                        <div className="rounded-3xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Persistência</p>
                            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">LocalStorage</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-5 dark:border-white/[0.08] md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Editor</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Construtor visual do MVP</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={addStep} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF4C00] px-4 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(255,104,31,0.24)]">
                                <Plus size={16} />
                                Nova etapa
                            </button>
                            <button type="button" onClick={copyJson} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                <Copy size={16} />
                                {copied ? 'JSON copiado' : 'Copiar JSON'}
                            </button>
                            <button type="button" onClick={resetFlow} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                <RefreshCcw size={16} />
                                Resetar
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <button
                                    key={step.id}
                                    type="button"
                                    onClick={() => setSelectedStepId(step.id)}
                                    className={cn(
                                        'w-full rounded-[24px] border p-4 text-left transition-all',
                                        selectedStep?.id === step.id
                                            ? 'border-primary/20 bg-primary/[0.08] shadow-[0_20px_40px_rgba(245,121,59,0.12)]'
                                            : 'border-black/[0.06] bg-[#FBFBFB] hover:border-primary/15 dark:border-white/[0.08] dark:bg-white/[0.03]',
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Etapa {index + 1}</p>
                                            <p className="mt-1 text-base font-semibold text-text-primary">{step.title}</p>
                                            <p className="mt-2 text-xs leading-5 text-text-muted">{step.subtitle}</p>
                                        </div>
                                        <div className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-[11px] font-semibold text-text-muted dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <StepInputLabel inputType={step.inputType} />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button type="button" onClick={(event) => { event.stopPropagation(); moveStep(step.id, -1); }} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <ArrowUp size={14} />
                                        </button>
                                        <button type="button" onClick={(event) => { event.stopPropagation(); moveStep(step.id, 1); }} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <ArrowDown size={14} />
                                        </button>
                                        <button type="button" onClick={(event) => { event.stopPropagation(); duplicateStep(step.id); }} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-black/[0.08] bg-white text-muted-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <Copy size={14} />
                                        </button>
                                        <button type="button" onClick={(event) => { event.stopPropagation(); removeStep(step.id); }} disabled={steps.length === 1} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 disabled:opacity-40 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {selectedStep && (
                            <div className="space-y-5 rounded-[28px] border border-black/[0.06] bg-[#FBFBFB] p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Título</label>
                                        <input value={selectedStep.title} onChange={(event) => updateSelectedStep('title', event.target.value)} className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Subtítulo</label>
                                        <textarea value={selectedStep.subtitle} onChange={(event) => updateSelectedStep('subtitle', event.target.value)} rows={2} className="w-full rounded-[24px] border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Texto principal</label>
                                        <textarea value={selectedStep.prompt} onChange={(event) => updateSelectedStep('prompt', event.target.value)} rows={4} className="w-full rounded-[24px] border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Vídeo opcional</label>
                                        <input value={selectedStep.videoUrl} onChange={(event) => updateSelectedStep('videoUrl', event.target.value)} placeholder="Cole um link de YouTube, Vimeo ou MP4 quando gravar" className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tipo de resposta</label>
                                        <select value={selectedStep.inputType} onChange={(event) => updateSelectedStep('inputType', event.target.value as StepInputType)} className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <option value="none">Sem resposta</option>
                                            <option value="choice">Botões de escolha</option>
                                            <option value="text">Texto curto</option>
                                            <option value="textarea">Texto longo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">CTA</label>
                                        <input value={selectedStep.ctaLabel} onChange={(event) => updateSelectedStep('ctaLabel', event.target.value)} className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                    </div>
                                    {(selectedStep.inputType === 'text' || selectedStep.inputType === 'textarea') && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Placeholder</label>
                                            <input value={selectedStep.placeholder} onChange={(event) => updateSelectedStep('placeholder', event.target.value)} className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                        </div>
                                    )}
                                    {selectedStep.inputType === 'choice' && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Opções</label>
                                            <textarea
                                                value={selectedStep.choices.join('\n')}
                                                onChange={(event) => updateSelectedStep('choices', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))}
                                                rows={5}
                                                placeholder="Uma opção por linha"
                                                className="w-full rounded-[24px] border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={selectedStep.required} onChange={(event) => updateSelectedStep('required', event.target.checked)} className="h-4 w-4 rounded border-black/[0.12]" />
                                    Tornar resposta obrigatória antes de avançar
                                </label>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-5 dark:border-white/[0.08]">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Preview</p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Motor do onboarding</h2>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => { setRuntimeIndex(0); setAnswers({}); }} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]">
                                <MonitorPlay size={16} />
                                Reiniciar prévia
                            </button>
                            <div className="inline-flex h-11 items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <Save size={16} />
                                Salva localmente
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[32px] border border-black/[0.08] bg-[#F5F5F5] p-4 dark:border-white/[0.08] dark:bg-[#111214]">
                        <div className="mx-auto max-w-[420px] rounded-[32px] border border-black/[0.08] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-[#17181A]">
                            {!isFinished && currentRuntimeStep && (
                                <>
                                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        <span>Etapa {runtimeIndex + 1} de {steps.length}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.08] dark:bg-white/[0.08]">
                                        <div className="h-full rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A]" style={{ width: `${progress}%` }} />
                                    </div>

                                    <div className="mt-5 overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#FBFBFB] dark:border-white/[0.08] dark:bg-[#111214]">
                                        {currentRuntimeStep.videoUrl ? (
                                            toEmbedUrl(currentRuntimeStep.videoUrl)?.endsWith('.mp4') ? (
                                                <video controls className="h-[220px] w-full bg-black object-cover">
                                                    <source src={toEmbedUrl(currentRuntimeStep.videoUrl) || undefined} />
                                                </video>
                                            ) : (
                                                <iframe src={toEmbedUrl(currentRuntimeStep.videoUrl) || undefined} title={currentRuntimeStep.title} className="h-[220px] w-full bg-black" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                                            )
                                        ) : (
                                            <div className="flex h-[220px] flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,122,26,0.18),_transparent_55%),linear-gradient(135deg,#171717,#262626)] px-6 text-center text-white">
                                                <PlayCircle className="h-12 w-12 text-orange-300" />
                                                <p className="mt-4 text-lg font-semibold">Placeholder de vídeo</p>
                                                <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">O motor já aceita link, mas você ainda pode validar a jornada sem gravar nada.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5">
                                        <h3 className="text-2xl font-semibold tracking-tight text-text-primary">{currentRuntimeStep.title}</h3>
                                        <p className="mt-2 text-sm leading-7 text-muted-foreground">{currentRuntimeStep.subtitle}</p>
                                        <p className="mt-4 text-base leading-7 text-foreground">{currentRuntimeStep.prompt}</p>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        {currentRuntimeStep.inputType === 'choice' && currentRuntimeStep.choices.map((choice) => (
                                            <button
                                                key={choice}
                                                type="button"
                                                onClick={() => setRuntimeChoice(choice)}
                                                className={cn(
                                                    'w-full rounded-[22px] border px-4 py-4 text-left text-sm font-semibold transition-all',
                                                    runtimeChoice === choice
                                                        ? 'border-primary/20 bg-primary/[0.08] text-primary'
                                                        : 'border-black/[0.08] bg-white text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]',
                                                )}
                                            >
                                                {choice}
                                            </button>
                                        ))}

                                        {currentRuntimeStep.inputType === 'text' && (
                                            <input value={runtimeText} onChange={(event) => setRuntimeText(event.target.value)} placeholder={currentRuntimeStep.placeholder || 'Digite sua resposta'} className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                        )}

                                        {currentRuntimeStep.inputType === 'textarea' && (
                                            <textarea value={runtimeText} onChange={(event) => setRuntimeText(event.target.value)} rows={5} placeholder={currentRuntimeStep.placeholder || 'Digite sua resposta'} className="w-full rounded-[24px] border border-black/[0.08] bg-white px-4 py-4 text-sm text-foreground outline-none dark:border-white/[0.08] dark:bg-white/[0.04]" />
                                        )}
                                    </div>

                                    <button type="button" onClick={advanceRuntime} disabled={!canAdvance} className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)] disabled:opacity-50">
                                        <ListChecks size={16} />
                                        {currentRuntimeStep.ctaLabel || 'Continuar'}
                                    </button>
                                </>
                            )}

                            {isFinished && (
                                <div className="py-8 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        <FileVideo className="h-7 w-7" />
                                    </div>
                                    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">Jornada concluída</h3>
                                    <p className="mt-2 text-sm leading-7 text-muted-foreground">O fluxo passou por todas as etapas sem ramificação, do jeito que você pediu.</p>
                                    <button type="button" onClick={() => { setRuntimeIndex(0); setAnswers({}); }} className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)]">
                                        <RefreshCcw size={16} />
                                        Rodar de novo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-black/[0.06] bg-[#FBFBFB] p-5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Saída do motor</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">Respostas capturadas</h3>
                        <div className="mt-4 space-y-3">
                            {Object.keys(answers).length === 0 ? (
                                <p className="text-sm leading-7 text-muted-foreground">Nenhuma resposta salva ainda. Rode a prévia para ver o comportamento do motor.</p>
                            ) : (
                                steps.filter((step) => answers[step.id]).map((step) => (
                                    <div key={step.id} className="rounded-[22px] border border-black/[0.06] bg-white px-4 py-4 dark:border-white/[0.08] dark:bg-white/[0.04]">
                                        <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{answers[step.id]}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
