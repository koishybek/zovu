import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PrefsState {
  /** Специалист «Принимаю заказы» (клиентский тумблер; серверный гейтинг — follow-up). */
  available: boolean;
  setAvailable: (v: boolean) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      available: true,
      setAvailable: (v) => set({ available: v }),
    }),
    { name: 'zovu.prefs' },
  ),
);
