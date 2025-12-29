import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createGameShowManager } from '../../managers/gameShowManager';
import { createSoundManager } from '../../managers/soundManager';

// Mock Audio
global.Audio = class MockAudio {
  constructor() {
    this.play = vi.fn().mockResolvedValue(undefined);
    this.pause = vi.fn();
    this.volume = 1;
  }
};

describe('Regression: Badge animation duration', () => {
  let gameShowManager;
  let soundManager;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    soundManager = createSoundManager();
    gameShowManager = createGameShowManager(soundManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show field badge without throwing BADGE_ANIMATION_DURATION_MS error', () => {
    // This test reproduces the bug where showFieldBadge threw
    // "ReferenceError: BADGE_ANIMATION_DURATION_MS is not defined"
    expect(() => {
      gameShowManager.showFieldBadge('health', '+5', 'success');
    }).not.toThrow();

    const state = gameShowManager.getDisplayState();
    expect(state.fieldBadges.health).toBeDefined();
    expect(state.fieldBadges.health.value).toBe('+5');
    expect(state.fieldBadges.health.type).toBe('success');
  });
});
