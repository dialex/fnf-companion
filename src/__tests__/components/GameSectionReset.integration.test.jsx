import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import GameSection from '../../components/GameSection';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import { createGameStateManager } from '../../managers/gameStateManager';

// Mock i18nManager
vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: (key) => {
      const translations = {
        'game.book': 'Book',
        'game.name': 'Name',
        'game.loadGame': 'Load Game',
        'game.saveGame': 'Save Game',
        'game.reset': 'Restart',
        'game.resetConfirm':
          'Do you want to lose all progress and start a new game?',
        'game.saved': 'Game saved',
        'game.loaded': 'Game loaded',
        'dialog.yes': 'Yes',
        'dialog.no': 'No',
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

// Test component that mimics App's behavior
function TestApp({ gsm }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    setShowResetConfirm(false);
    gsm.reset();
  };

  return (
    <>
      <GameSection
        book={gsm.getBook()}
        onBookChange={gsm.setBook}
        onLoadGame={vi.fn()}
        onSaveGame={vi.fn()}
        onReset={handleReset}
        allSoundsMuted={false}
        onAllSoundsMutedChange={vi.fn()}
        actionSoundsEnabled={true}
        onActionSoundsEnabledChange={vi.fn()}
        soundUrls={{}}
        soundInputs={{}}
        soundErrors={{}}
        soundPlaying={{}}
        soundVolumes={{}}
        onSoundInputChange={vi.fn()}
        onSoundSubmit={vi.fn()}
        onSoundDelete={vi.fn()}
        onSoundPlayPause={vi.fn()}
        onSoundStop={vi.fn()}
        onSoundVolumeChange={vi.fn()}
        customSounds={[]}
        customSoundInputs={{}}
        customSoundErrors={{}}
        customSoundPlaying={{}}
        customSoundVolumes={{}}
        onCustomSoundInputChange={vi.fn()}
        onCustomSoundSubmit={vi.fn()}
        onCustomSoundDelete={vi.fn()}
        onCustomSoundPlayPause={vi.fn()}
        onCustomSoundStop={vi.fn()}
        onCustomSoundVolumeChange={vi.fn()}
        onAddCustomSound={vi.fn()}
        onRemovePendingCustomSound={vi.fn()}
        initialExpanded={true}
        onExpandedChange={vi.fn()}
      />
      {showResetConfirm && (
        <ConfirmationDialog
          message="Do you want to lose all progress and start a new game?"
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </>
  );
}

describe('GameSection asks user for confirmation when resetting', () => {
  let user;
  let gsm;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Create a real GameStateManager instance
    gsm = createGameStateManager();

    // Set up some initial state to verify reset works
    gsm.setName('Test Character');
    gsm.setSkill('10');
    gsm.setHealth('20');
    gsm.setLuck('5');
    gsm.setCoins('100');
    gsm.setBook('Test Book');
  });

  it('should open confirmation dialog when restart button is clicked', async () => {
    render(<TestApp gsm={gsm} />);

    const restartButton = screen.getByRole('button', { name: /restart/i });
    await user.click(restartButton);

    expect(
      screen.getByText('Do you want to lose all progress and start a new game?')
    ).toBeInTheDocument();
  });

  it('should not reset game when dialog is canceled', async () => {
    render(<TestApp gsm={gsm} />);

    // Set initial state
    const initialName = gsm.getName();
    const initialSkill = gsm.getSkill();
    const initialCoins = gsm.getCoins();

    // Click restart to open dialog
    const restartButton = screen.getByRole('button', { name: /restart/i });
    await user.click(restartButton);

    // Cancel the dialog
    const cancelButton = screen.getByRole('button', { name: 'No' });
    await user.click(cancelButton);

    // Verify dialog is closed
    expect(
      screen.queryByText(
        'Do you want to lose all progress and start a new game?'
      )
    ).not.toBeInTheDocument();

    // Verify game state is unchanged
    expect(gsm.getName()).toBe(initialName);
    expect(gsm.getSkill()).toBe(initialSkill);
    expect(gsm.getCoins()).toBe(initialCoins);
  });

  it('should reset game when dialog is confirmed', async () => {
    render(<TestApp gsm={gsm} />);

    // Click restart to open dialog
    const restartButton = screen.getByRole('button', { name: /restart/i });
    await user.click(restartButton);

    // Confirm the dialog
    const confirmButton = screen.getByRole('button', { name: 'Yes' });
    await user.click(confirmButton);

    // Verify dialog is closed
    expect(
      screen.queryByText(
        'Do you want to lose all progress and start a new game?'
      )
    ).not.toBeInTheDocument();

    // Verify game state is reset to defaults
    expect(gsm.getName()).toBe('');
    expect(gsm.getSkill()).toBe('');
    expect(gsm.getHealth()).toBe('');
    expect(gsm.getCoins()).toBe('0');
    expect(gsm.getBook()).toBe('');
  });
});
