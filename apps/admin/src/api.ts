import axios from 'axios';

const TOKEN_KEY = 'zovu.admin.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string): void {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export const adminApi = axios.create({ baseURL: '/v1/admin' });
adminApi.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers['X-Admin-Token'] = t;
  return cfg;
});

export async function checkToken(token: string): Promise<boolean> {
  try {
    await axios.get('/v1/admin/audit-log', { headers: { 'X-Admin-Token': token } });
    return true;
  } catch {
    return false;
  }
}
