import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import DiceRollsSection from '../../components/DiceRollsSection';
import { createGameShowManager } from '../../managers/gameShowManager';
import { createSoundManager } from '../../managers/soundManager';
import { createI18nManager } from '../../managers/i18nManager';

describe('DiceRollsSection', () => {
  let gameShowManager;
  let mockAudio;

  beforeEach(() => {
    vi.useFakeTimers();
    // Mock Audio API
    const playMock = vi.fn().mockResolvedValue(undefined);
    global.Audio = class MockAudio {
      constructor(src) {
        this.src = src;
        this.play = playMock;
        this.pause = vi.fn();
        this.volume = 1;
      }
    };
    mockAudio = { play: playMock };

    const soundManager = createSoundManager();
    const i18nManager = createI18nManager();
    gameShowManager = createGameShowManager(soundManager, i18nManager);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Roll one die', () => {
    it('should show rolling animation when roll is in progress', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      fireEvent.click(rollDieButton);

      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(1);
    });

    it('should display single die result when roll completes', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      fireEvent.click(rollDieButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Check that rolling animation is gone
      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check that result die is displayed (should have SVG icons)
      const diceIcons = container.querySelectorAll('svg');
      expect(diceIcons.length).toBeGreaterThan(0);
    });

    it('should prevent rolling when a roll is already in progress', () => {
      render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];
      const testLuckButton = screen.getByRole('button', { name: /test luck/i });

      fireEvent.click(rollDieButton);

      // All buttons should be disabled during roll
      expect(rollDieButton).toBeDisabled();
      expect(rollDiceButton).toBeDisabled();
      expect(testLuckButton).toBeDisabled();
    });

    it('should clear previous results before starting new roll', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];

      // First roll
      fireEvent.click(rollDieButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Verify first roll completed
      let rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Second roll should clear first result and show animation
      fireEvent.click(rollDieButton);
      rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(1);
    });

    it('should keep dice result displayed until a new roll starts', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];

      // Roll dice
      fireEvent.click(rollDieButton);
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Result should be displayed
      let resultIcons = container.querySelectorAll('svg');
      expect(resultIcons.length).toBeGreaterThanOrEqual(1);

      // Advance time - result should still be there (not cleared)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Result should still be displayed until new roll starts
      resultIcons = container.querySelectorAll('svg');
      expect(resultIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Roll two dice', () => {
    it('should show rolling animation with two dice when roll is in progress', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];
      fireEvent.click(rollDiceButton);

      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should display two dice results when roll completes', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];
      fireEvent.click(rollDiceButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Check that rolling animation is gone
      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check that result dice are displayed (should have 2 SVG icons)
      const diceIcons = container.querySelectorAll('svg');
      expect(diceIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Test your luck', () => {
    it('should be enabled when canTestLuck is true', () => {
      render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeEnabled();
    });

    it('should be disabled when canTestLuck is false', () => {
      render(
        <DiceRollsSection
          canTestLuck={false}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeDisabled();
    });

    it('should be disabled when a roll is in progress', () => {
      render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });

      fireEvent.click(rollDieButton);

      expect(testLuckButton).toBeDisabled();
    });

    it('should provide dice roll results when luck test finishes', () => {
      const onTestLuckComplete = vi.fn();

      render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          onTestLuckComplete={onTestLuckComplete}
          initialExpanded={true}
        />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      fireEvent.click(testLuckButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onTestLuckComplete).toHaveBeenCalledTimes(1);

      const callArgs = onTestLuckComplete.mock.calls[0][0];
      expect(callArgs).toHaveProperty('roll1');
      expect(callArgs).toHaveProperty('roll2');
      expect(callArgs).toHaveProperty('sum');
      expect(callArgs.roll1).toBeGreaterThanOrEqual(1);
      expect(callArgs.roll1).toBeLessThanOrEqual(6);
      expect(callArgs.roll2).toBeGreaterThanOrEqual(1);
      expect(callArgs.roll2).toBeLessThanOrEqual(6);
    });

    it('should show rolling animation during luck test', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      fireEvent.click(testLuckButton);

      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should display dice results after luck test completes', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      fireEvent.click(testLuckButton);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Check that rolling animation is gone
      const rollingDice = container.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check that result dice are displayed
      const diceIcons = container.querySelectorAll('svg');
      expect(diceIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should display luck test message with proper alert styling when lucky', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      // Simulate lucky result by directly calling showLuckTestResult
      act(() => {
        gameShowManager.showLuckTestResult(true, {
          allSoundsMuted: false,
          actionSoundsEnabled: true,
        });
      });

      // Find the message element - GSM provides the styled JSX
      const messageElement = container.querySelector('.alert');
      expect(messageElement).toBeTruthy();
      expect(messageElement).toHaveClass('alert-success');
      expect(messageElement).toHaveClass('content');
      expect(messageElement).toHaveTextContent('You were lucky!');
    });

    it('should display luck test message with proper alert styling when unlucky', () => {
      const { container } = render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      // Simulate unlucky result
      act(() => {
        gameShowManager.showLuckTestResult(false, {
          allSoundsMuted: false,
          actionSoundsEnabled: true,
        });
      });

      // Find the message element - GSM provides the styled JSX
      const messageElement = container.querySelector('.alert');
      expect(messageElement).toBeTruthy();
      expect(messageElement).toHaveClass('alert-danger');
      expect(messageElement).toHaveClass('content');
      expect(messageElement).toHaveTextContent('Tough luck...');
    });
  });

  describe('Button states', () => {
    it('should enable all buttons when no roll is in progress', () => {
      render(
        <DiceRollsSection
          canTestLuck={true}
          gameShowManager={gameShowManager}
          initialExpanded={true}
        />
      );

      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];
      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });

      expect(rollDieButton).toBeEnabled();
      expect(rollDiceButton).toBeEnabled();
      expect(testLuckButton).toBeEnabled();
    });
  });
});
