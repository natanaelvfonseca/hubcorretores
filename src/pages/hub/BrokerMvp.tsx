import {
    ArrowRight,
    BadgeCheck,
    Bookmark,
    Gift,
    HeartHandshake,
    Home,
    MapPin,
    MessageCircle,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    UserCircle2,
    Users,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isConstrutoraUser } from '../../lib/portalAccess';
import { cn } from '../../utils/cn';

type OpportunityStatus = 'Aberta' | 'Em negociação' | 'Resolvida';
type PropertyStatus = 'Disponível' | 'Reservado' | 'Vendido';

const opportunityCategories = [
    'Cliente comprador',
    'Imóvel disponível',
    'Parceria/co-venda',
    'Permuta',
    'Serviços',
    'Veículos',
    'Cartas/consórcios',
    'Outros negócios',
];

const opportunities: Array<{
    title: string;
    city: string;
    category: string;
    urgency: string;
    status: OpportunityStatus;
    description: string;
    author: string;
}> = [
    {
        title: 'Cliente procura apartamento frente mar',
        city: 'Balneário Camboriú',
        category: 'Cliente comprador',
        urgency: 'Alta',
        status: 'Aberta',
        description: 'Casal investidor busca 3 suítes, vista mar e possibilidade de pagamento com entrada forte.',
        author: 'Marina Souza',
    },
    {
        title: 'Co-venda para casa em condomínio',
        city: 'Itapema',
        category: 'Parceria/co-venda',
        urgency: 'Média',
        status: 'Em negociação',
        description: 'Proprietário aceita parceria com corretor que tenha cliente para imóvel de alto padrão.',
        author: 'Rafael Mendes',
    },
    {
        title: 'Permuta por sala comercial',
        city: 'Camboriú',
        category: 'Permuta',
        urgency: 'Baixa',
        status: 'Aberta',
        description: 'Cliente avalia imóvel residencial como parte de pagamento por sala pronta.',
        author: 'Clara Martins',
    },
];

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
        title: 'Apartamento 3 suítes vista mar',
        city: 'Balneário Camboriú',
        district: 'Barra Sul',
        type: 'Apartamento',
        value: 'R$ 3,8 mi',
        status: 'Disponível',
        partnership: 'Parceria 50/50',
        photo: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Casa mobiliada em condomínio',
        city: 'Itapema',
        district: 'Morretes',
        type: 'Casa',
        value: 'R$ 1,9 mi',
        status: 'Reservado',
        partnership: 'Comissão 5%',
        photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
    },
    {
        title: 'Sala comercial pronta',
        city: 'Camboriú',
        district: 'Centro',
        type: 'Comercial',
        value: 'R$ 690 mil',
        status: 'Disponível',
        partnership: 'Aberto a parceria',
        photo: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80',
    },
];

const members = [
    {
        name: 'Marina Souza',
        type: 'Corretor',
        city: 'Balneário Camboriú',
        specialty: 'Alto padrão e investidores',
        creci: 'CRECI 48291-F',
        avatar: 'MS',
    },
    {
        name: 'Litoral Prime Imóveis',
        type: 'Imobiliária',
        city: 'Itapema',
        specialty: 'Lançamentos e revenda',
        creci: 'CRECI 7312-J',
        avatar: 'LP',
    },
    {
        name: 'Construtora Atlântico',
        type: 'Construtora',
        city: 'Porto Belo',
        specialty: 'Empreendimentos na planta',
        creci: 'Verificado',
        avatar: 'CA',
    },
    {
        name: 'Studio Vendas Imobiliárias',
        type: 'Parceiro',
        city: 'Camboriú',
        specialty: 'Fotos, vídeos e tráfego',
        creci: 'Parceiro homologado',
        avatar: 'SV',
    },
];

const benefits = [
    {
        title: 'Fotografia profissional para imóveis',
        category: 'Marketing',
        description: 'Pacote com fotos, vídeo curto e entrega otimizada para portais.',
        rule: '10% de desconto para membros ativos do Hub.',
    },
    {
        title: 'Assessoria documental',
        category: 'Jurídico',
        description: 'Análise de matrícula, contrato e pendências antes da negociação.',
        rule: 'Primeira triagem sem custo mediante solicitação pelo Hub.',
    },
    {
        title: 'Café de negócios parceiro',
        category: 'Relacionamento',
        description: 'Espaço para reuniões rápidas com clientes e parceiros na região central.',
        rule: 'Apresente seu perfil do Hub para ativar a condição especial.',
    },
];

const statusStyles: Record<string, string> = {
    Aberta: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    'Em negociação': 'border-amber-200 bg-amber-50 text-amber-700',
    Resolvida: 'border-slate-200 bg-slate-50 text-slate-600',
    Disponível: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Reservado: 'border-amber-200 bg-amber-50 text-amber-700',
    Vendido: 'border-slate-200 bg-slate-50 text-slate-600',
};

function FilterBar({ items }: { items: string[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <button
                    key={item}
                    className="rounded-full border border-border/80 bg-surface px-4 py-2 text-xs font-semibold text-text-secondary transition hover:border-primary/30 hover:text-primary"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

function SearchBox({ placeholder }: { placeholder: string }) {
    return (
        <div className="relative min-w-0 flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
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
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: string;
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
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,123,140,0.24)] transition hover:-translate-y-0.5">
                        <Plus size={17} />
                        {action}
                    </button>
                ) : null}
            </div>
        </section>
    );
}

function OpportunityCard({ item }: { item: (typeof opportunities)[number] }) {
    return (
        <article className="rounded-[26px] border border-border/70 bg-surface/95 p-5 shadow-[0_14px_36px_rgba(8,23,38,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {item.category}
                </span>
                <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', statusStyles[item.status])}>
                    {item.status}
                </span>
                <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-semibold text-text-secondary">
                    Urgência {item.urgency}
                </span>
            </div>
            <h2 className="mt-4 text-xl font-display text-text-primary">{item.title}</h2>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <MapPin size={15} className="text-primary" />
                {item.city}
            </p>
            <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Publicado por {item.author}</p>
            <div className="mt-5 flex flex-wrap gap-2">
                <button className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white">Tenho interesse</button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">
                    <MessageCircle size={16} />
                    Chamar no WhatsApp
                </button>
                <button className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-secondary">
                    <Bookmark size={16} />
                    Salvar
                </button>
            </div>
        </article>
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

export function BrokerHome() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-7 pb-6">
            <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(4,19,31,0.98),rgba(8,72,88,0.94))] p-7 text-white shadow-[0_28px_70px_rgba(8,23,38,0.24)] sm:p-9">
                <div className="relative max-w-4xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#A5E8E0]">Hub Corretores do Litoral SC</p>
                    <h1 className="mt-4 text-4xl font-display leading-tight sm:text-5xl">Central de negócios da comunidade</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
                        Publique oportunidades, encontre imóveis e conecte-se com corretores do litoral em um só lugar.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link to="/oportunidades" className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-[#062133]">
                            <Plus size={17} />
                            Publicar Oportunidade
                        </Link>
                        <Link to="/imoveis" className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/18 bg-white/[0.08] px-5 text-sm font-semibold text-white">
                            <Plus size={17} />
                            Publicar Imóvel
                        </Link>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Oportunidades abertas', value: '38', icon: Sparkles },
                    { label: 'Imóveis divulgados', value: '124', icon: Home },
                    { label: 'Membros ativos', value: '12.800+', icon: Users },
                    { label: 'Benefícios parceiros', value: '150+', icon: Gift },
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
                    No WhatsApp a oportunidade se perde. No Hub ela fica organizada, filtrável e fácil de encontrar.
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
                    {opportunities.slice(0, 2).map((item) => <OpportunityCard key={item.title} item={item} />)}
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-display text-text-primary">Imóveis recentes</h2>
                        <Link to="/imoveis" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                            Ver todos <ArrowRight size={16} />
                        </Link>
                    </div>
                    {properties.slice(0, 2).map((item) => <PropertyCard key={item.title} item={item} />)}
                </div>
            </section>
        </div>
    );
}

export function BrokerOpportunities() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Negócios da comunidade"
                title="Oportunidades"
                description="Publique demandas, encontre parceiros e acompanhe oportunidades sem depender da memória dos grupos."
                action="Publicar Oportunidade"
            />
            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchBox placeholder="Buscar por cidade, cliente, imóvel ou parceiro" />
                </div>
                <div className="mt-4 space-y-3">
                    <FilterBar items={['Balneário Camboriú', 'Itapema', 'Camboriú', 'Porto Belo']} />
                    <FilterBar items={opportunityCategories} />
                    <FilterBar items={['Alta', 'Média', 'Baixa', 'Aberta', 'Em negociação', 'Resolvida']} />
                </div>
            </section>
            <section className="grid gap-4 xl:grid-cols-2">
                {opportunities.map((item) => <OpportunityCard key={item.title} item={item} />)}
            </section>
        </div>
    );
}

export function BrokerProperties() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Vitrine prática"
                title="Imóveis"
                description="Divulgue imóveis com contexto comercial e encontre ativos prontos para apresentar aos seus clientes."
                action="Publicar Imóvel"
            />
            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchBox placeholder="Buscar por cidade, bairro, tipo ou valor" />
                </div>
                <div className="mt-4 space-y-3">
                    <FilterBar items={['Balneário Camboriú', 'Itapema', 'Camboriú', 'Porto Belo']} />
                    <FilterBar items={['Apartamento', 'Casa', 'Comercial', 'Terreno', 'Rural']} />
                    <FilterBar items={['Até R$ 700 mil', 'R$ 700 mil a R$ 1,5 mi', 'Acima de R$ 1,5 mi']} />
                    <FilterBar items={['Disponível', 'Reservado', 'Vendido']} />
                </div>
            </section>
            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {properties.map((item) => <PropertyCard key={item.title} item={item} />)}
            </section>
        </div>
    );
}

export function BrokerMembers() {
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Rede do litoral"
                title="Membros"
                description="Encontre corretores, imobiliárias, construtoras e parceiros em uma busca única e simples."
            />
            <section className="rounded-[26px] border border-border/70 bg-surface/95 p-5">
                <div className="flex flex-col gap-3 lg:flex-row">
                    <SearchBox placeholder="Buscar por nome, cidade ou especialidade" />
                </div>
                <div className="mt-4">
                    <FilterBar items={['Corretor', 'Imobiliária', 'Parceiro', 'Construtora']} />
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
    const { user } = useAuth();

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Clube simplificado"
                title="Benefícios"
                description="Acesse parceiros e vantagens úteis para a rotina comercial do corretor."
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
    const { user } = useAuth();
    const profileUser = user as typeof user & { personalPhone?: string; companyPhone?: string };

    if (isConstrutoraUser(user)) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="space-y-6 pb-6">
            <PageHeader
                eyebrow="Meu Perfil"
                title="Presença profissional no Hub"
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
                        <p className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> Balneário Camboriú</p>
                        <p className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> CRECI 00000-F</p>
                    </div>
                </article>
                <article className="rounded-[30px] border border-border/70 bg-surface/95 p-6 shadow-[0_18px_50px_rgba(8,23,38,0.06)]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            ['Nome', user?.name || 'Membro Hub'],
                            ['WhatsApp', profileUser?.personalPhone || profileUser?.companyPhone || 'Adicionar número'],
                            ['Cidade', 'Balneário Camboriú'],
                            ['CRECI', '00000-F'],
                            ['Tipo de membro', 'Corretor'],
                            ['Especialidades', 'Alto padrão, investidores, lançamentos'],
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
                            Atuo no litoral catarinense conectando bons imóveis, clientes qualificados e parcerias comerciais com outros membros do Hub.
                        </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <Link to="/oportunidades" className="rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">Minhas oportunidades</Link>
                        <Link to="/imoveis" className="rounded-2xl border border-border/80 bg-white px-4 py-2 text-sm font-semibold text-text-primary">Meus imóveis</Link>
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
