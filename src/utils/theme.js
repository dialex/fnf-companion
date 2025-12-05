import { getFromStorage, saveToStorage } from './localStorage';

const THEME_STORAGE_KEY = 'fnf-companion-theme';

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

// Get stored theme from localStorage or default to 'auto'
const getStoredTheme = () => {
  const stored = getFromStorage(THEME_STORAGE_KEY, THEMES.AUTO);
  if (Object.values(THEMES).includes(stored)) {
    return stored;
  }
  return THEMES.AUTO;
};

let currentTheme = getStoredTheme();

// Get the effective theme (resolves 'auto' to actual theme based on OS preference)
export const getEffectiveTheme = () => {
  if (currentTheme === THEMES.AUTO) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }
  return currentTheme;
};

// Apply theme to document
export const applyTheme = (theme = null) => {
  const themeToApply = theme || getEffectiveTheme();
  document.documentElement.setAttribute('data-theme', themeToApply);
};

// Set theme preference
export const setTheme = (theme) => {
  if (Object.values(THEMES).includes(theme)) {
    currentTheme = theme;
    saveToStorage(THEME_STORAGE_KEY, theme);
    applyTheme();
  }
};

// Get current theme preference
export const getCurrentTheme = () => currentTheme;

// Get available themes
export const getAvailableThemes = () => Object.values(THEMES);

// Store the media query listener so we can manage it
let mediaQueryListener = null;

// Initialize theme on load
export const initTheme = () => {
  applyTheme();

  // Remove existing listener if any
  if (mediaQueryListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', mediaQueryListener);
  }

  // Listen for OS theme changes when in auto mode
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQueryListener = () => {
    if (currentTheme === THEMES.AUTO) {
      applyTheme();
    }
  };
  mediaQuery.addEventListener('change', mediaQueryListener);
};
