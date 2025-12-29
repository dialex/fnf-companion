/**
 * Manager for internationalization (i18n)
 * Handles language switching, translation retrieval, and validation
 */

import enTranslations from '../translations/en.json';
import ptTranslations from '../translations/pt.json';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

const translations = {
  en: enTranslations,
  pt: ptTranslations,
};

const LANGUAGE_STORAGE_KEY = 'fnf-companion-language';

/**
 * Recursively get all keys from a nested object
 * @param {Object} obj - The object to extract keys from
 * @param {string} prefix - Prefix for nested keys
 * @returns {Array<string>} Array of dot-notation keys
 */
const getAllKeys = (obj, prefix = '') => {
  const keys = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
};

/**
 * Creates an i18nManager instance
 * @returns {Object} i18nManager with methods to manage translations
 */
export const createI18nManager = () => {
  // Load language from localStorage or default to 'en'
  const getStoredLanguage = () => {
    const stored = getFromStorage(LANGUAGE_STORAGE_KEY, 'en');
    if (stored && translations[stored]) {
      return stored;
    }
    return 'en';
  };

  let currentLanguage = getStoredLanguage();

  /**
   * Get translation for a key
   * @param {string} key - Dot-notation key (e.g., 'sections.diceRolls')
   * @returns {string} Translated string or key if not found
   */
  const getTranslation = (key) => {
    if (!key || typeof key !== 'string') {
      return key || '';
    }

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

  /**
   * Set current language
   * @param {string} lang - Language code (e.g., 'en', 'pt')
   */
  const setLanguage = (lang) => {
    if (translations[lang]) {
      currentLanguage = lang;
      saveToStorage(LANGUAGE_STORAGE_KEY, lang);
    }
  };

  /**
   * Get current language
   * @returns {string} Current language code
   */
  const getCurrentLanguage = () => currentLanguage;

  /**
   * Get all available languages
   * @returns {Array<string>} Array of language codes
   */
  const getAvailableLanguages = () => Object.keys(translations);

  /**
   * Validate that all languages have the same keys
   * @returns {Array<Object>} Array of missing keys: [{ language: 'pt', key: 'some.key' }]
   */
  const validateTranslations = () => {
    const missing = [];
    const languages = Object.keys(translations);
    const baseLanguage = languages[0];
    const baseKeys = new Set(getAllKeys(translations[baseLanguage]));

    // Check all languages against base language
    for (const lang of languages) {
      const langKeys = new Set(getAllKeys(translations[lang]));
      for (const key of baseKeys) {
        if (!langKeys.has(key)) {
          missing.push({ language: lang, key });
        }
      }
    }

    return missing;
  };

  return {
    getTranslation,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    validateTranslations,
    t: getTranslation, // Shorthand
  };
};

// Export singleton instance for app use
export const i18nManager = createI18nManager();
