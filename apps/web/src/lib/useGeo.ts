import { useEffect, useState } from 'react';
import { usePrefsStore } from '../store/prefs';

export const ALMATY_FALLBACK = { lat: 43.238949, lng: 76.889709 };

/**
 * Позиция через Geolocation API; при отказе/ошибке — null (вызывающий берёт fallback).
 * Запрос идёт ТОЛЬКО после того, как пользователь дал доступ через permission-primer
 * (geoGranted) — иначе системный диалог не появляется без объяснения «зачем».
 */
export function useGeo(): { lat: number; lng: number } | null {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const geoGranted = usePrefsStore((s) => s.perms.geoGranted);

  useEffect(() => {
    if (!geoGranted) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos(null),
      { timeout: 5000 },
    );
  }, [geoGranted]);

  return pos;
}
