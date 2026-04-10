import {
    hubNavSections,
    type HubNavSection,
} from '../data/hubPlatform';

type PortalAwareUser = {
    accountType?: string | null;
};

export const CONSTRUTORA_ALLOWED_MODULE_IDS = ['dashboard'] as const;

export function isConstrutoraUser(user?: PortalAwareUser | null) {
    return user?.accountType === 'construtora';
}

export function getVisibleHubNavSections(user?: PortalAwareUser | null): HubNavSection[] {
    if (!isConstrutoraUser(user)) {
        return hubNavSections;
    }

    return [
        {
            title: 'Executivo',
            items: ['dashboard'],
        },
    ];
}

export function canAccessHubModule(user: PortalAwareUser | null | undefined, moduleId: string) {
    if (!isConstrutoraUser(user)) {
        return true;
    }

    return CONSTRUTORA_ALLOWED_MODULE_IDS.includes(moduleId as (typeof CONSTRUTORA_ALLOWED_MODULE_IDS)[number]);
}
