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

    it('should be enabled when conditions are met', () => {
      render(<DiceRollsSection {...defaultProps} />);

      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      expect(testSkillButton).toBeEnabled();
    });

    it('should be disabled when skill is 0', () => {
      render(<DiceRollsSection {...defaultProps} skill="0" />);

      const testSkillButton = screen.getByRole('button', {
        name: /test skill/i,
      });
      expect(testSkillButton).toBeDisabled();
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

    it('should be enabled when conditions are met', () => {
      render(<DiceRollsSection {...defaultProps} />);

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeEnabled();
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

    it('should be disabled when luck is 0', () => {
      render(<DiceRollsSection {...defaultProps} luck="0" />);

      const testLuckButton = screen.getByRole('button', {
        name: /test luck/i,
      });
      expect(testLuckButton).toBeDisabled();
    });
  });

  describe('Roll die', () => {
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
      onTestYourLuck: vi.fn(),
      onTestYourSkill: vi.fn(),
      onRollDie: vi.fn(),
      onRollDice: vi.fn(),
      initialExpanded: true,
      onExpandedChange: vi.fn(),
    };

    it('should show rolling animation with single die when roll is in progress', () => {
      render(<DiceRollsSection {...defaultProps} diceRollingType="rollDie" />);

      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(1);
    });

    it('should display single die result when roll completes', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          rollDieResult={4}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check that result die is displayed (using getDiceIcon which returns an icon path)
      const diceIcons = document.querySelectorAll('svg');
      expect(diceIcons.length).toBeGreaterThan(0);
    });

    it('should start roll die when button is clicked', () => {
      const onRollDie = vi.fn();

      render(<DiceRollsSection {...defaultProps} onRollDie={onRollDie} />);

      const rollDieButtons = screen.getAllByRole('button', {
        name: /^roll$/i,
      });
      const rollDieButton = rollDieButtons[0];
      fireEvent.click(rollDieButton);

      expect(onRollDie).toHaveBeenCalledTimes(1);
    });
  });

  describe('Roll dice', () => {
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
      onTestYourLuck: vi.fn(),
      onTestYourSkill: vi.fn(),
      onRollDie: vi.fn(),
      onRollDice: vi.fn(),
      initialExpanded: true,
      onExpandedChange: vi.fn(),
    };

    it('should show rolling animation with two dice when roll is in progress', () => {
      render(<DiceRollsSection {...defaultProps} diceRollingType="rollDice" />);

      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(2);
    });

    it('should display two dice results when roll completes', () => {
      render(
        <DiceRollsSection
          {...defaultProps}
          diceRollingType={null}
          rollDiceResults={[3, 5]}
        />
      );

      // Check that rolling animation is not shown
      const rollingDice = document.querySelectorAll('.dice-rolling');
      expect(rollingDice.length).toBe(0);

      // Check that result dice are displayed
      const diceIcons = document.querySelectorAll('svg');
      expect(diceIcons.length).toBeGreaterThanOrEqual(2);
    });

    it('should start roll dice when button is clicked', () => {
      const onRollDice = vi.fn();

      render(<DiceRollsSection {...defaultProps} onRollDice={onRollDice} />);

      const rollDiceButtons = screen.getAllByRole('button', {
        name: /^roll$/i,
      });
      const rollDiceButton = rollDiceButtons[1];
      fireEvent.click(rollDiceButton);

      expect(onRollDice).toHaveBeenCalledTimes(1);
    });
  });
});
