// Гео без PostGIS (ADR-005). Для MVP-масштаба дистанция считается в сервисе (haversine)
// над кандидатами, отфильтрованными по категории в БД. Для прод-масштаба — вынести в
// earth_distance/PostGIS (проверено в M2, что earth_distance на этом PG17 работает).

/** Алматы — центр по умолчанию, если у специалиста нет гео (демо). */
export const ALMATY = { lat: 43.238949, lng: 76.889709 };

/** Расстояние в метрах между двумя точками (haversine). */
export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export interface OrderFilters {
  certifiedOnly?: boolean;
  minRating?: number;
  minOrders?: number;
  maxDistanceKm?: number;
}

/**
 * Проходит ли специалист под фильтры заказа (Ф-02…Ф-05, Ф-07).
 * distanceM — расстояние от специалиста до заказа (метры), или null если гео нет.
 */
export function specialistPassesFilters(
  filters: OrderFilters,
  spec: { diplomaApproved: boolean; rating: number; completedOrders: number },
  distanceM: number | null,
): boolean {
  if (filters.certifiedOnly && !spec.diplomaApproved) return false; // Ф-02
  if (filters.minRating != null && spec.rating < filters.minRating) return false; // Ф-03
  if (filters.minOrders != null && spec.completedOrders < filters.minOrders) return false; // Ф-04
  if (filters.maxDistanceKm != null && distanceM != null && distanceM > filters.maxDistanceKm * 1000) {
    return false; // Ф-05
  }
  return true;
}
