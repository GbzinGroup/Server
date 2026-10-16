/**
 * js/config.js
 * -------------------------------------------------------------
 * Constantes, enums e configurações globais do FormForge.
 * Não depende de nenhum outro módulo.
 *
 * Expõe: window.FF.config
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  /* =========================================================
   *  VERSÃO
   * =======================================================*/
  const VERSAO_APP = '2.0.0';
  const VERSAO_FORMATO_LEGADO = 1;

  /* =========================================================
   *  LIMITES DO BOT (contrato do Discord)
   * =======================================================*/
  const LIMITES = Object.freeze({
    // Formulário
    TITULO_MIN: 3,
    TITULO_MAX: 100,
    DESCRICAO_MAX: 500,
    CATEGORIA_MAX: 40,

    // Perguntas
    PERGUNTAS_MAX: 5,          // modal do Discord
    PERGUNTA_TITULO_MIN: 1,
    PERGUNTA_TITULO_MAX: 45,   // label do TextInput
    PLACEHOLDER_MAX: 100,

    // Resposta (usado no preview)
    RESPOSTA_CURTA_MAX: 200,
    RESPOSTA_LONGA_MAX: 1000,

    // Embed
    EMBED_TITULO_MAX: 256,
    EMBED_DESCRICAO_MAX: 4096,

    // Armazenamento
    HISTORICO_MAX: 30,
    RASCUNHOS_MAX: 50,
    BACKUP_VERSAO: 1,
  });

  /* =========================================================
   *  TIPOS DE PERGUNTA
   *  - `compativel: true`  → pode ser exportado para o bot
   *  - `compativel: false` → existe só no editor (o bot não lê)
   * =======================================================*/
  const TIPOS_PERGUNTA = Object.freeze([
    // --- Compatíveis com o bot atual ---
    {
      id: 'short',
      label: 'Resposta curta',
      emoji: '✏️',
      compativel: true,
      grupo: 'básico',
      descricao: 'Uma linha (até 200 caracteres)',
    },
    {
      id: 'long',
      label: 'Resposta longa',
      emoji: '📄',
      compativel: true,
      grupo: 'básico',
      descricao: 'Parágrafo (até 1000 caracteres)',
    },
    {
      id: 'number',
      label: 'Número',
      emoji: '🔢',
      compativel: true,
      grupo: 'básico',
      descricao: 'Aceita apenas números',
    },
    {
      id: 'user',
      label: 'Usuário do Discord',
      emoji: '👤',
      compativel: true,
      grupo: 'discord',
      descricao: 'Texto com menção (@usuário)',
    },
    {
      id: 'channel',
      label: 'Canal do Discord',
      emoji: '📺',
      compativel: true,
      grupo: 'discord',
      descricao: 'Texto com menção (#canal)',
    },
    {
      id: 'role',
      label: 'Cargo do Discord',
      emoji: '🎭',
      compativel: true,
      grupo: 'discord',
      descricao: 'Texto com menção (@cargo)',
    },

    // --- Extras (só no editor) ---
    {
      id: 'yesno',
      label: 'Sim / Não',
      emoji: '✅',
      compativel: false,
      grupo: 'extra',
      descricao: 'Escolha entre duas opções',
    },
    {
      id: 'select',
      label: 'Seleção única',
      emoji: '🔘',
      compativel: false,
      grupo: 'extra',
      descricao: 'Escolher 1 opção de uma lista',
    },
    {
      id: 'multiselect',
      label: 'Seleção múltipla',
      emoji: '☑️',
      compativel: false,
      grupo: 'extra',
      descricao: 'Escolher várias opções',
    },
    {
      id: 'date',
      label: 'Data',
      emoji: '📅',
      compativel: false,
      grupo: 'extra',
      descricao: 'Data em formato DD/MM/AAAA',
    },
    {
      id: 'url',
      label: 'URL',
      emoji: '🔗',
      compativel: false,
      grupo: 'extra',
      descricao: 'Endereço de site',
    },
    {
      id: 'email',
      label: 'E-mail',
      emoji: '📧',
      compativel: false,
      grupo: 'extra',
      descricao: 'Endereço de e-mail',
    },
    {
      id: 'info',
      label: 'Informativo (sem resposta)',
      emoji: 'ℹ️',
      compativel: false,
      grupo: 'extra',
      descricao: 'Só mostra um texto, não pede resposta',
    },
  ]);

  /** Mapa rápido: id → tipo */
  const TIPOS_POR_ID = Object.freeze(
    TIPOS_PERGUNTA.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {})
  );

  /** Lista só dos ids compatíveis com o bot */
  const TIPOS_COMPATIVEIS = Object.freeze(
    TIPOS_PERGUNTA.filter(t => t.compativel).map(t => t.id)
  );

  /** Fallback para perguntas importadas com tipo inválido */
  const TIPO_FALLBACK = 'short';

  /* =========================================================
   *  CATEGORIAS
   * =======================================================*/
  const CATEGORIAS = Object.freeze([
    { id: '',           label: '— Nenhuma —', emoji: '—' },
    { id: 'registro',   label: 'Registro',    emoji: '📝' },
    { id: 'suporte',    label: 'Suporte',     emoji: '🆘' },
    { id: 'denuncia',   label: 'Denúncia',    emoji: '🚨' },
    { id: 'sugestao',   label: 'Sugestão',    emoji: '💡' },
    { id: 'evento',     label: 'Evento',      emoji: '🎉' },
    { id: 'minecraft',  label: 'Minecraft',   emoji: '⛏️' },
    { id: 'projeto',    label: 'Projeto',     emoji: '💼' },
    { id: 'outro',      label: 'Outro',       emoji: '📦' },
  ]);

  const CATEGORIAS_POR_ID = Object.freeze(
    CATEGORIAS.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {})
  );

  /* =========================================================
   *  CORES PRÉ-DEFINIDAS
   * =======================================================*/
  const CORES = Object.freeze([
    { hex: '#5865f2', nome: 'Blurple' },
    { hex: '#57f287', nome: 'Verde' },
    { hex: '#fee75c', nome: 'Amarelo' },
    { hex: '#ed4245', nome: 'Vermelho' },
    { hex: '#eb459e', nome: 'Rosa' },
    { hex: '#9b59b6', nome: 'Roxo' },
    { hex: '#f1c40f', nome: 'Dourado' },
    { hex: '#3498db', nome: 'Azul' },
    { hex: '#1abc9c', nome: 'Turquesa' },
    { hex: '#e67e22', nome: 'Laranja' },
    { hex: '#95a5a6', nome: 'Cinza' },
    { hex: '#2b2d31', nome: 'Grafite' },
  ]);

  const COR_PADRAO = '#5865f2';
  const COR_FALLBACK = 0x5865f2;
  const RE_HEX = /^#[0-9a-fA-F]{6}$/;

  /* =========================================================
   *  CHAVES DO ARMAZENAMENTO (localStorage)
   * =======================================================*/
  const CHAVES = Object.freeze({
    FORMULARIOS: 'ff:formularios',
    RASCUNHO: 'ff:rascunho',
    CONFIG: 'ff:config',
    TEMA: 'ff:tema',
    SCHEMA: 'ff:schema',
    BACKUP_META: 'ff:backup:meta',
  });

  /* =========================================================
   *  SCHEMA ATUAL DO ARMAZENAMENTO
   *  Serve para migrações futuras.
   * =======================================================*/
  const SCHEMA_ATUAL = 2;

  /* =========================================================
   *  FORMATOS DE EXPORTAÇÃO
   * =======================================================*/
  const FORMATOS_EXPORT = Object.freeze({
    LEGADO: 'legado',       // formato do bot (contrato atual)
    COMPLETO: 'completo',   // inclui campos extras (não compatíveis)
    COMPACTO: 'compacto',   // legado sem indentação
  });

  /* =========================================================
   *  URLS EXTERNAS
   * =======================================================*/
  const URL_SITE = 'https://SEU_USUARIO.github.io/form-builder/';

  /* =========================================================
   *  ATALHOS DE TECLADO (para exibir em ajuda)
   * =======================================================*/
  const ATALHOS = Object.freeze([
    { teclas: ['Ctrl', 'S'],          acao: 'Salvar' },
    { teclas: ['Ctrl', 'Z'],          acao: 'Desfazer' },
    { teclas: ['Ctrl', 'Shift', 'Z'], acao: 'Refazer' },
    { teclas: ['Ctrl', 'E'],          acao: 'Exportar' },
    { teclas: ['Ctrl', 'P'],          acao: 'Abrir preview' },
    { teclas: ['Ctrl', 'K'],          acao: 'Buscar' },
    { teclas: ['Esc'],                acao: 'Fechar modal' },
    { teclas: ['?'],                  acao: 'Abrir ajuda' },
  ]);

  /* =========================================================
   *  RÓTULOS DE UI
   * =======================================================*/
  const LABELS = Object.freeze({
    salvo: 'Salvo',
    salvando: 'Salvando...',
    erro: 'Erro ao salvar',
    alteracoesNaoSalvas: 'Alterações não salvas',
    novoFormulario: 'Novo formulário',
    semTitulo: 'Sem título',
  });

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.config = Object.freeze({
    // versão
    VERSAO_APP,
    VERSAO_FORMATO_LEGADO,
    SCHEMA_ATUAL,

    // limites
    LIMITES,

    // tipos
    TIPOS_PERGUNTA,
    TIPOS_POR_ID,
    TIPOS_COMPATIVEIS,
    TIPO_FALLBACK,

    // categorias
    CATEGORIAS,
    CATEGORIAS_POR_ID,

    // cores
    CORES,
    COR_PADRAO,
    COR_FALLBACK,
    RE_HEX,

    // storage
    CHAVES,

    // formatos
    FORMATOS_EXPORT,

    // externo
    URL_SITE,

    // UI
    ATALHOS,
    LABELS,
  });

  // Congela global pra evitar mutação acidental
  Object.freeze(window.FF);
})();
