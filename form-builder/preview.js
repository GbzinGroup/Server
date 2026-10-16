/**
 * preview.js — renderiza o preview do formulário.
 * Expõe window.gerarPreviewHTML
 */
window.gerarPreviewHTML = function (form) {
  const cor = form.cor || '#5865f2';
  const titulo = escapeHtml(form.titulo || 'Sem título');
  const descricao = escapeHtml(form.descricao || '*Sem descrição*');

  const perguntas = (form.perguntas || []).map((p, i) => {
    const tag = TIPO_LABEL(p.tipo) || 'curta';
    const obrig = p.obrigatoria ? ' <b style="color:#ed4245">*</b>' : '';
    return `
      <div class="preview-pergunta">
        <b>${i + 1}. ${escapeHtml(p.pergunta)}</b>${obrig}
        <span class="tag">${tag}</span>
        ${p.placeholder ? `<div style="color:var(--muted);font-size:12.5px;margin-top:4px;">💬 ${escapeHtml(p.placeholder)}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
    <div class="preview-embed" style="border-left-color:${cor}">
      <h3>📋 ${titulo}</h3>
      <p>${descricao}</p>
      <p style="margin-top:12px;font-size:12.5px;">
        ${form.dm ? '📩 Cópia por DM ativada<br>' : ''}
        ${form.anonimo ? '👤 Respostas anônimas<br>' : ''}
        <b>📝 ${form.perguntas.length} pergunta(s)</b>
      </p>
    </div>
    <div class="preview-perguntas">
      ${perguntas || '<p style="text-align:center;color:var(--muted)">Nenhuma pergunta adicionada</p>'}
    </div>
  `;
};

function TIPO_LABEL(tipo) {
  return {
    short: 'curta',
    long: 'longa',
    number: 'número',
    user: 'usuário',
    channel: 'canal',
    role: 'cargo',
  }[tipo] || 'curta';
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
