import { useEffect, useState } from 'react';
import { BrainCircuit, Building2, CheckCircle2, Loader2, Plus, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    CompanyProfileData,
    EMPTY_COMPANY_PROFILE,
    createEmptyObjection,
    parseListInput,
    serializeListInput,
} from '../../lib/companyProfile';

const OBJECTIVES = [
    { value: 'fechar_venda', label: 'Fechar vendas no WhatsApp' },
    { value: 'qualificar_agendar', label: 'Qualificar e agendar' },
    { value: 'aquecer_lead', label: 'Aquecer e direcionar para humano' },
];
const TONES = ['Consultiva', 'Direta', 'Amigavel', 'Executiva', 'Educadora'];
const CHANNELS = ['WhatsApp', 'Instagram', 'Google', 'Indicacao', 'Site', 'Facebook'];

function Label({ children }: { children: React.ReactNode }) {
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
        <section className="rounded-[28px] border border-black/[0.06] bg-white/[0.9] p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#111111]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
            <h3 className="mt-2 text-xl font-display font-bold tracking-tight text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
            <div className="mt-5">{children}</div>
        </section>
    );
}

export function CompanyProfile() {
    const { token } = useAuth();
    const [data, setData] = useState<CompanyProfileData>(EMPTY_COMPANY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [saved, setSaved] = useState(false);

    const setField = <K extends keyof CompanyProfileData>(key: K, value: CompanyProfileData[K]) => {
        setData((current) => ({ ...current, [key]: value }));
    };

    useEffect(() => {
        fetch('/api/company-data', { headers: { Authorization: `Bearer ${token}` } })
            .then((response) => (response.ok ? response.json() : null))
            .then((payload) => {
                if (payload) setData({ ...EMPTY_COMPANY_PROFILE, ...payload });
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            const response = await fetch('/api/company-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) throw new Error(payload?.details || payload?.error || 'Erro ao salvar perfil.');
            if (payload?.profile) setData({ ...EMPTY_COMPANY_PROFILE, ...payload.profile });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Erro ao salvar perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const response = await fetch('/api/company-profile/regenerate-playbook', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const payload = await response.json().catch(() => null);
            if (!response.ok) throw new Error(payload?.details || payload?.error || 'Erro ao regenerar playbook.');
            if (payload?.profile) setData({ ...EMPTY_COMPANY_PROFILE, ...payload.profile });
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'Erro ao regenerar playbook.');
        } finally {
            setRegenerating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/[0.88] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111111] sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.06),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_32%)]" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.16] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                            <Building2 size={14} />
                            Perfil operacional
                        </div>
                        <h1 className="mt-4 text-4xl font-display font-bold tracking-[-0.04em] text-gray-900 dark:text-white sm:text-5xl">Contexto da empresa</h1>
                        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-400">Este perfil orienta a IA, o playbook comercial e as respostas no WhatsApp.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-black/[0.06] bg-white/75 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"><p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Playbook</p><p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{data.playbookVersion || 'A gerar'}</p></div>
                        <div className="rounded-2xl border border-black/[0.06] bg-white/75 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"><p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Objecoes</p><p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{data.objectionPlaybook.length}</p></div>
                        <div className="rounded-2xl border border-black/[0.06] bg-white/75 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"><p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">Ultima geracao</p><p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{data.lastPlaybookGeneratedAt ? new Date(data.lastPlaybookGeneratedAt).toLocaleString('pt-BR') : 'Pendente'}</p></div>
                    </div>
                </div>
            </section>

            <form onSubmit={handleSave} className="space-y-6">
                <Surface eyebrow="Negocio" title="Oferta, ICP e operacao" description="Defina o contexto comercial que move a venda.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div><Label>Nome da empresa</Label><Input value={data.companyName} onChange={(e) => setField('companyName', e.target.value)} placeholder="Ex: Kogna" /></div>
                        <div><Label>Nome principal da IA</Label><Input value={data.agentName} onChange={(e) => setField('agentName', e.target.value)} placeholder="Ex: Atlas" /></div>
                        <div><Label>Mercado</Label><Input value={data.industry} onChange={(e) => setField('industry', e.target.value)} placeholder="Ex: SaaS" /></div>
                        <div><Label>Detalhe do mercado</Label><Input value={data.industryDetail} onChange={(e) => setField('industryDetail', e.target.value)} placeholder="Ex: CRM para imobiliarias" /></div>
                        <div className="md:col-span-2"><Label>Oferta principal</Label><Textarea rows={3} value={data.companyProduct} onChange={(e) => setField('companyProduct', e.target.value)} placeholder="Explique o que a empresa vende." /></div>
                        <div><Label>Publico ideal / ICP</Label><Textarea rows={4} value={data.targetAudience} onChange={(e) => setField('targetAudience', e.target.value)} placeholder="Quem deve entrar nessa operacao?" /></div>
                        <div><Label>Dor principal</Label><Textarea rows={4} value={data.customerPain} onChange={(e) => setField('customerPain', e.target.value)} placeholder="Qual dor a empresa resolve?" /></div>
                        <div><Label>Desejo / resultado</Label><Textarea rows={4} value={data.customerDesires} onChange={(e) => setField('customerDesires', e.target.value)} placeholder="Qual transformacao o cliente quer?" /></div>
                        <div><Label>Diferenciais</Label><Textarea rows={4} value={data.differentiators} onChange={(e) => setField('differentiators', e.target.value)} placeholder="Por que a oferta vence?" /></div>
                        <div><Label>Ticket medio</Label><Input value={data.productPrice} onChange={(e) => setField('productPrice', e.target.value)} placeholder="Ex: 1497" /></div>
                        <div><Label>Meta mensal</Label><Input value={data.revenueGoal} onChange={(e) => setField('revenueGoal', e.target.value)} placeholder="Ex: 100000" /></div>
                        <div className="md:col-span-2"><Label>Canais</Label><div className="flex flex-wrap gap-2">{CHANNELS.map((channel) => { const active = data.channels.includes(channel); return <button key={channel} type="button" onClick={() => setField('channels', active ? data.channels.filter((item) => item !== channel) : [...data.channels, channel])} className={`rounded-full border px-3 py-1.5 text-sm transition ${active ? 'border-primary/40 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 hover:border-primary/30 dark:border-white/[0.08] dark:bg-[#171718] dark:text-gray-300'}`}>{channel}</button>; })}</div></div>
                    </div>
                </Surface>

                <Surface eyebrow="Orquestracao" title="Como a IA deve conduzir" description="Defina objetivo, tom, sinais e momento humano.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2"><Label>Objetivo principal</Label><div className="grid gap-3 md:grid-cols-3">{OBJECTIVES.map((objective) => <button key={objective.value} type="button" onClick={() => setField('agentObjective', objective.value)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${data.agentObjective === objective.value ? 'border-primary/40 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 hover:border-primary/30 dark:border-white/[0.08] dark:bg-[#171718] dark:text-gray-300'}`}>{objective.label}</button>)}</div></div>
                        <div><Label>Tom de voz</Label><div className="flex flex-wrap gap-2">{TONES.map((tone) => <button key={tone} type="button" onClick={() => setField('voiceTone', tone)} className={`rounded-full border px-3 py-1.5 text-sm transition ${data.voiceTone === tone ? 'border-primary/40 bg-primary/10 text-primary' : 'border-black/[0.08] bg-white text-gray-600 hover:border-primary/30 dark:border-white/[0.08] dark:bg-[#171718] dark:text-gray-300'}`}>{tone}</button>)}</div></div>
                        <div><Label>Ciclo de venda</Label><Input value={data.salesCycle} onChange={(e) => setField('salesCycle', e.target.value)} placeholder="Ex: dias, semanas, meses" /></div>
                        <div><Label>Quando nao souber</Label><Textarea rows={4} value={data.unknownBehavior} onChange={(e) => setField('unknownBehavior', e.target.value)} placeholder="Como a IA deve agir fora do escopo?" /></div>
                        <div><Label>Escalada para humano</Label><Textarea rows={4} value={data.humanHandoffPolicy} onChange={(e) => setField('humanHandoffPolicy', e.target.value)} placeholder="Quando o time humano precisa entrar?" /></div>
                        <div><Label>Sinais de compra</Label><Textarea rows={4} value={data.buyingSignals} onChange={(e) => setField('buyingSignals', e.target.value)} placeholder="Quais sinais indicam lead forte?" /></div>
                        <div><Label>Definicao de bom lead</Label><Textarea rows={4} value={data.qualificationCriteria} onChange={(e) => setField('qualificationCriteria', e.target.value)} placeholder="O que faz esse lead merecer prioridade?" /></div>
                        <div><Label>Proximo passo ideal</Label><Textarea rows={4} value={data.idealNextStep} onChange={(e) => setField('idealNextStep', e.target.value)} placeholder="Qual CTA a IA deve puxar quando houver abertura?" /></div>
                        <div><Label>Politica de agenda</Label><Textarea rows={4} value={data.agendaPolicy} onChange={(e) => setField('agendaPolicy', e.target.value)} placeholder="Quando vale oferecer agenda ou demo?" /></div>
                    </div>
                </Surface>

                <Surface eyebrow="Objecoes" title="Playbook de objecoes" description="Mapeie objecoes e a melhor resposta para cada uma.">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.04] p-4 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-start gap-3">
                                <BrainCircuit className="mt-0.5 h-4 w-4 text-primary" />
                                <p>Quanto melhor esse bloco estiver, mais ativa e precisa a IA fica na venda.</p>
                            </div>
                        </div>
                        {data.objectionPlaybook.map((item, index) => (
                            <div key={item.id} className="rounded-[26px] border border-black/[0.06] bg-[#FAFAFA] p-4 dark:border-white/[0.08] dark:bg-[#161618]">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Objecao {index + 1}</p>
                                        <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.label || 'Nova objecao'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, is_active: !entry.is_active } : entry) }))} className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${item.is_active ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300'}`}>{item.is_active ? 'Ativa' : 'Inativa'}</button>
                                        <button type="button" onClick={() => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.filter((entry) => entry.id !== item.id) }))} className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div><Label>Nome</Label><Input value={item.label} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, label: e.target.value } : entry) }))} placeholder="Ex: Preco" /></div>
                                    <div><Label>Prioridade</Label><Input type="number" value={item.priority} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, priority: Number(e.target.value) || index + 1 } : entry) }))} /></div>
                                    <div className="md:col-span-2"><Label>Sinais</Label><Input value={serializeListInput(item.signals)} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, signals: parseListInput(e.target.value) } : entry) }))} placeholder="Ex: caro, preciso pensar, concorrente" /></div>
                                    <div className="md:col-span-2"><Label>Contexto</Label><Textarea rows={3} value={item.context} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, context: e.target.value } : entry) }))} placeholder="O que geralmente esta por tras dessa objecao?" /></div>
                                    <div><Label>Abordagem recomendada</Label><Textarea rows={4} value={item.recommended_approach} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, recommended_approach: e.target.value } : entry) }))} placeholder="Como a IA deve responder?" /></div>
                                    <div><Label>CTA depois de contornar</Label><Textarea rows={4} value={item.cta_after_resolution} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, cta_after_resolution: e.target.value } : entry) }))} placeholder="Qual proximo passo puxar?" /></div>
                                    <div><Label>Argumentos permitidos</Label><Textarea rows={4} value={serializeListInput(item.allowed_arguments)} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, allowed_arguments: parseListInput(e.target.value) } : entry) }))} placeholder="Ex: ROI, prova social, case..." /></div>
                                    <div><Label>Frases a evitar</Label><Textarea rows={4} value={serializeListInput(item.avoid_phrases)} onChange={(e) => setData((current) => ({ ...current, objectionPlaybook: current.objectionPlaybook.map((entry) => entry.id === item.id ? { ...entry, avoid_phrases: parseListInput(e.target.value) } : entry) }))} placeholder="Ex: se quiser, qualquer coisa me chama..." /></div>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => setData((current) => ({ ...current, objectionPlaybook: [...current.objectionPlaybook, createEmptyObjection()] }))} className="inline-flex items-center gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/[0.14]"><Plus size={16} />Adicionar objecao</button>
                    </div>
                </Surface>

                <Surface eyebrow="Guardrails" title="Tom, limites e refinamento livre" description="Refine a resposta sem engessar a operacao.">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div><Label>Como quebrar objecoes</Label><Textarea rows={4} value={data.objectionHandling} onChange={(e) => setField('objectionHandling', e.target.value)} placeholder="Descreva a linha mestra para contornar objecoes." /></div>
                        <div><Label>O que a IA nunca deve dizer</Label><Textarea rows={4} value={data.restrictions} onChange={(e) => setField('restrictions', e.target.value)} placeholder="Ex: nao prometer desconto, nao citar concorrente..." /></div>
                        <div className="md:col-span-2"><Label>Instrucoes complementares</Label><Textarea rows={5} value={data.advancedInstructions} onChange={(e) => setField('advancedInstructions', e.target.value)} placeholder="Use este campo para refinamentos extras do playbook gerado pela Kogna." /></div>
                    </div>
                </Surface>

                <div className="flex flex-col gap-3 rounded-[28px] border border-black/[0.06] bg-white/[0.88] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-[#111111] sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Salvar atualiza o playbook da operacao.</div>
                        {saved ? <div className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-300"><CheckCircle2 size={16} />Perfil salvo com sucesso</div> : null}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button type="button" onClick={handleRegenerate} disabled={regenerating} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-primary/30 hover:text-primary disabled:opacity-60 dark:border-white/[0.08] dark:bg-[#171718] dark:text-white">{regenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}Regenerar playbook</button>
                        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] to-[#F5793B] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.24)] transition hover:brightness-105 disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Salvar perfil</button>
                    </div>
                </div>
            </form>
        </div>
    );
}
