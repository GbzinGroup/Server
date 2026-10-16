/**
 * js/templates.js
 * -------------------------------------------------------------
 * Biblioteca de templates prontos.
 * Cada template gera um formulário compatível com o bot.
 *
 * Expõe: window.FF.templates
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[templates] config.js e utils.js precisam vir antes.');
    return;
  }

  /* =========================================================
   *  CATEGORIAS
   * =======================================================*/
  const CATEGORIAS = [
    { id: 'todos',    label: 'Todos',        emoji: '📚' },
    { id: 'discord',  label: 'Discord',      emoji: '💬' },
    { id: 'minecraft',label: 'Minecraft',    emoji: '⛏️' },
    { id: 'projeto',  label: 'Projetos',     emoji: '💼' },
    { id: 'geral',    label: 'Geral',        emoji: '📦' },
  ];

  /* =========================================================
   *  HELPER
   * =======================================================*/
  function p(pergunta, tipo = 'short', placeholder = '', obrigatoria = true) {
    return { pergunta, tipo, placeholder, obrigatoria };
  }

  /* =========================================================
   *  TEMPLATES
   * =======================================================*/
  const LISTA = [
    /* =========================================================
     *  DISCORD
     * =======================================================*/
    {
      id: 'discord-registro',
      cat: 'discord',
      emoji: '📝',
      nome: 'Registro de membro',
      desc: 'Formulário básico para novos membros se apresentarem.',
      cor: '#5865f2',
      dados: {
        titulo: 'Registro de Membro',
        descricao: 'Preencha para se registrar no servidor.',
        cor: '#5865f2',
        dm: true,
        anonimo: false,
        categoria: 'registro',
        perguntas: [
          p('Qual seu nome?', 'short', 'Ex: João'),
          p('Quantos anos você tem?', 'number', 'Ex: 18'),
          p('Onde nos encontrou?', 'short', 'Ex: YouTube', false),
        ],
      },
    },
    {
      id: 'discord-suporte',
      cat: 'discord',
      emoji: '🆘',
      nome: 'Ticket de suporte',
      desc: 'Para o membro descrever o problema que está enfrentando.',
      cor: '#57f287',
      dados: {
        titulo: 'Suporte',
        descricao: 'Descreva seu problema que entraremos em contato.',
        cor: '#57f287',
        dm: true,
        anonimo: false,
        categoria: 'suporte',
        perguntas: [
          p('Qual seu problema?', 'long', 'Descreva detalhadamente...'),
          p('Desde quando acontece?', 'short', 'Ex: hoje cedo'),
          p('Anexe prints se possível', 'short', 'Link do print', false),
        ],
      },
    },
    {
      id: 'discord-denuncia',
      cat: 'discord',
      emoji: '🚨',
      nome: 'Denúncia de membro',
      desc: 'Denuncie alguém que esteja quebrando as regras.',
      cor: '#ed4245',
      dados: {
        titulo: 'Denúncia',
        descricao: 'Denuncie um membro que esteja quebrando as regras.',
        cor: '#ed4245',
        dm: false,
        anonimo: true,
        categoria: 'denuncia',
        perguntas: [
          p('Quem você denuncia?', 'user', '@usuário'),
          p('O que aconteceu?', 'long', 'Conte com detalhes...'),
          p('Provas (links)', 'long', 'Links de prints/vídeos', false),
        ],
      },
    },
    {
      id: 'discord-staff',
      cat: 'discord',
      emoji: '👮',
      nome: 'Candidatura a Staff',
      desc: 'Formulário para quem quer entrar na equipe.',
      cor: '#9b59b6',
      dados: {
        titulo: 'Candidatura a Staff',
        descricao: 'Preencha com atenção. Analisaremos seu perfil.',
        cor: '#9b59b6',
        dm: true,
        anonimo: false,
        categoria: 'registro',
        perguntas: [
          p('Nome e idade', 'short', 'Ex: João, 18'),
          p('Horário disponível', 'short', 'Ex: 14h - 22h'),
          p('Experiência anterior', 'long', 'Já foi staff de algum servidor?'),
          p('Por que devemos te escolher?', 'long'),
        ],
      },
    },
    {
      id: 'discord-parceria',
      cat: 'discord',
      emoji: '🤝',
      nome: 'Proposta de parceria',
      desc: 'Para outros servidores proporem parceria.',
      cor: '#eb459e',
      dados: {
        titulo: 'Parceria',
        descricao: 'Proposta de parceria entre servidores.',
        cor: '#eb459e',
        dm: true,
        anonimo: false,
        categoria: 'registro',
        perguntas: [
          p('Nome do seu servidor', 'short'),
          p('Convite do servidor', 'short', 'discord.gg/...'),
          p('Membros aproximados', 'number', 'Ex: 500'),
          p('Mensagem', 'long', '', false),
        ],
      },
    },
    {
      id: 'discord-sugestao',
      cat: 'discord',
      emoji: '💡',
      nome: 'Sugestão',
      desc: 'Para membros darem ideias de melhoria.',
      cor: '#fee75c',
      dados: {
        titulo: 'Sugestão',
        descricao: 'Sua opinião é muito importante!',
        cor: '#fee75c',
        dm: true,
        anonimo: false,
        categoria: 'sugestao',
        perguntas: [
          p('Sua sugestão', 'long', 'Descreva sua ideia...'),
          p('Por que isso seria bom?', 'long', '', false),
        ],
      },
    },
    {
      id: 'discord-evento',
      cat: 'discord',
      emoji: '🎉',
      nome: 'Inscrição em evento',
      desc: 'Para membros se inscreverem em eventos.',
      cor: '#f1c40f',
      dados: {
        titulo: 'Inscrição no Evento',
        descricao: 'Inscreva-se para participar!',
        cor: '#f1c40f',
        dm: true,
        anonimo: false,
        categoria: 'evento',
        perguntas: [
          p('Nome de jogador', 'short'),
          p('Disponibilidade', 'short', 'Ex: Sábado 20h'),
          p('Observações', 'long', '', false),
        ],
      },
    },
    {
      id: 'discord-feedback',
      cat: 'discord',
      emoji: '📊',
      nome: 'Pesquisa de satisfação',
      desc: 'Colete feedback dos membros sobre o servidor.',
      cor: '#3498db',
      dados: {
        titulo: 'Pesquisa de Satisfação',
        descricao: 'Nos ajude a melhorar o servidor!',
        cor: '#3498db',
        dm: false,
        anonimo: true,
        categoria: 'outro',
        perguntas: [
          p('De 0 a 10, quanto recomenda o servidor?', 'number', 'Ex: 9'),
          p('O que mais gosta aqui?', 'long'),
          p('O que podemos melhorar?', 'long'),
        ],
      },
    },
    {
      id: 'discord-criadores',
      cat: 'discord',
      emoji: '🎬',
      nome: 'Cadastro de criador de conteúdo',
      desc: 'Para YouTubers e streamers se cadastrarem.',
      cor: '#e74c3c',
      dados: {
        titulo: 'Cadastro de Criador',
        descricao: 'Cadastre-se como criador de conteúdo.',
        cor: '#e74c3c',
        dm: true,
        anonimo: false,
        categoria: 'registro',
        perguntas: [
          p('Nome do canal', 'short'),
          p('Plataforma', 'short', 'YouTube / Twitch / TikTok'),
          p('Link do canal', 'short', 'https://...'),
          p('Seguidores aproximados', 'number'),
        ],
      },
    },

    /* =========================================================
     *  MINECRAFT
     * =======================================================*/
    {
      id: 'mc-registro',
      cat: 'minecraft',
      emoji: '⛏️',
      nome: 'Registro de jogador',
      desc: 'Registro básico para novos jogadores.',
      cor: '#57f287',
      dados: {
        titulo: 'Registro de Jogador',
        descricao: 'Registre-se para jogar no servidor.',
        cor: '#57f287',
        dm: true,
        anonimo: false,
        categoria: 'minecraft',
        perguntas: [
          p('Nick no Minecraft', 'short', 'Ex: Notch'),
          p('Idade', 'number'),
          p('Você aceita as regras?', 'short', 'Sim / Não'),
        ],
      },
    },
    {
      id: 'mc-staff',
      cat: 'minecraft',
      emoji: '🛡️',
      nome: 'Candidatura a Staff (Minecraft)',
      desc: 'Para quem quer entrar na equipe do servidor.',
      cor: '#3498db',
      dados: {
        titulo: 'Candidatura a Staff',
        descricao: 'Candidate-se para fazer parte da equipe.',
        cor: '#3498db',
        dm: true,
        anonimo: false,
        categoria: 'minecraft',
        perguntas: [
          p('Nick e idade', 'short', 'Ex: Notch, 20'),
          p('Tempo de jogo no servidor', 'short', 'Ex: 3 meses'),
          p('Já foi staff antes?', 'long'),
          p('Por que devemos te escolher?', 'long'),
        ],
      },
    },
    {
      id: 'mc-denuncia-cheat',
      cat: 'minecraft',
      emoji: '🚫',
      nome: 'Denúncia de cheats',
      desc: 'Reporte jogadores usando cheats.',
      cor: '#ed4245',
      dados: {
        titulo: 'Denúncia de Cheats',
        descricao: 'Ajude a manter o servidor justo.',
        cor: '#ed4245',
        dm: false,
        anonimo: true,
        categoria: 'denuncia',
        perguntas: [
          p('Nick do jogador', 'short'),
          p('Qual cheat estava usando?', 'short', 'Ex: KillAura, Fly'),
          p('Provas (vídeo/link)', 'long'),
        ],
      },
    },
    {
      id: 'mc-pvp',
      cat: 'minecraft',
      emoji: '⚔️',
      nome: 'Inscrição em torneio PvP',
      desc: 'Inscrições para campeonatos PvP.',
      cor: '#e67e22',
      dados: {
        titulo: 'Torneio PvP',
        descricao: 'Inscreva-se no nosso campeonato!',
        cor: '#e67e22',
        dm: true,
        anonimo: false,
        categoria: 'evento',
        perguntas: [
          p('Nick no Minecraft', 'short'),
          p('Kit preferido', 'short', 'Ex: Sword, Crystal'),
          p('Discord para contato', 'short'),
        ],
      },
    },
    {
      id: 'mc-builder',
      cat: 'minecraft',
      emoji: '🏗️',
      nome: 'Candidatura para construtor',
      desc: 'Para builders entrarem na equipe.',
      cor: '#1abc9c',
      dados: {
        titulo: 'Candidatura — Construtor',
        descricao: 'Mostre seu trabalho como builder.',
        cor: '#1abc9c',
        dm: true,
        anonimo: false,
        categoria: 'minecraft',
        perguntas: [
          p('Nick', 'short'),
          p('Estilo preferido', 'short', 'Ex: Medieval, Moderno'),
          p('Portfólio (links)', 'long', 'Imagens/vídeos das suas builds'),
        ],
      },
    },

    /* =========================================================
     *  PROJETOS
     * =======================================================*/
    {
      id: 'proj-site',
      cat: 'projeto',
      emoji: '🌐',
      nome: 'Briefing para site',
      desc: 'Colete requisitos para criar um site.',
      cor: '#3498db',
      dados: {
        titulo: 'Briefing — Criação de Site',
        descricao: 'Conte-nos sobre seu projeto.',
        cor: '#3498db',
        dm: true,
        anonimo: false,
        categoria: 'projeto',
        perguntas: [
          p('Qual o nome do projeto?', 'short'),
          p('Qual o objetivo do site?', 'long'),
          p('Referências (links)', 'long', '', false),
          p('Orçamento aproximado', 'short', 'Ex: R$ 1.500', false),
        ],
      },
    },
    {
      id: 'proj-bot',
      cat: 'projeto',
      emoji: '🤖',
      nome: 'Solicitação de bot',
      desc: 'Para clientes que querem um bot de Discord.',
      cor: '#5865f2',
      dados: {
        titulo: 'Solicitação — Bot Discord',
        descricao: 'Descreva o bot que você quer.',
        cor: '#5865f2',
        dm: true,
        anonimo: false,
        categoria: 'projeto',
        perguntas: [
          p('Nome do bot', 'short'),
          p('Funcionalidades desejadas', 'long'),
          p('Já tem servidor no Discord?', 'short', 'Sim / Não'),
          p('Orçamento aproximado', 'short', '', false),
        ],
      },
    },
    {
      id: 'proj-orcamento',
      cat: 'projeto',
      emoji: '💰',
      nome: 'Pedido de orçamento',
      desc: 'Formulário genérico para orçamentos.',
      cor: '#f1c40f',
      dados: {
        titulo: 'Pedido de Orçamento',
        descricao: 'Conte-nos o que precisa.',
        cor: '#f1c40f',
        dm: true,
        anonimo: false,
        categoria: 'projeto',
        perguntas: [
          p('Qual o serviço desejado?', 'short'),
          p('Descrição detalhada', 'long'),
          p('Prazo desejado', 'short', 'Ex: 15 dias'),
        ],
      },
    },
    {
      id: 'proj-contato',
      cat: 'projeto',
      emoji: '📞',
      nome: 'Formulário de contato',
      desc: 'Formulário genérico de contato.',
      cor: '#95a5a6',
      dados: {
        titulo: 'Contato',
        descricao: 'Envie sua mensagem que responderemos em breve.',
        cor: '#95a5a6',
        dm: true,
        anonimo: false,
        categoria: 'projeto',
        perguntas: [
          p('Seu nome', 'short'),
          p('Seu e-mail', 'short', 'exemplo@email.com'),
          p('Mensagem', 'long'),
        ],
      },
    },
    {
      id: 'proj-freelancer',
      cat: 'projeto',
      emoji: '👨‍💻',
      nome: 'Candidatura a freelancer',
      desc: 'Para freelancers se candidatarem.',
      cor: '#9b59b6',
      dados: {
        titulo: 'Candidatura — Freelancer',
        descricao: 'Mostre seu trabalho.',
        cor: '#9b59b6',
        dm: true,
        anonimo: false,
        categoria: 'projeto',
        perguntas: [
          p('Seu nome', 'short'),
          p('Área de atuação', 'short', 'Ex: Design, Dev'),
          p('Portfólio (links)', 'long'),
          p('Valor/hora', 'short', '', false),
        ],
      },
    },

    /* =========================================================
     *  GERAL
     * =======================================================*/
    {
      id: 'geral-pesquisa',
      cat: 'geral',
      emoji: '📊',
      nome: 'Pesquisa de opinião',
      desc: 'Formulário genérico de pesquisa.',
      cor: '#3498db',
      dados: {
        titulo: 'Pesquisa de Opinião',
        descricao: 'Sua opinião é muito importante.',
        cor: '#3498db',
        dm: false,
        anonimo: true,
        categoria: 'outro',
        perguntas: [
          p('O que você achou?', 'long'),
          p('Recomendaria?', 'short', 'Sim / Não'),
          p('Sugestões', 'long', '', false),
        ],
      },
    },
    {
      id: 'geral-cadastro',
      cat: 'geral',
      emoji: '👥',
      nome: 'Cadastro de participantes',
      desc: 'Cadastre pessoas em qualquer atividade.',
      cor: '#1abc9c',
      dados: {
        titulo: 'Cadastro de Participantes',
        descricao: 'Preencha para participar.',
        cor: '#1abc9c',
        dm: true,
        anonimo: false,
        categoria: 'evento',
        perguntas: [
          p('Nome completo', 'short'),
          p('Idade', 'number'),
          p('Contato', 'short', 'Discord / telefone'),
        ],
      },
    },
    {
      id: 'geral-avaliacao',
      cat: 'geral',
      emoji: '⭐',
      nome: 'Avaliação',
      desc: 'Formulário de avaliação genérico.',
      cor: '#f1c40f',
      dados: {
        titulo: 'Avaliação',
        descricao: 'Avalie nosso serviço.',
        cor: '#f1c40f',
        dm: false,
        anonimo: true,
        categoria: 'outro',
        perguntas: [
          p('Nota (0 a 10)', 'number'),
          p('O que achou?', 'long'),
          p('O que podemos melhorar?', 'long', '', false),
        ],
      },
    },
    {
      id: 'geral-branco',
      cat: 'geral',
      emoji: '🆕',
      nome: 'Formulário em branco',
      desc: 'Comece do zero, sem sugestões.',
      cor: '#5865f2',
      dados: {
        titulo: '',
        descricao: '',
        cor: '#5865f2',
        dm: true,
        anonimo: false,
        categoria: '',
        perguntas: [],
      },
    },
  ];

  /* =========================================================
   *  API
   * =======================================================*/
  function listar(cat = 'todos') {
    if (cat === 'todos') return [...LISTA];
    return LISTA.filter(t => t.cat === cat);
  }

  function buscar(query) {
    const q = String(query ?? '').toLowerCase().trim();
    if (!q) return [...LISTA];

    return LISTA.filter(t =>
      t.nome.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.emoji.includes(q)
    );
  }

  function obter(id) {
    return LISTA.find(t => t.id === id) ?? null;
  }

  function aplicar(id) {
    const t = obter(id);
    if (!t) return null;

    return {
      titulo: t.dados.titulo,
      descricao: t.dados.descricao,
      cor: t.dados.cor,
      dm: t.dados.dm !== false,
      anonimo: !!t.dados.anonimo,
      categoria: t.dados.categoria ?? '',
      perguntas: U.clonar(t.dados.perguntas ?? []),
    };
  }

  function categorias() {
    return [...CATEGORIAS];
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.templates = Object.freeze({
    listar,
    buscar,
    obter,
    aplicar,
    categorias,
    LISTA,
    CATEGORIAS,
  });
})();
