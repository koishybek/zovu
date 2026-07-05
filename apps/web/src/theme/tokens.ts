/**
 * Zovu design tokens — КАНОН из design/standalone.html (ADR-006).
 * НЕ использовать хексы из ZOVU_PROMPT.md §4.1 (#2563EB и др.) — они устарели.
 * Значения также продублированы как CSS-переменные в styles/tokens.scss.
 * Полная спецификация — docs/06-design-system.md.
 */

export const color = {
  // Акцент
  primary: '#4C6FFF',
  primarySoft: '#EEF1FF', // фон выбранных карточек/чипов
  primaryBorderSoft: '#DDE4FB',

  // Текст
  ink: '#141824', // основной текст, заголовки
  inkStrong: '#16181D', // максимально тёмный
  inkSecondary: '#6B7280', // вторичный текст
  inkMuted: '#9AA0AD', // подписи
  inkMutedAlt: '#7A808E',
  placeholder: '#787E8C',

  // Поверхности и линии
  border: '#E4E6EC',
  borderSoft: '#ECEDF1',
  divider: '#F0F1F4',
  surface: '#F5F6F8', // подложки секций
  surfaceAlt: '#F7F7F8',
  bg: '#FFFFFF',

  // Статусы
  success: '#16A34A',
  successSoft: '#E7F6EC',
  warning: '#E8981F',
  warningInk: '#B45309', // текст warning на soft-фоне
  warningSoft: '#FBEFDD',
  danger: '#E24545',
  dangerStrong: '#DC2626',
  dangerSoft: '#FDECEC',
} as const;

/** Статус-пиллы: фон / текст / (опц.) бордер. Канон — секция «СТАТУС-ПИЛЛЫ» standalone. */
export const statusPill = {
  new: { bg: color.primarySoft, fg: color.primary }, // Новый
  waiting: { bg: color.warningSoft, fg: color.warningInk }, // Ожидание ответа
  accepted: { bg: color.successSoft, fg: color.success }, // Принят
  done: { bg: color.successSoft, fg: color.success }, // Выполнен
  notSelected: { bg: color.divider, fg: color.inkSecondary }, // Не выбран / Отменён
  inProgress: { bg: color.primarySoft, fg: color.primary }, // В работе
  review: { bg: color.warningSoft, fg: color.warningInk }, // На рассмотрении
} as const;

/** Радиусы (px). Точные значения standalone: чипы 999, CTA 15, карточки 18, инпуты 13, OTP 14, шиты 22. */
export const radius = {
  chip: 999,
  cta: 15,
  card: 18,
  input: 13,
  otp: 14,
  sheet: 22,
  sm: 8,
} as const;

/** 4pt-сетка. */
export const space = {
  x1: 4,
  x2: 8,
  x3: 12,
  x4: 16, // базовый отступ экрана
  x5: 20,
  x6: 24,
  x8: 32,
  x10: 40,
} as const;

export const size = {
  ctaHeight: 52,
  inputHeight: 52,
  screenPadding: 16,
} as const;

/** Типографика (§4.1): [size, lineHeight, weight]. */
export const typography = {
  largeTitle: { size: 28, line: 34, weight: 700 },
  title: { size: 22, line: 28, weight: 700 },
  headline: { size: 17, line: 22, weight: 600 },
  body: { size: 16, line: 22, weight: 400 },
  caption: { size: 13, line: 18, weight: 400 },
  price: { size: 20, line: 24, weight: 800 }, // в standalone вес цены до 800
} as const;

export const fontFamily =
  "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif";

/** Моушн (§4.2 + motion.css). Базовые длительности 160–240 мс. */
export const motion = {
  fast: 160,
  base: 200,
  slow: 240,
  easeOut: 'cubic-bezier(0.19, 0.91, 0.38, 1)',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  pressScale: 0.97, // primary-кнопка при нажатии
} as const;

/** Единственная допустимая тень — еле заметная под карточками (§4.1). */
export const shadow = {
  card: '0 2px 8px rgba(15, 23, 42, 0.04)',
} as const;
