/* API base: use a same-origin reverse proxy for /api and /dashboard routes.
   If the API is hosted separately, set this to that exact HTTPS origin after configuring CORS and cookies. */
window.TOSHIRO_CONFIG = window.TOSHIRO_CONFIG || { apiBase: '' };
