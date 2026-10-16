(function () {
  'use strict';

  const C = window.FF?.config;
  if (!C) { console.error('[utils] config.js precisa vir antes.'); return; }

  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function escapeAttr(s) { return escapeHtml(s); }

  function truncar(s, max) {
    s = String(s ?? '');
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function slug(s) {
    return String(s ?? '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

  function hexParaInt(hex) {
    if (typeof hex !== 'string') return C.COR_FALLBACK;
    const limpo = hex.trim().replace(/^#/, '').replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]{6}$/.test(limpo)) return C.COR_FALLBACK;
    return parseInt(limpo, 16);
  }

  function corValida(hex) { return C.RE_HEX.test(String(hex ?? '').trim()); }

  function agora() { return Date.now(); }

  function formatarData(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${h}:${m}`;
  }

  function tempoRelativo(ts) {
    const diff = Date.now() - ts;
    const seg = Math.floor(diff / 1000);
    if (seg < 60) return 'agora';
    if (seg < 3600) return `${Math.floor(seg / 60)} min atrás`;
    if (seg < 86400) return `${Math.floor(seg / 3600)} h atrás`;
    if (seg < 604800) return `${Math.floor(seg / 86400)} d atrás`;
    return formatarData(ts).split(' ')[0];
  }

  function debounce(fn, ms = 250) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function clonar(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    try { return structuredClone(obj); } catch { return JSON.parse(JSON.stringify(obj)); }
  }

  function iguais(a, b) {
    try { return JSON.stringify(a) === JSON.stringify(b); } catch { return false; }
  }

  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

  function criar(tag, attrs = {}, filhos = []) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v !== null && v !== undefined && v !== false) el.setAttribute(k, v === true ? '' : v);
    }
    for (const f of [].concat(filhos)) {
      if (f == null) continue;
      el.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
    }
    return el;
  }

  function limpar(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

  function on(el, ev, fn, opts) {
    if (!el) return () => {};
    el.addEventListener(ev, fn, opts);
    return () => el.removeEventListener(ev, fn, opts);
  }

  function baixarArquivo(nome, conteudo, tipo = 'application/json') {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nome; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
  }

  async function copiarTexto(texto) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(texto));
        return true;
      }
    } catch { /* */ }
    try {
      const ta = document.createElement('textarea');
      ta.value = String(texto);
      ta.style.position = 'fixed'; ta.style.top = '-1000px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch { return false; }
  }

  function lerArquivoComoTexto(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Nenhum arquivo.'));
      if (file.size > 5 * 1024 * 1024) return reject(new Error('Arquivo muito grande (máx 5 MB).'));
      const r = new FileReader();
      r.onload = () => resolve(String(r.result ?? ''));
      r.onerror = () => reject(new Error('Falha ao ler arquivo.'));
      r.readAsText(file, 'utf-8');
    });
  }

  function parseJson(texto) {
    try { return { ok: true, valor: JSON.parse(String(texto)) }; }
    catch (err) { return { ok: false, erro: err.message }; }
  }

  function log(...a) { console.log('%c[FF]', 'color:#5865f2;font-weight:bold', ...a); }
  function warn(...a) { console.warn('%c[FF]', 'color:#fee75c;font-weight:bold', ...a); }
  function erro(...a) { console.error('%c[FF]', 'color:#ed4245;font-weight:bold', ...a); }

  window.FF = window.FF || {};
  window.FF.utils = Object.freeze({
    uuid, escapeHtml, escapeAttr, truncar, slug, clamp,
    hexParaInt, corValida, agora, formatarData, tempoRelativo,
    debounce, clonar, iguais,
    $, $$, criar, limpar, on,
    baixarArquivo, copiarTexto, lerArquivoComoTexto,
    parseJson, log, warn, erro,
  });
})();
