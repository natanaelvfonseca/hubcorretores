import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Edit2, Trash2, CalendarDays, ChevronLeft, ChevronRight, Loader2, X, Check, UserCog
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { API_URL } from '../../config/api';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Agendamento {
    id: string; vendedor_id: string; lead_id?: string;
    data_hora: string; duracao: number; status: string;
    notas?: string; vendedor_nome?: string; lead_nome?: string;
}

export function Agenda() {
    const { token } = useAuth();
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
    const [editForm, setEditForm] = useState({ date: '', time: '', notas: '' });

    const h = (): HeadersInit => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const fetchAgendamentos = async (date?: string) => {
        const d = date || selectedDate.toISOString().split('T')[0];
        try {
            const res = await fetch(`${API_URL}/agendamentos?data=${d}`, { headers: h() });
            if (res.ok) setAgendamentos(await res.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAgendamentos(); }, []);
    useEffect(() => { fetchAgendamentos(selectedDate.toISOString().split('T')[0]); }, [selectedDate]);

    const deleteAgendamento = async (id: string) => {
        if (!confirm('Excluir este agendamento?')) return;
        try {
            const res = await fetch(`${API_URL}/agendamentos/${id}`, { method: 'DELETE', headers: h() });
            if (res.ok) await fetchAgendamentos();
        } catch (e) { console.error(e); }
    };

    const startEdit = (a: Agendamento) => {
        const d = new Date(a.data_hora);
        setEditingAgendamento(a);
        setEditForm({
            date: d.toISOString().split('T')[0],
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            notas: a.notas || ''
        });
    };

    const updateAgendamento = async () => {
        if (!editingAgendamento) return;
        setLoading(true);
        try {
            const dataHora = `${editForm.date}T${editForm.time}:00`;
            const res = await fetch(`${API_URL}/agendamentos/${editingAgendamento.id}`, {
                method: 'PATCH', headers: h(),
                body: JSON.stringify({ dataHora, notas: editForm.notas })
            });
            if (res.ok) {
                await fetchAgendamentos();
                setEditingAgendamento(null);
                showToast('Sucesso', 'Agendamento atualizado', 'success');
            } else {
                const err = await res.json().catch(() => ({}));
                showToast(res.status === 409 ? 'Aviso' : 'Erro', err.error || 'Erro desconhecido', res.status === 409 ? 'warning' : 'error');
            }
        } catch (e) {
            showToast('Erro', 'Falha na conexão', 'error');
        }
        setLoading(false);
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear(), month = date.getMonth();
        return {
            firstDay: new Date(year, month, 1).getDay(),
            daysInMonth: new Date(year, month + 1, 0).getDate()
        };
    };
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const isToday = (d: Date) => isSameDay(d, new Date());

    const renderCalendar = () => {
        const { firstDay, daysInMonth } = getDaysInMonth(calendarMonth);
        const cells = [];
        for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} />);
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
            const isSelected = isSameDay(date, selectedDate);
            const today = isToday(date);
            cells.push(
                <button key={day} onClick={() => setSelectedDate(date)}
                    className={`relative h-10 w-full rounded-lg text-sm font-medium transition-all duration-150 ${isSelected ? 'bg-primary text-white shadow-md shadow-primary/20' : today ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary hover:bg-muted-secondary/60'}`}>
                    {day}
                </button>
            );
        }
        return cells;
    };

    const statusColors: Record<string, string> = {
        agendado: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        confirmado: 'bg-green-500/10 text-green-600 border-green-500/20',
        cancelado: 'bg-red-500/10 text-red-500 border-red-500/20',
        concluido: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-5" data-tour-id="tour-agenda-main">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Agenda</h1>
                    <p className="text-text-secondary text-sm">Visualize e gerencie agendamentos da equipe</p>
                </div>
                <Link to="/vendedores"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold border border-primary/30 px-4 py-2 rounded-xl hover:bg-primary/5 transition-colors">
                    <UserCog size={16} /> Gerenciar Vendedores
                </Link>
            </div>

            {/* Calendar + Appointments */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* Mini Calendar */}
                <div className="w-80 shrink-0 bg-surface border border-border rounded-xl p-5 space-y-4 self-start">
                    <div className="flex items-center justify-between">
                        <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                            className="p-1.5 hover:bg-muted-secondary rounded-lg transition-colors">
                            <ChevronLeft size={16} className="text-text-muted" />
                        </button>
                        <h3 className="text-sm font-bold text-text-primary capitalize">
                            {calendarMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                            className="p-1.5 hover:bg-muted-secondary rounded-lg transition-colors">
                            <ChevronRight size={16} className="text-text-muted" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {DIAS_SEMANA.map(d => (
                            <div key={d} className="text-xs font-medium text-text-muted py-1">{d}</div>
                        ))}
                        {renderCalendar()}
                    </div>
                    <div className="pt-2 border-t border-border">
                        <p className="text-xs text-text-muted">
                            Selecionado: <strong className="text-text-primary">
                                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </strong>
                        </p>
                    </div>
                </div>

                {/* Day's Appointments */}
                <div className="flex-1 bg-surface border border-border rounded-xl p-5 space-y-4 overflow-y-auto">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                            <CalendarDays size={20} className="text-primary" />
                            {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h3>
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {agendamentos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <CalendarDays size={48} className="text-text-muted/30 mb-3" />
                            <p className="text-text-muted text-sm">Nenhum agendamento para este dia.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {agendamentos.map(a => (
                                <div key={a.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors bg-white dark:bg-[#1a1a1a]">
                                    <div className="text-center shrink-0">
                                        <div className="text-lg font-bold text-primary">
                                            {new Date(a.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-text-muted">{a.duracao}min</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm text-text-primary">{a.vendedor_nome || 'Vendedor'}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[a.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {a.status}
                                            </span>
                                        </div>
                                        {a.lead_nome && <p className="text-xs text-text-muted mt-0.5">Lead: {a.lead_nome}</p>}
                                        {a.notas && <p className="text-xs text-text-secondary mt-1">{a.notas}</p>}
                                    </div>
                                    <div className="flex gap-2 self-center">
                                        <button onClick={() => startEdit(a)}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Editar">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => deleteAgendamento(a.id)}
                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingAgendamento && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text-primary">Editar Agendamento</h3>
                            <button onClick={() => setEditingAgendamento(null)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-text-muted block mb-1 uppercase tracking-wider">Data</label>
                                <input type="date" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted block mb-1 uppercase tracking-wider">Hora</label>
                                <input type="time" className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50"
                                    value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-text-muted block mb-1 uppercase tracking-wider">Notas</label>
                                <textarea className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 min-h-[80px] resize-none"
                                    placeholder="Notas sobre o agendamento..."
                                    value={editForm.notas} onChange={e => setEditForm({ ...editForm, notas: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={updateAgendamento} disabled={loading}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                {loading && <Loader2 size={16} className="animate-spin" />}
                                <Check size={16} /> Salvar
                            </button>
                            <button onClick={() => setEditingAgendamento(null)}
                                className="flex-1 bg-muted-secondary/50 hover:bg-muted-secondary text-text-primary font-bold py-2.5 rounded-xl transition-all">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
