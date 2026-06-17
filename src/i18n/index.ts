import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import zhHK from './locales/zh-HK.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'zh-HK': { translation: zhHK },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-HK'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'uptownmartz_lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
