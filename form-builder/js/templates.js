(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[templates] Dependências faltando.'); return; }

  const CATEGORIAS = [
    { id: 'todos', label: 'Todos', emoji: '📚' },
    { id: 'discord', label: 'Discord', emoji: '💬' },
    { id: 'minecraft', label: 'Minecraft', emoji: '⛏️' },
    { id: 'projeto', label: 'Projetos', emoji: '💼' },
    { id: 'geral', label: 'Geral', emoji: '📦' },
  ];

  function p(pergunta, tipo = 'short', placeholder = '', obrigatoria = true) {
    return { pergunta, tipo, placeholder, obrigatoria };
  }

  const LISTA = [
    { id: 'dc-registro', cat: 'discord', emoji: '📝', nome: 'Registro de membro', desc: 'Formulário básico de apresentação.', cor: '#5865f2',
      dados: { titulo: 'Registro de Membro', descricao: 'Preencha para se registrar.', cor: '#5865f2', dm: true, anonimo: false, categoria: 'registro',
        perguntas: [p('Qual seu nome?', 'short', 'Ex: João'), p('Quantos anos?', 'number', 'Ex: 18'), p('Onde nos encontrou?', 'short', '', false)] } },

    { id: 'dc-suporte', cat: 'discord', emoji: '🆘', nome: 'Ticket de suporte', desc: 'Descreva o problema.', cor: '#57f287',
      dados: { titulo: 'Suporte', descricao: 'Descreva seu problema.', cor: '#57f287', dm: true, anonimo: false, categoria: 'suporte',
        perguntas: [p('Qual seu problema?', 'long', 'Detalhes...'), p('Desde quando?', 'short', '', false)] } },

    { id: 'dc-denuncia', cat: 'discord', emoji: '🚨', nome: 'Denúncia', desc: 'Denuncie um membro.', cor: '#ed4245',
      dados: { titulo: 'Denúncia', descricao: 'Denuncie alguém que quebrou as regras.', cor: '#ed4245', dm: false, anonimo: true, categoria: 'denuncia',
        perguntas: [p('Quem denuncia?', 'user', '@usuário'), p('O que aconteceu?', 'long'), p('Provas', 'long', '', false)] } },

    { id: 'dc-staff', cat: 'discord', emoji: '👮', nome: 'Candidatura a Staff', desc: 'Para entrar na equipe.', cor: '#9b59b6',
      dados: { titulo: 'Candidatura a Staff', descricao: 'Analisaremos seu perfil.', cor: '#9b59b6', dm: true, anonimo: false, categoria: 'registro',
        perguntas: [p('Nome e idade', 'short'), p('Disponibilidade', 'short', 'Ex: 14h-22h'), p('Experiência anterior', 'long'), p('Por que te escolher?', 'long')] } },

    { id: 'dc-parceria', cat: 'discord', emoji: '🤝', nome: 'Proposta de parceria', desc: 'Proposta entre servidores.', cor: '#eb459e',
      dados: { titulo: 'Parceria', descricao: 'Proposta de parceria.', cor: '#eb459e', dm: true, anonimo: false, categoria: 'registro',
        perguntas: [p('Nome do servidor', 'short'), p('Convite', 'short', 'discord.gg/...'), p('Membros aproximados', 'number')] } },

    { id: 'dc-sugestao', cat: 'discord', emoji: '💡', nome: 'Sugestão', desc: 'Ideias de melhoria.', cor: '#fee75c',
      dados: { titulo: 'Sugestão', descricao: 'Sua opinião importa.', cor: '#fee75c', dm: true, anonimo: false, categoria: 'sugestao',
        perguntas: [p('Sua sugestão', 'long'), p('Por que seria bom?', 'long', '', false)] } },

    { id: 'dc-feedback', cat: 'discord', emoji: '📊', nome: 'Pesquisa de satisfação', desc: 'Colete feedback.', cor: '#3498db',
      dados: { titulo: 'Pesquisa', descricao: 'Nos ajude a melhorar!', cor: '#3498db', dm: false, anonimo: true, categoria: 'outro',
        perguntas: [p('Nota (0-10)', 'number'), p('O que mais gosta?', 'long'), p('O que melhorar?', 'long')] } },

    { id: 'mc-registro', cat: 'minecraft', emoji: '⛏️', nome: 'Registro de jogador', desc: 'Registro para o servidor.', cor: '#57f287',
      dados: { titulo: 'Registro de Jogador', descricao: 'Registre-se para jogar.', cor: '#57f287', dm: true, anonimo: false, categoria: 'minecraft',
        perguntas: [p('Nick', 'short', 'Ex: Notch'), p('Idade', 'number'), p('Aceita as regras?', 'short', 'Sim/Não')] } },

    { id: 'mc-staff', cat: 'minecraft', emoji: '🛡️', nome: 'Candidatura Staff (MC)', desc: 'Para entrar na equipe.', cor: '#3498db',
      dados: { titulo: 'Candidatura Staff', descricao: 'Entre na equipe.', cor: '#3498db', dm: true, anonimo: false, categoria: 'minecraft',
        perguntas: [p('Nick e idade', 'short'), p('Tempo no servidor', 'short'), p('Experiência', 'long'), p('Por que você?', 'long')] } },

    { id: 'mc-cheat', cat: 'minecraft', emoji: '🚫', nome: 'Denúncia de cheats', desc: 'Reporte trapaças.', cor: '#ed4245',
      dados: { titulo: 'Denúncia de Cheats', descricao: 'Mantenha o servidor justo.', cor: '#ed4245', dm: false, anonimo: true, categoria: 'denuncia',
        perguntas: [p('Nick do jogador', 'short'), p('Cheat usado', 'short', 'Ex: KillAura'), p('Provas', 'long')] } },

    { id: 'mc-pvp', cat: 'minecraft', emoji: '⚔️', nome: 'Inscrição PvP', desc: 'Inscrição em torneio.', cor: '#e67e22',
      dados: { titulo: 'Torneio PvP', descricao: 'Inscreva-se!', cor: '#e67e22', dm: true, anonimo: false, categoria: 'evento',
        perguntas: [p('Nick', 'short'), p('Kit preferido', 'short'), p('Discord', 'short')] } },

    { id: 'proj-site', cat: 'projeto', emoji: '🌐', nome: 'Briefing para site', desc: 'Requisitos de um site.', cor: '#3498db',
      dados: { titulo: 'Briefing — Site', descricao: 'Conte sobre seu projeto.', cor: '#3498db', dm: true, anonimo: false, categoria: 'projeto',
        perguntas: [p('Nome do projeto', 'short'), p('Objetivo', 'long'), p('Referências', 'long', '', false), p('Orçamento', 'short', '', false)] } },

    { id: 'proj-bot', cat: 'projeto', emoji: '🤖', nome: 'Solicitação de bot', desc: 'Quero um bot.', cor: '#5865f2',
      dados: { titulo: 'Solicitação — Bot', descricao: 'Descreva o bot.', cor: '#5865f2', dm: true, anonimo: false, categoria: 'projeto',
        perguntas: [p('Nome do bot', 'short'), p('Funcionalidades', 'long'), p('Já tem servidor?', 'short', 'Sim/Não')] } },

    { id: 'proj-orcamento', cat: 'projeto', emoji: '💰', nome: 'Pedido de orçamento', desc: 'Orçamento genérico.', cor: '#f1c40f',
      dados: { titulo: 'Orçamento', descricao: 'Descreva o serviço.', cor: '#f1c40f', dm: true, anonimo: false, categoria: 'projeto',
        perguntas: [p('Serviço desejado', 'short'), p('Descrição', 'long'), p('Prazo', 'short', '', false)] } },

    { id: 'proj-contato', cat: 'projeto', emoji: '📞', nome: 'Contato', desc: 'Formulário de contato.', cor: '#95a5a6',
      dados: { titulo: 'Contato', descricao: 'Envie sua mensagem.', cor: '#95a5a6', dm: true, anonimo: false, categoria: 'projeto',
        perguntas: [p('Seu nome', 'short'), p('E-mail', 'short'), p('Mensagem', 'long')] } },

    { id: 'geral-pesquisa', cat: 'geral', emoji: '📊', nome: 'Pesquisa', desc: 'Pesquisa genérica.', cor: '#3498db',
      dados: { titulo: 'Pesquisa de Opinião', descricao: 'Sua opinião importa.', cor: '#3498db', dm: false, anonimo: true, categoria: 'outro',
        perguntas: [p('O que achou?', 'long'), p('Recomenda?', 'short', 'Sim/Não'), p('Sugestões', 'long', '', false)] } },

    { id: 'geral-cadastro', cat: 'geral', emoji: '👥', nome: 'Cadastro', desc: 'Cadastro de participantes.', cor: '#1abc9c',
      dados: { titulo: 'Cadastro', descricao: 'Preencha para participar.', cor: '#1abc9c', dm: true, anonimo: false, categoria: 'evento',
        perguntas: [p('Nome', 'short'), p('Idade', 'number'), p('Contato', 'short')] } },

    { id: 'geral-branco', cat: 'geral', emoji: '🆕', nome: 'Em branco', desc: 'Comece do zero.', cor: '#5865f2',
      dados: { titulo: '', descricao: '', cor: '#5865f2', dm: true, anonimo: false, categoria: '', perguntas: [] } },
  ];

  function listar(cat = 'todos') {
    return cat === 'todos' ? [...LISTA] : LISTA.filter(t => t.cat === cat);
  }

  function buscar(q) {
    const termo = String(q ?? '').toLowerCase().trim();
    if (!termo) return [...LISTA];
    return LISTA.filter(t =>
      t.nome.toLowerCase().includes(termo) ||
      t.desc.toLowerCase().includes(termo) ||
      t.emoji.includes(termo)
    );
  }

  function obter(id) { return LISTA.find(t => t.id === id) ?? null; }

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

  function categorias() { return [...CATEGORIAS]; }

  window.FF = window.FF || {};
  window.FF.templates = Object.freeze({ listar, buscar, obter, aplicar, categorias, LISTA, CATEGORIAS });
})();
