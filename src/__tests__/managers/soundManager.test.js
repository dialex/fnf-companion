import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSoundManager } from '../../managers/soundManager';

describe('SoundManager', () => {
  let mockAudio;

  beforeEach(() => {
    // Mock Audio API
    const playMock = vi.fn().mockResolvedValue(undefined);
    // Create a proper constructor function
    global.Audio = class MockAudio {
      constructor(src) {
        this.src = src;
        this.play = playMock;
        this.pause = vi.fn();
        this.volume = 1;
      }
    };
    mockAudio = { play: playMock };
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('playLocalSound', () => {
    it('should play local mp3 file when sounds are not muted and action sounds enabled', () => {
      const soundManager = createSoundManager();
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playLocalSound('test-sound.mp3', gameState);

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/test-sound.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should not play sound when action sounds are disabled', () => {
      const soundManager = createSoundManager();
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: false,
      };

      soundManager.playLocalSound('test-sound.mp3', gameState);

      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should not play sound when all sounds are muted', () => {
      const soundManager = createSoundManager();
      const gameState = {
        allSoundsMuted: true,
        actionSoundsEnabled: true,
      };

      soundManager.playLocalSound('test-sound.mp3', gameState);

      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      const soundManager = createSoundManager();
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };
      const error = new Error('Play failed');
      mockAudio.play.mockRejectedValue(error);

      soundManager.playLocalSound('test-sound.mp3', gameState);

      expect(mockAudio.play).toHaveBeenCalled();

      // Wait for the promise to reject and catch handler to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not play audio'),
        error
      );
    });
  });

  describe('playLuckySound', () => {
    it('should play the built-in sound for a lucky situation', () => {
      const soundManager = createSoundManager();
      const gameState = {
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      };
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playLuckySound(gameState);

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/rayman-lucky.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });
  });
});
