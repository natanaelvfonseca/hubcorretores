import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { KanbanBoard } from './components/KanbanBoard';
import { LeadModal } from './components/CreateLeadModal';
import { LeadSummaryDrawer } from './components/LeadSummaryDrawer';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { Lead } from './types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { isConstrutoraUser } from '../../lib/portalAccess';

export function CRM() {
    const { token, user } = useAuth();
    const { showToast } = useNotifications();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleCloseModal = () => {
        setCreateModalOpen(false);
        setEditingLead(null);
    };

    const handleEditFromDrawer = () => {
        if (!selectedLead) return;
        setEditingLead(selectedLead);
        setCreateModalOpen(true);
        setSelectedLead(null);
    };

    const handleDeleteFromDrawer = async () => {
        if (!selectedLead?.id || !token) return;
        if (!confirm(`Excluir ${selectedLead.name || 'este lead'}?`)) return;

        setActionLoading(true);
        try {
            const response = await fetch(`/api/leads/${selectedLead.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Falha ao excluir lead');

            setSelectedLead(null);
            setRefreshTrigger(prev => prev + 1);
            showToast('Lead excluido', 'O lead foi removido do funil.', 'success');
        } catch {
            showToast('Erro ao excluir', 'Nao foi possivel excluir este lead agora.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConvertFromDrawer = async () => {
        if (!selectedLead?.id || !token) return;

        setActionLoading(true);
        try {
            const response = await fetch(`/api/leads/${selectedLead.id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'Cliente' }),
            });

            if (!response.ok) throw new Error('Falha ao converter lead');

            setSelectedLead(null);
            setRefreshTrigger(prev => prev + 1);
            showToast('Lead convertido', 'O lead foi movido para clientes.', 'success');
        } catch {
            showToast('Erro ao converter', 'Nao foi possivel converter este lead em cliente.', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-2 space-y-1">
            <div className="flex justify-between items-center px-2 py-1" data-tour-id="tour-crm-header">
                <div>
                    <h1 className="text-xl font-bold text-text-primary">Funil de Vendas</h1>
                    <p className="text-text-secondary text-[11px]">Gerencie seus leads e oportunidades</p>
                </div>
                <div className="flex gap-2">
                    {/* Actions like Add Lead, Filters could go here */}
                    <button
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-primary hover:brightness-110 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm shadow-lg shadow-primary/20"
                    >
                        Novo Lead
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative" data-tour-id="tour-crm-board">
                <ErrorBoundary fallback={<div className="text-text-primary p-4">Erro ao carregar o Kanban. Verifique a conexão.</div>}>
                    <KanbanBoard
                        refreshTrigger={refreshTrigger}
                        onOpenLead={setSelectedLead}
                    />
                </ErrorBoundary>
            </div>

            <LeadModal
                isOpen={createModalOpen}
                onClose={handleCloseModal}
                onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                leadToEdit={editingLead}
            />

            <LeadSummaryDrawer
                lead={selectedLead}
                isOpen={Boolean(selectedLead)}
                onClose={() => setSelectedLead(null)}
                onEdit={handleEditFromDrawer}
                onDelete={handleDeleteFromDrawer}
                onConvertToClient={handleConvertFromDrawer}
                isProcessing={actionLoading}
            />
        </div>
    );
}
