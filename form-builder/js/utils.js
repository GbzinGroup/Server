/**
 * js/utils.js
 * -------------------------------------------------------------
 * Helpers puros. Nada aqui depende de storage ou DOM de outros
 * módulos — são funções reutilizáveis em qualquer contexto.
 *
 * Expõe: window.FF.utils
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  if (!C) {
    console.error('[utils] config.js precisa ser carregado antes.');
    return;
  }

  /* =========================================================
   *  ID / UUID
   * =======================================================*/
  function uuid() {
    if (crypto?.randomUUID) return crypto.randomUUID();

    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function idCurto() {
    return Math.random().toString(36).slice(2, 10);
  }

  /* =========================================================
   *  STRINGS
   * =======================================================*/
  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/`/g, '&#096;');
  }

  function truncar(s, max) {
    s = String(s ?? '');
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
  }

  function slug(s) {
    return String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  }

  function tituloCase(s) {
    return String(s ?? '')
      .toLowerCase()
      .replace(/(?:^|\s)\S/g, c => c.toUpperCase());
  }

  /* =========================================================
   *  NÚMEROS / CORES
   * =======================================================*/
  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function hexParaInt(hex) {
    if (typeof hex !== 'string') return C.COR_FALLBACK;
    const limpo = hex.trim().replace(/^#/, '').replace(/^0x/i, '');
    if (!/^[0-9a-fA-F]{6}$/.test(limpo)) return C.COR_FALLBACK;
    return parseInt(limpo, 16);
  }

  function intParaHex(n) {
    if (typeof n !== 'number' || !Number.isFinite(n)) return C.COR_PADRAO;
    return '#' + clamp(Math.trunc(n), 0, 0xffffff).toString(16).padStart(6, '0');
  }

  function corValida(hex) {
    return C.RE_HEX.test(String(hex ?? '').trim());
  }

  /* =========================================================
   *  DATAS
   * =======================================================*/
  function agora() {
    return Date.now();
  }

  function formatarData(ts, opcoes = {}) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '—';

    const { curto = false, comHora = true } = opcoes;

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();

    if (curto) return `${dia}/${mes}/${ano}`;

    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    return comHora
      ? `${dia}/${mes}/${ano} ${hora}:${min}`
      : `${dia}/${mes}/${ano}`;
  }

  function tempoRelativo(ts) {
    const diff = Date.now() - ts;
    const seg = Math.floor(diff / 1000);

    if (seg < 60) return 'agora mesmo';
    if (seg < 3600) return `${Math.floor(seg / 60)} min atrás`;
    if (seg < 86400) return `${Math.floor(seg / 3600)} h atrás`;
    if (seg < 604800) return `${Math.floor(seg / 86400)} d atrás`;
    return formatarData(ts, { curto: true });
  }

  /* =========================================================
   *  DEBOUNCE / THROTTLE
   * =======================================================*/
  function debounce(fn, ms = 250) {
    let timer = null;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function throttle(fn, ms = 200) {
    let ultimo = 0;
    let timer = null;
    return function throttled(...args) {
      const agora = Date.now();
      const restante = ms - (agora - ultimo);

      if (restante <= 0) {
        clearTimeout(timer);
        timer = null;
        ultimo = agora;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          ultimo = Date.now();
          timer = null;
          fn.apply(this, args);
        }, restante);
      }
    };
  }

  /* =========================================================
   *  OBJETOS
   * =======================================================*/
  function clonar(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (typeof structuredClone === 'function') {
      try { return structuredClone(obj); } catch { /* fallback */ }
    }
    return JSON.parse(JSON.stringify(obj));
  }

  function iguais(a, b) {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  function pegar(obj, caminho, fallback = undefined) {
    const partes = String(caminho ?? '').split('.');
    let atual = obj;
    for (const p of partes) {
      if (atual == null) return fallback;
      atual = atual[p];
    }
    return atual === undefined ? fallback : atual;
  }

  function definir(obj, caminho, valor) {
    const partes = String(caminho ?? '').split('.');
    const ultimo = partes.pop();
    let atual = obj;
    for (const p of partes) {
      if (typeof atual[p] !== 'object' || atual[p] === null) atual[p] = {};
      atual = atual[p];
    }
    atual[ultimo] = valor;
    return obj;
  }

  /* =========================================================
   *  ARRAYS
   * =======================================================*/
  function mover(arr, de, para) {
    if (de === para) return arr;
    if (de < 0 || de >= arr.length) return arr;
    if (para < 0 || para >= arr.length) return arr;
    const copia = [...arr];
    const [item] = copia.splice(de, 1);
    copia.splice(para, 0, item);
    return copia;
  }

  function unico(arr) {
    return [...new Set(arr)];
  }

  /* =========================================================
   *  DOM HELPERS
   * =======================================================*/
  const $ = (sel, raiz = document) => raiz.querySelector(sel);
  const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

  function criar(tag, attrs = {}, filhos = []) {
    const el = document.createElement(tag);

    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v !== null && v !== undefined && v !== false) {
        el.setAttribute(k, v === true ? '' : v);
      }
    }

    for (const f of [].concat(filhos)) {
      if (f == null) continue;
      el.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
    }

    return el;
  }

  function limpar(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function on(el, evento, fn, opcoes) {
    if (!el) return () => {};
    el.addEventListener(evento, fn, opcoes);
    return () => el.removeEventListener(evento, fn, opcoes);
  }

  /* =========================================================
   *  ARQUIVOS / DOWNLOAD / CLIPBOARD
   * =======================================================*/
  function baixarArquivo(nome, conteudo, tipo = 'application/json') {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function copiarTexto(texto) {
    const s = String(texto ?? '');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(s);
        return true;
      }
    } catch { /* fallback abaixo */ }

    // Fallback antigo
    try {
      const ta = document.createElement('textarea');
      ta.value = s;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }

  function lerArquivoComoTexto(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Nenhum arquivo.'));

      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error('Arquivo muito grande (máx. 5 MB).'));
      }

      const leitor = new FileReader();
      leitor.onload = () => resolve(String(leitor.result ?? ''));
      leitor.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
      leitor.readAsText(file, 'utf-8');
    });
  }

  /* =========================================================
   *  JSON SEGURO
   * =======================================================*/
  function parseJson(texto) {
    try {
      return { ok: true, valor: JSON.parse(String(texto)) };
    } catch (err) {
      return { ok: false, erro: err.message };
    }
  }

  function jsonBonito(obj, espacos = 2) {
    try {
      return JSON.stringify(obj, null, espacos);
    } catch {
      return '{}';
    }
  }

  /* =========================================================
   *  VALIDAÇÃO LEVE
   * =======================================================*/
  function ehTexto(valor) {
    return typeof valor === 'string';
  }

  function ehNumeroValido(n) {
    return typeof n === 'number' && Number.isFinite(n);
  }

  function ehEmail(s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s ?? ''));
  }

  function ehUrl(s) {
    try {
      new URL(String(s));
      return true;
    } catch {
      return false;
    }
  }

  /* =========================================================
   *  LOGS (com prefixo)
   * =======================================================*/
  function log(...args)  { console.log('%c[FF]', 'color:#5865f2;font-weight:bold', ...args); }
  function warn(...args) { console.warn('%c[FF]', 'color:#fee75c;font-weight:bold', ...args); }
  function erro(...args) { console.error('%c[FF]', 'color:#ed4245;font-weight:bold', ...args); }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.utils = Object.freeze({
    // ids
    uuid,
    idCurto,

    // strings
    escapeHtml,
    escapeAttr,
    truncar,
    slug,
    tituloCase,

    // números / cores
    clamp,
    hexParaInt,
    intParaHex,
    corValida,

    // datas
    agora,
    formatarData,
    tempoRelativo,

    // debounce
    debounce,
    throttle,

    // objetos
    clonar,
    iguais,
    pegar,
    definir,

    // arrays
    mover,
    unico,

    // dom
    $,
    $$,
    criar,
    limpar,
    on,

    // arquivos
    baixarArquivo,
    copiarTexto,
    lerArquivoComoTexto,

    // json
    parseJson,
    jsonBonito,

    // validação
    ehTexto,
    ehNumeroValido,
    ehEmail,
    ehUrl,

    // log
    log,
    warn,
    erro,
  });
})();
