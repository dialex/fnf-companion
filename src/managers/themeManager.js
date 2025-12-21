/**
 * Manager for theme management
 * Handles mode (light/dark) and palette (color scheme) switching
 * A Theme is composed of: Mode (light/dark) + Palette (colors)
 */

import { getFromStorage, saveToStorage } from '../utils/localStorage';

const THEME_STORAGE_KEY = 'fnf-companion-theme';
const PALETTE_STORAGE_KEY = 'fnf-companion-palette';

const MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// List of available palettes (files are in public/themes/)
const AVAILABLE_PALETTES = [
  'default',
  'beach',
  'brown',
  'forest',
  'gothic',
  'kurtteal',
  'monokai',
  'purplorange',
  'redvash',
].sort((a, b) => {
  // Always put 'default' first
  if (a === 'default') return -1;
  if (b === 'default') return 1;
  // Sort others alphabetically (case-insensitive)
  return a.toLowerCase().localeCompare(b.toLowerCase());
});

// Required CSS variables for a valid palette
const REQUIRED_PALETTE_VARS = [
  '--palette-nav',
  '--palette-section-header',
  '--palette-button-primary',
  '--palette-bg',
];

/**
 * Creates a ThemeManager instance
 * @returns {Object} ThemeManager with methods to manage theme and palette
 */
export const createThemeManager = () => {
  // Get stored theme mode from localStorage or default to 'light'
  const getStoredMode = () => {
    const stored = getFromStorage(THEME_STORAGE_KEY, MODES.LIGHT);
    if (stored && Object.values(MODES).includes(stored)) {
      return stored;
    }
    return MODES.LIGHT;
  };

  // Get stored palette from localStorage or default to 'default'
  const getStoredPalette = () => {
    const stored = getFromStorage(PALETTE_STORAGE_KEY, 'default');
    if (stored && AVAILABLE_PALETTES.includes(stored)) {
      return stored;
    }
    return 'default';
  };

  let currentMode = getStoredMode();
  let currentPalette = getStoredPalette();
  let paletteLinkElement = null;
  const listeners = new Set();

  const notifyListeners = () => {
    listeners.forEach((callback) => callback());
  };

  // Apply theme mode to document
  const applyMode = (mode = null) => {
    const modeToApply = mode || currentMode;
    if (document && document.documentElement) {
      document.documentElement.setAttribute('data-theme', modeToApply);
    }
  };

  // Check which theme variants are available in the loaded palette
  const checkPaletteVariants = () => {
    let hasLight = false;
    let hasDark = false;

    // Find the palette stylesheet
    const paletteSheet = document.getElementById('palette-stylesheet');
    if (!paletteSheet) {
      // Fallback: check if variables exist in computed styles
      const rootStyles = getComputedStyle(document.documentElement);
      const navValue = rootStyles.getPropertyValue('--palette-nav').trim();
      return { hasLight: !!navValue, hasDark: !!navValue };
    }

    try {
      // For style elements, parse CSS text directly (more reliable)
      if (paletteSheet.tagName === 'STYLE') {
        const cssText = paletteSheet.textContent || paletteSheet.innerHTML;
        if (cssText) {
          const hasLight =
            cssText.includes(":root[data-theme='light']") ||
            cssText.includes(':root[data-theme="light"]') ||
            (cssText.includes(':root') &&
              !cssText.includes("[data-theme='dark']"));
          const hasDark =
            cssText.includes("[data-theme='dark']") ||
            cssText.includes('[data-theme="dark"]');
          return { hasLight, hasDark };
        }
        return { hasLight: true, hasDark: true };
      }

      // For link elements, use the stylesheet API
      const sheet = paletteSheet.sheet;
      if (!sheet) {
        return { hasLight: true, hasDark: true };
      }
      // Check all CSS rules in the stylesheet
      for (let i = 0; i < sheet.cssRules.length; i++) {
        const rule = sheet.cssRules[i];
        if (rule.type === CSSRule.STYLE_RULE) {
          const selector = rule.selectorText;
          const cssText = rule.cssText;

          // Check if it defines palette variables
          const hasPaletteVars = REQUIRED_PALETTE_VARS.some((varName) =>
            cssText.includes(varName)
          );

          if (!hasPaletteVars) continue;

          // Check for light variant: :root (without data-theme) or :root[data-theme='light']
          if (
            selector === ':root' ||
            selector.includes(":root[data-theme='light']") ||
            selector.includes(':root[data-theme="light"]') ||
            selector.includes(":root,\n:root[data-theme='light']") ||
            selector.includes(':root,\n:root[data-theme="light"]')
          ) {
            hasLight = true;
          }

          // Check for dark variant: :root[data-theme='dark']
          if (
            selector.includes("[data-theme='dark']") ||
            selector.includes('[data-theme="dark"]')
          ) {
            hasDark = true;
          }
        }
      }
    } catch (e) {
      // If we can't access rules (CORS issue), fallback to checking computed styles
      console.warn(
        'Could not access stylesheet rules, using fallback method',
        e
      );
      const rootStyles = getComputedStyle(document.documentElement);
      const navValue = rootStyles.getPropertyValue('--palette-nav').trim();
      return { hasLight: !!navValue, hasDark: !!navValue };
    }

    return { hasLight, hasDark };
  };

  // Validate palette has all required CSS variables
  const validatePalette = () => {
    const paletteSheet = document.getElementById('palette-stylesheet');
    if (!paletteSheet) {
      return false;
    }

    try {
      let foundVars = new Set();

      // For style elements, parse CSS text directly
      if (paletteSheet.tagName === 'STYLE') {
        const cssText = paletteSheet.textContent || paletteSheet.innerHTML;
        REQUIRED_PALETTE_VARS.forEach((varName) => {
          if (cssText.includes(varName)) {
            foundVars.add(varName);
          }
        });
        return foundVars.size === REQUIRED_PALETTE_VARS.length;
      }

      // For link elements, use the stylesheet API
      const sheet = paletteSheet.sheet;
      if (!sheet) {
        return false;
      }

      // Check all CSS rules in the stylesheet
      for (let i = 0; i < sheet.cssRules.length; i++) {
        const rule = sheet.cssRules[i];
        // CSSRule.STYLE_RULE = 1
        if (
          rule.type === 1 ||
          (typeof CSSRule !== 'undefined' && rule.type === CSSRule.STYLE_RULE)
        ) {
          const cssText = rule.cssText;
          REQUIRED_PALETTE_VARS.forEach((varName) => {
            if (cssText.includes(varName)) {
              foundVars.add(varName);
            }
          });
        }
      }

      return foundVars.size === REQUIRED_PALETTE_VARS.length;
    } catch (e) {
      console.warn('Could not validate palette, using fallback method', e);
      // Fallback: check computed styles
      const rootStyles = getComputedStyle(document.documentElement);
      const navValue = rootStyles.getPropertyValue('--palette-nav').trim();
      return !!navValue;
    }
  };

  // Load palette CSS dynamically using link element
  const loadPaletteCSS = (paletteName, onLoadCallback = null) => {
    // Remove existing palette link if any
    if (paletteLinkElement) {
      paletteLinkElement.remove();
      paletteLinkElement = null;
    }

    // Create new link element for the palette
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'palette-stylesheet';

    // Use public path for both dev and production
    const baseUrl = import.meta.env.BASE_URL || '/';
    link.href = `${baseUrl}themes/${paletteName}.css`;

    // Wait for load, then set as current and check variants
    link.onload = () => {
      paletteLinkElement = link;

      // Wait a bit for CSS to be applied, then check variants
      setTimeout(() => {
        const { hasLight, hasDark } = checkPaletteVariants();

        // Auto-switch mode if only one variant is available
        if (hasLight && !hasDark) {
          // Only light variant available, switch to light
          setMode(MODES.LIGHT);
        } else if (hasDark && !hasLight) {
          // Only dark variant available, switch to dark
          setMode(MODES.DARK);
        }

        // Call callback if provided (for Header to update state)
        if (onLoadCallback) {
          onLoadCallback();
        }
      }, 100); // Delay to ensure stylesheet is fully parsed
    };

    // Handle errors - fallback to default
    link.onerror = () => {
      console.warn(`Failed to load palette "${paletteName}", using default`);
      // Try loading default as fallback
      if (paletteName !== 'default') {
        loadPaletteCSS('default', onLoadCallback);
      }
    };

    document.head.appendChild(link);
  };

  // Set theme mode
  const setMode = (mode) => {
    if (Object.values(MODES).includes(mode)) {
      currentMode = mode;
      saveToStorage(THEME_STORAGE_KEY, mode);
      applyMode();
      notifyListeners();
    }
  };

  // Get current theme mode
  const getMode = () => currentMode;

  // Get available theme modes
  const getAvailableModes = () => Object.values(MODES);

  // Set palette
  const setPalette = (paletteName, onLoadCallback = null) => {
    if (AVAILABLE_PALETTES.includes(paletteName)) {
      currentPalette = paletteName;
      saveToStorage(PALETTE_STORAGE_KEY, paletteName);
      loadPaletteCSS(paletteName, onLoadCallback);
      notifyListeners();
    }
  };

  // Get current palette
  const getPalette = () => currentPalette;

  // Get available palettes
  const getAvailablePalettes = () => AVAILABLE_PALETTES;

  // Initialize theme and palette
  const init = (onLoadCallback = null) => {
    currentMode = getStoredMode();
    currentPalette = getStoredPalette();
    applyMode();
    loadPaletteCSS(currentPalette, onLoadCallback);
  };

  // Subscribe to theme changes
  const subscribe = (callback) => {
    listeners.add(callback);
    return () => unsubscribe(callback);
  };

  // Unsubscribe from theme changes
  const unsubscribe = (callback) => {
    listeners.delete(callback);
  };

  return {
    setMode,
    getMode,
    getAvailableModes,
    setPalette,
    getPalette,
    getAvailablePalettes,
    checkPaletteVariants,
    validatePalette,
    init,
    subscribe,
    unsubscribe,
  };
};

// Export singleton instance
export const themeManager = createThemeManager();
