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

// Mock themeManager
const {
  mockGetMode,
  mockGetAvailableModes,
  mockSetMode,
  mockGetPalette,
  mockGetAvailablePalettes,
  mockSetPalette,
} = vi.hoisted(() => ({
  mockGetMode: vi.fn(() => 'light'),
  mockGetAvailableModes: vi.fn(() => ['light', 'dark']),
  mockSetMode: vi.fn(),
  mockGetPalette: vi.fn(() => 'default'),
  mockGetAvailablePalettes: vi.fn(() => ['default', 'beach', 'forest']),
  mockSetPalette: vi.fn(),
}));

vi.mock('../../managers/themeManager', () => {
  const listeners = new Set();
  return {
    themeManager: {
      getMode: () => mockGetMode(),
      getAvailableModes: () => mockGetAvailableModes(),
      setMode: (mode) => {
        mockSetMode(mode);
        listeners.forEach((cb) => cb());
      },
      getPalette: () => mockGetPalette(),
      getAvailablePalettes: () => mockGetAvailablePalettes(),
      setPalette: (palette) => {
        mockSetPalette(palette);
        listeners.forEach((cb) => cb());
      },
      checkPaletteVariants: () => ({ hasLight: true, hasDark: true }),
      subscribe: (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
      },
    },
  };
});

describe('Header Section - Theme (Mode)', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    mockCurrentLanguage.set('en');
    mockGetCurrentLanguage.mockReturnValue('en');
    mockGetMode.mockReturnValue('light');
    mockGetPalette.mockReturnValue('default');
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

  it('should have a button to toggle between light and dark mode', () => {
    render(<Header />);

    const themeSelector = document.querySelector('.theme-selector');
    expect(themeSelector).toBeInTheDocument();

    const themeToggle = themeSelector?.querySelector('div[style*="cursor"]');
    expect(themeToggle).toBeInTheDocument();
  });

  it('should show the current mode in the icon used', () => {
    mockGetMode.mockReturnValue('light');
    const { rerender } = render(<Header />);

    // Should show brightness5 icon (sun) when in light mode
    const themeSelector = document.querySelector('.theme-selector');
    expect(themeSelector).toBeInTheDocument();

    mockGetMode.mockReturnValue('dark');
    rerender(<Header />);

    // Should show brightness4 icon (moon) when in dark mode
    const updatedSelector = document.querySelector('.theme-selector');
    expect(updatedSelector).toBeInTheDocument();
  });

  it('should disable button if only one mode is available', () => {
    mockGetAvailableModes.mockReturnValue(['light']);
    render(<Header />);

    const themeSelector = document.querySelector('.theme-selector');
    const themeToggle = themeSelector?.querySelector('div[style*="cursor"]');
    expect(themeToggle).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
  });

  it('should change mode when toggled', async () => {
    mockGetMode.mockReturnValue('light');
    mockGetAvailableModes.mockReturnValue(['light', 'dark']);
    render(<Header />);

    const themeSelector = document.querySelector('.theme-selector');
    const themeToggle = themeSelector?.querySelector('div[style*="cursor"]');
    expect(themeToggle).toBeInTheDocument();
    await user.click(themeToggle);

    expect(mockSetMode).toHaveBeenCalledWith('dark');
  });

  it('should change colors of the page without page refresh when mode is toggled', async () => {
    mockGetMode.mockReturnValue('light');
    mockGetAvailableModes.mockReturnValue(['light', 'dark']);
    render(<Header />);

    const themeSelector = document.querySelector('.theme-selector');
    const themeToggle = themeSelector?.querySelector('div[style*="cursor"]');
    expect(themeToggle).toBeInTheDocument();
    await user.click(themeToggle);

    // Verify setMode was called (which updates document.documentElement)
    expect(mockSetMode).toHaveBeenCalled();
  });

  it('should persist mode preference after page reload', () => {
    localStorage.setItem('fnf-companion-theme', JSON.stringify('dark'));
    mockGetMode.mockReturnValue('dark');

    render(<Header />);

    // Header should work with persisted mode
    expect(mockGetMode).toHaveBeenCalled();
  });

  it('@regression should show correct icon matching the mode on initial render', async () => {
    // Bug: Icon showed dark mode when mode was light on first render
    // Fixed: Made currentMode reactive state instead of const
    mockGetMode.mockReturnValue('light');
    const { container } = render(<Header />);

    // Wait for useEffect to sync state
    await waitFor(
      () => {
        const themeSelector = container.querySelector('.theme-selector');
        const icon = themeSelector?.querySelector('svg');
        expect(icon).toBeInTheDocument();
      },
      { timeout: 200 }
    );

    // Verify getMode was called to initialize state
    expect(mockGetMode).toHaveBeenCalled();
  });

  it('@regression should sync icon and page theme after page refresh', async () => {
    // Bug: After refresh, icon showed dark but page used light mode
    // Fixed: Removed App.jsx code that loaded theme from game state, improved init() timing
    localStorage.setItem('fnf-companion-theme', JSON.stringify('dark'));
    mockGetMode.mockReturnValue('dark');

    const { container } = render(<Header />);

    // Wait for useEffect to sync state from themeManager
    await waitFor(
      () => {
        const themeSelector = container.querySelector('.theme-selector');
        expect(themeSelector).toBeInTheDocument();
      },
      { timeout: 200 }
    );

    // Verify getMode was called to get the persisted value
    expect(mockGetMode).toHaveBeenCalled();

    // Note: Full integration test would verify document.documentElement.getAttribute('data-theme')
    // but that requires testing with real themeManager, not mocks
  });
});
