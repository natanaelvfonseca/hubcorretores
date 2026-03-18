export interface IndustryAgent {
    id: string;
    name: string;
    icon: string;
    role: string;
    description: string;
    systemPrompt: string;
}

export interface IndustryProfile {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    defaultPipeline: string[];
    defaultIntents: string[];
    defaultObjections: string[];
    recommendedAgents: IndustryAgent[];
    recommendedFollowupSequences: Array<{
        trigger: string;
        delay_minutes: number;
        message_hint: string;
    }>;
}

const industryAgent = (
    id: string,
    name: string,
    icon: string,
    role: string,
    description: string,
    systemPrompt: string,
): IndustryAgent => ({
    id,
    name,
    icon,
    role,
    description,
    systemPrompt,
});

export const industryProfiles: IndustryProfile[] = [
    {
        id: 'educacao',
        slug: 'educacao',
        name: 'Educação',
        icon: '🎓',
        description: 'Matrícula de alunos, cursos, faculdades, escolas e treinamentos.',
        defaultPipeline: ['Novo Lead', 'Interesse no Curso', 'Qualificação', 'Agendamento', 'Comparecimento', 'Matrícula', 'Perdido'],
        defaultIntents: ['interesse_curso', 'preco_curso', 'horario_aula', 'duracao_curso', 'certificado', 'formas_pagamento', 'agendar_visita', 'bolsa_desconto'],
        defaultObjections: ['preco_alto', 'falta_tempo', 'distancia', 'duvida_certificado', 'precisa_falar_com_pais'],
        recommendedAgents: [
            industryAgent(
                'edu_suporte',
                'AI Secretaria Acadêmica',
                '🎓',
                'Suporte',
                'Resolve dúvidas sobre matrícula, documentos, financeiro e rotina do aluno.',
                'Atue como secretaria acadêmica digital. Resolva dúvidas sobre matrícula, documentos, calendário, bolsas, financeiro e andamento do aluno com linguagem clara e acolhedora. Priorize orientação prática, próximos passos e redução de atrito. Não faça prospecção fria. Quando surgir intenção comercial forte, registre o contexto e direcione o avanço para o agente de vendas.',
            ),
            industryAgent(
                'edu_vendas',
                'AI Consultora de Matrículas',
                '📚',
                'Vendas',
                'Apresenta cursos, contorna objeções e conduz até a matrícula.',
                'Atue como consultora de matrículas para leads já aquecidos. Descubra curso de interesse, objetivo profissional, urgência, formato ideal, barreiras de preço e decisão. Use diferenciais acadêmicos, calendário de turmas, prova social, bolsas e formas de pagamento para converter. Não se comporte como SDR; assuma o papel de quem conduz o fechamento.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'lead_pediu_preco', delay_minutes: 30, message_hint: 'Retome o contato com condições de pagamento e bolsa disponível.' },
            { trigger: 'lead_pediu_informacoes', delay_minutes: 120, message_hint: 'Envie o calendário de turmas e reforce o diferencial.' },
            { trigger: 'lead_interessado', delay_minutes: 1440, message_hint: 'Lembre da data de início da próxima turma e urgência de vagas.' },
        ],
    },
    {
        id: 'imobiliario',
        slug: 'imobiliario',
        name: 'Imobiliário',
        icon: '🏠',
        description: 'Venda e locação de imóveis, loteamentos e construtoras.',
        defaultPipeline: ['Novo Lead', 'Qualificação', 'Visita Agendada', 'Proposta', 'Aprovação de Crédito', 'Contrato', 'Perdido'],
        defaultIntents: ['interesse_imovel', 'preco_imovel', 'localizacao', 'financiamento', 'agendar_visita', 'planta_baixa', 'condicoes_pagamento'],
        defaultObjections: ['preco_alto', 'nao_aprovado_credito', 'precisa_vender_atual', 'localizacao_longe', 'nao_decidiu'],
        recommendedAgents: [
            industryAgent(
                'imob_suporte',
                'AI Suporte Imobiliário',
                '🏡',
                'Suporte',
                'Resolve dúvidas sobre imóvel, visita, documentos e andamento da proposta.',
                'Atue como suporte imobiliário com foco em clareza operacional. Resolva dúvidas sobre status de visita, documentação, financiamento, proposta, disponibilidade e próximos passos da jornada. Organize as respostas por etapas, reduza ansiedade e mantenha o lead orientado. Quando houver intenção clara de compra ou retomada comercial, entregue contexto pronto para o agente de vendas avançar.',
            ),
            industryAgent(
                'imob_vendas',
                'AI Corretora Digital',
                '🔑',
                'Vendas',
                'Apresenta imóveis, trabalha objeções e conduz até visita, proposta ou fechamento.',
                'Atue como corretora digital de conversão. Identifique perfil de imóvel, faixa de investimento, localização ideal, urgência, renda, formato de pagamento e entraves de decisão. Conecte valor com localização, potencial de valorização, estilo de vida e segurança da compra. Trate objeções de preço, financiamento e timing com firmeza consultiva e leve o lead para visita, proposta ou reserva.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'lead_pediu_preco', delay_minutes: 60, message_hint: 'Envie simulação de financiamento personalizada.' },
            { trigger: 'lead_agendou_visita', delay_minutes: 60, message_hint: 'Confirme a visita e envie o endereço com link do mapa.' },
        ],
    },
    {
        id: 'seguros',
        slug: 'seguros',
        name: 'Seguros',
        icon: '🛡️',
        description: 'Seguros de vida, auto, residencial, empresarial e saúde.',
        defaultPipeline: ['Novo Lead', 'Cotação Solicitada', 'Proposta Enviada', 'Análise do Cliente', 'Fechamento', 'Perdido'],
        defaultIntents: ['cotar_seguro', 'comparar_planos', 'preco_seguro', 'coberturas', 'sinistro', 'renovacao'],
        defaultObjections: ['preco_alto', 'ja_tem_seguro', 'nao_ve_necessidade', 'nao_confia_seguradora'],
        recommendedAgents: [
            industryAgent(
                'seg_suporte',
                'AI Suporte ao Segurado',
                '🧾',
                'Suporte',
                'Atende dúvidas sobre cobertura, apólice, renovação e sinistro.',
                'Atue como suporte ao segurado com linguagem simples e segura. Resolva dúvidas sobre cobertura, vigência, documentos, renovação, endossos, franquia e abertura de sinistro sem gerar insegurança desnecessária. Priorize precisão, próximos passos e checklist claro. Quando perceber oportunidade de upgrade, proteção complementar ou nova cotação, passe o contexto pronto para o agente de vendas.',
            ),
            industryAgent(
                'seg_vendas',
                'AI Consultor de Seguros',
                '🛡️',
                'Vendas',
                'Compara coberturas, trata objeções e conduz ao fechamento da apólice.',
                'Atue como consultor comercial de seguros. Descubra risco principal, patrimônio a proteger, momento de vida, nível de cobertura desejado, histórico e sensibilidade a preço. Venda proteção, tranquilidade e custo de não estar coberto, não apenas apólice. Compare cenários com clareza, trate objeções de preço e confiança e conduza para proposta e aceite.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'lead_pediu_cotacao', delay_minutes: 30, message_hint: 'Envie a cotação e destaque a principal cobertura diferencial.' },
            { trigger: 'lead_nao_respondeu', delay_minutes: 1440, message_hint: 'Pergunte se teve alguma dúvida sobre a proposta.' },
        ],
    },
    {
        id: 'clinicas',
        slug: 'clinicas',
        name: 'Clínicas',
        icon: '🏥',
        description: 'Clínicas médicas, odontológicas, estética e bem-estar.',
        defaultPipeline: ['Novo Lead', 'Interesse', 'Consulta Agendada', 'Comparecimento', 'Tratamento', 'Fidelização', 'Perdido'],
        defaultIntents: ['agendar_consulta', 'preco_procedimento', 'convenio', 'duvida_tratamento', 'resultado_esperado', 'disponibilidade'],
        defaultObjections: ['preco_alto', 'sem_convenio', 'medo_procedimento', 'indisponibilidade_horario', 'nao_urgente'],
        recommendedAgents: [
            industryAgent(
                'clinica_suporte',
                'AI Suporte ao Paciente',
                '👩‍⚕️',
                'Suporte',
                'Resolve dúvidas sobre agenda, preparo, retorno e acompanhamento do paciente.',
                'Atue como suporte ao paciente com empatia e precisão. Resolva dúvidas sobre agendamento, preparo, convênio, retorno, cuidados antes e depois do procedimento e rotina de atendimento. Reduza insegurança, explique próximos passos e mantenha o paciente orientado. Quando houver interesse explícito em procedimento, avaliação ou upgrade de tratamento, transfira contexto comercial limpo para o agente de vendas.',
            ),
            industryAgent(
                'clinica_vendas',
                'AI Consultora de Procedimentos',
                '💎',
                'Vendas',
                'Apresenta tratamentos, diferenciais e conduz ao agendamento da avaliação.',
                'Atue como consultora comercial de procedimentos e tratamentos. Descubra a queixa principal, resultado desejado, urgência, histórico e barreiras emocionais ou financeiras. Conduza com confiança, prova clínica, autoridade e segurança percebida. Trabalhe objeções de preço, medo e timing e puxe o agendamento da avaliação ou o fechamento do plano.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'lead_pediu_informacoes', delay_minutes: 60, message_hint: 'Confirme a disponibilidade de horários e incentive o agendamento.' },
            { trigger: 'consulta_agendada', delay_minutes: 1440, message_hint: 'Lembre da consulta de amanhã e envie o endereço.' },
        ],
    },
    {
        id: 'varejo',
        slug: 'varejo',
        name: 'Varejo',
        icon: '🛒',
        description: 'Lojas físicas e e-commerce de produtos físicos.',
        defaultPipeline: ['Novo Lead', 'Interesse', 'Carrinho', 'Checkout', 'Pedido Realizado', 'Entregue', 'Perdido'],
        defaultIntents: ['interesse_produto', 'preco', 'disponibilidade', 'frete', 'prazo_entrega', 'troca_devolucao', 'promocao'],
        defaultObjections: ['preco_alto', 'frete_caro', 'prazo_longo', 'desconfia_loja', 'ja_comprou_outro'],
        recommendedAgents: [
            industryAgent(
                'varejo_suporte',
                'AI Suporte Pós-venda',
                '📦',
                'Suporte',
                'Resolve dúvidas sobre pedido, entrega, troca e acompanhamento da compra.',
                'Atue como suporte pós-venda do varejo. Resolva com rapidez dúvidas sobre pedido, entrega, troca, devolução, pagamento e status da compra. Use respostas objetivas, checklist quando necessário e linguagem que preserve confiança na marca. Quando houver chance de recompra, produto complementar ou recuperação de carrinho, deixe a oportunidade pronta para o agente de vendas.',
            ),
            industryAgent(
                'varejo_vendas',
                'AI Consultora de Vendas',
                '🛍️',
                'Vendas',
                'Apresenta produtos, trabalha objeções e conduz até o pedido.',
                'Atue como consultora de vendas para varejo. Descubra objetivo de compra, contexto de uso, preferência, orçamento, urgência e sensibilidade a frete. Monte recomendação comparativa, destaque benefício prático, prova social, estoque e condição comercial. Trabalhe objeções de preço, frete, confiança e prazo e leve o cliente ao checkout.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'carrinho_abandonado', delay_minutes: 30, message_hint: 'Lembre do produto no carrinho e ofereça um cupom de desconto.' },
            { trigger: 'pedido_entregue', delay_minutes: 2880, message_hint: 'Peça avaliação e sugira produto complementar.' },
        ],
    },
    {
        id: 'servicos',
        slug: 'servicos',
        name: 'Serviços',
        icon: '⚙️',
        description: 'Prestadores de serviços B2B e B2C: manutenção, consultoria, agências.',
        defaultPipeline: ['Novo Lead', 'Briefing', 'Proposta', 'Negociação', 'Contrato', 'Execução', 'Perdido'],
        defaultIntents: ['solicitar_orcamento', 'prazo_execucao', 'portfolio', 'formas_pagamento', 'garantia', 'disponibilidade'],
        defaultObjections: ['preco_alto', 'precisa_comparar', 'nao_urgente', 'ja_tem_fornecedor', 'sem_orcamento_agora'],
        recommendedAgents: [
            industryAgent(
                'servicos_suporte',
                'AI Suporte de Operações',
                '🧰',
                'Suporte',
                'Atualiza status, escopo, prazos e alinhamentos do cliente em andamento.',
                'Atue como suporte operacional para clientes de serviços. Resolva dúvidas sobre status, escopo, entregas, cronograma, documentação, acionamentos e próximos passos sem criar ruído. Organize a resposta por prioridade, alinhe expectativa e reduza retrabalho. Quando detectar expansão de escopo, nova demanda ou oportunidade de upsell, encaminhe o contexto para o agente de vendas.',
            ),
            industryAgent(
                'servicos_vendas',
                'AI Consultor Comercial',
                '💼',
                'Vendas',
                'Diagnostica a necessidade, posiciona valor e conduz até proposta e contrato.',
                'Atue como consultor comercial de serviços. Entenda escopo, urgência, impacto do problema, prazo desejado, orçamento e decisores. Venda clareza, confiança de entrega, expertise e retorno esperado, não apenas horas ou execução. Trate objeções de preço, comparação e timing com firmeza consultiva e conduza para briefing final, proposta e fechamento.',
            ),
        ],
        recommendedFollowupSequences: [
            { trigger: 'orcamento_enviado', delay_minutes: 120, message_hint: 'Pergunte se teve alguma dúvida sobre a proposta enviada.' },
            { trigger: 'lead_nao_respondeu', delay_minutes: 1440, message_hint: 'Retome o contato perguntando se ainda tem interesse.' },
        ],
    },
    {
        id: 'generico',
        slug: 'generico',
        name: 'Genérico',
        icon: '⚡',
        description: 'Configuração padrão sem perfil específico. Ideal para negócios únicos.',
        defaultPipeline: [],
        defaultIntents: [],
        defaultObjections: [],
        recommendedAgents: [],
        recommendedFollowupSequences: [],
    },
];

export function getProfileBySlug(slug: string): IndustryProfile | undefined {
    return industryProfiles.find((profile) => profile.slug === slug);
}
