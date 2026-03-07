import { useState, useEffect } from 'react';
import { Building2, Save, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CompanyData {
    companyName: string;
    companyProduct: string;
    targetAudience: string;
    voiceTone: string;
    unknownBehavior: string;
    restrictions: string;
    agentName: string;
    revenueGoal: string;
    agentObjective: string;
    productPrice: string;
}

const EMPTY: CompanyData = {
    companyName: '', companyProduct: '', targetAudience: '', voiceTone: '',
    unknownBehavior: '', restrictions: '', agentName: '', revenueGoal: '',
    agentObjective: '', productPrice: '',
};

const VOICE_TONES = ['profissional', 'consultivo', 'amigavel', 'direto', 'energico', 'sofisticado'];
const OBJECTIVES = [
    { v: 'fechar_venda', l: 'Fechar vendas diretamente' },
    { v: 'qualificar_agendar', l: 'Qualificar leads e agendar reunião' },
    { v: 'aquecer_lead', l: 'Aquecer lead e transferir para vendedor' },
];

export function CompanyProfile() {
    const { token } = useAuth();
    const [data, setData] = useState<CompanyData>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (k: keyof CompanyData, v: string) => setData(d => ({ ...d, [k]: v }));

    useEffect(() => {
        fetch('/api/company-data', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (d) setData(d as CompanyData); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        try {
            await fetch('/api/company-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch { } finally { setSaving(false); }
    };

    const field = (label: string, key: keyof CompanyData, placeholder: string, type = 'text') => (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input
                type={type}
                value={(data[key] as string) || ''}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF4C00]/40 outline-none transition-all text-sm"
            />
        </div>
    );

    if (loading) return (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#FF4C00]" size={32} /></div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#FF4C00]/10 flex items-center justify-center">
                    <Building2 size={20} className="text-[#FF4C00]" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Perfil da Empresa</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Esses dados alimentam o prompt base de todas as suas IAs.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white dark:bg-[#1E1E1E] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field('Nome da Empresa', 'companyName', 'Ex: Kogna Tecnologia')}
                    {field('Nome da IA', 'agentName', 'Ex: Sofia, Max, Atlas')}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produto / Serviço principal</label>
                    <textarea
                        value={data.companyProduct}
                        onChange={e => set('companyProduct', e.target.value)}
                        placeholder="Descreva o que você vende..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF4C00]/40 outline-none transition-all text-sm resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {field('Público-alvo / Cliente ideal', 'targetAudience', 'Ex: Donos de pequenas empresas')}
                    {field('Preço / Ticket médio (R$)', 'productPrice', 'Ex: 497')}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tom de voz da IA</label>
                    <div className="flex flex-wrap gap-2">
                        {VOICE_TONES.map(t => (
                            <button key={t} type="button" onClick={() => set('voiceTone', t)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all capitalize ${data.voiceTone === t
                                    ? 'border-[#FF4C00] bg-[#FF4C00]/10 text-[#FF4C00]'
                                    : 'border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-400 hover:border-[#FF4C00]/40'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Objetivo principal da IA</label>
                    <div className="space-y-2">
                        {OBJECTIVES.map(o => (
                            <button key={o.v} type="button" onClick={() => set('agentObjective', o.v)}
                                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${data.agentObjective === o.v
                                    ? 'border-[#FF4C00] bg-[#FF4C00]/5 text-[#FF4C00] font-medium'
                                    : 'border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 hover:border-[#FF4C00]/30'}`}>
                                {o.l}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comportamento para perguntas fora do escopo</label>
                    <input
                        value={data.unknownBehavior}
                        onChange={e => set('unknownBehavior', e.target.value)}
                        placeholder="Ex: Responda que não sabe e ofereça falar com um humano"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF4C00]/40 outline-none transition-all text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Restrições / O que a IA NUNCA deve dizer</label>
                    <textarea
                        value={data.restrictions}
                        onChange={e => set('restrictions', e.target.value)}
                        placeholder="Ex: Nunca fale de concorrentes, nunca prometa prazo específico..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#333] bg-white dark:bg-[#121212] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF4C00]/40 outline-none transition-all text-sm resize-none"
                    />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                    {saved && (
                        <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                            <CheckCircle size={16} /> Salvo com sucesso!
                        </span>
                    )}
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#FF4C00] hover:bg-[#ff6a2b] text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70">
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : <><Save size={16} /> Salvar Perfil</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
