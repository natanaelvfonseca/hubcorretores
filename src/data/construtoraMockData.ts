export type ConstrutoraLeadScore = 'alto' | 'medio' | 'baixo';
export type ConstrutoraLeadStatus = 'quente' | 'morno' | 'frio';

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

export interface EmpreendimentoEntity {
    id: string;
    construtora_id: string;
    nome: string;
    cidade: string;
    estagio: string;
    ticket_medio: number;
}

export interface ExecutiveSnapshotEntity {
    id: string;
    construtora_id: string;
    empreendimento_id: string;
    leads_gerados: number;
    leads_qualificados: number;
    em_atendimento: number;
    vendas_estimadas: number;
    taxa_conversao: number;
    funil: Array<{
        id: string;
        label: string;
        total: number;
    }>;
    conversas_relacionadas: number;
    corretores_ativos: number;
    origem_principal: string;
}

export interface CorretorEntity {
    id: string;
    construtora_id: string;
    nome: string;
    equipe: string;
}

export interface CorretorPerformanceEntity {
    id: string;
    construtora_id: string;
    empreendimento_id: string;
    corretor_id: string;
    leads_recebidos: number;
    tempo_medio_resposta_min: number;
    taxa_conversao: number;
}

export interface LeadEntity {
    id: string;
    nome: string;
    construtora_id: string;
    empreendimento_id: string;
    corretor_id: string;
    interesse: string;
    regiao: string;
    score: ConstrutoraLeadScore;
    status: ConstrutoraLeadStatus;
    origem: string;
    etapa_atual: string;
    ultima_acao: string;
}

export interface ConversationThreadEntity {
    id: string;
    construtora_id: string;
    empreendimento_id: string;
    lead_id: string;
    corretor_id: string;
    canal: 'whatsapp';
    resumo_ia: string;
}

export interface ConversationMessageEntity {
    id: string;
    conversa_id: string;
    lead_id: string;
    construtora_id: string;
    empreendimento_id: string;
    autor: 'lead' | 'ia';
    autor_nome: string;
    texto: string;
    enviado_em: string;
}

export interface ConstrutoraDashboardSnapshot {
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
    funnel: Array<{
        id: string;
        label: string;
        total: number;
        ratio: number;
    }>;
    qualifiedLeads: Array<
        LeadEntity & {
            corretor_nome: string;
            conversation_id?: string;
            resumo_ia?: string;
        }
    >;
    conversationsByLeadId: Record<
        string,
        {
            thread: ConversationThreadEntity;
            messages: ConversationMessageEntity[];
        }
    >;
    brokerPerformance: Array<
        CorretorPerformanceEntity & {
            nome: string;
            equipe: string;
        }
    >;
    empreendimentoView: {
        leadsGerados: number;
        conversasRelacionadas: number;
        corretoresAtivos: number;
        origemPrincipal: string;
    };
}

export const CONSTRUTORA_DEMO_EMAIL = 'alpha@demo.com';
export const CONSTRUTORA_DEMO_TOKEN = 'mock-construtora-alpha';

export const construtoraAlphaDemoUser: ConstrutoraMockUser = {
    id: 'user_const_001',
    email: CONSTRUTORA_DEMO_EMAIL,
    name: 'Construtora Alpha',
    role: 'user',
    accountType: 'construtora',
    accountStatus: 'premium',
    companyType: 'Construtora',
    construtora_id: 'const_001',
    accessible_empreendimento_ids: ['emp_001'],
    organization: {
        id: 'org_const_001',
        name: 'Construtora Alpha',
        planType: 'enterprise',
        whatsapp_connections_limit: 1,
    },
};

const construtoras: ConstrutoraEntity[] = [
    {
        id: 'const_001',
        nome: 'Construtora Alpha',
        tipo: 'Construtora',
        email: CONSTRUTORA_DEMO_EMAIL,
        status: 'Premium',
    },
];

const empreendimentos: EmpreendimentoEntity[] = [
    {
        id: 'emp_001',
        construtora_id: 'const_001',
        nome: 'Residencial Vista Mar',
        cidade: 'Itapema',
        estagio: 'Lançamento assistido por IA',
        ticket_medio: 1180000,
    },
    {
        id: 'emp_002',
        construtora_id: 'const_001',
        nome: 'Reserva do Atlântico',
        cidade: 'Balneário Perequê',
        estagio: 'Pré-cadastro interno',
        ticket_medio: 1460000,
    },
];

const executiveSnapshots: ExecutiveSnapshotEntity[] = [
    {
        id: 'exec_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        leads_gerados: 384,
        leads_qualificados: 127,
        em_atendimento: 52,
        vendas_estimadas: 18,
        taxa_conversao: 14.1,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 384 },
            { id: 'qualificados', label: 'Leads qualificados', total: 127 },
            { id: 'atendidos', label: 'Atendidos', total: 89 },
            { id: 'visitas', label: 'Visitas', total: 46 },
            { id: 'propostas', label: 'Propostas', total: 28 },
            { id: 'vendas', label: 'Vendas', total: 18 },
        ],
        conversas_relacionadas: 94,
        corretores_ativos: 3,
        origem_principal: 'Meta Ads + landing page do Vista Mar',
    },
    {
        id: 'exec_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        leads_gerados: 148,
        leads_qualificados: 43,
        em_atendimento: 16,
        vendas_estimadas: 6,
        taxa_conversao: 13.9,
        funil: [
            { id: 'gerados', label: 'Leads gerados', total: 148 },
            { id: 'qualificados', label: 'Leads qualificados', total: 43 },
            { id: 'atendidos', label: 'Atendidos', total: 31 },
            { id: 'visitas', label: 'Visitas', total: 15 },
            { id: 'propostas', label: 'Propostas', total: 10 },
            { id: 'vendas', label: 'Vendas', total: 6 },
        ],
        conversas_relacionadas: 41,
        corretores_ativos: 2,
        origem_principal: 'Lista VIP de investidores',
    },
];

const corretores: CorretorEntity[] = [
    { id: 'cor_001', construtora_id: 'const_001', nome: 'Carlos Mendes', equipe: 'Inside Sales' },
    { id: 'cor_002', construtora_id: 'const_001', nome: 'Ana Souza', equipe: 'Closer' },
    { id: 'cor_003', construtora_id: 'const_001', nome: 'Rafael Lima', equipe: 'Pré-vendas' },
    { id: 'cor_004', construtora_id: 'const_001', nome: 'Beatriz Nunes', equipe: 'Investidores' },
];

const corretorPerformance: CorretorPerformanceEntity[] = [
    {
        id: 'perf_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        leads_recebidos: 32,
        tempo_medio_resposta_min: 2,
        taxa_conversao: 18,
    },
    {
        id: 'perf_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        leads_recebidos: 21,
        tempo_medio_resposta_min: 5,
        taxa_conversao: 12,
    },
    {
        id: 'perf_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        leads_recebidos: 18,
        tempo_medio_resposta_min: 8,
        taxa_conversao: 9,
    },
    {
        id: 'perf_004',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_004',
        leads_recebidos: 14,
        tempo_medio_resposta_min: 4,
        taxa_conversao: 11,
    },
];

const leads: LeadEntity[] = [
    {
        id: 'lead_001',
        nome: 'João Silva',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Itapema',
        score: 'alto',
        status: 'quente',
        origem: 'Meta Ads',
        etapa_atual: 'Qualificado',
        ultima_acao: 'IA confirmou faixa de entrada e interesse em visita neste fim de semana.',
    },
    {
        id: 'lead_002',
        nome: 'Mariana Costa',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        interesse: 'Cobertura com vista mar',
        regiao: 'Meia Praia',
        score: 'medio',
        status: 'morno',
        origem: 'Landing page',
        etapa_atual: 'Em atendimento',
        ultima_acao: 'Lead pediu simulação com entrada parcelada e vaga dupla.',
    },
    {
        id: 'lead_003',
        nome: 'Eduardo Ramos',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_001',
        interesse: 'Apartamento 3 suítes',
        regiao: 'Itapema',
        score: 'alto',
        status: 'quente',
        origem: 'Indicação',
        etapa_atual: 'Visita agendada',
        ultima_acao: 'IA detectou perfil investidor e urgência para fechamento no trimestre.',
    },
    {
        id: 'lead_004',
        nome: 'Patrícia Almeida',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_003',
        interesse: 'Apartamento 2 quartos',
        regiao: 'Porto Belo',
        score: 'baixo',
        status: 'frio',
        origem: 'Portal imobiliário',
        etapa_atual: 'Qualificação inicial',
        ultima_acao: 'Lead comparando empreendimentos e ainda sem aprovação de crédito.',
    },
    {
        id: 'lead_005',
        nome: 'Fernanda Oliveira',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        corretor_id: 'cor_002',
        interesse: 'Apartamento 2 quartos com varanda gourmet',
        regiao: 'Itapema',
        score: 'medio',
        status: 'morno',
        origem: 'Campanha de lançamento',
        etapa_atual: 'Proposta em preparação',
        ultima_acao: 'Solicitou memorial descritivo e prazo de entrega da unidade final 08.',
    },
    {
        id: 'lead_006',
        nome: 'Ricardo Brito',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        corretor_id: 'cor_004',
        interesse: 'Loft premium',
        regiao: 'Perequê',
        score: 'alto',
        status: 'quente',
        origem: 'Lista VIP',
        etapa_atual: 'Pré-reserva',
        ultima_acao: 'Lead oculto do contexto da Construtora Alpha para este login.',
    },
];

const conversationThreads: ConversationThreadEntity[] = [
    {
        id: 'conv_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        lead_id: 'lead_001',
        corretor_id: 'cor_001',
        canal: 'whatsapp',
        resumo_ia: 'Lead com renda compatível, quer visita no sábado e demonstrou interesse alto na planta final 04.',
    },
    {
        id: 'conv_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        lead_id: 'lead_002',
        corretor_id: 'cor_002',
        canal: 'whatsapp',
        resumo_ia: 'Lead busca cobertura, está validando condições de entrada e reage bem a comparação de diferenciais.',
    },
    {
        id: 'conv_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        lead_id: 'lead_003',
        corretor_id: 'cor_001',
        canal: 'whatsapp',
        resumo_ia: 'Perfil investidor aquecido, com objeção principal em prazo de valorização versus liquidez.',
    },
    {
        id: 'conv_004',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        lead_id: 'lead_005',
        corretor_id: 'cor_002',
        canal: 'whatsapp',
        resumo_ia: 'Lead pediu memorial e tabela de pagamento; boa chance de virar proposta formal.',
    },
    {
        id: 'conv_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_002',
        lead_id: 'lead_006',
        corretor_id: 'cor_004',
        canal: 'whatsapp',
        resumo_ia: 'Conversa fora do escopo do empreendimento visível para este perfil.',
    },
];

const conversationMessages: ConversationMessageEntity[] = [
    {
        id: 'msg_001',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'João Silva',
        texto: 'Oi, vi o anúncio do Vista Mar e queria entender melhor as unidades de 2 quartos.',
        enviado_em: '2026-04-09T09:12:00-03:00',
    },
    {
        id: 'msg_002',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Perfeito, João. Você busca moradia ou investimento? Assim eu já te mostro a planta ideal.',
        enviado_em: '2026-04-09T09:13:00-03:00',
    },
    {
        id: 'msg_003',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'João Silva',
        texto: 'Moradia. Quero algo perto do mar e com boa chance de valorização.',
        enviado_em: '2026-04-09T09:15:00-03:00',
    },
    {
        id: 'msg_004',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Ótimo perfil para a final 04. Posso te mostrar opções com entrada a partir de 20%. Qual faixa de investimento você está considerando?',
        enviado_em: '2026-04-09T09:16:00-03:00',
    },
    {
        id: 'msg_005',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'João Silva',
        texto: 'Algo até 1,2 milhão. Se fizer sentido, consigo visitar no sábado.',
        enviado_em: '2026-04-09T09:18:00-03:00',
    },
    {
        id: 'msg_006',
        conversa_id: 'conv_001',
        lead_id: 'lead_001',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Perfeito. Já deixei a conversa marcada como quente e encaminhei ao corretor Carlos com sugestão de visita.',
        enviado_em: '2026-04-09T09:19:00-03:00',
    },
    {
        id: 'msg_007',
        conversa_id: 'conv_002',
        lead_id: 'lead_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Mariana Costa',
        texto: 'Quero entender se a cobertura aceita parcelamento maior na entrada.',
        enviado_em: '2026-04-08T15:04:00-03:00',
    },
    {
        id: 'msg_008',
        conversa_id: 'conv_002',
        lead_id: 'lead_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Aceita, sim. Você pensa em uso próprio ou segunda residência? Isso muda a configuração mais recomendada.',
        enviado_em: '2026-04-08T15:05:00-03:00',
    },
    {
        id: 'msg_009',
        conversa_id: 'conv_002',
        lead_id: 'lead_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Mariana Costa',
        texto: 'Segunda residência. Quero algo com vista aberta e duas vagas.',
        enviado_em: '2026-04-08T15:08:00-03:00',
    },
    {
        id: 'msg_010',
        conversa_id: 'conv_002',
        lead_id: 'lead_002',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Entendi. Já classifiquei seu perfil como morno com alto potencial e vou encaminhar uma simulação detalhada.',
        enviado_em: '2026-04-08T15:09:00-03:00',
    },
    {
        id: 'msg_011',
        conversa_id: 'conv_003',
        lead_id: 'lead_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Eduardo Ramos',
        texto: 'Estou olhando o Vista Mar para investir. Como anda a valorização prevista?',
        enviado_em: '2026-04-09T11:02:00-03:00',
    },
    {
        id: 'msg_012',
        conversa_id: 'conv_003',
        lead_id: 'lead_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'O empreendimento tem boa aderência para investidor. Você pretende girar após entrega ou manter em locação por temporada?',
        enviado_em: '2026-04-09T11:03:00-03:00',
    },
    {
        id: 'msg_013',
        conversa_id: 'conv_003',
        lead_id: 'lead_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Eduardo Ramos',
        texto: 'Minha ideia é locação por temporada no primeiro ciclo.',
        enviado_em: '2026-04-09T11:05:00-03:00',
    },
    {
        id: 'msg_014',
        conversa_id: 'conv_003',
        lead_id: 'lead_003',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Perfeito. Já sinalizei perfil investidor quente e orientei o corretor a apresentar retorno esperado com foco em temporada.',
        enviado_em: '2026-04-09T11:06:00-03:00',
    },
    {
        id: 'msg_015',
        conversa_id: 'conv_004',
        lead_id: 'lead_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Fernanda Oliveira',
        texto: 'Vocês conseguem me enviar o memorial e a tabela da unidade final 08?',
        enviado_em: '2026-04-10T08:41:00-03:00',
    },
    {
        id: 'msg_016',
        conversa_id: 'conv_004',
        lead_id: 'lead_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Consigo sim. Antes disso, só confirmando: você está avaliando compra para morar ou para renda?',
        enviado_em: '2026-04-10T08:42:00-03:00',
    },
    {
        id: 'msg_017',
        conversa_id: 'conv_004',
        lead_id: 'lead_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'lead',
        autor_nome: 'Fernanda Oliveira',
        texto: 'Para morar. Quero entender prazo de entrega e padrão de acabamento.',
        enviado_em: '2026-04-10T08:45:00-03:00',
    },
    {
        id: 'msg_018',
        conversa_id: 'conv_004',
        lead_id: 'lead_005',
        construtora_id: 'const_001',
        empreendimento_id: 'emp_001',
        autor: 'ia',
        autor_nome: 'IA Qualificadora',
        texto: 'Ótimo. Seu lead já ficou como morno com proposta em preparação. O corretor Ana vai seguir com o material completo.',
        enviado_em: '2026-04-10T08:46:00-03:00',
    },
];

function getCorretorById(corretorId: string) {
    return corretores.find((corretor) => corretor.id === corretorId);
}

export function getConstrutoraDashboardSnapshot(
    empreendimentoId = construtoraAlphaDemoUser.accessible_empreendimento_ids[0],
): ConstrutoraDashboardSnapshot {
    const accessibleEmpreendimentos = empreendimentos.filter(
        (empreendimento) =>
            empreendimento.construtora_id === construtoraAlphaDemoUser.construtora_id &&
            construtoraAlphaDemoUser.accessible_empreendimento_ids.includes(empreendimento.id),
    );

    const activeEmpreendimento =
        accessibleEmpreendimentos.find((empreendimento) => empreendimento.id === empreendimentoId) ??
        accessibleEmpreendimentos[0];

    const construtora =
        construtoras.find((item) => item.id === construtoraAlphaDemoUser.construtora_id) ?? construtoras[0];

    const snapshot =
        executiveSnapshots.find(
            (item) =>
                item.construtora_id === construtora.id && item.empreendimento_id === activeEmpreendimento.id,
        ) ?? executiveSnapshots[0];

    const funnelBase = snapshot.funil[0]?.total || 1;
    const visibleLeads = leads.filter(
        (lead) =>
            lead.construtora_id === construtora.id && lead.empreendimento_id === activeEmpreendimento.id,
    );

    const visibleThreads = conversationThreads.filter(
        (thread) =>
            thread.construtora_id === construtora.id && thread.empreendimento_id === activeEmpreendimento.id,
    );

    const conversationsByLeadId = Object.fromEntries(
        visibleThreads.map((thread) => [
            thread.lead_id,
            {
                thread,
                messages: conversationMessages.filter((message) => message.conversa_id === thread.id),
            },
        ]),
    ) as ConstrutoraDashboardSnapshot['conversationsByLeadId'];

    const qualifiedLeads = visibleLeads.map((lead) => {
        const corretor = getCorretorById(lead.corretor_id);
        const conversation = visibleThreads.find((thread) => thread.lead_id === lead.id);

        return {
            ...lead,
            corretor_nome: corretor?.nome || 'Corretor responsável',
            conversation_id: conversation?.id,
            resumo_ia: conversation?.resumo_ia,
        };
    });

    const brokerPerformance = corretorPerformance
        .filter(
            (item) =>
                item.construtora_id === construtora.id && item.empreendimento_id === activeEmpreendimento.id,
        )
        .map((item) => {
            const corretor = getCorretorById(item.corretor_id);

            return {
                ...item,
                nome: corretor?.nome || 'Corretor',
                equipe: corretor?.equipe || 'Equipe comercial',
            };
        });

    return {
        viewer: construtoraAlphaDemoUser,
        construtora,
        activeEmpreendimento,
        accessibleEmpreendimentos,
        overview: {
            leadsGerados: snapshot.leads_gerados,
            leadsQualificados: snapshot.leads_qualificados,
            emAtendimento: snapshot.em_atendimento,
            vendasEstimadas: snapshot.vendas_estimadas,
            taxaConversao: snapshot.taxa_conversao,
        },
        funnel: snapshot.funil.map((step) => ({
            ...step,
            ratio: step.total / funnelBase,
        })),
        qualifiedLeads,
        conversationsByLeadId,
        brokerPerformance,
        empreendimentoView: {
            leadsGerados: snapshot.leads_gerados,
            conversasRelacionadas: snapshot.conversas_relacionadas,
            corretoresAtivos: snapshot.corretores_ativos,
            origemPrincipal: snapshot.origem_principal,
        },
    };
}
