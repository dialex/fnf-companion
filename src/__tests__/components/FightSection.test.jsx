import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FightSection from '../../components/FightSection';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => key, // Just return the key for simplicity
  },
}));

// Mock DiceDisplay
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

describe('FightSection', () => {
  const defaultProps = {
    // Hero stats
    skill: '10',
    health: '20',
    luck: '5',
    // Monster stats
    monsterCreature: '',
    monsterSkill: '',
    monsterHealth: '',
    // Fight state
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
    diceRollingType: null,
    fieldBadges: {},
    // Callbacks
    onMonsterCreatureChange: vi.fn(),
    onMonsterSkillChange: vi.fn(),
    onMonsterHealthChange: vi.fn(),
    onFight: vi.fn(),
    onUseLuck: vi.fn(),
    onNumberChange: vi.fn((setter, value) => setter(value)),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should display hero stats correctly', () => {
      render(<FightSection {...defaultProps} />);

      const inputs = screen.getAllByRole('spinbutton');
      const luckInput = inputs.find((input) => input.value === '5');
      const skillInput = inputs.find((input) => input.value === '10');
      const healthInput = inputs.find((input) => input.value === '20');

      expect(luckInput).toBeInTheDocument();
      expect(skillInput).toBeInTheDocument();
      expect(healthInput).toBeInTheDocument();
    });

    it('should display monster stats correctly', () => {
      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
        />
      );

      // Find creature input by placeholder
      expect(
        screen.getByPlaceholderText('fight.creaturePlaceholder')
      ).toHaveValue('Goblin');
      const inputs = screen.getAllByRole('spinbutton');
      const monsterInputs = inputs.filter((input) => !input.disabled);
      expect(monsterInputs.some((input) => input.value === '8')).toBe(true);
      expect(monsterInputs.some((input) => input.value === '15')).toBe(true);
    });

    it('should display graveyard correctly', () => {
      render(
        <FightSection
          {...defaultProps}
          graveyard="Defeated Goblin\nDefeated Orc"
        />
      );

      // Graveyard is a textarea, find it by being in the graveyard section
      const textareas = screen.getAllByRole('textbox');
      const graveyardTextarea = textareas.find((textarea) =>
        textarea.value.includes('Defeated Goblin')
      );
      // Check the raw value property since toHaveValue might not handle \n correctly
      expect(graveyardTextarea.value).toContain('Defeated Goblin');
      expect(graveyardTextarea.value).toContain('Defeated Orc');
    });

    it('should disable fight button when monster fields are empty', () => {
      render(<FightSection {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.type === 'button'
      );
      expect(fightButton).toBeDisabled();
    });

    it('should enable fight button when monster fields are filled', () => {
      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
        />
      );

      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.type === 'button'
      );
      expect(fightButton).not.toBeDisabled();
    });

    it('should disable fight button when hero stats are invalid', () => {
      render(
        <FightSection
          {...defaultProps}
          skill="0"
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
        />
      );

      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.type === 'button'
      );
      expect(fightButton).toBeDisabled();
    });

    it('should disable fight button when monster stats are invalid', () => {
      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="0"
          monsterHealth="15"
        />
      );

      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.type === 'button'
      );
      expect(fightButton).toBeDisabled();
    });
  });

  describe('Fight flow', () => {
    it('should start fight when fight button is clicked', async () => {
      const user = userEvent.setup();
      const onFight = vi.fn();

      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
          onFight={onFight}
        />
      );

      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.type === 'button'
      );
      await user.click(fightButton);

      expect(onFight).toHaveBeenCalledTimes(1);
    });

    it('should display "Attack" button text when fight has started', () => {
      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
          isFightStarted={true}
        />
      );

      expect(
        screen.getByRole('button', { name: /fight.attack/i })
      ).toBeInTheDocument();
    });

    it('should display dice rolls when provided', () => {
      render(
        <FightSection
          {...defaultProps}
          heroDiceRolls={[3, 4]}
          monsterDiceRolls={[2, 5]}
        />
      );

      const diceDisplays = screen.getAllByTestId('dice-display');
      expect(diceDisplays[0]).toHaveAttribute(
        'data-result',
        JSON.stringify([3, 4])
      );
      expect(diceDisplays[1]).toHaveAttribute(
        'data-result',
        JSON.stringify([2, 5])
      );
    });

    it('should display fight result when provided', () => {
      render(
        <FightSection
          {...defaultProps}
          fightResult={{
            type: 'heroWins',
            message: 'Hero wins!',
            heroTotal: 17,
            monsterTotal: 15,
          }}
        />
      );

      expect(screen.getByText('Hero wins!')).toBeInTheDocument();
    });

    it('should show use luck button when showUseLuck is true', () => {
      render(<FightSection {...defaultProps} showUseLuck={true} />);

      expect(
        screen.getByRole('button', { name: /fight.useLuck/i })
      ).toBeInTheDocument();
    });

    it('should not show use luck button when showUseLuck is false', () => {
      render(<FightSection {...defaultProps} showUseLuck={false} />);

      expect(
        screen.queryByRole('button', { name: /fight.useLuck/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Use luck flow', () => {
    it('should use luck when use luck button is clicked', async () => {
      const user = userEvent.setup();
      const onUseLuck = vi.fn();

      render(
        <FightSection
          {...defaultProps}
          showUseLuck={true}
          onUseLuck={onUseLuck}
        />
      );

      const useLuckButton = screen.getByRole('button', {
        name: /fight.useLuck/i,
      });
      await user.click(useLuckButton);

      expect(onUseLuck).toHaveBeenCalledTimes(1);
    });

    it('should disable use luck button when luck is used', () => {
      render(
        <FightSection {...defaultProps} showUseLuck={true} luckUsed={true} />
      );

      const useLuckButton = screen.getByRole('button', {
        name: /fight.useLuck/i,
      });
      expect(useLuckButton).toBeDisabled();
    });

    it('should disable use luck button when luck is 0', () => {
      render(<FightSection {...defaultProps} showUseLuck={true} luck="0" />);

      const useLuckButton = screen.getByRole('button', {
        name: /fight.useLuck/i,
      });
      expect(useLuckButton).toBeDisabled();
    });

    it('should display luck test result when provided', () => {
      render(
        <FightSection
          {...defaultProps}
          testLuckResult={{ roll1: 2, roll2: 3, isLucky: true }}
          fightResult={{ type: 'heroWins' }}
        />
      );

      expect(screen.getByText(/dice.youWereLucky/i)).toBeInTheDocument();
    });

    it('should display health badges when provided', () => {
      render(
        <FightSection
          {...defaultProps}
          fieldBadges={{
            heroHealth: { value: '-2', type: 'danger', id: 1 },
            monsterHealth: { value: '-2', type: 'danger', id: 2 },
          }}
        />
      );

      const badges = screen.getAllByText('-2');
      expect(badges).toHaveLength(2);
    });
  });

  describe('Fight end', () => {
    it('should display victory message when fight outcome is won', () => {
      render(<FightSection {...defaultProps} fightOutcome="won" />);

      expect(screen.getByText('fight.battleWon')).toBeInTheDocument();
    });

    it('should display defeat message when fight outcome is lost', () => {
      render(<FightSection {...defaultProps} fightOutcome="lost" />);

      expect(screen.getByText('fight.battleLost')).toBeInTheDocument();
    });

    it('should not display fight result when fight outcome is set', () => {
      render(
        <FightSection
          {...defaultProps}
          fightOutcome="won"
          fightResult={{ type: 'heroWins', message: 'Hero wins!' }}
        />
      );

      expect(screen.queryByText('Hero wins!')).not.toBeInTheDocument();
      expect(screen.getByText('fight.battleWon')).toBeInTheDocument();
    });
  });

  describe('Monster input changes', () => {
    it('should update creature name when user types in creature input', async () => {
      const user = userEvent.setup();
      const onMonsterCreatureChange = vi.fn();

      render(
        <FightSection
          {...defaultProps}
          onMonsterCreatureChange={onMonsterCreatureChange}
        />
      );

      // Find creature input by placeholder
      const creatureInput = screen.getByPlaceholderText(
        'fight.creaturePlaceholder'
      );
      await user.type(creatureInput, 'Goblin');

      // user.type calls onChange for each character typed
      // The component receives e.target.value which accumulates: 'G', 'Go', 'Gob', 'Gobl', 'Gobli', 'Goblin'
      expect(onMonsterCreatureChange).toHaveBeenCalled();
      // Verify it was called multiple times (once per character)
      expect(onMonsterCreatureChange.mock.calls.length).toBeGreaterThan(0);
      // The input value is controlled by props, so we verify the callback was invoked
      // The actual value update happens in the parent component
    });

    it('should update monster skill when user types in skill input', async () => {
      const user = userEvent.setup();
      const onMonsterSkillChange = vi.fn();
      const onNumberChange = vi.fn((setter, value) => {
        setter(value);
      });

      render(
        <FightSection
          {...defaultProps}
          onMonsterSkillChange={onMonsterSkillChange}
          onNumberChange={onNumberChange}
        />
      );

      // Find monster skill input (it's editable, hero skill is readonly)
      const inputs = screen.getAllByRole('spinbutton');
      const editableInputs = inputs.filter((input) => !input.disabled);
      // Monster skill should be the first editable input
      const monsterSkillInput = editableInputs[0];
      await user.type(monsterSkillInput, '8');

      expect(onNumberChange).toHaveBeenCalled();
      expect(onMonsterSkillChange).toHaveBeenCalled();
    });

    it('should update monster health when user types in health input', async () => {
      const user = userEvent.setup();
      const onMonsterHealthChange = vi.fn();
      const onNumberChange = vi.fn((setter, value) => {
        setter(value);
      });

      render(
        <FightSection
          {...defaultProps}
          onMonsterHealthChange={onMonsterHealthChange}
          onNumberChange={onNumberChange}
        />
      );

      // Find monster health input (it's editable, hero health is readonly)
      // Monster health is in the second column (col-xl-6)
      const inputs = screen.getAllByRole('spinbutton');
      const editableInputs = inputs.filter((input) => !input.disabled);
      // Monster health should be the last editable input (after skill)
      const monsterHealthInput = editableInputs[editableInputs.length - 1];
      await user.type(monsterHealthInput, '15');

      expect(onNumberChange).toHaveBeenCalled();
      expect(onMonsterHealthChange).toHaveBeenCalled();
    });
  });

  describe('Dice rolling state', () => {
    it('should show dice rolling animation when diceRollingType is fight', () => {
      render(<FightSection {...defaultProps} diceRollingType="fight" />);

      const diceDisplays = screen.getAllByTestId('dice-display');
      expect(diceDisplays[0]).toHaveAttribute('data-dice-rolling', '2');
      expect(diceDisplays[1]).toHaveAttribute('data-dice-rolling', '2');
    });

    it('should show dice rolling animation when diceRollingType is useLuck', () => {
      render(<FightSection {...defaultProps} diceRollingType="useLuck" />);

      const diceDisplays = screen.getAllByTestId('dice-display');
      expect(diceDisplays[0]).toHaveAttribute('data-dice-rolling', '2');
    });

    it('should disable fight button when dice are rolling', () => {
      render(
        <FightSection
          {...defaultProps}
          monsterCreature="Goblin"
          monsterSkill="8"
          monsterHealth="15"
          diceRollingType="fight"
        />
      );

      // Get all buttons and find the fight/attack button (not the section header)
      // The fight button has type="button" and is a button element, not a div
      const buttons = screen.getAllByRole('button');
      const fightButton = buttons.find(
        (btn) =>
          (btn.textContent?.includes('fight.fight') ||
            btn.textContent?.includes('fight.attack')) &&
          btn.tagName === 'BUTTON'
      );
      expect(fightButton).toBeDisabled();
    });

    it('should disable use luck button when dice are rolling', () => {
      render(
        <FightSection
          {...defaultProps}
          showUseLuck={true}
          diceRollingType="useLuck"
        />
      );

      const useLuckButton = screen.getByRole('button', {
        name: /fight.useLuck/i,
      });
      expect(useLuckButton).toBeDisabled();
    });
  });

  describe('Section collapse', () => {
    it('should toggle collapse when header is clicked', async () => {
      const user = userEvent.setup();
      render(<FightSection {...defaultProps} initialExpanded={true} />);

      const header = document.querySelector('#fight .section-header');
      await user.click(header);

      const collapse = document.querySelector('#fight-collapse');
      expect(collapse).not.toHaveClass('show');
    });

    it('should notify parent when section collapse is toggled', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();

      render(
        <FightSection
          {...defaultProps}
          initialExpanded={true}
          onExpandedChange={onExpandedChange}
        />
      );

      const header = document.querySelector('#fight .section-header');
      await user.click(header);

      expect(onExpandedChange).toHaveBeenCalledWith(false);
    });
  });
});
