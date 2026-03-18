import { type ReactNode, useEffect, useState } from 'react';
import {
    AlertTriangle,
    BrainCircuit,
    MessageSquare,
    Sparkles,
    TrendingUp,
    Zap,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { useAuth } from '../../../context/AuthContext';

const STAGE_ORDER = ['novo_lead', 'qualificacao', 'interesse', 'proposta', 'negociacao', 'fechamento'];
const STAGE_LABELS: Record<string, string> = {
    novo_lead: 'Novo lead',
    qualificacao: 'Qualificacao',
    interesse: 'Interesse',
    proposta: 'Proposta',
    negociacao: 'Negociacao',
    fechamento: 'Fechamento',
};
const INTENT_LABELS: Record<string, string> = {
    informacao: 'Informacao',
    comparacao: 'Comparacao',
    compra: 'Compra',
    suporte: 'Suporte',
    outro: 'Outro',
};
const INTENT_COLORS = ['#FF5B22', '#F59E0B', '#10B981', '#2563EB', '#64748B'];
const STAGE_COLORS: Record<string, string> = {
    novo_lead: '#2563EB',
    qualificacao: '#7C3AED',
    interesse: '#F59E0B',
    proposta: '#EC4899',
    negociacao: '#EF4444',
    fechamento: '#10B981',
};

function KpiCard({
    title,
    value,
    icon,
    sub,
}: {
    title: string;
    value: string | number;
    icon: ReactNode;
    sub?: string;
}) {
    return (
        <article className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{title}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
                    {sub && <p className="mt-2 text-sm leading-6 text-text-muted">{sub}</p>}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-200">
                    {icon}
                </div>
            </div>
        </article>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="flex h-[180px] items-center justify-center rounded-[24px] border border-dashed border-black/[0.10] bg-[#FBFBFB] text-sm text-text-muted dark:border-white/[0.12] dark:bg-white/[0.03]">
            {label}
        </div>
    );
}

function TopList({
    title,
    items,
}: {
    title: string;
    items: { name: string; count: string | number }[];
}) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{title}</p>
            {items.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {items.slice(0, 6).map((item, index) => (
                        <span key={`${title}-${index}`} className="inline-flex items-center rounded-full border border-black/[0.06] bg-[#F7F7F7] px-3 py-1 text-xs font-medium text-text-primary dark:border-white/[0.08] dark:bg-white/[0.04]">
                            {item.name} <span className="ml-1 text-text-muted">{item.count}x</span>
                        </span>
                    ))}
                </div>
            ) : (
                <p className="mt-3 text-sm text-text-muted">Sem dados ainda.</p>
            )}
        </div>
    );
}

export function ConversationIntelligenceTab() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<any>(null);
    const [intents, setIntents] = useState<any[]>([]);
    const [objections, setObjections] = useState<any[]>([]);
    const [stages, setStages] = useState<any[]>([]);
    const [segments, setSegments] = useState<any>(null);
    const [avgMetrics, setAvgMetrics] = useState<any>(null);

    const apiBase = import.meta.env.VITE_API_BASE_URL || '';

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        const base = `${apiBase}/api/admin/conversation-intelligence`;

        setLoading(true);
        Promise.all([
            fetch(`${base}/summary`, { headers }).then((response) => response.json()),
            fetch(`${base}/intents`, { headers }).then((response) => response.json()),
            fetch(`${base}/objections`, { headers }).then((response) => response.json()),
            fetch(`${base}/stages`, { headers }).then((response) => response.json()),
            fetch(`${base}/top-segments`, { headers }).then((response) => response.json()),
            fetch(`${base}/avg-metrics`, { headers }).then((response) => response.json()),
        ])
            .then(([sum, int, obj, stg, seg, avg]) => {
                setSummary(sum);
                setIntents(Array.isArray(int) ? int.map((row: any) => ({ ...row, name: INTENT_LABELS[row.intent] || row.intent, count: parseInt(row.count, 10) })) : []);
                setObjections(Array.isArray(obj) ? obj.map((row: any) => ({ ...row, count: parseInt(row.count, 10) })) : []);
                setStages(Array.isArray(stg) ? stg.map((row: any) => ({ ...row, count: parseInt(row.count, 10) })) : []);
                setSegments(seg);
                setAvgMetrics(avg);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [apiBase, token]);

    if (loading) {
        return (
            <div className="flex min-h-[380px] items-center justify-center rounded-[32px] border border-black/[0.06] bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
                    Carregando inteligencia de conversa
                </div>
            </div>
        );
    }

    const maxObjection = Math.max(...objections.map((objection) => objection.count), 1);
    const avgProb = avgMetrics?.avg_purchase_probability != null ? `${(parseFloat(avgMetrics.avg_purchase_probability) * 100).toFixed(1)}%` : '0%';
    const avgTime = avgMetrics?.avg_time_to_decision_seconds != null
        ? `${Math.round(parseInt(avgMetrics.avg_time_to_decision_seconds, 10) / 3600)}h`
        : '0h';
    const stageMap = Object.fromEntries(stages.map((stage) => [stage.stage, stage.count]));
    const maxStage = Math.max(...Object.values(stageMap) as number[], 1);

    return (
        <div className="space-y-6">
            <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Conversation intelligence</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Leitura da operacao conversacional</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                            Intencoes, objecoes, etapas do funil e sinais de compra em uma visao consolidada das conversas processadas.
                        </p>
                    </div>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                    title="Conversas analisadas"
                    value={Number(summary?.total_conversations || 0).toLocaleString('pt-BR')}
                    icon={<MessageSquare className="h-5 w-5" />}
                    sub="Conversas unicas processadas."
                />
                <KpiCard
                    title="Mensagens analisadas"
                    value={Number(summary?.total_messages || 0).toLocaleString('pt-BR')}
                    icon={<Zap className="h-5 w-5" />}
                    sub="Mensagens com enriquecimento de inteligencia."
                />
                <KpiCard
                    title="Eventos detectados"
                    value={Number(summary?.total_events || 0).toLocaleString('pt-BR')}
                    icon={<TrendingUp className="h-5 w-5" />}
                    sub="Intencoes, objecoes e sinais de compra."
                />
                <KpiCard
                    title="Compra media"
                    value={avgProb}
                    icon={<Sparkles className="h-5 w-5" />}
                    sub={`Tempo medio para decisao: ${avgTime}`}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Intencoes</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Distribuicao de motivos de contato</h3>
                    <div className="mt-6 h-[260px]">
                        {intents.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={intents} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(38,38,38,0.09)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '18px',
                                            border: '1px solid rgba(38,38,38,0.08)',
                                            background: 'rgba(255,255,255,0.96)',
                                            boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                        }}
                                    />
                                    <Bar dataKey="count" radius={[16, 16, 0, 0]} barSize={40}>
                                        {intents.map((_, index) => (
                                            <Cell key={`intent-${index}`} fill={INTENT_COLORS[index % INTENT_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyState label="Nenhuma intencao detectada ainda." />
                        )}
                    </div>
                </section>

                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Funil</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Mapa de calor por etapa</h3>
                    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
                        {STAGE_ORDER.map((stage) => {
                            const count = Number(stageMap[stage] || 0);
                            const intensity = maxStage > 0 ? count / maxStage : 0;
                            const opacity = Math.max(0.08, intensity * 0.9);
                            const color = STAGE_COLORS[stage] || '#FF5B22';

                            return (
                                <div
                                    key={stage}
                                    className="rounded-[24px] border p-4 text-center"
                                    style={{
                                        borderColor: `${color}24`,
                                        background: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                                    }}
                                >
                                    <p className="text-2xl font-semibold" style={{ color }}>{count}</p>
                                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-text-muted">{STAGE_LABELS[stage]}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Objecoes</p>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Top objecoes detectadas</h3>
                    <div className="mt-6">
                        {objections.length > 0 ? (
                            <div className="space-y-4">
                                {objections.slice(0, 8).map((objection, index) => (
                                    <div key={`objection-${index}`} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="truncate text-sm font-medium text-text-primary">{objection.objection}</span>
                                            <span className="text-sm text-text-muted">{objection.count}x</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                                            <div
                                                className="h-2 rounded-full bg-gradient-to-r from-[#FF6A1A] to-[#FF4C00]"
                                                style={{ width: `${(objection.count / maxObjection) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState label="Nenhuma objecao detectada ainda." />
                        )}
                    </div>
                </section>

                <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4 text-orange-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Exploracoes</p>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Produtos, segmentos e cidades</h3>
                    <div className="mt-6 space-y-6">
                        <TopList title="Top produtos" items={segments?.top_products || []} />
                        <TopList title="Top segmentos" items={segments?.top_segments || []} />
                        <TopList title="Top cidades" items={segments?.top_cities || []} />
                    </div>
                </section>
            </div>
        </div>
    );
}
