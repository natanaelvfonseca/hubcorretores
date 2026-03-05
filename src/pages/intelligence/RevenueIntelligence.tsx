import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Target, Clock, MessageSquare, Zap, AlertTriangle, BarChart2, Brain, RefreshCw } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const COLORS = ['#FF4C00', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const PERIOD_OPTIONS = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '90 dias', value: 90 },
];

type Tab = 'overview' | 'patterns' | 'behavior' | 'distribution';

interface Summary {
    total: number; won: number; lost: number; abandoned: number;
    conversion_rate: number; avg_close_days: string; avg_probability: string;
    abandonment_rate: number;
}

function KPICard({ icon: Icon, label, value, sub, color = 'text-primary' }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary/30 transition-colors">
            <div className={`p-2.5 rounded-lg bg-primary/10`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function PhraseCard({ phrase, count, type }: { phrase: string; count: number; type: 'closing' | 'killer' }) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${type === 'closing'
            ? 'border-green-500/20 bg-green-500/5'
            : 'border-red-500/20 bg-red-500/5'
            }`}>
            <span className={`text-lg ${type === 'closing' ? '✅' : '💀'}`}>
                {type === 'closing' ? '✅' : '💀'}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium leading-snug">"{phrase}"</p>
                <p className="text-xs text-muted-foreground mt-1">{count}x detectada</p>
            </div>
        </div>
    );
}

export function RevenueIntelligence() {
    const [tab, setTab] = useState<Tab>('overview');
    const [period, setPeriod] = useState(30);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [funnel, setFunnel] = useState<any[]>([]);
    const [objections, setObjections] = useState<any[]>([]);
    const [intents, setIntents] = useState<any[]>([]);
    const [closing, setClosing] = useState<any[]>([]);
    const [killers, setKillers] = useState<any[]>([]);
    const [behavior, setBehavior] = useState<any[]>([]);
    const [temperature, setTemperature] = useState<any[]>([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const qs = `?days=${period}`;
        try {
            const [sumRes, funnelRes, objRes, intRes, closingRes, killersRes, behaviorRes, tempRes] = await Promise.all([
                fetch(`${API_BASE}/intelligence/summary${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/funnel${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/objections${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/intents${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/patterns/closing`, { headers }),
                fetch(`${API_BASE}/intelligence/patterns/killers`, { headers }),
                fetch(`${API_BASE}/intelligence/behavior`, { headers }),
                fetch(`${API_BASE}/intelligence/temperature${qs}`, { headers }),
            ]);
            if (sumRes.ok) setSummary(await sumRes.json());
            if (funnelRes.ok) setFunnel(await funnelRes.json());
            if (objRes.ok) setObjections(await objRes.json());
            if (intRes.ok) setIntents(await intRes.json());
            if (closingRes.ok) setClosing(await closingRes.json());
            if (killersRes.ok) setKillers(await killersRes.json());
            if (behaviorRes.ok) setBehavior(await behaviorRes.json());
            if (tempRes.ok) setTemperature(await tempRes.json());
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }, [period]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
        { id: 'overview', label: 'Visão Geral', icon: BarChart2 },
        { id: 'patterns', label: 'Padrões de Linguagem', icon: MessageSquare },
        { id: 'behavior', label: 'Comportamento', icon: Brain },
        { id: 'distribution', label: 'Objeções & Intenções', icon: Target },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Revenue Intelligence
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Transforme o histórico de conversas em inteligência comercial acionável.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                        {PERIOD_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPeriod(opt.value)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === opt.value
                                    ? 'bg-primary text-white'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-border">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {tab === 'overview' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            icon={Target}
                            label="Taxa de Conversão"
                            value={summary ? `${(summary.conversion_rate * 100).toFixed(1)}%` : '—'}
                            sub={`${summary?.won || 0} fechadas / ${summary?.total || 0} total`}
                            color="text-green-500"
                        />
                        <KPICard
                            icon={Clock}
                            label="Tempo Médio de Fechamento"
                            value={summary ? `${summary.avg_close_days} dias` : '—'}
                            color="text-blue-500"
                        />
                        <KPICard
                            icon={Zap}
                            label="Taxa de Abandono"
                            value={summary ? `${(summary.abandonment_rate * 100).toFixed(1)}%` : '—'}
                            sub={`${summary?.abandoned || 0} leads abandonaram`}
                            color="text-orange-500"
                        />
                        <KPICard
                            icon={TrendingUp}
                            label="Probabilidade Média"
                            value={summary ? `${(parseFloat(summary.avg_probability) * 100).toFixed(0)}%` : '—'}
                            sub="Score médio dos leads"
                            color="text-primary"
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Funnel chart */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-foreground mb-4">Conversão por Etapa do Funil</h3>
                            {funnel.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={funnel} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis type="number" tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#888', fontSize: 11 }} />
                                        <YAxis type="category" dataKey="stage" tick={{ fill: '#888', fontSize: 11 }} width={90} />
                                        <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                                        <Bar dataKey="conversion" fill="#FF4C00" radius={[0, 4, 4, 0]} name="Conversão" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                    Dados insuficientes para gerar o funil.
                                </div>
                            )}
                        </div>

                        {/* Temperature chart */}
                        <div className="bg-card border border-border rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-foreground mb-4">Conversão por Temperatura do Lead</h3>
                            {temperature.length > 0 ? (
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={temperature}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="temperature" tick={{ fill: '#888', fontSize: 11 }} />
                                        <YAxis tickFormatter={v => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#888', fontSize: 11 }} />
                                        <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                                        <Bar dataKey="conversion" name="Conversão" radius={[4, 4, 0, 0]}>
                                            {temperature.map((_, i) => (
                                                <Cell key={i} fill={['#ef4444', '#f97316', '#22c55e'][i % 3]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                                    Dados insuficientes para gerar o gráfico.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* PATTERNS TAB */}
            {tab === 'patterns' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                            <span>✅</span> Frases que Convertem
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">Detectadas antes de negócios fechados</p>
                        {closing.length > 0 ? (
                            <div className="space-y-2">
                                {closing.map((p, i) => (
                                    <PhraseCard key={i} phrase={p.phrase_detected} count={p.detected_count} type="closing" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                Nenhum padrão detectado ainda.<br />
                                <span className="text-xs mt-1 block">A engine analisa conversas uma vez ao dia.</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                            <span>💀</span> Frases que Matam Vendas
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">Detectadas antes de oportunidades perdidas</p>
                        {killers.length > 0 ? (
                            <div className="space-y-2">
                                {killers.map((p, i) => (
                                    <PhraseCard key={i} phrase={p.phrase_detected} count={p.detected_count} type="killer" />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                Nenhum padrão detectado ainda.<br />
                                <span className="text-xs mt-1 block">A engine analisa conversas uma vez ao dia.</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BEHAVIOR TAB */}
            {tab === 'behavior' && (
                <div className="space-y-3">
                    {behavior.length > 0 ? behavior.map((b, i) => (
                        <div
                            key={i}
                            className="bg-card border border-border rounded-xl p-5 flex items-start gap-4 hover:border-primary/20 transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                <Brain className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground leading-relaxed">{b.pattern_description}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-muted-foreground">{b.sample_size} conversas analisadas</span>
                                    <div className="flex-1 bg-muted rounded-full h-1.5">
                                        <div
                                            className="h-1.5 rounded-full bg-primary"
                                            style={{ width: `${Math.min(100, b.impact_score * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-primary">
                                        {(b.impact_score * 100).toFixed(0)}% impacto
                                    </span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-card border border-border rounded-xl">
                            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Nenhum padrão comportamental detectado ainda.</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Você precisa de pelo menos 5 conversas com resultados (ganhas/perdidas) para gerar insights.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* DISTRIBUTION TAB */}
            {tab === 'distribution' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Objections */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Top Objeções Detectadas
                        </h3>
                        {objections.length > 0 ? (
                            <div className="space-y-2">
                                {objections.slice(0, 8).map((obj, i) => {
                                    const max = objections[0]?.count || 1;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-medium text-foreground">{obj.objection}</span>
                                                    <span className="text-xs text-muted-foreground">{obj.count}x</span>
                                                </div>
                                                <div className="bg-muted rounded-full h-1.5">
                                                    <div
                                                        className="h-1.5 rounded-full bg-orange-500"
                                                        style={{ width: `${(obj.count / max) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">Sem dados suficientes</div>
                        )}
                    </div>

                    {/* Intents */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            Distribuição de Intenções de Compra
                        </h3>
                        {intents.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={intents}
                                        dataKey="count"
                                        nameKey="intent"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ intent, percent }) => `${intent} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {intents.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">Sem dados suficientes</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
