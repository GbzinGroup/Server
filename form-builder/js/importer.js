(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[importer] Dependências faltando.'); return; }

  function tentarParse(texto) {
    const r = U.parseJson(texto);
    if (!r.ok) return { ok: false, erros: [`JSON inválido: ${r.erro}`] };
    const obj = r.valor;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return { ok: false, erros: ['O JSON precisa ser um objeto.'] };
    }
    const erros = [];
    if (!obj.titulo || typeof obj.titulo !== 'string') erros.push('Falta o campo "titulo".');
    if (!Array.isArray(obj.perguntas)) erros.push('Falta o campo "perguntas".');
    else if (obj.perguntas.length === 0) erros.push('Adicione pelo menos 1 pergunta.');
    else if (obj.perguntas.length > C.LIMITES.PERGUNTAS_MAX) {
      erros.push(`Máximo ${C.LIMITES.PERGUNTAS_MAX} perguntas.`);
    } else {
      obj.perguntas.forEach((p, i) => {
        if (!p?.pergunta) erros.push(`Pergunta ${i + 1}: falta o texto.`);
        if (p?.tipo && !C.TIPOS_POR_ID[p.tipo]) erros.push(`Pergunta ${i + 1}: tipo "${p.tipo}" inválido.`);
      });
    }
    if (obj.cor && !C.RE_HEX.test(obj.cor)) erros.push('Cor inválida.');
    if (erros.length) return { ok: false, erros };
    return { ok: true, dados: normalizar(obj) };
  }

  function normalizar(obj) {
    return {
      id: null,
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
        opcoes: [],
      })),
    };
  }

  function importarDeTexto(texto) { return tentarParse(texto); }

  async function importarDeArquivo(file) {
    try {
      const texto = await U.lerArquivoComoTexto(file);
      return tentarParse(texto);
    } catch (err) { return { ok: false, erros: [err.message] }; }
  }

  window.FF = window.FF || {};
  window.FF.importer = Object.freeze({ importarDeTexto, importarDeArquivo, tentarParse, normalizar });
})();
