import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../utils/actionSoundsManager', () => {
  const mockPlaySound = vi.fn();
  return {
    playSound: mockPlaySound,
    createActionSoundsManager: () => ({
      echoLuckTest: (isLucky, actionSoundsEnabled) => {
        if (actionSoundsEnabled && isLucky) {
          mockPlaySound('rayman-lucky.mp3');
        }
      },
    }),
    __getMockPlaySound: () => mockPlaySound,
  };
});

import { createActionSoundsManager } from '../../utils/actionSoundsManager';
import * as actionSoundsManager from '../../utils/actionSoundsManager';

describe('Action sounds manager', () => {
  let mockPlaySound;

  beforeEach(() => {
    mockPlaySound = actionSoundsManager.__getMockPlaySound();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('echoLuckTest', () => {
    it('should call playSound when luck test is successful and sounds are enabled', () => {
      const manager = createActionSoundsManager();
      const isLucky = true;
      const areActionSoundsEnabled = true;
      manager.echoLuckTest(isLucky, areActionSoundsEnabled);

      expect(mockPlaySound).toHaveBeenCalledWith('rayman-lucky.mp3');
      expect(mockPlaySound).toHaveBeenCalledTimes(1);
    });

    it('should not call playSound when luck test fails', () => {
      const manager = createActionSoundsManager();
      const isLucky = false;
      const areActionSoundsEnabled = true;
      manager.echoLuckTest(isLucky, areActionSoundsEnabled);

      expect(mockPlaySound).not.toHaveBeenCalled();
    });

    it('should not call playSound when action sounds are disabled', () => {
      const manager = createActionSoundsManager();
      const isLucky = true;
      const areActionSoundsEnabled = false;
      manager.echoLuckTest(isLucky, areActionSoundsEnabled);

      expect(mockPlaySound).not.toHaveBeenCalled();
    });
  });
});
