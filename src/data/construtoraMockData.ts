export type ConstrutoraLeadScore = 'alto' | 'medio' | 'baixo';
export type ConstrutoraLeadStatus = 'quente' | 'morno' | 'frio';
export type EmpreendimentoStatus = 'Lancamento' | 'Em vendas' | 'Finalizado';

export interface ConstrutoraMockUser {
    id: string;
    email: string;
    name: string;
    role: 'user';
    accountType: 'construtora';
    accountStatus: 'premium';
    companyType: 'Construtora';
    construtora_id: string;
    accessible_empreendimento_ids: string[];
    organization: {
        id: string;
        name: string;
        planType: 'enterprise';
        whatsapp_connections_limit: number;
    };
}

export interface ConstrutoraEntity {
    id: string;
    nome: string;
    tipo: 'Construtora';
    email: string;
    status: 'Premium';
}

export interface LeadOriginMetric {
    origem: string;
    total: number;
}

export interface FunnelStep {
    id: string;
    label: string;
    total: number;
}

export interface EmpreendimentoEntity {
    id: string;
    construtora_id: string;
    nome: string;
    status: EmpreendimentoStatus;
    observacoes: string;
    leads_gerados: number;
    leads_qualificados: number;
    em_atendimento: number;
    vendas: number;
    taxa_conversao: number;
    investimento_trafego: number;
    custo_por_lead: number;
    tempo_medio_qualificacao_min: number;
    tempo_medio_atendimento_min: number;
    tempo_medio_fechamento_dias: number;
    funil: FunnelStep[];
    origens: LeadOriginMetric[];
}

export interface CorretorPerformanceEntity {
    id: string;
    construtora_id: string;
    empreendimento_id: string;
    nome: string;
    leads_recebidos: number;
    tempo_resposta_min: number;
    conversao: number;
}

export interface LeadEntity {
    id: string;
    nome: string;
    construtora_id: string;
    empreendimento_id: string;
    corretor_nome: string;
    interesse: string;
    regiao: string;
    origem: string;
    score: ConstrutoraLeadScore;
    status: ConstrutoraLeadStatus;
    ultima_atualizacao: string;
}

export interface ConversationThreadEntity {
    id: string;
    lead_id: string;
    empreendimento_id: string;
    resumo: string;
}

export interface ConversationMessageEntity {
    id: string;
    conversa_id: string;
    autor: 'lead' | 'atendimento';
    texto: string;
    enviado_em: string;
}

export interface ConstrutoraPresentationData {
    viewer: ConstrutoraMockUser;
    construtora: ConstrutoraEntity;
    activeEmpreendimento: EmpreendimentoEntity;
    accessibleEmpreendimentos: EmpreendimentoEntity[];
    overview: {
        leadsGerados: number;
        leadsQualificados: number;
        emAtendimento: number;
        vendasEstimadas: number;
        taxaConversao: number;
    };
    funnel: Array<FunnelStep & { ratio: number }>;
    leadMetrics: {
        origens: LeadOriginMetric[];
        tempoMedioQualificacaoMin: number;
        tempoMedioAtendimentoMin: number;
        tempoMedioFechamentoDias: number;
        investimentoTrafego: number;
        custoPorLead: number;
    };
    leads: LeadEntity[];
    corretores: CorretorPerformanceEntity[];
    conversationsByLeadId: Record<
        string,
        {
            thread: ConversationThreadEntity;
            messages: ConversationMessageEntity[];
        }
    >;
}

export const CONSTRUTORA_LOGIN_EMAIL = 'alpha@demo.com';
export const CONSTRUTORA_LOGIN_PASSWORD = 'Alpha@123';
export const CONSTRUTORA_LOGIN_PASSWORDS = [CONSTRUTORA_LOGIN_PASSWORD, 'demo'];
export const CONSTRUTORA_LOGIN_TOKEN = 'construtora-alpha-session';

export const construtoraAlphaUser: ConstrutoraMockUser = {
    id: 'user_const_001',
    email: CONSTRUTORA_LOGIN_EMAIL,
    name: 'Construtora Alpha',
    role: 'user',
    accountType: 'construtora',
    accountStatus: 'premium',
    companyType: 'Construtora',
    construtora_id: 'const_001',
    accessible_empreendimento_ids: ['emp_001', 'emp_002'],
    organization: {
        id: 'org_const_001',
        name: 'Construtora Alpha',
        planType: 'enterprise',
        whatsapp_connections_limit: 1,
    },
};

const construtora: ConstrutoraEntity = {
    id: 'const_001',
    nome: 'Construtora Alpha',
    tipo: 'Construtora',
    email: CONSTRUTORA_LOGIN_EMAIL,
    status: 'Premium',
};

const empreendimentos: EmpreendimentoEntity[] = [
    {
        id: 'emp_001',
        construtora_id: 'const_001',
        nome: 'Residencial Vista Mar',
        status: 'Em vendas',
        observacoes: 'Campanha principal com foco em apartamentos de 2 e 3 quartos.',
        leads_gerados: 384,
        leads_qualificados: 127,
        em_atendimento: 52,
        vendas: 18,
        taxa_conversao: 14.1,
        investimento_trafego: 8500,
        custo_por_lead: 22,
        tempo_medio_qualificacao_min: 3,
        tempo_medio_atendimento_min: 5,
        tempo_medio_fechamento_dias: 12,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 384 },
            { id: 'qualificados', label: 'Leads qualificados', total: 127 },
            { id: 'atendidos', label: 'Atendidos', total: 89 },
            { id: 'visitas', label: 'Visitas', total: 46 },
            { id: 'propostas', label: 'Propostas', total: 28 },
            { id: 'vendas', label: 'Vendas', total: 18 },
        ],
        origens: [
            { origem: 'Meta Ads', total: 172 },
            { origem: 'Google', total: 104 },
            { origem: 'Indicacao', total: 108 },
        ],
    },
    {
        id: 'emp_002',
        construtora_id: 'const_001',
        nome: 'Torre Azul',
        status: 'Lancamento',
        observacoes: 'Projeto com alta procura nas primeiras semanas de divulgacao.',
        leads_gerados: 218,
        leads_qualificados: 74,
        em_atendimento: 29,
        vendas: 11,
        taxa_conversao: 14.9,
        investimento_trafego: 6100,
        custo_por_lead: 28,
        tempo_medio_qualificacao_min: 4,
        tempo_medio_atendimento_min: 6,
        tempo_medio_fechamento_dias: 15,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 218 },
            { id: 'qualificados', label: 'Leads qualificados', total: 74 },
            { id: 'atendidos', label: 'Atendidos', total: 51 },
            { id: 'visitas', label: 'Visitas', total: 24 },
            { id: 'propostas', label: 'Propostas', total: 16 },
            { id: 'vendas', label: 'Vendas', total: 11 },
        ],
        origens: [
            { origem: 'Meta Ads', total: 96 },
            { origem: 'Google', total: 62 },
            { origem: 'Indicacao', total: 60 },
        ],
    },
];

const corretores: CorretorPerformanceEntity[] = [
    {
        id: 'cor_perf_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Carlos Mendes',
        leads_recebidos: 32,
        tempo_resposta_min: 2,
        conversao: 18,
    },
    {
        id: 'cor_perf_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Ana Souza',
        leads_recebidos: 21,
        tempo_resposta_min: 5,
        conversao: 12,
    },
    {
        id: 'cor_perf_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Rafael Lima',
        leads_recebidos: 18,
        tempo_resposta_min: 8,
        conversao: 9,
    },
    {
        id: 'cor_perf_004',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        nome: 'Bruna Alves',
        leads_recebidos: 19,
        tempo_resposta_min: 4,
        conversao: 13,
    },
    {
        id: 'cor_perf_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        nome: 'Thiago Rocha',
        leads_recebidos: 15,
        tempo_resposta_min: 7,
        conversao: 10,
    },
];

const leads: LeadEntity[] = [
    {
        id: 'lead_001',
        nome: 'Joao Silva',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Itapema',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        ultima_atualizacao: 'Quer visitar neste sabado e pediu simulacao de entrada.',
    },
    {
        id: 'lead_002',
        nome: 'Mariana Costa',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_nome: 'Ana Souza',
        interesse: 'Cobertura com vista mar',
        regiao: 'Meia Praia',
        origem: 'Google',
        score: 'medio',
        status: 'morno',
        ultima_atualizacao: 'Esta avaliando parcelamento maior na entrada.',
    },
    {
        id: 'lead_003',
        nome: 'Eduardo Ramos',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Apartamento 3 suites',
        regiao: 'Itapema',
        origem: 'Indicacao',
        score: 'alto',
        status: 'quente',
        ultima_atualizacao: 'Perfil investidor com interesse em locacao por temporada.',
    },
    {
        id: 'lead_004',
        nome: 'Patricia Almeida',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_nome: 'Rafael Lima',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Porto Belo',
        origem: 'Meta Ads',
        score: 'baixo',
        status: 'frio',
        ultima_atualizacao: 'Ainda esta comparando opcoes antes de agendar atendimento.',
    },
    {
        id: 'lead_005',
        nome: 'Fernanda Oliveira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_nome: 'Ana Souza',
        interesse: 'Apartamento com varanda gourmet',
        regiao: 'Itapema',
        origem: 'Google',
        score: 'medio',
        status: 'morno',
        ultima_atualizacao: 'Pediu material completo e prazo de entrega.',
    },
    {
        id: 'lead_006',
        nome: 'Ricardo Brito',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_nome: 'Bruna Alves',
        interesse: 'Loft premium',
        regiao: 'Balneario Pereque',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        ultima_atualizacao: 'Quer receber tabela de condicoes e visita guiada.',
    },
    {
        id: 'lead_007',
        nome: 'Camila Nunes',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_nome: 'Thiago Rocha',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Porto Belo',
        origem: 'Indicacao',
        score: 'medio',
        status: 'morno',
        ultima_atualizacao: 'Gostou da localizacao e pediu retorno no fim do dia.',
    },
    {
        id: 'lead_008',
        nome: 'Leonardo Prado',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_nome: 'Bruna Alves',
        interesse: 'Cobertura duplex',
        regiao: 'Itajai',
        origem: 'Google',
        score: 'alto',
        status: 'quente',
        ultima_atualizacao: 'Ja tem verba aprovada e quer conhecer unidades finais.',
    },
];

const conversationThreads: ConversationThreadEntity[] = [
    {
        id: 'conv_001',
        lead_id: 'lead_001',
        empreendimento_id: 'emp_001',
        resumo: 'Lead pronto para visita e com boa chance de avancar para proposta.',
    },
    {
        id: 'conv_002',
        lead_id: 'lead_002',
        empreendimento_id: 'emp_001',
        resumo: 'Lead comparando formas de pagamento antes de marcar atendimento.',
    },
    {
        id: 'conv_003',
        lead_id: 'lead_003',
        empreendimento_id: 'emp_001',
        resumo: 'Investidor interessado em retorno com locacao por temporada.',
    },
    {
        id: 'conv_004',
        lead_id: 'lead_006',
        empreendimento_id: 'emp_002',
        resumo: 'Lead pediu tabela atualizada e visita ao decorado.',
    },
    {
        id: 'conv_005',
        lead_id: 'lead_008',
        empreendimento_id: 'emp_002',
        resumo: 'Cliente com interesse forte na cobertura e bom prazo de decisao.',
    },
];

const conversationMessages: ConversationMessageEntity[] = [
    {
        id: 'msg_001',
        conversa_id: 'conv_001',
        autor: 'lead',
        texto: 'Oi, vi o anuncio do Vista Mar e queria entender melhor as unidades de 2 quartos.',
        enviado_em: '2026-04-09T09:12:00-03:00',
    },
    {
        id: 'msg_002',
        conversa_id: 'conv_001',
        autor: 'atendimento',
        texto: 'Claro. Voce busca um apartamento para morar ou para investir?',
        enviado_em: '2026-04-09T09:13:00-03:00',
    },
    {
        id: 'msg_003',
        conversa_id: 'conv_001',
        autor: 'lead',
        texto: 'Para morar. Quero algo perto do mar e consigo visitar no sabado.',
        enviado_em: '2026-04-09T09:15:00-03:00',
    },
    {
        id: 'msg_004',
        conversa_id: 'conv_001',
        autor: 'atendimento',
        texto: 'Perfeito. Vou te enviar as melhores opcoes e deixar a visita alinhada com o corretor.',
        enviado_em: '2026-04-09T09:16:00-03:00',
    },
    {
        id: 'msg_005',
        conversa_id: 'conv_002',
        autor: 'lead',
        texto: 'Quero saber se a cobertura aceita entrada parcelada.',
        enviado_em: '2026-04-08T15:04:00-03:00',
    },
    {
        id: 'msg_006',
        conversa_id: 'conv_002',
        autor: 'atendimento',
        texto: 'Aceita sim. Se voce quiser, eu te mostro as condicoes e ja te encaminho para o corretor.',
        enviado_em: '2026-04-08T15:06:00-03:00',
    },
    {
        id: 'msg_007',
        conversa_id: 'conv_003',
        autor: 'lead',
        texto: 'Estou olhando o Vista Mar para investir. Como esta a procura na regiao?',
        enviado_em: '2026-04-09T11:02:00-03:00',
    },
    {
        id: 'msg_008',
        conversa_id: 'conv_003',
        autor: 'atendimento',
        texto: 'A procura esta forte. Posso te mostrar as plantas com melhor potencial para temporada.',
        enviado_em: '2026-04-09T11:04:00-03:00',
    },
    {
        id: 'msg_009',
        conversa_id: 'conv_004',
        autor: 'lead',
        texto: 'Gostei da Torre Azul. Voces conseguem me mandar a tabela?',
        enviado_em: '2026-04-10T08:20:00-03:00',
    },
    {
        id: 'msg_010',
        conversa_id: 'conv_004',
        autor: 'atendimento',
        texto: 'Consigo sim. Ja vou te enviar as condicoes e posso deixar uma visita reservada.',
        enviado_em: '2026-04-10T08:21:00-03:00',
    },
    {
        id: 'msg_011',
        conversa_id: 'conv_005',
        autor: 'lead',
        texto: 'Tenho interesse na cobertura da Torre Azul. Ainda esta disponivel?',
        enviado_em: '2026-04-10T10:03:00-03:00',
    },
    {
        id: 'msg_012',
        conversa_id: 'conv_005',
        autor: 'atendimento',
        texto: 'Sim, esta disponivel. Posso te passar as opcoes e deixar o atendimento com a corretora.',
        enviado_em: '2026-04-10T10:04:00-03:00',
    },
];

function getAccessibleEmpreendimentos() {
    return empreendimentos.filter((empreendimento) =>
        construtoraAlphaUser.accessible_empreendimento_ids.includes(empreendimento.id),
    );
}

export function getConstrutoraPresentationData(
    empreendimentoId = construtoraAlphaUser.accessible_empreendimento_ids[0],
): ConstrutoraPresentationData {
    const accessibleEmpreendimentos = getAccessibleEmpreendimentos();
    const activeEmpreendimento =
        accessibleEmpreendimentos.find((empreendimento) => empreendimento.id === empreendimentoId) ??
        accessibleEmpreendimentos[0];

    const baseLeads = leads.filter((lead) => lead.empreendimento_id === activeEmpreendimento.id);
    const baseCorretores = corretores.filter((corretor) => corretor.empreendimento_id === activeEmpreendimento.id);
    const baseThreads = conversationThreads.filter((thread) => thread.empreendimento_id === activeEmpreendimento.id);

    const conversationsByLeadId = Object.fromEntries(
        baseThreads.map((thread) => [
            thread.lead_id,
            {
                thread,
                messages: conversationMessages.filter((message) => message.conversa_id === thread.id),
            },
        ]),
    ) as ConstrutoraPresentationData['conversationsByLeadId'];

    const funnelBase = activeEmpreendimento.funil[0]?.total || 1;

    return {
        viewer: construtoraAlphaUser,
        construtora,
        activeEmpreendimento,
        accessibleEmpreendimentos,
        overview: {
            leadsGerados: activeEmpreendimento.leads_gerados,
            leadsQualificados: activeEmpreendimento.leads_qualificados,
            emAtendimento: activeEmpreendimento.em_atendimento,
            vendasEstimadas: activeEmpreendimento.vendas,
            taxaConversao: activeEmpreendimento.taxa_conversao,
        },
        funnel: activeEmpreendimento.funil.map((step) => ({
            ...step,
            ratio: step.total / funnelBase,
        })),
        leadMetrics: {
            origens: activeEmpreendimento.origens,
            tempoMedioQualificacaoMin: activeEmpreendimento.tempo_medio_qualificacao_min,
            tempoMedioAtendimentoMin: activeEmpreendimento.tempo_medio_atendimento_min,
            tempoMedioFechamentoDias: activeEmpreendimento.tempo_medio_fechamento_dias,
            investimentoTrafego: activeEmpreendimento.investimento_trafego,
            custoPorLead: activeEmpreendimento.custo_por_lead,
        },
        leads: baseLeads,
        corretores: baseCorretores,
        conversationsByLeadId,
    };
}

export function getConstrutoraEmpreendimentos() {
    return getAccessibleEmpreendimentos();
}
