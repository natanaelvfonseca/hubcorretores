export type ConstrutoraLeadScore = 'alto' | 'medio' | 'baixo';
export type ConstrutoraLeadStatus = 'quente' | 'morno' | 'frio';
export type LeadJourneyStatus = 'novo' | 'em_atendimento' | 'visitou' | 'proposta' | 'fechado';
export type LeadPipelineStageId =
    | 'novo_lead'
    | 'em_atendimento'
    | 'qualificado'
    | 'visita_agendada'
    | 'proposta_enviada'
    | 'negociacao'
    | 'venda_fechada';
export type EmpreendimentoStatus = 'Lancamento' | 'Em vendas' | 'Finalizado';
export type AlertTone = 'atencao' | 'urgente' | 'oportunidade';

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
    percentual: number;
}

export interface FunnelStep {
    id: string;
    label: string;
    total: number;
}

export interface PipelineStageDefinition {
    id: LeadPipelineStageId;
    label: string;
    resumo: string;
}

export interface DashboardAlert {
    id: string;
    empreendimento_id: string;
    tone: AlertTone;
    title: string;
    description: string;
}

export interface TopCorretorEntity {
    corretor_id: string;
    empreendimento_id: string;
    nome: string;
    vendas: number;
    posicao: 1 | 2 | 3;
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
    vendas_previstas_30_dias: number;
    taxa_conversao: number;
    investimento_trafego: number;
    custo_por_lead: number;
    custo_por_venda: number;
    tempo_medio_qualificacao_min: number;
    tempo_medio_atendimento_min: number;
    tempo_medio_resposta_min: number;
    tempo_medio_fechamento_dias: number;
    leads_respondidos_percentual: number;
    nota_media_atendimento: number;
    funil: FunnelStep[];
    origens: LeadOriginMetric[];
    alertas: DashboardAlert[];
    ranking_corretores: TopCorretorEntity[];
}

export interface CorretorPerformanceEntity {
    id: string;
    corretor_id: string;
    construtora_id: string;
    empreendimento_id: string;
    nome: string;
    leads_recebidos: number;
    tempo_resposta_min: number;
    conversao: number;
    vendas: number;
}

export interface LeadEntity {
    id: string;
    nome: string;
    construtora_id: string;
    empreendimento_id: string;
    corretor_id: string;
    corretor_nome: string;
    interesse: string;
    regiao: string;
    origem: string;
    score: ConstrutoraLeadScore;
    status: ConstrutoraLeadStatus;
    jornada_status: LeadJourneyStatus;
    pipeline_stage: LeadPipelineStageId;
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
    salesForecast: {
        vendasPrevistas30Dias: number;
        resumo: string;
    };
    salesCost: {
        investimento: number;
        vendas: number;
        custoPorVenda: number;
    };
    alerts: DashboardAlert[];
    serviceQuality: {
        tempoMedioRespostaMin: number;
        leadsRespondidosPercentual: number;
        notaMediaAtendimento: number;
    };
    topCorretores: TopCorretorEntity[];
    originBreakdown: LeadOriginMetric[];
    leads: LeadEntity[];
    corretores: CorretorPerformanceEntity[];
    crmStages: Array<PipelineStageDefinition & { leads: LeadEntity[] }>;
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

export const construtoraPipelineStages: PipelineStageDefinition[] = [
    {
        id: 'novo_lead',
        label: 'Novo Lead',
        resumo: 'Clientes que acabaram de chegar e precisam do primeiro contato.',
    },
    {
        id: 'em_atendimento',
        label: 'Em Atendimento',
        resumo: 'Clientes em conversa ativa com o time comercial.',
    },
    {
        id: 'qualificado',
        label: 'Qualificado',
        resumo: 'Clientes com perfil validado e boa chance de avancar.',
    },
    {
        id: 'visita_agendada',
        label: 'Visita Agendada',
        resumo: 'Clientes com visita marcada para conhecer a oportunidade.',
    },
    {
        id: 'proposta_enviada',
        label: 'Proposta Enviada',
        resumo: 'Clientes analisando valores, condicoes e proximos passos.',
    },
    {
        id: 'negociacao',
        label: 'Negociacao',
        resumo: 'Clientes em tratativa final para fechar a compra.',
    },
    {
        id: 'venda_fechada',
        label: 'Venda Fechada',
        resumo: 'Clientes que ja viraram venda dentro do ciclo atual.',
    },
];

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
        vendas_previstas_30_dias: 22,
        taxa_conversao: 14.1,
        investimento_trafego: 8500,
        custo_por_lead: 22,
        custo_por_venda: 472,
        tempo_medio_qualificacao_min: 3,
        tempo_medio_atendimento_min: 5,
        tempo_medio_resposta_min: 3,
        tempo_medio_fechamento_dias: 12,
        leads_respondidos_percentual: 92,
        nota_media_atendimento: 8.4,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 384 },
            { id: 'qualificados', label: 'Leads qualificados', total: 127 },
            { id: 'atendidos', label: 'Atendidos', total: 89 },
            { id: 'visitas', label: 'Visitas', total: 46 },
            { id: 'propostas', label: 'Propostas', total: 28 },
            { id: 'vendas', label: 'Vendas', total: 18 },
        ],
        origens: [
            { origem: 'Meta Ads', total: 230, percentual: 60 },
            { origem: 'Google', total: 96, percentual: 25 },
            { origem: 'Indicacao', total: 58, percentual: 15 },
        ],
        alertas: [
            {
                id: 'alert_001',
                empreendimento_id: 'emp_001',
                tone: 'atencao',
                title: '12 leads aguardando atendimento',
                description: 'Ha oportunidades esperando retorno ha mais de 10 minutos.',
            },
            {
                id: 'alert_002',
                empreendimento_id: 'emp_001',
                tone: 'urgente',
                title: 'Corretor com baixa taxa de resposta',
                description: 'Vale redistribuir o atendimento para manter a velocidade comercial.',
            },
            {
                id: 'alert_003',
                empreendimento_id: 'emp_001',
                tone: 'oportunidade',
                title: 'Lead com alto interesse aguardando contato',
                description: 'Existe uma oportunidade quente pronta para avancar para visita.',
            },
        ],
        ranking_corretores: [
            { corretor_id: 'cor_001', empreendimento_id: 'emp_001', nome: 'Carlos Mendes', vendas: 8, posicao: 1 },
            { corretor_id: 'cor_002', empreendimento_id: 'emp_001', nome: 'Ana Souza', vendas: 5, posicao: 2 },
            { corretor_id: 'cor_003', empreendimento_id: 'emp_001', nome: 'Rafael Lima', vendas: 3, posicao: 3 },
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
        vendas_previstas_30_dias: 14,
        taxa_conversao: 14.9,
        investimento_trafego: 6100,
        custo_por_lead: 28,
        custo_por_venda: 555,
        tempo_medio_qualificacao_min: 4,
        tempo_medio_atendimento_min: 6,
        tempo_medio_resposta_min: 5,
        tempo_medio_fechamento_dias: 15,
        leads_respondidos_percentual: 88,
        nota_media_atendimento: 8.0,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 218 },
            { id: 'qualificados', label: 'Leads qualificados', total: 74 },
            { id: 'atendidos', label: 'Atendidos', total: 51 },
            { id: 'visitas', label: 'Visitas', total: 24 },
            { id: 'propostas', label: 'Propostas', total: 16 },
            { id: 'vendas', label: 'Vendas', total: 11 },
        ],
        origens: [
            { origem: 'Meta Ads', total: 120, percentual: 55 },
            { origem: 'Google', total: 62, percentual: 28 },
            { origem: 'Indicacao', total: 36, percentual: 17 },
        ],
        alertas: [
            {
                id: 'alert_004',
                empreendimento_id: 'emp_002',
                tone: 'atencao',
                title: '7 leads aguardando retorno',
                description: 'Ha conversas novas que podem esfriar sem um contato rapido.',
            },
            {
                id: 'alert_005',
                empreendimento_id: 'emp_002',
                tone: 'urgente',
                title: '2 propostas sem devolutiva',
                description: 'Clientes com proposta enviada precisam de acompanhamento hoje.',
            },
            {
                id: 'alert_006',
                empreendimento_id: 'emp_002',
                tone: 'oportunidade',
                title: 'Campanha em alta no Google',
                description: 'A procura cresceu e ha margem para ampliar a captura de leads.',
            },
        ],
        ranking_corretores: [
            { corretor_id: 'cor_004', empreendimento_id: 'emp_002', nome: 'Bruna Alves', vendas: 5, posicao: 1 },
            { corretor_id: 'cor_005', empreendimento_id: 'emp_002', nome: 'Thiago Rocha', vendas: 4, posicao: 2 },
            { corretor_id: 'cor_006', empreendimento_id: 'emp_002', nome: 'Juliana Moraes', vendas: 2, posicao: 3 },
        ],
    },
];

const corretores: CorretorPerformanceEntity[] = [
    {
        id: 'cor_perf_001',
        corretor_id: 'cor_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Carlos Mendes',
        leads_recebidos: 32,
        tempo_resposta_min: 2,
        conversao: 18,
        vendas: 8,
    },
    {
        id: 'cor_perf_002',
        corretor_id: 'cor_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Ana Souza',
        leads_recebidos: 21,
        tempo_resposta_min: 3,
        conversao: 12,
        vendas: 5,
    },
    {
        id: 'cor_perf_003',
        corretor_id: 'cor_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        nome: 'Rafael Lima',
        leads_recebidos: 18,
        tempo_resposta_min: 4,
        conversao: 9,
        vendas: 3,
    },
    {
        id: 'cor_perf_004',
        corretor_id: 'cor_004',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        nome: 'Bruna Alves',
        leads_recebidos: 19,
        tempo_resposta_min: 4,
        conversao: 13,
        vendas: 5,
    },
    {
        id: 'cor_perf_005',
        corretor_id: 'cor_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        nome: 'Thiago Rocha',
        leads_recebidos: 15,
        tempo_resposta_min: 6,
        conversao: 10,
        vendas: 4,
    },
    {
        id: 'cor_perf_006',
        corretor_id: 'cor_006',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        nome: 'Juliana Moraes',
        leads_recebidos: 12,
        tempo_resposta_min: 5,
        conversao: 8,
        vendas: 2,
    },
];

const leads: LeadEntity[] = [
    {
        id: 'lead_001',
        nome: 'Joao Silva',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Itapema',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        jornada_status: 'visitou',
        pipeline_stage: 'visita_agendada',
        ultima_atualizacao: 'Confirmou visita para este sabado e pediu simulacao de entrada.',
    },
    {
        id: 'lead_002',
        nome: 'Mariana Costa',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        corretor_nome: 'Ana Souza',
        interesse: 'Cobertura com vista mar',
        regiao: 'Meia Praia',
        origem: 'Google',
        score: 'medio',
        status: 'morno',
        jornada_status: 'proposta',
        pipeline_stage: 'proposta_enviada',
        ultima_atualizacao: 'Esta analisando condicoes de entrada e prazo de pagamento.',
    },
    {
        id: 'lead_003',
        nome: 'Eduardo Ramos',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Apartamento 3 suites',
        regiao: 'Itapema',
        origem: 'Indicacao',
        score: 'alto',
        status: 'quente',
        jornada_status: 'proposta',
        pipeline_stage: 'negociacao',
        ultima_atualizacao: 'Investidor com boa chance de fechar ainda nesta semana.',
    },
    {
        id: 'lead_004',
        nome: 'Patricia Almeida',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        corretor_nome: 'Rafael Lima',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Porto Belo',
        origem: 'Meta Ads',
        score: 'baixo',
        status: 'frio',
        jornada_status: 'novo',
        pipeline_stage: 'novo_lead',
        ultima_atualizacao: 'Entrou agora no funil e aguarda o primeiro contato do time.',
    },
    {
        id: 'lead_005',
        nome: 'Fernanda Oliveira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        corretor_nome: 'Ana Souza',
        interesse: 'Apartamento com varanda gourmet',
        regiao: 'Itapema',
        origem: 'Google',
        score: 'medio',
        status: 'morno',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'qualificado',
        ultima_atualizacao: 'Pediu material completo e quer falar sobre condicoes especiais.',
    },
    {
        id: 'lead_009',
        nome: 'Maria Oliveira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Cobertura frente mar',
        regiao: 'Itapema',
        origem: 'Meta Ads',
        score: 'medio',
        status: 'morno',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'em_atendimento',
        ultima_atualizacao: 'Respondeu com interesse e pediu retorno no fim da tarde.',
    },
    {
        id: 'lead_010',
        nome: 'Lucas Pereira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        corretor_nome: 'Rafael Lima',
        interesse: 'Apartamento 3 quartos',
        regiao: 'Porto Belo',
        origem: 'Indicacao',
        score: 'alto',
        status: 'quente',
        jornada_status: 'fechado',
        pipeline_stage: 'venda_fechada',
        ultima_atualizacao: 'Venda fechada com entrada aprovada e assinatura em andamento.',
    },
    {
        id: 'lead_011',
        nome: 'Renata Gomes',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        corretor_nome: 'Ana Souza',
        interesse: 'Studio premium',
        regiao: 'Itapema',
        origem: 'Meta Ads',
        score: 'medio',
        status: 'morno',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'qualificado',
        ultima_atualizacao: 'Perfil aprovado e com interesse em visita ainda nesta semana.',
    },
    {
        id: 'lead_012',
        nome: 'Gustavo Almeida',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Apartamento 2 suites',
        regiao: 'Meia Praia',
        origem: 'Google',
        score: 'alto',
        status: 'quente',
        jornada_status: 'proposta',
        pipeline_stage: 'proposta_enviada',
        ultima_atualizacao: 'Recebeu proposta e marcou retorno para revisar valores.',
    },
    {
        id: 'lead_013',
        nome: 'Aline Martins',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        corretor_nome: 'Rafael Lima',
        interesse: 'Garden com patio',
        regiao: 'Itapema',
        origem: 'Indicacao',
        score: 'medio',
        status: 'morno',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'em_atendimento',
        ultima_atualizacao: 'Atendimento em andamento com foco em familia que quer mudar ainda este ano.',
    },
    {
        id: 'lead_014',
        nome: 'Paula Fernandes',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        corretor_nome: 'Ana Souza',
        interesse: 'Apartamento compacto',
        regiao: 'Porto Belo',
        origem: 'Meta Ads',
        score: 'baixo',
        status: 'frio',
        jornada_status: 'novo',
        pipeline_stage: 'novo_lead',
        ultima_atualizacao: 'Entrou pela campanha da semana e ainda nao respondeu ao primeiro contato.',
    },
    {
        id: 'lead_015',
        nome: 'Sergio Batista',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        corretor_nome: 'Carlos Mendes',
        interesse: 'Cobertura',
        regiao: 'Itapema',
        origem: 'Google',
        score: 'alto',
        status: 'quente',
        jornada_status: 'fechado',
        pipeline_stage: 'venda_fechada',
        ultima_atualizacao: 'Fechamento confirmado com previsao de assinatura para hoje.',
    },
    {
        id: 'lead_016',
        nome: 'Carla Dias',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        corretor_nome: 'Rafael Lima',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Itapema',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        jornada_status: 'visitou',
        pipeline_stage: 'visita_agendada',
        ultima_atualizacao: 'Visitou o decorado e pediu opcoes com parcelas reduzidas.',
    },
    {
        id: 'lead_006',
        nome: 'Ricardo Brito',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_004',
        corretor_nome: 'Bruna Alves',
        interesse: 'Loft premium',
        regiao: 'Balneario Pereque',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        jornada_status: 'visitou',
        pipeline_stage: 'visita_agendada',
        ultima_atualizacao: 'Quer tabela atualizada e pediu visita guiada ao decorado.',
    },
    {
        id: 'lead_007',
        nome: 'Camila Nunes',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_005',
        corretor_nome: 'Thiago Rocha',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Porto Belo',
        origem: 'Indicacao',
        score: 'medio',
        status: 'morno',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'em_atendimento',
        ultima_atualizacao: 'Gostou da localizacao e pediu retorno no fim do dia.',
    },
    {
        id: 'lead_008',
        nome: 'Leonardo Prado',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_004',
        corretor_nome: 'Bruna Alves',
        interesse: 'Cobertura duplex',
        regiao: 'Itajai',
        origem: 'Google',
        score: 'alto',
        status: 'quente',
        jornada_status: 'proposta',
        pipeline_stage: 'negociacao',
        ultima_atualizacao: 'Tem verba aprovada e quer revisar os ultimos detalhes da proposta.',
    },
    {
        id: 'lead_017',
        nome: 'Juliana Farias',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_006',
        corretor_nome: 'Juliana Moraes',
        interesse: 'Apartamento com sacada',
        regiao: 'Balneario Pereque',
        origem: 'Meta Ads',
        score: 'medio',
        status: 'morno',
        jornada_status: 'novo',
        pipeline_stage: 'novo_lead',
        ultima_atualizacao: 'Lead novo com interesse em conhecer as unidades de lancamento.',
    },
    {
        id: 'lead_018',
        nome: 'Bianca Teles',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_005',
        corretor_nome: 'Thiago Rocha',
        interesse: 'Apartamento 3 quartos',
        regiao: 'Porto Belo',
        origem: 'Google',
        score: 'medio',
        status: 'morno',
        jornada_status: 'proposta',
        pipeline_stage: 'proposta_enviada',
        ultima_atualizacao: 'Recebeu a proposta e esta avaliando condicoes de pagamento.',
    },
    {
        id: 'lead_019',
        nome: 'Marcelo Cunha',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_004',
        corretor_nome: 'Bruna Alves',
        interesse: 'Apartamento 2 suites',
        regiao: 'Itajai',
        origem: 'Indicacao',
        score: 'alto',
        status: 'quente',
        jornada_status: 'fechado',
        pipeline_stage: 'venda_fechada',
        ultima_atualizacao: 'Venda confirmada com documentacao em revisao final.',
    },
    {
        id: 'lead_020',
        nome: 'Aline Ribeiro',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_006',
        corretor_nome: 'Juliana Moraes',
        interesse: 'Studio com varanda',
        regiao: 'Porto Belo',
        origem: 'Meta Ads',
        score: 'alto',
        status: 'quente',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'qualificado',
        ultima_atualizacao: 'Perfil validado e pronto para receber a proposta ideal.',
    },
    {
        id: 'lead_021',
        nome: 'Otavio Moreira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_005',
        corretor_nome: 'Thiago Rocha',
        interesse: 'Cobertura com piscina',
        regiao: 'Balneario Pereque',
        origem: 'Google',
        score: 'alto',
        status: 'quente',
        jornada_status: 'em_atendimento',
        pipeline_stage: 'em_atendimento',
        ultima_atualizacao: 'Cliente de alto interesse aguardando detalhes das unidades finais.',
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
        resumo: 'Lead comparando formas de pagamento antes de decidir sobre a proposta.',
    },
    {
        id: 'conv_003',
        lead_id: 'lead_003',
        empreendimento_id: 'emp_001',
        resumo: 'Investidor interessado em retorno com locacao por temporada.',
    },
    {
        id: 'conv_004',
        lead_id: 'lead_009',
        empreendimento_id: 'emp_001',
        resumo: 'Conversa em andamento com potencial de visita ainda esta semana.',
    },
    {
        id: 'conv_005',
        lead_id: 'lead_006',
        empreendimento_id: 'emp_002',
        resumo: 'Lead pediu tabela atualizada e visita ao decorado.',
    },
    {
        id: 'conv_006',
        lead_id: 'lead_008',
        empreendimento_id: 'emp_002',
        resumo: 'Cliente com interesse forte na cobertura e bom prazo de decisao.',
    },
    {
        id: 'conv_007',
        lead_id: 'lead_018',
        empreendimento_id: 'emp_002',
        resumo: 'Cliente comparando a proposta com outras oportunidades da regiao.',
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
        texto: 'Aceita sim. Se voce quiser, eu te mostro as condicoes e te encaminho para a proposta.',
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
        texto: 'Gostei da cobertura. Ainda tem disponibilidade para visita nesta semana?',
        enviado_em: '2026-04-10T08:35:00-03:00',
    },
    {
        id: 'msg_010',
        conversa_id: 'conv_004',
        autor: 'atendimento',
        texto: 'Temos sim. Vou te passar os horarios e deixar o atendimento reservado.',
        enviado_em: '2026-04-10T08:36:00-03:00',
    },
    {
        id: 'msg_011',
        conversa_id: 'conv_005',
        autor: 'lead',
        texto: 'Gostei da Torre Azul. Voces conseguem me mandar a tabela?',
        enviado_em: '2026-04-10T08:20:00-03:00',
    },
    {
        id: 'msg_012',
        conversa_id: 'conv_005',
        autor: 'atendimento',
        texto: 'Consigo sim. Ja vou te enviar as condicoes e posso deixar uma visita reservada.',
        enviado_em: '2026-04-10T08:21:00-03:00',
    },
    {
        id: 'msg_013',
        conversa_id: 'conv_006',
        autor: 'lead',
        texto: 'Tenho interesse na cobertura da Torre Azul. Ainda esta disponivel?',
        enviado_em: '2026-04-10T10:03:00-03:00',
    },
    {
        id: 'msg_014',
        conversa_id: 'conv_006',
        autor: 'atendimento',
        texto: 'Sim, esta disponivel. Posso te passar as opcoes e deixar o atendimento com a corretora.',
        enviado_em: '2026-04-10T10:04:00-03:00',
    },
    {
        id: 'msg_015',
        conversa_id: 'conv_007',
        autor: 'lead',
        texto: 'Recebi a proposta. Quero entender a melhor condicao para entrada.',
        enviado_em: '2026-04-10T11:40:00-03:00',
    },
    {
        id: 'msg_016',
        conversa_id: 'conv_007',
        autor: 'atendimento',
        texto: 'Posso te mostrar duas condicoes e alinhar a melhor opcao ainda hoje.',
        enviado_em: '2026-04-10T11:42:00-03:00',
    },
];

function getAccessibleEmpreendimentos() {
    return empreendimentos.filter((empreendimento) =>
        construtoraAlphaUser.accessible_empreendimento_ids.includes(empreendimento.id),
    );
}

function getScoreWeight(score: ConstrutoraLeadScore) {
    if (score === 'alto') return 3;
    if (score === 'medio') return 2;
    return 1;
}

export function getConstrutoraPresentationData(
    empreendimentoId = construtoraAlphaUser.accessible_empreendimento_ids[0],
): ConstrutoraPresentationData {
    const accessibleEmpreendimentos = getAccessibleEmpreendimentos();
    const activeEmpreendimento =
        accessibleEmpreendimentos.find((empreendimento) => empreendimento.id === empreendimentoId) ??
        accessibleEmpreendimentos[0];

    const baseLeads = leads
        .filter((lead) => lead.empreendimento_id === activeEmpreendimento.id)
        .sort((left, right) => getScoreWeight(right.score) - getScoreWeight(left.score) || left.nome.localeCompare(right.nome));
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
        salesForecast: {
            vendasPrevistas30Dias: activeEmpreendimento.vendas_previstas_30_dias,
            resumo: `Com base no volume atual de leads e atendimentos, a estimativa e de ${activeEmpreendimento.vendas_previstas_30_dias} vendas nos proximos 30 dias.`,
        },
        salesCost: {
            investimento: activeEmpreendimento.investimento_trafego,
            vendas: activeEmpreendimento.vendas,
            custoPorVenda: activeEmpreendimento.custo_por_venda,
        },
        alerts: activeEmpreendimento.alertas,
        serviceQuality: {
            tempoMedioRespostaMin: activeEmpreendimento.tempo_medio_resposta_min,
            leadsRespondidosPercentual: activeEmpreendimento.leads_respondidos_percentual,
            notaMediaAtendimento: activeEmpreendimento.nota_media_atendimento,
        },
        topCorretores: activeEmpreendimento.ranking_corretores,
        originBreakdown: activeEmpreendimento.origens,
        leads: baseLeads,
        corretores: baseCorretores,
        crmStages: construtoraPipelineStages.map((stage) => ({
            ...stage,
            leads: baseLeads.filter((lead) => lead.pipeline_stage === stage.id),
        })),
        conversationsByLeadId,
    };
}

export function getConstrutoraEmpreendimentos() {
    return getAccessibleEmpreendimentos().map((empreendimento) => ({
        ...empreendimento,
        funil: [...empreendimento.funil],
        origens: [...empreendimento.origens],
        alertas: [...empreendimento.alertas],
        ranking_corretores: [...empreendimento.ranking_corretores],
    }));
}
