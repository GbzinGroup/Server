(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[history] Dependências faltando.'); return; }

  const LIMITE = C.LIMITES.HISTORICO_MAX ?? 30;
  const pilha = [];
  const refazer = [];
  let atual = null;
  const ouvintes = new Set();

  function push(estado, nome = '') {
    const copia = U.clonar(estado);
    if (atual && U.iguais(atual, copia)) return false;
    if (atual !== null) {
      pilha.push({ estado: atual, nome: nome || 'alteração' });
      if (pilha.length > LIMITE) pilha.shift();
    }
    atual = copia;
    refazer.length = 0;
    notificar('push');
    return true;
  }

  function reset(estado) {
    pilha.length = 0;
    refazer.length = 0;
    atual = U.clonar(estado);
    notificar('reset');
  }

  function podeDesfazer() { return pilha.length > 0; }
  function podeRefazer() { return refazer.length > 0; }

  function desfazer() {
    if (!podeDesfazer()) return null;
    const item = pilha.pop();
    refazer.push({ estado: atual, nome: item.nome });
    if (refazer.length > LIMITE) refazer.shift();
    atual = item.estado;
    notificar('undo');
    return U.clonar(atual);
  }

  function refazerAcao() {
    if (!podeRefazer()) return null;
    const item = refazer.pop();
    pilha.push({ estado: atual, nome: item.nome });
    if (pilha.length > LIMITE) pilha.shift();
    atual = item.estado;
    notificar('redo');
    return U.clonar(atual);
  }

  function estadoAtual() { return U.clonar(atual); }
  function tamanho() { return { undo: pilha.length, redo: refazer.length }; }
  function limpar() { pilha.length = 0; refazer.length = 0; notificar('limpar'); }

  function aoMudar(fn) {
    if (typeof fn !== 'function') return () => {};
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  }

  function notificar(tipo) {
    for (const fn of ouvintes) {
      try { fn(tipo, tamanho()); } catch (err) { U.erro('[history] ouvinte:', err); }
    }
  }

  window.FF = window.FF || {};
  window.FF.history = Object.freeze({
    push, reset, desfazer, refazer: refazerAcao,
    podeDesfazer, podeRefazer, estadoAtual, tamanho, limpar, aoMudar, LIMITE,
  });
})();
