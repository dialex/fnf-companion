import enTranslations from './en.json';
import ptTranslations from './pt.json';

const translations = {
  en: enTranslations,
  pt: ptTranslations,
};

let currentLanguage = 'en';

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

export const getCurrentLanguage = () => currentLanguage;

export const getAvailableLanguages = () => Object.keys(translations);

export const getTranslation = (key) => {
  const keys = key.split('.');
  let value = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return value || key;
};

export const t = getTranslation;

export default translations;
