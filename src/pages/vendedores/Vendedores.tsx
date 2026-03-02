import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { API_URL } from '../../config/api';
import {
    UserPlus, Trash2, Clock, Users, Check, X, Loader2, Ban, Plus,
    ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Zap
} from 'lucide-react';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Vendedor {
    id: string; nome: string; email: string; whatsapp?: string;
    porcentagem: number; ativo: boolean; leads_recebidos_ciclo: number;
}
interface Disponibilidade {
    id: string; vendedor_id: string; dia_semana: number;
    hora_inicio: string; hora_fim: string; intervalo: number;
}
interface Bloqueio {
    id: string; vendedor_id: string; data_inicio: string; data_fim: string; motivo?: string;
}

const PRESETS = [
    { label: '⚡ Comercial', dias: [1, 2, 3, 4, 5], inicio: '09:00', fim: '18:00', intervalo: 30 },
    { label: '🌅 Manhã', dias: [1, 2, 3, 4, 5], inicio: '09:00', fim: '13:00', intervalo: 30 },
    { label: '🌙 Tarde', dias: [1, 2, 3, 4, 5], inicio: '13:00', fim: '18:00', intervalo: 30 },
    { label: '7 dias', dias: [0, 1, 2, 3, 4, 5, 6], inicio: '09:00', fim: '18:00', intervalo: 30 },
];

export function Vendedores() {
    const { token } = useAuth();
    const { showToast } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([]);
    const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);

    // Add vendedor form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newV, setNewV] = useState({ nome: '', email: '', whatsapp: '', porcentagem: 50 });

    // Quick-add hours
    const [selectedDias, setSelectedDias] = useState<number[]>([]);
    const [qHoraInicio, setQHoraInicio] = useState('09:00');
    const [qHoraFim, setQHoraFim] = useState('18:00');
    const [qIntervalo, setQIntervalo] = useState(30);
    const [showHoursForm, setShowHoursForm] = useState(false);

    // Add bloqueio
    const [showAddBloqueio, setShowAddBloqueio] = useState(false);
    const [newBloqueio, setNewBloqueio] = useState({ dataInicio: '', dataFim: '', motivo: '' });

    const h = (): HeadersInit => ({
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    const fetchVendedores = async () => {
        const res = await fetch(`${API_URL}/vendedores`, { headers: h() });
        if (res.ok) setVendedores(await res.json());
    };

    const fetchDetail = async (id: string) => {
        const [dispRes, bloqRes] = await Promise.all([
            fetch(`${API_URL}/vendedores/${id}/disponibilidade`, { headers: h() }),
            fetch(`${API_URL}/vendedores/${id}/bloqueios`, { headers: h() }),
        ]);
        if (dispRes.ok) setDisponibilidades(await dispRes.json());
        if (bloqRes.ok) setBloqueios(await bloqRes.json());
    };

    useEffect(() => { fetchVendedores(); }, []);
    useEffect(() => { if (selectedId) fetchDetail(selectedId); }, [selectedId]);

    const select = (id: string) => {
        setSelectedId(prev => prev === id ? null : id);
        setShowHoursForm(false);
        setSelectedDias([]);
    };

    // Add vendedor
    const addVendedor = async () => {
        if (!newV.nome || !newV.email) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/vendedores`, {
                method: 'POST', headers: h(), body: JSON.stringify(newV)
            });
            if (res.ok) {
                await fetchVendedores();
                setNewV({ nome: '', email: '', whatsapp: '', porcentagem: 50 });
                setShowAddForm(false);
                showToast('Sucesso', 'Vendedor adicionado com sucesso', 'success');
            } else {
                const err = await res.json().catch(() => ({}));
                showToast('Erro', err.error || `Erro ao salvar (${res.status})`, 'error');
            }
        } catch (e) {
            console.error('[addVendedor]', e);
            showToast('Erro', 'Falha na conexão com o servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Toggle ativo
    const toggleAtivo = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/vendedores/${id}/toggle-ativo`, { method: 'PATCH', headers: h() });
            if (res.ok) {
                await fetchVendedores();
            } else {
                const err = await res.json().catch(() => ({}));
                showToast('Erro', err.error || 'Não foi possível alterar o status', 'error');
            }
        } catch (e) {
            console.error('[toggleAtivo]', e);
            showToast('Erro', 'Falha na conexão', 'error');
        }
    };

    // Delete vendedor
    const deleteVendedor = async (id: string) => {
        if (!confirm('Remover este vendedor?')) return;
        try {
            const res = await fetch(`${API_URL}/vendedores/${id}`, { method: 'DELETE', headers: h() });
            if (res.ok) {
                await fetchVendedores();
                if (selectedId === id) setSelectedId(null);
                showToast('Removido', 'Vendedor removido', 'success');
            } else {
                showToast('Erro', 'Não foi possível remover', 'error');
            }
        } catch (e) {
            console.error('[deleteVendedor]', e);
            showToast('Erro', 'Falha na conexão', 'error');
        }
    };

    // Update porcentagem inline
    const updatePorcentagem = async (id: string, val: number) => {
        try {
            await fetch(`${API_URL}/vendedores/${id}`, {
                method: 'PATCH', headers: h(), body: JSON.stringify({ porcentagem: val })
            });
            await fetchVendedores();
        } catch (e) {
            console.error('[updatePorcentagem]', e);
        }
    };

    // Apply preset
    const applyPreset = (p: typeof PRESETS[0]) => {
        setSelectedDias(p.dias);
        setQHoraInicio(p.inicio);
        setQHoraFim(p.fim);
        setQIntervalo(p.intervalo);
        setShowHoursForm(true);
    };

    // Quick-add hours
    const addHours = async () => {
        if (!selectedId || selectedDias.length === 0) return;
        setLoading(true);
        try {
            await Promise.all(selectedDias.map(dia =>
                fetch(`${API_URL}/vendedores/${selectedId}/disponibilidade`, {
                    method: 'POST', headers: h(),
                    body: JSON.stringify({ diaSemana: dia, horaInicio: qHoraInicio, horaFim: qHoraFim, intervalo: qIntervalo })
                })
            ));
            await fetchDetail(selectedId);
            setSelectedDias([]);
            setShowHoursForm(false);
            showToast('Horários salvos', `${selectedDias.length} dia(s) adicionados`, 'success');
        } catch (e) {
            console.error('[addHours]', e);
            showToast('Erro', 'Falha ao salvar horários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteDisp = async (dispId: string) => {
        try {
            await fetch(`${API_URL}/disponibilidade/${dispId}`, { method: 'DELETE', headers: h() });
            if (selectedId) fetchDetail(selectedId);
        } catch (e) { console.error('[deleteDisp]', e); }
    };

    const addBloqueio = async () => {
        if (!selectedId || !newBloqueio.dataInicio || !newBloqueio.dataFim) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/vendedores/${selectedId}/bloqueios`, {
                method: 'POST', headers: h(), body: JSON.stringify(newBloqueio)
            });
            if (res.ok) {
                await fetchDetail(selectedId);
                setShowAddBloqueio(false);
                setNewBloqueio({ dataInicio: '', dataFim: '', motivo: '' });
                showToast('Bloqueio criado', '', 'success');
            } else {
                showToast('Erro', 'Não foi possível criar o bloqueio', 'error');
            }
        } catch (e) {
            console.error('[addBloqueio]', e);
            showToast('Erro', 'Falha na conexão', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteBloqueio = async (bloqId: string) => {
        try {
            await fetch(`${API_URL}/bloqueios/${bloqId}`, { method: 'DELETE', headers: h() });
            if (selectedId) fetchDetail(selectedId);
        } catch (e) { console.error('[deleteBloqueio]', e); }
    };

    const totalPct = vendedores.filter(v => v.ativo).reduce((s, v) => s + v.porcentagem, 0);
    const selectedVendedor = vendedores.find(v => v.id === selectedId);

    return (
        <div className="h-full flex flex-col p-6 space-y-5 overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                        <Users size={24} className="text-primary" /> Vendedores
                    </h1>
                    <p className="text-text-secondary text-sm mt-0.5">Gerencie a equipe de vendas, distribuição de leads e horários de atendimento</p>
                </div>
                <button
                    onClick={() => setShowAddForm(v => !v)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-primary/25 active:scale-95"
                >
                    <UserPlus size={16} /> Novo Vendedor
                </button>
            </div>

            {/* Distribution bar */}
            <div className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Distribuição de Leads (ativos)</span>
                    <span className={`text-sm font-bold ${totalPct === 100 ? 'text-green-500' : totalPct > 100 ? 'text-red-500' : 'text-amber-500'}`}>
                        {totalPct}% {totalPct === 100 ? '✓' : totalPct > 100 ? '— excede 100%' : '— ideal: 100%'}
                    </span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-white/5">
                    {vendedores.filter(v => v.ativo).map(v => (
                        <div
                            key={v.id}
                            className="h-full bg-primary/70 transition-all"
                            style={{ width: `${v.porcentagem}%` }}
                            title={`${v.nome}: ${v.porcentagem}%`}
                        />
                    ))}
                </div>
                <div className="flex gap-4 mt-2 flex-wrap">
                    {vendedores.filter(v => v.ativo).map(v => (
                        <div key={v.id} className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <div className="w-2 h-2 rounded-full bg-primary/70" />
                            {v.nome.split(' ')[0]}: {v.porcentagem}%
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Vendedor Form */}
            {showAddForm && (
                <div className="bg-surface border border-primary/30 rounded-2xl p-5 space-y-4 animate-fade-in shadow-xl shadow-primary/5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-text-primary flex items-center gap-2"><UserPlus size={16} className="text-primary" /> Novo Vendedor</h3>
                        <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-text-primary"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { placeholder: 'Nome completo *', key: 'nome', value: newV.nome },
                            { placeholder: 'Email *', key: 'email', value: newV.email },
                            { placeholder: 'WhatsApp (opcional)', key: 'whatsapp', value: newV.whatsapp },
                        ].map(({ placeholder, key, value }) => (
                            <input
                                key={key}
                                className="px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary/60 transition-colors placeholder:text-text-muted"
                                placeholder={placeholder}
                                value={value}
                                onChange={e => setNewV(prev => ({ ...prev, [key]: e.target.value }))}
                            />
                        ))}
                        <div className="flex items-center gap-2">
                            <input
                                type="number" min={0} max={100}
                                className="w-24 px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary/60"
                                value={newV.porcentagem}
                                onChange={e => setNewV(prev => ({ ...prev, porcentagem: Number(e.target.value) }))}
                            />
                            <span className="text-xs text-text-muted">% dos leads</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={addVendedor}
                            disabled={loading || !newV.nome || !newV.email}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Salvar Vendedor
                        </button>
                        <button onClick={() => setShowAddForm(false)} className="px-5 py-2 text-sm text-text-muted hover:text-text-primary rounded-xl hover:bg-white/5 transition-colors">Cancelar</button>
                    </div>
                </div>
            )}

            {/* Vendedores List */}
            {vendedores.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <Users size={56} className="text-text-muted/20 mb-4" />
                    <p className="text-text-muted text-sm font-medium">Nenhum vendedor cadastrado</p>
                    <p className="text-text-muted/70 text-xs mt-1">Clique em "Novo Vendedor" para começar</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {vendedores.map(v => {
                        const isExpanded = selectedId === v.id;
                        return (
                            <div key={v.id} className={`bg-surface border rounded-2xl overflow-hidden transition-all ${isExpanded ? 'border-primary/40 shadow-xl shadow-primary/5' : 'border-border hover:border-border/80'}`}>

                                {/* Card Row */}
                                <div className="flex items-center gap-4 p-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-base ${v.ativo ? 'bg-primary/10 text-primary' : 'bg-white/5 text-text-muted'}`}>
                                        {v.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-sm text-text-primary">{v.nome}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${v.ativo ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/5 text-text-muted border-border'}`}>
                                                {v.ativo ? 'ATIVO' : 'INATIVO'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted mt-0.5">{v.email}{v.whatsapp ? ` · ${v.whatsapp}` : ''}</p>
                                    </div>

                                    {/* % distribution editable */}
                                    <div className="shrink-0 text-center w-24">
                                        <div className="flex items-center gap-1 justify-center">
                                            <input
                                                type="number" min={0} max={100}
                                                className="w-14 bg-transparent text-center text-lg font-bold text-primary border-b border-border/50 focus:outline-none focus:border-primary/60 transition-colors"
                                                value={v.porcentagem}
                                                onBlur={e => updatePorcentagem(v.id, Number(e.target.value))}
                                                onChange={e => setVendedores(prev => prev.map(x => x.id === v.id ? { ...x, porcentagem: Number(e.target.value) } : x))}
                                            />
                                            <span className="text-xs text-text-muted">%</span>
                                        </div>
                                        <p className="text-[10px] text-text-muted mt-0.5">distribuição</p>
                                    </div>

                                    {/* Leads ciclo */}
                                    <div className="shrink-0 text-center w-20">
                                        <p className="text-lg font-bold text-text-primary">{v.leads_recebidos_ciclo}</p>
                                        <p className="text-[10px] text-text-muted">leads ciclo</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => toggleAtivo(v.id)}
                                            title={v.ativo ? 'Desativar' : 'Ativar'}
                                            className={`p-2 rounded-xl transition-colors ${v.ativo ? 'text-green-500 hover:bg-green-500/10' : 'text-text-muted hover:bg-white/5'}`}
                                        >
                                            {v.ativo ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                        </button>
                                        <button
                                            onClick={() => select(v.id)}
                                            className={`p-2 rounded-xl transition-colors ${isExpanded ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-primary hover:bg-primary/5'}`}
                                            title="Horários e bloqueios"
                                        >
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <button
                                            onClick={() => deleteVendedor(v.id)}
                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Panel */}
                                {isExpanded && selectedVendedor && (
                                    <div className="border-t border-border/50 p-5 space-y-6 bg-background/30">

                                        {/* Quick-add Hours */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2"><Clock size={14} className="text-primary" /> Horários de Atendimento</h4>
                                                <button
                                                    onClick={() => setShowHoursForm(f => !f)}
                                                    className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
                                                >
                                                    <Plus size={13} /> Adicionar
                                                </button>
                                            </div>

                                            {/* Presets */}
                                            {!showHoursForm && (
                                                <div className="flex gap-2 flex-wrap mb-3">
                                                    {PRESETS.map(p => (
                                                        <button key={p.label} onClick={() => applyPreset(p)}
                                                            className="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-text-secondary hover:text-primary transition-all font-medium flex items-center gap-1.5">
                                                            <Zap size={11} /> {p.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quick form */}
                                            {showHoursForm && (
                                                <div className="bg-surface border border-border rounded-xl p-4 space-y-3 mb-3">
                                                    {/* Day chips */}
                                                    <div>
                                                        <p className="text-xs text-text-muted mb-2">Selecione os dias</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {DIAS.map((d, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setSelectedDias(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                                                                    className={`w-12 h-10 rounded-xl text-xs font-bold border transition-all ${selectedDias.includes(i) ? 'bg-primary text-white border-primary shadow-md shadow-primary/25' : 'border-border text-text-secondary hover:border-primary/40'}`}
                                                                >
                                                                    {d}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Time + interval */}
                                                    <div className="flex gap-3 items-center flex-wrap">
                                                        <div>
                                                            <p className="text-[10px] text-text-muted mb-1">Início</p>
                                                            <input type="time" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                                                                value={qHoraInicio} onChange={e => setQHoraInicio(e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-text-muted mb-1">Fim</p>
                                                            <input type="time" className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary/50"
                                                                value={qHoraFim} onChange={e => setQHoraFim(e.target.value)} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-text-muted mb-1">Intervalo</p>
                                                            <select className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                                                                value={qIntervalo} onChange={e => setQIntervalo(Number(e.target.value))}>
                                                                <option value={15}>15 min</option>
                                                                <option value={30}>30 min</option>
                                                                <option value={60}>60 min</option>
                                                            </select>
                                                        </div>
                                                        <div className="self-end flex gap-2">
                                                            <button onClick={addHours} disabled={loading || selectedDias.length === 0}
                                                                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20">
                                                                {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                                Salvar {selectedDias.length > 0 ? `(${selectedDias.length} dias)` : ''}
                                                            </button>
                                                            <button onClick={() => { setShowHoursForm(false); setSelectedDias([]); }}
                                                                className="text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Existing hours */}
                                            {disponibilidades.length === 0 ? (
                                                <p className="text-xs text-text-muted text-center py-4">Nenhum horário definido. Use um preset acima.</p>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    {disponibilidades.map(d => (
                                                        <div key={d.id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/15 rounded-xl text-xs text-text-primary group">
                                                            <span className="font-bold text-primary">{DIAS[d.dia_semana]}</span>
                                                            <span>{d.hora_inicio}–{d.hora_fim}</span>
                                                            <span className="text-text-muted">({d.intervalo}min)</span>
                                                            <button onClick={() => deleteDisp(d.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all ml-1">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Bloqueios */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-bold text-text-primary flex items-center gap-2"><Ban size={14} className="text-red-500" /> Bloqueios</h4>
                                                <button onClick={() => setShowAddBloqueio(f => !f)}
                                                    className="flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:text-red-400 transition-colors">
                                                    <Plus size={13} /> Bloquear período
                                                </button>
                                            </div>
                                            {showAddBloqueio && (
                                                <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-3 mb-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs text-text-muted block mb-1">Início</label>
                                                            <input type="datetime-local" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                                                                value={newBloqueio.dataInicio} onChange={e => setNewBloqueio(p => ({ ...p, dataInicio: e.target.value }))} />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-text-muted block mb-1">Fim</label>
                                                            <input type="datetime-local" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none"
                                                                value={newBloqueio.dataFim} onChange={e => setNewBloqueio(p => ({ ...p, dataFim: e.target.value }))} />
                                                        </div>
                                                    </div>
                                                    <input className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none" placeholder="Motivo (opcional)"
                                                        value={newBloqueio.motivo} onChange={e => setNewBloqueio(p => ({ ...p, motivo: e.target.value }))} />
                                                    <div className="flex gap-2">
                                                        <button onClick={addBloqueio} disabled={loading}
                                                            className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                                            Bloquear
                                                        </button>
                                                        <button onClick={() => setShowAddBloqueio(false)}
                                                            className="text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {bloqueios.length === 0 ? (
                                                <p className="text-xs text-text-muted text-center py-3">Sem bloqueios cadastrados.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {bloqueios.map(b => (
                                                        <div key={b.id} className="flex items-center justify-between px-3 py-2 bg-red-500/5 border border-red-500/15 rounded-xl group">
                                                            <div className="text-xs text-text-secondary">
                                                                <span className="font-medium text-red-400">{new Date(b.data_inicio).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                                                <span className="mx-2 text-text-muted">→</span>
                                                                <span>{new Date(b.data_fim).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                                                                {b.motivo && <span className="ml-3 text-text-muted">· {b.motivo}</span>}
                                                            </div>
                                                            <button onClick={() => deleteBloqueio(b.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
