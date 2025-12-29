import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import Header from '../../components/Header';

// Use vi.hoisted to define variables that can be used in the mock factory
const {
  mockCurrentLanguage,
  mockSetLanguage,
  mockGetAvailableLanguages,
  mockGetCurrentLanguage,
  mockT,
} = vi.hoisted(() => {
  let currentLang = 'en';
  const translations = {
    en: {
      'app.title': 'Fight & Fantasy Companion',
      'navigation.game': 'Game',
      'navigation.consumables': 'Consumables',
      'navigation.inventory': 'Inventory',
      'navigation.trail': 'Trail',
      'navigation.fight': 'Fight',
      'navigation.notes': 'Notes',
    },
    pt: {
      'app.title': 'Aventuras Fantásticas',
      'navigation.game': 'Jogo',
      'navigation.consumables': 'Consumíveis',
      'navigation.inventory': 'Inventário',
      'navigation.trail': 'Trilho',
      'navigation.fight': 'Combate',
      'navigation.notes': 'Notas',
    },
  };

  return {
    mockCurrentLanguage: {
      value: currentLang,
      set: (v) => {
        currentLang = v;
      },
    },
    mockSetLanguage: vi.fn(),
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
      setLanguage: (lang) => {
        mockCurrentLanguage.set(lang);
        mockSetLanguage(lang);
        mockGetCurrentLanguage.mockReturnValue(lang);
        const translations = {
          en: {
            'app.title': 'Fight & Fantasy Companion',
            'navigation.game': 'Game',
            'navigation.consumables': 'Consumables',
            'navigation.inventory': 'Inventory',
            'navigation.trail': 'Trail',
            'navigation.fight': 'Fight',
            'navigation.notes': 'Notes',
          },
          pt: {
            'app.title': 'Aventuras Fantásticas',
            'navigation.game': 'Jogo',
            'navigation.consumables': 'Consumíveis',
            'navigation.inventory': 'Inventário',
            'navigation.trail': 'Trilho',
            'navigation.fight': 'Combate',
            'navigation.notes': 'Notas',
          },
        };
        mockT.mockImplementation((key) => translations[lang]?.[key] || key);
      },
      t: mockT,
    },
  };
});

describe('Header - Language Menu', () => {
  let user;
  let onLanguageChangeSpy;

  beforeEach(() => {
    user = userEvent.setup();
    onLanguageChangeSpy = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
    mockCurrentLanguage.set('en');
    mockGetCurrentLanguage.mockReturnValue('en');
    mockGetAvailableLanguages.mockReturnValue(['en', 'pt']);
    const translations = {
      en: {
        'app.title': 'Fight & Fantasy Companion',
        'navigation.game': 'Game',
        'navigation.consumables': 'Consumables',
        'navigation.inventory': 'Inventory',
        'navigation.trail': 'Trail',
        'navigation.fight': 'Fight',
        'navigation.notes': 'Notes',
      },
      pt: {
        'app.title': 'Aventuras Fantásticas',
        'navigation.game': 'Jogo',
        'navigation.consumables': 'Consumíveis',
        'navigation.inventory': 'Inventário',
        'navigation.trail': 'Trilho',
        'navigation.fight': 'Combate',
        'navigation.notes': 'Notas',
      },
    };
    mockT.mockImplementation((key) => translations['en']?.[key] || key);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Language menu', () => {
    it('should show language menu when language icon is clicked', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      // Language menu should not be visible initially
      expect(screen.queryByText('English')).not.toBeInTheDocument();
      expect(screen.queryByText('Português')).not.toBeInTheDocument();

      // Find and click the language icon container
      const languageSelector = document.querySelector('.language-selector');
      expect(languageSelector).toBeInTheDocument();
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );
      expect(languageIcon).toBeInTheDocument();

      await user.click(languageIcon);

      // Menu should now be visible
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Português')).toBeInTheDocument();
      });
    });

    it('should hide language menu when language icon is clicked again', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      // Open menu
      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
      });

      // Close menu
      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.queryByText('English')).not.toBeInTheDocument();
      });
    });

    it('should show all available language options', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      await user.click(languageIcon);

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('Português')).toBeInTheDocument();
      });
    });
  });

  describe('Language selection', () => {
    it('should change the language when a language option is clicked', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      // Open menu
      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.getByText('Português')).toBeInTheDocument();
      });

      // Click Portuguese option
      const portugueseOption = screen.getByText('Português');
      await user.click(portugueseOption);

      // Verify language was changed (implementation detail check, but behavior is verified by text update test)
      expect(mockSetLanguage).toHaveBeenCalledWith('pt');
    });

    it('should notify parent component when language is selected', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      // Open menu
      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.getByText('Português')).toBeInTheDocument();
      });

      // Click Portuguese option
      const portugueseOption = screen.getByText('Português');
      await user.click(portugueseOption);

      // Should notify parent component
      expect(onLanguageChangeSpy).toHaveBeenCalledWith('pt');
    });

    it('should close language menu after selecting a language', async () => {
      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      // Open menu
      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.getByText('Português')).toBeInTheDocument();
      });

      // Click Portuguese option
      const portugueseOption = screen.getByText('Português');
      await user.click(portugueseOption);

      // Menu should be closed
      await waitFor(() => {
        expect(screen.queryByText('English')).not.toBeInTheDocument();
        expect(screen.queryByText('Português')).not.toBeInTheDocument();
      });
    });

    it('should update displayed text without a page reload', async () => {
      const { rerender } = render(
        <Header onLanguageChange={onLanguageChangeSpy} />
      );

      // Initially should show English text
      expect(screen.getByText('Game')).toBeInTheDocument();

      // Change language
      const languageSelector = document.querySelector('.language-selector');
      const languageIcon = languageSelector?.querySelector(
        'div[style*="cursor: pointer"]'
      );

      await user.click(languageIcon);
      await waitFor(() => {
        expect(screen.getByText('Português')).toBeInTheDocument();
      });

      const portugueseOption = screen.getByText('Português');
      await user.click(portugueseOption);

      // Trigger re-render to simulate parent component re-rendering after language change
      rerender(<Header onLanguageChange={onLanguageChangeSpy} />);

      // Text should update to Portuguese without page reload
      await waitFor(() => {
        expect(screen.getByText('Jogo')).toBeInTheDocument();
        expect(screen.queryByText('Game')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language persistence', () => {
    it('should persist language preference after page reload', async () => {
      // This test verifies that the Header component works with persisted language
      // The actual persistence is tested in i18nManager tests, but we verify
      // that the Header correctly displays the persisted language on mount

      // Simulate a persisted language preference
      localStorage.setItem('fnf-companion-language', JSON.stringify('pt'));

      // Mock i18nManager to return persisted language
      mockGetCurrentLanguage.mockReturnValue('pt');
      const translations = {
        pt: {
          'app.title': 'Aventuras Fantásticas',
          'navigation.game': 'Jogo',
        },
      };
      mockT.mockImplementation((key) => translations.pt?.[key] || key);

      render(<Header onLanguageChange={onLanguageChangeSpy} />);

      // Header should display text in the persisted language
      await waitFor(() => {
        expect(screen.getByText('Jogo')).toBeInTheDocument();
      });
    });
  });
});
