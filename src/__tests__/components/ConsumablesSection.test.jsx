import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ConsumablesSection from '../../components/ConsumablesSection';

// Mock i18nManager
const { mockT } = vi.hoisted(() => {
  const translations = {
    en: {
      'sections.consumables': 'Consumables',
      'consumables.coins': 'Coins',
      'consumables.meals': 'Meals',
      'consumables.buy': 'Buy',
      'consumables.item': 'Item',
      'consumables.potion': 'Potion',
      'consumables.potionSelect': 'Select potion',
      'consumables.potionRestoreSkill': 'Restore Skill',
      'consumables.potionRestoreHealth': 'Restore Health',
      'consumables.potionRestoreLuck': 'Restore Luck',
    },
  };

  return {
    mockT: vi.fn((key) => translations.en[key] || key),
  };
});

vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: mockT,
  },
}));

describe('Consumables Section', () => {
  let user;
  const defaultProps = {
    coins: '0',
    meals: '10',
    health: '20',
    maxHealth: null,
    skill: '10',
    maxSkill: null,
    luck: '8',
    maxLuck: null,
    transactionObject: '',
    transactionCost: '',
    fieldBadges: null,
    isLocked: false,
    potionType: '',
    potionUsed: false,
    onCoinsChange: vi.fn(),
    onMealsChange: vi.fn(),
    onTransactionObjectChange: vi.fn(),
    onTransactionCostChange: vi.fn(),
    onConsumeMeal: vi.fn(),
    onPurchase: vi.fn(),
    onPotionTypeChange: vi.fn(),
    onConsumePotion: vi.fn(),
    onNumberChange: vi.fn((setter, value) => {
      setter(value);
    }),
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Coins field', () => {
    it('should display coins input with default value of 0', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const coinsLabel = screen.getByText('Coins');
      expect(coinsLabel).toBeInTheDocument();

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const coinsInput = numberInputs[0];
      expect(coinsInput).toBeInTheDocument();
      expect(coinsInput).toHaveValue(0);
    });

    it('should allow updating coins value', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const coinsInput = numberInputs[0];
      fireEvent.change(coinsInput, { target: { value: '50' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalledWith(
        defaultProps.onCoinsChange,
        '50'
      );
    });
  });

  describe('Meals field', () => {
    it('should display meals input with default value of 10', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const mealsLabel = screen.getByText('Meals');
      expect(mealsLabel).toBeInTheDocument();

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const mealsInput = numberInputs[1];
      expect(mealsInput).toBeInTheDocument();
      expect(mealsInput).toHaveValue(10);
    });

    it('should allow updating meals value', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const mealsInput = numberInputs[1];
      fireEvent.change(mealsInput, { target: { value: '5' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalledWith(
        defaultProps.onMealsChange,
        '5'
      );
    });
  });
});
