(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;
  if (!C || !U) { console.error('[preview] Dependências faltando.'); return; }

  function gerarEmbedHTML(form) {
    const cor = C.RE_HEX.test(form.cor ?? '') ? form.cor : C.COR_PADRAO;
    const titulo = U.escapeHtml(form.titulo || 'Sem título');
    const descricao = U.escapeHtml(form.descricao || '*Sem descrição*');
    const num = (form.perguntas ?? []).length;

    const linhas = [];
    linhas.push(`**Perguntas:** ${num}`);
    if (form.dm) linhas.push('📩 Você receberá uma cópia por DM.');
    if (form.anonimo) linhas.push('👤 Respostas anônimas no canal.');
    linhas.push('');
    linhas.push('> Clique no botão **📝 Preencher** abaixo para responder.');

    return `
      <div class="discord-embed" style="border-left-color:${cor}">
        <div class="discord-embed-titulo">📋 ${titulo}</div>
        <div class="discord-embed-descricao">${descricao}\n\n${linhas.join('\n')}</div>
        <div class="discord-embed-footer"><span>Código: FORM-XXXXXX</span></div>
        <button class="discord-embed-btn" type="button">📝 Preencher</button>
      </div>
    `;
  }

  function gerarModalHTML(form) {
    const titulo = U.escapeHtml(form.titulo || 'Formulário');
    const perguntas = (form.perguntas ?? []).slice(0, 5);

    if (!perguntas.length) {
      return `<p style="color:var(--text-3);text-align:center;padding:20px;">Nenhuma pergunta adicionada.</p>`;
    }

    const campos = perguntas.map(p => {
      const label = U.escapeHtml(p.pergunta || 'Pergunta');
      const ph = U.escapeHtml(p.placeholder || '');
      const isLong = p.tipo === 'long';
      return `
        <div class="discord-modal-field">
          <label class="discord-modal-label">${label}${p.obrigatoria ? '<span class="req">*</span>' : ''}</label>
          ${isLong
            ? `<textarea class="discord-modal-input discord-modal-textarea" placeholder="${ph}" readonly></textarea>`
            : `<input type="text" class="discord-modal-input" placeholder="${ph}" readonly>`
          }
        </div>
      `;
    }).join('');

    return `<div class="discord-modal"><div class="discord-modal-title">${titulo}</div>${campos}</div>`;
  }

  function gerarJsonHTML(obj) {
    let json;
    try { json = JSON.stringify(obj, null, 2); } catch { json = '{}'; }
    return `<pre class="json-preview">${U.escapeHtml(json)}</pre>`;
  }

  function render(container, form, aba = 'embed') {
    if (!container) return;
    if (aba === 'embed') container.innerHTML = gerarEmbedHTML(form);
    else if (aba === 'modal') container.innerHTML = gerarModalHTML(form);
    else if (aba === 'json') container.innerHTML = gerarJsonHTML(form);
  }

  window.FF = window.FF || {};
  window.FF.preview = Object.freeze({ gerarEmbedHTML, gerarModalHTML, gerarJsonHTML, render });
})();
