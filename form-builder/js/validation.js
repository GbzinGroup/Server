/**
 * js/validation.js
 * -------------------------------------------------------------
 * Validação de formulários antes de exportar ou salvar.
 * Retorna lista de erros (impedem) e avisos (não impedem).
 *
 * Expõe: window.FF.validation
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[validation] config.js e utils.js precisam vir antes.');
    return;
  }

  const { LIMITES, TIPOS_COMPATIVEIS, RE_HEX } = C;

  /* =========================================================
   *  HELPERS
   * =======================================================*/
  function novoErro(campo, mensagem, indicePergunta = null) {
    return { tipo: 'erro', campo, mensagem, indicePergunta };
  }

  function novoAviso(campo, mensagem, indicePergunta = null) {
    return { tipo: 'aviso', campo, mensagem, indicePergunta };
  }

  /* =========================================================
   *  VALIDAÇÃO COMPLETA
   * =======================================================*/
  /**
   * @param {object} form
   * @returns {{ ok: boolean, erros: [], avisos: [] }}
   */
  function validar(form) {
    const erros = [];
    const avisos = [];

    if (!form || typeof form !== 'object') {
      return {
        ok: false,
        erros: [novoErro('form', 'Formulário inválido.')],
        avisos: [],
      };
    }

    /* ----- TÍTULO ----- */
    const titulo = String(form.titulo ?? '').trim();
    if (!titulo) {
      erros.push(novoErro('titulo', 'O título é obrigatório.'));
    } else if (titulo.length < LIMITES.TITULO_MIN) {
      erros.push(novoErro('titulo', `O título precisa ter ao menos ${LIMITES.TITULO_MIN} caracteres.`));
    } else if (titulo.length > LIMITES.TITULO_MAX) {
      erros.push(novoErro('titulo', `O título não pode passar de ${LIMITES.TITULO_MAX} caracteres.`));
    }

    /* ----- DESCRIÇÃO ----- */
    const descricao = String(form.descricao ?? '');
    if (descricao.length > LIMITES.DESCRICAO_MAX) {
      erros.push(novoErro('descricao', `Descrição muito longa (máx. ${LIMITES.DESCRICAO_MAX}).`));
    }

    /* ----- COR ----- */
    const cor = String(form.cor ?? '');
    if (cor && !RE_HEX.test(cor)) {
      erros.push(novoErro('cor', 'Cor inválida. Use o formato #RRGGBB.'));
    }

    /* ----- CATEGORIA ----- */
    const categoria = String(form.categoria ?? '');
    if (categoria.length > LIMITES.CATEGORIA_MAX) {
      erros.push(novoErro('categoria', `Categoria muito longa (máx. ${LIMITES.CATEGORIA_MAX}).`));
    }

    /* ----- PERGUNTAS ----- */
    const perguntas = Array.isArray(form.perguntas) ? form.perguntas : [];

    if (perguntas.length === 0) {
      erros.push(novoErro('perguntas', 'Adicione pelo menos 1 pergunta.'));
    }

    if (perguntas.length > LIMITES.PERGUNTAS_MAX) {
      erros.push(novoErro(
        'perguntas',
        `Máximo de ${LIMITES.PERGUNTAS_MAX} perguntas (o bot só suporta esse limite).`
      ));
    }

    perguntas.forEach((p, i) => {
      const num = i + 1;

      /* Título da pergunta */
      const t = String(p?.pergunta ?? '').trim();
      if (!t) {
        erros.push(novoErro('pergunta', `Pergunta ${num}: falta o texto.`, i));
      } else if (t.length > LIMITES.PERGUNTA_TITULO_MAX) {
        erros.push(novoErro(
          'pergunta',
          `Pergunta ${num}: título muito longo (máx. ${LIMITES.PERGUNTA_TITULO_MAX}).`,
          i
        ));
      }

      /* Tipo */
      const tipo = String(p?.tipo ?? '');
      if (!tipo) {
        erros.push(novoErro('pergunta', `Pergunta ${num}: falta o tipo.`, i));
      } else if (!TIPOS_COMPATIVEIS.includes(tipo)) {
        avisos.push(novoAviso(
          'pergunta',
          `Pergunta ${num}: o tipo "${tipo}" não é suportado pelo bot atual. ` +
          `Ela ficará salva no site, mas não será exportada.`,
          i
        ));
      }

      /* Placeholder */
      const ph = String(p?.placeholder ?? '');
      if (ph.length > LIMITES.PLACEHOLDER_MAX) {
        erros.push(novoErro(
          'placeholder',
          `Pergunta ${num}: placeholder muito longo (máx. ${LIMITES.PLACEHOLDER_MAX}).`,
          i
        ));
      }

      /* Opções duplicadas (para tipos com lista) */
      if (Array.isArray(p?.opcoes) && p.opcoes.length) {
        const vistas = new Set();
        for (const op of p.opcoes) {
          const texto = String(op?.texto ?? op ?? '').trim().toLowerCase();
          if (!texto) {
            avisos.push(novoAviso('opcao', `Pergunta ${num}: existe uma opção vazia.`, i));
            continue;
          }
          if (vistas.has(texto)) {
            erros.push(novoErro('opcao', `Pergunta ${num}: opção duplicada "${texto}".`, i));
          }
          vistas.add(texto);
        }
      }
    });

    return {
      ok: erros.length === 0,
      erros,
      avisos,
    };
  }

  /* =========================================================
   *  VALIDAÇÃO RÁPIDA (só boolean + primeira msg)
   * =======================================================*/
  function podeExportar(form) {
    const r = validar(form);
    return {
      ok: r.ok,
      primeiraMensagem: r.erros[0]?.mensagem ?? null,
    };
  }

  /* =========================================================
   *  VALIDAÇÃO DE CAMPO INDIVIDUAL (para hints ao vivo)
   * =======================================================*/
  function validarTitulo(valor) {
    const v = String(valor ?? '').trim();
    if (!v) return { ok: false, msg: 'Obrigatório.' };
    if (v.length < LIMITES.TITULO_MIN) return { ok: false, msg: `Mínimo ${LIMITES.TITULO_MIN} caracteres.` };
    if (v.length > LIMITES.TITULO_MAX) return { ok: false, msg: `Máximo ${LIMITES.TITULO_MAX} caracteres.` };
    return { ok: true, msg: `${v.length}/${LIMITES.TITULO_MAX}` };
  }

  function validarDescricao(valor) {
    const v = String(valor ?? '');
    if (v.length > LIMITES.DESCRICAO_MAX) {
      return { ok: false, msg: `Máximo ${LIMITES.DESCRICAO_MAX} caracteres.` };
    }
    return { ok: true, msg: `${v.length}/${LIMITES.DESCRICAO_MAX}` };
  }

  function validarCor(valor) {
    const v = String(valor ?? '').trim();
    if (!v) return { ok: false, msg: 'Defina uma cor.' };
    if (!RE_HEX.test(v)) return { ok: false, msg: 'Formato: #RRGGBB' };
    return { ok: true, msg: '✓ válida' };
  }

  function validarPergunta(pergunta) {
    const t = String(pergunta?.pergunta ?? '').trim();
    if (!t) return { ok: false, msg: 'Obrigatório.' };
    if (t.length > LIMITES.PERGUNTA_TITULO_MAX) {
      return { ok: false, msg: `Máximo ${LIMITES.PERGUNTA_TITULO_MAX} caracteres.` };
    }
    return { ok: true, msg: `${t.length}/${LIMITES.PERGUNTA_TITULO_MAX}` };
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.validation = Object.freeze({
    validar,
    podeExportar,
    validarTitulo,
    validarDescricao,
    validarCor,
    validarPergunta,
  });
})();
