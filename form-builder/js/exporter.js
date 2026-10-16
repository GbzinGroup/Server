/**
 * js/exporter.js
 * -------------------------------------------------------------
 * Exporta formulário em JSON (formato do bot).
 *
 * Expõe: window.FF.exporter
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  const V = window.FF?.validation;

  if (!C || !U) {
    console.error('[exporter] config.js e utils.js precisam vir antes.');
    return;
  }

  /* =========================================================
   *  TRANSFORMAÇÕES
   * =======================================================*/

  /**
   * Converte o formulário interno no formato LEGADO (do bot).
   * Só inclui tipos compatíveis com o bot.
   */
  function paraFormatoLegado(form) {
    const perguntasCompat = (form.perguntas ?? []).filter(p =>
      C.TIPOS_COMPATIVEIS.includes(p.tipo)
    );

    return {
      titulo: String(form.titulo ?? '').trim(),
      descricao: String(form.descricao ?? '').trim(),
      cor: C.RE_HEX.test(form.cor ?? '') ? form.cor : C.COR_PADRAO,
      dm: form.dm !== false,
      anonimo: !!form.anonimo,
      categoria: form.categoria ?? '',
      perguntas: perguntasCompat.slice(0, C.LIMITES.PERGUNTAS_MAX).map(p => ({
        pergunta: String(p.pergunta ?? '').trim(),
        tipo: p.tipo,
        placeholder: String(p.placeholder ?? '').trim(),
        obrigatoria: !!p.obrigatoria,
      })),
      _versao: C.VERSAO_FORMATO_LEGADO,
      _geradoEm: new Date().toISOString(),
    };
  }

  /**
   * Formato COMPLETO (inclui tipos extras, não vai pro bot).
   */
  function paraFormatoCompleto(form) {
    return {
      ...form,
      perguntas: (form.perguntas ?? []).map(p => ({
        pergunta: String(p.pergunta ?? '').trim(),
        tipo: p.tipo,
        placeholder: String(p.placeholder ?? '').trim(),
        obrigatoria: !!p.obrigatoria,
        opcoes: Array.isArray(p.opcoes) ? p.opcoes : undefined,
        min: p.min,
        max: p.max,
      })),
      _versao: C.VERSAO_APP,
      _geradoEm: new Date().toISOString(),
      _formato: 'completo',
    };
  }

  /**
   * Formato COMPACTO (mesmo do legado, sem indentação).
   */
  function paraFormatoCompacto(form) {
    return paraFormatoLegado(form);
  }

  /* =========================================================
   *  GERAR JSON
   * =======================================================*/
  function gerarJson(form, formato = C.FORMATOS_EXPORT.LEGADO) {
    let obj;
    let espacos = 2;

    if (formato === C.FORMATOS_EXPORT.COMPLETO) {
      obj = paraFormatoCompleto(form);
    } else if (formato === C.FORMATOS_EXPORT.COMPACTO) {
      obj = paraFormatoCompacto(form);
      espacos = 0;
    } else {
      obj = paraFormatoLegado(form);
    }

    try {
      return {
        ok: true,
        json: JSON.stringify(obj, null, espacos),
        objeto: obj,
      };
    } catch (err) {
      return { ok: false, erro: err.message };
    }
  }

  /* =========================================================
   *  COPIAR / BAIXAR
   * =======================================================*/
  async function copiar(json) {
    return await U.copiarTexto(json);
  }

  function baixar(json, nome = 'formulario.json') {
    try {
      U.baixarArquivo(nome, json, 'application/json');
      return true;
    } catch {
      return false;
    }
  }

  function gerarNomeArquivo(form) {
    const base = U.slug(form.titulo || 'formulario') || 'formulario';
    return `${base}.json`;
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.exporter = Object.freeze({
    gerarJson,
    copiar,
    baixar,
    gerarNomeArquivo,
    paraFormatoLegado,
    paraFormatoCompleto,
    paraFormatoCompacto,
  });
})();
