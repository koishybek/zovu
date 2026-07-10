/**
 * База API/WS. В dev пусто → относительные /v1 и /chat (работают через vite dev-proxy, см. vite.config.ts).
 * В проде задаётся VITE_API_URL (origin бэкенда, напр. https://zovu-api.up.railway.app) — вшивается на build.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
