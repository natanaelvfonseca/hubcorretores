import { useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadModal } from './components/CreateLeadModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { Lead } from './types';

export function CRM() {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEditLead = (lead: Lead) => {
        setEditingLead(lead);
        setCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setEditingLead(null);
    };

    return (
        <div className="h-full flex flex-col p-2 space-y-1">
            <div className="flex justify-between items-center px-2 py-1">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Funil de Vendas</h1>
                    <p className="text-text-secondary text-[11px]">Gerencie seus leads e oportunidades</p>
                </div>
                <div className="flex gap-2">
                    {/* Actions like Add Lead, Filters could go here */}
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-primary hover:brightness-110 text-white font-medium px-3 py-1.5 rounded-lg transition-colors text-xs shadow-lg shadow-primary/20"
                    >
                        Novo Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <ErrorBoundary fallback={<div className="text-text-primary p-4">Erro ao carregar o Kanban. Verifique a conexão.</div>}>
                    <KanbanBoard
                        refreshTrigger={refreshTrigger}
                        onEditLead={handleEditLead}
                    />
                </ErrorBoundary>
            </div>

            <LeadModal
                isOpen={createModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                leadToEdit={editingLead}
            />
        </div>
    );
}
