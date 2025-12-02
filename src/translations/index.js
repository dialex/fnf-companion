import enTranslations from './en.json';
import ptTranslations from './pt.json';

const translations = {
  en: enTranslations,
  pt: ptTranslations,
};

// Load language from localStorage or default to 'en'
const getStoredLanguage = () => {
  try {
    const stored = localStorage.getItem('fnf-companion-language');
    if (stored && translations[stored]) {
      return stored;
    }
  } catch (error) {
    console.warn('Could not read language from localStorage:', error);
  }
  return 'en';
};

let currentLanguage = getStoredLanguage();

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    // Save to localStorage
    try {
      localStorage.setItem('fnf-companion-language', lang);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
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
