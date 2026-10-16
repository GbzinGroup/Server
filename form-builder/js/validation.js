(function () {
  'use strict';

  const C = window.FF?.config;
  if (!C) { console.error('[validation] config.js precisa vir antes.'); return; }

  const { LIMITES, TIPOS_COMPATIVEIS, RE_HEX } = C;

  function novoErro(campo, mensagem, indicePergunta = null) {
    return { tipo: 'erro', campo, mensagem, indicePergunta };
  }
  function novoAviso(campo, mensagem, indicePergunta = null) {
    return { tipo: 'aviso', campo, mensagem, indicePergunta };
  }

  function validar(form) {
    const erros = [];
    const avisos = [];

    if (!form || typeof form !== 'object') {
      return { ok: false, erros: [novoErro('form', 'Formulário inválido.')], avisos: [] };
    }

    const titulo = String(form.titulo ?? '').trim();
    if (!titulo) erros.push(novoErro('titulo', 'O título é obrigatório.'));
    else if (titulo.length < LIMITES.TITULO_MIN) erros.push(novoErro('titulo', `Mínimo ${LIMITES.TITULO_MIN} caracteres.`));
    else if (titulo.length > LIMITES.TITULO_MAX) erros.push(novoErro('titulo', `Máximo ${LIMITES.TITULO_MAX} caracteres.`));

    const descricao = String(form.descricao ?? '');
    if (descricao.length > LIMITES.DESCRICAO_MAX) erros.push(novoErro('descricao', `Máximo ${LIMITES.DESCRICAO_MAX} caracteres.`));

    const cor = String(form.cor ?? '');
    if (cor && !RE_HEX.test(cor)) erros.push(novoErro('cor', 'Cor inválida. Use #RRGGBB.'));

    const perguntas = Array.isArray(form.perguntas) ? form.perguntas : [];
    if (perguntas.length === 0) erros.push(novoErro('perguntas', 'Adicione pelo menos 1 pergunta.'));
    if (perguntas.length > LIMITES.PERGUNTAS_MAX) {
      erros.push(novoErro('perguntas', `Máximo ${LIMITES.PERGUNTAS_MAX} perguntas.`));
    }

    perguntas.forEach((p, i) => {
      const num = i + 1;
      const t = String(p?.pergunta ?? '').trim();
      if (!t) erros.push(novoErro('pergunta', `Pergunta ${num}: falta o texto.`, i));
      else if (t.length > LIMITES.PERGUNTA_TITULO_MAX) {
        erros.push(novoErro('pergunta', `Pergunta ${num}: máximo ${LIMITES.PERGUNTA_TITULO_MAX} caracteres.`, i));
      }

      const tipo = String(p?.tipo ?? '');
      if (!tipo) erros.push(novoErro('pergunta', `Pergunta ${num}: falta o tipo.`, i));
      else if (!TIPOS_COMPATIVEIS.includes(tipo)) {
        avisos.push(novoAviso('pergunta', `Pergunta ${num}: tipo "${tipo}" não suportado pelo bot.`, i));
      }

      const ph = String(p?.placeholder ?? '');
      if (ph.length > LIMITES.PLACEHOLDER_MAX) {
        erros.push(novoErro('placeholder', `Pergunta ${num}: placeholder máx ${LIMITES.PLACEHOLDER_MAX}.`, i));
      }
    });

    return { ok: erros.length === 0, erros, avisos };
  }

  function validarTitulo(valor) {
    const v = String(valor ?? '').trim();
    if (!v) return { ok: false, msg: 'Obrigatório.' };
    if (v.length < LIMITES.TITULO_MIN) return { ok: false, msg: `Mínimo ${LIMITES.TITULO_MIN}.` };
    if (v.length > LIMITES.TITULO_MAX) return { ok: false, msg: `Máximo ${LIMITES.TITULO_MAX}.` };
    return { ok: true, msg: `${v.length}/${LIMITES.TITULO_MAX}` };
  }

  function validarDescricao(valor) {
    const v = String(valor ?? '');
    if (v.length > LIMITES.DESCRICAO_MAX) return { ok: false, msg: `Máximo ${LIMITES.DESCRICAO_MAX}.` };
    return { ok: true, msg: `${v.length}/${LIMITES.DESCRICAO_MAX}` };
  }

  function validarCor(valor) {
    const v = String(valor ?? '').trim();
    if (!v) return { ok: false, msg: 'Defina uma cor.' };
    if (!RE_HEX.test(v)) return { ok: false, msg: 'Formato: #RRGGBB' };
    return { ok: true, msg: '✓ válida' };
  }

  function validarPergunta(p) {
    const t = String(p?.pergunta ?? '').trim();
    if (!t) return { ok: false, msg: 'Obrigatório.' };
    if (t.length > LIMITES.PERGUNTA_TITULO_MAX) return { ok: false, msg: `Máximo ${LIMITES.PERGUNTA_TITULO_MAX}.` };
    return { ok: true, msg: `${t.length}/${LIMITES.PERGUNTA_TITULO_MAX}` };
  }

  window.FF = window.FF || {};
  window.FF.validation = Object.freeze({
    validar, validarTitulo, validarDescricao, validarCor, validarPergunta,
  });
})();
