export const GUIDED_TOUR_VERSION = "platform-v1";

export type GuidedTourPlacement = "top" | "bottom" | "left" | "right" | "center";

export interface GuidedTourStep {
    id: string;
    route: string;
    targetId: string;
    placement: GuidedTourPlacement;
    popoverOffsetX?: number;
    popoverOffsetY?: number;
    title: string;
    description: string;
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
    {
        id: "welcome",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-revenue-header",
        placement: "center",
        title: "Seu comercial no WhatsApp, organizado para vender mais",
        description: "A Kogna reúne atendimento, operação, CRM, automações e inteligência em um só lugar. Aqui você acompanha o que está acontecendo, entende onde agir e transforma conversa em oportunidade real de venda.",
    },
    {
        id: "sidebar",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-sidebar",
        placement: "right",
        title: "Tudo da operação em um só lugar",
        description: "Aqui você navega por cada parte da sua operação comercial: métricas, canais, agentes, produtos, CRM, live chat, recovery e agenda. A ideia é simples: parar de trabalhar no improviso e ganhar controle do processo inteiro.",
    },
    {
        id: "revenue-header",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-revenue-header",
        placement: "bottom",
        title: "Veja a operação com clareza",
        description: "Esse painel mostra os principais números da sua receita e da sua operação comercial. Use essa visão para entender o que está funcionando, onde estão os gargalos e quais ações podem gerar mais resultado.",
    },
    {
        id: "revenue-urgency",
        route: "/dashboard/revenue-metrics",
        targetId: "tour-revenue-urgency",
        placement: "top",
        title: "Saiba onde agir primeiro",
        description: "Aqui a Kogna destaca leads, movimentos e alertas que merecem atenção agora. Em vez de tentar olhar tudo ao mesmo tempo, você enxerga o que é prioridade para acelerar respostas, recuperar oportunidades e aumentar conversão.",
    },
    {
        id: "whatsapp",
        route: "/whatsapp",
        targetId: "tour-whatsapp-main",
        placement: "bottom",
        title: "Conecte os números que movem sua operação",
        description: "Nesta área você conecta e gerencia os números de WhatsApp usados no atendimento e nas vendas. É por aqui que a operação entra em funcionamento, distribuindo conversas entre IA, equipe humana e fluxo comercial.",
    },
    {
        id: "brain",
        route: "/brain",
        targetId: "tour-brain-main",
        placement: "bottom",
        title: "Defina quem faz o quê nas conversas",
        description: "Aqui você cria e organiza os agentes de IA da sua operação. Cada agente pode assumir uma função específica, como atender, qualificar, vender, recuperar ou direcionar leads, deixando o processo mais claro e escalável.",
    },
    {
        id: "products",
        route: "/products",
        targetId: "tour-products-main",
        placement: "bottom",
        title: "Ensine a IA o que ela precisa vender",
        description: "Cadastre aqui seus produtos, ofertas, benefícios, imagens e informações comerciais. Isso ajuda a IA a responder com mais contexto, apresentar melhor sua solução e conduzir a conversa com muito mais precisão.",
    },
    {
        id: "crm",
        route: "/crm",
        targetId: "tour-crm-board",
        placement: "top",
        title: "Acompanhe cada oportunidade até o fechamento",
        description: "No CRM você enxerga em que etapa cada lead está, move oportunidades no funil e organiza o trabalho do time comercial. Assim fica mais fácil saber o que avançou, o que travou e onde pode existir perda de venda.",
    },
    {
        id: "live-chat",
        route: "/live-chat",
        targetId: "tour-live-chat-layout",
        placement: "center",
        popoverOffsetX: 180,
        title: "Assuma conversas importantes na hora certa",
        description: "Quando uma conversa precisa de atuação humana, é aqui que ela chega. O live chat reúne histórico, contexto e informações úteis para o time entrar rápido, responder melhor e continuar a negociação sem perder o fio da conversa.",
    },
    {
        id: "recovery",
        route: "/recovery",
        targetId: "tour-recovery-main",
        placement: "bottom",
        title: "Recupere leads sem depender de acompanhamento manual",
        description: "Essa área serve para reativar contatos que esfriaram ao longo da jornada. Você cria sequências de follow-up, define abordagens e mantém oportunidades em movimento, aumentando as chances de recuperar receita que ficaria parada.",
    },
    {
        id: "agenda",
        route: "/agenda",
        targetId: "tour-agenda-main",
        placement: "bottom",
        title: "Organize os próximos passos do time",
        description: "Na agenda você acompanha compromissos, horários e atividades ligadas à operação comercial. Isso ajuda a dar visibilidade ao que precisa ser feito, alinhar ações do time e não deixar nenhum passo importante sem acompanhamento.",
    },
    {
        id: "vendedores",
        route: "/vendedores",
        targetId: "tour-vendedores-main",
        placement: "bottom",
        title: "Distribuicao inteligente da equipe",
        description: "Essa tela garante que os leads avancem para as pessoas certas, no momento certo.",
    },
    {
        id: "clients",
        route: "/clients",
        targetId: "tour-clients-main",
        placement: "bottom",
        title: "A visao dos clientes conquistados",
        description: "Use essa area para acompanhar receita fechada, ticket medio e carteira ativa.",
    },
    {
        id: "billing",
        route: "/billing",
        targetId: "tour-billing-main",
        placement: "bottom",
        title: "O abastecimento da plataforma",
        description: "Aqui voce acompanha saldo, recarrega Koins e garante continuidade no atendimento da operacao.",
    },
    {
        id: "settings",
        route: "/settings?tab=profile",
        targetId: "tour-settings-main",
        placement: "right",
        title: "A base que mantem tudo alinhado",
        description: "Use configuracoes para manter dados da empresa, regras operacionais e conexoes sempre organizados.",
    },
];
