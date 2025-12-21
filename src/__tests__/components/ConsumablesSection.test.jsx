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

  describe('Trade button', () => {
    const getBuyButton = (container) => {
      const buyLabel = screen.getByText('Buy');
      const fieldGroup = buyLabel.closest('.field-group');
      return fieldGroup?.querySelector('button');
    };

    it('should allow typing the name of an item', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const textInputs = document.querySelectorAll('input[type="text"]');
      const itemInput = textInputs[0];
      expect(itemInput).toBeInTheDocument();
      expect(itemInput).toHaveAttribute('placeholder', 'Item');

      fireEvent.change(itemInput, { target: { value: 'Sword' } });
      expect(defaultProps.onTransactionObjectChange).toHaveBeenCalledWith(
        'Sword'
      );
    });

    it('should allow typing the cost of an item', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const costInput = numberInputs[2];
      expect(costInput).toBeInTheDocument();
      expect(costInput).toHaveAttribute('placeholder', '0');

      fireEvent.change(costInput, { target: { value: '5' } });
      expect(defaultProps.onTransactionCostChange).toHaveBeenCalledWith('5');
    });

    it('should be enabled when user has enough coins', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          coins="10"
          transactionObject="Sword"
          transactionCost="5"
        />
      );

      const buyButton = getBuyButton(container);
      expect(buyButton).not.toBeDisabled();
    });

    it('should be disabled when item name is empty', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          coins="10"
          transactionObject=""
          transactionCost="5"
        />
      );

      const buyButton = getBuyButton(container);
      expect(buyButton).toBeDisabled();
    });

    it('should be disabled when cost is invalid', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          coins="10"
          transactionObject="Sword"
          transactionCost="0"
        />
      );

      const buyButton = getBuyButton(container);
      expect(buyButton).toBeDisabled();
    });

    it('should call onPurchase when buy button is clicked', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          coins="10"
          transactionObject="Sword"
          transactionCost="5"
        />
      );

      const buyButton = getBuyButton(container);
      fireEvent.click(buyButton);

      expect(defaultProps.onPurchase).toHaveBeenCalledTimes(1);
    });
  });
});
