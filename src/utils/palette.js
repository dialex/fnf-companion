import { getFromStorage, saveToStorage } from './localStorage';

const PALETTE_STORAGE_KEY = 'fnf-companion-palette';

// Dynamically discover all theme files in the themes folder
// This uses Vite's import.meta.glob to automatically find all CSS files
const themeModules = import.meta.glob('../styles/themes/*.css', { eager: false });
const AVAILABLE_PALETTES = Object.keys(themeModules)
  .map((path) => {
    // Extract filename from path like '../styles/themes/default.css'
    const match = path.match(/\/([^/]+)\.css$/);
    return match ? match[1] : null;
  })
  .filter((name) => name !== null)
  .sort(); // Sort alphabetically

export { AVAILABLE_PALETTES };

// Get stored palette from localStorage or default to 'default'
const getStoredPalette = () => {
  try {
    const stored = getFromStorage(PALETTE_STORAGE_KEY, 'default');
    if (stored && AVAILABLE_PALETTES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('Error reading palette from storage:', error);
  }
  return 'default';
};

let currentPalette = getStoredPalette();
let paletteLinkElement = null;

// Load palette CSS dynamically using link element
const loadPaletteCSS = (paletteName) => {
  // Remove existing palette link if any
  if (paletteLinkElement) {
    paletteLinkElement.remove();
    paletteLinkElement = null;
  }

  // Create new link element for the palette
  // In Vite, CSS files in src/ are handled by the dev server
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  // Use absolute path from base URL
  const baseUrl = import.meta.env.BASE_URL || '/';
  link.href = `${baseUrl}src/styles/themes/${paletteName}.css`;
  link.id = 'palette-stylesheet';

  // Wait for load, then set as current
  link.onload = () => {
    paletteLinkElement = link;
  };

  // Handle errors
  link.onerror = () => {
    console.warn(`Failed to load palette "${paletteName}", using default`);
    // Try loading default as fallback
    if (paletteName !== 'default') {
      loadPaletteCSS('default');
    }
  };

  document.head.appendChild(link);
};

// Apply palette
export const applyPalette = (paletteName = null) => {
  const paletteToApply = paletteName || currentPalette;

  if (!AVAILABLE_PALETTES.includes(paletteToApply)) {
    console.warn(`Palette "${paletteToApply}" not found, using default`);
    loadPaletteCSS('default');
    return;
  }

  loadPaletteCSS(paletteToApply);
};

// Set palette preference
export const setPalette = (paletteName) => {
  if (AVAILABLE_PALETTES.includes(paletteName)) {
    currentPalette = paletteName;
    saveToStorage(PALETTE_STORAGE_KEY, paletteName);
    applyPalette(paletteName);
  }
};

// Get current palette preference
export const getCurrentPalette = () => currentPalette;

// Get available palettes
export const getAvailablePalettes = () => AVAILABLE_PALETTES;

// Initialize palette on load
export const initPalette = () => {
  currentPalette = getStoredPalette();
  applyPalette();
};
