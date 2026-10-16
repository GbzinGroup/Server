/**
 * js/storage.js
 * -------------------------------------------------------------
 * Camada de persistência em localStorage com:
 *   - Formulários salvos (CRUD)
 *   - Rascunho atual (autosave)
 *   - Favoritos
 *   - Versionamento / migração
 *   - Backup (export/import)
 *   - Tratamento de corrupção
 *
 * Expõe: window.FF.storage
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[storage] config.js e utils.js precisam vir antes.');
    return;
  }

  const { CHAVES, SCHEMA_ATUAL, LIMITES } = C;

  /* =========================================================
   *  LOW-LEVEL
   * =======================================================*/
  function lerChave(chave, fallback = null) {
    try {
      const raw = localStorage.getItem(chave);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (err) {
      U.erro(`[storage] Falha ao ler "${chave}":`, err.message);
      return fallback;
    }
  }

  function gravarChave(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (err) {
      // QuotaExceededError?
      if (err?.name === 'QuotaExceededError' || /quota/i.test(err?.message)) {
        U.erro('[storage] Cota excedida. Considere limpar formulários antigos.');
        throw new Error('Espaço de armazenamento cheio. Exporte um backup e apague itens antigos.');
      }
      U.erro(`[storage] Falha ao gravar "${chave}":`, err.message);
      return false;
    }
  }

  function removerChave(chave) {
    try { localStorage.removeItem(chave); return true; }
    catch { return false; }
  }

  /* =========================================================
   *  SCHEMA / MIGRAÇÃO
   * =======================================================*/
  function schemaAtual() {
    return lerChave(CHAVES.SCHEMA, 1);
  }

  function migrar() {
    const schema = schemaAtual();
    if (schema >= SCHEMA_ATUAL) return;

    U.log(`[storage] Migrando schema ${schema} → ${SCHEMA_ATUAL}`);

    // Schema 1 → 2: formulários passam a ter `favorito`, `atualizadoEm`
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

  /* =========================================================
   *  FORMULÁRIOS — CRUD
   * =======================================================*/
  function listar() {
    const lista = lerChave(CHAVES.FORMULARIOS, []);
    return Array.isArray(lista) ? lista : [];
  }

  function salvarLista(lista) {
    if (!Array.isArray(lista)) return false;
    return gravarChave(CHAVES.FORMULARIOS, lista);
  }

  function obter(id) {
    if (!id) return null;
    return listar().find(f => f.id === id) ?? null;
  }

  /**
   * Cria um formulário novo ou salva um existente.
   * Se `id` existir na lista → atualiza. Se não → cria.
   */
  function salvar(form) {
    if (!form || typeof form !== 'object') return null;

    const lista = listar();
    const agora = U.agora();

    // Garante campos mínimos
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

    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...base };
    } else {
      lista.unshift(base);
    }

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
    const original = obter(id);
    if (!original) return null;

    const copia = {
      ...U.clonar(original),
      id: U.uuid(),
      titulo: `${original.titulo || 'Sem título'} (cópia)`,
      favorito: false,
      criadoEm: U.agora(),
      atualizadoEm: U.agora(),
    };

    return salvar(copia);
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

  function renomear(id, novoTitulo) {
    const lista = listar();
    const idx = lista.findIndex(f => f.id === id);
    if (idx < 0) return null;

    lista[idx].titulo = String(novoTitulo ?? '').slice(0, LIMITES.TITULO_MAX);
    lista[idx].atualizadoEm = U.agora();
    salvarLista(lista);
    return lista[idx];
  }

  /* =========================================================
   *  RASCUNHO
   * =======================================================*/
  function salvarRascunho(form) {
    return gravarChave(CHAVES.RASCUNHO, {
      ...form,
      _rascunho: true,
      _salvoEm: U.agora(),
    });
  }

  function lerRascunho() {
    const r = lerChave(CHAVES.RASCUNHO, null);
    return r && typeof r === 'object' ? r : null;
  }

  function limparRascunho() {
    return removerChave(CHAVES.RASCUNHO);
  }

  /* =========================================================
   *  BACKUP
   * =======================================================*/
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

    if (!dados || typeof dados !== 'object') {
      throw new Error('Backup inválido.');
    }

    if (!dados._backup) {
      throw new Error('Esse arquivo não é um backup do FormForge.');
    }

    const formulariosNovos = Array.isArray(dados.formularios) ? dados.formularios : [];

    if (substituir) {
      salvarLista(formulariosNovos);
    } else {
      // Merge: mantém existentes + adiciona novos com ids diferentes
      const lista = listar();
      const ids = new Set(lista.map(f => f.id));

      for (const f of formulariosNovos) {
        if (!f?.id) continue;
        if (ids.has(f.id)) {
          // Renomeia o id pra não sobrescrever
          const copia = { ...f, id: U.uuid(), titulo: `${f.titulo} (restaurado)` };
          lista.unshift(copia);
        } else {
          lista.unshift(f);
        }
      }

      salvarLista(lista);
    }

    if (dados.rascunho) gravarChave(CHAVES.RASCUNHO, dados.rascunho);
    if (dados.config)    gravarChave(CHAVES.CONFIG, dados.config);

    return {
      formularios: formulariosNovos.length,
      tinhaRascunho: !!dados.rascunho,
      tinhaConfig: !!dados.config,
    };
  }

  /* =========================================================
   *  LIMPEZA / ESTATÍSTICAS
   * =======================================================*/
  function limparTudo() {
    removerChave(CHAVES.FORMULARIOS);
    removerChave(CHAVES.RASCUNHO);
    removerChave(CHAVES.CONFIG);
    removerChave(CHAVES.SCHEMA);
    removerChave(CHAVES.BACKUP_META);
  }

  function estatisticas() {
    const lista = listar();
    const favoritos = lista.filter(f => f.favorito).length;
    const rascunho = lerRascunho();
    const ultima = lista.reduce((acc, f) => Math.max(acc, f.atualizadoEm ?? 0), 0);

    return {
      total: lista.length,
      favoritos,
      temRascunho: !!rascunho,
      ultimaEdicao: ultima || null,
    };
  }

  function espacoUsado() {
    try {
      let total = 0;
      for (const k of Object.values(CHAVES)) {
        const v = localStorage.getItem(k);
        if (v) total += v.length;
      }
      return {
        bytes: total,
        kb: (total / 1024).toFixed(2),
      };
    } catch {
      return { bytes: 0, kb: '0.00' };
    }
  }

  /* =========================================================
   *  INICIALIZAÇÃO
   * =======================================================*/
  function init() {
    try {
      migrar();
    } catch (err) {
      U.erro('[storage] Falha na migração:', err.message);
    }
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.storage = Object.freeze({
    init,

    // Formulários
    listar,
    obter,
    salvar,
    remover,
    duplicar,
    favoritar,
    renomear,
    salvarLista,

    // Rascunho
    salvarRascunho,
    lerRascunho,
    limparRascunho,

    // Backup
    exportarBackup,
    importarBackup,

    // Manutenção
    limparTudo,
    estatisticas,
    espacoUsado,

    // Debug
    _lerChave: lerChave,
  });

  init();
})();
