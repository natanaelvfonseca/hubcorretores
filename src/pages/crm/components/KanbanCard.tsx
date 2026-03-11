import { useState, useRef, useEffect } from 'react';
import { Calendar, DollarSign, Trash2, Phone, Mail, Globe, MoreHorizontal, UserCheck, User, Brain, Bell } from 'lucide-react';
import { Lead } from '../types';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';

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
    vendedores?: Vendedor[];
    token?: string;
}

export function KanbanCard({ lead, onDragStart, onDelete, onEdit, onMarkAsClient, vendedores = [], token }: KanbanCardProps) {
    if (!lead) return null;

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [intelligence, setIntelligence] = useState<any>(null);
    const [followupStatus, setFollowupStatus] = useState<string | null>(null);

    // Fetch AI Opportunity Score for this lead (non-blocking)
    useEffect(() => {
        if (!token || !lead.id) return;
        fetch(`${apiBase}/api/leads/${lead.id}/opportunity-score`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.hasScore) setIntelligence(data); })
            .catch(() => { });
    }, [lead.id, token]);

    // Fetch Follow-up Engine status for this lead (non-blocking)
    useEffect(() => {
        if (!token || !lead.phone) return;
        const jid = encodeURIComponent(lead.phone.replace(/\D/g, '') + '@s.whatsapp.net');
        fetch(`${apiBase}/api/followup/status/${jid}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data && data.status !== 'none') setFollowupStatus(data.status); })
            .catch(() => { });
    }, [lead.id, lead.phone, token]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
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
                            <h4
                                onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(lead); }}
                                className="font-semibold text-text-primary text-sm leading-tight hover:text-primary transition-colors cursor-pointer"
                                title="Editar Negócio"
                            >
                                {lead.name || 'Sem Nome'}
                            </h4>
                            {intentCfg && score > 0 && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${intentCfg.bg} ${intentCfg.color} border ${intentCfg.border} flex-shrink-0 tracking-wide`}>
                                    {intentCfg.label} {score}
                                </span>
                            )}
                            {/* AI Lead Score badge from Opportunity Scoring Engine */}
                            {intelligence && !intentCfg && (
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 tracking-wide flex items-center gap-1
                                ${intelligence.temperature === 'quente' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/25' :
                                        intelligence.temperature === 'morno' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25' :
                                            'bg-blue-500/10 text-blue-400 border border-blue-500/25'}`}
                                >
                                    <Brain size={10} />
                                    {intelligence.temperature === 'quente' ? '🔥' : intelligence.temperature === 'morno' ? '🌡️' : '❄️'} {intelligence.score}
                                </div>
                            )}
                            {/* Follow-up Engine Status Badge */}
                            {followupStatus === 'pending' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/25 flex items-center gap-1 flex-shrink-0">
                                    <Bell size={8} /> FOLLOW-UP ACTIVE
                                </span>
                            )}
                            {followupStatus === 'sent' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/25 flex items-center gap-1 flex-shrink-0">
                                    <Bell size={8} /> FOLLOW-UP SENT
                                </span>
                            )}
                            {followupStatus === 'replied' && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/25 flex items-center gap-1 flex-shrink-0">
                                    ✅ LEAD REENGAGED
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
                        {/* AI Intelligence: detected intent + product + top objection */}
                        {intelligence && (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {intelligence.intent && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                        {intelligence.intent}
                                    </span>
                                )}
                                {intelligence.product_interest && intelligence.product_interest !== 'N/A' && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        🛒 {intelligence.product_interest}
                                    </span>
                                )}
                                {intelligence.top_objection && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate max-w-[100px]" title={intelligence.top_objection}>
                                        ⚠️ {intelligence.top_objection}
                                    </span>
                                )}
                            </div>
                        )}
                        {!intentCfg && lead.temperature && !intelligence && (
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1.5 border ${lead.temperature.includes('Quente') ? 'bg-red-500/10 text-red-500 border-red-500/20' : lead.temperature.includes('Morno') ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                                <span>{lead.temperature}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions — consolidated into a single dropdown */}
                <div className="relative flex-shrink-0 ml-1" ref={menuRef}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
                        className="text-text-muted hover:text-text-primary transition-colors p-1 hover:bg-white/5 rounded focus:outline-none"
                        title="Ações"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-surface border border-border rounded-lg shadow-xl z-50 py-1 overflow-hidden transform origin-top-right">

                            {/* Option: Close Deal */}
                            {onMarkAsClient && lead.status !== 'Cliente' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); if (confirm(`Marcar ${lead.name} como Cliente?`)) { onMarkAsClient(lead.id); } setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-green-500/10 text-green-500 transition-colors"
                                >
                                    <UserCheck size={14} />
                                    Fechar Negócio (Cliente)
                                </button>
                            )}

                            {/* Option: Delete */}
                            {onDelete && (
                                <div className="border-t border-border/30 mt-1 pt-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Excluir este lead?')) { onDelete(lead.id); } setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-red-500/10 text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        Excluir Lead
                                    </button>
                                </div>
                            )}

                        </div>
                    )}
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
