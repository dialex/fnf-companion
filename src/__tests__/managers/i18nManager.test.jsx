import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { createI18nManager } from '../../managers/i18nManager';

describe('i18nManager', () => {
  let i18nManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    i18nManager = createI18nManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('getTranslation', () => {
    it('should return translated text for valid keys', () => {
      expect(i18nManager.getTranslation('sections.diceRolls')).toBe('Rolls');
      expect(i18nManager.getTranslation('dice.testYourLuck')).toBe('Test luck');
    });

    it('should return key if translation not found', () => {
      const result = i18nManager.getTranslation('nonexistent.key');
      expect(result).toBe('nonexistent.key');
    });

    it('should return key if path is invalid', () => {
      const result = i18nManager.getTranslation('sections.invalid.nested');
      expect(result).toBe('sections.invalid.nested');
    });
  });

  describe('setLanguage', () => {
    it('should change current language', () => {
      i18nManager.setLanguage('pt');
      const result = i18nManager.getTranslation('sections.diceRolls');
      expect(result).toBe('Lançamentos');
    });

    it('should not change language if invalid', () => {
      i18nManager.setLanguage('en');
      const originalResult = i18nManager.getTranslation('sections.diceRolls');
      i18nManager.setLanguage('invalid');
      const afterResult = i18nManager.getTranslation('sections.diceRolls');
      expect(afterResult).toBe(originalResult);
    });

    // Note: Language preference is a UI preference (like theme), not game state.
    // GameStateManager handles game state (character stats, inventory, etc.),
    // while UI preferences (language, theme) stay with their respective managers.
    it('should persist language to localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      i18nManager.setLanguage('pt');
      expect(setItemSpy).toHaveBeenCalledWith(
        'fnf-companion-language',
        JSON.stringify('pt')
      );
    });

    it('should load language from localStorage on creation', () => {
      localStorage.setItem('fnf-companion-language', JSON.stringify('pt'));
      const newManager = createI18nManager();
      expect(newManager.getCurrentLanguage()).toBe('pt');
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return English as the default language', () => {
      expect(i18nManager.getCurrentLanguage()).toBe('en');
    });

    it('should return current language after change', () => {
      i18nManager.setLanguage('pt');
      expect(i18nManager.getCurrentLanguage()).toBe('pt');
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return all available languages', () => {
      const languages = i18nManager.getAvailableLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('pt');
      expect(languages.length).toBe(2);
    });
  });

  describe('validateTranslations', () => {
    it('should return empty array when all translations are complete', () => {
      const missing = i18nManager.validateTranslations();
      expect(missing).toEqual([]);
    });

    it('should return array of missing keys', () => {
      const missing = i18nManager.validateTranslations();
      expect(Array.isArray(missing)).toBe(true);
    });
  });

  describe('t (shorthand)', () => {
    it('should work as shorthand for getTranslation', () => {
      const result = i18nManager.t('sections.diceRolls');
      expect(result).toBe('Rolls');
    });
  });

  describe('component rendering', () => {
    it('should display translated text (value) in component, not the key', () => {
      const TestComponent = ({ i18n }) => {
        return (
          <div>
            <span data-testid="lucky">{i18n.t('dice.youWereLucky')}</span>
            <span data-testid="unlucky">{i18n.t('dice.youWereUnlucky')}</span>
          </div>
        );
      };

      render(<TestComponent i18n={i18nManager} />);

      expect(screen.getByTestId('lucky')).toHaveTextContent('You were lucky!');
      expect(screen.getByTestId('unlucky')).toHaveTextContent('Tough luck...');
      expect(screen.getByTestId('lucky')).not.toHaveTextContent(
        'dice.youWereLucky'
      );
      expect(screen.getByTestId('unlucky')).not.toHaveTextContent(
        'dice.youWereUnlucky'
      );
    });

    it('should update component when language changes', () => {
      const TestComponent = ({ i18n }) => {
        return <div data-testid="text">{i18n.t('sections.diceRolls')}</div>;
      };

      const { rerender } = render(<TestComponent i18n={i18nManager} />);

      expect(screen.getByTestId('text')).toHaveTextContent('Rolls');

      i18nManager.setLanguage('pt');
      rerender(<TestComponent i18n={i18nManager} />);

      expect(screen.getByTestId('text')).toHaveTextContent('Lançamentos');
    });
  });
});
