import { CheckCheck, X } from 'lucide-react';
import type { ConstrutoraPresentationData } from '../../../data/construtoraMockData';
import { cn } from '../../../utils/cn';

function formatMessageTime(value: string) {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

interface LeadConversationModalProps {
    data: ConstrutoraPresentationData;
    activeLeadId: string | null;
    onClose: () => void;
}

export function LeadConversationModal({
    data,
    activeLeadId,
    onClose,
}: LeadConversationModalProps) {
    const activeLead = activeLeadId
        ? data.leads.find((lead) => lead.id === activeLeadId) ?? null
        : null;
    const activeConversation = activeLead ? data.conversationsByLeadId[activeLead.id] : null;

    if (!activeLead || !activeConversation) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md">
            <button
                type="button"
                onClick={onClose}
                className="absolute inset-0"
                aria-label="Fechar conversa"
            />

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-surface shadow-[0_32px_90px_rgba(4,19,31,0.34)] lg:grid-cols-[1.15fr_0.85fr]">
                <div className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(53,151,143,0.18),_transparent_28%),linear-gradient(180deg,#e8efe7,#dfeae2)]">
                    <div className="flex items-center justify-between border-b border-black/5 bg-[#0b3a55] px-5 py-4 text-white">
                        <div>
                            <p className="text-sm font-semibold">{activeLead.nome}</p>
                            <p className="text-xs text-white/70">{data.activeEmpreendimento.nome}</p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-3 px-4 py-5 sm:px-5">
                        {activeConversation.messages.map((message) => (
                            <div
                                key={message.id}
                                className={cn('flex', message.autor === 'atendimento' ? 'justify-end' : 'justify-start')}
                            >
                                <div
                                    className={cn(
                                        'max-w-[85%] rounded-[22px] px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)]',
                                        message.autor === 'atendimento'
                                            ? 'rounded-tr-md bg-[#dcf8c6] text-slate-900'
                                            : 'rounded-tl-md bg-white text-slate-800',
                                    )}
                                >
                                    <p className="text-sm leading-6">{message.texto}</p>
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <span className="text-[11px] text-slate-500">{formatMessageTime(message.enviado_em)}</span>
                                        {message.autor === 'atendimento' && (
                                            <CheckCheck size={14} className="text-[#0f7b8c]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className="bg-surface px-6 py-6">
                    <div className="rounded-[26px] border border-primary/15 bg-primary/[0.05] p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/70">
                            Resumo da conversa
                        </p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">
                            {activeConversation.thread.resumo}
                        </p>
                    </div>

                    <div className="mt-5 space-y-3">
                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Interesse</p>
                            <p className="mt-2 text-lg font-semibold text-text-primary">{activeLead.interesse}</p>
                            <p className="mt-1 text-sm text-text-secondary">{activeLead.regiao}</p>
                        </div>

                        <div className="rounded-[24px] border border-border/70 bg-background/75 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Atendimento</p>
                            <p className="mt-2 text-lg font-semibold text-text-primary">{activeLead.corretor_nome}</p>
                            <p className="mt-1 text-sm text-text-secondary">{activeLead.ultima_atualizacao}</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
