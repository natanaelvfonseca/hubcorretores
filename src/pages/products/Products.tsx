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
  DollarSign,
  Image as ImageIcon,
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
const PROMOTION_API_BASE = `${CATALOG_API_BASE}/promotions`;
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
const TABS = ["Informações", "Imagens", "FAQ"];

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

function formatCurrency(value?: string | number | null) {
  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return numericValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDateRange(start?: string | null, end?: string | null) {
  const toDate = (value?: string | null) =>
    value
      ? new Date(value).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : null;

  const startLabel = toDate(start);
  const endLabel = toDate(end);

  if (startLabel && endLabel) return `${startLabel} - ${endLabel}`;
  if (startLabel) return `A partir de ${startLabel}`;
  if (endLabel) return `Até ${endLabel}`;
  return "Sem vigência definida";
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
  starts_at: "",
  ends_at: "",
  triggers: ["pergunta_preco"],
};

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("Informações");
  const [showModal, setShowModal] = useState(false);
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [promotionProductId, setPromotionProductId] = useState("");
  const [promotionProduct, setPromotionProduct] = useState<any | null>(null);
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

  const fetchPromotions = useCallback(async () => {
    try {
      const res = await fetch(PROMOTION_API_BASE, {
        headers: authHeader(),
      });
      if (res.ok) setPromotions(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchPromotions();
  }, [fetchProducts, fetchPromotions]);

  useEffect(() => {
    if (!products.length) {
      setPromotionProductId("");
      return;
    }
    setPromotionProductId((current) =>
      current && products.some((product) => product.id === current)
        ? current
        : products[0].id,
    );
  }, [products]);

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
    setActiveTab("Informações");
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
    setActiveTab("Informações");
    setShowModal(true);
  };

  const openPromotionCreator = async (product: any) => {
    const res = await fetch(`${CATALOG_API_BASE}/products/${product.id}`, {
      headers: authHeader(),
    });
    const productData = res.ok ? await res.json() : product;
    setPromotionProduct(productData);
    setPromotionProductId(productData.id);
    setOfferForm({
      ...EMPTY_OFFER,
      nome: `Promoção ${productData.nome}`,
      preco: productData.preco_base?.toString() || "",
      descricao:
        productData.descricao_curta ||
        productData.descricao_detalhada ||
        "",
      mensagem_sugerida: "",
    });
    setEditingOffer(null);
    setShowPromotionModal(true);
  };

  const openPromotionEditor = (promotion: any) => {
    setPromotionProduct({
      id: promotion.product_id,
      nome: promotion.product_nome,
      categoria: promotion.product_categoria,
      status: promotion.product_status,
      preco_base: promotion.product_preco_base,
      descricao_curta: promotion.product_descricao_curta,
    });
    setPromotionProductId(promotion.product_id);
    setOfferForm({
      nome: promotion.nome || "",
      preco: promotion.preco?.toString() || "",
      descricao: promotion.descricao || "",
      mensagem_sugerida: promotion.mensagem_sugerida || "",
      prioridade: promotion.prioridade || 5,
      status: promotion.status || "ativo",
      starts_at: promotion.starts_at
        ? new Date(promotion.starts_at).toISOString().slice(0, 10)
        : "",
      ends_at: promotion.ends_at
        ? new Date(promotion.ends_at).toISOString().slice(0, 10)
        : "",
      triggers: promotion.triggers?.length
        ? promotion.triggers
        : ["pergunta_preco"],
    });
    setEditingOffer(promotion.id);
    setShowPromotionModal(true);
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
        setSelected(null);
        setShowModal(false);
        setForm({ ...EMPTY_PRODUCT });
        setNewImageUrl("");
        setNewImageCaption("");
        setNewImageType("image");
        setNewImageFile(null);
      } else {
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
    if (!newImageUrl && !newImageFile) return;
    if (!selected?.id) {
      showToast("Salve o produto antes de enviar uma imagem.", "error");
      return;
    }
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
        showToast(newImageFile ? "Imagem enviada!" : "Midia adicionada!");
        setNewImageUrl("");
        setNewImageCaption("");
        setNewImageType("image");
        setNewImageFile(null);
        openProduct(selected);
      } else {
        const error = await res.json().catch(() => null);
        showToast(error?.error || "Erro ao adicionar midia.", "error");
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
    if (!promotionProduct?.id) return;
    const url = editingOffer
      ? `${API_BASE}/offers/${editingOffer}`
      : `${API_BASE}/products/${promotionProduct.id}/offers`;
    const method = editingOffer ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: authHeader(),
      body: JSON.stringify({
        ...offerForm,
        preco: parseFloat(offerForm.preco) || null,
        starts_at: offerForm.starts_at || null,
        ends_at: offerForm.ends_at || null,
        triggers: offerForm.triggers || [],
      }),
    });
    if (res.ok) {
      showToast(editingOffer ? "Promoção atualizada!" : "Promoção criada!");
      setOfferForm(EMPTY_OFFER);
      setEditingOffer(null);
      setShowPromotionModal(false);
      fetchProducts();
      fetchPromotions();
    } else {
      const error = await res.json().catch(() => null);
      showToast(error?.error || "Erro ao salvar promoção.", "error");
    }
  };
  const deleteOffer = async (offerId: string) => {
    if (!confirm("Remover esta promoção?")) return;
    await fetch(`${API_BASE}/offers/${offerId}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    showToast("Promoção removida.");
    fetchProducts();
    fetchPromotions();
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
  const activePromotions = promotions.filter(
    (promotion) => promotion.is_currently_active,
  ).length;
  const selectedPromotionProductFromList =
    products.find((product) => product.id === promotionProductId) || null;

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
              Catálogo inteligente
            </div>

            <h1 className="mt-4 text-4xl font-display font-bold tracking-[-0.04em] text-text-primary sm:text-5xl">
              Produtos
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              Organize o catálogo, prepare promoções por produto e deixe sua operação no WhatsApp mais clara para vender com contexto.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <HeaderStat label="Total de produtos" value={products.length} />
              <HeaderStat label="Catálogo ativo" value={activeProducts} />
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
                {productsWithOffers} com promoções
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
            Seu catálogo começa aqui
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-text-secondary sm:text-base">
            Crie seu primeiro produto para organizar materiais, imagens e promoções em uma experiência mais premium e pronta para escalar vendas no WhatsApp.
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
            <div
              key={p.id}
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
                      {p.categoria || "Catálogo"}
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
                      Mídias
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
                      Promoções
                    </p>
                    <p className="mt-2 text-lg font-display font-bold text-text-primary">
                      {Number(p.offer_count) || 0}
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">
                        Valor promocional configurado
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
                      : "Adicione imagem e promoção para aumentar a percepção de valor."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPromotionCreator(p)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/15"
                  >
                    <Plus size={15} />
                    Criar promoção
                  </button>
                  <button
                    type="button"
                    onClick={() => openProduct(p)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:group-hover:border-primary/30 dark:group-hover:text-primary-light"
                  >
                    Configurar
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>
      )}

      {products.length > 0 && (
        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-white/[0.84] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/[0.08] dark:bg-[#111111] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.10),_transparent_32%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.14),_transparent_36%)]" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/[0.15] bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  <Zap size={14} />
                  Promoções
                </div>
                <h2 className="mt-4 text-3xl font-display font-bold tracking-[-0.04em] text-text-primary sm:text-4xl">
                  Promoções por produto
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary sm:text-base">
                  Selecione um produto já criado, configure o preço promocional e deixe a IA priorizar o valor certo durante o período da campanha.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto] xl:max-w-xl">
                <select
                  value={promotionProductId}
                  onChange={(event) => setPromotionProductId(event.target.value)}
                  className={inputClass}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!selectedPromotionProductFromList}
                  onClick={() =>
                    selectedPromotionProductFromList &&
                    openPromotionCreator(selectedPromotionProductFromList)
                  }
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(245,121,59,0.4)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={18} />
                  Nova promoção
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {activePromotions} promoções ativas
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-black/[0.05] bg-white/70 px-3 py-1.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
                <Package size={14} className="text-primary" />
                {productsWithOffers} produtos com promoções
              </span>
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-black/[0.08] bg-white/60 p-10 text-center dark:border-white/[0.08] dark:bg-white/[0.03]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/10 text-primary">
                  <Zap size={28} />
                </div>
                <h3 className="mt-5 text-xl font-display font-bold text-text-primary">
                  Nenhuma promoção criada ainda
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-text-secondary">
                  Use o seletor acima ou o botão no card do produto para criar uma promoção e fazer a IA enviar o valor promocional durante a campanha.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {promotions.map((promotion) => {
                  const promotionPrice = formatCurrency(promotion.preco);
                  const basePrice = formatCurrency(promotion.product_preco_base);
                  return (
                    <div
                      key={promotion.id}
                      className="overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/[0.9] p-6 shadow-[0_16px_45px_rgba(15,23,42,0.07)] dark:border-white/[0.08] dark:bg-[#101010]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                            {promotion.product_nome}
                          </p>
                          <h3 className="mt-2 text-2xl font-display font-bold tracking-tight text-text-primary">
                            {promotion.nome}
                          </h3>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className={cn(
                              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                              promotion.is_currently_active
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300",
                            )}>
                              <span className={cn("h-2 w-2 rounded-full", promotion.is_currently_active ? "bg-emerald-500" : "bg-slate-400")} />
                              {promotion.is_currently_active ? "Ativa" : "Agendada/Inativa"}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-black/[0.06] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary dark:border-white/[0.08] dark:bg-white/[0.04]">
                              {formatDateRange(promotion.starts_at, promotion.ends_at)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {promotionPrice && (
                            <p className="text-2xl font-display font-bold text-primary">
                              {promotionPrice}
                            </p>
                          )}
                          {basePrice && (
                            <p className="mt-1 text-sm text-text-secondary line-through">
                              {basePrice}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 rounded-[24px] border border-black/[0.05] bg-background/70 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]">
                        <p className="text-sm leading-7 text-text-secondary">
                          {promotion.descricao ||
                            promotion.product_descricao_curta ||
                            "A promoção está usando o contexto principal do produto para a IA apresentar a campanha."}
                        </p>
                      </div>

                      {(promotion.triggers || []).length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(promotion.triggers || []).map((trigger: string) => (
                            <span
                              key={trigger}
                              className="inline-flex items-center rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
                            >
                              {trigger.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-5 dark:border-white/[0.06]">
                        <span className="text-sm text-text-secondary">
                          Prioridade P{promotion.prioridade || 5}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openPromotionEditor(promotion)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white"
                          >
                            <Edit2 size={15} />
                            Editar promoção
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteOffer(promotion.id)}
                            className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10 px-4 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/15"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
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
              {activeTab === "Informações" && (
                <div className="space-y-5">
                  <ModalSection
                    eyebrow="Bloco 1"
                    title="Informações básicas"
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
                    title="Descrição do Produto"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <FieldLabel label="Descrição do Produto" />
                        <textarea
                          value={form.descricao_detalhada || form.descricao_curta || ""}
                          onChange={(e) =>
                            setForm((f: any) => ({
                              ...f,
                              descricao_curta: e.target.value,
                              descricao_detalhada: e.target.value,
                            }))
                          }
                          rows={5}
                          className={textareaClass}
                          placeholder="Descreva o produto para a IA e para a apresentação no WhatsApp"
                        />
                      </div>
                    </div>
                  </ModalSection>
                  <ModalSection
                    eyebrow="Bloco 3"
                    title="Status do produto"
                  >
                    <div
                      className={cn(
                        subtlePanel,
                        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                      )}
                    >
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
                      <div className={subtlePanel}>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Upload de imagem do produto
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              A imagem enviada aqui fica pronta para a Evolution encaminhar no WhatsApp quando a IA apresentar o produto.
                            </p>
                            {!selected?.id && (
                              <p className="mt-2 text-xs font-medium text-primary">
                                Salve o produto primeiro para liberar o upload da imagem.
                              </p>
                            )}
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
                            PNG, JPG ou WEBP com até 10MB
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
                          disabled={(!newImageUrl && !newImageFile) || uploadingImage}
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
            <div className="relative shrink-0 flex flex-col gap-3 border-t border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

      {showPromotionModal && promotionProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/60 p-3 backdrop-blur-md sm:p-5">
          <div className="relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)] dark:border-white/[0.08] dark:bg-[#151515] dark:shadow-[0_28px_100px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-2.5rem)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.10),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,121,59,0.12),_transparent_30%)]" />
            <div className="relative shrink-0 border-b border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-primary text-white shadow-[0_16px_34px_rgba(245,121,59,0.28)]">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                      Promoções
                    </p>
                    <h2 className="mt-2 text-2xl font-display font-bold tracking-tight text-foreground sm:text-[30px]">
                      {editingOffer ? "Editar promoção" : "Nova promoção"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Selecione a vigência e o valor promocional que a IA deve usar ao apresentar este produto no WhatsApp.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPromotionModal(false);
                    setEditingOffer(null);
                    setOfferForm(EMPTY_OFFER);
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/[0.82] text-muted-foreground transition-all hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04] dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              <div className="space-y-5">
                <ModalSection eyebrow="Produto" title={promotionProduct.nome}>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className={subtlePanel}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        Categoria
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {promotionProduct.categoria || "Produto do catálogo"}
                      </p>
                    </div>
                    <div className={subtlePanel}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        Preço atual
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {formatCurrency(promotionProduct.preco_base) || "Não definido"}
                      </p>
                    </div>
                    <div className={subtlePanel}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {promotionProduct.status === "ativo" ? "Ativo" : "Inativo"}
                      </p>
                    </div>
                  </div>
                </ModalSection>

                <ModalSection eyebrow="Campanha" title="Configuração da promoção">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <FieldLabel label="Nome da promoção" />
                      <input
                        value={offerForm.nome}
                        onChange={(e) =>
                          setOfferForm((f: any) => ({
                            ...f,
                            nome: e.target.value,
                          }))
                        }
                        className={inputClass}
                        placeholder="Ex: Promoção de Maio"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Preço promocional" />
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
                            prioridade: Number.parseInt(e.target.value, 10),
                          }))
                        }
                        className="mt-3 w-full accent-primary"
                      />
                    </div>
                    <div>
                      <FieldLabel label="Começa em" />
                      <input
                        type="date"
                        value={offerForm.starts_at || ""}
                        onChange={(e) =>
                          setOfferForm((f: any) => ({
                            ...f,
                            starts_at: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <FieldLabel label="Termina em" />
                      <input
                        type="date"
                        value={offerForm.ends_at || ""}
                        onChange={(e) =>
                          setOfferForm((f: any) => ({
                            ...f,
                            ends_at: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel label="Descrição da promoção" />
                      <textarea
                        value={offerForm.descricao}
                        onChange={(e) =>
                          setOfferForm((f: any) => ({
                            ...f,
                            descricao: e.target.value,
                          }))
                        }
                        rows={3}
                        placeholder="Explique rapidamente o contexto e o benefício desta promoção."
                        className={textareaClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel
                        label="Mensagem que a IA vai enviar"
                        hint="opcional"
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
                        placeholder="Se deixar vazio, a Kogna monta automaticamente a mensagem com o preço promocional."
                        className={textareaClass}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel label="Quando a IA deve priorizar esta promoção" />
                      <div className="flex flex-wrap gap-2">
                        {TRIGGER_TYPES.map((trigger) => {
                          const active = (offerForm.triggers || []).includes(
                            trigger.value,
                          );
                          return (
                            <button
                              key={trigger.value}
                              type="button"
                              onClick={() =>
                                setOfferForm((f: any) => {
                                  const current = f.triggers || [];
                                  return {
                                    ...f,
                                    triggers: current.includes(trigger.value)
                                      ? current.filter((item: string) => item !== trigger.value)
                                      : [...current, trigger.value],
                                  };
                                })
                              }
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all",
                                active
                                  ? "border-primary/20 bg-primary/10 text-primary"
                                  : "border-black/[0.08] bg-white text-text-secondary hover:border-primary/30 hover:text-primary dark:border-white/[0.08] dark:bg-white/[0.04]",
                              )}
                            >
                              {trigger.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <FieldLabel label="Status da promoção" />
                      <div
                        className={cn(
                          subtlePanel,
                          "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {offerForm.status === "ativo" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-500">
                              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              Ativa
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setOfferForm((f: any) => ({
                                ...f,
                                status: f.status === "ativo" ? "inativo" : "ativo",
                              }))
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 dark:border-white/[0.08] dark:bg-white/[0.04]"
                          >
                            {offerForm.status === "ativo" ? (
                              <>
                                <ToggleRight className="h-5 w-5 text-primary" />
                                <span className="text-primary">Ativa</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                                <span className="text-muted-foreground">Inativa</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalSection>
              </div>
            </div>

            <div className="relative shrink-0 flex flex-col gap-3 border-t border-black/[0.06] px-5 py-5 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <button
                onClick={() => {
                  setShowPromotionModal(false);
                  setEditingOffer(null);
                  setOfferForm(EMPTY_OFFER);
                }}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-black/[0.08] px-5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={saveOffer}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(245,121,59,0.28)] transition-all hover:-translate-y-0.5 sm:min-w-[200px]"
              >
                <Save className="h-4 w-4" />
                {editingOffer ? "Salvar promoção" : "Criar promoção"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast {...toast} />}
    </div>
  );
}


