import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createGameStateManager } from '../../managers/gameStateManager';
import { createSoundManager } from '../../managers/soundManager';

// Mock YouTube API
class MockYTPlayer {
  constructor() {
    this.playVideo = vi.fn();
    this.pauseVideo = vi.fn();
    this.stopVideo = vi.fn();
    this.destroy = vi.fn();
    this.seekTo = vi.fn();
    this.setVolume = vi.fn();
    this.getPlayerState = vi.fn().mockReturnValue(0); // 0 = unstarted
  }
}

global.window.YT = {
  Player: MockYTPlayer,
};

// Mock Audio
global.Audio = class MockAudio {
  constructor() {
    this.play = vi.fn().mockResolvedValue(undefined);
    this.pause = vi.fn();
    this.volume = 1;
  }
};

describe('Regression: Battle music trigger', () => {
  let gameStateManager;
  let soundManager;
  let mockBattlePlayer;

  beforeEach(() => {
    vi.clearAllMocks();
    gameStateManager = createGameStateManager();
    soundManager = createSoundManager({ allSoundsMuted: false });

    // Setup battle sound URL and player
    gameStateManager.setSoundUrls({
      battle: 'https://youtube.com/watch?v=test123',
    });
    mockBattlePlayer = new MockYTPlayer();
    soundManager._setPlayerForTesting('battle', mockBattlePlayer);
  });

  it('should detect monster creature changes through subscription to trigger battle music', () => {
    // This test reproduces the bug where battle music didn't start when typing monster name
    // because useEffect depended on gsm (ref) instead of React state, so changes weren't detected

    let subscribedValue = gameStateManager.getMonsterCreature();
    expect(subscribedValue).toBe('');

    const unsubscribe = gameStateManager.subscribe(() => {
      subscribedValue = gameStateManager.getMonsterCreature();
    });

    // Simulate typing monster name (this triggers gsm.setMonsterCreature)
    gameStateManager.setMonsterCreature('Goblin');

    // Subscription should detect the change (this is what App.jsx needs to work)
    // In App.jsx, this subscription updates React state, which triggers useEffect to start battle music
    expect(subscribedValue).toBe('Goblin');

    unsubscribe();
  });
});
