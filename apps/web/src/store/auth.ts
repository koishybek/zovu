import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SessionUser {
  id: string;
  phone: string;
  name: string | null;
  lang: 'ru' | 'kk';
  is_client: boolean;
  is_specialist: boolean;
  active_role: 'client' | 'specialist';
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (t: { access_token: string; refresh_token: string }, user: SessionUser) => void;
  setUser: (user: SessionUser) => void;
  logout: () => void;
  doRefresh: () => Promise<string | null>;
}

// Токены в localStorage: для web-PWA нет Keychain; известный XSS-компромисс SPA (TODO: httpOnly cookie в проде).
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setSession: (t, user) =>
        set({ accessToken: t.access_token, refreshToken: t.refresh_token, user }),

      setUser: (user) => set({ user }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      doRefresh: async () => {
        const rt = get().refreshToken;
        if (!rt) return null;
        try {
          const { data } = await axios.post('/v1/auth/refresh', { refresh_token: rt });
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user ?? get().user,
          });
          return data.access_token as string;
        } catch {
          set({ accessToken: null, refreshToken: null, user: null });
          return null;
        }
      },
    }),
    { name: 'zovu.auth' },
  ),
);
