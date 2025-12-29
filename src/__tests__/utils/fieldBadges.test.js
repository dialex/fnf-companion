import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createFieldBadgeManager,
  BADGE_ANIMATION_DURATION_MS,
} from '../../utils/fieldBadges';

//TODO: consider if we should be part of the GameStateManager component
describe('Visual feedback of game state updates', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('showBadge', () => {
    it('should create a badge with correct properties', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('example', '+5', 'success');

      const badges = manager.getBadges();
      expect(badges.example).toHaveProperty('value', '+5');
      expect(badges.example).toHaveProperty('type', 'success');
      expect(badges.example).toHaveProperty('id');
      expect(typeof badges.example.id).toBe('number');
    });

    it('should default type to "success" when not provided', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('example', '+5');

      const badges = manager.getBadges();
      expect(badges.example.type).toBe('success');
    });

    it('should allow custom types', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('example', '-3', 'danger');

      const badges = manager.getBadges();
      expect(badges.example.type).toBe('danger');
    });

    it('should support multiple badges for multiple fields', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('health', '+4');
      manager.showBadge('meals', '-1');

      const badges = manager.getBadges();
      expect(badges.health).toBeDefined();
      expect(badges.meals).toBeDefined();
      expect(Object.keys(badges)).toHaveLength(2);
    });

    it('should replace badge when showing it twice', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('example', '+5');
      const firstId = manager.getBadges().example.id;

      // Fast-forward time slightly to ensure different timestamp
      vi.advanceTimersByTime(10);
      manager.showBadge('example', '+10');
      const secondId = manager.getBadges().example.id;

      expect(secondId).not.toBe(firstId);
      expect(manager.getBadges().example.value).toBe('+10');
      expect(Object.keys(manager.getBadges())).toHaveLength(1);
    });

    it('should notify subscribers when badge is shown', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      manager.subscribe(callback);

      manager.showBadge('example', '+5');

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({
        example: expect.objectContaining({
          value: '+5',
          type: 'success',
        }),
      });
    });

    it('should automatically clear badge after 2.2 seconds', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('example', '+5');

      expect(manager.getBadges().example).toBeDefined();

      vi.advanceTimersByTime(BADGE_ANIMATION_DURATION_MS);

      expect(manager.getBadges().example).toBeUndefined();
    });

    it('should notify subscribers when badge is cleared', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      manager.subscribe(callback);

      manager.showBadge('example', '+5');
      expect(callback).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(BADGE_ANIMATION_DURATION_MS);

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith({});
    });

    it('should generate unique IDs for each badge', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('health', '+5');
      vi.advanceTimersByTime(10);
      manager.showBadge('coins', '-10');
      vi.advanceTimersByTime(10);
      manager.showBadge('meals', '+2');

      const badges = manager.getBadges();
      const ids = Object.values(badges).map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('subscribe', () => {
    it('should add a callback to listeners', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      manager.subscribe(callback);

      manager.showBadge('health', '+5');

      expect(callback).toHaveBeenCalled();
    });

    it('should return an unsubscribe function', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      const unsubscribe = manager.subscribe(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should remove callback when unsubscribe is called', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      const unsubscribe = manager.subscribe(callback);

      manager.showBadge('health', '+5');
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.showBadge('coins', '+10');

      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should support multiple subscribers', () => {
      const manager = createFieldBadgeManager();
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.subscribe(callback1);
      manager.subscribe(callback2);

      manager.showBadge('health', '+5');

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should pass a copy of badges object to callbacks', () => {
      const manager = createFieldBadgeManager();
      let receivedBadges;
      manager.subscribe((badges) => {
        receivedBadges = badges;
      });

      manager.showBadge('health', '+5');

      // The badges object itself is a copy, but nested objects are references
      // This is expected behavior - modifying nested properties will affect internal state
      expect(receivedBadges).not.toBe(manager.getBadges());
      expect(receivedBadges).toEqual(manager.getBadges());
    });
  });

  describe('getBadges', () => {
    it('should return empty object when there are no badges', () => {
      const manager = createFieldBadgeManager();
      const badges = manager.getBadges();

      expect(badges).toEqual({});
    });

    it('should return a copy of current badges', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('health', '+5');

      const badges1 = manager.getBadges();
      const badges2 = manager.getBadges();

      // Should be different objects (copies)
      expect(badges1).not.toBe(badges2);
      expect(badges1).toEqual(badges2);
    });

    it('should return current state of all badges', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('health', '+5');
      manager.showBadge('coins', '+10');

      const badges = manager.getBadges();

      expect(badges.health).toBeDefined();
      expect(badges.coins).toBeDefined();
      expect(Object.keys(badges)).toHaveLength(2);
    });
  });

  describe('integration', () => {
    it('should handle rapid badge replacements correctly', () => {
      const manager = createFieldBadgeManager();
      const callback = vi.fn();
      manager.subscribe(callback);

      manager.showBadge('example', '+5');
      vi.advanceTimersByTime(100);
      manager.showBadge('example', '+10');
      vi.advanceTimersByTime(100);
      manager.showBadge('example', '+15');

      // Should have been notified for each show
      expect(callback).toHaveBeenCalledTimes(3);

      // Each badge replacement creates its own timeout
      // After 2.2s from the last show, badge should be cleared
      // But previous timeouts also fire (they try to clear badges that were already replaced)
      vi.advanceTimersByTime(BADGE_ANIMATION_DURATION_MS);
      expect(manager.getBadges().example).toBeUndefined();
      // 3 shows + 3 clears (one for each timeout that fires)
      expect(callback).toHaveBeenCalledTimes(6);
    });

    it('should handle multiple badges clearing at different times', () => {
      const manager = createFieldBadgeManager();
      manager.showBadge('health', '+5');
      vi.advanceTimersByTime(1000);
      manager.showBadge('coins', '+10');

      // Health should clear first (after 2.2s total)
      vi.advanceTimersByTime(1200);
      expect(manager.getBadges().health).toBeUndefined();
      expect(manager.getBadges().coins).toBeDefined();

      // Coins should clear after its own 2.2s
      vi.advanceTimersByTime(1000);
      expect(manager.getBadges().coins).toBeUndefined();
    });
  });
});
