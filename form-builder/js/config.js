(function () {
  'use strict';

  const VERSAO_APP = '2.0.0';
  const VERSAO_FORMATO_LEGADO = 1;
  const SCHEMA_ATUAL = 2;

  const LIMITES = Object.freeze({
    TITULO_MIN: 3,
    TITULO_MAX: 100,
    DESCRICAO_MAX: 500,
    CATEGORIA_MAX: 40,
    PERGUNTAS_MAX: 5,
    PERGUNTA_TITULO_MAX: 45,
    PLACEHOLDER_MAX: 100,
    HISTORICO_MAX: 30,
    BACKUP_VERSAO: 1,
  });

  const TIPOS_PERGUNTA = Object.freeze([
    { id: 'short', label: 'Resposta curta', emoji: '✏️', compativel: true },
    { id: 'long', label: 'Resposta longa', emoji: '📄', compativel: true },
    { id: 'number', label: 'Número', emoji: '🔢', compativel: true },
    { id: 'user', label: 'Usuário do Discord', emoji: '👤', compativel: true },
    { id: 'channel', label: 'Canal do Discord', emoji: '📺', compativel: true },
    { id: 'role', label: 'Cargo do Discord', emoji: '🎭', compativel: true },
  ]);

  const TIPOS_POR_ID = Object.freeze(
    TIPOS_PERGUNTA.reduce((a, t) => { a[t.id] = t; return a; }, {})
  );

  const TIPOS_COMPATIVEIS = Object.freeze(TIPOS_PERGUNTA.map(t => t.id));
  const TIPO_FALLBACK = 'short';

  const CATEGORIAS = Object.freeze([
    { id: '', label: '— Nenhuma —', emoji: '—' },
    { id: 'registro', label: 'Registro', emoji: '📝' },
    { id: 'suporte', label: 'Suporte', emoji: '🆘' },
    { id: 'denuncia', label: 'Denúncia', emoji: '🚨' },
    { id: 'sugestao', label: 'Sugestão', emoji: '💡' },
    { id: 'evento', label: 'Evento', emoji: '🎉' },
    { id: 'minecraft', label: 'Minecraft', emoji: '⛏️' },
    { id: 'projeto', label: 'Projeto', emoji: '💼' },
    { id: 'outro', label: 'Outro', emoji: '📦' },
  ]);

  const CATEGORIAS_POR_ID = Object.freeze(
    CATEGORIAS.reduce((a, c) => { a[c.id] = c; return a; }, {})
  );

  const COR_PADRAO = '#5865f2';
  const COR_FALLBACK = 0x5865f2;
  const RE_HEX = /^#[0-9a-fA-F]{6}$/;

  const CHAVES = Object.freeze({
    FORMULARIOS: 'ff:formularios',
    RASCUNHO: 'ff:rascunho',
    CONFIG: 'ff:config',
    SCHEMA: 'ff:schema',
  });

  const FORMATOS_EXPORT = Object.freeze({
    LEGADO: 'legado',
    COMPLETO: 'completo',
    COMPACTO: 'compacto',
  });

  window.FF = window.FF || {};
  window.FF.config = Object.freeze({
    VERSAO_APP, VERSAO_FORMATO_LEGADO, SCHEMA_ATUAL,
    LIMITES,
    TIPOS_PERGUNTA, TIPOS_POR_ID, TIPOS_COMPATIVEIS, TIPO_FALLBACK,
    CATEGORIAS, CATEGORIAS_POR_ID,
    COR_PADRAO, COR_FALLBACK, RE_HEX,
    CHAVES,
    FORMATOS_EXPORT,
  });
})();
