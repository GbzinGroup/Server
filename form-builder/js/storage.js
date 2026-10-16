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
    if (!id) return false;
    const lista = listar();
    const nova = lista.filter(f => f.id !== id);
    if (nova.length === lista.length) return false;
    return salvarLista(nova);
  }

  function duplicar(id) {
    const orig = obter(id);
    if (!orig) return null;
    return salvar({
      ...U.clonar(orig),
      id: U.uuid(),
      titulo: `${orig.titulo || 'Sem título'} (cópia)`,
      favorito: false,
      criadoEm: U.agora(),
    });
  }

  function favoritar(id, valor) {
    const lista = listar();
    const idx = lista.findIndex(f => f.id === id);
    if (idx < 0) return null;
    lista[idx].favorito = valor !== undefined ? !!valor : !lista[idx].favorito;
    lista[idx].atualizadoEm = U.agora();
    salvarLista(lista);
    return lista[idx];
  }

  function salvarRascunho(form) { return gravarChave(CHAVES.RASCUNHO, { ...form, _rascunho: true, _salvoEm: U.agora() }); }
  function lerRascunho() { const r = lerChave(CHAVES.RASCUNHO, null); return r && typeof r === 'object' ? r : null; }
  function limparRascunho() { return removerChave(CHAVES.RASCUNHO); }

  function exportarBackup() {
    return {
      _backup: true,
      _versao: LIMITES.BACKUP_VERSAO,
      _exportadoEm: new Date().toISOString(),
      _appVersao: C.VERSAO_APP,
      schema: SCHEMA_ATUAL,
      formularios: listar(),
      rascunho: lerRascunho(),
      config: lerChave(CHAVES.CONFIG, null),
    };
  }

  function importarBackup(dados, opcoes = {}) {
    const { substituir = false } = opcoes;
    if (!dados || typeof dados !== 'object') throw new Error('Backup inválido.');
    if (!dados._backup) throw new Error('Esse arquivo não é um backup do FormForge.');
    const novos = Array.isArray(dados.formularios) ? dados.formularios : [];
    if (substituir) {
      salvarLista(novos);
    } else {
      const lista = listar();
      const ids = new Set(lista.map(f => f.id));
      for (const f of novos) {
        if (!f?.id) continue;
        if (ids.has(f.id)) lista.unshift({ ...f, id: U.uuid(), titulo: `${f.titulo} (restaurado)` });
        else lista.unshift(f);
      }
      salvarLista(lista);
    }
    if (dados.rascunho) gravarChave(CHAVES.RASCUNHO, dados.rascunho);
    if (dados.config) gravarChave(CHAVES.CONFIG, dados.config);
    return { formularios: novos.length };
  }

  function limparTudo() {
    Object.values(CHAVES).forEach(removerChave);
  }

  function estatisticas() {
    const lista = listar();
    const favoritos = lista.filter(f => f.favorito).length;
    const rascunho = lerRascunho();
    const ultima = lista.reduce((a, f) => Math.max(a, f.atualizadoEm ?? 0), 0);
    return { total: lista.length, favoritos, temRascunho: !!rascunho, ultimaEdicao: ultima || null };
  }

  function init() { try { migrar(); } catch (err) { U.erro('[storage] Migração:', err.message); } }

  window.FF = window.FF || {};
  window.FF.storage = Object.freeze({
    init, listar, obter, salvar, remover, duplicar, favoritar, salvarLista,
    salvarRascunho, lerRascunho, limparRascunho,
    exportarBackup, importarBackup,
    limparTudo, estatisticas,
  });

  init();
})();
