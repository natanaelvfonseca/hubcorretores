import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Calendar, DollarSign, Trash2, Phone, Mail, Globe, UserCheck, User } from 'lucide-react';
import { Lead } from '../types';

const INTENT_CONFIG = {
    HOT: { label: 'QUENTE', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/25', ring: '#fb923c', cardBorder: 'border-orange-500/35' },
    WARM: { label: 'MORNO', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/25', ring: '#facc15', cardBorder: 'border-yellow-500/30' },
    COLD: { label: 'FRIO', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', ring: '#60a5fa', cardBorder: 'border-border/50' },
};

interface Vendedor { id: string; nome: string; }

interface KanbanCardProps {
    lead: Lead;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void;
    onDelete?: (leadId: string) => void;
    onEdit?: (lead: Lead) => void;
    onMarkAsClient?: (leadId: string) => void;
    onAssignVendedor?: (leadId: string, vendedorId: string | null) => void;
    vendedores?: Vendedor[];
}

export function KanbanCard({ lead, onDragStart, onDelete, onEdit, onMarkAsClient, onAssignVendedor, vendedores = [] }: KanbanCardProps) {
    if (!lead) return null;

    const [showVendedorMenu, setShowVendedorMenu] = useState(false);
    const vendedorMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (vendedorMenuRef.current && !vendedorMenuRef.current.contains(e.target as Node)) {
                setShowVendedorMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const intentCfg = lead.intentLabel ? INTENT_CONFIG[lead.intentLabel] : null;
    const score = lead.score ?? 0;
    const circumference = 2 * Math.PI * 10;
    const assignedVendedor = vendedores.find(v => v.id === (lead as any).assignedTo);

    const formatValue = (value: number) => new Intl.NumberFormat('pt-BR', {
        style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value);

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
            }).format(new Date(dateString));
        } catch { return dateString; }
    };

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, lead.id)}
            className={`bg-surface border rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-move group animate-fade-in mb-3 active:scale-95 active:rotate-1 overflow-hidden ${intentCfg ? intentCfg.cardBorder : 'border-border/50'} hover:border-primary/30`}
        >
            {/* Header Row */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        {intentCfg && score > 0 ? (
                            <svg width="36" height="36" viewBox="0 0 36 36" className="absolute inset-0">
                                <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="18" cy="18" r="10" fill="none" stroke={intentCfg.ring} strokeWidth="3"
                                    strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
                                    strokeLinecap="round" transform="rotate(-90 18 18)" />
                            </svg>
                        ) : null}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/5 relative z-10 m-[2px]">
                            {(lead.name || 'Sem Nome').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-text-primary text-sm leading-tight group-hover:text-primary transition-colors">{lead.name || 'Sem Nome'}</h4>
                            {intentCfg && score > 0 && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${intentCfg.bg} ${intentCfg.color} border ${intentCfg.border} flex-shrink-0 tracking-wide`}>
                                    {intentCfg.label} {score}
                                </span>
                            )}
                        </div>
                        {lead.phone && (
                            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5"><Phone size={10} />{lead.phone}</p>
                        )}
                        {lead.email && (
                            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5 truncate max-w-[180px]" title={lead.email}><Mail size={10} />{lead.email}</p>
                        )}
                        {lead.source && (
                            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5"><Globe size={10} />{lead.source}</p>
                        )}
                        {lead.briefing && (
                            <p className="text-[10px] text-text-muted italic mt-1 leading-snug line-clamp-2" title={lead.briefing}>{lead.briefing}</p>
                        )}
                        {!intentCfg && lead.temperature && (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 border ${lead.temperature.includes('Quente') ? 'bg-red-500/10 text-red-500 border-red-500/20' : lead.temperature.includes('Morno') ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                <span>{lead.temperature}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions — contained inside the card via overflow-hidden on parent */}
                <div className="flex gap-1 flex-shrink-0 ml-1">
                    {/* Assign vendor icon */}
                    {onAssignVendedor && (
                        <div className="relative" ref={vendedorMenuRef}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowVendedorMenu(v => !v); }}
                                className={`transition-colors p-1 rounded ${assignedVendedor ? 'text-primary' : 'text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100'} hover:bg-white/5`}
                                title={assignedVendedor ? `Vendedor: ${assignedVendedor.nome}` : 'Atribuir Vendedor'}
                            >
                                <User size={15} />
                            </button>
                            {showVendedorMenu && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl z-50 py-1">
                                    <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider border-b border-border/50">Atribuir Vendedor</div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onAssignVendedor(lead.id, null); setShowVendedorMenu(false); }}
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-white/5 text-text-secondary"
                                    >
                                        — Sem atribuição
                                    </button>
                                    {vendedores.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={(e) => { e.stopPropagation(); onAssignVendedor(lead.id, v.id); setShowVendedorMenu(false); }}
                                            className={`w-full text-left px-3 py-2 text-xs hover:bg-white/5 ${v.id === (lead as any).assignedTo ? 'text-primary font-semibold' : 'text-text-primary'}`}
                                        >
                                            {v.nome}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); if (confirm('Tem certeza que deseja excluir este lead?')) onDelete(lead.id); }}
                            className="text-text-muted hover:text-red-500 transition-colors p-1 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100"
                            title="Excluir Lead"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                    {onMarkAsClient && lead.status !== 'Cliente' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); if (confirm(`Marcar ${lead.name} como Cliente?`)) onMarkAsClient(lead.id); }}
                            className="text-text-muted hover:text-green-500 transition-colors p-1 hover:bg-green-500/10 rounded"
                            title="Fechar Negócio"
                        >
                            <UserCheck size={16} />
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(lead); }}
                        className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-white/5 rounded"
                        title="Editar Lead"
                    >
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Vendor badge */}
            {assignedVendedor && (
                <div className="flex items-center gap-1 mb-2">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                        <User size={9} />
                        {assignedVendedor.nome}
                    </span>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border/30 pt-3 mt-1">
                <div className="flex items-center gap-1.5 font-medium text-text-primary/80">
                    <DollarSign size={12} className="text-green-500" />
                    {formatValue(lead.value || 0)}
                </div>
                <div className="flex items-center gap-1.5" title={lead.lastContact}>
                    <Calendar size={12} />
                    {formatDate(lead.lastContact)}
                </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {lead.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-text-primary/5 text-text-secondary border border-text-primary/5">{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
}
