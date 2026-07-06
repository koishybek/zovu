import { api } from '../../api/client';
import type { SessionUser } from '../../store/auth';

export interface VerifyResult {
  access_token: string;
  refresh_token: string;
  is_new_user: boolean;
  user: SessionUser;
}

export async function requestOtp(phone: string): Promise<{ retry_after: number }> {
  const { data } = await api.post('/auth/otp/request', { phone });
  return data;
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyResult> {
  const { data } = await api.post('/auth/otp/verify', { phone, code });
  return data;
}

/**
 * Dev-only быстрый вход демо-персонами (OTP всегда 1111). Используется только
 * на Welcome при `import.meta.env.DEV`, чтобы одним касанием попасть в обе роли.
 */
export async function devLogin(phone: string): Promise<VerifyResult> {
  await requestOtp(phone);
  return verifyOtp(phone, '1111');
}

export async function fetchMe(): Promise<SessionUser & { specialist_profile: unknown }> {
  const { data } = await api.get('/me');
  return data;
}

export async function updateMe(patch: {
  name?: string;
  dob?: string;
  lang?: 'ru' | 'kk';
}): Promise<SessionUser> {
  const { data } = await api.patch('/me', patch);
  return data;
}

export async function switchRole(role: 'client' | 'specialist'): Promise<SessionUser> {
  const { data } = await api.post('/me/role', { role });
  return data;
}

export interface CategoryDto {
  id: string;
  name: string;
  nameKk: string | null;
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  const { data } = await api.get('/categories');
  return data;
}
