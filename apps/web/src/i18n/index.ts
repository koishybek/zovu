import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ru, type Resources } from './ru';
import { kk } from './kk';

export type Lang = 'ru' | 'kk';
export const LANGS: Lang[] = ['ru', 'kk'];
const STORAGE_KEY = 'zovu.lang';

// Неймспейсы = ключи верхнего уровня ресурса. i18next по умолчанию — namespace 'translation';
// мы кладём всё в один namespace и обращаемся по 'auth.start' и т.п.
const resources = {
  ru: { translation: ru },
  kk: { translation: kk },
};

function initialLang(): Lang {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Lang | null;
  if (saved && LANGS.includes(saved)) return saved;
  return 'ru'; // канон
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLang(),
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLang(lang: Lang): void {
  void i18n.changeLanguage(lang);
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, lang);
}

export function getLang(): Lang {
  return (i18n.language as Lang) ?? 'ru';
}

// Типобезопасность ключей: t('auth.start') проверяется по структуре ru.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: Resources };
  }
}

export default i18n;
