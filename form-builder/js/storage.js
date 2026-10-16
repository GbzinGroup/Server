(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[storage] Dependências faltando.'); return; }

  const { CHAVES, SCHEMA_ATUAL, LIMITES } = C;

  function lerChave(chave, fallback = null) {
    try {
      const raw = localStorage.getItem(chave);
      if (raw === null) return fallback;
      return JSON.parse(raw) ?? fallback;
    } catch (err) {
      U.erro(`[storage] Ler "${chave}":`, err.message);
      return fallback;
    }
  }

  function gravarChave(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (err) {
      if (err?.name === 'QuotaExceededError' || /quota/i.test(err?.message)) {
        throw new Error('Armazenamento cheio. Exporte um backup e apague itens.');
      }
      U.erro(`[storage] Gravar "${chave}":`, err.message);
      return false;
    }
  }

  function removerChave(chave) { try { localStorage.removeItem(chave); return true; } catch { return false; } }

  function migrar() {
    const schema = lerChave(CHAVES.SCHEMA, 1);
    if (schema >= SCHEMA_ATUAL) return;
    if (schema < 2) {
      const lista = lerChave(CHAVES.FORMULARIOS, []);
      if (Array.isArray(lista)) {
        const migrados = lista.map(f => ({
          favorito: false,
          atualizadoEm: f.criadoEm ?? U.agora(),
          ...f,
        }));
        gravarChave(CHAVES.FORMULARIOS, migrados);
      }
    }
    gravarChave(CHAVES.SCHEMA, SCHEMA_ATUAL);
  }

  function listar() {
    const lista = lerChave(CHAVES.FORMULARIOS, []);
    return Array.isArray(lista) ? lista : [];
  }

  function salvarLista(lista) { return Array.isArray(lista) ? gravarChave(CHAVES.FORMULARIOS, lista) : false; }
  function obter(id) { return id ? (listar().find(f => f.id === id) ?? null) : null; }

  function salvar(form) {
    if (!form || typeof form !== 'object') return null;
    const lista = listar();
    const agora = U.agora();
    const base = {
      id: form.id ?? U.uuid(),
      titulo: form.titulo ?? '',
      descricao: form.descricao ?? '',
      cor: form.cor ?? C.COR_PADRAO,
      dm: form.dm !== false,
      anonimo: !!form.anonimo,
      categoria: form.categoria ?? '',
      perguntas: Array.isArray(form.perguntas) ? form.perguntas : [],
      favorito: !!form.favorito,
      criadoEm: form.criadoEm ?? agora,
      atualizadoEm: agora,
      _versao: form._versao ?? C.VERSAO_FORMATO_LEGADO,
    };
    const idx = lista.findIndex(f => f.id === base.id);
    if (idx >= 0) lista[idx] = { ...lista[idx], ...base };
    else lista.unshift(base);
    salvarLista(lista);
    return base;
  }

  function remover(id) {
    if (!id
