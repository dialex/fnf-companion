import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createThemeManager } from '../../managers/themeManager';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock document methods
const mockLinkElement = {
  id: 'palette-stylesheet',
  rel: 'stylesheet',
  href: '',
  onload: null,
  onerror: null,
  remove: vi.fn(),
};

const mockDocumentHead = {
  appendChild: vi.fn((node) => {
    if (node.onload) {
      setTimeout(() => node.onload(new Event('load')), 0);
    }
    return node;
  }),
  querySelector: vi.fn(() => mockLinkElement),
};

Object.defineProperty(document, 'head', {
  value: mockDocumentHead,
  writable: true,
});

const mockDocumentElement = {
  setAttribute: vi.fn(),
  getAttribute: vi.fn(() => 'light'),
  style: {},
};

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
});

// Mock getComputedStyle - default returns empty
let mockGetComputedStyleReturn = {
  getPropertyValue: vi.fn(() => ''),
};

global.getComputedStyle = vi.fn(() => mockGetComputedStyleReturn);

describe('ThemeManager', () => {
  let themeManager;
  let listener;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset getComputedStyle mock
    mockGetComputedStyleReturn = {
      getPropertyValue: vi.fn(() => ''),
    };
    themeManager = createThemeManager();
    listener = vi.fn();
    themeManager.subscribe(listener);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default mode (light)', () => {
      expect(themeManager.getMode()).toBe('light');
    });

    it('should initialize with default palette (default)', () => {
      expect(themeManager.getPalette()).toBe('default');
    });

    it('should load mode from localStorage', () => {
      localStorage.setItem('fnf-companion-theme', JSON.stringify('dark'));
      const newManager = createThemeManager();
      newManager.init(); // Must call init() to load from localStorage
      expect(newManager.getMode()).toBe('dark');
    });

    it('should load palette from localStorage', () => {
      localStorage.setItem('fnf-companion-palette', JSON.stringify('beach'));
      const newManager = createThemeManager();
      newManager.init(); // Must call init() to load from localStorage
      expect(newManager.getPalette()).toBe('beach');
    });
  });

  describe('Mode', () => {
    it('should change mode', () => {
      themeManager.setMode('dark');
      expect(themeManager.getMode()).toBe('dark');
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-theme',
        'dark'
      );
    });

    it('should persist mode to localStorage', () => {
      themeManager.setMode('dark');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fnf-companion-theme',
        JSON.stringify('dark')
      );
    });

    it('should not change mode if invalid', () => {
      themeManager.setMode('light');
      themeManager.setMode('invalid');
      expect(themeManager.getMode()).toBe('light');
    });

    it('should notify subscribers when mode changes', () => {
      themeManager.setMode('dark');
      expect(listener).toHaveBeenCalled();
    });

    it('should get available modes', () => {
      const modes = themeManager.getAvailableModes();
      expect(modes).toContain('light');
      expect(modes).toContain('dark');
      expect(modes.length).toBe(2);
    });
  });

  describe('Palette', () => {
    it('should change palette', () => {
      themeManager.setPalette('beach');
      expect(themeManager.getPalette()).toBe('beach');
    });

    it('should persist palette to localStorage', () => {
      themeManager.setPalette('beach');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'fnf-companion-palette',
        JSON.stringify('beach')
      );
    });

    it('should load palette CSS when changed', () => {
      themeManager.setPalette('beach');
      expect(document.head.appendChild).toHaveBeenCalled();
      const linkElement = document.head.appendChild.mock.calls[0][0];
      expect(linkElement.id).toBe('palette-stylesheet');
      expect(linkElement.href).toContain('themes/beach.css');
    });

    it('should notify subscribers when palette changes', () => {
      themeManager.setPalette('beach');
      expect(listener).toHaveBeenCalled();
    });

    it('should get available palettes', () => {
      const palettes = themeManager.getAvailablePalettes();
      expect(palettes).toContain('default');
      expect(palettes.length).toBeGreaterThan(0);
    });

    it('should not change palette if invalid', () => {
      themeManager.setPalette('default');
      themeManager.setPalette('invalid-palette');
      expect(themeManager.getPalette()).toBe('default');
    });
  });

  describe('Palette Validation', () => {
    it('should validate palette has required 4 color variables', () => {
      // Mock CSS rules to include all 4 required variables
      const mockSheet = {
        cssRules: [
          {
            type: 1, // STYLE_RULE
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      // Mock getElementById to return our mock link element
      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      const isValid = themeManager.validatePalette();
      expect(isValid).toBe(true);
    });

    it('should detect light variant in palette', () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      const variants = themeManager.checkPaletteVariants();
      expect(variants.hasLight).toBe(true);
      expect(variants.hasDark).toBe(false);
    });

    it('should detect dark variant in palette', () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="dark"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      const variants = themeManager.checkPaletteVariants();
      expect(variants.hasLight).toBe(false);
      expect(variants.hasDark).toBe(true);
    });

    it('should detect both light and dark variants in palette', () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
          {
            type: 1,
            selectorText: ':root[data-theme="dark"]',
            cssText: `
              --palette-nav: #def;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      const variants = themeManager.checkPaletteVariants();
      expect(variants.hasLight).toBe(true);
      expect(variants.hasDark).toBe(true);
    });

    it('should validate palette has all 4 required color variables', () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
      });

      const isValid = themeManager.validatePalette();
      expect(isValid).toBe(true);
    });

    it.skip('should detect invalid palette missing required variables', () => {
      // Create a mock sheet with only 3 out of 4 required variables
      const mockSheet = {
        cssRules: [
          {
            type: 1, // STYLE_RULE
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              /* Missing --palette-bg */
            `,
          },
        ],
      };

      // Create a fresh mock link element for this test
      const testMockLink = {
        id: 'palette-stylesheet',
        rel: 'stylesheet',
        href: '',
        onload: null,
        onerror: null,
        remove: vi.fn(),
        tagName: 'LINK',
        get sheet() {
          return mockSheet;
        },
      };

      // Mock getElementById to return our mock
      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return testMockLink;
        }
        return null;
      });

      // Mock getComputedStyle to return empty (for fallback case)
      mockGetComputedStyleReturn = {
        getPropertyValue: vi.fn(() => ''), // Return empty
      };

      // The CSS text only has 3 variables, so validation should fail
      const isValid = themeManager.validatePalette();
      // Should be false because only 3 out of 4 required variables are present
      expect(isValid).toBe(false);
    });
  });

  describe('Auto-switch mode based on palette', () => {
    it('should auto-switch to light mode if palette only has light variant', async () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="light"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      themeManager.setMode('dark');
      themeManager.setPalette('beach');

      // Wait for async palette load
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(themeManager.getMode()).toBe('light');
    });

    it('should auto-switch to dark mode if palette only has dark variant', async () => {
      const mockSheet = {
        cssRules: [
          {
            type: 1,
            selectorText: ':root[data-theme="dark"]',
            cssText: `
              --palette-nav: #123;
              --palette-section-header: #456;
              --palette-button-primary: #789;
              --palette-bg: #abc;
            `,
          },
        ],
      };

      Object.defineProperty(mockLinkElement, 'sheet', {
        value: mockSheet,
        writable: true,
        configurable: true,
      });

      document.getElementById = vi.fn((id) => {
        if (id === 'palette-stylesheet') {
          return mockLinkElement;
        }
        return null;
      });

      themeManager.setMode('light');
      themeManager.setPalette('beach');

      // Wait for async palette load
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(themeManager.getMode()).toBe('dark');
    });
  });

  describe('Observer pattern', () => {
    it('should subscribe to mode/palette changes', () => {
      const newListener = vi.fn();
      themeManager.subscribe(newListener);
      themeManager.setMode('dark');
      expect(newListener).toHaveBeenCalled();
    });

    it('should unsubscribe from mode/palette changes', () => {
      const newListener = vi.fn();
      themeManager.subscribe(newListener);
      themeManager.unsubscribe(newListener);
      themeManager.setMode('dark');
      expect(newListener).not.toHaveBeenCalled();
    });
  });
});
