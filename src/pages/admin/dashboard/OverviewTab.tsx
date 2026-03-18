import { type ReactNode } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    Bot,
    Coins,
    DollarSign,
    MessageSquare,
    Sparkles,
    Users,
} from 'lucide-react';

function formatBrl(value?: number) {
    return Number(value || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function formatUsd(value?: number) {
    return Number(value || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
}

function formatNumber(value?: number) {
    return Number(value || 0).toLocaleString('pt-BR');
}

function formatKoins(value?: number) {
    return `${formatNumber(value)} koins`;
}

function StatCard({
    label,
    value,
    detail,
    icon,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ReactNode;
}) {
    return (
        <article className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
                    <p className="mt-2 text-sm leading-6 text-text-muted">{detail}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-200">
                    {icon}
                </div>
            </div>
        </article>
    );
}

function ChartCard({
    eyebrow,
    title,
    subtitle,
    children,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{eyebrow}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">{title}</h3>
            {subtitle && <p className="mt-1 text-sm leading-6 text-text-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
        </section>
    );
}

export function OverviewTab({ data }: { data: any }) {
    if (!data?.overview || !data?.meta) {
        return (
            <div className="flex min-h-[380px] items-center justify-center rounded-[32px] border border-black/[0.06] bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
                    Carregando visao geral
                </div>
            </div>
        );
    }

    const overview = data.overview;
    const meta = data.meta;
    const usdToBrlRate = Number(meta?.usdToBrlRate || 5);
    const apiCostBrl = Number(overview.apiCost || 0) * usdToBrlRate;
    const marginBrl = Math.max(Number(overview.totalRevenue || 0) - apiCostBrl, 0);
    const tokenMixData = [
        { name: 'Prompt', value: Number(overview.totalPromptTokens || 0), fill: '#FF6A1A' },
        { name: 'Completion', value: Number(overview.totalCompletionTokens || 0), fill: '#FDBA74' },
    ];
    const koinsFlowData = [
        { name: 'Vendidos', value: Number(overview.koinsSold || 0), fill: '#FF5B22' },
        { name: 'Consumidos', value: Number(overview.koinsConsumed || 0), fill: '#F59E0B' },
        { name: 'Saldo', value: Number(meta.totalKoinsBalance || 0), fill: '#FB923C' },
    ];
    const clientBalanceData = [
        { name: 'Com saldo', value: Number(meta.usersWithKoins || 0), fill: '#FF5B22' },
        { name: 'Sem saldo', value: Math.max(Number(meta.totalClients || 0) - Number(meta.usersWithKoins || 0), 0), fill: '#E5E7EB' },
    ];
    const businessCompareData = [
        { name: 'Receita', value: Number(overview.totalRevenue || 0), fill: '#FF5B22' },
        { name: 'API', value: apiCostBrl, fill: '#FDBA74' },
        { name: 'Margem', value: marginBrl, fill: '#FB923C' },
    ];
    const totalTokenVolume = tokenMixData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Receita aprovada"
                    value={formatBrl(overview.totalRevenue)}
                    detail="Somatorio real de pagamentos aprovados no painel."
                    icon={<DollarSign className="h-5 w-5" />}
                />
                <StatCard
                    label="OpenAI API"
                    value={formatUsd(overview.apiCost)}
                    detail="Custo consolidado a partir de token_cost nas mensagens."
                    icon={<Bot className="h-5 w-5" />}
                />
                <StatCard
                    label="Clientes ativos"
                    value={formatNumber(overview.activeClients)}
                    detail={`${formatNumber(overview.newClients)} novos clientes dentro do periodo selecionado.`}
                    icon={<Users className="h-5 w-5" />}
                />
                <StatCard
                    label="Koins consumidos"
                    value={formatKoins(overview.koinsConsumed)}
                    detail="Consumo real registrado no ledger de uso."
                    icon={<Coins className="h-5 w-5" />}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                <ChartCard
                    eyebrow="Receita"
                    title="Evolucao financeira"
                    subtitle="Leitura fluida do faturamento do periodo, sem preenchimento artificial."
                >
                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Crescimento</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">
                                {overview.growthPercentage > 0 ? '+' : ''}
                                {Number(overview.growthPercentage || 0).toFixed(1)}%
                            </p>
                        </div>
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Ticket medio</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">{formatBrl(overview.ticketMedio)}</p>
                        </div>
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Mensagens</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">{formatNumber(overview.totalMessages)}</p>
                        </div>
                    </div>

                    <div className="h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={overview.revenueChartData || []} margin={{ top: 12, right: 10, left: -16, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="overviewRevenueGlow" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FF6A1A" stopOpacity={0.45} />
                                        <stop offset="100%" stopColor="#FF6A1A" stopOpacity={0.03} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(38,38,38,0.08)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '18px',
                                        border: '1px solid rgba(38,38,38,0.08)',
                                        background: 'rgba(255,255,255,0.96)',
                                        boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                    }}
                                    formatter={(value: number) => [formatBrl(value), 'Receita']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#FF5B22"
                                    strokeWidth={3}
                                    fill="url(#overviewRevenueGlow)"
                                    activeDot={{ r: 5, strokeWidth: 0, fill: '#FF5B22' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <div className="grid gap-6">
                    <ChartCard
                        eyebrow="Mix de tokens"
                        title="Prompt x completion"
                        subtitle="Volume técnico do uso da IA no periodo atual."
                    >
                        <div className="grid items-center gap-4 md:grid-cols-[0.95fr_1fr]">
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={tokenMixData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={58}
                                            outerRadius={86}
                                            paddingAngle={4}
                                            stroke="none"
                                        >
                                            {tokenMixData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '18px',
                                                border: '1px solid rgba(38,38,38,0.08)',
                                                background: 'rgba(255,255,255,0.96)',
                                                boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                            }}
                                            formatter={(value: number) => [formatNumber(value), 'Tokens']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Volume total</p>
                                    <p className="mt-1 text-lg font-semibold text-text-primary">{formatNumber(totalTokenVolume)}</p>
                                </div>
                                {tokenMixData.map((item) => (
                                    <div key={item.name} className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-medium text-text-primary">{item.name}</span>
                                            <span className="text-sm font-semibold text-text-primary">{formatNumber(item.value)}</span>
                                        </div>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.08]">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${totalTokenVolume > 0 ? (item.value / totalTokenVolume) * 100 : 0}%`,
                                                    background: item.fill,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </ChartCard>

                    <ChartCard
                        eyebrow="Base ativa"
                        title="Clientes com saldo"
                        subtitle="Leitura visual da base pronta para operar agora."
                    >
                        <div className="grid items-center gap-4 md:grid-cols-[0.95fr_1fr]">
                            <div className="h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={clientBalanceData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={58}
                                            outerRadius={86}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {clientBalanceData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '18px',
                                                border: '1px solid rgba(38,38,38,0.08)',
                                                background: 'rgba(255,255,255,0.96)',
                                                boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3">
                                <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Clientes ativos</p>
                                    <p className="mt-1 text-lg font-semibold text-text-primary">{formatNumber(overview.activeClients)}</p>
                                </div>
                                <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Com saldo</p>
                                    <p className="mt-1 text-lg font-semibold text-text-primary">{formatNumber(meta.usersWithKoins)}</p>
                                </div>
                                <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Koins em saldo</p>
                                    <p className="mt-1 text-lg font-semibold text-text-primary">{formatKoins(meta.totalKoinsBalance)}</p>
                                </div>
                            </div>
                        </div>
                    </ChartCard>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard
                    eyebrow="Economia de Koins"
                    title="Fluxo de venda, consumo e saldo"
                    subtitle="Representacao visual das principais massas da economia da plataforma."
                >
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={koinsFlowData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(38,38,38,0.08)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '18px',
                                        border: '1px solid rgba(38,38,38,0.08)',
                                        background: 'rgba(255,255,255,0.96)',
                                        boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                    }}
                                    formatter={(value: number) => [formatKoins(value), 'Koins']}
                                />
                                <Bar dataKey="value" radius={[18, 18, 0, 0]} barSize={56}>
                                    {koinsFlowData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard
                    eyebrow="Calculo financeiro"
                    title="Receita x custo x margem"
                    subtitle={`Comparativo em BRL usando USD/BRL ${usdToBrlRate.toFixed(2)} para o custo da OpenAI.`}
                >
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={businessCompareData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(38,38,38,0.08)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7A7A7A', fontSize: 12 }} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '18px',
                                        border: '1px solid rgba(38,38,38,0.08)',
                                        background: 'rgba(255,255,255,0.96)',
                                        boxShadow: '0 20px 50px rgba(15,23,42,0.12)',
                                    }}
                                    formatter={(value: number) => [formatBrl(value), 'Valor']}
                                />
                                <Bar dataKey="value" radius={[18, 18, 0, 0]} barSize={56}>
                                    {businessCompareData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Receita</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">{formatBrl(overview.totalRevenue)}</p>
                        </div>
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">API em BRL</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">{formatBrl(apiCostBrl)}</p>
                        </div>
                        <div className="rounded-2xl border border-black/[0.06] bg-[#FBFBFB] px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Margem visivel</p>
                            <p className="mt-1 text-lg font-semibold text-text-primary">{formatBrl(marginBrl)}</p>
                        </div>
                    </div>
                </ChartCard>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                        Mensagens processadas
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{formatNumber(overview.totalMessages)}</p>
                </div>
                <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        Slots WhatsApp
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{formatNumber(meta.totalWhatsappSlots)}</p>
                </div>
                <div className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                    <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <Bot className="h-4 w-4 text-orange-500" />
                        Prompt tokens
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{formatNumber(overview.totalPromptTokens)}</p>
                </div>
            </div>
        </div>
    );
}
