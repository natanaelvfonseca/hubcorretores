import { RefreshCw } from 'lucide-react';

function formatNumber(value?: number) {
    return Number(value || 0).toLocaleString('pt-BR');
}

function formatPercent(value?: number) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function StatCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <article className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">{detail}</p>
        </article>
    );
}

const STEP_LABELS = [
    'Conta',
    'Agente',
    'Mercado',
    'Identidade',
    'Produto',
    'Publico',
    'Canais',
    'Ciclo',
    'Meta',
    'Objecoes',
    'Conducao',
    'Conhecimento',
    'Pipeline',
    'Ativacao',
    'Teste',
    'Melhorar',
    'WhatsApp',
    'Concluido',
];

export function OnboardingTab({
    data,
    onRefresh,
    refreshing = false,
}: {
    data: any;
    onRefresh?: () => void;
    refreshing?: boolean;
}) {
    if (!data?.totals || !Array.isArray(data?.steps)) {
        return (
            <div className="flex min-h-[380px] items-center justify-center rounded-[32px] border border-black/[0.06] bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
                    Carregando analytics do onboarding
                </div>
            </div>
        );
    }

    const totals = data.totals;
    const steps = data.steps.map((step: any) => ({
        ...step,
        label: STEP_LABELS[step.step_number - 1] || `Passo ${step.step_number}`,
    }));
    const topDropoff = data?.insights?.top_dropoff_step || null;
    const maxReached = Math.max(...steps.map((step: any) => Number(step.reached || 0)), 1);
    const completedStep = steps[steps.length - 1];

    return (
        <div className="space-y-6">
            <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Atualizacao manual</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-text-primary">Metricas do onboarding sem recarregar a pagina</h3>
                        <p className="mt-1 text-sm leading-6 text-text-muted">Use este botao para buscar os numeros mais recentes do funil sem dar refresh no admin inteiro.</p>
                    </div>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={!onRefresh || refreshing}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-5 text-sm font-semibold text-orange-700 transition-all hover:-translate-y-0.5 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200 dark:hover:bg-orange-500/15"
                    >
                        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Atualizando metricas' : 'Atualizar metricas'}
                    </button>
                </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Iniciaram"
                    value={formatNumber(totals.total_started)}
                    detail="Jornadas unicas de onboarding identificadas pelo sistema."
                />
                <StatCard
                    label="Concluiram"
                    value={formatNumber(totals.total_completed)}
                    detail={`${formatNumber(completedStep?.reached || 0)} chegaram ao passo final.`}
                />
                <StatCard
                    label="Taxa de conclusao"
                    value={formatPercent(totals.completion_rate)}
                    detail="Percentual do funil que atingiu o fim do onboarding."
                />
                <StatCard
                    label="Maior abandono"
                    value={topDropoff ? `P${topDropoff.step_number}` : '--'}
                    detail={topDropoff
                        ? `${formatNumber(topDropoff.abandoned)} jornadas pararam aqui (${formatPercent(topDropoff.drop_off_rate)}).`
                        : 'Nenhum abandono registrado ainda.'}
                />
            </div>

            <section className="rounded-[32px] border border-black/[0.06] bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Funil</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Distribuicao por etapa</h3>
                <p className="mt-1 text-sm leading-6 text-text-muted">Veja quantas jornadas chegaram em cada passo, quanto o funil afunila e onde o abandono pesa mais.</p>

                <div className="mt-6 space-y-4">
                    {steps.map((step: any) => {
                        const width = Math.max((Number(step.reached || 0) / maxReached) * 100, step.reached > 0 ? 8 : 0);
                        return (
                            <div key={step.step_number} className="rounded-[26px] border border-black/[0.06] bg-[#FBFBFB] p-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Passo {step.step_number}</p>
                                        <p className="mt-1 text-lg font-semibold text-text-primary">{step.label}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <span className="rounded-full border border-black/[0.06] bg-white px-3 py-1 font-semibold text-text-primary dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            {formatNumber(step.reached)} chegaram
                                        </span>
                                        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                                            {formatNumber(step.abandoned)} abandonaram
                                        </span>
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                                            {formatPercent(step.drop_off_rate)} taxa de abandono
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A]"
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
