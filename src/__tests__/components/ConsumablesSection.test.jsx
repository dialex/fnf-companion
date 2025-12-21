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

    it('should purchase item when buy button is clicked', () => {
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

  describe('Potion button', () => {
    const getPotionSelect = (container) => {
      const potionLabel = screen.queryByText('Potion');
      if (!potionLabel) return null;
      const fieldGroup = potionLabel.closest('.field-group');
      return fieldGroup?.querySelector('select');
    };

    const getPotionButton = (container) => {
      const potionLabel = screen.queryByText('Potion');
      if (!potionLabel) return null;
      const fieldGroup = potionLabel.closest('.field-group');
      return fieldGroup?.querySelector('button');
    };

    it('should show potion field when stats are locked', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} />
      );

      const potionLabel = screen.getByText('Potion');
      expect(potionLabel).toBeInTheDocument();

      const potionSelect = getPotionSelect(container);
      expect(potionSelect).toBeInTheDocument();
    });

    it('should allow selecting from 3 types of potions', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} />
      );

      const potionSelect = getPotionSelect(container);
      expect(potionSelect).toBeInTheDocument();

      const options = potionSelect.querySelectorAll('option');
      expect(options.length).toBe(4);
      expect(options[0].textContent).toBe('Select potion');
      expect(options[1].textContent).toBe('Restore Skill');
      expect(options[2].textContent).toBe('Restore Health');
      expect(options[3].textContent).toBe('Restore Luck');
    });

    it('should update potion type when a potion option is selected', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} />
      );

      const potionSelect = getPotionSelect(container);
      fireEvent.change(potionSelect, { target: { value: 'skill' } });

      expect(defaultProps.onPotionTypeChange).toHaveBeenCalledWith('skill');
    });

    it('should disable drink button when no potion is selected', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} potionType="" />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).toBeDisabled();
    });

    it('should disable drink button when skill is already maxed', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="skill"
          skill="15"
          maxSkill="15"
        />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).toBeDisabled();
    });

    it('should disable drink button when health is already maxed', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="health"
          health="20"
          maxHealth="20"
        />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).toBeDisabled();
    });

    it('should disable drink button when luck is already maxed', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="luck"
          luck="12"
          maxLuck="12"
        />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).toBeDisabled();
    });

    it('should enable drink button when potion type is selected and stat is not maxed', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="skill"
          skill="10"
          maxSkill="15"
        />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).not.toBeDisabled();
    });

    it('should disable potion selection after potion is used', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="skill"
          potionUsed={true}
        />
      );

      const potionSelect = getPotionSelect(container);
      expect(potionSelect).toBeDisabled();
    });

    it('should disable drink button after potion is used', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="skill"
          potionUsed={true}
        />
      );

      const potionButton = getPotionButton(container);
      expect(potionButton).toBeDisabled();
    });

    it('should show strikethrough style on potion select when potion is used', () => {
      const { container } = render(
        <ConsumablesSection
          {...defaultProps}
          isLocked={true}
          potionType="skill"
          potionUsed={true}
        />
      );

      const potionSelect = getPotionSelect(container);
      expect(potionSelect).toHaveStyle('text-decoration: line-through');
    });
  });

  describe('User-facing text is translated', () => {
    it('should use translations for section title', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const sectionTitle = screen.getByText('Consumables');
      expect(sectionTitle).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('sections.consumables');
    });

    it('should use translations for field labels', () => {
      render(<ConsumablesSection {...defaultProps} />);

      expect(screen.getByText('Coins')).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('consumables.coins');

      expect(screen.getByText('Meals')).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('consumables.meals');

      expect(screen.getByText('Buy')).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('consumables.buy');
    });

    it('should use translations for placeholders', () => {
      render(<ConsumablesSection {...defaultProps} />);

      const textInputs = document.querySelectorAll('input[type="text"]');
      const itemInput = textInputs[0];
      expect(itemInput).toHaveAttribute('placeholder', 'Item');
      expect(mockT).toHaveBeenCalledWith('consumables.item');
    });

    it('should use translations for potion options', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} />
      );

      const potionSelect = container.querySelector('select');
      const options = potionSelect.querySelectorAll('option');

      expect(options[0].textContent).toBe('Select potion');
      expect(mockT).toHaveBeenCalledWith('consumables.potionSelect');

      expect(options[1].textContent).toBe('Restore Skill');
      expect(mockT).toHaveBeenCalledWith('consumables.potionRestoreSkill');

      expect(options[2].textContent).toBe('Restore Health');
      expect(mockT).toHaveBeenCalledWith('consumables.potionRestoreHealth');

      expect(options[3].textContent).toBe('Restore Luck');
      expect(mockT).toHaveBeenCalledWith('consumables.potionRestoreLuck');
    });

    it('should use translations for potion label when potion field is visible', () => {
      const { container } = render(
        <ConsumablesSection {...defaultProps} isLocked={true} />
      );

      expect(screen.getByText('Potion')).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('consumables.potion');
    });
  });
});
