/**
 * js/app.js
 * -------------------------------------------------------------
 * Bootstrap do app: navegação entre views, modais, toasts,
 * atalhos globais e ligação entre os módulos.
 *
 * Expõe: window.FF.app
 * -------------------------------------------------------------
 */

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

  if (!C || !U || !S) {
    console.error('[app] Dependências base faltando.');
    return;
  }

  /* =========================================================
   *  ESTADO GLOBAL
   * =======================================================*/
  let viewAtual = 'dashboard';
  let confirmarCallback = null;

  /* =========================================================
   *  INICIALIZAÇÃO
   * =======================================================*/
  function init() {
    // Aplica tema
    SET?.aplicarTudo?.();

    // Inicializa módulos
    ED?.init?.();
    DB?.init?.();

    // Vincula UI global
    ligarNavegacao();
    ligarBotoesGlobais();
    ligarModais();
    ligarAtalhosGlobais();
    ligarConfiguracoes();

    // Começa com um formulário novo se não houver nenhum salvo
    const st = S.estatisticas();
    if (st.total === 0) {
      ED?.novoFormulario?.();
    }

    trocarView('dashboard');
    U.log('FormForge pronto.');
  }

  /* =========================================================
   *  NAVEGAÇÃO
   * =======================================================*/
  function ligarNavegacao() {
    U.$$('[data-view]').forEach(btn => {
      U.on(btn, 'click', () => trocarView(btn.dataset.view));
    });
  }

  function trocarView(nome) {
    viewAtual = nome;

    U.$$('.view').forEach(v => {
      v.hidden = v.dataset.view !== nome;
    });

    U.$$('.nav-btn').forEach(b => {
      const ativo = b.dataset.view === nome;
      b.classList.toggle('active', ativo);
      if (ativo) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    if (nome === 'dashboard') DB?.render?.();
    if (nome === 'editor')    ED?.renderizarPreview?.();
    if (nome === 'templates') renderizarTemplates();
  }

  /* =========================================================
   *  BOTÕES GLOBAIS
   * =======================================================*/
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
    if (!btn) return;
    const escuro = SET?.get('temaEscuro') ?? true;
    btn.textContent = escuro ? '🌙' : '☀️';
  }

  /* =========================================================
   *  MODAIS
   * =======================================================*/
  function abrirModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    m.classList.add('aberto');

    // Foco no primeiro botão
    setTimeout(() => {
      const foco = m.querySelector('button, [href], input, select, textarea');
      foco?.focus();
    }, 50);

    // Fecha com Esc (só uma vez por modal)
    const fecharComEsc = (e) => {
      if (e.key === 'Escape') {
        fecharModal(m);
        document.removeEventListener('keydown', fecharComEsc);
      }
    };
    document.addEventListener('keydown', fecharComEsc);

    // Clique no backdrop
    U.on(m, 'click', (e) => {
      if (e.target === m) fecharModal(m);
    }, { once: true });
  }

  function fecharModal(m) {
    if (typeof m === 'string') m = document.getElementById(m);
    if (!m) return;
    m.classList.add('hidden');
    m.classList.remove('aberto');
    m.hidden = true;
  }

  function ligarModais() {
    // Botões com [data-fechar-modal]
    U.$$('[data-fechar-modal]').forEach(btn => {
      U.on(btn, 'click', () => {
        const modal = btn.closest('.modal');
        if (modal) fecharModal(modal);
      });
    });

    // Abas de exportar
    U.$$('[data-export-tab]').forEach(btn => {
      U.on(btn, 'click', () => {
        U.$$('[data-export-tab]').forEach(b => {
          const ativo = b.dataset.exportTab === btn.dataset.exportTab;
          b.classList.toggle('active', ativo);
          b.setAttribute('aria-selected', String(ativo));
        });
        atualizarExportPreview(btn.dataset.exportTab);
      });
    });

    // Abas de importar
    U.$$('[data-import-tab]').forEach(btn => {
      U.on(btn, 'click', () => {
        U.$$('[data-import-tab]').forEach(b => {
          const ativo = b.dataset.importTab === btn.dataset.importTab;
          b.classList.toggle('active', ativo);
          b.setAttribute('aria-selected', String(ativo));
        });
        U.$$('[data-import-panel]').forEach(p => {
          p.hidden = p.dataset.importPanel !== btn.dataset.importTab;
        });
      });
    });

    // Botão copiar JSON
    U.on(U.$('#btn-copiar-json'), 'click', async () => {
      const code = U.$('#export-code');
      const txt = code?.textContent ?? '';
      const ok = await U.copiarTexto(txt);
      toast(ok ? 'JSON copiado!' : 'Falha ao copiar', ok ? 'sucesso' : 'erro');
    });

    // Botão baixar JSON
    U.on(U.$('#btn-baixar-json'), 'click', () => {
      const code = U.$('#export-code');
      const txt = code?.textContent ?? '';
      const form = ED?.obterFormularioAtual?.();
      const nome = form ? EX?.gerarNomeArquivo?.(form) ?? 'formulario.json' : 'formulario.json';
      U.baixarArquivo(nome, txt);
      toast('Download iniciado.', 'sucesso');
    });

    // Botão confirmar import
    U.on(U.$('#btn-confirmar-import'), 'click', executarImport);

    // Modal de confirmar
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

  /* =========================================================
   *  IMPORTAR
   * =======================================================*/
  async function executarImport() {
    const erros = U.$('#import-erros');
    if (erros) { erros.hidden = true; erros.textContent = ''; }

    const abaAtiva = U.$('[data-import-tab].active')?.dataset.importTab ?? 'colar';

    let resultado;

    if (abaAtiva === 'arquivo') {
      const file = U.$('#import-file')?.files?.[0];
      if (!file) {
        mostrarErrosImport(['Selecione um arquivo.']);
        return;
      }
      resultado = await IM.importarDeArquivo(file);
    } else {
      const texto = U.$('#import-json')?.value ?? '';
      if (!texto.trim()) {
        mostrarErrosImport(['Cole um JSON.']);
        return;
      }
      resultado = IM.importarDeTexto(texto);
    }

    if (!resultado.ok) {
      mostrarErrosImport(resultado.erros);
      return;
    }

    // Aplica no editor
    ED?.carregarFormulario?.(resultado.dados);
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

  /* =========================================================
   *  EXPORTAR
   * =======================================================*/
  function abrirModalExportar() {
    const form = ED?.obterFormularioAtual?.();
    if (!form) return;

    // Abre na aba legado por padrão
    const abaPadrao = 'legado';
    U.$$('[data-export-tab]').forEach(b => {
      const ativo = b.dataset.exportTab === abaPadrao;
      b.classList.toggle('active', ativo);
      b.setAttribute('aria-selected', String(ativo));
    });

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
      if (formato === 'legado') {
        hint.textContent = 'Formato que o bot atual entende. Cole no comando /form importar.';
      } else if (formato === 'completo') {
        hint.textContent = 'Inclui tipos extras (não suportados pelo bot). Use para backup.';
      } else {
        hint.textContent = 'Formato legado sem indentação. Mais compacto.';
      }
    }
  }

  /* =========================================================
   *  TEMPLATES
   * =======================================================*/
  let catAtual = 'todos';

  function renderizarTemplates() {
    const grid = U.$('#templates-grid');
    const cats = U.$('#templates-cats');
    const busca = U.$('#busca-template');

    if (!grid || !TPL) return;

    // Categorias
    if (cats && !cats.children.length) {
      for (const c of TPL.categorias()) {
        const b = U.criar('button', {
          type: 'button',
          role: 'tab',
          text: `${c.emoji} ${c.label}`,
          dataset: { cat: c.id },
        });
        if (c.id === catAtual) b.classList.add('active');
        U.on(b, 'click', () => {
          catAtual = c.id;
          U.$$('[data-cat]', cats).forEach(x => x.classList.toggle('active', x.dataset.cat === catAtual));
          renderizarTemplates();
        });
        cats.appendChild(b);
      }
    }

    // Lista
    const query = busca?.value ?? '';
    let lista = query ? TPL.buscar(query) : TPL.listar(catAtual);

    U.limpar(grid);
    for (const t of lista) {
      const card = U.criar('button', {
        type: 'button',
        class: 'template-card',
        dataset: { id: t.id },
      });

      card.innerHTML = `
        <span class="template-emoji">${t.emoji}</span>
        <span class="template-nome">${U.escapeHtml(t.nome)}</span>
        <span class="template-desc">${U.escapeHtml(t.desc)}</span>
        <span class="template-meta">📝 ${t.dados.perguntas?.length ?? 0} perguntas</span>
      `;

      U.on(card, 'click', () => {
        confirmar(
          `Aplicar o template "${t.nome}"? O conteúdo atual será substituído.`,
          () => {
            const dados = TPL.aplicar(t.id);
            ED?.aplicarTemplate?.(dados);
            trocarView('editor');
            toast('Template aplicado!', 'sucesso');
          }
        );
      });

      grid.appendChild(card);
    }

    // Busca
    if (busca && !busca.dataset.ligado) {
      busca.dataset.ligado = '1';
      U.on(busca, 'input', U.debounce(renderizarTemplates, 200));
    }
  }

  /* =========================================================
   *  CONFIRMAÇÃO
   * =======================================================*/
  function confirmar(mensagem, callback) {
    confirmarCallback = callback;
    const msg = U.$('#confirm-msg');
    if (msg) msg.textContent = mensagem;
    abrirModal('modal-confirmar');
  }

  /* =========================================================
   *  TOASTS
   * =======================================================*/
  function toast(mensagem, tipo = 'info', duracao = 3000) {
    const container = U.$('#toasts');
    if (!container) return;

    const t = U.criar('div', { class: `toast ${tipo}`, role: 'status' });
    t.innerHTML = `<span>${U.escapeHtml(mensagem)}</span>`;
    container.appendChild(t);

    setTimeout(() => {
      t.style.transition = 'opacity .3s, transform .3s';
      t.style.opacity = '0';
      t.style.transform = 'translateX(20px)';
      setTimeout(() => t.remove(), 300);
    }, duracao);
  }

  /* =========================================================
   *  CONFIGURAÇÕES
   * =======================================================*/
  function ligarConfiguracoes() {
    const cfgTema = U.$('#cfg-tema-escuro');
    const cfgDensidade = U.$('#cfg-densidade');
    const cfgAnim = U.$('#cfg-animacoes');
    const cfgAutosave = U.$('#cfg-autosave');
    const cfgConfirmar = U.$('#cfg-confirmar-excluir');

    if (cfgTema) {
      cfgTema.checked = SET.get('temaEscuro');
      U.on(cfgTema, 'change', () => {
        SET.set('temaEscuro', cfgTema.checked);
        atualizarIconeTema();
      });
    }

    if (cfgDensidade) {
      cfgDensidade.checked = SET.get('densidadeCompacta');
      U.on(cfgDensidade, 'change', () => SET.set('densidadeCompacta', cfgDensidade.checked));
    }

    if (cfgAnim) {
      cfgAnim.checked = SET.get('animacoes');
      U.on(cfgAnim, 'change', () => SET.set('animacoes', cfgAnim.checked));
    }

    if (cfgAutosave) {
      cfgAutosave.checked = SET.get('autosave');
      U.on(cfgAutosave, 'change', () => SET.set('autosave', cfgAutosave.checked));
    }

    if (cfgConfirmar) {
      cfgConfirmar.checked = SET.get('confirmarExcluir');
      U.on(cfgConfirmar, 'change', () => SET.set('confirmarExcluir', cfgConfirmar.checked));
    }

    // Backup
    U.on(U.$('#btn-export-backup'), 'click', () => {
      const backup = S.exportarBackup();
      U.baixarArquivo(
        `formforge-backup-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(backup, null, 2)
      );
      toast('Backup exportado.', 'sucesso');
    });

    U.on(U.$('#btn-import-backup'), 'click', () => {
      U.$('#input-backup')?.click();
    });

    U.on(U.$('#input-backup'), 'change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const texto = await U.lerArquivoComoTexto(file);
        const dados = JSON.parse(texto);
        const r = S.importarBackup(dados, { substituir: false });
        toast(`${r.formularios} formulário(s) importado(s).`, 'sucesso');
        DB?.render?.();
      } catch (err) {
        toast('Falha ao importar backup: ' + err.message, 'erro');
      }
      e.target.value = '';
    });

    U.on(U.$('#btn-limpar-tudo'), 'click', () => {
      confirmar('Apagar TODOS os dados? Essa ação não pode ser desfeita.', () => {
        S.limparTudo();
        ED?.novoFormulario?.();
        DB?.render?.();
        fecharModal('modal-config');
        toast('Dados apagados.', 'sucesso');
      });
    });
  }

  /* =========================================================
   *  ATALHOS GLOBAIS
   * =======================================================*/
  function ligarAtalhosGlobais() {
    document.addEventListener('keydown', (e) => {
      // ? abre ajuda (fora de inputs)
      const alvo = e.target;
      const digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.isContentEditable);
      if (!digitando && e.key === '?') {
        e.preventDefault();
        abrirModal('modal-ajuda');
      }
    });
  }

  /* =========================================================
   *  BOOT
   * =======================================================*/
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.app = Object.freeze({
    trocarView,
    abrirModal,
    fecharModal,
    abrirModalExportar,
    atualizarExportPreview,
    confirmar,
    toast,
    novoFormulario,
  });
})();
