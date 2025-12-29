import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ConfirmationDialog from '../../components/ConfirmationDialog';

// Mock i18nManager
const { mockT } = vi.hoisted(() => {
  const translations = {
    en: {
      'dialog.yes': 'Yes',
      'dialog.no': 'No',
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

describe('Confirmation dialog', () => {
  let user;
  const defaultProps = {
    message: 'Are you sure?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Message', () => {
    it('should display a message', () => {
      const customMessage = 'Do you want to delete this item?';
      render(<ConfirmationDialog {...defaultProps} message={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render as a modal dialog', () => {
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      const modal = container.querySelector('.modal');
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveClass('fade', 'show');
      expect(modal).toHaveAttribute('role', 'dialog');
    });
  });

  describe('Buttons', () => {
    it('should confirm action when confirm button is clicked', async () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Yes' });
      await user.click(confirmButton);

      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should cancel action when cancel is clicked', async () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: 'No' });
      await user.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should display buttons with the correct colors', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: 'Yes' });
      const cancelButton = screen.getByRole('button', { name: 'No' });

      expect(confirmButton).toHaveClass('btn', 'btn-danger');
      expect(cancelButton).toHaveClass('btn', 'btn-primary');
    });
  });

  describe('All player-facing text is translated', () => {
    it('should display translated buttons', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('dialog.yes');
      expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('dialog.no');
    });
  });
});
