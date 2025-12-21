import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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
    pt: {
      'app.title': 'Aventuras Fantásticas',
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
vi.mock('../../utils/palette', () => ({
  getCurrentPalette: vi.fn(() => 'default'),
  getAvailablePalettes: vi.fn(() => ['default']),
  setPalette: vi.fn(),
  checkPaletteVariants: vi.fn(() => ({ hasLight: true, hasDark: true })),
}));

describe('Header Section', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentLanguage.set('en');
    mockGetCurrentLanguage.mockReturnValue('en');
    const translations = {
      en: {
        'app.title': 'Fight & Fantasy Companion',
      },
    };
    mockT.mockImplementation((key) => translations['en']?.[key] || key);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should show a title', () => {
    render(<Header />);

    expect(screen.getByText('Fight & Fantasy Companion')).toBeInTheDocument();
  });

  it('should show a logo', () => {
    render(<Header />);

    const title = screen.getByText('Fight & Fantasy Companion');
    const logo = screen.getByAltText('FNF Companion');

    expect(logo).toBeInTheDocument();
    expect(title).toBeInTheDocument();

    // Verify logo is to the left of title by checking DOM order
    const header = title.closest('header');
    const titleContainer = title.closest('div');
    const logoContainer = logo.closest('div');

    // Both should be in the same container
    expect(titleContainer).toContain(logo);
    expect(titleContainer).toContain(title);

    // Logo should appear before title in DOM (to the left visually with flex)
    const container = titleContainer;
    const children = Array.from(container?.children || []);
    const logoIndex = children.findIndex((child) => child.contains(logo));
    const titleIndex = children.findIndex((child) => child.contains(title));

    expect(logoIndex).toBeLessThan(titleIndex);
  });
});
