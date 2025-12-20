import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameSection from '../../components/GameSection';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => {
      const translations = {
        'game.book': 'Book',
        'game.name': 'Name',
        'game.loadGame': 'Load Game',
        'game.saveGame': 'Save Game',
        'game.reset': 'Reset',
        'game.saved': 'Game saved',
        'game.loaded': 'Game loaded',
      };
      return translations[key] || key;
    },
  },
}));

describe('GameSection', () => {
  const defaultProps = {
    book: '',
    onBookChange: vi.fn(),
    onLoadGame: vi.fn(),
    onSaveGame: vi.fn(),
    onReset: vi.fn(),
    allSoundsMuted: false,
    onAllSoundsMutedChange: vi.fn(),
    actionSoundsEnabled: true,
    onActionSoundsEnabledChange: vi.fn(),
    soundUrls: {
      ambience: '',
      battle: '',
      victory: '',
      defeat: '',
    },
    soundInputs: {
      ambience: '',
      battle: '',
      victory: '',
      defeat: '',
    },
    soundErrors: {
      ambience: null,
      battle: null,
      victory: null,
      defeat: null,
    },
    soundPlaying: {
      ambience: false,
      battle: false,
      victory: false,
      defeat: false,
    },
    soundVolumes: {
      ambience: 25,
      battle: 25,
      victory: 25,
      defeat: 25,
    },
    onSoundInputChange: vi.fn(),
    onSoundSubmit: vi.fn(),
    onSoundDelete: vi.fn(),
    onSoundPlayPause: vi.fn(),
    onSoundStop: vi.fn(),
    onSoundVolumeChange: vi.fn(),
    customSounds: [],
    customSoundInputs: {},
    customSoundErrors: {},
    customSoundPlaying: {},
    customSoundVolumes: {},
    onCustomSoundInputChange: vi.fn(),
    onCustomSoundSubmit: vi.fn(),
    onCustomSoundDelete: vi.fn(),
    onCustomSoundPlayPause: vi.fn(),
    onCustomSoundStop: vi.fn(),
    onCustomSoundVolumeChange: vi.fn(),
    onAddCustomSound: vi.fn(),
    onRemovePendingCustomSound: vi.fn(),
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Save button', () => {
    it('should be disabled when book name is empty', () => {
      render(<GameSection {...defaultProps} book="" />);
      const saveButton = screen.getByRole('button', { name: /save game/i });
      expect(saveButton).toBeDisabled();
    });

    it('should be enabled when book name is not empty', () => {
      render(<GameSection {...defaultProps} book="Test Book" />);
      const saveButton = screen.getByRole('button', { name: /save game/i });
      expect(saveButton).not.toBeDisabled();
    });

    it('should call onSaveGame handler when clicked and book name is not empty', async () => {
      const user = userEvent.setup();
      const onSaveGame = vi.fn();

      render(
        <GameSection
          {...defaultProps}
          book="Test Book"
          onSaveGame={onSaveGame}
        />
      );

      const saveButton = screen.getByRole('button', { name: /save game/i });
      await user.click(saveButton);

      expect(onSaveGame).toHaveBeenCalledTimes(1);
    });

    it('should not call onSaveGame when book name is empty even if clicked', async () => {
      const user = userEvent.setup();
      const onSaveGame = vi.fn();

      render(<GameSection {...defaultProps} book="" onSaveGame={onSaveGame} />);

      const saveButton = screen.getByRole('button', { name: /save game/i });
      expect(saveButton).toBeDisabled();
      // Even if we try to click, it shouldn't call the handler
      await user.click(saveButton).catch(() => {
        // Expected to fail because button is disabled
      });

      expect(onSaveGame).not.toHaveBeenCalled();
    });
  });

  describe('Load button', () => {
    it('should call onLoadGame handler when clicked', async () => {
      const user = userEvent.setup();
      const onLoadGame = vi.fn();

      render(<GameSection {...defaultProps} onLoadGame={onLoadGame} />);

      const loadButton = screen.getByRole('button', { name: /load game/i });
      await user.click(loadButton);

      expect(onLoadGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset button', () => {
    it('should call onReset handler when clicked', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(<GameSection {...defaultProps} onReset={onReset} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });
});
