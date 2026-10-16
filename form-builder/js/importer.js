/**
 * js/importer.js
 * -------------------------------------------------------------
 * Importa formulário a partir de JSON ou arquivo.
 *
 * Expõe: window.FF.importer
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[importer] config.js e utils.js precisam vir antes.');
    return;
  }

  /* =========================================================
   *  PARSE + VALIDAÇÃO
   * =======================================================*/
  function tentarParse(texto) {
    const r = U.parseJson(texto);
    if (!r.ok) {
      return { ok: false, erros: [`JSON inválido: ${r.erro}`] };
    }

    const obj = r.valor;

    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, erros: ['O JSON precisa ser um objeto.'] };
    }

    const erros = [];

    // --- título ---
    if (!obj.titulo || typeof obj.titulo !== 'string') {
      erros.push('Falta o campo "titulo".');
    } else if (obj.titulo.length > C.LIMITES.TITULO_MAX) {
      erros.push(`Título muito longo (máx. ${C.LIMITES.TITULO_MAX}).`);
    }

    // --- perguntas ---
    if (!Array.isArray(obj.perguntas)) {
      erros.push('Falta o campo "perguntas" (lista).');
    } else if (obj.perguntas.length === 0) {
      erros.push('Adicione pelo menos 1 pergunta.');
    } else if (obj.perguntas.length > C.LIMITES.PERGUNTAS_MAX) {
      erros.push(`Máximo ${C.LIMITES.PERGUNTAS_MAX} perguntas (recebidas ${obj.perguntas.length}).`);
    } else {
      obj.perguntas.forEach((p, i) => {
        const num = i + 1;

        if (!p || typeof p !== 'object') {
          erros.push(`Pergunta ${num}: inválida.`);
          return;
        }

        if (!p.pergunta || typeof p.pergunta !== 'string') {
          erros.push(`Pergunta ${num}: falta o texto.`);
        } else if (p.pergunta.length > C.LIMITES.PERGUNTA_TITULO_MAX) {
          erros.push(`Pergunta ${num}: título muito longo.`);
        }

        if (p.tipo && !C.TIPOS_POR_ID[p.tipo]) {
          erros.push(`Pergunta ${num}: tipo "${p.tipo}" desconhecido.`);
        }

        if (p.placeholder && String(p.placeholder).length > C.LIMITES.PLACEHOLDER_MAX) {
          erros.push(`Pergunta ${num}: placeholder muito longo.`);
        }
      });
    }

    // --- cor ---
    if (obj.cor && !C.RE_HEX.test(obj.cor)) {
      erros.push('Cor inválida (use #RRGGBB).');
    }

    if (erros.length) return { ok: false, erros };

    return { ok: true, dados: normalizar(obj) };
  }

  /**
   * Normaliza o formulário importado para o formato interno.
   */
  function normalizar(obj) {
    return {
      id: null, // deixa o storage criar
      titulo: String(obj.titulo ?? '').trim(),
      descricao: String(obj.descricao ?? '').trim(),
      cor: C.RE_HEX.test(obj.cor) ? obj.cor : C.COR_PADRAO,
      dm: obj.dm !== false,
      anonimo: !!obj.anonimo,
      categoria: String(obj.categoria ?? ''),
      perguntas: (obj.perguntas ?? []).map(p => ({
        id: U.uuid(),
        pergunta: String(p.pergunta ?? '').trim(),
        tipo: C.TIPOS_POR_ID[p.tipo] ? p.tipo : C.TIPO_FALLBACK,
        placeholder: String(p.placeholder ?? '').trim(),
        obrigatoria: !!p.obrigatoria,
        opcoes: Array.isArray(p.opcoes) ? p.opcoes : [],
      })),
    };
  }

  /* =========================================================
   *  API
   * =======================================================*/
  function importarDeTexto(texto) {
    return tentarParse(texto);
  }

  async function importarDeArquivo(file) {
    try {
      const texto = await U.lerArquivoComoTexto(file);
      return tentarParse(texto);
    } catch (err) {
      return { ok: false, erros: [err.message] };
    }
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.importer = Object.freeze({
    importarDeTexto,
    importarDeArquivo,
    tentarParse,
    normalizar,
  });
})();
