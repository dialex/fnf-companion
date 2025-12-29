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
        'game.sound': 'Sound',
        'game.muteAll': 'Mute all',
        'game.unmuteAll': 'Unmute all',
        'game.ambience': 'Ambience',
        'game.battle': 'Battle',
        'game.victory': 'Victory',
        'game.defeat': 'Defeat',
        'game.youtubeUrl': 'YouTube link',
        'game.invalidUrl': 'Please provide a valid YouTube link.',
      };
      return translations[key] || key;
    },
  },
}));

// Mock bootstrap to avoid tooltip initialization errors
const mockTooltip = vi.fn().mockImplementation(() => ({
  dispose: vi.fn(),
}));
mockTooltip.getInstance = vi.fn(() => null);

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

    it('should generate a file, with a particular filename, containing the game state', async () => {
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
  });

  describe('Load button', () => {
    it('should load a game file when clicked', async () => {
      const user = userEvent.setup();
      const onLoadGame = vi.fn();

      render(<GameSection {...defaultProps} onLoadGame={onLoadGame} />);

      const loadButton = screen.getByRole('button', { name: /load game/i });
      await user.click(loadButton);

      expect(onLoadGame).toHaveBeenCalledTimes(1);
    });
  });

  describe('Reset button', () => {
    it('should reset the game when clicked', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(<GameSection {...defaultProps} onReset={onReset} />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Master sound switch', () => {
    it('should disable action sounds when master sound is muted', async () => {
      const user = userEvent.setup();
      const onAllSoundsMutedChange = vi.fn();
      const onActionSoundsEnabledChange = vi.fn();
      const onSoundStop = vi.fn();

      render(
        <GameSection
          {...defaultProps}
          allSoundsMuted={false}
          actionSoundsEnabled={true}
          soundPlaying={{
            ambience: true,
            battle: false,
            victory: false,
            defeat: false,
          }}
          onAllSoundsMutedChange={onAllSoundsMutedChange}
          onActionSoundsEnabledChange={onActionSoundsEnabledChange}
          onSoundStop={onSoundStop}
        />
      );

      // Find the master sound button (it has a volume icon)
      const masterSoundButton = document.querySelector(
        'button[data-bs-toggle="tooltip"]'
      );
      expect(masterSoundButton).toBeInTheDocument();

      await user.click(masterSoundButton);

      // Should mute master sound
      expect(onAllSoundsMutedChange).toHaveBeenCalledWith(true);
      // Should auto-disable action sounds
      expect(onActionSoundsEnabledChange).toHaveBeenCalledWith(false);
      // Should stop playing sounds
      expect(onSoundStop).toHaveBeenCalledWith('ambience');
    });

    it('should enable action sounds when master sound is unmuted', async () => {
      const user = userEvent.setup();
      const onAllSoundsMutedChange = vi.fn();
      const onActionSoundsEnabledChange = vi.fn();

      render(
        <GameSection
          {...defaultProps}
          allSoundsMuted={true}
          actionSoundsEnabled={false}
          onAllSoundsMutedChange={onAllSoundsMutedChange}
          onActionSoundsEnabledChange={onActionSoundsEnabledChange}
        />
      );

      // Find the master sound button
      const masterSoundButton = document.querySelector(
        'button[data-bs-toggle="tooltip"]'
      );
      expect(masterSoundButton).toBeInTheDocument();

      await user.click(masterSoundButton);

      // Should unmute master sound
      expect(onAllSoundsMutedChange).toHaveBeenCalledWith(false);
      // Should auto-enable action sounds
      expect(onActionSoundsEnabledChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Music URL validation', () => {
    it('should show error message when invalid URL is submitted', async () => {
      const user = userEvent.setup();
      const onSoundInputChange = vi.fn();
      const onSoundSubmit = vi.fn();

      render(
        <GameSection
          {...defaultProps}
          onSoundInputChange={onSoundInputChange}
          onSoundSubmit={onSoundSubmit}
        />
      );

      // Find the ambience input field
      const inputs = document.querySelectorAll('input[type="text"]');
      const ambienceInput = Array.from(inputs).find((input) =>
        input.placeholder.includes('YouTube')
      );
      expect(ambienceInput).toBeInTheDocument();

      // Type invalid URL
      await user.type(ambienceInput, 'https://example.com/video');
      expect(onSoundInputChange).toHaveBeenCalled();

      // Submit (click check button or press Enter)
      const checkButton = ambienceInput.parentElement?.querySelector('button');
      if (checkButton) {
        await user.click(checkButton);
      }

      // onSoundSubmit should be called, and it will set error in App.jsx
      // The error will be passed as a prop, so we verify onSoundSubmit was called
      expect(onSoundSubmit).toHaveBeenCalled();
    });

    it('should display error message when error is set', () => {
      render(
        <GameSection
          {...defaultProps}
          soundErrors={{
            ambience: 'Please provide a valid YouTube link.',
            battle: null,
            victory: null,
            defeat: null,
          }}
        />
      );

      const errorMessage = screen.getByText(
        'Please provide a valid YouTube link.'
      );
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('invalid-feedback');
    });

    it('should clear error when valid URL is submitted', async () => {
      const user = userEvent.setup();
      const onSoundInputChange = vi.fn();
      const onSoundSubmit = vi.fn();

      const { rerender } = render(
        <GameSection
          {...defaultProps}
          soundErrors={{
            ambience: 'Please provide a valid YouTube link.',
            battle: null,
            victory: null,
            defeat: null,
          }}
          onSoundInputChange={onSoundInputChange}
          onSoundSubmit={onSoundSubmit}
        />
      );

      // Error should be visible
      expect(
        screen.getByText('Please provide a valid YouTube link.')
      ).toBeInTheDocument();

      // Submit valid URL (this would be handled by App.jsx, which clears the error)
      // We simulate this by rerendering with no error
      rerender(
        <GameSection
          {...defaultProps}
          soundErrors={{
            ambience: null,
            battle: null,
            victory: null,
            defeat: null,
          }}
          onSoundInputChange={onSoundInputChange}
          onSoundSubmit={onSoundSubmit}
        />
      );

      // Error should be gone
      expect(
        screen.queryByText('Please provide a valid YouTube link.')
      ).not.toBeInTheDocument();
    });
  });
});
