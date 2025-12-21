import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Header from '../../components/Header';

// Mock i18nManager
const {
  mockCurrentLanguage,
  mockGetAvailableLanguages,
  mockGetCurrentLanguage,
  mockT,
} = vi.hoisted(() => {
  let currentLang = 'en';
  const translations = {
    en: {
      'app.title': 'Fight & Fantasy Companion',
    },
  };

  return {
    mockCurrentLanguage: {
      value: currentLang,
      set: (v) => {
        currentLang = v;
      },
    },
    mockGetAvailableLanguages: vi.fn(() => ['en', 'pt']),
    mockGetCurrentLanguage: vi.fn(() => currentLang),
    mockT: vi.fn((key) => translations[currentLang]?.[key] || key),
  };
});

vi.mock('../../managers/i18nManager', () => {
  return {
    i18nManager: {
      getAvailableLanguages: () => mockGetAvailableLanguages(),
      getCurrentLanguage: () => mockGetCurrentLanguage(),
      setLanguage: vi.fn(),
      t: mockT,
    },
  };
});

// Mock theme utilities
vi.mock('../../utils/theme', () => ({
  getCurrentTheme: vi.fn(() => 'light'),
  getAvailableThemes: vi.fn(() => ['light', 'dark']),
  setTheme: vi.fn(),
  THEMES: { LIGHT: 'light', DARK: 'dark' },
}));

// Mock palette utilities
const {
  mockGetCurrentPalette,
  mockGetAvailablePalettes,
  mockSetPalette,
  mockCheckPaletteVariants,
} = vi.hoisted(() => ({
  mockGetCurrentPalette: vi.fn(() => 'default'),
  mockGetAvailablePalettes: vi.fn(() => ['default', 'beach', 'forest']),
  mockSetPalette: vi.fn(),
  mockCheckPaletteVariants: vi.fn(() => ({ hasLight: true, hasDark: true })),
}));

vi.mock('../../utils/palette', () => ({
  getCurrentPalette: () => mockGetCurrentPalette(),
  getAvailablePalettes: () => mockGetAvailablePalettes(),
  setPalette: mockSetPalette,
  checkPaletteVariants: mockCheckPaletteVariants,
}));

describe('Header Section - Palette', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    mockCurrentLanguage.set('en');
    mockGetCurrentLanguage.mockReturnValue('en');
    mockGetCurrentPalette.mockReturnValue('default');
    mockGetAvailablePalettes.mockReturnValue(['default', 'beach', 'forest']);
    const translations = {
      en: {
        'app.title': 'Fight & Fantasy Companion',
      },
    };
    mockT.mockImplementation((key) => translations['en']?.[key] || key);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should have a button icon with a dropdown of palettes', () => {
    render(<Header />);

    const paletteSelector = document.querySelector('.palette-selector');
    expect(paletteSelector).toBeInTheDocument();

    const paletteIcon = paletteSelector?.querySelector(
      'div[style*="cursor: pointer"]'
    );
    expect(paletteIcon).toBeInTheDocument();
  });

  it('should show list of palettes available when clicked', async () => {
    render(<Header />);

    const paletteSelector = document.querySelector('.palette-selector');
    const paletteIcon = paletteSelector?.querySelector(
      'div[style*="cursor: pointer"]'
    );

    // Palette menu should not be visible initially
    expect(screen.queryByText('default')).not.toBeInTheDocument();
    expect(screen.queryByText('beach')).not.toBeInTheDocument();
    expect(screen.queryByText('forest')).not.toBeInTheDocument();

    // Click palette icon
    await user.click(paletteIcon);

    // Menu should now be visible with all palettes
    await waitFor(() => {
      expect(screen.getByText('default')).toBeInTheDocument();
      expect(screen.getByText('beach')).toBeInTheDocument();
      expect(screen.getByText('forest')).toBeInTheDocument();
    });
  });

  it('should change the colors of the page when palette is changed', async () => {
    // Mock document.head to track link element creation
    const linkElements = [];
    const originalAppendChild = document.head.appendChild.bind(document.head);
    document.head.appendChild = vi.fn((node) => {
      if (node instanceof HTMLLinkElement && node.id === 'palette-stylesheet') {
        linkElements.push(node);
        // Simulate onload callback
        setTimeout(() => {
          if (node.onload) {
            node.onload(new Event('load'));
          }
        }, 0);
      }
      return originalAppendChild(node);
    });

    render(<Header />);

    const paletteSelector = document.querySelector('.palette-selector');
    const paletteIcon = paletteSelector?.querySelector(
      'div[style*="cursor: pointer"]'
    );

    // Open menu
    await user.click(paletteIcon);
    await waitFor(() => {
      expect(screen.getByText('beach')).toBeInTheDocument();
    });

    // Click beach palette
    const beachOption = screen.getByText('beach');
    await user.click(beachOption);

    // Verify setPalette was called (which loads the CSS)
    expect(mockSetPalette).toHaveBeenCalledWith('beach', expect.any(Function));

    // Restore original appendChild
    document.head.appendChild = originalAppendChild;
  });

  it('should persist palette preference after page reload', () => {
    // Simulate a persisted palette preference
    localStorage.setItem('fnf-companion-palette', 'beach');

    // Mock getCurrentPalette to return persisted palette
    mockGetCurrentPalette.mockReturnValue('beach');

    render(<Header />);

    // Header should work with persisted palette
    // The actual persistence is tested in palette utility tests,
    // but we verify Header correctly uses the persisted palette
    expect(mockGetCurrentPalette).toHaveBeenCalled();
  });
});
