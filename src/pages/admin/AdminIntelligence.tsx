import { useState, useEffect, useCallback } from 'react';
import { Globe, TrendingUp, MapPin, Package, Target, RefreshCw, Zap } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const COLORS = ['#FF4C00', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

const PERIOD_OPTIONS = [
    { label: '7 dias', value: 7 },
    { label: '30 dias', value: 30 },
    { label: '90 dias', value: 90 },
];

function StatCard({ label, value, sub, icon: Icon }: {
    label: string; value: string | number; sub?: string; icon: React.ElementType;
}) {
    return (
        <div className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start">
            <div className="p-2.5 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

export function AdminIntelligence() {
    const [period, setPeriod] = useState(30);
    const [loading, setLoading] = useState(false);
    const [running, setRunning] = useState(false);
    const [summary, setSummary] = useState<any>(null);
    const [objections, setObjections] = useState<any[]>([]);
    const [regions, setRegions] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [segments, setSegments] = useState<any[]>([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const qs = `?days=${period}`;
        try {
            const [sumRes, objRes, regRes, prodRes, segRes] = await Promise.all([
                fetch(`${API_BASE}/intelligence/admin/summary${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/admin/objections${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/admin/regions${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/admin/products${qs}`, { headers }),
                fetch(`${API_BASE}/intelligence/admin/segments${qs}`, { headers }),
            ]);
            if (sumRes.ok) setSummary(await sumRes.json());
            if (objRes.ok) setObjections(await objRes.json());
            if (regRes.ok) setRegions(await regRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
            if (segRes.ok) setSegments(await segRes.json());
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [period]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleRunEngine = async () => {
        setRunning(true);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        await fetch(`${API_BASE}/intelligence/run`, { headers });
        setRunning(false);
        setTimeout(fetchAll, 3000);
    };

    const globalConvRate = summary
        ? parseInt(summary.total_conversations) > 0
            ? ((parseInt(summary.total_won) / parseInt(summary.total_conversations)) * 100).toFixed(1)
            : '0.0'
        : '—';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Globe className="w-6 h-6 text-primary" />
                        Global Intelligence
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Inteligência agregada de todas as empresas na plataforma.
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
                        onClick={handleRunEngine}
                        disabled={running}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Zap className={`w-3.5 h-3.5 ${running ? 'animate-pulse' : ''}`} />
                        {running ? 'Executando...' : 'Rodar Engine'}
                    </button>
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Global KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Globe} label="Empresas Ativas" value={summary?.total_orgs || '—'} sub="Com conversas no período" />
                <StatCard icon={TrendingUp} label="Total de Conversas" value={summary?.total_conversations || '—'} />
                <StatCard icon={Target} label="Conversão Global" value={`${globalConvRate}%`} sub={`${summary?.total_won || 0} negócios ganhos`} />
                <StatCard icon={TrendingUp} label="Prob. Média Global" value={summary ? `${(parseFloat(summary.avg_probability || 0) * 100).toFixed(0)}%` : '—'} />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Objections */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Top Objeções (Plataforma)</h3>
                    {objections.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={objections.slice(0, 8)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" tick={{ fill: '#888', fontSize: 11 }} />
                                <YAxis type="category" dataKey="objection" tick={{ fill: '#888', fontSize: 10 }} width={110} />
                                <Tooltip />
                                <Bar dataKey="count" name="Ocorrências" radius={[0, 4, 4, 0]}>
                                    {objections.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                            Dados insuficientes
                        </div>
                    )}
                </div>

                {/* Most Mentioned Products */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        Produtos Mais Mencionados
                    </h3>
                    {products.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto max-h-52 pr-1">
                            {products.map((p, i) => {
                                const max = products[0]?.total || 1;
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-xs font-medium text-foreground truncate max-w-[160px]">{p.product_interest}</span>
                                                <span className="text-xs text-muted-foreground">{p.total}x</span>
                                            </div>
                                            <div className="bg-muted rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full bg-primary"
                                                    style={{ width: `${(p.total / max) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                            Dados insuficientes
                        </div>
                    )}
                </div>
            </div>

            {/* Regions + Segments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Regions */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        Regiões com Maior Demanda
                    </h3>
                    {regions.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
                            {regions.map((r, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{r.state} — {r.city || 'N/A'}</p>
                                        <p className="text-xs text-muted-foreground">{r.total} conversas · {r.won} ganhas</p>
                                    </div>
                                    <span className="text-xs font-semibold text-primary">
                                        {r.total > 0 ? ((r.won / r.total) * 100).toFixed(0) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                            Dados de região insuficientes
                        </div>
                    )}
                </div>

                {/* Segments */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-500" />
                        Intenções por Segmento
                    </h3>
                    {segments.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto max-h-56 pr-1">
                            {segments.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{s.segment}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Intenção: {s.intent} · {s.total} conversas
                                            {s.avg_ticket ? ` · Ticket médio: R$ ${parseFloat(s.avg_ticket).toFixed(0)}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold text-primary">
                                        {s.total > 0 ? ((s.won / s.total) * 100).toFixed(0) : 0}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                            Dados de segmento insuficientes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
