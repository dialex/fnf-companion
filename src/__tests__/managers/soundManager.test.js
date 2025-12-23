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

  describe('Action sounds player', () => {
    it('should play local mp3 file when sounds are not muted and action sounds enabled', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playLocalSound('test-sound.mp3');

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/test-sound.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should not play sound when action sounds are disabled', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: false,
      });

      soundManager.playLocalSound('test-sound.mp3');

      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should not play sound when all sounds are muted', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: true,
        actionSoundsEnabled: true,
      });

      soundManager.playLocalSound('test-sound.mp3');

      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it('should handle play errors gracefully', async () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const error = new Error('Play failed');
      mockAudio.play.mockRejectedValue(error);

      soundManager.playLocalSound('test-sound.mp3');

      expect(mockAudio.play).toHaveBeenCalled();

      // Wait for the promise to reject and catch handler to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Could not play audio'),
        error
      );
    });
  });

  describe('Built-in action sounds', () => {
    it('should be able to play the lucky sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playLuckySound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/rayman-lucky.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should be able to play the drink potion sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playDrinkSound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/minecraft-drink.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should be able to play the consume meal sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playEatSound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/minecraft-eat.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should be able to play the monster took damage sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playMonsterDamageSound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/minecraft-hit-monster.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should be able to play the player took damage sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playPlayerDamageSound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/minecraft-hurt.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });

    it('should be able to play the purchase sound', () => {
      const soundManager = createSoundManager({
        allSoundsMuted: false,
        actionSoundsEnabled: true,
      });
      const AudioSpy = vi.spyOn(global, 'Audio');

      soundManager.playPurchaseSound();

      expect(AudioSpy).toHaveBeenCalledWith(
        expect.stringContaining('audio/purchase.mp3')
      );
      expect(mockAudio.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('State management', () => {
    it('should get and set allSoundsMuted', () => {
      const soundManager = createSoundManager({ allSoundsMuted: false });
      expect(soundManager.getAllSoundsMuted()).toBe(false);
      soundManager.setAllSoundsMuted(true);
      expect(soundManager.getAllSoundsMuted()).toBe(true);
    });

    it('should get and set actionSoundsEnabled', () => {
      const soundManager = createSoundManager({ actionSoundsEnabled: true });
      expect(soundManager.getActionSoundsEnabled()).toBe(true);
      soundManager.setActionSoundsEnabled(false);
      expect(soundManager.getActionSoundsEnabled()).toBe(false);
    });

    it('should get sound playing state', () => {
      const soundManager = createSoundManager();
      const state = soundManager.getSoundPlaying();
      expect(state).toEqual({
        ambience: false,
        battle: false,
        victory: false,
        defeat: false,
      });
    });

    it('should get custom sound playing state', () => {
      const soundManager = createSoundManager();
      const state = soundManager.getCustomSoundPlaying();
      expect(state).toEqual({});
    });

    it('should get sound stopped manually state', () => {
      const soundManager = createSoundManager();
      const state = soundManager.getSoundStoppedManually();
      expect(state).toEqual({
        ambience: false,
        battle: false,
        victory: false,
        defeat: false,
      });
    });
  });
});
