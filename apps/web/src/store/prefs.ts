import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Флаги разрешений (permission-primers): показываем «зачем» ДО системного диалога один раз. */
interface Perms {
  geoAsked: boolean; // primer гео показан/разрешён
  geoGranted: boolean; // пользователь реально дал доступ к геолокации
  pushAsked: boolean; // primer уведомлений показан/разрешён
  cameraAsked: boolean; // primer камеры показан
}

interface PrefsState {
  /** Специалист «Принимаю заказы» (клиентский тумблер; серверный гейтинг — follow-up). */
  available: boolean;
  setAvailable: (v: boolean) => void;
  perms: Perms;
  setPerms: (patch: Partial<Perms>) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      available: true,
      setAvailable: (v) => set({ available: v }),
      perms: { geoAsked: false, geoGranted: false, pushAsked: false, cameraAsked: false },
      setPerms: (patch) => set((s) => ({ perms: { ...s.perms, ...patch } })),
    }),
    { name: 'zovu.prefs' },
  ),
);
