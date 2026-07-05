import { api } from '../../api/client';
import type { SessionUser } from '../../store/auth';

export interface SpecialistProfilePayload {
  name: string;
  dob?: string;
  mainCategoryId: string;
  categoryIds?: string[];
  about?: string;
}

export async function saveSpecialistProfile(
  payload: SpecialistProfilePayload,
): Promise<SessionUser & { specialist_profile: unknown }> {
  const { data } = await api.post('/specialist/profile', payload);
  return data;
}

export async function submitVerification(selfie: File, selfieWithDoc: File): Promise<{ status: string }> {
  const form = new FormData();
  form.append('selfie', selfie);
  form.append('selfieWithDoc', selfieWithDoc);
  const { data } = await api.post('/specialist/verification', form);
  return data;
}

export async function submitDiploma(file: File): Promise<{ status: string }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/specialist/diploma', form);
  return data;
}
