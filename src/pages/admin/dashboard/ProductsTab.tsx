import { type ReactNode, useEffect, useState } from 'react';
import {
    Coins,
    Package2,
    Receipt,
    ServerCog,
    Wallet,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

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

function TopCard({
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
        <article className="rounded-[28px] border border-black/[0.06] bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
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

export function ProductsTab({ data }: { data: any }) {
    const { token } = useAuth();
    const [consumptionLogs, setConsumptionLogs] = useState<any[]>([]);
    const [loadingCons, setLoadingCons] = useState(true);

    useEffect(() => {
        const fetchConsumption = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || '';
                const res = await fetch(`${apiBase}/api/admin/consumption`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const logs = await res.json();
                setConsumptionLogs(Array.isArray(logs) ? logs : []);
            } catch (error) {
                console.error('Failed to fetch admin consumption logs', error);
            } finally {
                setLoadingCons(false);
            }
        };

        if (token) {
            fetchConsumption();
        }
    }, [token]);

    if (!data?.products) {
        return (
            <div className="flex min-h-[380px] items-center justify-center rounded-[32px] border border-black/[0.06] bg-white/75 dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
                    Carregando produtos e consumo
                </div>
            </div>
        );
    }

    const products = data.products;
    const catalog = products.list || [];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TopCard
                    label="Portfolio ativo"
                    value={formatNumber(catalog.length)}
                    detail="Produtos ja cadastrados para venda na operacao."
                    icon={<Package2 className="h-5 w-5" />}
                />
                <TopCard
                    label="Koins vendidos"
                    value={formatKoins(products.koinsSold)}
                    detail="Total de Koins creditados por vendas no periodo atual."
                    icon={<Coins className="h-5 w-5" />}
                />
                <TopCard
                    label="Koins consumidos"
                    value={formatKoins(products.koinsConsumed)}
                    detail="Queima real registrada no ledger de consumo."
                    icon={<Receipt className="h-5 w-5" />}
                />
                <TopCard
                    label="Custo OpenAI"
                    value={formatUsd(products.apiCost)}
                    detail={`${formatNumber(products.messagesProcessed)} mensagens processadas no periodo atual.`}
                    icon={<ServerCog className="h-5 w-5" />}
                />
            </div>

            <section className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 border-b border-black/[0.06] px-6 py-6 dark:border-white/[0.08] lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Catalogo e faturamento</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Produtos do painel comercial</h3>
                        <p className="mt-1 text-sm text-text-muted">
                            As vendas por produto entram quando o pagamento consegue ser conciliado de forma confiavel com o catalogo.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-black/[0.06] bg-[#F8F8F8] px-4 py-3 text-sm text-text-muted dark:border-white/[0.08] dark:bg-white/[0.03]">
                        Match por catalogo: {products.matchedBillingRows || 0} de {products.totalBillingRows || 0} vendas no periodo.
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-[#FAFAFA] text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:bg-white/[0.03]">
                            <tr>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Preco</th>
                                <th className="px-6 py-4">Vendas</th>
                                <th className="px-6 py-4">Receita</th>
                                <th className="px-6 py-4">Tracking</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                            {catalog.map((product: any) => (
                                <tr key={product.id} className="transition-colors hover:bg-[#FCFCFC] dark:hover:bg-white/[0.02]">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-text-primary">{product.name}</span>
                                            <span className="mt-1 text-sm text-text-muted">
                                                {product.active ? 'Ativo para venda' : 'Inativo no catalogo'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-[#F7F7F7] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-text-muted dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            {product.type || 'KOINS'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-text-primary">{formatBrl(product.price)}</td>
                                    <td className="px-6 py-5 text-sm font-semibold text-text-primary">{formatNumber(product.sales)}</td>
                                    <td className="px-6 py-5 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatBrl(product.revenue)}</td>
                                    <td className="px-6 py-5 text-sm text-text-muted">
                                        {product.tracking_status === 'catalog_match' ? 'Conciliado por catalogo' : 'Aguardando venda ou match'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                <div className="flex flex-col gap-3 border-b border-black/[0.06] px-6 py-6 dark:border-white/[0.08] lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Consumo por cliente</p>
                        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Uso real de API e Koins</h3>
                        <p className="mt-1 text-sm text-text-muted">Sem estimativa. Tokens, custo OpenAI, consumo de Koins e saldo atual por cliente.</p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-[#F8F8F8] px-4 py-2 text-xs font-medium text-text-muted dark:border-white/[0.08] dark:bg-white/[0.03]">
                        <Wallet className="h-4 w-4 text-orange-500" />
                        {formatNumber(products.usersWithKoins)} clientes ainda tem saldo
                    </div>
                </div>

                {loadingCons ? (
                    <div className="px-6 py-12 text-sm text-text-muted">Carregando consumo individual...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-[#FAFAFA] text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:bg-white/[0.03]">
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Mensagens</th>
                                    <th className="px-6 py-4">Tokens</th>
                                    <th className="px-6 py-4">OpenAI</th>
                                    <th className="px-6 py-4">Koins consumidos</th>
                                    <th className="px-6 py-4">Saldo atual</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                                {consumptionLogs.map((log) => (
                                    <tr key={log.id || log.email || log.user_name} className="transition-colors hover:bg-[#FCFCFC] dark:hover:bg-white/[0.02]">
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-text-primary">{log.company_name || 'Sem empresa'}</span>
                                                <span className="mt-1 text-sm text-text-muted">{log.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-text-primary">{formatNumber(log.total_messages)}</td>
                                        <td className="px-6 py-5 text-sm text-text-muted">
                                            {formatNumber(log.total_prompt_tokens)} / {formatNumber(log.total_completion_tokens)}
                                        </td>
                                        <td className="px-6 py-5 text-sm font-semibold text-text-primary">{formatUsd(log.total_cost)}</td>
                                        <td className="px-6 py-5 text-sm font-semibold text-orange-600 dark:text-orange-300">{formatKoins(log.koins_spent_real)}</td>
                                        <td className="px-6 py-5 text-sm text-text-primary">{formatKoins(log.current_koins_balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {consumptionLogs.length === 0 && (
                            <div className="px-6 py-12 text-sm text-text-muted">
                                Ainda nao ha consumo consolidado para exibir.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
