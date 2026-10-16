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
  let confirmarCallback = null;
  let catAtual = 'todos';

  function init() {
    SET?.aplicarAoTema?.();
    ED?.init?.();
    DB?.init?.();
    ligarNavegacao();
    ligarBotoesGlobais();
    ligarModais();
    ligarConfiguracoes();
    ligarAtalhosGlobais();
    atualizarIconeTema();
    trocarView('dashboard');
    U.log('FormForge pronto.');
  }

  function ligarNavegacao() {
    U.$$('[data-view]').forEach(btn => {
      U.on(btn, 'click', () => trocarView(btn.dataset.view));
    });
  }

  function trocarView(nome) {
    viewAtual = nome;
    U.$$('.view').forEach(v => { v.hidden = v.dataset.view !== nome; });
    U.$$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === nome));

    if (nome === 'dashboard') DB?.render?.();
    if (nome === 'editor') ED?.renderizarPreview?.();
    if (nome === 'templates') renderizarTemplates();
  }

  function ligarBotoesGlobais() {
    U.on(U.$('#btn-tema'), 'click', toggleTema);
    U.on(U.$('#btn-ajuda'), 'click', () => abrirModal('modal-ajuda'));
    U.on(U.$('#btn-config'), 'click', () => abrirModal('modal-config'));
    U.on(U.$('#btn-novo'), 'click', novoFormulario);
    U.on(U.$('#btn-novo-vazio'), 'click', novoFormulario);
    U.on(U.$('#btn-importar'), 'click', () => abrirModal('modal-importar'));
    U.on(U.$('#btn-voltar'), 'click', () => trocarView('dashboard'));
  }

  function novoFormulario() {
    ED?.novoFormulario?.();
    trocarView('editor');
  }

  function toggleTema() {
    const escuro = SET?.get('temaEscuro') ?? true;
    SET?.set?.('temaEscuro', !escuro);
    atualizarIconeTema();
  }

  function atualizarIconeTema() {
    const btn = U.$('#btn-tema');
    if (btn) btn.textContent = (SET?.get('temaEscuro') ?? true) ? '🌙' : '☀️';
  }

  function abrirModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    setTimeout(() => m.querySelector('button, input, select, textarea')?.focus(), 50);
    U.on(m, 'click', (e) => { if (e.target === m) fecharModal(m); });
  }

  function fecharModal(m) {
    if (typeof m === 'string') m = document.getElementById(m);
    if (!m) return;
    m.hidden = true;
  }

  function ligarModais() {
    U.$$('[data-fechar-modal]').forEach(btn => {
      U.on(btn, 'click', () => fecharModal(btn.closest('.modal')));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        U.$$('.modal:not([hidden])').forEach(m => fecharModal(m));
      }
    });

    U.$$('[data-export-tab]').forEach(btn => {
      U.on(btn, 'click', () => {
        U.$$('[data-export-tab]').forEach(b => b.classList.toggle('active', b.dataset.exportTab === btn.dataset.exportTab));
        atualizarExportPreview(btn.dataset.exportTab);
      });
    });

    U.$$('[data-import-tab]').forEach(btn => {
      U.on(btn, 'click', () => {
        U.$$('[data-import-tab]').forEach(b => b.classList.toggle('active', b.dataset.importTab === btn.dataset.importTab));
        U.$$('[data-import-panel]').forEach(p => { p.hidden = p.dataset.importPanel !== btn.dataset.importTab; });
      });
    });

    U.on(U.$('#btn-copiar-json'), 'click', async () => {
      const txt = U.$('#export-code')?.textContent ?? '';
      const ok = await U.copiarTexto(txt);
      toast(ok ? 'JSON copiado!' : 'Falha ao copiar', ok ? 'sucesso' : 'erro');
    });

    U.on(U.$('#btn-baixar-json'), 'click', () => {
      const txt = U.$('#export-code')?.textContent ?? '';
      const form = ED?.obterFormularioAtual?.();
      const nome = form ? EX?.gerarNomeArquivo?.(form) ?? 'formulario.json' : 'formulario.json';
      U.baixarArquivo(nome, txt);
      toast('Download iniciado.', 'sucesso');
    });

    U.on(U.$('#btn-confirmar-import'), 'click', executarImport);

    U.on(U.$('#confirm-ok'), 'click', () => {
      if (typeof confirmarCallback === 'function') confirmarCallback();
      confirmarCallback = null;
      fecharModal('modal-confirmar');
    });

    U.on(U.$('#confirm-cancelar'), 'click', () => {
      confirmarCallback = null;
      fecharModal('modal-confirmar');
    });
  }

  async function executarImport() {
    const erros = U.$('#import-erros');
    if (erros) { erros.hidden = true; erros.textContent = ''; }

    const aba = U.$('[data-import-tab].active')?.dataset.importTab ?? 'colar';
    let r;

    if (aba === 'arquivo') {
      const file = U.$('#import-file')?.files?.[0];
      if (!file) { mostrarErrosImport(['Selecione um arquivo.']); return; }
      r = await IM.importarDeArquivo(file);
    } else {
      const texto = U.$('#import-json')?.value ?? '';
      if (!texto.trim()) { mostrarErrosImport(['Cole um JSON.']); return; }
      r = IM.importarDeTexto(texto);
    }

    if (!r.ok) { mostrarErrosImport(r.erros); return; }

    ED?.carregarFormulario?.(r.dados);
    fecharModal('modal-importar');
    trocarView('editor');
    toast('Formulário importado!', 'sucesso');
  }

  function mostrarErrosImport(lista) {
    const el = U.$('#import-erros');
    if (!el) return;
    el.textContent = '❌ ' + lista.join('\n❌ ');
    el.hidden = false;
  }

  function abrirModalExportar() {
    const form = ED?.obterFormularioAtual?.();
    if (!form) return;
    const abaPadrao = 'legado';
    U.$$('[data-export-tab]').forEach(b => b.classList.toggle('active', b.dataset.exportTab === abaPadrao));
    atualizarExportPreview(abaPadrao);
    abrirModal('modal-exportar');
  }

  function atualizarExportPreview(formato) {
    const form = ED?.obterFormularioAtual?.();
    const code = U.$('#export-code');
    const erros = U.$('#export-erros');
    const hint = U.$('#export-hint');
    if (erros) { erros.hidden = true; erros.textContent = ''; }

    const r = EX.gerarJson(form, formato);
    if (!r.ok) {
      if (erros) { erros.textContent = '❌ ' + r.erro; erros.hidden = false; }
      if (code) code.textContent = '';
      return;
    }
    if (code) code.textContent = r.json;

    if (hint) {
      if (formato === 'legado') hint.textContent = 'Formato que o bot entende. Cole em /form importar.';
      else if (formato === 'completo') hint.textContent = 'Inclui tipos extras. Use para backup.';
      else hint.textContent = 'Formato legado sem indentação.';
    }
  }

  function renderizarTemplates() {
    const grid = U.$('#templates-grid');
    const cats = U.$('#templates-cats');
    const busca = U.$('#busca-template');
    if (!grid || !TPL) return;

    if (cats && !cats.children.length) {
      for (const c of TPL.categorias()) {
        const b = U.criar('button', { type: 'button', text: `${c.emoji} ${c.label}`, dataset: { cat: c.id } });
        if (c.id === catAtual) b.classList.add('active');
        U.on(b, 'click', () => {
          catAtual = c.id;
          U.$$('[data-cat]', cats).forEach(x => x.classList.toggle('active', x.dataset.cat === catAtual));
          renderizarTemplates();
        });
        cats.appendChild(b);
      }
    }

    const query = busca?.value ?? '';
    const lista = query ? TPL.buscar(query) : TPL.listar(catAtual);

    U.limpar(grid);
    for (const t of lista) {
      const card = U.criar('button', { type: 'button', class: 'template-card' });
      card.innerHTML = `
        <span class="template-emoji">${t.emoji}</span>
        <span class="template-nome">${U.escapeHtml(t.nome)}</span>
        <span class="template-desc">${U.escapeHtml(t.desc)}</span>
        <span class="template-meta">📝 ${t.dados.perguntas?.length ?? 0} perguntas</span>
      `;
      U.on(card, 'click', () => {
        confirmar(`Aplicar o template "${t.nome}"? O conteúdo atual será substituído.`, () => {
          const dados = TPL.aplicar(t.id);
          ED?.aplicarTemplate?.(dados);
          trocarView('editor');
          toast('Template aplicado!', 'sucesso');
        });
      });
      grid.appendChild(card);
    }

    if (busca && !busca.dataset.ligado) {
      busca.dataset.ligado = '1';
      U.on(busca, 'input', U.debounce(renderizarTemplates, 200));
    }
  }

  function confirmar(mensagem, callback) {
    confirmarCallback = callback;
    const msg = U.$('#confirm-msg');
    if (msg) msg.textContent = mensagem;
    abrirModal('modal-confirmar');
  }

  function toast(mensagem, tipo = 'info', duracao = 3000) {
    const container = U.$('#toasts');
    if (!container) return;
    const t = U.criar('div', { class: `toast ${tipo}` });
    t.textContent = mensagem;
    container.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      setTimeout(() => t.remove(), 300);
    }, duracao);
  }

  function ligarConfiguracoes() {
    const vincular = (id, chave) => {
      const el = U.$(id);
      if (!el) return;
      el.checked = SET.get(chave);
      U.on(el, 'change', () => SET.set(chave, el.checked));
    };
    vincular('#cfg-tema-escuro', 'temaEscuro');
    vincular('#cfg-densidade', 'densidadeCompacta');
    vincular('#cfg-animacoes', 'animacoes');
    vincular('#cfg-autosave', 'autosave');
    vincular('#cfg-confirmar-excluir', 'confirmarExcluir');

    U.on(U.$('#cfg-tema-escuro'), 'change', atualizarIconeTema);

    U.on(U.$('#btn-export-backup'), 'click', () => {
      const backup = S.exportarBackup();
      U.baixarArquivo(
        `formforge-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2)
      );
      toast('Backup exportado.', 'sucesso');
    });

    U.on(U.$('#btn-import-backup'), 'click', () => U.$('#input-backup')?.click());

    U.on(U.$('#input-backup'), 'change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const texto = await U.lerArquivoComoTexto(file);
        const dados = JSON.parse(texto);
        const r = S.importarBackup(dados, { substituir: false });
        toast(`${r.formularios} formulário(s) importado(s).`, 'sucesso');
        DB?.render?.();
      } catch (err) { toast('Falha: ' + err.message, 'erro'); }
      e.target.value = '';
    });

    U.on(U.$('#btn-limpar-tudo'), 'click', () => {
      confirmar('Apagar TODOS os dados? Não pode ser desfeito.', () => {
        S.limparTudo();
        ED?.novoFormulario?.();
        DB?.render?.();
        fecharModal('modal-config');
        toast('Dados apagados.', 'sucesso');
      });
    });
  }

  function ligarAtalhosGlobais() {
    document.addEventListener('keydown', (e) => {
      const digitando = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);
      if (!digitando && e.key === '?') {
        e.preventDefault();
        abrirModal('modal-ajuda');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.FF = window.FF || {};
  window.FF.app = Object.freeze({
    trocarView, abrirModal, fecharModal, abrirModalExportar,
    atualizarExportPreview, confirmar, toast, novoFormulario,
  });
})();
