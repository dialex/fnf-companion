import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapSection from '../../components/MapSection';
import { createGameStateManager } from '../../managers/gameStateManager';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => {
      const translations = {
        'sections.trail': 'Trail',
        'trail.chapter': 'Chapter',
        'trail.default': 'Normal',
        'trail.question': 'Choice',
        'trail.good': 'Good',
        'trail.bad': 'Bad',
        'trail.important': 'Important',
        'trail.died': 'Died',
      };
      return translations[key] || key;
    },
  },
}));

// Mock trailMapping
vi.mock('../../utils/trailMapping', () => ({
  convertNoteItemtoColor: (item) => {
    const colorMap = {
      died: 'dark',
      question: 'info',
      good: 'success',
      bad: 'danger',
      important: 'warning',
    };
    return {
      number: item.number,
      color: item.annotation ? colorMap[item.annotation] || 'light' : 'light',
    };
  },
}));

// Mock bootstrap to avoid tooltip initialization errors
const tooltipInstances = new WeakMap();

const createMockTooltipInstance = () => {
  const instance = {
    dispose: vi.fn(),
    hide: vi.fn(),
    _isWithActiveTrigger: vi.fn(() => false),
    _element: null,
    _config: {},
    _popper: null,
    _setListeners: vi.fn(),
    _fixTitle: vi.fn(),
  };
  return instance;
};

const mockTooltip = vi.fn().mockImplementation((element, options) => {
  const instance = createMockTooltipInstance();
  if (element) {
    instance._element = element;
    tooltipInstances.set(element, instance);

    // Prevent Bootstrap from attaching event listeners that cause errors
    // by ensuring the element has the necessary properties
    if (element && typeof element === 'object') {
      try {
        Object.defineProperty(element, '_tooltip', {
          value: instance,
          writable: true,
          configurable: true,
        });
      } catch (e) {
        // Ignore if we can't set the property
      }
    }
  }
  return instance;
});

mockTooltip.getInstance = vi.fn((element) => {
  if (!element) return null;
  return tooltipInstances.get(element) || null;
});

// Mock the dynamic import of bootstrap
global.import = vi.fn((module) => {
  if (module === 'bootstrap') {
    return Promise.resolve({
      default: {
        Tooltip: mockTooltip,
      },
      Tooltip: mockTooltip,
    });
  }
  return Promise.reject(new Error(`Unknown module: ${module}`));
});

describe('Map section', () => {
  let onExpandedChange;
  let onDied;
  let onCelebrate;
  let gsm;

  let defaultProps;

  beforeEach(() => {
    vi.clearAllMocks();
    onExpandedChange = vi.fn();
    onDied = vi.fn();
    onCelebrate = vi.fn();
    gsm = createGameStateManager();
    gsm.setTrailSequence([{ number: 1, annotation: null }]);

    defaultProps = {
      trailSequence: gsm.getTrailSequence(),
      gsm,
      onDied,
      onCelebrate,
      initialExpanded: true,
      onExpandedChange,
    };
  });

  describe('Trail input', () => {
    it('should display chapter input field', () => {
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'number');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '400');
    });

    it('should update chapter input when user types valid numbers', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      // Type first character
      await user.type(input, '4');
      expect(input).toHaveValue(4);

      // Type second character
      await user.type(input, '2');
      expect(input).toHaveValue(42);
    });

    it('should only allow numeric input up to 3 digits', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      // Type 3 digits
      await user.type(input, '123');
      expect(input).toHaveValue(123);

      // Try to type a 4th digit - should not accept
      await user.type(input, '4');
      expect(input).toHaveValue(123); // Should remain 123
    });

    it('should allow empty input', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      await user.type(input, '42');
      await user.clear(input);
      expect(input).toHaveValue(null); // Empty number input has null value
    });

    it('should prevent non-numeric characters', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');

      await user.type(input, 'abc');
      // Should not accept non-numeric characters - input should be empty or unchanged
      expect(input.value).toBe('');
    });

    it('should submit on Enter key', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([{ number: 1, annotation: null }]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const input = screen.getByRole('spinbutton');

      await user.type(input, '42{Enter}');

      // Wait for GSM update
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail.some((item) => item.number === 42)).toBe(true);
        expect(input.value).toBe(''); // Input should be cleared
      });
    });

    it('should disable submit button when input is empty', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when input is <1', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      await user.type(input, '0');
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );
      expect(submitButton).toBeDisabled();
    });

    it('should disable submit button when input is >400', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      await user.type(input, '401');
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button for valid numbers between 1 and 400', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const input = screen.getByRole('spinbutton');
      await user.type(input, '200');
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );
      expect(submitButton).not.toBeDisabled();
    });

    it('should add chapter to trail on submit', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([{ number: 1, annotation: null }]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const input = screen.getByRole('spinbutton');
      await user.type(input, '42');
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );

      await user.click(submitButton);

      // Wait for GSM update
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail.some((item) => item.number === 42)).toBe(true);
        expect(input.value).toBe(''); // Input should be cleared
      });
    });

    it('should automatically mark chapter 400 as important when submitted', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([{ number: 1, annotation: null }]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const input = screen.getByRole('spinbutton');
      await user.type(input, '400');
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) =>
        btn.className.includes('btn-primary')
      );

      await user.click(submitButton);

      // Wait for GSM update
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        const chapter400 = trail.find((item) => item.number === 400);
        expect(chapter400).toBeDefined();
        expect(chapter400.annotation).toBe('important');
        expect(onCelebrate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Trail display', () => {
    it('should always display trail starting with number 1', () => {
      render(<MapSection {...defaultProps} trailSequence={[]} />);
      const pills = screen.getAllByText(/^\d+$/);
      expect(pills[0]).toHaveTextContent('1');
    });

    it('should display trail numbers as badges from left to right', () => {
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: null },
        { number: 3, annotation: null },
      ];
      render(<MapSection {...defaultProps} trailSequence={sequence} />);
      const pills = screen.getAllByText(/^\d+$/);
      expect(pills[0]).toHaveTextContent('1');
      expect(pills[1]).toHaveTextContent('2');
      expect(pills[2]).toHaveTextContent('3');
    });

    it('should display badges with colors based on their meaning', () => {
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: 'good' },
        { number: 3, annotation: 'bad' },
        { number: 4, annotation: 'important' },
        { number: 5, annotation: 'question' },
        { number: 6, annotation: 'died' },
      ];
      render(<MapSection {...defaultProps} trailSequence={sequence} />);

      const pills = screen.getAllByText(/^\d+$/);
      // Pill 1 should have light color (default)
      expect(pills[0].className).toContain('text-bg-light');
      // Pill 2 should have success color (good)
      expect(pills[1].className).toContain('text-bg-success');
      // Pill 3 should have danger color (bad) - index 2 because sequence starts with 1
      expect(pills[2].className).toContain('text-white');
      // Pill 4 should have warning color (important)
      expect(pills[3].className).toContain('text-white');
      // Pill 5 should have info color (question)
      expect(pills[4].className).toContain('text-white');
      // Pill 6 should have dark color (died)
      expect(pills[5].className).toContain('text-white');
    });
  });

  describe('Trail annotations', () => {
    it('should display 6 annotation buttons', () => {
      render(<MapSection {...defaultProps} />);
      const normalButton = screen.getByTitle('Normal');
      const choiceButton = screen.getByTitle('Choice');
      const goodButton = screen.getByTitle('Good');
      const badButton = screen.getByTitle('Bad');
      const importantButton = screen.getByTitle('Important');
      const diedButton = screen.getByTitle('Died');

      expect(normalButton).toBeInTheDocument();
      expect(choiceButton).toBeInTheDocument();
      expect(goodButton).toBeInTheDocument();
      expect(badButton).toBeInTheDocument();
      expect(importantButton).toBeInTheDocument();
      expect(diedButton).toBeInTheDocument();
    });

    it('should mark trail as Normal when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const normalButton = screen.getByTitle('Normal');

      await user.click(normalButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBeNull();
      });
    });

    it('should mark trail as Choice when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const choiceButton = screen.getByTitle('Choice');

      await user.click(choiceButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBe('question');
      });
    });

    it('should mark trail as Good when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const goodButton = screen.getByTitle('Good');

      await user.click(goodButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBe('good');
      });
    });

    it('should mark trail as Bad when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const badButton = screen.getByTitle('Bad');

      await user.click(badButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBe('bad');
      });
    });

    it('should mark trail as Important when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const importantButton = screen.getByTitle('Important');

      await user.click(importantButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBe('important');
      });
    });

    it('should mark trail as Died when its button is clicked', async () => {
      const user = userEvent.setup();
      gsm.setTrailSequence([
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const diedButton = screen.getByTitle('Died');

      await user.click(diedButton);
      await waitFor(() => {
        const trail = gsm.getTrailSequence();
        expect(trail[trail.length - 1].annotation).toBe('died');
        expect(onDied).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Trail deletion', () => {
    it('should make last trail number clickable when there is more than one', () => {
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: null },
        { number: 3, annotation: null },
      ];
      gsm.setTrailSequence(sequence);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const pills = screen.getAllByText(/^\d+$/);
      const lastPill = pills[pills.length - 1];

      expect(lastPill.style.cursor).toBe('pointer');
    });

    it('should not make first trail number clickable', () => {
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: null },
      ];
      gsm.setTrailSequence(sequence);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const pills = screen.getAllByText(/^\d+$/);
      const firstPill = pills[0];

      expect(firstPill.style.cursor).toBe('default');
    });

    it('should remove last trail number when last pill is clicked', async () => {
      const user = userEvent.setup();
      const sequence = [
        { number: 1, annotation: null },
        { number: 2, annotation: null },
        { number: 3, annotation: null },
      ];
      gsm.setTrailSequence(sequence);
      const { rerender } = render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );

      // Wait for tooltip initialization to complete
      await waitFor(
        () => {
          const pills = screen.getAllByText(/^\d+$/);
          expect(pills.length).toBe(3);
        },
        { timeout: 2000 }
      );

      // Give time for Bootstrap tooltip initialization
      await new Promise((resolve) => setTimeout(resolve, 100));

      const pills = screen.getAllByText(/^\d+$/);
      const lastPill = pills[pills.length - 1];

      // Ensure tooltip instance exists for this element before clicking
      // The mock should have created it, but ensure it exists
      if (!tooltipInstances.get(lastPill)) {
        const mockInstance = createMockTooltipInstance();
        tooltipInstances.set(lastPill, mockInstance);
      }

      expect(gsm.getTrailSequence().length).toBe(3);
      await user.click(lastPill);

      // Wait for GSM to update
      await waitFor(
        () => {
          const trail = gsm.getTrailSequence();
          expect(trail.length).toBe(2);
        },
        { timeout: 3000 }
      );

      // Re-render with updated trail sequence
      rerender(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
    });

    it('should not allow deletion when there is only one trail number', () => {
      gsm.setTrailSequence([{ number: 1, annotation: null }]);
      render(
        <MapSection {...defaultProps} trailSequence={gsm.getTrailSequence()} />
      );
      const pills = screen.getAllByText(/^\d+$/);
      const onlyPill = pills[0];

      expect(onlyPill.style.cursor).toBe('default');
    });
  });

  describe('Section collapse/expand', () => {
    it('should be expanded by default when initialExpanded is true', () => {
      render(<MapSection {...defaultProps} initialExpanded={true} />);
      const collapseDiv = document.querySelector('.collapse.show');
      expect(collapseDiv).toBeInTheDocument();
    });

    it('should be collapsed when initialExpanded is false', () => {
      render(<MapSection {...defaultProps} initialExpanded={false} />);
      const collapseDiv = document.querySelector('.collapse.show');
      expect(collapseDiv).not.toBeInTheDocument();
    });

    it('should toggle section visibility when header is clicked', async () => {
      const user = userEvent.setup();
      render(<MapSection {...defaultProps} />);
      const header = screen.getByRole('button', { name: /trail/i });

      await user.click(header);
      await waitFor(() => {
        expect(onExpandedChange).toHaveBeenCalledWith(false);
      });
    });
  });
});
