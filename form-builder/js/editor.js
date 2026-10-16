(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  const S = window.FF?.storage;
  const SET = window.FF?.settings;
  const V = window.FF?.validation;
  const P = window.FF?.preview;
  const H = window.FF?.history;

  if (!C || !U || !S || !V) { console.error('[editor] Dependências faltando.'); return; }

  let formAtual = null;
  let idAtual = null;
  let abaPreview = 'embed';
  let salvando = false;
  const el = {};

  function init() {
    cachear();
    ligar();
    H.aoMudar(atualizarBotoes);
    novoFormulario();
  }

  function cachear() {
    el.titulo = U.$('#titulo');
    el.descricao = U.$('#descricao');
    el.categoria = U.$('#categoria');
    el.cor = U.$('#cor');
    el.corHex = U.$('#corHex');
    el.dm = U.$('#dm');
    el.anonimo = U.$('#anonimo');
    el.hintTitulo = U.$('#hint-titulo');
    el.hintDescricao = U.$('#hint-descricao');
    el.hintCor = U.$('#hint-cor');
    el.perguntas = U.$('#perguntas');
    el.badgePerguntas = U.$('#badge-perguntas');
    el.erroEditor = U.$('#erro-editor');
    el.previewContent = U.$('#preview-content');
    el.diagnostico = U.$('#diagnostico');
    el.badgeDiagnostico = U.$('#badge-diagnostico');
    el.status = U.$('#editor-status');
    el.btnUndo = U.$('#btn-undo');
    el.btnRedo = U.$('#btn-redo');
  }

  function ligar() {
    U.on(el.titulo, 'input', () => { atualizarHints(); agendarSalvar(); });
    U.on(el.descricao, 'input', () => { atualizarHints(); agendarSalvar(); });
    U.on(el.categoria, 'change', agendarSalvar);
    U.on(el.dm, 'change', agendarSalvar);
    U.on(el.anonimo, 'change', agendarSalvar);

    U.on(el.cor, 'input', () => { el.corHex.value = el.cor.value; atualizarHints(); agendarSalvar(); renderizarPreview(); });
    U.on(el.corHex, 'input', () => {
      const v = el.corHex.value.trim();
      if (C.RE_HEX.test(v)) el.cor.value = v;
      atualizarHints(); agendarSalvar(); renderizarPreview();
    });

    U.on(U.$('#btn-add-pergunta'), 'click', adicionarPergunta);
    U.on(U.$('#btn-add-rapida'), 'click', adicionarRapida);
    U.on(U.$('#btn-undo'), 'click', desfazer);
    U.on(U.$('#btn-redo'), 'click', refazer);
    U.on(U.$('#btn-exportar'), 'click', () => window.FF.app?.abrirModalExportar());
    U.on(U.$('#btn-refresh-preview'), 'click', renderizarPreview);

    U.$$('[data-preview-tab]').forEach(btn => {
      U.on(btn, 'click', () => {
        abaPreview = btn.dataset.previewTab;
        U.$$('[data-preview-tab]').forEach(b => b.classList.toggle('active', b.dataset.previewTab === abaPreview));
        renderizarPreview();
      });
    });

    document.addEventListener('keydown', tratarAtalhos);
  }

  function tratarAtalhos(e) {
    const digitando = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      salvarAgora();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !digitando) {
      e.preventDefault();
      if (e.shiftKey) refazer(); else desfazer();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      window.FF.app?.abrirModalExportar();
    }
  }

  function novoFormulario() {
    formAtual = {
      titulo: '', descricao: '', cor: C.COR_PADRAO,
      dm: true, anonimo: false, categoria: '',
      perguntas: [criarPerguntaVazia()],
    };
    idAtual = null;
    H.reset(formAtual);
    pintar();
    marcarSalvo();
  }

  function carregarFormulario(form) {
    if (!form) return;
    formAtual = {
      titulo: form.titulo ?? '',
      descricao: form.descricao ?? '',
      cor: form.cor ?? C.COR_PADRAO,
      dm: form.dm !== false,
      anonimo: !!form.anonimo,
      categoria: form.categoria ?? '',
      perguntas: (form.perguntas ?? []).map(p => ({
        id: p.id ?? U.uuid(),
        pergunta: p.pergunta ?? '',
        tipo: p.tipo ?? 'short',
        placeholder: p.placeholder ?? '',
        obrigatoria: !!p.obrigatoria,
        opcoes: Array.isArray(p.opcoes) ? p.opcoes : [],
      })),
    };
    idAtual = form.id ?? null;
    H.reset(formAtual);
    pintar();
    marcarSalvo();
  }

  function criarPerguntaVazia() {
    return { id: U.uuid(), pergunta: '', tipo: 'short', placeholder: '', obrigatoria: true, opcoes: [] };
  }

  function pintar() {
    if (!formAtual) return;
    el.titulo.value = formAtual.titulo;
    el.descricao.value = formAtual.descricao;
    el.categoria.value = formAtual.categoria;
    el.cor.value = formAtual.cor;
    el.corHex.value = formAtual.cor;
    el.dm.checked = formAtual.dm;
    el.anonimo.checked = formAtual.anonimo;
    renderizarPerguntas();
    atualizarHints();
    atualizarContador();
    renderizarPreview();
    renderizarDiagnostico();
  }

  function renderizarPerguntas() {
    U.limpar(el.perguntas);
    formAtual.perguntas.forEach((p, i) => el.perguntas.appendChild(criarPerguntaHTML(p, i)));
  }

  function criarPerguntaHTML(p, i) {
    const wrapper = U.criar('div', { class: 'pergunta', dataset: { id: p.id } });
    const tipoInfo = C.TIPOS_POR_ID[p.tipo] || C.TIPOS_POR_ID.short;

    wrapper.innerHTML = `
      <div class="pergunta-header">
        <span class="pergunta-num">${i + 1}</span>
        <span class="pergunta-tipo-badge">${tipoInfo.emoji} ${U.escapeHtml(tipoInfo.label)}</span>
        <div class="pergunta-actions">
          <button type="button" data-acao="subir" title="Subir">↑</button>
          <button type="button" data-acao="descer" title="Descer">↓</button>
          <button type="button" data-acao="duplicar" title="Duplicar">⧉</button>
          <button type="button" data-acao="remover" class="remover" title="Remover">✕</button>
        </div>
      </div>
      <div class="pergunta-fields">
        <div>
          <label>Pergunta <span class="req">*</span></label>
          <input type="text" class="p-pergunta" maxlength="${C.LIMITES.PERGUNTA_TITULO_MAX}" value="${U.escapeAttr(p.pergunta)}" placeholder="Ex: Qual seu nome?">
          <span class="field-hint p-hint"></span>
        </div>
        <div class="row-2">
          <div>
            <label>Tipo</label>
            <select class="p-tipo">
              ${C.TIPOS_PERGUNTA.map(t => `
                <option value="${t.id}" ${p.tipo === t.id ? 'selected' : ''}>${t.emoji} ${U.escapeHtml(t.label)}</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label>Placeholder</label>
            <input type="text" class="p-placeholder" maxlength="${C.LIMITES.PLACEHOLDER_MAX}" value="${U.escapeAttr(p.placeholder)}" placeholder="Ex: Digite aqui...">
          </div>
        </div>
      </div>
      <div class="pergunta-footer">
        <label class="switch">
          <input type="checkbox" class="p-obrigatoria" ${p.obrigatoria ? 'checked' : ''}>
          <span class="switch-track"></span>
          <span class="switch-label">Obrigatória</span>
        </label>
      </div>
    `;

    const input = wrapper.querySelector('.p-pergunta');
    const select = wrapper.querySelector('.p-tipo');
    const ph = wrapper.querySelector('.p-placeholder');
    const obrig = wrapper.querySelector('.p-obrigatoria');
    const hint = wrapper.querySelector('.p-hint');

    U.on(input, 'input', () => {
      p.pergunta = input.value;
      const v = V.validarPergunta(p);
      hint.textContent = v.msg;
      hint.className = 'field-hint p-hint ' + (v.ok ? 'ok' : 'erro');
      agendarSalvar();
      renderizarPreview();
      renderizarDiagnostico();
    });

    U.on(select, 'change', () => {
      p.tipo = select.value;
      renderizarPerguntas();
      agendarSalvar();
      renderizarPreview();
      renderizarDiagnostico();
    });

    U.on(ph, 'input', () => { p.placeholder = ph.value; agendarSalvar(); });
    U.on(obrig, 'change', () => { p.obrigatoria = obrig.checked; agendarSalvar(); renderizarPreview(); });

    U.$$('[data-acao]', wrapper).forEach(btn => {
      U.on(btn, 'click', () => {
        const idx = formAtual.perguntas.findIndex(x => x.id === p.id);
        const acao = btn.dataset.acao;
        if (acao === 'remover') removerPergunta(idx);
        else if (acao === 'subir') moverPergunta(idx, idx - 1);
        else if (acao === 'descer') moverPergunta(idx, idx + 1);
        else if (acao === 'duplicar') duplicarPergunta(idx);
      });
    });

    return wrapper;
  }

  function adicionarPergunta() {
    if (formAtual.perguntas.length >= C.LIMITES.PERGUNTAS_MAX) {
      mostrarErro(`Limite de ${C.LIMITES.PERGUNTAS_MAX} perguntas.`);
      return;
    }
    formAtual.perguntas.push(criarPerguntaVazia());
    H.push(formAtual, 'add pergunta');
    renderizarPerguntas();
    atualizarContador();
    atualizarBotoes();
    agendarSalvar();
    renderizarPreview();
    renderizarDiagnostico();
    const inputs = el.perguntas.querySelectorAll('.p-pergunta');
    inputs[inputs.length - 1]?.focus();
  }

  function adicionarRapida() {
    const sugestoes = [
      { pergunta: 'Nome', tipo: 'short', obrigatoria: true },
      { pergunta: 'Idade', tipo: 'number', obrigatoria: true },
      { pergunta: 'Motivo', tipo: 'long', obrigatoria: true },
      { pergunta: 'Observações', tipo: 'long', obrigatoria: false },
    ];
    if (formAtual.perguntas.length >= C.LIMITES.PERGUNTAS_MAX) { mostrarErro(`Limite atingido.`); return; }
    const usadas = new Set(formAtual.perguntas.map(p => p.pergunta.toLowerCase()));
    const prox = sugestoes.find(s => !usadas.has(s.pergunta.toLowerCase())) || sugestoes[0];
    formAtual.perguntas.push({ id: U.uuid(), ...prox, placeholder: '', opcoes: [] });
    H.push(formAtual, 'add rápida');
    renderizarPerguntas();
    atualizarContador();
    atualizarBotoes();
    agendarSalvar();
    renderizarPreview();
    renderizarDiagnostico();
  }

  function removerPergunta(idx) {
    if (idx < 0 || idx >= formAtual.perguntas.length) return;
    const confirmar = SET?.get('confirmarExcluir') ?? true;
    const executar = () => {
      formAtual.perguntas.splice(idx, 1);
      H.push(formAtual, 'remover');
      renderizarPerguntas();
      atualizarContador();
      atualizarBotoes();
      agendarSalvar();
      renderizarPreview();
      renderizarDiagnostico();
    };
    if (confirmar && window.FF.app) window.FF.app.confirmar('Remover pergunta?', executar);
    else executar();
  }

  function moverPergunta(de, para) {
    if (para < 0 || para >= formAtual.perguntas.length) return;
    const [item] = formAtual.perguntas.splice(de, 1);
    formAtual.perguntas.splice(para, 0, item);
    H.push(formAtual, 'reordenar');
    renderizarPerguntas();
    atualizarBotoes();
    agendarSalvar();
    renderizarPreview();
  }

  function duplicarPergunta(idx) {
    if (formAtual.perguntas.length >= C.LIMITES.PERGUNTAS_MAX) { mostrarErro(`Limite atingido.`); return; }
    const orig = formAtual.perguntas[idx];
    formAtual.perguntas.splice(idx + 1, 0, {
      ...U.clonar(orig),
      id: U.uuid(),
      pergunta: `${orig.pergunta} (cópia)`.slice(0, C.LIMITES.PERGUNTA_TITULO_MAX),
    });
    H.push(formAtual, 'duplicar');
    renderizarPerguntas();
    atualizarContador();
    atualizarBotoes();
    agendarSalvar();
    renderizarPreview();
    renderizarDiagnostico();
  }

  function atualizarHints() {
    if (el.hintTitulo) {
      const v = V.validarTitulo(el.titulo.value);
      el.hintTitulo.textContent = v.msg;
      el.hintTitulo.className = 'field-hint ' + (v.ok ? 'ok' : 'erro');
    }
    if (el.hintDescricao) {
      const v = V.validarDescricao(el.descricao.value);
      el.hintDescricao.textContent = v.msg;
      el.hintDescricao.className = 'field-hint ' + (v.ok ? 'ok' : 'erro');
    }
    if (el.hintCor) {
      const v = V.validarCor(el.corHex.value);
      el.hintCor.textContent = v.msg;
      el.hintCor.className = 'field-hint ' + (v.ok ? 'ok' : 'erro');
    }
  }

  function atualizarContador() {
    const n = formAtual?.perguntas?.length ?? 0;
    if (el.badgePerguntas) {
      el.badgePerguntas.textContent = `${n} / ${C.LIMITES.PERGUNTAS_MAX}`;
      el.badgePerguntas.classList.toggle('ok', n === C.LIMITES.PERGUNTAS_MAX);
    }
  }

  function sincronizarForm() {
    if (!formAtual) return;
    formAtual.titulo = el.titulo.value;
    formAtual.descricao = el.descricao.value;
    formAtual.categoria = el.categoria.value;
    formAtual.cor = C.RE_HEX.test(el.corHex.value) ? el.corHex.value : C.COR_PADRAO;
    formAtual.dm = el.dm.checked;
    formAtual.anonimo = el.anonimo.checked;
  }

  function renderizarPreview() {
    sincronizarForm();
    if (!el.previewContent || !P) return;
    P.render(el.previewContent, formAtual, abaPreview);
  }

  function renderizarDiagnostico() {
    if (!el.diagnostico) return;
    sincronizarForm();
    const r = V.validar(formAtual);
    U.limpar(el.diagnostico);

    if (r.ok && r.avisos.length === 0) {
      const item = U.criar('div', { class: 'diag-item ok' });
      item.innerHTML = '<span class="diag-icon">✅</span><span>Formulário pronto para exportar.</span>';
      el.diagnostico.appendChild(item);
    }

    for (const e of r.erros) {
      const item = U.criar('div', { class: 'diag-item erro' });
      item.innerHTML = `<span class="diag-icon">❌</span><span>${U.escapeHtml(e.mensagem)}</span>`;
      el.diagnostico.appendChild(item);
    }
    for (const a of r.avisos) {
      const item = U.criar('div', { class: 'diag-item aviso' });
      item.innerHTML = `<span class="diag-icon">⚠️</span><span>${U.escapeHtml(a.mensagem)}</span>`;
      el.diagnostico.appendChild(item);
    }

    if (el.badgeDiagnostico) {
      if (r.erros.length) {
        el.badgeDiagnostico.textContent = `${r.erros.length} erro${r.erros.length > 1 ? 's' : ''}`;
        el.badgeDiagnostico.className = 'badge erro';
      } else if (r.avisos.length) {
        el.badgeDiagnostico.textContent = `${r.avisos.length} aviso${r.avisos.length > 1 ? 's' : ''}`;
        el.badgeDiagnostico.className = 'badge aviso';
      } else {
        el.badgeDiagnostico.textContent = 'OK';
        el.badgeDiagnostico.className = 'badge ok';
      }
    }
  }

  const agendar = U.debounce(() => {
    if (SET?.get('autosave') !== false) salvarAgora();
  }, 800);

  function agendarSalvar() {
    marcarNaoSalvo();
    agendar();
  }

  function salvarAgora() {
    if (salvando) return;
    sincronizarForm();
    const vazio = !formAtual.titulo.trim() && formAtual.perguntas.every(p => !p.pergunta.trim());
    if (vazio) { marcarSalvo(); return; }

    salvando = true;
    marcarSalvando();
    try {
      formAtual.id = idAtual;
      const salvo = S.salvar(formAtual);
      idAtual = salvo.id;
      formAtual.id = idAtual;
      marcarSalvo();
    } catch (err) {
      U.erro('[editor] Salvar:', err);
      marcarErro(err.message);
    } finally { salvando = false; }
  }

  function marcarSalvando() { definirStatus('Salvando...', 'salvando'); }
  function marcarSalvo() { definirStatus('Salvo', 'salvo'); }
  function marcarNaoSalvo() { definirStatus('Alterações não salvas', ''); }
  function marcarErro(m) { definirStatus(`Erro: ${m}`, 'erro'); }
  function definirStatus(t, c) { if (el.status) { el.status.textContent = t; el.status.className = 'editor-status ' + (c || ''); } }

  function desfazer() {
    const estado = H.desfazer();
    if (!estado) return;
    formAtual = estado;
    formAtual.id = idAtual;
    pintar();
    atualizarBotoes();
    agendarSalvar();
  }

  function refazer() {
    const estado = H.refazer();
    if (!estado) return;
    formAtual = estado;
    formAtual.id = idAtual;
    pintar();
    atualizarBotoes();
    agendarSalvar();
  }

  function atualizarBotoes() {
    if (el.btnUndo) el.btnUndo.disabled = !H.podeDesfazer();
    if (el.btnRedo) el.btnRedo.disabled = !H.podeRefazer();
  }

  function mostrarErro(msg) {
    if (!el.erroEditor) return;
    el.erroEditor.textContent = '❌ ' + msg;
    el.erroEditor.hidden = false;
    clearTimeout(mostrarErro._t);
    mostrarErro._t = setTimeout(() => { el.erroEditor.hidden = true; }, 4000);
  }

  function obterFormularioAtual() {
    sincronizarForm();
    return U.clonar(formAtual);
  }

  function obterIdAtual() { return idAtual; }

  function aplicarTemplate(tpl) {
    if (!tpl) return;
    formAtual = {
      titulo: tpl.titulo ?? '',
      descricao: tpl.descricao ?? '',
      cor: tpl.cor ?? C.COR_PADRAO,
      dm: tpl.dm !== false,
      anonimo: !!tpl.anonimo,
      categoria: tpl.categoria ?? '',
      perguntas: (tpl.perguntas ?? []).map(p => ({
        id: U.uuid(),
        pergunta: p.pergunta ?? '',
        tipo: p.tipo ?? 'short',
        placeholder: p.placeholder ?? '',
        obrigatoria: !!p.obrigatoria,
        opcoes: [],
      })),
    };
    idAtual = null;
    H.reset(formAtual);
    pintar();
    marcarNaoSalvo();
    agendarSalvar();
  }

  window.FF = window.FF || {};
  window.FF.editor = Object.freeze({
    init, novoFormulario, carregarFormulario, aplicarTemplate,
    salvarAgora, obterFormularioAtual, obterIdAtual,
    renderizarPreview, renderizarDiagnostico,
  });
})();
