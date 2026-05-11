import {
    BarChart3,
    Building2,
    Gift,
    Home,
    KanbanSquare,
    LayoutDashboard,
    Sparkles,
    UserCircle2,
    Users,
    type LucideIcon,
} from 'lucide-react';
import {
    getHubModuleByPath,
    type HubModuleDefinition,
} from '../data/hubPlatform';

type PortalAwareUser = {
    accountType?: string | null;
};

export interface PortalNavItem {
    id: string;
    path: string;
    navLabel: string;
    eyebrow: string;
    summary: string;
    icon: LucideIcon;
}

export interface PortalNavSection {
    title: string;
    items: PortalNavItem[];
}

const construtoraNavItems: PortalNavItem[] = [
    {
        id: 'construtora-dashboard',
        path: '/dashboard',
        navLabel: 'Dashboard',
        eyebrow: 'Visao geral',
        summary: 'Boas-vindas ao painel da Construtora Alpha. Aqui voce acompanha a demanda, o atendimento e as vendas em tempo real.',
        icon: LayoutDashboard,
    },
    {
        id: 'construtora-crm',
        path: '/crm-construtora',
        navLabel: 'CRM',
        eyebrow: 'Pipeline de vendas',
        summary: 'Acompanhe onde cada oportunidade esta no processo comercial, do primeiro contato ate a venda fechada.',
        icon: KanbanSquare,
    },
    {
        id: 'construtora-leads',
        path: '/qualificacao-leads',
        navLabel: 'Qualificacao de Leads',
        eyebrow: 'Leads e atendimento',
        summary: 'Acompanhe os leads recebidos, o andamento do atendimento e as conversas que mais importam.',
        icon: BarChart3,
    },
    {
        id: 'construtora-empreendimentos',
        path: '/empreendimentos',
        navLabel: 'Empreendimentos',
        eyebrow: 'Campanhas e vendas',
        summary: 'Veja o desempenho de cada empreendimento e ajuste campanhas e promocoes em poucos cliques.',
        icon: Building2,
    },
    {
        id: 'construtora-corretores',
        path: '/corretores',
        navLabel: 'Corretores',
        eyebrow: 'Atendimento comercial',
        summary: 'Compare o tempo de resposta, os leads recebidos e a conversao do time comercial.',
        icon: Users,
    },
];

const construtoraNavMap = Object.fromEntries(
    construtoraNavItems.map((item) => [item.id, item]),
) as Record<string, PortalNavItem>;

const brokerMvpNavItems: PortalNavItem[] = [
    {
        id: 'broker-home',
        path: '/dashboard',
        navLabel: 'Início',
        eyebrow: 'Central prática',
        summary: 'Publique oportunidades, encontre imóveis e acompanhe os movimentos da comunidade.',
        icon: Home,
    },
    {
        id: 'broker-opportunities',
        path: '/oportunidades',
        navLabel: 'Oportunidades',
        eyebrow: 'Negócios',
        summary: 'Demandas, parcerias, permutas e negócios organizados em cards filtráveis.',
        icon: Sparkles,
    },
    {
        id: 'broker-properties',
        path: '/imoveis',
        navLabel: 'Imóveis',
        eyebrow: 'Vitrine',
        summary: 'Imóveis disponíveis, reservados e vendidos com dados rápidos de parceria.',
        icon: Building2,
    },
    {
        id: 'broker-members',
        path: '/membros',
        navLabel: 'Membros',
        eyebrow: 'Rede',
        summary: 'Corretores, imobiliárias, construtoras e parceiros em uma busca simples.',
        icon: Users,
    },
    {
        id: 'broker-benefits',
        path: '/beneficios',
        navLabel: 'Benefícios',
        eyebrow: 'Parceiros',
        summary: 'Vantagens e parceiros úteis para a rotina comercial do corretor.',
        icon: Gift,
    },
    {
        id: 'broker-profile',
        path: '/perfil',
        navLabel: 'Meu Perfil',
        eyebrow: 'Identidade',
        summary: 'Dados profissionais, WhatsApp, CRECI, especialidades e links rápidos.',
        icon: UserCircle2,
    },
];

export function isConstrutoraUser(user?: PortalAwareUser | null) {
    return user?.accountType === 'construtora';
}

export function getVisibleNavigation(user?: PortalAwareUser | null): PortalNavSection[] {
    if (!isConstrutoraUser(user)) {
        return [
            {
                title: 'Hub',
                items: brokerMvpNavItems,
            },
        ];
    }

    return [
        {
            title: 'Painel',
            items: construtoraNavItems,
        },
    ];
}

export function getPortalItemByPath(
    user: PortalAwareUser | null | undefined,
    pathname: string,
): PortalNavItem | HubModuleDefinition | undefined {
    if (isConstrutoraUser(user)) {
        return construtoraNavItems.find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));
    }

    return getHubModuleByPath(pathname);
}

export function canAccessHubModule(user: PortalAwareUser | null | undefined, moduleId: string) {
    if (!isConstrutoraUser(user)) {
        return true;
    }

    return Boolean(construtoraNavMap[moduleId]);
}
