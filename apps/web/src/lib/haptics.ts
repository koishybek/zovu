// Haptics через Web Vibration API (docs/06-design-system.md §4.2).
// На iOS Safari вибрация не поддерживается — деградирует бесшумно (graceful).

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export const haptic = {
  /** Лёгкий тап — нажатие primary-кнопки, выбор чипа. */
  light() {
    if (canVibrate()) navigator.vibrate(10);
  },
  /** Средний — success-экраны, порог свайпа колоды. */
  medium() {
    if (canVibrate()) navigator.vibrate(20);
  },
  /** Тяжёлый — ошибка (shake OTP). */
  heavy() {
    if (canVibrate()) navigator.vibrate([30, 20, 30]);
  },
  /** Успех — верификация пройдена, заказ выполнен. */
  success() {
    if (canVibrate()) navigator.vibrate([15, 40, 15]);
  },
};
