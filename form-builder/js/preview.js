/**
 * js/preview.js
 * -------------------------------------------------------------
 * Gera HTML de pré-visualização do formulário (embed + modal).
 *
 * Expõe: window.FF.preview
 * -------------------------------------------------------------
 */

(function () {
  'use strict';

  const C = window.FF?.config;
  const U = window.FF?.utils;

  if (!C || !U) {
    console.error('[preview] config.js e utils.js precisam vir antes.');
    return;
  }

  /* =========================================================
   *  EMBED (estilo Discord)
   * =======================================================*/
  function gerarEmbedHTML(form) {
    const cor = C.RE_HEX.test(form.cor ?? '') ? form.cor : C.COR_PADRAO;
    const titulo = U.escapeHtml(form.titulo || 'Sem título');
    const descricao = U.escapeHtml(form.descricao || '*Sem descrição*');

    const numPerguntas = (form.perguntas ?? []).length;

    const linhasInfo = [];
    linhasInfo.push(`**Perguntas:** ${numPerguntas}`);
    if (form.dm) linhasInfo.push('📩 Você receberá uma cópia por DM.');
    if (form.anonimo) linhasInfo.push('👤 Respostas anônimas no canal.');
    linhasInfo.push('');
    linhasInfo.push('> Clique no botão **📝 Preencher** abaixo para responder.');

    return `
      <div class="discord-embed" style="border-left-color:${cor}">
        <div class="discord-embed-titulo">📋 ${titulo}</div>
        <div class="discord-embed-descricao">${descricao}\n\n${linhasInfo.join('\n')}</div>
        <div class="discord-embed-footer">
          <span>Código: FORM-XXXXXX</span>
        </div>
        <button class="discord-embed-btn" type="button">
          📝 Preencher
        </button>
      </div>
    `;
  }

  /* =========================================================
   *  MODAL (estilo Discord)
   * =======================================================*/
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
          <label class="discord-modal-label">
            ${label}${p.obrigatoria ? '<span class="req">*</span>' : ''}
          </label>
          ${isLong
            ? `<textarea class="discord-modal-input discord-modal-textarea" placeholder="${ph}" readonly></textarea>`
            : `<input type="text" class="discord-modal-input" placeholder="${ph}" readonly>`
          }
        </div>
      `;
    }).join('');

    return `
      <div class="discord-modal">
        <div class="discord-modal-title">${titulo}</div>
        ${campos}
      </div>
    `;
  }

  /* =========================================================
   *  JSON (syntax highlight simples)
   * =======================================================*/
  function gerarJsonHTML(obj) {
    let json;
    try {
      json = JSON.stringify(obj, null, 2);
    } catch {
      json = '{}';
    }

    // Highlight básico
    const html = U.escapeHtml(json)
      .replace(/&quot;([^&]+?)&quot;(\s*:)/g, '<span class="k">"$1"</span>$2')
      .replace(/:\s*&quot;([^&]*?)&quot;/g, ': <span class="s">"$1"</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="b">$1</span>')
      .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="n">$1</span>');

    return `<pre class="json-preview">${html}</pre>`;
  }

  /* =========================================================
   *  RENDER PRINCIPAL
   * =======================================================*/
  function render(container, form, aba = 'embed') {
    if (!container) return;

    if (aba === 'embed') {
      container.innerHTML = gerarEmbedHTML(form);
    } else if (aba === 'modal') {
      container.innerHTML = gerarModalHTML(form);
    } else if (aba === 'json') {
      container.innerHTML = gerarJsonHTML(form);
    }
  }

  /* =========================================================
   *  EXPORTS
   * =======================================================*/
  window.FF = window.FF || {};
  window.FF.preview = Object.freeze({
    gerarEmbedHTML,
    gerarModalHTML,
    gerarJsonHTML,
    render,
  });
})();
