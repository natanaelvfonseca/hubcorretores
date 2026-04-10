import { Megaphone, PlusCircle, Save, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    getConstrutoraEmpreendimentos,
    type EmpreendimentoStatus,
} from '../../data/construtoraMockData';
import { isConstrutoraUser } from '../../lib/portalAccess';

export function ConstrutoraEmpreendimentos() {
    const { user } = useAuth();

    if (!isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const [empreendimentos, setEmpreendimentos] = useState(getConstrutoraEmpreendimentos());
    const [selectedId, setSelectedId] = useState(empreendimentos[0]?.id || '');
    const [feedback, setFeedback] = useState<string | null>(null);
    const selected = useMemo(
        () => empreendimentos.find((empreendimento) => empreendimento.id === selectedId) ?? empreendimentos[0],
        [empreendimentos, selectedId],
    );

    if (!selected) {
        return null;
    }

    const updateSelected = (field: 'status' | 'observacoes', value: string) => {
        setEmpreendimentos((current) =>
            current.map((empreendimento) =>
                empreendimento.id === selected.id
                    ? {
                        ...empreendimento,
                        [field]: value,
                    }
                    : empreendimento,
            ),
        );
    };

    const handleQuickAction = (message: string) => {
        setFeedback(message);
    };

    return (
        <div className="space-y-6 pb-6">
            <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Empreendimentos</p>
                <h1 className="mt-2 text-3xl font-display text-text-primary">Acompanhe cada projeto em um unico lugar</h1>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                    Veja os resultados de cada empreendimento e ajuste a operacao comercial sem sair do painel.
                </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Lista de empreendimentos</p>
                    <div className="mt-6 space-y-3">
                        {empreendimentos.map((empreendimento) => (
                            <button
                                key={empreendimento.id}
                                type="button"
                                onClick={() => {
                                    setSelectedId(empreendimento.id);
                                    setFeedback(null);
                                }}
                                className={`w-full rounded-[24px] border p-5 text-left transition ${selected.id === empreendimento.id
                                    ? 'border-primary/25 bg-primary/[0.06] shadow-[0_18px_50px_rgba(15,123,140,0.12)]'
                                    : 'border-border/70 bg-background/80 hover:border-primary/20'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-display text-text-primary">{empreendimento.nome}</h2>
                                        <p className="mt-2 text-sm text-text-secondary">{empreendimento.status}</p>
                                    </div>
                                    <span className="rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-text-secondary">
                                        {empreendimento.vendas} vendas
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <section className="rounded-[30px] border border-border/70 bg-surface/92 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">Empreendimento selecionado</p>
                        <h2 className="text-3xl font-display text-text-primary">{selected.nome}</h2>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        {[
                            { label: 'Leads gerados', value: selected.leads_gerados },
                            { label: 'Leads qualificados', value: selected.leads_qualificados },
                            { label: 'Vendas', value: selected.vendas },
                        ].map((card) => (
                            <article
                                key={card.label}
                                className="rounded-[24px] border border-border/70 bg-background/80 p-5"
                            >
                                <p className="text-sm font-semibold text-text-secondary">{card.label}</p>
                                <p className="mt-2 text-3xl font-display text-text-primary">
                                    {card.value.toLocaleString('pt-BR')}
                                </p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                Status do empreendimento
                            </label>
                            <select
                                value={selected.status}
                                onChange={(event) => updateSelected('status', event.target.value as EmpreendimentoStatus)}
                                className="mt-3 h-[52px] w-full rounded-[18px] border border-border/80 bg-surface px-4 py-3 text-sm font-semibold text-text-primary outline-none transition focus:border-primary/35"
                            >
                                <option value="Lancamento">Lancamento</option>
                                <option value="Em vendas">Em vendas</option>
                                <option value="Finalizado">Finalizado</option>
                            </select>

                            <button
                                type="button"
                                onClick={() => setFeedback('Status atualizado com sucesso.')}
                                className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/15"
                            >
                                <Save size={16} />
                                Salvar status
                            </button>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-background/80 p-5">
                            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                                Observacoes
                            </label>
                            <textarea
                                value={selected.observacoes}
                                onChange={(event) => updateSelected('observacoes', event.target.value)}
                                className="mt-3 h-32 w-full resize-none rounded-[18px] border border-border/80 bg-surface px-4 py-3 text-sm leading-7 text-text-primary outline-none transition focus:border-primary/35"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={() => handleQuickAction('Campanha ativada para este empreendimento.')}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-primary/10 px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/15"
                        >
                            <Megaphone size={16} />
                            Ativar campanha
                        </button>

                        <button
                            type="button"
                            onClick={() => handleQuickAction('Promocao adicionada com sucesso.')}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-[18px] border border-border/80 bg-surface px-4 text-sm font-semibold text-text-primary transition hover:border-primary/20 hover:text-primary"
                        >
                            <PlusCircle size={16} />
                            Adicionar promocao
                        </button>
                    </div>

                    {feedback && (
                        <div className="mt-5 rounded-[22px] border border-emerald-200/80 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} />
                                {feedback}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
