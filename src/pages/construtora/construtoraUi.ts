import type {
    ConstrutoraLeadScore,
    ConstrutoraLeadStatus,
} from '../../data/construtoraMockData';

export function formatPercentage(value: number) {
    return `${value.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}%`;
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
    }).format(value);
}

export function scoreLabel(score: ConstrutoraLeadScore) {
    return score.charAt(0).toUpperCase() + score.slice(1);
}

export function statusLabel(status: ConstrutoraLeadStatus) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export const scoreStyles: Record<ConstrutoraLeadScore, string> = {
    alto: 'border-emerald-200/90 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200',
    medio: 'border-amber-200/90 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200',
    baixo: 'border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-200',
};

export const statusStyles: Record<ConstrutoraLeadStatus, string> = {
    quente: 'border-orange-200/90 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200',
    morno: 'border-yellow-200/90 bg-yellow-50 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-200',
    frio: 'border-sky-200/90 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200',
};
