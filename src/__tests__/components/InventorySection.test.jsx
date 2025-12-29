import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import InventorySection from '../../components/InventorySection';

// Mock i18nManager
const { mockT } = vi.hoisted(() => {
  const translations = {
    en: {
      'sections.inventory': 'Inventory',
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

describe('Inventory Section', () => {
  let user;
  const defaultProps = {
    inventory: '',
    onInventoryChange: vi.fn(),
    fieldBadges: null,
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Inventory is editable', () => {
    it('should display inventory field', () => {
      render(<InventorySection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('');
    });

    it('should allow editing the inventory items', () => {
      render(<InventorySection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      fireEvent.change(textarea, { target: { value: 'Sword\nShield' } });

      expect(defaultProps.onInventoryChange).toHaveBeenCalledWith(
        'Sword\nShield'
      );
    });

    it('should display existing inventory items', () => {
      const inventoryValue = 'Sword\nShield\nPotion';
      render(<InventorySection {...defaultProps} inventory={inventoryValue} />);

      const textarea = document.querySelector('textarea');
      expect(textarea.value).toBe(inventoryValue);
    });

    it('should update inventory when text is changed', () => {
      const { rerender } = render(
        <InventorySection {...defaultProps} inventory="Sword" />
      );

      const textarea = document.querySelector('textarea');
      expect(textarea.value).toBe('Sword');

      const newValue = 'Sword\nShield';
      fireEvent.change(textarea, { target: { value: newValue } });
      expect(defaultProps.onInventoryChange).toHaveBeenCalledWith(newValue);

      rerender(<InventorySection {...defaultProps} inventory={newValue} />);
      expect(textarea.value).toBe(newValue);
    });
  });

  describe('Inventory is saved to state', () => {
    it('should save inventory when textarea value changes', () => {
      render(<InventorySection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      fireEvent.change(textarea, { target: { value: 'New Item' } });

      expect(defaultProps.onInventoryChange).toHaveBeenCalledWith('New Item');
    });
  });

  describe('User-facing text is translated', () => {
    it('should display translated section title', () => {
      render(<InventorySection {...defaultProps} />);

      const sectionTitle = screen.getByText('Inventory');
      expect(sectionTitle).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('sections.inventory');
    });
  });
});
