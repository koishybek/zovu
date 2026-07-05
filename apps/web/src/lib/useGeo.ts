import { useEffect, useState } from 'react';

export const ALMATY_FALLBACK = { lat: 43.238949, lng: 76.889709 };

/** Позиция через Geolocation API; при отказе/ошибке — null (вызывающий берёт fallback). */
export function useGeo(): { lat: number; lng: number } | null {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos(null),
      { timeout: 5000 },
    );
  }, []);

  return pos;
}
