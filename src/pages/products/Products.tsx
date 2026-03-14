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
  Search,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../utils/cn";

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const CATALOG_API_BASE = `${API_BASE}/catalog`;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("kogna_token")}`,
  "Content-Type": "application/json",
});
const authUploadHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("kogna_token")}`,
});
const TRIGGER_TYPES = [
  {
    value: "primeiro_contato",
    label: "Primeiro Contato",
    color: "bg-blue-500/15 text-blue-400",
  },
  {
    value: "pergunta_preco",
    label: "Pergunta de PreÃ§o",
    color: "bg-yellow-500/15 text-yellow-400",
  },
  {
    value: "comparacao",
    label: "ComparaÃ§Ã£o",
    color: "bg-purple-500/15 text-purple-400",
  },
  {
    value: "objecao_preco",
    label: "ObjeÃ§Ã£o de PreÃ§o",
    color: "bg-red-500/15 text-red-400",
  },
  {
    value: "indecisao",
    label: "IndecisÃ£o",
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
const TABS = ["InformaÃ§Ãµes", "Imagens", "Ofertas", "FAQ"];

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

function HeaderStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.06] bg-white/70 px-4 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-display font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
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
  const [activeTab, setActiveTab] = useState("InformaÃ§Ãµes");
  const [showModal, setShowModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PRODUCT);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [newImageType, setNewImageType] = useState("image");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      const res = await fetch(`${CATALOG_API_BASE}/products`, {
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
    const res = await fetch(`${CATALOG_API_BASE}/products/${p.id}`, {
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
    setNewImageUrl("");
    setNewImageCaption("");
    setNewImageType("image");
    setNewImageFile(null);
    setIsNew(false);
    setActiveTab("InformaÃ§Ãµes");
    setShowModal(true);
  };

  const openNew = () => {
    setSelected(null);
    setForm({ ...EMPTY_PRODUCT });
    setNewImageUrl("");
    setNewImageCaption("");
    setNewImageType("image");
    setNewImageFile(null);
    setIsNew(true);
    setActiveTab("InformaÃ§Ãµes");
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
      ? `${CATALOG_API_BASE}/products`
      : `${CATALOG_API_BASE}/products/${selected?.id}`;
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
    } else {
      const error = await res.json().catch(() => null);
      showToast(error?.error || "Erro ao salvar produto.", "error");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Inativar este produto?")) return;
    await fetch(`${CATALOG_API_BASE}/products/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    showToast("Produto inativado.");
    setShowModal(false);
    fetchProducts();
  };
  const addImage = async () => {
    if ((!newImageUrl && !newImageFile) || !selected?.id) return;
    setUploadingImage(true);
    try {
      let res: Response;
      if (newImageFile) {
        const formData = new FormData();
        formData.append("file", newImageFile);
        formData.append("caption", newImageCaption);
        res = await fetch(
          `${CATALOG_API_BASE}/products/${selected.id}/images/upload`,
          {
            method: "POST",
            headers: authUploadHeader(),
            body: formData,
          },
        );
      } else {
        res = await fetch(`${CATALOG_API_BASE}/products/${selected.id}/images`, {
          method: "POST",
          headers: authHeader(),
          body: JSON.stringify({
            url: newImageUrl,
            tipo: newImageType,
            caption: newImageCaption,
          }),
        });
      }
      if (res.ok) {
        showToast(newImageFile ? "Imagem enviada!" : "MÃ­dia adicionada!");
        setNewImageUrl("");
        setNewImageCaption("");
        setNewImageType("image");
        setNewImageFile(null);
        openProduct(selected);
      } else {
        const error = await res.json().catch(() => null);
        showToast(error?.error || "Erro ao adicionar mÃ­dia.", "error");
      }
    } finally {
      setUploadingImage(false);
    }
  };
  const removeImage = async (imgId: string) => {
    await fetch(`${CATALOG_API_BASE}/products/${selected.id}/images/${imgId}`, {
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    if (!normalizedQuery) return true;
    const haystack = [
      product.nome,
      product.categoria,
      product.descricao_curta,
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
  const activeProducts = products.filter((product) => product.status === "ativo")
    .length;
  const connectedCatalog = products.filter((product) => Number(product.image_count) > 0)
    .length;
  const productsWithOffers = products.filter((product) => Number(product.offer_count) > 0)
    .length;

  return (
    <div className="relative space-y-8 pb-2">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 overflow-hidden">
        <div className="absolute left-[10%] top-0 h-64 w-64 rounded-full bg-orange-200/25 blur-3xl dark:bg-orange-500/10" />
        <div className="absolute right-[4%] top-6 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl dark:bg-orange-400/10" />
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/[0.85] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#111111] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.13),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.05),_transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_32%)]" />

        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.15] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary dark:border-primary/20 dark:bg-primary/[0.12]">
              <Sparkles size={14} />
              Catalogo inteligente
            </div>

            <h1 className="mt-4 text-4xl font-display font-bold tracking-[-0.04em] text-text-primary sm:text-5xl">
              Produtos
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Organize o catalogo, prepare ofertas dinamicas e deixe sua operacao no WhatsApp mais clara para vender com contexto.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeaderStat label="Total de produtos" value={products.length} />
              <HeaderStat label="Catalogo ativo" value={activeProducts} />
              <HeaderStat label="Prontos para envio" value={connectedCatalog} />
            </div>
          </div>

          <div className="w-full max-w-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Buscar por nome, categoria ou tag"
                  className="h-12 w-full rounded-2xl border border-black/[0.07] bg-white/80 pl-11 pr-4 text-sm text-text-primary shadow-[0_8px_24px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 placeholder:text-text-muted focus:border-primary/40 focus:ring-4 focus:ring-primary/10 dark:border-white/[0.08] dark:bg-white/[0.04] dark:focus:border-primary/40 dark:focus:ring-primary/10"
                />
              </div>

              <button
                onClick={openNew}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)] active:translate-y-0"
              >
                <Plus size={18} />
                Novo Produto
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activeProducts} ativos
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                <ImageIcon size={14} className="text-primary" />
                {connectedCatalog} com imagem pronta
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                <Zap size={14} className="text-primary" />
                {productsWithOffers} com ofertas
              </span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/[0.85] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101010]"
            >
              <div className="mb-5 h-16 w-16 animate-pulse rounded-[22px] bg-muted/60" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-muted/50" />
              <div className="mt-4 h-7 w-40 animate-pulse rounded-full bg-muted/60" />
              <div className="mt-4 flex gap-2">
                <div className="h-7 w-20 animate-pulse rounded-full bg-muted/50" />
                <div className="h-7 w-24 animate-pulse rounded-full bg-muted/50" />
              </div>
              <div className="mt-6 h-28 animate-pulse rounded-[24px] bg-muted/50" />
              <div className="mt-6 h-20 animate-pulse rounded-[20px] bg-muted/40" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)]">
            <Package size={34} />
          </div>
          <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
            Seu catalogo comeca aqui
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
            Crie seu primeiro produto para organizar materiais, imagens e ofertas em uma experiencia mais premium e pronta para escalar vendas no WhatsApp.
          </p>
          <button
            onClick={openNew}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)]"
          >
            <Plus size={18} />
            Criar primeiro produto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/80 p-8 text-center shadow-[0_16px_45px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:col-span-2 xl:col-span-3 sm:p-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary/10 text-primary dark:bg-primary/[0.12]">
                <Search size={28} />
              </div>
              <h3 className="mt-6 text-2xl font-display font-bold tracking-tight text-text-primary">
                Nenhum produto encontrado
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-text-secondary sm:text-base">
                Ajuste a busca para localizar produtos por nome, categoria ou tags usadas pela IA.
              </p>
            </div>
          ) : (
          filteredProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              className="group relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/[0.92] p-6 text-left shadow-[0_16px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)] dark:border-white/[0.08] dark:bg-[#101010] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-primary/[0.12] blur-3xl dark:bg-primary/10" />
              <div className="relative mb-6 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-primary text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)]">
                    <Package size={28} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-text-muted">
                      {p.categoria || "Catalogo"}
                    </p>
                    <h3 className="mt-2 truncate text-2xl font-display font-bold tracking-tight text-text-primary">
                      {p.nome}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.categoria && (
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                          {p.categoria}
                        </span>
                      )}
                      <span className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                        p.status === "ativo"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300",
                      )}>
                        <span className={cn("h-2 w-2 rounded-full", p.status === "ativo" ? "bg-emerald-500" : "bg-slate-400")} />
                        {p.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {p.preco_base && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                      R${" "}
                      {parseFloat(p.preco_base).toLocaleString("pt-BR", {
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  )}
                  <div className="flex gap-1.5">
                    {p.status && (
                      <span className="sr-only">{p.status}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-black/[0.05] bg-background/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-black/[0.05] bg-white/80 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                      Midias
                    </p>
                    <p className="mt-2 text-lg font-display font-bold text-text-primary">
                      {Number(p.image_count) || 0}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {Number(p.image_count) > 0 ? "Prontas para WhatsApp" : "Nenhuma imagem ainda"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/[0.05] bg-white/80 px-4 py-3 dark:border-white/[0.06] dark:bg-white/[0.04]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                      Ofertas
                    </p>
                    <p className="mt-2 text-lg font-display font-bold text-text-primary">
                      {Number(p.offer_count) || 0}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Motor de conversao ativo
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5">
                {p.descricao_curta ? (
                  <p className="text-sm leading-7 text-text-secondary">
                    {p.descricao_curta}
                  </p>
                ) : (
                  <p className="text-sm leading-7 text-text-secondary">
                    Cadastre uma descricao curta para a IA apresentar esse produto com mais clareza no WhatsApp.
                  </p>
                )}
              </div>
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/[0.06] pt-5 dark:border-white/[0.06]">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Zap size={15} />
                  </span>
                  <span className="max-w-[180px] leading-5">
                    {Number(p.image_count) > 0
                      ? "Pronto para apresentar com apoio visual."
                      : "Adicione imagem e oferta para aumentar a percepcao de valor."}
                  </span>
                </div>
                <span className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:group-hover:border-primary/30 dark:group-hover:text-primary-light">
                  Configurar
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          ))
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/60 p-3 backdrop-blur-md sm:p-5">
          <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#151515] dark:shadow-[0_28px_100px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-2.5rem)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.10),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_30%)]" />
            <div className="relative shrink-0 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-primary text-white shadow-[0_16px_34px_rgba(245,121,59,0.28)]">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      CatÃ¡logo inteligente
                    </p>
                    <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-foreground sm:text-[30px]">
                      {isNew ? "Novo Produto" : form.nome || "Produto"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Cadastre um produto que sua IA poderÃ¡ vender
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
            <div className="relative shrink-0 border-b border-black/[0.06] px-5 dark:border-white/[0.08] sm:px-6">
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
            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {activeTab === "InformaÃ§Ãµes" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="Bloco 1"
                    title="InformaÃ§Ãµes bÃ¡sicas"
                    description="Defina os dados centrais do produto para cadastro e precificaÃ§Ã£o."
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
                        <FieldLabel label="PreÃ§o base (R$)" />
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
                    title="DescriÃ§Ã£o"
                    description="Organize o resumo mostrado na interface e o contexto completo usado pela IA."
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FieldLabel label="DescriÃ§Ã£o curta" />
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
                        <FieldLabel label="DescriÃ§Ã£o detalhada" />
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
                          placeholder="DescriÃ§Ã£o completa para contexto da IA"
                        />
                      </div>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Bloco 3"
                    title="Valor percebido"
                    description="Liste os benefÃ­cios que aumentam a clareza da oferta."
                  >
                    <div className="space-y-3">
                      <FieldLabel label="BenefÃ­cios principais" />
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
                              placeholder={`BenefÃ­cio ${i + 1}`}
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
                        Adicionar benefÃ­cio
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
                    eyebrow="MÃ­dia"
                    title="Imagens, vÃ­deos e PDF"
                    description="Organize os ativos visuais do produto mantendo o mesmo fluxo atual."
                  >
                    <div className="space-y-4">
                      <div className={subtlePanel}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Upload de imagem do produto
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              A imagem enviada aqui fica pronta para a Evolution encaminhar no WhatsApp quando a IA apresentar o produto.
                            </p>
                          </div>
                          {newImageFile && (
                            <button
                              type="button"
                              onClick={() => setNewImageFile(null)}
                              className="inline-flex h-10 items-center justify-center rounded-2xl border border-black/[0.08] px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:hover:text-white"
                            >
                              Remover arquivo
                            </button>
                          )}
                        </div>
                        <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-primary/25 bg-primary/5 px-4 py-8 text-center transition-colors hover:border-primary/40 hover:bg-primary/10">
                          <ImageIcon className="mb-3 h-8 w-8 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {newImageFile
                              ? newImageFile.name
                              : "Selecionar imagem para upload"}
                          </span>
                          <span className="mt-1 text-xs text-muted-foreground">
                            PNG, JPG ou WEBP com atÃƒÂ© 10MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setNewImageFile(file);
                              if (file) {
                                setNewImageType("image");
                                setNewImageUrl("");
                              }
                            }}
                          />
                        </label>
                      </div>
                      <input
                        value={newImageUrl}
                        onChange={(e) => {
                          setNewImageUrl(e.target.value);
                          if (e.target.value) setNewImageFile(null);
                        }}
                        className={inputClass}
                        placeholder="URL da imagem, vÃ­deo ou PDF..."
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
                          <option value="video">VÃ­deo</option>
                          <option value="pdf">PDF</option>
                        </select>
                        <button
                          onClick={addImage}
                          disabled={(!newImageUrl && !newImageFile) || !selected?.id || uploadingImage}
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(245,121,59,0.25)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-4 w-4" />
                          {uploadingImage
                            ? "Enviando..."
                            : newImageFile
                              ? "Enviar imagem"
                              : "Adicionar"}
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
                        Nenhuma mÃ­dia adicionada.
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
                    description="Cadastre ofertas dinÃ¢micas sem alterar o comportamento atual da IA."
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
                        <FieldLabel label="PreÃ§o" />
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
                          placeholder="PreÃ§o (R$)"
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
                        <FieldLabel label="DescriÃ§Ã£o" />
                        <textarea
                          value={offerForm.descricao}
                          onChange={(e) =>
                            setOfferForm((f: any) => ({
                              ...f,
                              descricao: e.target.value,
                            }))
                          }
                          rows={3}
                          placeholder="DescriÃ§Ã£o da oferta"
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
                          Cancelar ediÃ§Ã£o
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
                    description="Cadastre respostas que ajudam a IA a lidar melhor com objeÃ§Ãµes e dÃºvidas comuns."
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
            <div className="relative shrink-0 flex flex-col gap-3 border-t border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] px-5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:hover:text-white"
              >
                Cancelar
              </button>
              {(activeTab === "InformaÃ§Ãµes" || activeTab === "FAQ") && (
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


