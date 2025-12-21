import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import CharacterSection from '../../components/CharacterSection';

// Mock i18nManager
const { mockT } = vi.hoisted(() => {
  const translations = {
    en: {
      'sections.character': 'Character',
      'character.name': 'Name',
      'character.skill': 'Skill',
      'character.health': 'Health',
      'character.luck': 'Luck',
      'character.skillPlaceholder': '1 die + 6',
      'character.healthPlaceholder': '2 dice + 12',
      'character.luckPlaceholder': '1 die + 6',
      'character.randomStats': 'Randomize',
      'character.lock': 'Lock',
      'character.unlock': 'Unlock',
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

describe('Character Section', () => {
  let user;
  const defaultProps = {
    name: 'Test Character',
    skill: '10',
    health: '20',
    luck: '8',
    maxSkill: null,
    maxHealth: null,
    maxLuck: null,
    isLocked: false,
    fieldBadges: null,
    rollingButton: null,
    onNameChange: vi.fn(),
    onSkillChange: vi.fn(),
    onHealthChange: vi.fn(),
    onLuckChange: vi.fn(),
    onRandomStats: vi.fn(),
    onToggleLock: vi.fn(),
    onNumberChange: vi.fn((setter, value, maxValue) => {
      setter(value);
      if (maxValue !== null && value !== '') {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue > maxValue) {
          setter(String(maxValue));
        }
      }
    }),
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Character stats are editable', () => {
    it('should allow editing character name', () => {
      render(<CharacterSection {...defaultProps} />);

      const nameInput = document.querySelector('input[type="text"]');
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue('Test Character');

      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      expect(defaultProps.onNameChange).toHaveBeenCalledWith('New Name');
    });

    it('should update section title when character name is typed', () => {
      const { rerender } = render(
        <CharacterSection {...defaultProps} name="" />
      );

      // When name is empty, should show default section title
      const sectionTitle = document.querySelector('.section-title');
      expect(sectionTitle).toBeInTheDocument();
      expect(sectionTitle.textContent).toContain('Character');

      // Update name
      rerender(<CharacterSection {...defaultProps} name="Hero Name" />);

      // Section title should now show the character name
      expect(sectionTitle.textContent).toContain('Hero Name');
    });

    it('should allow editing skill value by typing', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const skillInput = numberInputs[0]; // First number input is skill
      expect(skillInput).toBeInTheDocument();
      expect(skillInput).toHaveValue(10);

      fireEvent.change(skillInput, { target: { value: '15' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onSkillChange).toHaveBeenCalled();
    });

    it('should allow editing skill value using arrow buttons', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const skillInput = numberInputs[0];
      expect(skillInput).toHaveValue(10);

      // Simulate clicking the up arrow button
      fireEvent.change(skillInput, { target: { value: '11' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onSkillChange).toHaveBeenCalled();
    });

    it('should allow editing health value by typing', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const healthInput = numberInputs[1]; // Second number input is health
      expect(healthInput).toBeInTheDocument();
      expect(healthInput).toHaveValue(20);

      fireEvent.change(healthInput, { target: { value: '25' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onHealthChange).toHaveBeenCalled();
    });

    it('should allow editing health value using arrow buttons', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const healthInput = numberInputs[1];
      expect(healthInput).toHaveValue(20);

      // Simulate clicking the up arrow button
      fireEvent.change(healthInput, { target: { value: '21' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onHealthChange).toHaveBeenCalled();
    });

    it('should allow editing luck value by typing', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const luckInput = numberInputs[2]; // Third number input is luck
      expect(luckInput).toBeInTheDocument();
      expect(luckInput).toHaveValue(8);

      fireEvent.change(luckInput, { target: { value: '12' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onLuckChange).toHaveBeenCalled();
    });

    it('should allow editing luck value using arrow buttons', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const luckInput = numberInputs[2];
      expect(luckInput).toHaveValue(8);

      // Simulate clicking the up arrow button
      fireEvent.change(luckInput, { target: { value: '9' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalled();
      expect(defaultProps.onLuckChange).toHaveBeenCalled();
    });
  });

  describe('Character stats are saved to state', () => {
    it('should save character name when field is changed', () => {
      const { rerender } = render(
        <CharacterSection {...defaultProps} name="Test Character" />
      );

      const nameInput = document.querySelector('input[type="text"]');
      fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

      // Verify the handler was called to update the state
      expect(defaultProps.onNameChange).toHaveBeenCalledWith('Updated Name');

      // Re-render with updated name to verify the value is reflected
      rerender(<CharacterSection {...defaultProps} name="Updated Name" />);
      expect(nameInput).toHaveValue('Updated Name');
    });

    it('should save skill value when field is changed', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const skillInput = numberInputs[0];
      fireEvent.change(skillInput, { target: { value: '18' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalledWith(
        defaultProps.onSkillChange,
        '18',
        null
      );
    });

    it('should save health value when field is changed', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const healthInput = numberInputs[1];
      fireEvent.change(healthInput, { target: { value: '30' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalledWith(
        defaultProps.onHealthChange,
        '30',
        null
      );
    });

    it('should save luck value when field is changed', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const luckInput = numberInputs[2];
      fireEvent.change(luckInput, { target: { value: '15' } });

      expect(defaultProps.onNumberChange).toHaveBeenCalledWith(
        defaultProps.onLuckChange,
        '15',
        null
      );
    });
  });

  describe('Lock/unlock stats', () => {
    it('should show lock button when stats are unlocked', () => {
      render(<CharacterSection {...defaultProps} isLocked={false} />);

      const lockButton = screen.getByText('Lock');
      expect(lockButton).toBeInTheDocument();
    });

    it('should show unlock button when stats are locked', () => {
      render(<CharacterSection {...defaultProps} isLocked={true} />);

      const unlockButton = screen.getByText('Unlock');
      expect(unlockButton).toBeInTheDocument();
    });

    it('should toggle lock state when lock button is clicked', async () => {
      render(<CharacterSection {...defaultProps} isLocked={false} />);

      const lockButton = screen.getByText('Lock');
      await user.click(lockButton);

      expect(defaultProps.onToggleLock).toHaveBeenCalled();
    });

    it('should toggle lock state when unlock button is clicked', async () => {
      render(<CharacterSection {...defaultProps} isLocked={true} />);

      const unlockButton = screen.getByText('Unlock');
      await user.click(unlockButton);

      expect(defaultProps.onToggleLock).toHaveBeenCalled();
    });

    it('should disable lock button when stats are invalid', () => {
      render(
        <CharacterSection
          {...defaultProps}
          skill="0"
          health="0"
          luck="0"
          isLocked={false}
        />
      );

      const lockButton = screen.getByText('Lock');
      expect(lockButton).toBeDisabled();
    });

    it('should disable lock button when stats are empty', () => {
      render(
        <CharacterSection
          {...defaultProps}
          skill=""
          health=""
          luck=""
          isLocked={false}
        />
      );

      const lockButton = screen.getByText('Lock');
      expect(lockButton).toBeDisabled();
    });
  });

  describe('Randomize stats', () => {
    it('should have a randomize button', () => {
      render(<CharacterSection {...defaultProps} />);

      const randomizeButton = screen.getByText('Randomize');
      expect(randomizeButton).toBeInTheDocument();
    });

    it('should randomize stats when clicked', async () => {
      render(<CharacterSection {...defaultProps} />);

      const randomizeButton = screen.getByText('Randomize');
      await user.click(randomizeButton);

      expect(defaultProps.onRandomStats).toHaveBeenCalled();
    });

    it('should disable randomize button when rolling is in progress', () => {
      render(<CharacterSection {...defaultProps} rollingButton="randomize" />);

      const randomizeButton = screen.getByText('Randomize');
      expect(randomizeButton).toBeDisabled();
    });

    it('should show rolling animation when randomize is in progress', () => {
      render(<CharacterSection {...defaultProps} rollingButton="randomize" />);

      const randomizeButton = screen.getByText('Randomize');
      const icon = randomizeButton.querySelector('svg');
      expect(icon).toHaveClass('dice-rolling');
    });
  });

  describe('Max values are enforced', () => {
    it('should enforce max skill value when exceeded', () => {
      const onSkillChange = vi.fn();
      const onNumberChange = vi.fn((setter, value, maxValue) => {
        setter(value);
        if (maxValue !== null && value !== '') {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > maxValue) {
            setter(String(maxValue));
          }
        }
      });

      render(
        <CharacterSection
          {...defaultProps}
          maxSkill={12}
          onSkillChange={onSkillChange}
          onNumberChange={onNumberChange}
        />
      );

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const skillInput = numberInputs[0];
      fireEvent.change(skillInput, { target: { value: '15' } });

      expect(onNumberChange).toHaveBeenCalledWith(onSkillChange, '15', 12);
      // The onNumberChange should enforce the max, so onSkillChange should be called with '12'
      expect(onSkillChange).toHaveBeenCalledWith('12');
    });

    it('should enforce max health value when exceeded', () => {
      const onHealthChange = vi.fn();
      const onNumberChange = vi.fn((setter, value, maxValue) => {
        setter(value);
        if (maxValue !== null && value !== '') {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > maxValue) {
            setter(String(maxValue));
          }
        }
      });

      render(
        <CharacterSection
          {...defaultProps}
          maxHealth={24}
          onHealthChange={onHealthChange}
          onNumberChange={onNumberChange}
        />
      );

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const healthInput = numberInputs[1];
      fireEvent.change(healthInput, { target: { value: '30' } });

      expect(onNumberChange).toHaveBeenCalledWith(onHealthChange, '30', 24);
      expect(onHealthChange).toHaveBeenCalledWith('24');
    });

    it('should enforce max luck value when exceeded', () => {
      const onLuckChange = vi.fn();
      const onNumberChange = vi.fn((setter, value, maxValue) => {
        setter(value);
        if (maxValue !== null && value !== '') {
          const numValue = parseInt(value);
          if (!isNaN(numValue) && numValue > maxValue) {
            setter(String(maxValue));
          }
        }
      });

      render(
        <CharacterSection
          {...defaultProps}
          maxLuck={12}
          onLuckChange={onLuckChange}
          onNumberChange={onNumberChange}
        />
      );

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const luckInput = numberInputs[2];
      fireEvent.change(luckInput, { target: { value: '15' } });

      expect(onNumberChange).toHaveBeenCalledWith(onLuckChange, '15', 12);
      expect(onLuckChange).toHaveBeenCalledWith('12');
    });

    it('should display max value indicator when max is set', () => {
      render(
        <CharacterSection
          {...defaultProps}
          maxSkill={12}
          maxHealth={24}
          maxLuck={12}
        />
      );

      const maxIndicators = document.querySelectorAll('.locked-number');
      expect(maxIndicators.length).toBe(3);

      const indicatorTexts = Array.from(maxIndicators).map(
        (el) => el.textContent
      );
      expect(indicatorTexts).toContain('12');
      expect(indicatorTexts).toContain('24');
    });
  });

  describe('User-facing text is translated', () => {
    it('should use translations for all labels', () => {
      render(<CharacterSection {...defaultProps} />);

      expect(mockT).toHaveBeenCalledWith('character.name');
      expect(mockT).toHaveBeenCalledWith('character.skill');
      expect(mockT).toHaveBeenCalledWith('character.health');
      expect(mockT).toHaveBeenCalledWith('character.luck');
    });

    it('should use translations for placeholders', () => {
      render(<CharacterSection {...defaultProps} />);

      const numberInputs = document.querySelectorAll('input[type="number"]');
      const skillInput = numberInputs[0];
      const healthInput = numberInputs[1];
      const luckInput = numberInputs[2];

      expect(skillInput).toHaveAttribute('placeholder', '1 die + 6');
      expect(healthInput).toHaveAttribute('placeholder', '2 dice + 12');
      expect(luckInput).toHaveAttribute('placeholder', '1 die + 6');

      expect(mockT).toHaveBeenCalledWith('character.skillPlaceholder');
      expect(mockT).toHaveBeenCalledWith('character.healthPlaceholder');
      expect(mockT).toHaveBeenCalledWith('character.luckPlaceholder');
    });

    it('should use translations for button labels', () => {
      render(<CharacterSection {...defaultProps} />);

      expect(screen.getByText('Randomize')).toBeInTheDocument();
      expect(screen.getByText('Lock')).toBeInTheDocument();

      expect(mockT).toHaveBeenCalledWith('character.randomStats');
      expect(mockT).toHaveBeenCalledWith('character.lock');
    });

    it('should use translation for section title when name is empty', () => {
      render(<CharacterSection {...defaultProps} name="" />);

      expect(screen.getByText('Character')).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('sections.character');
    });
  });
});
