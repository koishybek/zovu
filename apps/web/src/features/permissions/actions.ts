interface PermsPatch {
  geoAsked?: boolean;
  geoGranted?: boolean;
  pushAsked?: boolean;
  cameraAsked?: boolean;
}
type SetPerms = (patch: PermsPatch) => void;

/**
 * Реальный запрос геолокации (после primer/тумблера). Успех → geoGranted:true, отказ → false.
 * Общая точка для PermissionsGate (первый показ) и Настроек (повторное включение).
 */
export function requestGeo(setPerms: SetPerms): void {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => setPerms({ geoAsked: true, geoGranted: true }),
      () => setPerms({ geoAsked: true, geoGranted: false }),
      { timeout: 8000 },
    );
  } else {
    setPerms({ geoAsked: true });
  }
}

/** Запрос локальных уведомлений. Promise.resolve — устойчивость к legacy callback-API. */
export function requestPush(setPerms: SetPerms): void {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    Promise.resolve(Notification.requestPermission()).finally(() => setPerms({ pushAsked: true }));
  } else {
    setPerms({ pushAsked: true });
  }
}
