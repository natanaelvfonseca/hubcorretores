import {
    BarChart3,
    Building2,
    LayoutDashboard,
    Users,
    type LucideIcon,
} from 'lucide-react';
import {
    getHubModuleByPath,
    hubModuleMap,
    hubNavSections,
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

export function isConstrutoraUser(user?: PortalAwareUser | null) {
    return user?.accountType === 'construtora';
}

function getHubNavigation(): PortalNavSection[] {
    return hubNavSections.map((section) => ({
        title: section.title,
        items: section.items.map((itemId) => {
            const item = hubModuleMap[itemId];
            return {
                id: item.id,
                path: item.path,
                navLabel: item.navLabel,
                eyebrow: item.eyebrow,
                summary: item.summary,
                icon: item.icon,
            };
        }),
    }));
}

export function getVisibleNavigation(user?: PortalAwareUser | null): PortalNavSection[] {
    if (!isConstrutoraUser(user)) {
        return getHubNavigation();
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
