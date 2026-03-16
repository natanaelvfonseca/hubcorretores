export const GUIDED_TOUR_VERSION = "platform-v1";

export type GuidedTourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface GuidedTourStep {
    id: string;
    route: string;
    targetId: string;
    placement: GuidedTourPlacement;
    title: string;
    problemSolved: string;
    description: string;
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
    {
        id: "welcome",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-topbar",
        placement: "bottom",
        title: "Seu Revenue OS comeca aqui",
        problemSolved: "Centraliza a operacao comercial em um unico fluxo.",
        description: "A Kogna conecta WhatsApp, IA e operacao comercial para transformar conversas em previsibilidade de receita.",
    },
    {
        id: "sidebar",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-sidebar",
        placement: "right",
        title: "Toda a plataforma em uma jornada",
        problemSolved: "Organiza cada etapa da receita dentro do mesmo sistema.",
        description: "Aqui voce navega entre metricas, canais, agentes, produtos, CRM, live chat, recovery e operacao da equipe.",
    },
    {
        id: "revenue-header",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-revenue-header",
        placement: "bottom",
        title: "Metricas para previsibilidade",
        problemSolved: "Mostra saude comercial, resultado e tendencia de receita.",
        description: "Esse painel resume pipeline, oportunidades, previsao e leitura executiva da operacao no WhatsApp.",
    },
    {
        id: "revenue-urgency",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-revenue-urgency",
        placement: "top",
        title: "Priorize o que nao pode esfriar",
        problemSolved: "Destaca os leads e movimentos que pedem acao agora.",
        description: "Use essa area para decidir onde agir primeiro, recuperar atencao e acelerar fechamento.",
    },
    {
        id: "whatsapp",
        route: "/whatsapp",
        targetId: "tour-whatsapp-main",
        placement: "bottom",
        title: "As linhas que alimentam a operacao",
        problemSolved: "Conecta os numeros de WhatsApp que recebem, distribuem e operam as conversas.",
        description: "Cada conexao vira um canal ativo para agentes, atendimento humano e roteamento comercial.",
    },
    {
        id: "brain",
        route: "/brain",
        targetId: "tour-brain-main",
        placement: "bottom",
        title: "Os agentes que executam o trabalho",
        problemSolved: "Define qual IA vende, qualifica, atende ou direciona cada conversa.",
        description: "Aqui voce configura os agentes que vao operar o WhatsApp com contexto e funcao clara.",
    },
    {
        id: "products",
        route: "/products",
        targetId: "tour-products-main",
        placement: "bottom",
        title: "O catalogo que a IA aprende a vender",
        problemSolved: "Organiza produtos, beneficios, imagens e promocoes para a conversa comercial.",
        description: "Essa camada ajuda a IA a apresentar ofertas corretas, com mais clareza e mais poder de conversao.",
    },
    {
        id: "crm",
        route: "/crm",
        targetId: "tour-crm-board",
        placement: "top",
        title: "O funil visual das oportunidades",
        problemSolved: "Mostra em que etapa cada lead esta e onde existe gargalo.",
        description: "Use o CRM para acompanhar avancos, mover oportunidades e dar contexto para o time comercial.",
    },
    {
        id: "live-chat",
        route: "/live-chat",
        targetId: "tour-live-chat-layout",
        placement: "center",
        title: "O workspace de conversas criticas",
        problemSolved: "Permite assumir chats importantes com resumo, temperatura e recomendacao da IA.",
        description: "Quando uma conversa pede toque humano, essa tela concentra historico, contexto e acao rapida.",
    },
    {
        id: "recovery",
        route: "/recovery",
        targetId: "tour-recovery-main",
        placement: "bottom",
        title: "Recuperacao automatica de receita",
        problemSolved: "Reengaja leads que esfriaram sem depender de acompanhamento manual.",
        description: "Aqui voce monta sequencias de follow-up e acompanha quem vai receber a proxima abordagem.",
    },
    {
        id: "agenda",
        route: "/agenda",
        targetId: "tour-agenda-main",
        placement: "bottom",
        title: "Agenda operacional do time",
        problemSolved: "Organiza compromissos, horarios e proximos passos humanos.",
        description: "A agenda ajuda a transformar conversas em reunioes, callbacks e execucao organizada.",
    },
    {
        id: "vendedores",
        route: "/vendedores",
        targetId: "tour-vendedores-main",
        placement: "bottom",
        title: "Distribuicao inteligente da equipe",
        problemSolved: "Controla disponibilidade, peso de distribuicao e capacidade de atendimento dos vendedores.",
        description: "Essa tela garante que os leads avancem para as pessoas certas, no momento certo.",
    },
    {
        id: "clients",
        route: "/clients",
        targetId: "tour-clients-main",
        placement: "bottom",
        title: "A visao dos clientes conquistados",
        problemSolved: "Consolida quem ja converteu e o valor confirmado pela operacao.",
        description: "Use essa area para acompanhar receita fechada, ticket medio e carteira ativa.",
    },
    {
        id: "billing",
        route: "/billing",
        targetId: "tour-billing-main",
        placement: "bottom",
        title: "O abastecimento da plataforma",
        problemSolved: "Mantem a IA operando com energia suficiente para atender e vender sem interrupcao.",
        description: "Aqui voce acompanha saldo, recarrega Koins e garante continuidade no atendimento da operacao.",
    },
    {
        id: "settings",
        route: "/settings?tab=profile",
        targetId: "tour-settings-main",
        placement: "right",
        title: "A base que mantem tudo alinhado",
        problemSolved: "Centraliza perfil, empresa, integracoes e ajustes estruturais da conta.",
        description: "Use configuracoes para manter dados da empresa, regras operacionais e conexoes sempre organizados.",
    },
];
