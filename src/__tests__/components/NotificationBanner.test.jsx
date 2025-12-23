import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NotificationBanner from '../../components/NotificationBanner';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => key,
  },
}));

describe('Notification Banner', () => {
  let user;
  const defaultProps = {
    message: 'Game saved',
    type: 'success',
    onDismiss: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Displays messages', () => {
    it('should display a custom message', () => {
      render(
        <NotificationBanner
          {...defaultProps}
          message="Game loaded successfully"
        />
      );

      expect(screen.getByText('Game loaded successfully')).toBeInTheDocument();
    });

    it('should render using a custom style', () => {
      const { container } = render(
        <NotificationBanner {...defaultProps} type="success" />
      );

      const alert = container.querySelector('.alert');
      expect(alert).toHaveClass('alert-success');
    });
  });

  describe('Can be dismissed', () => {
    it('should dismiss when close button is clicked', () => {
      render(<NotificationBanner {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });

      act(() => {
        fireEvent.click(closeButton);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after 3 seconds', () => {
      render(<NotificationBanner {...defaultProps} />);

      expect(defaultProps.onDismiss).not.toHaveBeenCalled();

      // Fast-forward 3 seconds
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not auto-dismiss if manually closed before timeout', () => {
      render(<NotificationBanner {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: 'Close' });

      // Click the close button
      act(() => {
        fireEvent.click(closeButton);
      });

      expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);

      // Clear the mock to reset call count
      vi.clearAllMocks();

      // Fast-forward past the 3 second timeout
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      // Should not be called again since we already dismissed
      expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    });

    it('should clear timeout when component unmounts', () => {
      const { unmount } = render(<NotificationBanner {...defaultProps} />);

      unmount();

      // Fast-forward past the 3 second timeout
      vi.advanceTimersByTime(3000);

      // Should not be called after unmount
      expect(defaultProps.onDismiss).not.toHaveBeenCalled();
    });
  });
});
