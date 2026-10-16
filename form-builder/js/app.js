(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  const S = window.FF?.storage;
  const SET = window.FF?.settings;
  const ED = window.FF?.editor;
  const DB = window.FF?.dashboard;
  const EX = window.FF?.exporter;
  const IM = window.FF?.importer;
  const TPL = window.FF?.templates;

  if (!C || !U || !S) { console.error('[app] Dependências base faltando.'); return; }

  let viewAtual = 'dashboard';
  let
