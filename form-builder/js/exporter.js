(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[exporter] Dependências faltando.'); return; }

  function paraFormatoLegado(form) {
    const compat = (form.perguntas ?? []).filter(p => C.TIPOS_COMPATIVEIS.includes(p.tipo));
    return {
      titulo: String(form.titulo ?? '').trim(),
      descricao: String(form.descricao ?? '').trim(),
      cor: C.RE_HEX.test(form.cor ?? '') ? form.cor : C.COR_PADRAO,
      dm: form.dm !== false,
      anonimo: !!form.anonimo,
      categoria: form.categoria ?? '',
      perguntas: compat.slice(0, C.LIMITES.PERGUNTAS_MAX).map(p => ({
        pergunta: String(p.pergunta ?? '').trim(),
        tipo: p.tipo,
        placeholder: String(p.placeholder ?? '').trim(),
        obrigatoria: !!p.obrigatoria,
      })),
      _versao: C.VERSAO_FORMATO_LEGADO,
      _geradoEm: new Date().toISOString(),
    };
  }

  function paraFormatoCompleto(form) {
    return {
      ...form,
      perguntas: (form.perguntas ?? []).map(p => ({
        pergunta: String(p.pergunta ?? '').trim(),
        tipo: p.tipo,
        placeholder: String(p.placeholder ?? '').trim(),
        obrigatoria: !!p.obrigatoria,
      })),
      _versao: C.VERSAO_APP,
      _geradoEm: new Date().toISOString(),
      _formato: 'completo',
    };
  }

  function gerarJson(form, formato = C.FORMATOS_EXPORT.LEGADO) {
    let obj;
    let espacos = 2;
    if (formato === C.FORMATOS_EXPORT.COMPLETO) obj = paraFormatoCompleto(form);
    else if (formato === C.FORMATOS_EXPORT.COMPACTO) { obj = paraFormatoLegado(form); espacos = 0; }
    else obj = paraFormatoLegado(form);

    try { return { ok: true, json: JSON.stringify(obj, null, espacos), objeto: obj }; }
    catch (err) { return { ok: false, erro: err.message }; }
  }

  async function copiar(json) { return await U.copiarTexto(json); }
  function baixar(json, nome = 'formulario.json') { try { U.baixarArquivo(nome, json); return true; } catch { return false; } }
  function gerarNomeArquivo(form) { return `${U.slug(form.titulo || 'formulario') || 'formulario'}.json`; }

  window.FF = window.FF || {};
  window.FF.exporter = Object.freeze({
    gerarJson, copiar, baixar, gerarNomeArquivo,
    paraFormatoLegado, paraFormatoCompleto,
  });
})();
