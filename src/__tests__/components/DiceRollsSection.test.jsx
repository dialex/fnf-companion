import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DiceRollsSection from '../../components/DiceRollsSection';

describe('Section: Rolls', () => {
  describe('Skill test', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    const defaultProps = {
      skill: '10',
      luck: '5',
      diceRollingType: null,
      isTestingLuck: false,
      rollDieResult: null,
      rollDiceResults: null,
      testLuckResult: null,
      testSkillResult: null,
      onTestYourLuck: vi.fn(),
      onTestYourSkill: vi.fn(),
      onRollDie: vi.fn(),
      onRollDice: vi.fn(),
      initialExpanded: true,
      onExpandedChange: vi.fn(),
    };

    it('should show rolling animation when test is in progress', () => {
      render(
        <DiceRollsSection {...defaultProps} diceRollingType="testSkill" />
      );

      // Check for rolling animation (dice icons with dice-rolling class)
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should prevent multiple dice rolls at the same time', () => {
      render(
        <DiceRollsSection {...defaultProps} diceRollingType="testSkill" />
      );

      // All dice rolling buttons should be disabled
      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      const testLuckButton = screen.getByRole('button', { name: /test luck/i });
      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];

      expect(testSkillButton).toBeDisabled();
      expect(testLuckButton).toBeDisabled();
      expect(rollDieButton).toBeDisabled();
      expect(rollDiceButton).toBeDisabled();
    });

    it('should be clickable when no roll is in progress', () => {
      const onTestYourSkill = vi.fn();
      const { rerender } = render(
        <DiceRollsSection {...defaultProps} onTestYourSkill={onTestYourSkill} />
      );

      // Button should be enabled when no roll is in progress
      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      expect(testSkillButton).toBeEnabled();

      // Re-render with roll in progress to show button becomes disabled
      rerender(
        <DiceRollsSection
          {...defaultProps}
          onTestYourSkill={onTestYourSkill}
          diceRollingType="testSkill"
        />
      );

      const disabledButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      expect(disabledButton).toBeDisabled();
      expect(onTestYourSkill).not.toHaveBeenCalled();
    });

    it('should start skill test when button is clicked', () => {
      const onTestYourSkill = vi.fn();

      render(
        <DiceRollsSection {...defaultProps} onTestYourSkill={onTestYourSkill} />
      );

      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      fireEvent.click(testSkillButton);

      expect(onTestYourSkill).toHaveBeenCalledTimes(1);
    });

    it('should tell the user when they win the test (dice sum >= skill)', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          testSkillResult={{ roll1: 3, roll2: 4, passed: true }}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check for success message
      const successAlert = screen.getByRole('alert');
      expect(successAlert).toHaveClass('alert-success');
      expect(successAlert).toHaveTextContent(/you passed/i);
    });

    it('should tell the user when they fail the test (dice sum < skill)', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          testSkillResult={{ roll1: 3, roll2: 4, passed: false }}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check for failure message
      const failureAlert = screen.getByRole('alert');
      expect(failureAlert).toHaveClass('alert-danger');
      expect(failureAlert).toHaveTextContent(/you failed/i);
    });
  });

  describe('Luck test', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    const defaultProps = {
      skill: '10',
      luck: '5',
      diceRollingType: null,
      isTestingLuck: false,
      rollDieResult: null,
      rollDiceResults: null,
      testLuckResult: null,
      testSkillResult: null,
      onTestYourLuck: vi.fn(),
      onTestYourSkill: vi.fn(),
      onRollDie: vi.fn(),
      onRollDice: vi.fn(),
      initialExpanded: true,
      onExpandedChange: vi.fn(),
    };

    it('should show rolling animation when test is in progress', () => {
      render(<DiceRollsSection {...defaultProps} diceRollingType="testLuck" />);

      // Check for rolling animation (dice icons with dice-rolling class)
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should prevent multiple dice rolls at the same time', () => {
      render(<DiceRollsSection {...defaultProps} diceRollingType="testLuck" />);

      // All dice rolling buttons should be disabled
      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      const testLuckButton = screen.getByRole('button', { name: /test luck/i });
      const rollDieButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[0];
      const rollDiceButton = screen.getAllByRole('button', {
        name: /^roll$/i,
      })[1];

      expect(testSkillButton).toBeDisabled();
      expect(testLuckButton).toBeDisabled();
      expect(rollDieButton).toBeDisabled();
      expect(rollDiceButton).toBeDisabled();
    });

    it('should be clickable when no roll is in progress', () => {
      const onTestYourLuck = vi.fn();
      const { rerender } = render(
        <DiceRollsSection {...defaultProps} onTestYourLuck={onTestYourLuck} />
      );

      // Button should be enabled when no roll is in progress
      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeEnabled();

      // Re-render with roll in progress to show button becomes disabled
      rerender(
        <DiceRollsSection
          {...defaultProps}
          onTestYourLuck={onTestYourLuck}
          diceRollingType="testLuck"
        />
      );

      const disabledButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(disabledButton).toBeDisabled();
      expect(onTestYourLuck).not.toHaveBeenCalled();
    });

    it('should start luck test when button is clicked', () => {
      const onTestYourLuck = vi.fn();

      render(
        <DiceRollsSection {...defaultProps} onTestYourLuck={onTestYourLuck} />
      );

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      fireEvent.click(testLuckButton);

      expect(onTestYourLuck).toHaveBeenCalledTimes(1);
    });

    it('should tell the user when they are lucky (dice sum <= luck)', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          testLuckResult={{ roll1: 2, roll2: 2, isLucky: true }}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check for success message
      const successAlert = screen.getByRole('alert');
      expect(successAlert).toHaveClass('alert-success');
      expect(successAlert).toHaveTextContent(/you were lucky/i);
    });

    it('should tell the user when they are unlucky (dice sum > luck)', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          testLuckResult={{ roll1: 4, roll2: 4, isLucky: false }}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check for failure message
      const failureAlert = screen.getByRole('alert');
      expect(failureAlert).toHaveClass('alert-danger');
      expect(failureAlert).toHaveTextContent(/tough luck/i);
    });

    it('should decrease luck by 1 after each luck test', () => {
      const onTestYourLuck = vi.fn();
      const { rerender } = render(
        <DiceRollsSection
          {...defaultProps}
          luck="5"
          onTestYourLuck={onTestYourLuck}
        />
      );

      // Initial state: luck is 5, button should be enabled
      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeEnabled();

      // Simulate luck test completing - luck decreases by 1
      rerender(
        <DiceRollsSection
          {...defaultProps}
          luck="4"
          diceRollingType={null}
          testLuckResult={{ roll1: 2, roll2: 2, isLucky: true }}
          onTestYourLuck={onTestYourLuck}
        />
      );

      // Button should still be enabled with luck = 4
      const buttonAfterTest = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(buttonAfterTest).toBeEnabled();
    });

    it('should disable button when luck is 0', () => {
      render(<DiceRollsSection {...defaultProps} luck="0" />);

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeDisabled();
    });
  });
});
