import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth';
import { API_BASE } from '../config';

// Dev: относительный /v1 через vite-proxy → :3000. Prod: API_BASE (VITE_API_URL) + /v1.
export const api = axios.create({ baseURL: `${API_BASE}/v1` });

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Автообновление access по refresh при 401 (одна попытка).
let refreshing: Promise<string | null> | null = null;

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const store = useAuthStore.getState();

    if (status === 401 && !original._retry && store.refreshToken && !original.url?.includes('/auth/')) {
      original._retry = true;
      refreshing ??= store.doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Достаёт код ошибки из ответа API ({ message } или message[]). */
export function apiError(e: unknown): string {
  if (e instanceof AxiosError) {
    const data = e.response?.data as { message?: string | string[] } | undefined;
    const m = data?.message;
    if (Array.isArray(m)) return m[0] ?? 'error';
    return m ?? e.message;
  }
  return 'error';
}
