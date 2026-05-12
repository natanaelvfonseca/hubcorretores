import { useEffect, useMemo, useState } from 'react';
import {
    ArrowRight,
    BadgeCheck,
    Bookmark,
    CheckCircle2,
    Gift,
    HeartHandshake,
    Home,
    ImagePlus,
    MapPin,
    MessageCircle,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    UserCircle2,
    Users,
    X,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';

type OpportunityStatus = 'Aberta' | 'Em negociacao' | 'Resolvida';
type PropertyStatus = 'Disponivel' | 'Reservado' | 'Vendido';

interface Opportunity {
    id: string;
    title: string;
    city: string;
    category: string;
    urgency: string;
    status: OpportunityStatus;
    description: string;
    author: string;
    phone: string;
    images: string[];
    createdAt: string;
}

interface OpportunityDraft {
    title: string;
    city: string;
    category: string;
    urgency: string;
    status: OpportunityStatus;
    description: string;
    phone: string;
    images: string[];
}

type SelectOption = {
    value: string;
    label: string;
};

const OPPORTUNITIES_STORAGE_KEY = 'hub_broker_opportunities';
const SAVED_OPPORTUNITIES_STORAGE_KEY = 'hub_broker_saved_opportunities';
const MAX_STORED_IMAGE_WIDTH = 900;
const MAX_STORED_IMAGE_HEIGHT = 900;
const STORED_IMAGE_QUALITY = 0.68;

const opportunityCategories = [
    'Cliente comprador',
    'Imovel disponivel',
    'Parceria/co-venda',
    'Permuta',
    'Servicos',
    'Veiculos',
    'Cartas/consorcios',
    'Outros negocios',
];

const cities = ['Balneario Camboriu', 'Itapema', 'Camboriu', 'Porto Belo', 'Bombinhas'];
const urgencies = ['Alta', 'Media', 'Baixa'];
const opportunityStatuses: OpportunityStatus[] = ['Aberta', 'Em negociacao', 'Resolvida'];

const defaultOpportunities: Opportunity[] = [
    {
        id: 'default-1',
        title: 'Cliente procura apartamento frente mar',
        city: 'Balneario Camboriu',
        category: 'Cliente comprador',
        urgency: 'Alta',
        status: 'Aberta',
        description: 'Casal investidor busca 3 suites, vista mar e possibilidade de pagamento com entrada forte.',
        author: 'Marina Souza',
        phone: '5547999990001',
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80'],
        createdAt: new Date('2026-05-01T10:00:00').toISOString(),
    },
    {
        id: 'default-2',
        title: 'Co-venda para casa em condominio',
        city: 'Itapema',
        category: 'Parceria/co-venda',
        urgency: 'Media',
        status: 'Em negociacao',
        description: 'Proprietario aceita parceria com corretor que tenha cliente para imovel de alto padrao.',
        author: 'Rafael Mendes',
        phone: '5547999990002',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80'],
        createdAt: new Date('2026-05-02T11:00:00').toISOString(),
    },
    {
        id: 'default-3',
        title: 'Permuta por sala comercial',
        city: 'Camboriu',
        category: 'Permuta',
        urgency: 'Baixa',
        status: 'Aberta',
        description: 'Cliente avalia imovel residencial como parte de pagamento por sala pronta.',
        author: 'Clara Martins',
        phone: '5547999990003',
        images: [],
        createdAt: new Date('2026-05-03T12:00:00').toISOString(),
    },
];

const emptyOpportunityDraft: OpportunityDraft = {
    title: '',
    city: cities[0],
    category: opportunityCategories[0],
    urgency: urgencies[1],
    status: 'Aberta',
    description: '',
    phone: '',
    images: [],
};

const properties: Array<{
    title: string;
    city: string;
    district: string;
    type: string;
    value: string;
    status: PropertyStatus;
    partnership: string;
    photo: string;
}> = [
    {
        title: 'Apartamento 3 suites vista mar',
        city: 'Balneario Camboriu',
        district: 'Barra Sul',
        type: 'Apartamento',
        value: 'R$ 3,8 mi',
        status: 'Disponivel',
        partnership: 'Parceria 50/50',
        photo: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Casa mobiliada em condominio',
        city: 'Itapema',
        district: 'Morretes',
        type: 'Casa',
        value: 'R$ 1,9 mi',
        status: 'Reservado',
        partnership: 'Comissao 5%',
        photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Sala comercial pronta',
        city: 'Camboriu',
        district: 'Centro',
        type: 'Comercial',
        value: 'R$ 690 mil',
        status: 'Disponivel',
        partnership: 'Aberto a parceria',
        photo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    },
];

const members = [
    {
        name: 'Marina Souza',
        type: 'Corretor',
        city: 'Balneario Camboriu',
        specialty: 'Alto padrao e investidores',
        creci: 'CRECI 48291-F',
        avatar: 'MS',
    },
    {
        name: 'Litoral Prime Imoveis',
        type: 'Imobiliaria',
        city: 'Itapema',
        specialty: 'Lancamentos e revenda',
        creci: 'CRECI 7312-J',
        avatar: 'LP',
    },
    {
        name: 'Construtora Atlantico',
        type: 'Construtora',
        city: 'Porto Belo',
        specialty: 'Empreendimentos na planta',
        creci: 'Verificado',
        avatar: 'CA',
    },
    {
        name: 'Studio Vendas Imobiliarias',
        type: 'Parceiro',
        city: 'Camboriu',
        specialty: 'Fotos, videos e trafego',
        creci: 'Parceiro homologado',
        avatar: 'SV',
    },
];

const benefits = [
    {
        title: 'Fotografia profissional para imoveis',
        category: 'Marketing',
        description: 'Pacote com fotos, video curto e entrega otimizada para portais.',
        rule: '10% de desconto para membros ativos do Hub.',
    },
    {
        title: 'Assessoria documental',
        category: 'Juridico',
        description: 'Analise de matricula, contrato e pendencias antes da negociacao.',
        rule: 'Primeira triagem sem custo mediante solicitacao pelo Hub.',
    },
    {
        title: 'Cafe de negocios parceiro',
        category: 'Relacionamento',
        description: 'Espaco para reunioes rapidas com clientes e parceiros na regiao central.',
        rule: 'Apresente seu perfil do Hub para ativar a condicao especial.',
    },
];

const statusStyles: Record<string, string> = {
    Aberta: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Em negociacao': 'border-amber-200 bg-amber-50 text-amber-700',
    Resolvida: 'border-slate-200 bg-slate-50 text-slate-600',
    Disponivel: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Reservado: 'border-amber-200 bg-amber-50 text-amber-700',
    Vendido: 'border-slate-200 bg-slate-50 text-slate-600',
};

function readStoredOpportunities(): Opportunity[] {
    try {
        const stored = localStorage.getItem(OPPORTUNITIES_STORAGE_KEY);
        if (!stored) return defaultOpportunities;

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : defaultOpportunities;
    } catch {
        return defaultOpportunities;
    }
}

function readSavedOpportunityIds(): string[] {
    try {
        const stored = localStorage.getItem(SAVED_OPPORTUNITIES_STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveOpportunities(items: Opportunity[]) {
    try {
        localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            const compactItems = items.map((item) => ({
                ...item,
                images: item.images.slice(0, 1),
            }));

            try {
                localStorage.setItem(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(compactItems));
                return;
            } catch {
                localStorage.setItem(
                    OPPORTUNITIES_STORAGE_KEY,
                    JSON.stringify(compactItems.map((item) => ({ ...item, images: [] }))),
                );
                return;
            }
        }

        throw error;
    }
}

function saveSavedOpportunityIds(ids: string[]) {
    try {
        localStorage.setItem(SAVED_OPPORTUNITIES_STORAGE_KEY, JSON.stringify(ids));
    } catch {
        // Saved ids are a convenience cache. If the browser refuses storage, keep the UI alive.
    }
}

function resizeImageForStorage(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const ratio = Math.min(
                    MAX_STORED_IMAGE_WIDTH / image.width,
                    MAX_STORED_IMAGE_HEIGHT / image.height,
                    1,
                );
                const width = Math.max(1, Math.round(image.width * ratio));
                const height = Math.max(1, Math.round(image.height * ratio));
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) {
                    reject(new Error('Nao foi possivel processar a imagem.'));
                    return;
                }

                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', STORED_IMAGE_QUALITY));
            };

            image.onerror = () => reject(new Error('Imagem invalida.'));
            image.src = String(reader.result);
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Agora';

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function normalizeText(value: string) {
    return value.trim().toLowerCase();
}

function whatsAppLink(phone: string, title: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    const target = cleanPhone || '5547999990000';
    const text = encodeURIComponent(`Ola, vi sua oportunidade no Hub: ${title}`);
    return `https://wa.me/${target}?text=${text}`;
}

function SelectField({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">{label}</span>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-12 w-full rounded-2xl border border-border/80 bg-white px-4 text-sm font-semibold text-text-primary outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

function SearchBox({
    value,
    onChange,
    placeholder,
}: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                placeholder={placeholder}
                className="h-12 w-full rounded-2xl border border-border/80 bg-white pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
            />
        </div>
    );
}

function PageHeader({
    eyebrow,
    title,
    description,
    action,
    onAction,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: string;
    onAction?: () => void;
}) {
    return (
        <section className="rounded-[30px] border border-border/70 bg-surface/95 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)] sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary/75">{eyebrow}</p>
                    <h1 className="mt-2 text-3xl font-display text-text-primary sm:text-4xl">{title}</h1>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">{description}</p>
                </div>
                {action ? (
                    <button
                        type="button"
                        onClick={onAction}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,123,140,0.24)] transition hover:-translate-y-0.5"
                    >
                        <Plus size={17} />
                        {action}
                    </button>
                ) : null}
            </div>
        </section>
    );
}

function OpportunityCard({
    item,
    saved,
    onOpen,
    onSave,
}: {
    item: Opportunity;
    saved: boolean;
    onOpen: (item: Opportunity) => void;
    onSave: (id: string) => void;
}) {
    return (
        <article className="overflow-hidden rounded-[26px] border border-border/70 bg-surface/95 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
            {item.images[0] ? (
                <button type="button" onClick={() => onOpen(item)} className="block aspect-[16/8] w-full overflow-hidden bg-surface-hover">
                    <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" />
                </button>
            ) : null}

            <div className="p-5">
                <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            {item.category}
                        </span>
                        <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[item.status])}>
                            {item.status}
                        </span>
                        <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
                            Urgencia {item.urgency}
                        </span>
                    </div>
                    <h2 className="mt-4 text-xl font-display text-text-primary">{item.title}</h2>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                        <MapPin size={15} className="text-primary" />
                        {item.city}
                    </p>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                        Publicado por {item.author} em {formatDate(item.createdAt)}
                    </p>
                </button>

                <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onOpen(item)} className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">
                        Tenho interesse
                    </button>
                    <a
                        href={whatsAppLink(item.phone, item.title)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary"
                    >
                        <MessageCircle size={16} />
                        Chamar no WhatsApp
                    </a>
                    <button
                        type="button"
                        onClick={() => onSave(item.id)}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold',
                            saved
                                ? 'border-primary/20 bg-primary/10 text-primary'
                                : 'border-border/80 bg-white text-text-secondary',
                        )}
                    >
                        {saved ? <CheckCircle2 size={16} /> : <Bookmark size={16} />}
                        {saved ? 'Salvo' : 'Salvar'}
                    </button>
                </div>
            </div>
        </article>
    );
}

function OpportunityModal({
    item,
    saved,
    onClose,
    onSave,
}: {
    item: Opportunity | null;
    saved: boolean;
    onClose: () => void;
    onSave: (id: string) => void;
}) {
    if (!item) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
                <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Detalhes da oportunidade</p>
                        <h2 className="mt-2 text-2xl font-display text-text-primary">{item.title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 text-text-secondary">
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
                    {item.images.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {item.images.map((image, index) => (
                                <div key={`${item.id}-${index}`} className="aspect-[16/10] overflow-hidden rounded-[22px] bg-surface-hover">
                                    <img src={image} alt={`${item.title} ${index + 1}`} className="h-full w-full object-cover" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-[22px] border border-dashed border-border/80 bg-background/80 p-8 text-center text-sm text-text-secondary">
                            Esta oportunidade foi publicada sem imagens.
                        </div>
                    )}

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            ['Cidade', item.city],
                            ['Categoria', item.category],
                            ['Urgencia', item.urgency],
                            ['Status', item.status],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">{label}</p>
                                <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-[24px] border border-border/70 bg-surface p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">Descricao</p>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-primary/15 bg-primary/[0.06] p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Publicado por</p>
                        <p className="mt-2 text-lg font-semibold text-text-primary">{item.author}</p>
                        <p className="mt-1 text-sm text-text-secondary">Publicado em {formatDate(item.createdAt)}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <a
                            href={whatsAppLink(item.phone, item.title)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-white"
                        >
                            <MessageCircle size={17} />
                            Falar com quem publicou
                        </a>
                        <button
                            type="button"
                            onClick={() => onSave(item.id)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-5 text-sm font-semibold text-primary"
                        >
                            {saved ? <CheckCircle2 size={17} /> : <Bookmark size={17} />}
                            {saved ? 'Oportunidade salva' : 'Salvar oportunidade'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function OpportunityCreateModal({
    open,
    draft,
    onClose,
    onChange,
    onSubmit,
}: {
    open: boolean;
    draft: OpportunityDraft;
    onClose: () => void;
    onChange: (draft: OpportunityDraft) => void;
    onSubmit: () => void;
}) {
    if (!open) return null;

    const handleImages = async (files: FileList | null) => {
        if (!files?.length) return;

        const availableSlots = Math.max(4 - draft.images.length, 0);
        const selected = Array.from(files)
            .filter((file) => file.type.startsWith('image/'))
            .slice(0, availableSlots);

        try {
            const encoded = await Promise.all(selected.map((file) => resizeImageForStorage(file)));
            onChange({ ...draft, images: [...draft.images, ...encoded].slice(0, 4) });
        } catch {
            window.alert('Nao foi possivel processar uma das imagens. Tente outra foto.');
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]">
                <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">Nova oportunidade</p>
                        <h2 className="mt-2 text-2xl font-display text-text-primary">Publicar no mural do Hub</h2>
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/80 text-text-secondary">
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="md:col-span-2">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">Titulo</span>
                            <input
                                value={draft.title}
                                onChange={(event) => onChange({ ...draft, title: event.target.value })}
                                placeholder="Ex: Cliente procura apartamento ate R$ 900 mil"
                                className="h-12 w-full rounded-2xl border border-border/80 bg-white px-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <SelectField
                            label="Categoria"
                            value={draft.category}
                            onChange={(category) => onChange({ ...draft, category })}
                            options={opportunityCategories.map((category) => ({ value: category, label: category }))}
                        />
                        <SelectField
                            label="Cidade"
                            value={draft.city}
                            onChange={(city) => onChange({ ...draft, city })}
                            options={cities.map((city) => ({ value: city, label: city }))}
                        />
                        <SelectField
                            label="Urgencia"
                            value={draft.urgency}
                            onChange={(urgency) => onChange({ ...draft, urgency })}
                            options={urgencies.map((urgency) => ({ value: urgency, label: urgency }))}
                        />
                        <SelectField
                            label="Status"
                            value={draft.status}
                            onChange={(status) => onChange({ ...draft, status: status as OpportunityStatus })}
                            options={opportunityStatuses.map((status) => ({ value: status, label: status }))}
                        />

                        <label className="md:col-span-2">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">WhatsApp para contato</span>
                            <input
                                value={draft.phone}
                                onChange={(event) => onChange({ ...draft, phone: event.target.value })}
                                placeholder="Ex: 47 99999-9999"
                                className="h-12 w-full rounded-2xl border border-border/80 bg-white px-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>

                        <label className="md:col-span-2">
                            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">Descricao</span>
                            <textarea
                                rows={5}
                                value={draft.description}
                                onChange={(event) => onChange({ ...draft, description: event.target.value })}
                                placeholder="Explique o que voce precisa, detalhes do cliente, valor, bairro, parceria ou condicao."
                                className="w-full resize-none rounded-2xl border border-border/80 bg-white px-4 py-3 text-sm leading-7 text-text-primary outline-none transition focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
                            />
                        </label>
                    </div>

                    <section className="mt-5 rounded-[24px] border border-border/70 bg-background/80 p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Imagens da oportunidade</p>
                                <p className="mt-1 text-sm text-text-secondary">Adicione ate 4 imagens para dar contexto ao mural.</p>
                            </div>
                            <label className={cn(
                                'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition',
                                draft.images.length >= 4
                                    ? 'pointer-events-none border-border/70 bg-surface text-text-muted'
                                    : 'border-primary/20 bg-primary/10 text-primary hover:border-primary/35',
                            )}>
                                <ImagePlus size={16} />
                                Adicionar imagens
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(event) => {
                                        handleImages(event.target.files);
                                        event.target.value = '';
                                    }}
                                />
                            </label>
                        </div>

                        {draft.images.length > 0 ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-4">
                                {draft.images.map((image, index) => (
                                    <div key={`${image.slice(0, 18)}-${index}`} className="group relative aspect-square overflow-hidden rounded-2xl bg-surface-hover">
                                        <img src={image} alt={`Imagem ${index + 1}`} className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => onChange({ ...draft, images: draft.images.filter((_, imageIndex) => imageIndex !== index) })}
                                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </section>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} className="h-12 rounded-2xl border border-border/80 px-5 text-sm font-semibold text-text-secondary">
                            Cancelar
                        </button>
                        <button type="button" onClick={onSubmit} className="h-12 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white">
                            Publicar oportunidade
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PropertyCard({ item }: { item: (typeof properties)[number] }) {
    return (
        <article className="overflow-hidden rounded-[26px] border border-border/70 bg-surface/95 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
            <div className="aspect-[16/9] overflow-hidden bg-surface-hover">
                <img src={item.photo} alt={item.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[item.status])}>
                        {item.status}
                    </span>
                    <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
                        {item.type}
                    </span>
                </div>
                <h2 className="mt-4 text-xl font-display text-text-primary">{item.title}</h2>
                <p className="mt-2 text-sm text-text-secondary">{item.city} / {item.district}</p>
                <p className="mt-4 text-2xl font-display text-text-primary">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-primary">{item.partnership}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                    <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">Tenho cliente</button>
                    <button className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">
                        <MessageCircle size={16} />
                        WhatsApp
                    </button>
                    <button className="rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-secondary">Ver detalhes</button>
                </div>
            </div>
        </article>
    );
}

function useBrokerAccessGuard() {
    const { user } = useAuth();
    return { user, blocked: isConstrutoraUser(user) };
}

function useOpportunitiesStore() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>(() => readStoredOpportunities());
    const [savedIds, setSavedIds] = useState<string[]>(() => readSavedOpportunityIds());

    useEffect(() => saveOpportunities(opportunities), [opportunities]);
    useEffect(() => saveSavedOpportunityIds(savedIds), [savedIds]);

    const addOpportunity = (draft: OpportunityDraft, author: string) => {
        const next: Opportunity = {
            id: `opportunity-${Date.now()}`,
            title: draft.title.trim(),
            city: draft.city,
            category: draft.category,
            urgency: draft.urgency,
            status: draft.status,
            description: draft.description.trim(),
            author,
            phone: draft.phone.trim(),
            images: draft.images,
            createdAt: new Date().toISOString(),
        };

        setOpportunities((current) => [next, ...current]);
        return next;
    };

    const toggleSaved = (id: string) => {
        setSavedIds((current) => current.includes(id)
            ? current.filter((savedId) => savedId !== id)
            : [id, ...current]);
    };

    return { opportunities, savedIds, addOpportunity, toggleSaved };
}

export function BrokerHome() {
    const { blocked } = useBrokerAccessGuard();
    const { opportunities, savedIds, toggleSaved } = useOpportunitiesStore();
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-7 pb-6">
            <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(4,19,31,0.98),rgba(8,72,88,0.94))] p-7 text-white shadow-[0_28px_70px_rgba(8,23,38,0.24)] sm:p-9">
                <div className="relative max-w-4xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#A5E8E0]">Hub Corretores do Litoral SC</p>
                    <h1 className="mt-4 text-4xl font-display leading-tight sm:text-5xl">Central de negocios da comunidade</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                        Publique oportunidades, encontre imoveis e conecte-se com corretores do litoral em um so lugar.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/oportunidades" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#062133]">
                            <Plus size={17} />
                            Publicar Oportunidade
                        </Link>
                        <Link to="/imoveis" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/18 bg-white/[0.08] px-5 text-sm font-semibold text-white">
                            <Plus size={17} />
                            Publicar Imovel
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Oportunidades abertas', value: opportunities.filter((item) => item.status === 'Aberta').length.toString(), icon: Sparkles },
                    { label: 'Imoveis divulgados', value: '124', icon: Home },
                    { label: 'Membros ativos', value: '12.800+', icon: Users },
                    { label: 'Beneficios parceiros', value: '150+', icon: Gift },
                ].map((item) => {
                    const Icon = item.icon;
                    return (
                        <article key={item.label} className="rounded-[26px] border border-border/70 bg-surface/95 p-5 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Icon size={20} />
                            </div>
                            <p className="mt-5 text-3xl font-display text-text-primary">{item.value}</p>
                            <p className="mt-1 text-sm font-semibold text-text-secondary">{item.label}</p>
                        </article>
                    );
                })}
            </section>

            <section className="rounded-[28px] border border-primary/15 bg-primary/[0.06] p-5">
                <p className="text-lg font-display text-text-primary">
                    No WhatsApp a oportunidade se perde. No Hub ela fica organizada, filtravel e facil de encontrar.
                </p>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-display text-text-primary">Oportunidades recentes</h2>
                        <Link to="/oportunidades" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Ver todas <ArrowRight size={16} />
                        </Link>
                    </div>
                    {opportunities.slice(0, 2).map((item) => (
                        <OpportunityCard
                            key={item.id}
                            item={item}
                            saved={savedIds.includes(item.id)}
                            onOpen={setSelectedOpportunity}
                            onSave={toggleSaved}
                        />
                    ))}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-display text-text-primary">Imoveis recentes</h2>
                        <Link to="/imoveis" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                    {properties.slice(0, 2).map((item) => <PropertyCard key={item.title} item={item} />)}
                </div>
            </section>

            <OpportunityModal
                item={selectedOpportunity}
                saved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
                onClose={() => setSelectedOpportunity(null)}
                onSave={toggleSaved}
            />
        </div>
    );
}

export function BrokerOpportunities() {
    const { user, blocked } = useBrokerAccessGuard();
    const { opportunities, savedIds, addOpportunity, toggleSaved } = useOpportunitiesStore();
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [draft, setDraft] = useState<OpportunityDraft>(emptyOpportunityDraft);
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredOpportunities = useMemo(() => {
        const query = normalizeText(searchQuery);

        return opportunities.filter((item) => {
            const matchesSearch = !query || [
                item.title,
                item.city,
                item.category,
                item.description,
                item.author,
            ].join(' ').toLowerCase().includes(query);

            return (
                matchesSearch &&
                (cityFilter === 'all' || item.city === cityFilter) &&
                (categoryFilter === 'all' || item.category === categoryFilter) &&
                (urgencyFilter === 'all' || item.urgency === urgencyFilter) &&
                (statusFilter === 'all' || item.status === statusFilter)
            );
        });
    }, [categoryFilter, cityFilter, opportunities, searchQuery, statusFilter, urgencyFilter]);

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = () => {
        if (!draft.title.trim() || !draft.description.trim()) {
            window.alert('Preencha titulo e descricao para publicar a oportunidade.');
            return;
        }

        const created = addOpportunity(draft, user?.name || 'Membro Hub');
        setDraft(emptyOpportunityDraft);
        setShowCreateModal(false);
        setSelectedOpportunity(created);
    };

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Negocios da comunidade"
                title="Oportunidades"
                description="Publique demandas, encontre parceiros e acompanhe oportunidades sem depender da memoria dos grupos."
                action="Publicar Oportunidade"
                onAction={() => setShowCreateModal(true)}
            />

            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
                    <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por cidade, cliente, imovel ou parceiro" />
                    <SelectField
                        label="Cidade"
                        value={cityFilter}
                        onChange={setCityFilter}
                        options={[{ value: 'all', label: 'Todas' }, ...cities.map((city) => ({ value: city, label: city }))]}
                    />
                    <SelectField
                        label="Categoria"
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        options={[{ value: 'all', label: 'Todas' }, ...opportunityCategories.map((category) => ({ value: category, label: category }))]}
                    />
                    <SelectField
                        label="Urgencia"
                        value={urgencyFilter}
                        onChange={setUrgencyFilter}
                        options={[{ value: 'all', label: 'Todas' }, ...urgencies.map((urgency) => ({ value: urgency, label: urgency }))]}
                    />
                    <SelectField
                        label="Status"
                        value={statusFilter}
                        onChange={setStatusFilter}
                        options={[{ value: 'all', label: 'Todos' }, ...opportunityStatuses.map((status) => ({ value: status, label: status }))]}
                    />
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                {filteredOpportunities.map((item) => (
                    <OpportunityCard
                        key={item.id}
                        item={item}
                        saved={savedIds.includes(item.id)}
                        onOpen={setSelectedOpportunity}
                        onSave={toggleSaved}
                    />
                ))}
            </section>

            {filteredOpportunities.length === 0 ? (
                <section className="rounded-[26px] border border-dashed border-border/80 bg-surface/90 p-8 text-center">
                    <p className="text-lg font-semibold text-text-primary">Nenhuma oportunidade encontrada</p>
                    <p className="mt-2 text-sm text-text-secondary">Ajuste os filtros ou publique uma nova oportunidade.</p>
                </section>
            ) : null}

            <OpportunityCreateModal
                open={showCreateModal}
                draft={draft}
                onClose={() => setShowCreateModal(false)}
                onChange={setDraft}
                onSubmit={handleSubmit}
            />
            <OpportunityModal
                item={selectedOpportunity}
                saved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
                onClose={() => setSelectedOpportunity(null)}
                onSave={toggleSaved}
            />
        </div>
    );
}

export function BrokerSavedOpportunities() {
    const { blocked } = useBrokerAccessGuard();
    const { opportunities, savedIds, toggleSaved } = useOpportunitiesStore();
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
    const savedOpportunities = opportunities.filter((item) => savedIds.includes(item.id));

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Favoritos"
                title="Salvos"
                description="Consulte rapidamente as oportunidades que voce separou para responder depois."
            />

            {savedOpportunities.length > 0 ? (
                <section className="grid gap-4 xl:grid-cols-2">
                    {savedOpportunities.map((item) => (
                        <OpportunityCard
                            key={item.id}
                            item={item}
                            saved
                            onOpen={setSelectedOpportunity}
                            onSave={toggleSaved}
                        />
                    ))}
                </section>
            ) : (
                <section className="rounded-[26px] border border-dashed border-border/80 bg-surface/90 p-8 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Bookmark size={22} />
                    </div>
                    <p className="mt-5 text-lg font-semibold text-text-primary">Nenhuma oportunidade salva ainda</p>
                    <p className="mt-2 text-sm text-text-secondary">Quando voce salvar uma oportunidade, ela aparece aqui.</p>
                    <Link to="/oportunidades" className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-white">
                        Ver oportunidades
                    </Link>
                </section>
            )}

            <OpportunityModal
                item={selectedOpportunity}
                saved={selectedOpportunity ? savedIds.includes(selectedOpportunity.id) : false}
                onClose={() => setSelectedOpportunity(null)}
                onSave={toggleSaved}
            />
        </div>
    );
}

export function BrokerProperties() {
    const { blocked } = useBrokerAccessGuard();

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Vitrine pratica"
                title="Imoveis"
                description="Divulgue imoveis com contexto comercial e encontre ativos prontos para apresentar aos seus clientes."
                action="Publicar Imovel"
            />
            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="grid gap-4 xl:grid-cols-4">
                    <SearchBox placeholder="Buscar por cidade, bairro, tipo ou valor" />
                    <SelectField label="Cidade" value="all" onChange={() => { }} options={[{ value: 'all', label: 'Todas' }, ...cities.map((city) => ({ value: city, label: city }))]} />
                    <SelectField label="Tipo" value="all" onChange={() => { }} options={[{ value: 'all', label: 'Todos' }, 'Apartamento', 'Casa', 'Comercial', 'Terreno', 'Rural'].map((item) => typeof item === 'string' ? { value: item, label: item } : item)} />
                    <SelectField label="Status" value="all" onChange={() => { }} options={[{ value: 'all', label: 'Todos' }, 'Disponivel', 'Reservado', 'Vendido'].map((item) => typeof item === 'string' ? { value: item, label: item } : item)} />
                </div>
            </section>
            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {properties.map((item) => <PropertyCard key={item.title} item={item} />)}
            </section>
        </div>
    );
}

export function BrokerMembers() {
    const { blocked } = useBrokerAccessGuard();

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Rede do litoral"
                title="Membros"
                description="Encontre corretores, imobiliarias, construtoras e parceiros em uma busca unica e simples."
            />
            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                    <SearchBox placeholder="Buscar por nome, cidade ou especialidade" />
                    <SelectField
                        label="Tipo"
                        value="all"
                        onChange={() => { }}
                        options={[{ value: 'all', label: 'Todos' }, 'Corretor', 'Imobiliaria', 'Parceiro', 'Construtora'].map((item) => typeof item === 'string' ? { value: item, label: item } : item)}
                    />
                </div>
            </section>
            <section className="grid gap-4 lg:grid-cols-2">
                {members.map((member) => (
                    <article key={member.name} className="rounded-[26px] border border-border/70 bg-surface/95 p-5 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-sm font-bold text-white">
                                {member.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-display text-text-primary">{member.name}</h2>
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        <BadgeCheck size={13} />
                                        Verificado
                                    </span>
                                </div>
                                <p className="mt-2 text-sm font-semibold text-primary">{member.type}</p>
                                <p className="mt-2 text-sm text-text-secondary">{member.city} · {member.specialty}</p>
                                <p className="mt-2 text-sm text-text-secondary">{member.creci}</p>
                            </div>
                        </div>
                        <button className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 text-sm font-semibold text-primary">
                            <MessageCircle size={16} />
                            WhatsApp
                        </button>
                    </article>
                ))}
            </section>
        </div>
    );
}

export function BrokerBenefits() {
    const { blocked } = useBrokerAccessGuard();

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Clube simplificado"
                title="Beneficios"
                description="Acesse parceiros e vantagens uteis para a rotina comercial do corretor."
            />
            <section className="grid gap-4 lg:grid-cols-3">
                {benefits.map((benefit) => (
                    <article key={benefit.title} className="rounded-[26px] border border-border/70 bg-surface/95 p-5 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                            <HeartHandshake size={20} />
                        </div>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">{benefit.category}</p>
                        <h2 className="mt-2 text-xl font-display text-text-primary">{benefit.title}</h2>
                        <p className="mt-3 text-sm leading-7 text-text-secondary">{benefit.description}</p>
                        <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Regra de uso</p>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">{benefit.rule}</p>
                        </div>
                        <button className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white">
                            Solicitar
                        </button>
                    </article>
                ))}
            </section>
        </div>
    );
}

export function BrokerProfile() {
    const { user, blocked } = useBrokerAccessGuard();
    const profileUser = user as typeof user & { personalPhone?: string; companyPhone?: string };

    if (blocked) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Meu Perfil"
                title="Presenca profissional no Hub"
                description="Mantenha seus dados principais claros para ser encontrado por oportunidades e parceiros."
            />
            <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <article className="rounded-[30px] border border-border/70 bg-surface/95 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)]">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-primary text-3xl font-bold text-white">
                        {(user?.name || 'HC').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <h1 className="mt-5 text-3xl font-display text-text-primary">{user?.name || 'Membro Hub'}</h1>
                    <p className="mt-2 text-sm font-semibold text-primary">Corretor verificado</p>
                    <div className="mt-5 space-y-3 text-sm text-text-secondary">
                        <p className="flex items-center gap-2"><MessageCircle size={16} className="text-primary" /> WhatsApp cadastrado</p>
                        <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Balneario Camboriu</p>
                        <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> CRECI 00000-F</p>
                    </div>
                </article>
                <article className="rounded-[30px] border border-border/70 bg-surface/95 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            ['Nome', user?.name || 'Membro Hub'],
                            ['WhatsApp', profileUser?.personalPhone || profileUser?.companyPhone || 'Adicionar numero'],
                            ['Cidade', 'Balneario Camboriu'],
                            ['CRECI', '00000-F'],
                            ['Tipo de membro', 'Corretor'],
                            ['Especialidades', 'Alto padrao, investidores, lancamentos'],
                        ].map(([label, value]) => (
                            <div key={label} className="rounded-2xl border border-border/70 bg-background/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{label}</p>
                                <p className="mt-2 text-sm font-semibold text-text-primary">{value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 rounded-2xl border border-border/70 bg-background/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Bio curta</p>
                        <p className="mt-2 text-sm leading-7 text-text-secondary">
                            Atuo no litoral catarinense conectando bons imoveis, clientes qualificados e parcerias comerciais com outros membros do Hub.
                        </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link to="/oportunidades" className="rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">Minhas oportunidades</Link>
                        <Link to="/imoveis" className="rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">Meus imoveis</Link>
                        <Link to="/salvos" className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            <Bookmark size={16} />
                            Oportunidades salvas
                        </Link>
                        <Link to="/membros" className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                            <UserCircle2 size={16} />
                            Ver membros
                        </Link>
                    </div>
                </article>
            </section>
        </div>
    );
}
