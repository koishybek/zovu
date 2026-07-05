// Форматтеры. Тенге — целые (без тиынов), пробел-разделитель тысяч (₸ после числа).

export function formatTenge(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(Math.round(amount));
  const grouped = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${grouped} ₸`;
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(km < 10 ? 1 : 0)} км`;
}

/** Комиссия ADR-001: округляем до целого ₸. */
export function commission(price: number, pct: number): number {
  return Math.round((price * pct) / 100);
}

export function payout(price: number, pct: number): number {
  return price - commission(price, pct);
}
