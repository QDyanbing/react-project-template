import { getStorage, setStorage } from '@/utils/storage';
import dayjs from 'dayjs';
import type { Resource } from 'i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import languages, { getLanguage, type Language } from './languages';

const STORAGE_KEY = 'locale';

const localeModules = import.meta.glob<I18n.Locale>('../**/locale/*.ts', {
  eager: true,
  import: 'default',
});

const resources: Resource = {};

Object.values(localeModules).forEach((locale) => {
  const languageResources = (resources[locale.language] ??= {});
  languageResources[locale.namespace] = locale.resources;
});

const getInitialLanguage = (): Language => {
  const locale = getStorage<Language>(STORAGE_KEY);
  const language = languages.find((item) => item.locale === locale);
  if (language) return language.locale;

  return getLanguage(navigator.language).locale;
};

i18n.on('languageChanged', (language) => {
  const { locale, dayjs: dayjsLocale } = getLanguage(language);

  setStorage(STORAGE_KEY, locale);
  document.documentElement.lang = locale;
  dayjs.locale(dayjsLocale);
});

void i18n.use(initReactI18next).init({
  resources,
  initAsync: false,
  lng: getInitialLanguage(),
  fallbackLng: 'zh-CN',
  supportedLngs: languages.map((language) => language.locale),
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
