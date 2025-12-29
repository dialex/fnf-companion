import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FightSection from '../../components/FightSection';
import DiceDisplay from '../../components/DiceDisplay';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => key,
  },
}));

// Mock DiceDisplay to verify props
vi.mock('../../components/DiceDisplay', () => ({
  default: ({ diceRolling, result, color }) => (
    <div
      data-testid="dice-display"
      data-dice-rolling={diceRolling}
      data-result={JSON.stringify(result)}
      data-color={color}
    >
      Dice Display
    </div>
  ),
}));

describe('Regression: Dice roll animation', () => {
  const defaultProps = {
    skill: '10',
    health: '20',
    luck: '5',
    monsterCreature: 'Goblin',
    monsterSkill: '8',
    monsterHealth: '15',
    graveyard: '',
    showUseLuck: false,
    luckUsed: false,
    isFighting: false,
    isFightStarted: false,
    fightResult: null,
    fightOutcome: null,
    heroDiceRolls: null,
    monsterDiceRolls: null,
    testLuckResult: null,
    isTestingLuck: false,
    diceRollingType: 'fight',
    fieldBadges: {},
    onMonsterCreatureChange: vi.fn(),
    onMonsterSkillChange: vi.fn(),
    onMonsterHealthChange: vi.fn(),
    onFight: vi.fn(),
    onUseLuck: vi.fn(),
    onNumberChange: vi.fn(),
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display two rolling dice when fight starts', () => {
    // This test reproduces the bug where DiceDisplay received
    // rollingType (string) instead of diceRolling (number), causing dice animation to break
    render(<FightSection {...defaultProps} />);

    const heroDiceDisplay = screen.getAllByTestId('dice-display')[0];
    const monsterDiceDisplay = screen.getAllByTestId('dice-display')[1];

    // Both hero and monster dice should receive diceRolling=2 (number), not rollingType='fight' (string)
    expect(heroDiceDisplay).toHaveAttribute('data-dice-rolling', '2');
    expect(monsterDiceDisplay).toHaveAttribute('data-dice-rolling', '2');
  });
});
