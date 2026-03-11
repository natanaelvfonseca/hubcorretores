import { useRef, useState } from 'react';
import { KanbanCard } from './KanbanCard';
import { KanbanColumn as KanbanColumnType } from '../types';
import { Plus } from 'lucide-react';


interface KanbanColumnProps {
    column: KanbanColumnType;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: string) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void;
    onDeleteLead?: (leadId: string) => void;
    onEditLead?: (lead: any) => void;
    onMarkAsClient?: (leadId: string) => void;
    token?: string;
}

export function KanbanColumn({ column, onDrop, onDragOver, onDragStart, onDeleteLead, onEditLead, onMarkAsClient, token }: KanbanColumnProps) {
    const columnRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(20);

    const totalValue = column.leads.reduce((sum, lead) => sum + lead.value, 0);

    const formatValue = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const visibleLeads = column.leads.slice(0, visibleCount);

    return (
        <div className="flex-shrink-0 w-80 min-w-80 h-full flex flex-col bg-background/5 border border-border/20 rounded-xl p-2 shadow-sm hover:border-primary/20 transition-all">
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-border/10">
                <h3 className="text-sm font-semibold text-text-primary px-2">{column.title}</h3>
                <span className="text-xs font-mono text-text-muted bg-white/5 px-2 py-0.5 rounded-full">{column.leads.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto px-1 scrollbar-hide space-y-2"
                onDrop={(e) => onDrop(e, column.id)}
                onDragOver={onDragOver}
                ref={columnRef}
            >
                {visibleLeads.map((lead) => (
                    <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onDragStart={onDragStart}
                        onDelete={onDeleteLead}
                        onEdit={onEditLead}
                        onMarkAsClient={onMarkAsClient}
                        token={token}
                    />
                ))}
                {column.leads.length === 0 && (
                    <div className="h-24 rounded-xl border-dashed border-2 border-white/5 flex items-center justify-center text-text-muted text-xs select-none">
                        Arraste leads para cá
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-border/10 flex justify-between items-center px-1">
                <span className="text-xs font-medium text-text-secondary">Valor Total:</span>
                <span className="text-xs font-bold text-green-500 font-mono">{formatValue(totalValue)}</span>
            </div>

            {visibleCount < column.leads.length && (
                <button
                    onClick={() => setVisibleCount(prev => prev + 15)}
                    className="w-full mt-3 py-2 rounded-lg border border-dashed border-border/30 text-text-secondary hover:border-primary hover:text-primary transition-all text-sm flex items-center justify-center gap-2 group"
                >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                    Carregar Mais
                </button>
            )}
        </div>
    );
}
