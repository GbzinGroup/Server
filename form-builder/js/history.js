/**
 * js/history.js
 * -------------------------------------------------------------
 * Sistema de undo/redo (pilha de snapshots).
 *
 * Expõe: window.FF.history
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[history] config.js e utils.js precisam vir antes.');
    return;
  }

  const LIMITE = C.LIMITES.HISTORICO_MAX ?? 30;

  const pilha = [];       // undo stack
  const refazer = [];     // redo stack
  let atual = null;       // estado atual
  let transacaoAberta = false;
  let transacaoNome = '';

  /* =========================================================
   *  PUSH
   * =======================================================*/
  /**
   * Salva um snapshot. Ignora se for igual ao atual.
   */
  function push(estado, nome = '') {
    const copia = U.clonar(estado);

    // Nada mudou?
    if (atual && U.iguais(atual, copia)) return false;

    // Guarda o "atual" no undo
    if (atual !== null) {
      pilha.push({ estado: atual, nome: nome || 'alteração' });
      if (pilha.length > LIMITE) pilha.shift();
    }

    atual = copia;
    refazer.length = 0; // limpa redo (nova linha de tempo)

    notificar('push');
    return true;
  }

  /**
   * Inicializa o histórico com um estado base.
   */
  function reset(estado) {
    pilha.length = 0;
    refazer.length = 0;
    atual = U.clonar(estado);
    notificar('reset');
  }

  /* =========================================================
   *  UNDO / REDO
   * =======================================================*/
  function podeDesfazer() {
    return pilha.length > 0;
  }

  function podeRefazer() {
    return refazer.length > 0;
  }

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

  /* =========================================================
   *  TRANSAÇÕES (agrupa várias alterações em 1 passo)
   * =======================================================*/
  function inicioTransacao(nome = '') {
    transacaoAberta = true;
    transacaoNome = nome;
  }

  function fimTransacao() {
    transacaoAberta = false;
    transacaoNome = '';
  }

  /* =========================================================
   *  ESTADO ATUAL
   * =======================================================*/
  function estadoAtual() {
    return U.clonar(atual);
  }

  function tamanho() {
    return { undo: pilha.length, redo: refazer.length };
  }

  function limpar() {
    pilha.length = 0;
    refazer.length = 0;
    notificar('limpar');
  }

  /* =========================================================
   *  OUVINTES
   * =======================================================*/
  const ouvintes = new Set();

  function aoMudar(fn) {
    if (typeof fn !== 'function') return () => {};
    ouvintes.add(fn);
    return () => ouvintes.delete(fn);
  }

  function notificar(tipo) {
    for (const fn of ouvintes) {
      try { fn(tipo, tamanho()); }
      catch (err) { U.erro('[history] ouvinte falhou:', err); }
    }
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.history = Object.freeze({
    push,
    reset,
    desfazer,
    refazer: refazerAcao,
    podeDesfazer,
    podeRefazer,
    estadoAtual,
    tamanho,
    limpar,
    aoMudar,
    inicioTransacao,
    fimTransacao,
    LIMITE,
  });
})();
