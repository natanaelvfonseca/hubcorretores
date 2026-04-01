import type { LucideIcon } from 'lucide-react';
import {
    BellRing,
    BrainCircuit,
    Blocks,
    Building2,
    CalendarRange,
    Crown,
    FolderKanban,
    HeartHandshake,
    LayoutDashboard,
    MapPinned,
    MessagesSquare,
    Network,
    Settings2,
    Smartphone,
    Sparkles,
    UserCircle2,
} from 'lucide-react';

export interface HubMetric {
    value: string;
    label: string;
    description: string;
}

export interface HubPillar {
    title: string;
    description: string;
}

export interface HubPageMapItem {
    title: string;
    description: string;
}

export interface HubModuleDefinition {
    id: string;
    path: string;
    navLabel: string;
    title: string;
    eyebrow: string;
    summary: string;
    icon: LucideIcon;
    audience: string[];
    spotlight: string[];
    capabilities: string[];
    pages: HubPageMapItem[];
    workflow: string[];
    supportNote: string;
}

export interface HubNavSection {
    title: string;
    items: string[];
}

export const hubSnapshotMetrics: HubMetric[] = [
    {
        value: '12.800+',
        label: 'Profissionais conectados',
        description: 'Comunidade regional com escala nacional de percepcao e alto potencial de relacionamento.',
    },
    {
        value: '150+',
        label: 'Parceiros no Clube',
        description: 'Rede de beneficios que amplia pertencimento e recorrencia de uso dentro da propria plataforma.',
    },
    {
        value: 'Litoral SC',
        label: 'Base territorial proprietaria',
        description: 'A operacao nasce ancorada na forca do mercado imobiliario catarinense e na vida local.',
    },
    {
        value: 'WhatsApp + HUB',
        label: 'Comunicacao assistida',
        description: 'O WhatsApp segue como apoio tatico, mas o valor e a organizacao passam a morar no produto.',
    },
];

export const hubPillars: HubPillar[] = [
    {
        title: 'Comunidade proprietária',
        description: 'A relação entre membros, empresas e parceiros passa a ser mediada pelo HUB e não pelos grupos soltos.',
    },
    {
        title: 'Negócios com contexto',
        description: 'Oportunidades, imóveis, indicações e demandas circulam com filtro, prioridade e histórico.',
    },
    {
        title: 'Ecossistema regional forte',
        description: 'Corretores, imobiliárias, construtoras, fornecedores e benefícios convivem dentro do mesmo ambiente.',
    },
    {
        title: 'Percepção premium',
        description: 'A experiência transmite autoridade, curadoria e exclusividade em cada ponto de contato.',
    },
];

export const hubModules: HubModuleDefinition[] = [
    {
        id: 'dashboard',
        path: '/dashboard',
        navLabel: 'Dashboard',
        title: 'Dashboard Principal da Comunidade',
        eyebrow: 'Base oficial do ecossistema',
        summary: 'Visão executiva da comunidade, dos movimentos do dia e das oportunidades que merecem ação imediata.',
        icon: LayoutDashboard,
        audience: ['Corretores', 'Imobiliárias', 'Construtoras', 'Parceiros estratégicos'],
        spotlight: [
            'Resumo diário da comunidade, agenda e negócios em evidência.',
            'Leitura rápida das frentes mais aquecidas do litoral catarinense.',
            'Porta de entrada premium para toda a operação da HUB.',
        ],
        capabilities: [
            'Cards com indicadores da comunidade, negócios, agenda e vantagens.',
            'Curadoria das oportunidades em destaque e dos imóveis mais relevantes.',
            'Atalhos para networking, mural, canais segmentados e clube de vantagens.',
            'Mapa completo da plataforma para novos membros entenderem rapidamente o ecossistema.',
        ],
        pages: [
            { title: 'Visão Geral', description: 'Resumo das movimentações do dia, destaques e ações prioritárias.' },
            { title: 'Radar Regional', description: 'Leitura rápida dos polos, segmentos e conexões em alta.' },
            { title: 'Central de Acesso', description: 'Entrada estruturada para todos os módulos da plataforma.' },
        ],
        workflow: [
            'Entrar na plataforma e entender o cenário do dia em menos de dois minutos.',
            'Priorizar networking, negócios e canais a partir dos destaques do dashboard.',
            'Voltar ao dashboard ao longo do dia para acompanhar novas movimentações.',
        ],
        supportNote: 'O WhatsApp atua como ponte de comunicação e alerta, nunca como repositório central das decisões.',
    },
    {
        id: 'networking',
        path: '/networking',
        navLabel: 'Networking',
        title: 'Networking Entre Corretores',
        eyebrow: 'Relacionamento com contexto',
        summary: 'Ambiente para gerar conexões qualificadas entre profissionais do litoral catarinense com base em perfil, região e especialidade.',
        icon: Network,
        audience: ['Corretores autônomos', 'Times comerciais', 'Líderes de imobiliária'],
        spotlight: [
            'Perfis profissionais estruturados e com sinais de confiança.',
            'Conexões feitas por cidade, nicho, faixa de imóvel e tipo de operação.',
            'Introduções com contexto, evitando ruído e superficialidade.',
        ],
        capabilities: [
            'Busca inteligente por especialidade, cidade, segmento e disponibilidade de parceria.',
            'Pedidos de conexão com contexto comercial e objetivo da aproximação.',
            'Histórico de interações e registro das oportunidades abertas a partir do relacionamento.',
            'Selos de participação, reputação comunitária e presença em eventos.',
        ],
        pages: [
            { title: 'Vitrine de Membros', description: 'Descoberta de profissionais por perfil, atuação e relevância.' },
            { title: 'Conexões em Andamento', description: 'Pedidos, respostas e relacionamentos em construção.' },
            { title: 'Rodadas de Relacionamento', description: 'Espaço para ações especiais de integração e networking curado.' },
        ],
        workflow: [
            'Filtrar profissionais com base no tipo de negócio que precisa ser destravado.',
            'Enviar uma solicitação contextualizada com imóvel, demanda ou parceria desejada.',
            'Migrar a conversa para WhatsApp apenas quando a conexão já estiver qualificada no HUB.',
        ],
        supportNote: 'O primeiro contato nasce na plataforma; o WhatsApp entra como extensão operacional depois do match.',
    },
    {
        id: 'oportunidades',
        path: '/oportunidades',
        navLabel: 'Oportunidades',
        title: 'Feed de Oportunidades e Negócios',
        eyebrow: 'Negócios em circulação',
        summary: 'Feed central para publicar demandas, compartilhar negociações e concentrar as melhores oportunidades do litoral.',
        icon: Sparkles,
        audience: ['Corretores', 'Captação', 'Coordenação comercial'],
        spotlight: [
            'Oportunidades com contexto comercial, prioridade e urgência.',
            'Leads, indicações e demandas reunidos em um só fluxo profissional.',
            'Menos ruído do que grupos abertos e muito mais rastreabilidade.',
        ],
        capabilities: [
            'Publicação de oportunidades com tipo de negócio, cidade, faixa, etapa e briefing.',
            'Filtros por urgência, região, perfil de comprador, locação e captação.',
            'Sinalização de interesse, andamento, parceria ativa e encerramento da oportunidade.',
            'Anexos, comentários estratégicos e histórico de quem participou do negócio.',
        ],
        pages: [
            { title: 'Feed Geral', description: 'Fluxo central de oportunidades da comunidade.' },
            { title: 'Oportunidades Urgentes', description: 'Demandas que pedem resposta rápida e coordenação imediata.' },
            { title: 'Negócios em Parceria', description: 'Acompanhamento das oportunidades que já estão em tratativa.' },
        ],
        workflow: [
            'Publicar a oportunidade com contexto suficiente para mobilizar a rede certa.',
            'Receber sinalizações qualificadas e avançar com quem faz sentido para o negócio.',
            'Atualizar o status no HUB e usar o WhatsApp apenas para continuidade da tratativa.',
        ],
        supportNote: 'A plataforma concentra contexto, histórico e inteligência; o WhatsApp serve para acelerar o fechamento.',
    },
    {
        id: 'imoveis',
        path: '/imoveis',
        navLabel: 'Imóveis',
        title: 'Imóveis e Oportunidades em Destaque',
        eyebrow: 'Vitrine com curadoria',
        summary: 'Área para destacar imóveis, carteiras e oportunidades especiais com apresentação compatível com um ambiente premium.',
        icon: Building2,
        audience: ['Corretores', 'Imobiliárias', 'Construtoras', 'Investidores convidados'],
        spotlight: [
            'Imóveis organizados por região, padrão, estágio e interesse.',
            'Vitrine que valoriza bons ativos e facilita a conexão entre membros.',
            'Espaço preparado para alto padrão, lançamentos e oportunidades estratégicas.',
        ],
        capabilities: [
            'Cards ricos com localização, diferenciais, faixa de valor e status comercial.',
            'Separação por lançamentos, revenda, locação anual, temporada e rural.',
            'Destaques editoriais da HUB para imóveis com maior relevância comercial.',
            'Sinalização de interesse e abertura direta de conversa a partir do ativo.',
        ],
        pages: [
            { title: 'Vitrine Principal', description: 'Curadoria dos imóveis mais relevantes da comunidade.' },
            { title: 'Destaques Premium', description: 'Seleção de alto padrão e oportunidades de maior percepção de valor.' },
            { title: 'Carteiras Segmentadas', description: 'Navegação por locação, rural, temporada e outros recortes estratégicos.' },
        ],
        workflow: [
            'Publicar ou curar o ativo com padrão visual consistente e informação comercial objetiva.',
            'Distribuir o imóvel dentro do segmento correto do HUB.',
            'Levar a conversa para o canal mais adequado somente após o interesse qualificado.',
        ],
        supportNote: 'A descoberta e o contexto acontecem na plataforma; o WhatsApp apoia follow-up, visita e fechamento.',
    },
    {
        id: 'diretorio',
        path: '/diretorio',
        navLabel: 'Diretórios',
        title: 'Diretório de Corretores, Imobiliárias e Construtoras',
        eyebrow: 'Quem faz parte do ecossistema',
        summary: 'Diretório institucional para tornar a comunidade mais confiável, verificável e fácil de navegar por perfis e empresas.',
        icon: MapPinned,
        audience: ['Corretores', 'Imobiliárias', 'Construtoras', 'Parceiros homologados'],
        spotlight: [
            'Mapa vivo dos principais agentes do litoral catarinense.',
            'Perfis mais profissionais e rastreáveis do que contatos espalhados em grupos.',
            'Base para networking, indicações e credibilidade institucional.',
        ],
        capabilities: [
            'Perfis públicos e verificáveis com cidade, foco de atuação e especialidades.',
            'Páginas institucionais para imobiliárias, construtoras e empresas parceiras.',
            'Filtros por região, tipo de empresa, segmento e foco comercial.',
            'Selos de confiança, histórico comunitário e destaque editorial.',
        ],
        pages: [
            { title: 'Corretores', description: 'Diretório profissional dos membros ativos.' },
            { title: 'Imobiliárias', description: 'Empresas do mercado regional com presença institucional.' },
            { title: 'Construtoras', description: 'Frente dedicada a lançamentos, parcerias e relacionamento com incorporadoras.' },
        ],
        workflow: [
            'Descobrir quem é quem dentro da comunidade com filtros claros.',
            'Entrar em contato com contexto e legitimidade institucional.',
            'Usar o diretório como base para toda conexão comercial dentro da HUB.',
        ],
        supportNote: 'O diretório transforma nomes soltos em ativos relacionais organizados e acionáveis.',
    },
    {
        id: 'clube',
        path: '/clube',
        navLabel: 'Clube de Vantagens',
        title: 'Clube de Vantagens e Benefícios',
        eyebrow: 'Valor percebido no uso recorrente',
        summary: 'Área dedicada aos benefícios da comunidade, reforçando pertencimento, utilidade prática e presença regional da marca HUB.',
        icon: Crown,
        audience: ['Membros da comunidade', 'Parceiros comerciais', 'Empresas convidadas'],
        spotlight: [
            'Mais de 150 estabelecimentos parceiros integrados à experiência da plataforma.',
            'Benefícios como parte da proposta de valor, não como um extra isolado.',
            'Fortalecimento da marca HUB no cotidiano profissional e pessoal dos membros.',
        ],
        capabilities: [
            'Catálogo organizado por categoria, cidade e tipo de benefício.',
            'Páginas de parceiros com regras de uso, diferenciais e canais de ativação.',
            'Destaques editoriais, campanhas sazonais e novidades do clube.',
            'Identidade digital do membro para ativação simples do benefício.',
        ],
        pages: [
            { title: 'Benefícios em Destaque', description: 'Curadoria do que merece visibilidade imediata.' },
            { title: 'Parceiros do Clube', description: 'Lista completa de empresas e estabelecimentos participantes.' },
            { title: 'Ativações Regionais', description: 'Ações, campanhas e experiências do clube na região.' },
        ],
        workflow: [
            'Descobrir benefícios relevantes para o dia a dia do membro.',
            'Ativar a vantagem com identificação clara dentro da plataforma.',
            'Gerar recorrência de acesso e vínculo com a marca HUB ao longo da jornada.',
        ],
        supportNote: 'O clube deixa de ser uma informação espalhada e passa a ser um módulo vivo, navegável e memorável.',
    },
    {
        id: 'agenda',
        path: '/agenda',
        navLabel: 'Agenda',
        title: 'Agenda de Eventos, Encontros e Ações Presenciais',
        eyebrow: 'Presença física com organização digital',
        summary: 'Calendário oficial da comunidade para encontros, palestras, imersões e ações locais que fortalecem a rede.',
        icon: CalendarRange,
        audience: ['Comunidade inteira', 'Gestão HUB', 'Parceiros de conteúdo'],
        spotlight: [
            'A agenda institucionaliza a força dos encontros presenciais da comunidade.',
            'Eventos deixam de depender de disparos informais e passam a ter gestão clara.',
            'Mais previsibilidade para participação, inscrição e comunicação.',
        ],
        capabilities: [
            'Calendário por mês, tipo de evento, cidade e capacidade.',
            'Páginas de evento com descrição, convidados, pauta e orientações.',
            'Confirmação de presença, lista de espera e lembretes.',
            'Área de pós-evento com registros, materiais e continuidade de networking.',
        ],
        pages: [
            { title: 'Calendário Geral', description: 'Visualização central de todos os eventos da comunidade.' },
            { title: 'Eventos em Destaque', description: 'Curadoria dos encontros com maior impacto na rede.' },
            { title: 'Memória de Eventos', description: 'Registro dos encontros já realizados e seus desdobramentos.' },
        ],
        workflow: [
            'Divulgar a ação com antecedência e contexto profissional.',
            'Confirmar presença e organizar interação entre participantes.',
            'Manter a comunidade conectada antes, durante e depois do evento.',
        ],
        supportNote: 'O WhatsApp reforça convites e lembretes, mas a inscrição, o contexto e a memória ficam no HUB.',
    },
    {
        id: 'canais',
        path: '/canais',
        navLabel: 'Canais',
        title: 'Grupos e Canais por Segmento',
        eyebrow: 'Comunicação estruturada',
        summary: 'Central segmentada para organizar as frentes da comunidade com muito mais governança do que grupos soltos.',
        icon: MessagesSquare,
        audience: ['Corretores', 'Imobiliárias', 'Construtoras', 'Moderadores'],
        spotlight: [
            'Os segmentos deixam de ser só grupos e passam a ser ambientes com regra, contexto e curadoria.',
            'Cada canal comunica um assunto claro e conectado ao restante do produto.',
            'A plataforma passa a ser a camada de organização da conversa comunitária.',
        ],
        capabilities: [
            'Canais por tema, nicho e objetivo com regras visíveis e moderação.',
            'Resumo editorial, destaques e arquivos relevantes por segmento.',
            'Integração com alertas e links para grupos de apoio no WhatsApp quando necessário.',
            'Central de comunicados oficiais e avisos estratégicos da HUB.',
        ],
        pages: [
            { title: 'Corretores e Imobiliárias', description: 'Frente principal de relacionamento e troca profissional.' },
            { title: 'Construtoras e Lançamentos', description: 'Canal dedicado ao relacionamento com incorporadoras e novos produtos.' },
            { title: 'Marketing, Prestadores e Construção', description: 'Espaço para demandas operacionais e serviços que orbitam o mercado.' },
        ],
        workflow: [
            'Entrar no canal certo com clareza de propósito.',
            'Encontrar contexto, regras e materiais antes de interagir.',
            'Usar grupos de apoio no WhatsApp apenas como extensão de comunicação imediata.',
        ],
        supportNote: 'O canal vive no HUB e o grupo vira apoio de distribuição, nunca mais a estrutura inteira.',
    },
    {
        id: 'mural',
        path: '/mural',
        navLabel: 'Mural',
        title: 'Mural de Oportunidades, Vagas e Indicações',
        eyebrow: 'Demandas da comunidade em um só lugar',
        summary: 'Espaço para divulgar vagas, pedidos de indicação, demandas operacionais e necessidades emergentes do mercado.',
        icon: FolderKanban,
        audience: ['Corretores', 'Gestores', 'Parceiros operacionais'],
        spotlight: [
            'O mural transforma pedidos dispersos em itens rastreáveis e bem categorizados.',
            'Melhora a velocidade de resposta sem perder organização.',
            'Cria uma camada profissional para vagas, indicações e apoio entre membros.',
        ],
        capabilities: [
            'Publicações com prazo, categoria, localidade e responsável.',
            'Áreas para vagas, indicações profissionais, co-listagem e demandas operacionais.',
            'Filtros por urgência, tipo de necessidade e cidade.',
            'Respostas estruturadas e histórico de encaminhamentos.',
        ],
        pages: [
            { title: 'Vagas', description: 'Oportunidades para equipes comerciais, administrativas e apoio.' },
            { title: 'Indicações', description: 'Pedidos de profissionais, parceiros e conexões específicas.' },
            { title: 'Demandas Operacionais', description: 'Necessidades rápidas que pedem ação da comunidade.' },
        ],
        workflow: [
            'Publicar uma necessidade com contexto suficiente para gerar resposta útil.',
            'Receber indicações e encaminhamentos dentro do próprio HUB.',
            'Levar a conversa para canais externos apenas após a triagem inicial.',
        ],
        supportNote: 'O mural reduz o ruído de mensagens soltas e preserva o histórico do que foi pedido e resolvido.',
    },
    {
        id: 'parceiros',
        path: '/parceiros',
        navLabel: 'Parceiros',
        title: 'Parceiros, Fornecedores e Prestadores de Serviço',
        eyebrow: 'Rede de apoio ao mercado',
        summary: 'Área para mapear e valorizar empresas que sustentam o ecossistema imobiliário regional além da compra e venda.',
        icon: HeartHandshake,
        audience: ['Fornecedores', 'Prestadores', 'Corretores', 'Gestores'],
        spotlight: [
            'Expande o valor do HUB para além do corretor e do imóvel.',
            'Conecta serviços estratégicos ao dia a dia do mercado regional.',
            'Reforça a percepção de ecossistema e não apenas de comunidade social.',
        ],
        capabilities: [
            'Diretório segmentado para marketing, fotografia, jurídico, documentação, tecnologia e construção civil.',
            'Perfis institucionais com áreas atendidas, especialidades e diferenciais.',
            'Solicitação de orçamento ou contato com registro interno da demanda.',
            'Destaque para parceiros homologados e benefícios associados.',
        ],
        pages: [
            { title: 'Fornecedores Estratégicos', description: 'Empresas-chave para a operação imobiliária regional.' },
            { title: 'Prestadores da Construção', description: 'Rede de apoio para obras, reformas e manutenção.' },
            { title: 'Serviços de Marketing e Vendas', description: 'Profissionais e agências que potencializam performance.' },
        ],
        workflow: [
            'Encontrar o parceiro certo pelo tipo de necessidade.',
            'Avaliar escopo, região atendida e credenciais do fornecedor.',
            'Acionar o contato com mais segurança e menos fricção operacional.',
        ],
        supportNote: 'A HUB vira o índice confiável de quem presta serviço para o mercado imobiliário do litoral.',
    },
    {
        id: 'segmentos',
        path: '/segmentos',
        navLabel: 'Segmentos',
        title: 'Segmentos Estratégicos do Mercado',
        eyebrow: 'Sub-hubs especializados',
        summary: 'Frente dedicada aos recortes que já movem a comunidade: rural, locação, temporada, alto valor, consórcios e cartas contempladas.',
        icon: Blocks,
        audience: ['Especialistas de nicho', 'Corretores parceiros', 'Empresas focadas em segmentos específicos'],
        spotlight: [
            'Cada segmento ganha linguagem, filtros e dinâmica próprios.',
            'A comunidade preserva a pluralidade sem perder organização.',
            'Sub-hubs ajudam a criar pertencimento por afinidade de negócio.',
        ],
        capabilities: [
            'Áreas segmentadas para alto valor, rural, locação anual, temporada e consórcios.',
            'Conteúdo, oportunidades e canais específicos por nicho.',
            'Curadoria editorial e destaque para demandas realmente aderentes ao segmento.',
            'Facilidade para circular negócios especializados sem poluir o feed principal.',
        ],
        pages: [
            { title: 'Alto Valor', description: 'Oportunidades de ticket elevado e relacionamento premium.' },
            { title: 'Rural e Patrimonial', description: 'Frente para propriedades rurais, sítios e ativos especiais.' },
            { title: 'Locação e Consórcios', description: 'Espaço para locação anual, temporada e cartas contempladas.' },
        ],
        workflow: [
            'Entrar no segmento que mais conversa com sua atuação.',
            'Consumir oportunidades e conteúdo filtrados por nicho.',
            'Levar para o feed geral apenas o que faz sentido para toda a comunidade.',
        ],
        supportNote: 'Segmentação deixa de ser pulverização e vira arquitetura clara dentro do ecossistema.',
    },
    {
        id: 'notificacoes',
        path: '/notificacoes',
        navLabel: 'Notificações',
        title: 'Central de Notificações',
        eyebrow: 'Ritmo e recorrência da comunidade',
        summary: 'Camada de comunicação inteligente para manter membros atualizados sem depender da avalanche de mensagens instantâneas.',
        icon: BellRing,
        audience: ['Todos os membros', 'Administração da HUB'],
        spotlight: [
            'Notificações deixam de ser barulho e passam a ser sinais úteis.',
            'Cada alerta nasce de uma ação dentro da plataforma.',
            'Resumo do dia, urgências e novidades com hierarquia clara.',
        ],
        capabilities: [
            'Alertas para conexões, oportunidades, eventos, benefícios e novos canais.',
            'Preferências por tipo de aviso e prioridade.',
            'Resumo diário ou semanal da atividade relevante da comunidade.',
            'Envio complementar por e-mail ou WhatsApp quando a plataforma definir como necessário.',
        ],
        pages: [
            { title: 'Central do Membro', description: 'Visão consolidada dos avisos mais importantes.' },
            { title: 'Preferências', description: 'Controle do que chega, por qual canal e com que prioridade.' },
            { title: 'Resumo da Comunidade', description: 'Digest com os principais movimentos do período.' },
        ],
        workflow: [
            'Receber somente o que importa para sua atuação e seu momento.',
            'Voltar para a plataforma a partir de um alerta com contexto suficiente.',
            'Usar o WhatsApp apenas como reforço para sinais de alta prioridade.',
        ],
        supportNote: 'A inteligência da notificação nasce no HUB e distribui para outros canais apenas quando faz sentido.',
    },
    {
        id: 'perfil',
        path: '/perfil',
        navLabel: 'Perfil',
        title: 'Perfil do Membro',
        eyebrow: 'Identidade profissional dentro da comunidade',
        summary: 'Página pessoal do membro com posicionamento, especialidades, regiões atendidas e sinais de reputação comunitária.',
        icon: UserCircle2,
        audience: ['Cada membro da comunidade'],
        spotlight: [
            'Perfil vira ativo de networking, autoridade e geração de negócios.',
            'Mais contexto e confiança do que nome e telefone em um grupo.',
            'Base para busca, indicação e relacionamento recorrente.',
        ],
        capabilities: [
            'Bio profissional, cidade base, áreas atendidas e especialidades.',
            'Destaque para experiências, nichos e parceiros preferenciais.',
            'Selos de participação, eventos, conexões e contribuições relevantes.',
            'Links rápidos para oportunidades, imóveis, benefícios e contatos.',
        ],
        pages: [
            { title: 'Identidade Profissional', description: 'Resumo do posicionamento e especialidades do membro.' },
            { title: 'Atuação e Nichos', description: 'Regiões, segmentos e tipos de negócio em que atua.' },
            { title: 'Sinais de Comunidade', description: 'Indicadores de participação, reputação e conexões.' },
        ],
        workflow: [
            'Completar o perfil com foco em clareza comercial e legitimidade.',
            'Usar o perfil como vitrine de atuação dentro do HUB.',
            'Atualizar o posicionamento conforme a rede e os negócios evoluem.',
        ],
        supportNote: 'O perfil substitui o contato genérico por uma presença profissional e memorável.',
    },
    {
        id: 'configuracoes',
        path: '/configuracoes',
        navLabel: 'Configurações',
        title: 'Configurações e Governança do Membro',
        eyebrow: 'Controle, privacidade e integrações',
        summary: 'Área para preferências de conta, visibilidade do perfil, canais de aviso e regras de participação dentro da comunidade.',
        icon: Settings2,
        audience: ['Todos os membros'],
        spotlight: [
            'Governança clara para um ambiente premium e seguro.',
            'Preferências de comunicação alinhadas ao momento de cada membro.',
            'Controle de privacidade e presença digital dentro da plataforma.',
        ],
        capabilities: [
            'Configurações de conta, segurança e visibilidade do perfil.',
            'Preferências de notificação, resumo e comunicação integrada.',
            'Definição de segmentos de interesse e áreas de atuação prioritárias.',
            'Regras de participação, termos e histórico de consentimentos.',
        ],
        pages: [
            { title: 'Conta e Segurança', description: 'Dados principais, acesso e proteção da conta.' },
            { title: 'Comunicação Integrada', description: 'Preferências de alertas e uso complementar do WhatsApp.' },
            { title: 'Privacidade e Participação', description: 'Regras de exibição e interação dentro da comunidade.' },
        ],
        workflow: [
            'Configurar a experiência conforme a atuação profissional do membro.',
            'Definir como e quando deseja ser acionado pela comunidade.',
            'Ajustar visibilidade e governança sem perder fluidez na operação.',
        ],
        supportNote: 'Configurações deixam claro que a HUB é um produto profissional com regras e autonomia do usuário.',
    },
    {
        id: 'brain',
        path: '/brain',
        navLabel: 'Brain',
        title: 'Central de IAs',
        eyebrow: 'Operacao inteligente',
        summary: 'Gerencie agentes, configuracoes e a camada de inteligencia artificial da operacao sem sair do HUB.',
        icon: BrainCircuit,
        audience: ['Gestao', 'Times comerciais', 'Operacao com IA'],
        spotlight: [
            'Agentes prontos para atendimento, prospeccao e suporte.',
            'Base de inteligencia conectada ao WhatsApp e ao contexto da empresa.',
            'Camada operacional preservada dentro do novo frontend do HUB.',
        ],
        capabilities: [
            'Criacao e edicao de agentes de IA.',
            'Controle de status, modelos e instrucoes avancadas.',
            'Conexao entre agentes e canais operacionais.',
            'Gestao centralizada da camada de automacao.',
        ],
        pages: [
            { title: 'Minhas IAs', description: 'Painel para criar, editar e acompanhar agentes ativos na operacao.' },
            { title: 'Configuracao', description: 'Ajustes de contexto, instrucoes e conexoes dos agentes.' },
            { title: 'Status operacional', description: 'Leitura rapida do que esta ativo, pausado ou sem conexao.' },
        ],
        workflow: [
            'Criar ou revisar agentes conforme o objetivo da operacao.',
            'Conectar canais e ajustar comportamento antes da entrada em producao.',
            'Acompanhar status e evoluir a inteligencia sem sair do HUB.',
        ],
        supportNote: 'A camada de IA segue operacional no produto e agora convive com a comunidade proprietaria do HUB.',
    },
    {
        id: 'crm',
        path: '/crm',
        navLabel: 'CRM',
        title: 'CRM e Funil Comercial',
        eyebrow: 'Pipeline de oportunidades',
        summary: 'Area de funil, leads e oportunidades para acompanhar a operacao comercial de forma visual e estruturada.',
        icon: FolderKanban,
        audience: ['Corretores', 'SDRs', 'Gestores comerciais'],
        spotlight: [
            'Kanban comercial com visao clara do pipeline.',
            'Organizacao de leads e oportunidades em andamento.',
            'Operacao comercial integrada ao ecossistema do HUB.',
        ],
        capabilities: [
            'Gestao de leads por etapa do funil.',
            'Criacao, edicao, exclusao e conversao de oportunidades.',
            'Abertura rapida de novos registros comerciais.',
            'Feedback operacional com notificacoes visuais.',
        ],
        pages: [
            { title: 'Funil de vendas', description: 'Quadro principal para acompanhar cada oportunidade.' },
            { title: 'Cadastro de leads', description: 'Entrada estruturada de novos contatos e demandas.' },
            { title: 'Resumo do lead', description: 'Visao rapida para editar, converter ou encerrar tratativas.' },
        ],
        workflow: [
            'Registrar novos leads vindos da comunidade ou de canais externos.',
            'Avancar oportunidades no funil com mais controle e historico.',
            'Transformar a relacao em processo comercial e nao apenas conversa solta.',
        ],
        supportNote: 'O CRM recoloca a camada de vendas pronta do sistema base dentro da experiencia atual do HUB.',
    },
    {
        id: 'whatsapp',
        path: '/whatsapp',
        navLabel: 'WhatsApp',
        title: 'Conexoes WhatsApp',
        eyebrow: 'Evolution API e canais',
        summary: 'Central para conectar, monitorar e manter as linhas WhatsApp usadas pela operacao, com a Evolution API no backend.',
        icon: Smartphone,
        audience: ['Gestao', 'Operacao', 'Times com automacao'],
        spotlight: [
            'Painel unico para linhas conectadas e status em tempo real.',
            'Fluxo de QR code para novas conexoes.',
            'Base operacional que conversa com a camada de IA.',
        ],
        capabilities: [
            'Listagem de instancias e status de conexao.',
            'Criacao de novas linhas via QR code.',
            'Reconexao e remocao de canais.',
            'Monitoramento das conexoes usadas pelos agentes.',
        ],
        pages: [
            { title: 'Linhas conectadas', description: 'Visao geral de canais online, offline e slots disponiveis.' },
            { title: 'Nova conexao', description: 'Fluxo para criar e autenticar uma nova linha de WhatsApp.' },
            { title: 'Gestao de instancias', description: 'Acompanhamento tecnico das conexoes operacionais.' },
        ],
        workflow: [
            'Abrir a central de conexoes e revisar o status das linhas.',
            'Gerar QR code para conectar um novo numero quando necessario.',
            'Vincular os canais certos a agentes e fluxos da operacao.',
        ],
        supportNote: 'O WhatsApp continua como canal tatico, agora com governanca operacional dentro do proprio sistema.',
    },

];

export const hubNavSections: HubNavSection[] = [
    { title: 'Comunidade', items: ['dashboard', 'networking', 'diretorio', 'canais'] },
    { title: 'Negocios', items: ['oportunidades', 'imoveis', 'mural', 'segmentos'] },
    { title: 'Operacao', items: ['brain', 'crm', 'whatsapp'] },
    { title: 'Ecossistema', items: ['clube', 'agenda', 'parceiros', 'notificacoes'] },
    { title: 'Conta', items: ['perfil', 'configuracoes'] },
];

export const hubAdminMetrics: HubMetric[] = [
    {
        value: 'Curadoria',
        label: 'Governança central',
        description: 'Membros, empresas, benefícios e comunicações passam por regras e padrões da plataforma.',
    },
    {
        value: 'Regional',
        label: 'Inteligência territorial',
        description: 'A administração enxerga o ecossistema por cidade, segmento e densidade de relacionamento.',
    },
    {
        value: 'Eventos',
        label: 'Programação oficial',
        description: 'A agenda deixa de ser improvisada e passa a fazer parte da operação institucional da HUB.',
    },
];

export const hubAdminAreas: HubPageMapItem[] = [
    {
        title: 'Gestão de membros e empresas',
        description: 'Validação de perfis, selos, presença institucional e organização do diretório regional.',
    },
    {
        title: 'Curadoria de negócios e segmentos',
        description: 'Destaques editoriais, moderação do feed e governança dos sub-hubs especializados.',
    },
    {
        title: 'Clube de vantagens e parceiros',
        description: 'Entrada, manutenção e destaque dos parceiros que reforçam o valor percebido da comunidade.',
    },
    {
        title: 'Agenda, comunicação e notificações',
        description: 'Controle da cadência institucional, dos eventos e dos avisos enviados para a base.',
    },
];

export const hubAdminCapabilities: string[] = [
    'Aprovação e verificação de membros, imobiliárias, construtoras e parceiros.',
    'Curadoria editorial de imóveis, oportunidades, destaques e comunicados oficiais.',
    'Gestão do clube de vantagens, campanhas regionais e relacionamento com parceiros.',
    'Painel de inteligência com leitura de crescimento, engajamento e densidade por segmento.',
    'Moderação de canais, mural, agendas e notificações com governança centralizada.',
];

export const hubSupportSignals: HubPageMapItem[] = [
    {
        title: 'WhatsApp como apoio operacional',
        description: 'Avisos rápidos, follow-up e comunicação complementar quando a ação já nasceu organizada na plataforma.',
    },
    {
        title: 'Hub como centro oficial',
        description: 'Perfis, oportunidades, benefícios, eventos e histórico ficam no produto, criando um ativo digital proprietário.',
    },
];

export const hubModuleMap = Object.fromEntries(
    hubModules.map((module) => [module.id, module]),
) as Record<string, HubModuleDefinition>;

export function getHubModuleById(id: string) {
    return hubModuleMap[id];
}

export function getHubModuleByPath(pathname: string) {
    return hubModules.find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`));
}
