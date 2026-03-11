export type LeadStatus = string;

export interface Lead {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    company?: string;
    value: number;
    status: LeadStatus;
    lastContact: string;
    avatar?: string;
    tags?: string[];
    source?: string;
    score?: number;
    temperature?: string;
    intentLabel?: 'HOT' | 'WARM' | 'COLD' | null;
    briefing?: string | null;
    assignedTo?: string;
}

export interface KanbanColumn {
    id: LeadStatus;
    title: string;
    leads: Lead[];
}
