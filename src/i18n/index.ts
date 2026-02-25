import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEN from './locales/en/common.json';
import landingEN from './locales/en/landing.json';
import browseEN from './locales/en/browse.json';
import dataEN from './locales/en/data.json';
import furtherReadingEN from './locales/en/furtherReading.json';

import commonDE from './locales/de/common.json';
import landingDE from './locales/de/landing.json';
import browseDE from './locales/de/browse.json';
import dataDE from './locales/de/data.json';
import furtherReadingDE from './locales/de/furtherReading.json';

export const supportedLanguages = ['en', 'de'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const defaultLanguage: SupportedLanguage = 'en';

export const localeMap: Record<SupportedLanguage, string> = {
  en: 'en_US',
  de: 'de_DE',
};

export const languageEndonyms: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
};

export function detectBrowserLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.includes(browserLang as SupportedLanguage)
    ? (browserLang as SupportedLanguage)
    : defaultLanguage;
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEN,
      landing: landingEN,
      browse: browseEN,
      data: dataEN,
      furtherReading: furtherReadingEN,
    },
    de: {
      common: commonDE,
      landing: landingDE,
      browse: browseDE,
      data: dataDE,
      furtherReading: furtherReadingDE,
    },
  },
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  defaultNS: 'common',
  ns: ['common', 'landing', 'browse', 'data', 'furtherReading'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
