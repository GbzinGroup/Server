/* Configuração pública do frontend GitHub Pages.
 * Nunca coloque client secret, token do bot ou valores do .env neste arquivo.
 * Configure BACKEND_URL com a URL HTTPS do backend Node.js que lê o .env.
 * Exemplo: https://api.seudominio.com (sem barra final).
 */
window.GBZIN_CONFIG = Object.freeze({
  BACKEND_URL: ""
});

window.GBZIN_CONFIGURED =
  /^https:\/\//i.test(window.GBZIN_CONFIG.BACKEND_URL) &&
  !window.GBZIN_CONFIG.BACKEND_URL.includes("COLE_A_URL");
