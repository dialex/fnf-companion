import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createGameShowManager } from '../../managers/gameShowManager';

describe('GameShowManager', () => {
  let mockSoundManager;
  let gameShowManager;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSoundManager = {
      playLuckySound: vi.fn(),
    };
    gameShowManager = createGameShowManager(mockSoundManager);
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
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };

      gameShowManager.showLuckTestResult(true, gameState);

      const state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeTruthy();
      expect(state.luckTestMessage.type).toBe('div');
      expect(state.luckTestMessage.props.className).toContain('alert-success');
      expect(state.luckTestMessage.props.children).toBe('You were lucky');
      expect(mockSoundManager.playLuckySound).toHaveBeenCalledWith(gameState);
      expect(callback).toHaveBeenCalled();
    });

    it('should show unlucky message and not play sound when not lucky', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };

      gameShowManager.showLuckTestResult(false, gameState);

      const state = gameShowManager.getDisplayState();
      expect(state.luckTestMessage).toBeTruthy();
      expect(state.luckTestMessage.type).toBe('div');
      expect(state.luckTestMessage.props.className).toContain('alert-danger');
      expect(state.luckTestMessage.props.children).toBe('Tough luck');
      expect(mockSoundManager.playLuckySound).not.toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it('should keep message displayed until new dice roll starts', () => {
      const callback = vi.fn();
      gameShowManager.subscribe(callback);
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };

      gameShowManager.showLuckTestResult(true, gameState);
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
    });

    it('should return initial state with null values', () => {
      const state = gameShowManager.getDisplayState();

      expect(state.diceRolling).toBeNull();
      expect(state.diceResult).toBeNull();
      expect(state.luckTestMessage).toBeNull();
    });

    it('should return luck test message with correct CSS classes', () => {
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };

      gameShowManager.showLuckTestResult(true, gameState);
      const state = gameShowManager.getDisplayState();

      expect(state.luckTestMessage.props.className).toContain('alert');
      expect(state.luckTestMessage.props.className).toContain('content');
      expect(state.luckTestMessage.props.className).toContain('alert-success');
      expect(state.luckTestMessage.props.className).toContain('text-center');
      expect(state.luckTestMessage.props.role).toBe('alert');
    });
  });
});
