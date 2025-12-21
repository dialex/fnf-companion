import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import React from 'react';
import Header from '../../components/Header';
import { themeManager } from '../../managers/themeManager';
import { mdiBrightness4, mdiBrightness5 } from '@mdi/js';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    getAvailableLanguages: () => ['en', 'pt'],
    getCurrentLanguage: () => 'en',
    setLanguage: vi.fn(),
    t: (key) => key,
  },
}));

describe('Header Section - Theme (Mode) Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Initialize themeManager with default state
    themeManager.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // Reset to default
    themeManager.setMode('light');
    themeManager.setPalette('default');
  });

  it('@regression should sync icon and page theme correctly after page refresh', async () => {
    // Bug: After refresh, icon showed dark but page used light mode
    // Root cause: App.jsx was loading theme from game state, and init() timing issues
    // Fixed: Removed game state theme loading, improved init() to ensure mode is applied

    // Step 1: Set mode to dark and persist it
    await act(async () => {
      themeManager.setMode('dark');
    });

    // Verify it's persisted
    expect(localStorage.getItem('fnf-companion-theme')).toBe(
      JSON.stringify('dark')
    );

    // Verify DOM attribute is set correctly
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Step 2: Simulate page refresh - re-initialize themeManager
    // This simulates what happens when the page loads
    await act(async () => {
      themeManager.init();
    });

    // Wait a bit for init() to complete (it has setTimeout for DOM ready)
    await waitFor(
      () => {
        // Verify mode is loaded from localStorage
        expect(themeManager.getMode()).toBe('dark');

        // Verify DOM attribute is still set correctly after "refresh"
        const dataTheme = document.documentElement.getAttribute('data-theme');
        expect(dataTheme).toBe('dark');
      },
      { timeout: 200 }
    );

    // Step 3: Render Header and verify icon matches mode
    const { container } = render(<Header />);

    await waitFor(
      () => {
        const themeSelector = container.querySelector('.theme-selector');
        expect(themeSelector).toBeInTheDocument();

        // Verify the icon is rendered
        const icon = themeSelector?.querySelector('svg');
        expect(icon).toBeInTheDocument();

        // The icon should reflect dark mode (brightness4/moon icon)
        // Check the path attribute matches the expected icon for dark mode
        const pathElement = icon?.querySelector('path');
        expect(pathElement).toBeInTheDocument();
        // The path data should match mdiBrightness4 for dark mode
        const pathData = pathElement?.getAttribute('d');
        expect(pathData).toBe(mdiBrightness4);

        // Verify the component state and DOM attribute match
        expect(themeManager.getMode()).toBe('dark');
        expect(document.documentElement.getAttribute('data-theme')).toBe(
          'dark'
        );
      },
      { timeout: 200 }
    );

    // Step 4: Change to light mode and verify both update
    await act(async () => {
      themeManager.setMode('light');
    });

    await waitFor(
      () => {
        expect(themeManager.getMode()).toBe('light');
        expect(document.documentElement.getAttribute('data-theme')).toBe(
          'light'
        );

        // Verify icon updated to light mode (brightness5/sun icon)
        const themeSelector = container.querySelector('.theme-selector');
        const icon = themeSelector?.querySelector('svg');
        const pathElement = icon?.querySelector('path');
        const pathData = pathElement?.getAttribute('d');
        expect(pathData).toBe(mdiBrightness5);
      },
      { timeout: 200 }
    );
  });
});
