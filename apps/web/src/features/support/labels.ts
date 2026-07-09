/**
 * Категории тикета: бэкенд хранит русское значение (контракт @IsIn), а показываем через
 * i18n-ключ — иначе kk-локаль видит русское слово рядом с локализованным статус-пиллом.
 */
const TICKET_CATEGORY_KEY: Record<string, string> = {
  Заказ: 'support.categoryOrder',
  Оплата: 'support.categoryPayment',
  Жалоба: 'support.categoryComplaint',
  Верификация: 'support.categoryVerification',
  Иное: 'support.categoryOther',
};

export function ticketCategoryKey(cat: string): string {
  return TICKET_CATEGORY_KEY[cat] ?? 'support.categoryOther';
}
