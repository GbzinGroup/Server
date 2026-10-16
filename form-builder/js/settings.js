(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[settings] Dependências faltando.'); return; }

  const CHAVE = C.CHAVES.CONFIG;

  const PADROES = Object.freeze({
    temaEscuro: true,
    densidadeCompacta: false,
    animacoes: true,
    autosave: true,
    confirmarExcluir: true,
  });

  let cache = null;
  const ouvintes = new Set();

  function carregar() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(CHAVE);
      const salvo = raw ? JSON.parse(raw) : {};
      cache = { ...PADROES, ...(salvo && typeof salvo === 'object' ? salvo : {}) };
    } catch (err) {
      U.erro('[settings] Carregar:', err.message);
      cache = { ...PADROES };
    }
    return cache;
  }

  function persistir() {
    try { localStorage.setItem(CHAVE, JSON.stringify(cache)); return true; }
    catch (err) { U.erro('[settings] Persistir:', err.message); return false; }
  }

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

  function aoMudar(fn) {
    if (typeof fn !== 'function') return () => {};
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  }

  function notificar(chave, novo, antigo) {
    for (const fn of ouvintes) {
      try { fn(chave, novo, antigo); } catch (err) { U.erro('[settings] ouvinte:', err); }
    }
  }

  function aplicarAoTema() {
    const s = carregar();
    const html = document.documentElement;
    html.setAttribute('data-tema', s.temaEscuro ? 'escuro' : 'claro');
    html.setAttribute('data-densidade', s.densidadeCompacta ? 'compacta' : 'confortavel');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = s.temaEscuro ? '#1a1b1e' : '#f6f7f9';
  }

  function init() {
    carregar();
    aplicarAoTema();
    aoMudar((chave) => {
      if (['temaEscuro', 'densidadeCompacta', 'animacoes'].includes(chave)) aplicarAoTema();
    });
  }

  window.FF = window.FF || {};
  window.FF.settings = Object.freeze({
    init, get, set, aoMudar, PADROES, aplicarAoTema,
  });

  init();
})();
