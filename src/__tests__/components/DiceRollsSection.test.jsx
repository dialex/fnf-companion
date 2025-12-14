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
      render(<DiceRollsSection {...defaultProps} diceRollingType="testSkill" />);

      // Check for rolling animation (dice icons with dice-rolling class)
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should prevent multiple dice rolls at the same time', () => {
      render(<DiceRollsSection {...defaultProps} diceRollingType="testSkill" />);

      // All dice rolling buttons should be disabled
      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      const testLuckButton = screen.getByRole('button', { name: /test luck/i });
      const rollDieButton = screen.getAllByRole('button', { name: /^roll$/i })[0];
      const rollDiceButton = screen.getAllByRole('button', { name: /^roll$/i })[1];

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

      render(<DiceRollsSection {...defaultProps} onTestYourSkill={onTestYourSkill} />);

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
});
