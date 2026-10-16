/**
 * templates.js — templates prontos de formulários.
 * Expõe window.TEMPLATES
 */
window.TEMPLATES = [
  {
    id: 'registro',
    emoji: '📝',
    nome: 'Registro de membro',
    dados: {
      titulo: 'Registro de Membro',
      descricao: 'Preencha o formulário para se registrar no servidor.',
      cor: '#5865f2',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Qual seu nome?', tipo: 'short', placeholder: 'Ex: João', obrigatoria: true },
        { pergunta: 'Quantos anos você tem?', tipo: 'number', placeholder: 'Ex: 18', obrigatoria: true },
        { pergunta: 'Onde nos encontrou?', tipo: 'short', placeholder: 'Ex: YouTube, amigo...', obrigatoria: false },
      ],
    },
  },
  {
    id: 'suporte',
    emoji: '🆘',
    nome: 'Ticket de suporte',
    dados: {
      titulo: 'Suporte',
      descricao: 'Descreva seu problema que entraremos em contato.',
      cor: '#57f287',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Qual seu problema?', tipo: 'long', placeholder: 'Descreva detalhadamente...', obrigatoria: true },
        { pergunta: 'Anexe prints se possível', tipo: 'short', placeholder: 'Link do print', obrigatoria: false },
      ],
    },
  },
  {
    id: 'denuncia',
    emoji: '🚨',
    nome: 'Denúncia',
    dados: {
      titulo: 'Denúncia',
      descricao: 'Denuncie um membro que esteja quebrando as regras.',
      cor: '#ed4245',
      dm: false,
      anonimo: true,
      perguntas: [
        { pergunta: 'Quem você denuncia?', tipo: 'user', placeholder: '@usuário', obrigatoria: true },
        { pergunta: 'O que aconteceu?', tipo: 'long', placeholder: 'Conte com detalhes...', obrigatoria: true },
        { pergunta: 'Provas (links)', tipo: 'long', placeholder: 'Links de prints/vídeos', obrigatoria: false },
      ],
    },
  },
  {
    id: 'sugestao',
    emoji: '💡',
    nome: 'Sugestão',
    dados: {
      titulo: 'Sugestão',
      descricao: 'Sua opinião é importante para nós!',
      cor: '#fee75c',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Sua sugestão', tipo: 'long', placeholder: 'Descreva sua ideia...', obrigatoria: true },
        { pergunta: 'Por que isso seria bom?', tipo: 'long', placeholder: 'Benefícios...', obrigatoria: false },
      ],
    },
  },
  {
    id: 'parceria',
    emoji: '🤝',
    nome: 'Proposta de parceria',
    dados: {
      titulo: 'Parceria',
      descricao: 'Proposta de parceria entre servidores.',
      cor: '#eb459e',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Nome do seu servidor', tipo: 'short', obrigatoria: true },
        { pergunta: 'Convite do servidor', tipo: 'short', placeholder: 'discord.gg/...', obrigatoria: true },
        { pergunta: 'Membros aproximados', tipo: 'number', placeholder: 'Ex: 500', obrigatoria: true },
        { pergunta: 'Mensagem', tipo: 'long', obrigatoria: false },
      ],
    },
  },
  {
    id: 'staff',
    emoji: '👮',
    nome: 'Candidatura a Staff',
    dados: {
      titulo: 'Candidatura a Staff',
      descricao: 'Preencha com atenção. Analisaremos seu perfil.',
      cor: '#9b59b6',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Nome e idade', tipo: 'short', obrigatoria: true },
        { pergunta: 'Horário disponível', tipo: 'short', placeholder: 'Ex: 14h - 22h', obrigatoria: true },
        { pergunta: 'Experiência anterior', tipo: 'long', obrigatoria: true },
        { pergunta: 'Por que devemos te escolher?', tipo: 'long', obrigatoria: true },
      ],
    },
  },
  {
    id: 'evento',
    emoji: '🎉',
    nome: 'Inscrição em evento',
    dados: {
      titulo: 'Inscrição no Evento',
      descricao: 'Inscreva-se para participar do nosso evento!',
      cor: '#f1c40f',
      dm: true,
      anonimo: false,
      perguntas: [
        { pergunta: 'Nome de jogador', tipo: 'short', obrigatoria: true },
        { pergunta: 'Disponibilidade', tipo: 'short', placeholder: 'Ex: Sábado 20h', obrigatoria: true },
        { pergunta: 'Observações', tipo: 'long', obrigatoria: false },
      ],
    },
  },
];
