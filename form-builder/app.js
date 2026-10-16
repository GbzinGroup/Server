/**
 * app.js — lógica principal do construtor de formulários.
 */

(function () {
  'use strict';

  /* =========================================================
   *  CONSTANTES
   * =======================================================*/
  const MAX_PERGUNTAS = 5;
  const STORAGE_KEY = 'form-builder-rascunho';
  const TEMA_KEY = 'form-builder-tema';

  const TIPOS = [
    { valor: 'short',   label: 'Resposta curta' },
    { valor: 'long',    label: 'Resposta longa' },
    { valor: 'number',  label: 'Número' },
    { valor: 'user',    label: 'Usuário (@menção)' },
    { valor: 'channel', label: 'Canal (#canal)' },
    { valor: 'role',    label: 'Cargo (@cargo)' },
  ];

  /* =========================================================
   *  DOM
   * =======================================================*/
  const $ = (id) => document.getElementById(id);

  const tituloEl      = $('titulo');
  const descricaoEl   = $('descricao');
  const corEl         = $('cor');
  const corHexEl      = $('corHex');
  const categoriaEl   = $('categoria');
  const dmEl          = $('dm');
  const anonimoEl     = $('anonimo');
  const perguntasEl   = $('perguntas');
  const erroEl        = $('erro');
  const badgeContador = $('badgeContador');
  const hintTitulo    = $('hintTitulo');

  const btnAddPergunta = $('btnAddPergunta');
  const btnAddRapida   = $('btnAddRapida');
  const btnPreview     = $('btnPreview');
  const btnLimpar      = $('btnLimpar');
  const btnGerar       = $('btnGerar');

  const modalResultado = $('modalResultado');
  const modalPreview   = $('modalPreview');
  const modalAjuda     = $('modalAjuda');

  const codigoGerado = $('codigoGerado');
  const previewBody  = $('previewBody');

  let contadorId = 0;

  /* =========================================================
   *  TEMA
   * =======================================================*/
  function aplicarTema(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    $('btnTema').textContent = tema === 'claro' ? '☀️' : '🌙';
    localStorage.setItem(TEMA_KEY, tema);
  }

  const temaSalvo = localStorage.getItem(TEMA_KEY) || 'escuro';
  aplicarTema(temaSalvo);

  $('btnTema').addEventListener('click', () => {
    const atual = document.documentElement.getAttribute('data-tema');
    aplicarTema(atual === 'claro' ? 'escuro' : 'claro');
  });

  /* =========================================================
   *  TEMPLATES
   * =======================================================*/
  function renderTemplates() {
    const lista = $('templatesList');
    lista.innerHTML = '';

    for (const t of window.TEMPLATES) {
      const btn = document.createElement('button');
      btn.className = 'template-btn';
      btn.innerHTML = `<span class="emoji">${t.emoji}</span> ${t.nome}`;
      btn.addEventListener('click', () => aplicarTemplate(t));
      lista.appendChild(btn);
    }
  }

  function aplicarTemplate(t) {
    if (!confirm(`Aplicar template "${t.nome}"? Isso substituirá o conteúdo atual.`)) return;

    const d = t.dados;
    tituloEl.value = d.titulo || '';
    descricaoEl.value = d.descricao || '';
    corEl.value = d.cor || '#5865f2';
    corHexEl.value = d.cor || '#5865f2';
    dmEl.checked = d.dm !== false;
    anonimoEl.checked = !!d.anonimo;

    perguntasEl.innerHTML = '';
    contadorId = 0;

    (d.perguntas || []).forEach(p => {
      adicionarPergunta({
        titulo: p.pergunta,
        tipo: p.tipo,
        placeholder: p.placeholder,
        obrigatoria: p.obrigatoria,
      });
    });

    atualizarContador();
    esconderErro();
    salvarRascunho();
  }

  /* =========================================================
   *  PERGUNTAS
   * =======================================================*/
  function adicionarPergunta(dados = {}) {
    if (perguntasEl.children.length >= MAX_PERGUNTAS) {
      mostrarErro(`Limite de ${MAX_PERGUNTAS} perguntas por formulário (limite do Discord).`);
      return;
    }

    contadorId++;
    const div = document.createElement('div');
    div.className = 'pergunta';
    div.dataset.id = contadorId;
    div.innerHTML = `
      <div class="pergunta-header">
        <div class="pergunta-num">${perguntasEl.children.length + 1}</div>
        <div class="pergunta-actions">
          <button class="btn-icon-sm" data-acao="subir" title="Mover para cima">↑</button>
          <button class="btn-icon-sm" data-acao="descer" title="Mover para baixo">↓</button>
          <button class="btn-icon-sm remover" data-acao="remover" title="Remover">✕</button>
        </div>
      </div>

      <label>Pergunta *</label>
      <input type="text" class="p-titulo" placeholder="Ex: Qual seu nome?" maxlength="45" value="${escapeAttr(dados.titulo || '')}" />

      <div class="row">
        <div>
          <label>Tipo</label>
          <select class="p-tipo">
            ${TIPOS.map(t => `<option value="${t.valor}" ${dados.tipo === t.valor ? 'selected' : ''}>${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Placeholder (opcional)</label>
          <input type="text" class="p-placeholder" placeholder="Ex: Digite aqui..." maxlength="100" value="${escapeAttr(dados.placeholder || '')}" />
        </div>
      </div>

      <div class="checkboxes">
        <input type="checkbox" class="p-obrigatoria" ${dados.obrigatoria ? 'checked' : ''} />
        <label>Obrigatória</label>
      </div>
    `;

    // Ações
    div.querySelectorAll('[data-acao]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const acao = e.currentTarget.dataset.acao;
        if (acao === 'remover') {
          div.remove();
        } else if (acao === 'subir') {
          const anterior = div.previousElementSibling;
          if (anterior) perguntasEl.insertBefore(div, anterior);
        } else if (acao === 'descer') {
          const proximo = div.nextElementSibling;
          if (proximo) perguntasEl.insertBefore(proximo, div);
        }
        renumerar();
        atualizarContador();
        salvarRascunho();
      });
    });

    // Salvar ao digitar
    div.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', salvarRascunho);
      el.addEventListener('change', salvarRascunho);
    });

    perguntasEl.appendChild(div);
    renumerar();
    atualizarContador();
    salvarRascunho();
  }

  function renumerar() {
    [...perguntasEl.children].forEach((p, i) => {
      p.querySelector('.pergunta-num').textContent = i + 1;
    });
  }

  function atualizarContador() {
    const n = perguntasEl.children.length;
    badgeContador.textContent = `${n} / ${MAX_PERGUNTAS}`;
    badgeContador.classList.toggle('completo', n === MAX_PERGUNTAS);
  }

  /* =========================================================
   *  ERROS
   * =======================================================*/
  function mostrarErro(msg) {
    erroEl.textContent = '❌ ' + msg;
    erroEl.style.display = 'block';
    erroEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function esconderErro() {
    erroEl.style.display = 'none';
  }

  /* =========================================================
   *  GERAÇÃO
   * =======================================================*/
  function coletarDados() {
    const titulo = tituloEl.value.trim();
    const descricao = descricaoEl.value.trim();
    const cor = corHexEl.value.trim() || corEl.value;
    const dm = dmEl.checked;
    const anonimo = anonimoEl.checked;
    const categoria = categoriaEl.value;

    if (!titulo) throw new Error('O título é obrigatório.');
    if (titulo.length < 3) throw new Error('O título precisa ter ao menos 3 caracteres.');

    const perguntas = [];
    for (const el of perguntasEl.children) {
      const t = el.querySelector('.p-titulo').value.trim();
      const tipo = el.querySelector('.p-tipo').value;
      const placeholder = el.querySelector('.p-placeholder').value.trim();
      const obrigatoria = el.querySelector('.p-obrigatoria').checked;

      if (!t) throw new Error('Todas as perguntas precisam de um título.');
      if (t.length > 45) throw new Error('Pergunta muito longa (máx. 45 caracteres).');

      perguntas.push({ pergunta: t, tipo, placeholder, obrigatoria });
    }

    if (perguntas.length === 0) throw new Error('Adicione pelo menos 1 pergunta.');

    return {
      titulo,
      descricao,
      cor,
      dm,
      anonimo,
      categoria,
      perguntas,
      _versao: 1,
      _geradoEm: new Date().toISOString(),
    };
  }

  function gerar() {
    esconderErro();

    let dados;
    try {
      dados = coletarDados();
    } catch (e) {
      return mostrarErro(e.message);
    }

    const json = JSON.stringify(dados);

    codigoGerado.textContent = json;
    abrirModal(modalResultado);
    salvarRascunho();
  }

  /* =========================================================
   *  PREVIEW
   * =======================================================*/
  function preview() {
    esconderErro();

    let dados;
    try {
      dados = coletarDados();
    } catch (e) {
      return mostrarErro(e.message);
    }

    previewBody.innerHTML = window.gerarPreviewHTML(dados);
    abrirModal(modalPreview);
  }

  /* =========================================================
   *  MODAIS
   * =======================================================*/
  function abrirModal(modal) { modal.classList.add('aberto'); }
  function fecharModal(modal) { modal.classList.remove('aberto'); }

  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) fecharModal(m);
    });
  });

  $('btnFecharModal').addEventListener('click', () => fecharModal(modalResultado));
  $('btnFecharPreview').addEventListener('click', () => fecharModal(modalPreview));
  $('btnFecharAjuda').addEventListener('click', () => fecharModal(modalAjuda));
  $('btnAjuda').addEventListener('click', () => abrirModal(modalAjuda));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.aberto').forEach(fecharModal);
    }
  });

  /* =========================================================
   *  COPIAR / BAIXAR
   * =======================================================*/
  $('btnCopiar').addEventListener('click', async () => {
    const txt = codigoGerado.textContent;
    try {
      await navigator.clipboard.writeText(txt);
      const btn = $('btnCopiar');
      btn.textContent = '✅ Copiado!';
      setTimeout(() => btn.textContent = '📋 Copiar JSON', 2000);
    } catch {
      alert('Não consegui copiar. Selecione o texto manualmente.');
    }
  });

  $('btnBaixar').addEventListener('click', () => {
    const txt = codigoGerado.textContent;
    const blob = new Blob([txt], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formulario.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  /* =========================================================
   *  RASCUNHO (localStorage)
   * =======================================================*/
  function salvarRascunho() {
    try {
      const dados = {
        titulo: tituloEl.value,
        descricao: descricaoEl.value,
        cor: corHexEl.value,
        dm: dmEl.checked,
        anonimo: anonimoEl.checked,
        categoria: categoriaEl.value,
        perguntas: [...perguntasEl.children].map(el => ({
          titulo: el.querySelector('.p-titulo').value,
          tipo: el.querySelector('.p-tipo').value,
          placeholder: el.querySelector('.p-placeholder').value,
          obrigatoria: el.querySelector('.p-obrigatoria').checked,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch { /* ignora */ }
  }

  function carregarRascunho() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;

      const d = JSON.parse(raw);
      tituloEl.value = d.titulo || '';
      descricaoEl.value = d.descricao || '';
      corEl.value = d.cor || '#5865f2';
      corHexEl.value = d.cor || '#5865f2';
      dmEl.checked = d.dm !== false;
      anonimoEl.checked = !!d.anonimo;
      categoriaEl.value = d.categoria || '';

      (d.perguntas || []).forEach(p => adicionarPergunta(p));
      return true;
    } catch {
      return false;
    }
  }

  /* =========================================================
   *  EVENTOS
   * =======================================================*/
  btnAddPergunta.addEventListener('click', () => adicionarPergunta());

  btnAddRapida.addEventListener('click', () => {
    const perguntasRapidas = [
      { titulo: 'Nome completo', tipo: 'short' },
      { titulo: 'Idade', tipo: 'number' },
      { titulo: 'Motivo do contato', tipo: 'long' },
    ];
    const p = perguntasRapidas[perguntasEl.children.length % perguntasRapidas.length];
    adicionarPergunta({ ...p, obrigatoria: true });
  });

  btnPreview.addEventListener('click', preview);
  btnGerar.addEventListener('click', gerar);

  btnLimpar.addEventListener('click', () => {
    if (!confirm('Apagar tudo? Esta ação não pode ser desfeita.')) return;
    tituloEl.value = '';
    descricaoEl.value = '';
    corEl.value = '#5865f2';
    corHexEl.value = '#5865f2';
    dmEl.checked = true;
    anonimoEl.checked = false;
    categoriaEl.value = '';
    perguntasEl.innerHTML = '';
    contadorId = 0;
    esconderErro();
    atualizarContador();
    localStorage.removeItem(STORAGE_KEY);
  });

  // Sincroniza cor
  corEl.addEventListener('input', () => { corHexEl.value = corEl.value; salvarRascunho(); });
  corHexEl.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(corHexEl.value)) corEl.value = corHexEl.value;
    salvarRascunho();
  });

  // Validação ao vivo do título
  tituloEl.addEventListener('input', () => {
    const v = tituloEl.value.trim();
    if (!v) { hintTitulo.textContent = ''; hintTitulo.className = 'hint'; return; }
    if (v.length < 3) {
      hintTitulo.textContent = 'Muito curto (mín. 3 caracteres)';
      hintTitulo.className = 'hint erro';
    } else {
      hintTitulo.textContent = `${v.length}/100 caracteres`;
      hintTitulo.className = 'hint ok';
    }
    salvarRascunho();
  });

  [descricaoEl, dmEl, anonimoEl, categoriaEl].forEach(el =>
    el.addEventListener('input', salvarRascunho)
  );

  /* =========================================================
   *  HELPERS
   * =======================================================*/
  function escapeAttr(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* =========================================================
   *  INICIALIZAÇÃO
   * =======================================================*/
  renderTemplates();

  if (!carregarRascunho()) {
    adicionarPergunta({ titulo: 'Nome', tipo: 'short', obrigatoria: true });
    adicionarPergunta({ titulo: 'Motivo', tipo: 'long', obrigatoria: true });
  }

  atualizarContador();
  console.log('%c📋 Construtor de Formulários pronto!', 'color:#5865f2;font-weight:bold;font-size:14px');
  console.log('Dica: use window.TEMPLATES para ver os templates disponíveis.');
})();
