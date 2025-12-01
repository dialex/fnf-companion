import enTranslations from './en.json';

const translations = {
  en: enTranslations,
};

let currentLanguage = 'en';

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

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
