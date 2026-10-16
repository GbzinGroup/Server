/**
 * js/settings.js
 * -------------------------------------------------------------
 * Preferências do usuário (tema, densidade, autosave, etc).
 * Persistido no localStorage, na chave `ff:config`.
 *
 * Expõe: window.FF.settings
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  const S = window.FF?.storage;

  if (!C || !U) {
    console.error('[settings] config.js e utils.js precisam vir antes.');
    return;
  }

  const CHAVE = C.CHAVES.CONFIG;

  /* =========================================================
   *  PADRÕES
   * =======================================================*/
  const PADROES = Object.freeze({
    // Aparência
    temaEscuro: true,
    densidadeCompacta: false,
    animacoes: true,

    // Editor
    autosave: true,
    autosaveIntervalo: 800,
    confirmarExcluir: true,
    mostrarDiagnostico: true,
    previewAutomatico: true,

    // Comportamento
    abrirEditorVazio: false,
    ultimaView: 'dashboard',
    ultimaAbaPreview: 'embed',

    // Backup
    backupAutomatico: false,
    backupIntervaloDias: 7,
  });

  /* =========================================================
   *  ESTADO EM MEMÓRIA
   * =======================================================*/
  let cache = null;

  const ouvintes = new Set();

  /* =========================================================
   *  CARREGAR / SALVAR
   * =======================================================*/
  function carregar() {
    if (cache) return cache;

    try {
      const raw = localStorage.getItem(CHAVE);
      const salvo = raw ? JSON.parse(raw) : {};

      cache = {
        ...PADROES,
        ...(salvo && typeof salvo === 'object' ? salvo : {}),
      };
    } catch (err) {
      U.erro('[settings] Falha ao carregar, usando padrões:', err.message);
      cache = { ...PADROES };
    }

    return cache;
  }

  function persistir() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(cache));
      return true;
    } catch (err) {
      U.erro('[settings] Falha ao salvar:', err.message);
      return false;
    }
  }

  /* =========================================================
   *  GET / SET
   * =======================================================*/
  function get(chave) {
    const s = carregar();
    if (chave === undefined) return { ...s };
    return s[chave];
  }

  function set(chave, valor) {
    const s = carregar();
    const antigo = s[chave];

    if (U.iguais(antigo, valor)) return antigo;

    s[chave] = valor;
    persistir();

    notificar(chave, valor, antigo);
    return valor;
  }

  function setVarios(patch) {
    if (!patch || typeof patch !== 'object') return;

    const s = carregar();
    const alterados = [];

    for (const [k, v] of Object.entries(patch)) {
      if (!U.iguais(s[k], v)) {
        const antigo = s[k];
        s[k] = v;
        alterados.push([k, v, antigo]);
      }
    }

    if (alterados.length) {
      persistir();
      for (const [k, v, antigo] of alterados) notificar(k, v, antigo);
    }
  }

  function resetar(chave) {
    if (chave) {
      set(chave, PADROES[chave]);
    } else {
      cache = { ...PADROES };
      persistir();
      notificar('*', null, null);
    }
  }

  function padrao(chave) {
    return PADROES[chave];
  }

  /* =========================================================
   *  OUVINTES
   * =======================================================*/
  function aoMudar(fn) {
    if (typeof fn !== 'function') return () => {};
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  }

  function notificar(chave, novo, antigo) {
    for (const fn of ouvintes) {
      try { fn(chave, novo, antigo); }
      catch (err) { U.erro('[settings] ouvinte falhou:', err); }
    }
  }

  /* =========================================================
   *  APLICAR AO DOM
   *  - data-tema   → 'escuro' | 'claro'
   *  - data-densidade → 'compacta' | 'confortavel'
   *  - data-animacoes → 'on' | 'off'
   * =======================================================*/
  function aplicarAoTema() {
    const s = carregar();
    const html = document.documentElement;

    html.setAttribute('data-tema', s.temaEscuro ? 'escuro' : 'claro');
    html.setAttribute('data-densidade', s.densidadeCompacta ? 'compacta' : 'confortavel');
    html.setAttribute('data-animacoes', s.animacoes ? 'on' : 'off');

    // Cor da barra do navegador (mobile)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = s.temaEscuro ? '#1a1b1e' : '#f6f7f9';
  }

  function aplicarTudo() {
    aplicarAoTema();
    // Mais aplicações podem ser adicionadas aqui no futuro.
  }

  /* =========================================================
   *  INIT
   * =======================================================*/
  function init() {
    carregar();

    // Aplica o tema imediatamente (evita flash)
    aplicarAoTema();

    // Reaplica quando settings mudar
    aoMudar((chave) => {
      if (['temaEscuro', 'densidadeCompacta', 'animacoes'].includes(chave) || chave === '*') {
        aplicarAoTema();
      }
    });
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.settings = Object.freeze({
    init,
    get,
    set,
    setVarios,
    resetar,
    padrao,
    PADROES,
    aoMudar,
    aplicarAoTema,
    aplicarTudo,
  });

  init();
})();
