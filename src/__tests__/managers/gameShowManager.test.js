import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGameShowManager } from '../../managers/gameShowManager';
import { createI18nManager } from '../../managers/i18nManager';

describe('GameShowManager', () => {
  let mockSoundManager;
  let i18nManager;
  let gameShowManager;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSoundManager = {
      playLuckySound: vi.fn(),
    };
    i18nManager = createI18nManager();
    const mockGameStateManager = {
      getFightOutcome: vi.fn(() => null),
      clearFightResults: vi.fn(),
    };
    gameShowManager = createGameShowManager(
      mockSoundManager,
      mockGameStateManager
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('showDiceRolling', () => {
    it('should set dice rolling state with correct dice count', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showDiceRolling(1);

      const state = gameShowManager.getDisplayState();
      expect(state.diceRolling).toBe(1);
      expect(callback).toHaveBeenCalled();
    });

    it('should notify subscribers when dice rolling starts', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showDiceRolling(2);

      expect(callback).toHaveBeenCalledTimes(1);
      const state = callback.mock.calls[0][0];
      expect(state.diceRolling).toBe(2);
    });
  });

  describe('showDiceResult', () => {
    it('should clear rolling state and set dice result', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);
      gameShowManager.showDiceRolling(1);

      gameShowManager.showDiceResult(4);

      const state = gameShowManager.getDisplayState();
      expect(state.diceRolling).toBeNull();
      expect(state.diceResult).toBe(4);
      expect(callback).toHaveBeenCalledTimes(2); // Once for rolling, once for result
    });

    it('should handle array results for two dice', () => {
      gameShowManager.showDiceResult([3, 5]);

      const state = gameShowManager.getDisplayState();
      expect(state.diceResult).toEqual([3, 5]);
    });
  });

  describe('showLuckTestResult', () => {
    it('should show lucky message and play sound when lucky', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showLuckTestResult(true);

      const state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeTruthy();
      expect(state.luckTestMessage.type).toBe('div');
      expect(state.luckTestMessage.props.className).toContain('alert-success');
      expect(state.luckTestMessage.props.children).toBe('You were lucky!');
      expect(mockSoundManager.playLuckySound).toHaveBeenCalledWith();
      expect(callback).toHaveBeenCalled();
    });

    it('should show unlucky message and not play sound when not lucky', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showLuckTestResult(false);

      const state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeTruthy();
      expect(state.luckTestMessage.type).toBe('div');
      expect(state.luckTestMessage.props.className).toContain('alert-danger');
      expect(state.luckTestMessage.props.children).toBe('Tough luck...');
      expect(mockSoundManager.playLuckySound).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should keep message displayed until new dice roll starts', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showLuckTestResult(true);
      expect(callback).toHaveBeenCalledTimes(1);

      // Advance time - message should still be there
      vi.advanceTimersByTime(5000);

      let state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeTruthy(); // Still displayed

      // Start new dice roll - should clear the message
      gameShowManager.showDiceRolling(1);
      state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeNull(); // Cleared when new roll starts
      expect(callback).toHaveBeenCalledTimes(2); // Once for show, once for new roll
    });
  });

  describe('subscribe', () => {
    it('should add callback to listeners', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showDiceRolling(1);

      expect(callback).toHaveBeenCalled();
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = gameShowManager.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should remove callback when unsubscribe is called', () => {
      const callback = vi.fn();
      const unsubscribe = gameShowManager.subscribe(callback);

      gameShowManager.showDiceRolling(1);
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      gameShowManager.showDiceResult(4);

      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });
  });

  describe('getDisplayState', () => {
    it('should return current display state', () => {
      const state = gameShowManager.getDisplayState();

      expect(state).toHaveProperty('diceRolling');
      expect(state).toHaveProperty('diceResult');
      expect(state).toHaveProperty('luckTestMessage');
      expect(state).toHaveProperty('youDiedOverlay');
    });

    it('should return initial state with null values', () => {
      const state = gameShowManager.getDisplayState();

      expect(state.diceRolling).toBeNull();
      expect(state.diceResult).toBeNull();
      expect(state.luckTestMessage).toBeNull();
      expect(state.youDiedOverlay).toBeNull();
    });

    it('should return luck test message with correct CSS classes', () => {
      gameShowManager.showLuckTestResult(true);
      const state = gameShowManager.getDisplayState();

      expect(state.luckTestMessage.props.className).toContain('alert');
      expect(state.luckTestMessage.props.className).toContain('content');
      expect(state.luckTestMessage.props.className).toContain('alert-success');
      expect(state.luckTestMessage.props.className).toContain('text-center');
      expect(state.luckTestMessage.props.role).toBe('alert');
    });
  });

  describe('showYouDied', () => {
    it('should show YOU DIED animation when triggered', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showYouDied();

      const state = gameShowManager.getDisplayState();
      expect(state.youDiedOverlay).toBeTruthy();
      expect(state.youDiedOverlay.type).toBe('div');
      expect(state.youDiedOverlay.props.className).toBe('you-died-overlay');
      expect(callback).toHaveBeenCalled();
    });

    it('should automatically hide YOU DIED animation after 9 seconds', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showYouDied();
      expect(gameShowManager.getDisplayState().youDiedOverlay).toBeTruthy();

      // Advance time by 9 seconds
      vi.advanceTimersByTime(9000);

      const state = gameShowManager.getDisplayState();
      expect(state.youDiedOverlay).toBeNull();
      expect(callback).toHaveBeenCalledTimes(2); // Once for show, once for hide
    });

    it('should notify subscribers when YOU DIED animation is shown', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showYouDied();

      expect(callback).toHaveBeenCalledTimes(1);
      const state = callback.mock.calls[0][0];
      expect(state.youDiedOverlay).toBeTruthy();
    });

    it('should notify subscribers when YOU DIED animation is hidden', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);

      gameShowManager.showYouDied();
      vi.advanceTimersByTime(9000);

      expect(callback).toHaveBeenCalledTimes(2);
      const finalState = callback.mock.calls[1][0];
      expect(finalState.youDiedOverlay).toBeNull();
    });

    it('should render YOU DIED text with correct translation', () => {
      gameShowManager.showYouDied();
      const state = gameShowManager.getDisplayState();

      const overlay = state.youDiedOverlay;
      expect(overlay.props.children.type).toBe('div');
      expect(overlay.props.children.props.className).toBe('you-died-text');
      expect(overlay.props.children.props.children).toBe('YOU DIED');
    });
  });

  describe('celebrate', () => {
    it('should trigger confetti animation when called', () => {
      // Mock canvas-confetti
      const mockConfetti = vi.fn();

      // Mock the dynamic import
      const originalImport = global.import;
      global.import = vi.fn((module) => {
        if (module === 'canvas-confetti') {
          return Promise.resolve({ default: mockConfetti });
        }
        return originalImport
          ? originalImport(module)
          : Promise.reject(new Error(`Unknown module: ${module}`));
      });

      // Should not throw
      expect(() => {
        gameShowManager.celebrate();
      }).not.toThrow();

      // Cleanup
      global.import = originalImport;
    });

    it('should not affect display state', () => {
      const initialState = gameShowManager.getDisplayState();

      gameShowManager.celebrate();

      const state = gameShowManager.getDisplayState();
      expect(state).toEqual(initialState);
    });
  });
});
