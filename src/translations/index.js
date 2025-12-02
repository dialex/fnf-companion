import enTranslations from './en.json';
import ptTranslations from './pt.json';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

const translations = {
  en: enTranslations,
  pt: ptTranslations,
};

const LANGUAGE_STORAGE_KEY = 'fnf-companion-language';

// Load language from localStorage or default to 'en'
const getStoredLanguage = () => {
  const stored = getFromStorage(LANGUAGE_STORAGE_KEY, 'en');
  if (stored && translations[stored]) {
    return stored;
  }
  return 'en';
};

let currentLanguage = getStoredLanguage();

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    saveToStorage(LANGUAGE_STORAGE_KEY, lang);
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
