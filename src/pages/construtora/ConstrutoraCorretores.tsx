import { Filter, Timer, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getConstrutoraPresentationData } from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';

export function ConstrutoraCorretores() {
    const { user } = useAuth();

    if (!isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const initialData = getConstrutoraPresentationData();
    const [selectedEmpreendimentoId, setSelectedEmpreendimentoId] = useState(initialData.activeEmpreendimento.id);
    const data = useMemo(
        () => getConstrutoraPresentationData(selectedEmpreendimentoId),
        [selectedEmpreendimentoId],
    );

    return (
        <div className="space-y-6 pb-6">
            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Corretores</p>
                        <h1 className="mt-2 text-3xl font-display text-text-primary">Atendimento e conversao do time</h1>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            Veja com clareza quem esta recebendo mais leads, respondendo mais rapido e convertendo melhor.
                        </p>
                    </div>

                    <div className="w-full max-w-sm rounded-[24px] border border-border/70 bg-background/80 p-4">
                        <label className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                            <Filter size={14} />
                            Empreendimento
                        </label>
                        <select
                            value={data.activeEmpreendimento.id}
                            onChange={(event) => setSelectedEmpreendimentoId(event.target.value)}
                            className="h-[52px] w-full rounded-[18px] border border-border/80 bg-surface px-4 py-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary/35"
                        >
                            {data.accessibleEmpreendimentos.map((empreendimento) => (
                                <option key={empreendimento.id} value={empreendimento.id}>
                                    {empreendimento.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: 'Corretores ativos',
                        value: data.corretores.length.toLocaleString('pt-BR'),
                        icon: Users,
                    },
                    {
                        label: 'Tempo medio de resposta',
                        value: `${Math.round(data.corretores.reduce((total, item) => total + item.tempo_resposta_min, 0) / Math.max(data.corretores.length, 1))} min`,
                        icon: Timer,
                    },
                    {
                        label: 'Conversao media',
                        value: `${Math.round(data.corretores.reduce((total, item) => total + item.conversao, 0) / Math.max(data.corretores.length, 1))}%`,
                        icon: TrendingUp,
                    },
                ].map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            key={card.label}
                            className="rounded-[26px] border border-border/70 bg-surface/92 p-5 shadow-[0_18px_50px_rgba(8,23,38,0.06)]"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon size={20} />
                            </div>
                            <p className="mt-5 text-sm font-semibold text-text-secondary">{card.label}</p>
                            <p className="mt-1 text-3xl font-display text-text-primary">{card.value}</p>
                        </article>
                    );
                })}
            </section>

            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <div className="flex flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Tabela de desempenho</p>
                    <h2 className="text-2xl font-display text-text-primary">Resultados por corretor</h2>
                </div>

                <div className="mt-6 overflow-hidden rounded-[24px] border border-border/70 bg-background/80">
                    <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-border/70 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted md:grid">
                        <span>Nome</span>
                        <span>Leads recebidos</span>
                        <span>Tempo de resposta</span>
                        <span>Conversao</span>
                    </div>

                    <div className="divide-y divide-border/70">
                        {data.corretores.map((corretor) => (
                            <div
                                key={corretor.id}
                                className="grid gap-4 px-5 py-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] md:items-center"
                            >
                                <p className="text-base font-semibold text-text-primary">{corretor.nome}</p>
                                <p className="text-sm font-semibold text-text-primary">{corretor.leads_recebidos} leads</p>
                                <p className="text-sm font-semibold text-text-primary">{corretor.tempo_resposta_min} min</p>
                                <span className="inline-flex w-fit items-center rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    {corretor.conversao}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
