import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Package, Plus, X, Edit2, Trash2, Tag, DollarSign,
    Image as ImageIcon, ChevronDown, ChevronUp, Save,
    Zap, CheckCircle, AlertCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('kogna_token')}`, 'Content-Type': 'application/json' });

const TRIGGER_TYPES = [
    { value: 'primeiro_contato', label: 'Primeiro Contato', color: 'bg-blue-500/15 text-blue-400' },
    { value: 'pergunta_preco', label: 'Pergunta de Preço', color: 'bg-yellow-500/15 text-yellow-400' },
    { value: 'comparacao', label: 'Comparação', color: 'bg-purple-500/15 text-purple-400' },
    { value: 'objecao_preco', label: 'Objeção de Preço', color: 'bg-red-500/15 text-red-400' },
    { value: 'indecisao', label: 'Indecisão', color: 'bg-orange-500/15 text-orange-400' },
    { value: 'pronto_para_comprar', label: 'Pronto para Comprar', color: 'bg-green-500/15 text-green-400' },
    { value: 'followup', label: 'Follow-up', color: 'bg-teal-500/15 text-teal-400' },
];

const TABS = ['Informações', 'Imagens', 'Ofertas', 'FAQ'];

function StatusPill({ status }: { status: string }) {
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'ativo' ? 'bg-green-500/15 text-green-400' : 'bg-muted text-muted-foreground'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'ativo' ? 'bg-green-400' : 'bg-gray-500'}`} />
            {status === 'ativo' ? 'Ativo' : 'Inativo'}
        </span>
    );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message}
        </div>
    );
}

const EMPTY_PRODUCT = {
    nome: '', categoria: '', descricao_curta: '', descricao_detalhada: '',
    beneficios: [''], preco_base: '', tags: [''], status: 'ativo' as 'ativo' | 'inativo', faq: [] as { pergunta: string; resposta: string }[],
};
const EMPTY_OFFER = { nome: '', preco: '', descricao: '', mensagem_sugerida: '', prioridade: 5, status: 'ativo' };

export function Products() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState('Informações');
    const [showModal, setShowModal] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [form, setForm] = useState<any>(EMPTY_PRODUCT);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');
    const [newImageType, setNewImageType] = useState('image');
    const [offerForm, setOfferForm] = useState<any>(EMPTY_OFFER);
    const [editingOffer, setEditingOffer] = useState<string | null>(null);
    const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
    const [faqForm, setFaqForm] = useState({ pergunta: '', resposta: '' });
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/products`, { headers: authHeader() });
            if (res.ok) setProducts(await res.json());
        } catch { }
        setLoading(false);
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const openProduct = async (p: any) => {
        const res = await fetch(`${API_BASE}/products/${p.id}`, { headers: authHeader() });
        if (res.ok) {
            const data = await res.json();
            setSelected(data);
            setForm({
                ...data,
                beneficios: data.beneficios?.length ? data.beneficios : [''],
                tags: data.tags?.length ? data.tags : [''],
                faq: data.faq || [],
                preco_base: data.preco_base?.toString() || '',
            });
        }
        setIsNew(false);
        setActiveTab('Informações');
        setShowModal(true);
    };

    const openNew = () => {
        setSelected(null);
        setForm({ ...EMPTY_PRODUCT });
        setIsNew(true);
        setActiveTab('Informações');
        setShowModal(true);
    };

    const saveProduct = async () => {
        const payload = {
            ...form,
            beneficios: form.beneficios.filter(Boolean),
            tags: form.tags.filter(Boolean),
            preco_base: parseFloat(form.preco_base) || null,
        };
        const url = isNew ? `${API_BASE}/products` : `${API_BASE}/products/${selected?.id}`;
        const method = isNew ? 'POST' : 'PUT';
        const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(payload) });
        if (res.ok) {
            const data = await res.json();
            showToast(isNew ? 'Produto criado!' : 'Produto atualizado!');
            if (isNew) { setIsNew(false); setSelected(data); }
            fetchProducts();
        } else {
            showToast('Erro ao salvar produto.', 'error');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('Inativar este produto?')) return;
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers: authHeader() });
        showToast('Produto inativado.');
        setShowModal(false);
        fetchProducts();
    };

    const addImage = async () => {
        if (!newImageUrl || !selected?.id) return;
        const res = await fetch(`${API_BASE}/products/${selected.id}/images`, {
            method: 'POST', headers: authHeader(),
            body: JSON.stringify({ url: newImageUrl, tipo: newImageType, caption: newImageCaption }),
        });
        if (res.ok) {
            showToast('Mídia adicionada!');
            setNewImageUrl(''); setNewImageCaption('');
            openProduct(selected);
        }
    };

    const removeImage = async (imgId: string) => {
        await fetch(`${API_BASE}/products/${selected.id}/images/${imgId}`, { method: 'DELETE', headers: authHeader() });
        openProduct(selected);
    };

    const saveOffer = async () => {
        if (!selected?.id) return;
        const url = editingOffer ? `${API_BASE}/offers/${editingOffer}` : `${API_BASE}/products/${selected.id}/offers`;
        const method = editingOffer ? 'PUT' : 'POST';
        const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify({ ...offerForm, preco: parseFloat(offerForm.preco) || null }) });
        if (res.ok) {
            showToast(editingOffer ? 'Oferta atualizada!' : 'Oferta criada!');
            setOfferForm(EMPTY_OFFER); setEditingOffer(null);
            openProduct(selected);
        }
    };

    const deleteOffer = async (offerId: string) => {
        if (!confirm('Remover esta oferta?')) return;
        await fetch(`${API_BASE}/offers/${offerId}`, { method: 'DELETE', headers: authHeader() });
        openProduct(selected);
    };


    const addTrigger = async (offerId: string, triggerType: string) => {
        await fetch(`${API_BASE}/offers/${offerId}/triggers`, {
            method: 'POST', headers: authHeader(),
            body: JSON.stringify({ trigger_type: triggerType }),
        });
        openProduct(selected);
    };

    const addFaq = () => {
        if (!faqForm.pergunta || !faqForm.resposta) return;
        setForm((f: any) => ({ ...f, faq: [...(f.faq || []), { ...faqForm }] }));
        setFaqForm({ pergunta: '', resposta: '' });
    };

    const removeFaq = (i: number) => {
        setForm((f: any) => ({ ...f, faq: f.faq.filter((_: any, idx: number) => idx !== i) }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Package className="w-6 h-6 text-primary" />
                        Produtos
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Catálogo de produtos e motor de ofertas dinâmicas da IA.
                    </p>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Novo Produto
                </button>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                            <div className="h-32 bg-muted rounded-lg mb-4" />
                            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-4">
                    <Package className="w-12 h-12 opacity-20" />
                    <p className="text-sm">Nenhum produto cadastrado.</p>
                    <button onClick={openNew} className="text-xs text-primary hover:underline">Criar primeiro produto →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => openProduct(p)}
                            className="text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                        >
                            {/* Thumbnail area */}
                            <div className="h-36 bg-muted/50 relative flex items-center justify-center border-b border-border">
                                <Package className="w-10 h-10 text-muted-foreground/30" />
                                <div className="absolute top-3 right-3 flex gap-1.5">
                                    <StatusPill status={p.status} />
                                </div>
                                {p.image_count > 0 && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <ImageIcon className="w-3 h-3" /> {p.image_count} foto{p.image_count > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">{p.nome}</h3>
                                        {p.categoria && <p className="text-xs text-muted-foreground mt-0.5">{p.categoria}</p>}
                                    </div>
                                    {p.preco_base && (
                                        <span className="text-sm font-bold text-primary shrink-0">
                                            R$ {parseFloat(p.preco_base).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>
                                {p.descricao_curta && (
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.descricao_curta}</p>
                                )}
                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {p.offer_count} oferta{p.offer_count !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-foreground">{isNew ? 'Novo Produto' : form.nome || 'Produto'}</h2>
                                    {!isNew && <StatusPill status={form.status} />}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isNew && (
                                    <button onClick={() => deleteProduct(selected?.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-primary border-primary' : 'text-muted-foreground border-transparent hover:text-foreground'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-5 max-h-[65vh] overflow-y-auto">
                            {/* ─── TAB: Informações ─── */}
                            {activeTab === 'Informações' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do Produto *</label>
                                            <input value={form.nome} onChange={e => setForm((f: any) => ({ ...f, nome: e.target.value }))}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Ex: Plano Essencial CRM" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Categoria</label>
                                            <input value={form.categoria || ''} onChange={e => setForm((f: any) => ({ ...f, categoria: e.target.value }))}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Ex: SaaS, Seguro, Consultoria" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Preço Base (R$)</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                <input type="number" value={form.preco_base} onChange={e => setForm((f: any) => ({ ...f, preco_base: e.target.value }))}
                                                    className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                    placeholder="0,00" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Descrição Curta</label>
                                            <input value={form.descricao_curta || ''} onChange={e => setForm((f: any) => ({ ...f, descricao_curta: e.target.value }))}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Resumo de 1 linha enviado pela IA no WhatsApp" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Descrição Detalhada</label>
                                            <textarea value={form.descricao_detalhada || ''} onChange={e => setForm((f: any) => ({ ...f, descricao_detalhada: e.target.value }))}
                                                rows={3}
                                                className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                                                placeholder="Descrição completa para contexto da IA" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Benefícios Principais</label>
                                            <div className="space-y-2">
                                                {(form.beneficios || ['']).map((b: string, i: number) => (
                                                    <div key={i} className="flex gap-2">
                                                        <input value={b} onChange={e => { const arr = [...form.beneficios]; arr[i] = e.target.value; setForm((f: any) => ({ ...f, beneficios: arr })); }}
                                                            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                            placeholder={`Benefício ${i + 1}`} />
                                                        {i === form.beneficios.length - 1 && (
                                                            <button onClick={() => setForm((f: any) => ({ ...f, beneficios: [...f.beneficios, ''] }))}
                                                                className="px-3 py-2 bg-muted rounded-lg text-xs text-primary font-medium hover:bg-primary/10 transition-colors">
                                                                +
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs font-medium text-muted-foreground block mb-1">Tags <span className="opacity-50">(para a IA identificar o produto)</span></label>
                                            <div className="flex flex-wrap gap-2 p-2 bg-muted border border-border rounded-lg min-h-[40px]">
                                                {(form.tags || []).filter(Boolean).map((tag: string, i: number) => (
                                                    <span key={i} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {tag}
                                                        <button onClick={() => setForm((f: any) => ({ ...f, tags: f.tags.filter((_: any, idx: number) => idx !== i) }))}>
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                                <input
                                                    className="flex-1 min-w-[80px] bg-transparent text-xs text-foreground outline-none"
                                                    placeholder="Adicionar tag..."
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' || e.key === ',') {
                                                            e.preventDefault();
                                                            const val = (e.target as HTMLInputElement).value.trim();
                                                            if (val) { setForm((f: any) => ({ ...f, tags: [...(f.tags || []), val] })); (e.target as HTMLInputElement).value = ''; }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground">Status do Produto</span>
                                            <button onClick={() => setForm((f: any) => ({ ...f, status: f.status === 'ativo' ? 'inativo' : 'ativo' }))}
                                                className="flex items-center gap-2 text-xs font-medium">
                                                {form.status === 'ativo'
                                                    ? <><ToggleRight className="w-5 h-5 text-primary" /> <span className="text-primary">Ativo</span></>
                                                    : <><ToggleLeft className="w-5 h-5 text-muted-foreground" /> <span className="text-muted-foreground">Inativo</span></>
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB: Imagens ─── */}
                            {activeTab === 'Imagens' && (
                                <div className="space-y-5">
                                    {/* Add media */}
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                                        <p className="text-xs font-semibold text-foreground">Adicionar Mídia</p>
                                        <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                            placeholder="URL da imagem, vídeo ou PDF..." />
                                        <div className="flex gap-2">
                                            <input value={newImageCaption} onChange={e => setNewImageCaption(e.target.value)}
                                                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Legenda (opcional)" />
                                            <select value={newImageType} onChange={e => setNewImageType(e.target.value)}
                                                className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors">
                                                <option value="image">Imagem</option>
                                                <option value="video">Vídeo</option>
                                                <option value="pdf">PDF</option>
                                            </select>
                                            <button onClick={addImage} disabled={!newImageUrl || !selected?.id}
                                                className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* Image grid */}
                                    {(selected?.images || []).length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            <ImageIcon className="w-8 h-8 opacity-20 mx-auto mb-2" />
                                            Nenhuma mídia adicionada
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            {selected.images.map((img: any) => (
                                                <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                                                    {img.tipo === 'image' ? (
                                                        <img src={img.url} alt={img.caption || ''} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                                            <ImageIcon className="w-6 h-6 opacity-40" />
                                                            <span className="text-[10px] uppercase font-bold">{img.tipo}</span>
                                                        </div>
                                                    )}
                                                    {img.caption && <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-2 py-1 truncate">{img.caption}</p>}
                                                    <button onClick={() => removeImage(img.id)}
                                                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5 text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── TAB: Ofertas ─── */}
                            {activeTab === 'Ofertas' && (
                                <div className="space-y-4">
                                    {/* Offer form */}
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                                        <p className="text-xs font-semibold text-foreground">{editingOffer ? 'Editar Oferta' : 'Nova Oferta'}</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input value={offerForm.nome} onChange={e => setOfferForm((f: any) => ({ ...f, nome: e.target.value }))}
                                                className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Nome da oferta (ex: Plano Premium)" />
                                            <input type="number" value={offerForm.preco} onChange={e => setOfferForm((f: any) => ({ ...f, preco: e.target.value }))}
                                                className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                                placeholder="Preço (R$)" />
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-muted-foreground whitespace-nowrap">Prioridade:</label>
                                                <input type="range" min={1} max={10} value={offerForm.prioridade} onChange={e => setOfferForm((f: any) => ({ ...f, prioridade: parseInt(e.target.value) }))}
                                                    className="flex-1 accent-primary" />
                                                <span className="text-xs font-bold text-primary w-4">{offerForm.prioridade}</span>
                                            </div>
                                            <textarea value={offerForm.descricao} onChange={e => setOfferForm((f: any) => ({ ...f, descricao: e.target.value }))}
                                                rows={2} placeholder="Descrição da oferta"
                                                className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                                            <textarea value={offerForm.mensagem_sugerida} onChange={e => setOfferForm((f: any) => ({ ...f, mensagem_sugerida: e.target.value }))}
                                                rows={3} placeholder="Mensagem sugerida para a IA enviar no WhatsApp..."
                                                className="col-span-2 bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={saveOffer} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                                <Save className="w-3.5 h-3.5" /> {editingOffer ? 'Salvar' : 'Criar Oferta'}
                                            </button>
                                            {editingOffer && <button onClick={() => { setEditingOffer(null); setOfferForm(EMPTY_OFFER); }}
                                                className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                                Cancelar
                                            </button>}
                                        </div>
                                    </div>

                                    {/* Existing offers */}
                                    <div className="space-y-2">
                                        {(selected?.offers || []).map((o: any) => (
                                            <div key={o.id} className="border border-border rounded-xl overflow-hidden">
                                                <div className="flex items-center justify-between p-3 cursor-pointer"
                                                    onClick={() => setExpandedOffer(expandedOffer === o.id ? null : o.id)}>
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <StatusPill status={o.status} />
                                                        <span className="text-sm font-semibold text-foreground truncate">{o.nome}</span>
                                                        {o.preco && <span className="text-xs text-primary font-bold">R$ {parseFloat(o.preco).toLocaleString('pt-BR')}</span>}
                                                        <span className="text-[10px] text-muted-foreground">P{o.prioridade}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button onClick={e => { e.stopPropagation(); setEditingOffer(o.id); setOfferForm({ nome: o.nome, preco: o.preco || '', descricao: o.descricao || '', mensagem_sugerida: o.mensagem_sugerida || '', prioridade: o.prioridade, status: o.status }); }}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={e => { e.stopPropagation(); deleteOffer(o.id); }}
                                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                        {expandedOffer === o.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                                    </div>
                                                </div>
                                                {expandedOffer === o.id && (
                                                    <div className="border-t border-border p-3 space-y-3 bg-muted/30">
                                                        <p className="text-xs font-semibold text-foreground">Gatilhos conversacionais</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {TRIGGER_TYPES.map(t => {
                                                                const active = (o.triggers || []).includes(t.value);
                                                                return (
                                                                    <button key={t.value}
                                                                        onClick={() => addTrigger(o.id, t.value)}
                                                                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${active ? `${t.color} border-transparent` : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                                                                        {t.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {o.mensagem_sugerida && (
                                                            <div className="bg-card border border-border rounded-lg p-3">
                                                                <p className="text-[10px] text-muted-foreground mb-1">Mensagem sugerida:</p>
                                                                <p className="text-xs text-foreground">{o.mensagem_sugerida}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {(selected?.offers || []).length === 0 && !isNew && (
                                            <div className="text-center py-6 text-muted-foreground text-xs">Nenhuma oferta criada ainda.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB: FAQ ─── */}
                            {activeTab === 'FAQ' && (
                                <div className="space-y-4">
                                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                                        <p className="text-xs font-semibold text-foreground">Adicionar Pergunta</p>
                                        <input value={faqForm.pergunta} onChange={e => setFaqForm(f => ({ ...f, pergunta: e.target.value }))}
                                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                                            placeholder="Pergunta frequente..." />
                                        <textarea value={faqForm.resposta} onChange={e => setFaqForm(f => ({ ...f, resposta: e.target.value }))}
                                            rows={3} placeholder="Resposta da IA..."
                                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors resize-none" />
                                        <button onClick={addFaq} className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                            Adicionar
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {(form.faq || []).map((item: any, i: number) => (
                                            <div key={i} className="bg-muted/40 border border-border rounded-xl p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground">{item.pergunta}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{item.resposta}</p>
                                                    </div>
                                                    <button onClick={() => removeFaq(i)} className="p-1 text-muted-foreground hover:text-red-400 shrink-0 transition-colors">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(form.faq || []).length === 0 && (
                                            <div className="text-center py-6 text-muted-foreground text-xs">Nenhuma FAQ adicionada ainda.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-5 border-t border-border">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                Fechar
                            </button>
                            {(activeTab === 'Informações' || activeTab === 'FAQ') && (
                                <button onClick={saveProduct}
                                    className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                                    <Save className="w-4 h-4" />
                                    {isNew ? 'Criar Produto' : 'Salvar Alterações'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast {...toast} />}
        </div>
    );
}
