/** Нормализация казахстанского номера в формат +7XXXXXXXXXX. Бросает при невалидном. */
export function normalizeKzPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  let d = digits;
  if (d.startsWith('8') && d.length === 11) d = '7' + d.slice(1);
  if (d.length === 10 && d.startsWith('7')) d = '7' + d; // 7XXXXXXXXX → добавить код страны
  if (d.length !== 11 || !d.startsWith('7')) {
    throw new Error('invalid_kz_phone');
  }
  return '+' + d;
}

export function isValidKzPhone(input: string): boolean {
  try {
    normalizeKzPhone(input);
    return true;
  } catch {
    return false;
  }
}
