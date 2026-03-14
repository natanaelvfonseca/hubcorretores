import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  Package,
  Plus,
  X,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Save,
  Zap,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { cn } from "../../utils/cn";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("kogna_token")}`,
  "Content-Type": "application/json",
});
const TRIGGER_TYPES = [
  {
    value: "primeiro_contato",
    label: "Primeiro Contato",
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "pergunta_preco",
    label: "Pergunta de Preço",
    color: "bg-yellow-500/15 text-yellow-400",
  },
  {
    value: "comparacao",
    label: "Comparação",
    color: "bg-purple-500/15 text-purple-400",
  },
  {
    value: "objecao_preco",
    label: "Objeção de Preço",
    color: "bg-red-500/15 text-red-400",
  },
  {
    value: "indecisao",
    label: "Indecisão",
    color: "bg-orange-500/15 text-orange-400",
  },
  {
    value: "pronto_para_comprar",
    label: "Pronto para Comprar",
    color: "bg-green-500/15 text-green-400",
  },
  {
    value: "followup",
    label: "Follow-up",
    color: "bg-teal-500/15 text-teal-400",
  },
];
const TABS = ["Informações", "Imagens", "Ofertas", "FAQ"];

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "ativo" ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === "ativo" ? "bg-green-400" : "bg-gray-500"}`}
      />
      {status === "ativo" ? "Ativo" : "Inativo"}
    </span>
  );
}

function Toast({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${type === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
    >
      {type === "success" ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertCircle className="w-4 h-4" />
      )}
      {message}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-foreground shadow-[0_6px_18px_rgba(15,23,42,0.04)] outline-none transition-all placeholder:text-muted-foreground/70 hover:border-primary/25 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none dark:hover:border-primary/30";
const textareaClass = `${inputClass} min-h-[132px] resize-none`;
const subtlePanel =
  "rounded-[24px] border border-black/[0.06] bg-background/80 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]";

function ModalSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-black/[0.06] bg-white/[0.88] p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-white/[0.07] dark:bg-white/[0.03] dark:shadow-none sm:p-6",
        className,
      )}
    >
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-display font-bold tracking-tight text-foreground">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  label,
  hint,
  required,
}: {
  label: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-foreground">
      {label}
      {required && <span className="ml-1 text-primary">*</span>}
      {hint && (
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

const EMPTY_PRODUCT = {
  nome: "",
  categoria: "",
  descricao_curta: "",
  descricao_detalhada: "",
  beneficios: [""],
  preco_base: "",
  tags: [""],
  status: "ativo" as "ativo" | "inativo",
  faq: [] as { pergunta: string; resposta: string }[],
};
const EMPTY_OFFER = {
  nome: "",
  preco: "",
  descricao: "",
  mensagem_sugerida: "",
  prioridade: 5,
  status: "ativo",
};

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("Informações");
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [newImageType, setNewImageType] = useState("image");
  const [offerForm, setOfferForm] = useState<any>(EMPTY_OFFER);
  const [editingOffer, setEditingOffer] = useState<string | null>(null);
  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ pergunta: "", resposta: "" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: authHeader(),
      });
      if (res.ok) setProducts(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openProduct = async (p: any) => {
    const res = await fetch(`${API_BASE}/products/${p.id}`, {
      headers: authHeader(),
    });
    if (res.ok) {
      const data = await res.json();
      setSelected(data);
      setForm({
        ...data,
        beneficios: data.beneficios?.length ? data.beneficios : [""],
        tags: data.tags?.length ? data.tags : [""],
        faq: data.faq || [],
        preco_base: data.preco_base?.toString() || "",
      });
    }
    setIsNew(false);
    setActiveTab("Informações");
    setShowModal(true);
  };

  const openNew = () => {
    setSelected(null);
    setForm({ ...EMPTY_PRODUCT });
    setIsNew(true);
    setActiveTab("Informações");
    setShowModal(true);
  };

  const saveProduct = async () => {
    const payload = {
      ...form,
      beneficios: form.beneficios.filter(Boolean),
      tags: form.tags.filter(Boolean),
      preco_base: parseFloat(form.preco_base) || null,
    };
    const url = isNew
      ? `${API_BASE}/products`
      : `${API_BASE}/products/${selected?.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: authHeader(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      showToast(isNew ? "Produto criado!" : "Produto atualizado!");
      if (isNew) {
        setIsNew(false);
        setSelected(data);
      }
      fetchProducts();
    } else showToast("Erro ao salvar produto.", "error");
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Inativar este produto?")) return;
    await fetch(`${API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    showToast("Produto inativado.");
    setShowModal(false);
    fetchProducts();
  };
  const addImage = async () => {
    if (!newImageUrl || !selected?.id) return;
    const res = await fetch(`${API_BASE}/products/${selected.id}/images`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({
        url: newImageUrl,
        tipo: newImageType,
        caption: newImageCaption,
      }),
    });
    if (res.ok) {
      showToast("Mídia adicionada!");
      setNewImageUrl("");
      setNewImageCaption("");
      openProduct(selected);
    }
  };
  const removeImage = async (imgId: string) => {
    await fetch(`${API_BASE}/products/${selected.id}/images/${imgId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    openProduct(selected);
  };
  const saveOffer = async () => {
    if (!selected?.id) return;
    const url = editingOffer
      ? `${API_BASE}/offers/${editingOffer}`
      : `${API_BASE}/products/${selected.id}/offers`;
    const method = editingOffer ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: authHeader(),
      body: JSON.stringify({
        ...offerForm,
        preco: parseFloat(offerForm.preco) || null,
      }),
    });
    if (res.ok) {
      showToast(editingOffer ? "Oferta atualizada!" : "Oferta criada!");
      setOfferForm(EMPTY_OFFER);
      setEditingOffer(null);
      openProduct(selected);
    }
  };
  const deleteOffer = async (offerId: string) => {
    if (!confirm("Remover esta oferta?")) return;
    await fetch(`${API_BASE}/offers/${offerId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    openProduct(selected);
  };
  const addTrigger = async (offerId: string, triggerType: string) => {
    await fetch(`${API_BASE}/offers/${offerId}/triggers`, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify({ trigger_type: triggerType }),
    });
    openProduct(selected);
  };
  const addFaq = () => {
    if (!faqForm.pergunta || !faqForm.resposta) return;
    setForm((f: any) => ({ ...f, faq: [...(f.faq || []), { ...faqForm }] }));
    setFaqForm({ pergunta: "", resposta: "" });
  };
  const removeFaq = (i: number) =>
    setForm((f: any) => ({
      ...f,
      faq: f.faq.filter((_: any, idx: number) => idx !== i),
    }));

  return (
    <div className="space-y-6">
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
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-xl p-5 animate-pulse"
            >
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
          <button
            onClick={openNew}
            className="text-xs text-primary hover:underline"
          >
            Criar primeiro produto →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              className="text-left bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <div className="h-36 bg-muted/50 relative flex items-center justify-center border-b border-border">
                <Package className="w-10 h-10 text-muted-foreground/30" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <StatusPill status={p.status} />
                </div>
                {p.image_count > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ImageIcon className="w-3 h-3" /> {p.image_count} foto
                    {p.image_count > 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {p.nome}
                    </h3>
                    {p.categoria && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.categoria}
                      </p>
                    )}
                  </div>
                  {p.preco_base && (
                    <span className="text-sm font-bold text-primary shrink-0">
                      R${" "}
                      {parseFloat(p.preco_base).toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  )}
                </div>
                {p.descricao_curta && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {p.descricao_curta}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {p.offer_count} oferta
                    {p.offer_count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 pt-6 backdrop-blur-md sm:p-6 sm:pt-10">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#151515] dark:shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.10),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_30%)]" />
            <div className="relative border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-primary text-white shadow-[0_16px_34px_rgba(245,121,59,0.28)]">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Catálogo inteligente
                    </p>
                    <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-foreground sm:text-[30px]">
                      {isNew ? "Novo Produto" : form.nome || "Produto"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Cadastre um produto que sua IA poderá vender
                      automaticamente.
                    </p>
                    {!isNew && (
                      <div className="mt-3">
                        <StatusPill status={form.status} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <button
                      onClick={() => deleteProduct(selected?.id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-transparent text-red-500 transition-colors hover:border-red-500/20 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/[0.82] text-muted-foreground transition-all hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="relative border-b border-black/[0.06] px-5 dark:border-white/[0.08] sm:px-6">
              <div className="flex gap-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "relative whitespace-nowrap px-1 pb-4 pt-4 text-sm font-semibold transition-colors",
                      activeTab === tab
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab}
                    <span
                      className={cn(
                        "absolute inset-x-0 bottom-0 h-0.5 rounded-full transition-all duration-300",
                        activeTab === tab
                          ? "bg-primary opacity-100"
                          : "bg-transparent opacity-0",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="relative max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {activeTab === "Informações" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="Bloco 1"
                    title="Informações básicas"
                    description="Defina os dados centrais do produto para cadastro e precificação."
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <FieldLabel label="Nome do produto" required />
                        <input
                          value={form.nome}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              nome: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Ex: Plano Essencial CRM"
                        />
                      </div>
                      <div>
                        <FieldLabel label="Categoria" />
                        <input
                          value={form.categoria || ""}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              categoria: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Ex: SaaS, Seguro, Consultoria"
                        />
                      </div>
                      <div>
                        <FieldLabel label="Preço base (R$)" />
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="number"
                            value={form.preco_base}
                            onChange={(e) =>
                              setForm((f: any) => ({
                                ...f,
                                preco_base: e.target.value,
                              }))
                            }
                            className={`${inputClass} pl-10`}
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Bloco 2"
                    title="Descrição"
                    description="Organize o resumo mostrado na interface e o contexto completo usado pela IA."
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FieldLabel label="Descrição curta" />
                        <input
                          value={form.descricao_curta || ""}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              descricao_curta: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Resumo de 1 linha enviado pela IA no WhatsApp"
                        />
                      </div>
                      <div>
                        <FieldLabel label="Descrição detalhada" />
                        <textarea
                          value={form.descricao_detalhada || ""}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              descricao_detalhada: e.target.value,
                            }))
                          }
                          rows={5}
                          className={textareaClass}
                          placeholder="Descrição completa para contexto da IA"
                        />
                      </div>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Bloco 3"
                    title="Valor percebido"
                    description="Liste os benefícios que aumentam a clareza da oferta."
                  >
                    <div className="space-y-3">
                      <FieldLabel label="Benefícios principais" />
                      {(form.beneficios || [""]).map(
                        (beneficio: string, i: number) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              value={beneficio}
                              onChange={(e) => {
                                const arr = [...form.beneficios];
                                arr[i] = e.target.value;
                                setForm((f: any) => ({
                                  ...f,
                                  beneficios: arr,
                                }));
                              }}
                              className={inputClass}
                              placeholder={`Benefício ${i + 1}`}
                            />
                            {form.beneficios.length > 1 && (
                              <button
                                onClick={() =>
                                  setForm((f: any) => ({
                                    ...f,
                                    beneficios: f.beneficios.filter(
                                      (_: string, idx: number) => idx !== i,
                                    ),
                                  }))
                                }
                                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white text-muted-foreground transition-colors hover:text-red-500 dark:border-white/[0.08] dark:bg-white/[0.04]"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ),
                      )}
                      <button
                        onClick={() =>
                          setForm((f: any) => ({
                            ...f,
                            beneficios: [...f.beneficios, ""],
                          }))
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/15"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar benefício
                      </button>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Bloco 4"
                    title="Contexto para IA"
                    description="Essas tags ajudam a IA a identificar quando este produto deve ser oferecido."
                  >
                    <div className="space-y-5">
                      <div>
                        <FieldLabel label="Tags" />
                        <div className="rounded-[24px] border border-black/[0.08] bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
                          <div className="flex flex-wrap gap-2">
                            {(form.tags || [])
                              .filter(Boolean)
                              .map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                                >
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                  <button
                                    onClick={() =>
                                      setForm((f: any) => ({
                                        ...f,
                                        tags: f.tags.filter(
                                          (_: any, idx: number) => idx !== i,
                                        ),
                                      }))
                                    }
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            <input
                              className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                              placeholder="Adicionar tag..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const val = (
                                    e.target as HTMLInputElement
                                  ).value.trim();
                                  if (val) {
                                    setForm((f: any) => ({
                                      ...f,
                                      tags: [...(f.tags || []), val],
                                    }));
                                    (e.target as HTMLInputElement).value = "";
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          subtlePanel,
                          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Status do produto
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Controle se a IA pode oferecer este produto
                            automaticamente.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {form.status === "ativo" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Ativo
                            </span>
                          )}
                          <button
                            onClick={() =>
                              setForm((f: any) => ({
                                ...f,
                                status:
                                  f.status === "ativo" ? "inativo" : "ativo",
                              }))
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 dark:border-white/[0.08] dark:bg-white/[0.04]"
                          >
                            {form.status === "ativo" ? (
                              <>
                                <ToggleRight className="h-5 w-5 text-primary" />
                                <span className="text-primary">Ativo</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Inativo
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </ModalSection>
                </div>
              )}
              {activeTab === "Imagens" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="Mídia"
                    title="Imagens, vídeos e PDF"
                    description="Organize os ativos visuais do produto mantendo o mesmo fluxo atual."
                  >
                    <div className="space-y-4">
                      <input
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className={inputClass}
                        placeholder="URL da imagem, vídeo ou PDF..."
                      />
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]">
                        <input
                          value={newImageCaption}
                          onChange={(e) => setNewImageCaption(e.target.value)}
                          className={inputClass}
                          placeholder="Legenda opcional"
                        />
                        <select
                          value={newImageType}
                          onChange={(e) => setNewImageType(e.target.value)}
                          className={inputClass}
                        >
                          <option value="image">Imagem</option>
                          <option value="video">Vídeo</option>
                          <option value="pdf">PDF</option>
                        </select>
                        <button
                          onClick={addImage}
                          disabled={!newImageUrl || !selected?.id}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(245,121,59,0.25)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Galeria"
                    title="Arquivos cadastrados"
                    description="Revise e remova os ativos associados ao produto."
                  >
                    {(selected?.images || []).length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">
                        <ImageIcon className="mx-auto mb-3 h-9 w-9 opacity-20" />
                        Nenhuma mídia adicionada.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {selected.images.map((img: any) => (
                          <div
                            key={img.id}
                            className="group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-background/70 dark:border-white/[0.08] dark:bg-white/[0.03]"
                          >
                            <div className="aspect-video flex items-center justify-center bg-muted/40">
                              {img.tipo === "image" ? (
                                <img
                                  src={img.url}
                                  alt={img.caption || ""}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                  <ImageIcon className="h-6 w-6 opacity-40" />
                                  <span className="text-[10px] font-bold uppercase">
                                    {img.tipo}
                                  </span>
                                </div>
                              )}
                            </div>
                            {img.caption && (
                              <p className="border-t border-black/[0.05] px-3 py-2 text-xs text-muted-foreground dark:border-white/[0.06]">
                                {img.caption}
                              </p>
                            )}
                            <button
                              onClick={() => removeImage(img.id)}
                              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-red-500/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ModalSection>
                </div>
              )}
              {activeTab === "Ofertas" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="Oferta"
                    title={editingOffer ? "Editar oferta" : "Nova oferta"}
                    description="Cadastre ofertas dinâmicas sem alterar o comportamento atual da IA."
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <FieldLabel label="Nome da oferta" />
                        <input
                          value={offerForm.nome}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              nome: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Nome da oferta (ex: Plano Premium)"
                        />
                      </div>
                      <div>
                        <FieldLabel label="Preço" />
                        <input
                          type="number"
                          value={offerForm.preco}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              preco: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Preço (R$)"
                        />
                      </div>
                      <div className={subtlePanel}>
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-sm font-semibold text-foreground">
                            Prioridade
                          </label>
                          <span className="text-sm font-bold text-primary">
                            {offerForm.prioridade}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={10}
                          value={offerForm.prioridade}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              prioridade: parseInt(e.target.value),
                            }))
                          }
                          className="mt-3 w-full accent-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel label="Descrição" />
                        <textarea
                          value={offerForm.descricao}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              descricao: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="Descrição da oferta"
                          className={textareaClass}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <FieldLabel
                          label="Mensagem sugerida"
                          hint="texto usado pela IA no WhatsApp"
                        />
                        <textarea
                          value={offerForm.mensagem_sugerida}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              mensagem_sugerida: e.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Mensagem sugerida para a IA enviar no WhatsApp..."
                          className={textareaClass}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={saveOffer}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(245,121,59,0.25)] transition-all hover:-translate-y-0.5"
                      >
                        <Save className="h-4 w-4" />
                        {editingOffer ? "Salvar oferta" : "Criar oferta"}
                      </button>
                      {editingOffer && (
                        <button
                          onClick={() => {
                            setEditingOffer(null);
                            setOfferForm(EMPTY_OFFER);
                          }}
                          className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] px-5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:hover:text-white"
                        >
                          Cancelar edição
                        </button>
                      )}
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Lista"
                    title="Ofertas existentes"
                    description="Expanda cada oferta para revisar os gatilhos conversacionais."
                  >
                    <div className="space-y-3">
                      {(selected?.offers || []).map((o: any) => (
                        <div
                          key={o.id}
                          className="overflow-hidden rounded-[24px] border border-black/[0.06] bg-background/80 dark:border-white/[0.08] dark:bg-white/[0.03]"
                        >
                          <div
                            className="cursor-pointer flex items-center justify-between gap-3 px-4 py-4"
                            onClick={() =>
                              setExpandedOffer(
                                expandedOffer === o.id ? null : o.id,
                              )
                            }
                          >
                            <div className="min-w-0 flex items-center gap-3">
                              <StatusPill status={o.status} />
                              <span className="truncate text-sm font-semibold text-foreground">
                                {o.nome}
                              </span>
                              {o.preco && (
                                <span className="text-xs font-bold text-primary">
                                  R${" "}
                                  {parseFloat(o.preco).toLocaleString("pt-BR")}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                P{o.prioridade}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingOffer(o.id);
                                  setOfferForm({
                                    nome: o.nome,
                                    preco: o.preco || "",
                                    descricao: o.descricao || "",
                                    mensagem_sugerida:
                                      o.mensagem_sugerida || "",
                                    prioridade: o.prioridade,
                                    status: o.status,
                                  });
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-white hover:text-foreground dark:hover:bg-white/[0.05] dark:hover:text-white"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOffer(o.id);
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {expandedOffer === o.id ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          {expandedOffer === o.id && (
                            <div className="border-t border-black/[0.05] px-4 py-4 dark:border-white/[0.06]">
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                Gatilhos conversacionais
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                {TRIGGER_TYPES.map((t) => {
                                  const active = (o.triggers || []).includes(
                                    t.value,
                                  );
                                  return (
                                    <button
                                      key={t.value}
                                      onClick={() => addTrigger(o.id, t.value)}
                                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-all ${active ? `${t.color} border-transparent` : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                                    >
                                      {t.label}
                                    </button>
                                  );
                                })}
                              </div>
                              {o.mensagem_sugerida && (
                                <div className="mt-4 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 dark:border-white/[0.08] dark:bg-white/[0.04]">
                                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    Mensagem sugerida
                                  </p>
                                  <p className="text-sm text-foreground">
                                    {o.mensagem_sugerida}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      {(selected?.offers || []).length === 0 && !isNew && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Nenhuma oferta criada ainda.
                        </div>
                      )}
                    </div>
                  </ModalSection>
                </div>
              )}
              {activeTab === "FAQ" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="FAQ"
                    title="Perguntas frequentes"
                    description="Cadastre respostas que ajudam a IA a lidar melhor com objeções e dúvidas comuns."
                  >
                    <div className="space-y-4">
                      <div>
                        <FieldLabel label="Pergunta" />
                        <input
                          value={faqForm.pergunta}
                          onChange={(e) =>
                            setFaqForm((f) => ({
                              ...f,
                              pergunta: e.target.value,
                            }))
                          }
                          className={inputClass}
                          placeholder="Pergunta frequente..."
                        />
                      </div>
                      <div>
                        <FieldLabel label="Resposta" />
                        <textarea
                          value={faqForm.resposta}
                          onChange={(e) =>
                            setFaqForm((f) => ({
                              ...f,
                              resposta: e.target.value,
                            }))
                          }
                          rows={4}
                          placeholder="Resposta da IA..."
                          className={textareaClass}
                        />
                      </div>
                      <button
                        onClick={addFaq}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(245,121,59,0.25)] transition-all hover:-translate-y-0.5"
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar FAQ
                      </button>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Lista"
                    title="Itens cadastrados"
                    description="Revise as FAQs adicionadas antes de salvar o produto."
                  >
                    <div className="space-y-3">
                      {(form.faq || []).map((item: any, i: number) => (
                        <div
                          key={i}
                          className="rounded-[24px] border border-black/[0.06] bg-background/80 p-4 dark:border-white/[0.08] dark:bg-white/[0.03]"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {item.pergunta}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {item.resposta}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFaq(i)}
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(form.faq || []).length === 0 && (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          Nenhuma FAQ adicionada ainda.
                        </div>
                      )}
                    </div>
                  </ModalSection>
                </div>
              )}
            </div>
            <div className="relative flex flex-col gap-3 border-t border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] px-5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:hover:text-white"
              >
                Cancelar
              </button>
              {(activeTab === "Informações" || activeTab === "FAQ") && (
                <button
                  onClick={saveProduct}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(245,121,59,0.28)] transition-all hover:-translate-y-0.5 sm:min-w-[180px]"
                >
                  <Save className="h-4 w-4" />
                  Salvar Produto
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
