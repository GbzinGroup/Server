/**
 * js/dashboard.js
 * -------------------------------------------------------------
 * Tela inicial: lista, filtra, ordena formulários.
 *
 * Expõe: window.FF.dashboard
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  const S = window.FF?.storage;

  if (!C || !U || !S) {
    console.error('[dashboard] Dependências faltando.');
    return;
  }

  /* =========================================================
   *  ESTADO
   * =======================================================*/
  const filtros = {
    busca: '',
    categoria: '',
    favoritos: false,
    ordenacao: 'recentes',
    modo: 'grid',
  };

  const el = {};

  /* =========================================================
   *  INIT
   * =======================================================*/
  function init() {
    cachear();
    ligarEventos();
    render();
  }

  function cachear() {
    el.lista = U.$('#lista-formularios');
    el.vazio = U.$('#estado-vazio');
    el.busca = U.$('#busca');
    el.filtroCategoria = U.$('#filtro-categoria');
    el.ordenacao = U.$('#ordenacao');
    el.btnFavoritos = U.$('#btn-favoritos');
    el.statTotal = U.$('#stat-total');
    el.statFavoritos = U.$('#stat-favoritos');
    el.statRascunho = U.$('#stat-rascunho');
    el.statUltima = U.$('#stat-ultima');
  }

  function ligarEventos() {
    U.on(el.busca, 'input', U.debounce(() => {
      filtros.busca = el.busca.value;
      render();
    }, 200));

    U.on(el.filtroCategoria, 'change', () => {
      filtros.categoria = el.filtroCategoria.value;
      render();
    });

    U.on(el.ordenacao, 'change', () => {
      filtros.ordenacao = el.ordenacao.value;
      render();
    });

    U.on(el.btnFavoritos, 'click', () => {
      filtros.favoritos = !filtros.favoritos;
      el.btnFavoritos.classList.toggle('active', filtros.favoritos);
      el.btnFavoritos.setAttribute('aria-pressed', String(filtros.favoritos));
      render();
    });

    U.$$('[data-view-mode]').forEach(btn => {
      U.on(btn, 'click', () => {
        filtros.modo = btn.dataset.viewMode;
        U.$$('[data-view-mode]').forEach(b => {
          const ativo = b.dataset.viewMode === filtros.modo;
          b.classList.toggle('active', ativo);
          b.setAttribute('aria-pressed', String(ativo));
        });
        render();
      });
    });
  }

  /* =========================================================
   *  RENDER
   * =======================================================*/
  function render() {
    atualizarEstatisticas();
    const lista = aplicarFiltros(S.listar());
    pintarLista(lista);
  }

  function atualizarEstatisticas() {
    const st = S.estatisticas();
    if (el.statTotal) el.statTotal.textContent = st.total;
    if (el.statFavoritos) el.statFavoritos.textContent = st.favoritos;
    if (el.statRascunho) el.statRascunho.textContent = st.temRascunho ? 'Sim' : '—';
    if (el.statUltima) el.statUltima.textContent = st.ultimaEdicao
      ? U.tempoRelativo(st.ultimaEdicao)
      : '—';
  }

  function aplicarFiltros(lista) {
    let out = [...lista];

    // Busca
    if (filtros.busca) {
      const q = filtros.busca.toLowerCase().trim();
      out = out.filter(f =>
        (f.titulo ?? '').toLowerCase().includes(q) ||
        (f.descricao ?? '').toLowerCase().includes(q) ||
        (f.categoria ?? '').toLowerCase().includes(q)
      );
    }

    // Categoria
    if (filtros.categoria) {
      out = out.filter(f => f.categoria === filtros.categoria);
    }

    // Favoritos
    if (filtros.favoritos) {
      out = out.filter(f => f.favorito);
    }

    // Ordenação
    out.sort((a, b) => {
      switch (filtros.ordenacao) {
        case 'antigos': return (a.atualizadoEm ?? 0) - (b.atualizadoEm ?? 0);
        case 'az':      return (a.titulo ?? '').localeCompare(b.titulo ?? '');
        case 'za':      return (b.titulo ?? '').localeCompare(a.titulo ?? '');
        default:        return (b.atualizadoEm ?? 0) - (a.atualizadoEm ?? 0);
      }
    });

    return out;
  }

  function pintarLista(lista) {
    U.limpar(el.lista);

    if (lista.length === 0) {
      if (el.vazio) el.vazio.hidden = false;
      el.lista.classList.add('hidden');
      return;
    }

    if (el.vazio) el.vazio.hidden = true;
    el.lista.classList.remove('hidden');
    el.lista.classList.toggle('list-view', filtros.modo === 'list');

    for (const f of lista) {
      el.lista.appendChild(criarCard(f));
    }
  }

  function criarCard(f) {
    const cor = C.RE_HEX.test(f.cor ?? '') ? f.cor : C.COR_PADRAO;
    const cat = C.CATEGORIAS_POR_ID[f.categoria];
    const num = (f.perguntas ?? []).length;

    const card = U.criar('article', {
      class: 'form-card',
      dataset: { id: f.id },
      style: { '--card-cor': cor },
    });

    card.innerHTML = `
      <div class="form-card-head">
        <div>
          <div class="form-card-title">${U.escapeHtml(f.titulo || 'Sem título')}</div>
          <div class="form-card-desc">${U.escapeHtml(f.descricao || 'Sem descrição')}</div>
        </div>
        <button
          class="form-card-fav ${f.favorito ? 'active' : ''}"
          data-acao="favoritar"
          aria-label="${f.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}"
          title="Favoritar"
        >${f.favorito ? '★' : '☆'}</button>
      </div>

      <div class="form-card-meta">
        ${cat ? `<span>${cat.emoji} ${U.escapeHtml(cat.label)}</span>` : ''}
        <span>📝 ${num} pergunta${num === 1 ? '' : 's'}</span>
        <span>🕐 ${U.tempoRelativo(f.atualizadoEm)}</span>
      </div>

      <div class="form-card-actions">
        <button class="btn btn-primary btn-sm" data-acao="editar">✏️ Editar</button>
        <button class="btn btn-ghost btn-sm" data-acao="exportar">📤</button>
        <button class="btn btn-ghost btn-sm" data-acao="duplicar" title="Duplicar">⧉</button>
        <button class="btn btn-ghost btn-sm" data-acao="remover" title="Remover">🗑️</button>
      </div>
    `;

    // Eventos
    U.$$('[data-acao]', card).forEach(btn => {
      U.on(btn, 'click', (e) => {
        e.stopPropagation();
        const acao = btn.dataset.acao;
        executarAcao(acao, f);
      });
    });

    U.on(card, 'click', () => executarAcao('editar', f));

    return card;
  }

  function executarAcao(acao, form) {
    const App = window.FF.app;
    const Ed = window.FF.editor;

    switch (acao) {
      case 'editar':
        Ed?.carregarFormulario(form);
        App?.trocarView('editor');
        break;

      case 'favoritar':
        S.favoritar(form.id);
        render();
        break;

      case 'duplicar':
        S.duplicar(form.id);
        render();
        App?.toast('Formulário duplicado.', 'sucesso');
        break;

      case 'exportar':
        Ed?.carregarFormulario(form);
        App?.abrirModalExportar();
        break;

      case 'remover':
        App?.confirmar(
          `Remover o formulário "${form.titulo || 'Sem título'}"?`,
          () => {
            S.remover(form.id);
            render();
            App?.toast('Formulário removido.', 'sucesso');
          }
        );
        break;
    }
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.dashboard = Object.freeze({
    init,
    render,
  });
})();
