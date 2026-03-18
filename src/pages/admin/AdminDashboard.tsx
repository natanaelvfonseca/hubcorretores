import { type ReactNode, useEffect, useState } from 'react';
import {
    BrainCircuit,
    CalendarDays,
    Edit2,
    Filter,
    LayoutDashboard,
    Megaphone,
    Package2,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import { OverviewTab } from './dashboard/OverviewTab';
import { ProductsTab } from './dashboard/ProductsTab';
import { AdsTab } from './dashboard/AdsTab';
import { ConversationIntelligenceTab } from './dashboard/ConversationIntelligenceTab';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    koins_balance: number;
    created_at: string;
    role: string;
    company_name: string;
    plan_type: string;
}

type AdminTab = 'overview' | 'products' | 'ads' | 'users' | 'intelligence';

const tabs: Array<{
    id: AdminTab;
    label: string;
    icon: ReactNode;
}> = [
        { id: 'overview', label: 'Visao geral', icon: <LayoutDashboard className="h-4 w-4" /> },
        { id: 'products', label: 'Produtos e consumo', icon: <Package2 className="h-4 w-4" /> },
        { id: 'ads', label: 'Aquisicao', icon: <Megaphone className="h-4 w-4" /> },
        { id: 'users', label: 'Clientes', icon: <Users className="h-4 w-4" /> },
        { id: 'intelligence', label: 'Conversation intel', icon: <BrainCircuit className="h-4 w-4" /> },
    ];

const periods = [
    { value: 'today', label: 'Hoje' },
    { value: '7d', label: 'Ultimos 7 dias' },
    { value: '30d', label: 'Ultimos 30 dias' },
    { value: 'this_month', label: 'Este mes' },
    { value: 'last_month', label: 'Mes anterior' },
    { value: 'this_year', label: 'Este ano' },
    { value: 'all', label: 'Todo o periodo' },
];

function formatCompactNumber(value?: number) {
    return Number(value || 0).toLocaleString('pt-BR');
}

function formatKoins(value?: number) {
    return `${formatCompactNumber(value)} koins`;
}

function formatUsd(value?: number) {
    return Number(value || 0).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    });
}

function HeaderStat({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-3xl border border-black/[0.06] bg-white/75 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">{label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-text-primary">{value}</p>
        </div>
    );
}

function LoadingShell() {
    return (
        <div className="flex min-h-[52vh] items-center justify-center rounded-[32px] border border-black/[0.06] bg-white/70 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-white/[0.03]">
            <div className="flex items-center gap-3 rounded-full border border-orange-200/80 bg-orange-50 px-5 py-3 text-sm font-medium text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                <span className="h-3 w-3 animate-pulse rounded-full bg-orange-500" />
                Carregando dados reais do painel
            </div>
        </div>
    );
}

export function AdminDashboard() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [period, setPeriod] = useState<string>('30d');
    const [strategicData, setStrategicData] = useState<any>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ email: '', name: '', role: 'user' });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    const showPeriodFilter = activeTab === 'overview' || activeTab === 'products' || activeTab === 'ads';

    useEffect(() => {
        if (!token) return;
        fetchData();
    }, [activeTab, period, token]);

    const resetUserForm = () => {
        setFormError('');
        setFormSuccess('');
        setNewUserForm({ email: '', name: '', role: 'user' });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const requests: Promise<void>[] = [];

            requests.push(
                fetch(`${apiBase}/api/admin/strategic-metrics?period=${period}`, { headers })
                    .then((res) => res.json())
                    .then((data) => setStrategicData(data))
            );

            if (activeTab === 'users') {
                requests.push(
                    fetch(`${apiBase}/api/admin/users`, { headers })
                        .then((res) => res.json())
                        .then((data) => setUsers(Array.isArray(data) ? data : []))
                );
            }

            await Promise.all(requests);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditKoins = async (userId: string, currentBalance: number) => {
        const amount = prompt(`Ajustar saldo de Koins (atual: ${currentBalance}). Digite o valor para adicionar ou remover.`);
        if (amount && !Number.isNaN(parseInt(amount, 10))) {
            try {
                const res = await fetch(`${apiBase}/api/admin/users/${userId}/koins`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ amount: parseInt(amount, 10) }),
                });
                if (res.ok) {
                    fetchData();
                } else {
                    alert('Erro ao atualizar saldo.');
                }
            } catch (error) {
                alert('Erro ao atualizar saldo.');
            }
        }
    };

    const handleAddUser = async () => {
        setFormError('');
        setFormSuccess('');
        if (!newUserForm.email || !newUserForm.name) {
            setFormError('Email e nome sao obrigatorios.');
            return;
        }

        try {
            const res = await fetch(`${apiBase}/api/admin/users`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserForm),
            });

            const data = await res.json();

            if (!res.ok) {
                setFormError(data.error || 'Erro ao criar usuario.');
                return;
            }

            setFormSuccess('Usuario criado com sucesso.');
            setTimeout(() => {
                setShowAddUserModal(false);
                resetUserForm();
                fetchData();
            }, 1200);
        } catch (error) {
            setFormError('Erro de conexao ao criar usuario.');
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Tem certeza que deseja excluir o usuario "${userName}"?`)) {
            return;
        }

        try {
            const res = await fetch(`${apiBase}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                fetchData();
            } else {
                const data = await res.json();
                alert(data.error || 'Erro ao excluir usuario.');
            }
        } catch (error) {
            alert('Erro de conexao ao excluir usuario.');
        }
    };

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const meta = strategicData?.meta;
    const overview = strategicData?.overview;

    return (
        <div className="space-y-8 px-4 py-6 md:px-8">
            <section className="overflow-hidden rounded-[36px] border border-black/[0.06] bg-[radial-gradient(circle_at_top_left,_rgba(255,76,0,0.16),_transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(249,249,249,0.92))] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,76,0,0.18),_transparent_30%),linear-gradient(135deg,rgba(16,18,22,0.98),rgba(11,13,16,0.96))] md:p-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-orange-700 shadow-[0_10px_24px_rgba(255,76,0,0.08)] dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200">
                            <ShieldCheck className="h-4 w-4" />
                            Admin Kogna
                        </div>
                        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary md:text-5xl">
                            Painel executivo da operacao Kogna.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted md:text-base">
                            Monitore clientes, consumo, receita e inteligencia comercial com a mesma linguagem premium do restante da plataforma.
                        </p>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 xl:w-auto">
                        <HeaderStat label="Clientes Ativos" value={formatCompactNumber(overview?.activeClients ?? meta?.totalClients)} />
                        <HeaderStat label="Koins em saldo" value={formatKoins(meta?.totalKoinsBalance)} />
                        <HeaderStat label="OpenAI API" value={formatUsd(overview?.apiCost)} />
                        <HeaderStat label="Mensagens" value={formatCompactNumber(overview?.totalMessages)} />
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all',
                                    activeTab === tab.id
                                        ? 'border-orange-500 bg-gradient-to-r from-[#FF6A1A] to-[#FF4C00] text-white shadow-[0_18px_36px_rgba(255,104,31,0.24)]'
                                        : 'border-black/[0.06] bg-white/80 text-text-muted hover:border-orange-200 hover:text-text-primary dark:border-white/[0.08] dark:bg-white/[0.04]'
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {showPeriodFilter && (
                        <div className="inline-flex items-center gap-3 rounded-full border border-black/[0.06] bg-white/80 px-4 py-2.5 text-sm shadow-[0_10px_24px_rgba(15,23,42,0.05)] dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <CalendarDays className="h-4 w-4 text-orange-500" />
                            <select
                                value={period}
                                onChange={(event) => setPeriod(event.target.value)}
                                className="min-w-[170px] bg-transparent text-sm font-medium text-text-primary outline-none"
                            >
                                {periods.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </section>

            {loading ? (
                <LoadingShell />
            ) : (
                <>
                    {activeTab === 'overview' && <OverviewTab data={strategicData} />}
                    {activeTab === 'products' && <ProductsTab data={strategicData} />}
                    {activeTab === 'ads' && <AdsTab data={strategicData} />}
                    {activeTab === 'intelligence' && <ConversationIntelligenceTab />}

                    {activeTab === 'users' && (
                        <section className="overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.04]">
                            <div className="flex flex-col gap-5 border-b border-black/[0.06] px-6 py-6 dark:border-white/[0.08] lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">Base comercial</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Gestao de clientes</h2>
                                    <p className="mt-1 text-sm text-text-muted">Ajuste saldo de Koins, acompanhe o cadastro e mantenha a operacao pronta para venda.</p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <div className="relative min-w-[260px]">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por cliente, email ou empresa"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            className="h-12 w-full rounded-2xl border border-black/[0.06] bg-[#F8F8F8] pl-11 pr-4 text-sm text-text-primary outline-none transition-all focus:border-orange-200 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowAddUserModal(true)}
                                            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF4C00] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(255,104,31,0.24)] transition-transform hover:-translate-y-0.5"
                                        >
                                            <UserPlus className="h-4 w-4" />
                                            Adicionar cliente
                                        </button>
                                        <button className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/80 text-text-muted transition-colors hover:text-text-primary dark:border-white/[0.08] dark:bg-white/[0.04]">
                                            <Filter className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-[#FAFAFA] text-xs font-semibold uppercase tracking-[0.18em] text-text-muted dark:bg-white/[0.03]">
                                        <tr>
                                            <th className="px-6 py-4">Empresa</th>
                                            <th className="px-6 py-4">Plano</th>
                                            <th className="px-6 py-4">Saldo</th>
                                            <th className="px-6 py-4">Cadastro</th>
                                            <th className="px-6 py-4 text-right">Acoes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id} className="transition-colors hover:bg-[#FCFCFC] dark:hover:bg-white/[0.02]">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-text-primary">{user.company_name || 'Sem empresa'}</span>
                                                        <span className="mt-1 text-sm text-text-muted">{user.name} · {user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-[#F7F7F7] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-text-muted dark:border-white/[0.08] dark:bg-white/[0.04]">
                                                        {user.plan_type || 'basic'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-sm font-semibold text-orange-600 dark:text-orange-300">
                                                    {formatKoins(user.koins_balance)}
                                                </td>
                                                <td className="px-6 py-5 text-sm text-text-muted">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditKoins(user.id, user.koins_balance)}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] text-text-muted transition-colors hover:border-orange-200 hover:text-orange-600 dark:border-white/[0.08] dark:hover:text-orange-300"
                                                            title="Editar saldo"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] text-text-muted transition-colors hover:border-red-200 hover:text-red-500 dark:border-white/[0.08]"
                                                            title="Excluir usuario"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </>
            )}

            {showAddUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-[32px] border border-black/[0.06] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] dark:border-white/[0.08] dark:bg-[#111317]">
                        <div className="flex items-start justify-between border-b border-black/[0.06] px-6 py-5 dark:border-white/[0.08]">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">Novo cliente</p>
                                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">Criar acesso no admin</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    resetUserForm();
                                }}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] text-text-muted transition-colors hover:text-text-primary dark:border-white/[0.08]"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4 px-6 py-6">
                            {formError && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                    {formSuccess}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Email</label>
                                <input
                                    type="email"
                                    value={newUserForm.email}
                                    onChange={(event) => setNewUserForm({ ...newUserForm, email: event.target.value })}
                                    placeholder="cliente@empresa.com"
                                    className="h-12 w-full rounded-2xl border border-black/[0.06] bg-[#F8F8F8] px-4 text-sm text-text-primary outline-none transition-all focus:border-orange-200 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Nome</label>
                                <input
                                    type="text"
                                    value={newUserForm.name}
                                    onChange={(event) => setNewUserForm({ ...newUserForm, name: event.target.value })}
                                    placeholder="Nome completo"
                                    className="h-12 w-full rounded-2xl border border-black/[0.06] bg-[#F8F8F8] px-4 text-sm text-text-primary outline-none transition-all focus:border-orange-200 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-text-primary">Funcao</label>
                                <select
                                    value={newUserForm.role}
                                    onChange={(event) => setNewUserForm({ ...newUserForm, role: event.target.value })}
                                    className="h-12 w-full rounded-2xl border border-black/[0.06] bg-[#F8F8F8] px-4 text-sm text-text-primary outline-none transition-all focus:border-orange-200 focus:bg-white dark:border-white/[0.08] dark:bg-white/[0.03]"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-black/[0.06] px-6 py-5 dark:border-white/[0.08] sm:flex-row sm:justify-end">
                            <button
                                onClick={() => {
                                    setShowAddUserModal(false);
                                    resetUserForm();
                                }}
                                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.06] px-5 text-sm font-medium text-text-primary transition-colors hover:bg-[#F7F7F7] dark:border-white/[0.08] dark:hover:bg-white/[0.04]"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddUser}
                                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF4C00] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(255,104,31,0.24)] transition-transform hover:-translate-y-0.5"
                            >
                                Criar cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
