import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSoundManager } from '../../managers/soundManager';

describe('Music control buttons', () => {
  let soundManager;
  let mockPlayer;
  let youtubePlayers;
  let onStateChange;
  let onDelete;

  beforeEach(() => {
    vi.clearAllMocks();
    soundManager = createSoundManager({ allSoundsMuted: false });

    // Mock YouTube player
    mockPlayer = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      seekTo: vi.fn(),
      destroy: vi.fn(),
      getPlayerState: vi.fn(() => 1), // 1 = playing
    };

    youtubePlayers = {
      ambience: mockPlayer,
      battle: null,
      victory: null,
      defeat: null,
    };

    onStateChange = vi.fn();
    onDelete = vi.fn();
  });

  describe('Master sound switch', () => {
    it('should not play music when muted', () => {
      const mutedManager = createSoundManager({ allSoundsMuted: true });
      mutedManager._setPlayerForTesting('ambience', mockPlayer);

      mutedManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).not.toHaveBeenCalled();
    });

    it('should play music when enabled', () => {
      const unmutedManager = createSoundManager({ allSoundsMuted: false });
      unmutedManager._setPlayerForTesting('ambience', mockPlayer);

      unmutedManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
    });
  });

  describe('Play/Pause button', () => {
    beforeEach(() => {
      // Initialize a player for testing
      soundManager._setPlayerForTesting('ambience', mockPlayer);
    });

    it('should play music from the last position where it stopped', () => {
      // Currently paused (default state)
      soundManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).not.toHaveBeenCalled(); // Should not seek, resumes from last position
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });

    it('should pause music when it is currently playing', () => {
      // First play to set the state
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
      vi.clearAllMocks();

      // Now pause it
      soundManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });

    it('should resume music from the same position when paused', () => {
      // Play first
      soundManager.handleMusicPlayPause('ambience');
      // Pause
      soundManager.handleMusicPlayPause('ambience');
      vi.clearAllMocks();

      // Resume
      soundManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).not.toHaveBeenCalled(); // Should not seek, resumes from same position
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });

    it('should not play when all sounds are muted', () => {
      const mutedManager = createSoundManager({ allSoundsMuted: true });
      mutedManager._setPlayerForTesting('ambience', mockPlayer);

      mutedManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).not.toHaveBeenCalled();
    });

    it('should pause other music when starting new music', () => {
      const battlePlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      soundManager._setPlayerForTesting('battle', battlePlayer);

      // Start battle music
      soundManager.handleMusicPlayPause('battle');
      expect(soundManager.getSoundPlaying().battle).toBe(true);
      vi.clearAllMocks();

      // Start ambience - should pause battle
      soundManager.handleMusicPlayPause('ambience');

      expect(battlePlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(soundManager.getSoundPlaying().battle).toBe(false);
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });
  });

  describe('Stop button', () => {
    beforeEach(() => {
      soundManager._setPlayerForTesting('ambience', mockPlayer);
    });

    it('should stop music completely', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
      vi.clearAllMocks();

      soundManager.handleMusicStop('ambience');

      expect(mockPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
      expect(soundManager.getSoundStoppedManually().ambience).toBe(true);
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });

    it('should reset music progress tracker to the beginning', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience');

      soundManager.handleMusicStop('ambience');

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
    });

    it('should not stop if music is not currently playing', () => {
      soundManager.handleMusicStop('ambience');

      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
      expect(mockPlayer.seekTo).not.toHaveBeenCalled();
    });

    it('should not stop if player does not exist', () => {
      const managerWithoutPlayer = createSoundManager();
      managerWithoutPlayer.handleMusicStop('ambience');

      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
    });
  });

  describe('Delete button', () => {
    beforeEach(() => {
      soundManager._setPlayerForTesting('ambience', mockPlayer);
    });

    it('should delete music track when delete is triggered', () => {
      soundManager.handleMusicDelete('ambience', onDelete);

      expect(onDelete).toHaveBeenCalledWith('ambience');
    });

    it('should stop and remove the music player', () => {
      soundManager.handleMusicDelete('ambience', onDelete);

      expect(mockPlayer.stopVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.destroy).toHaveBeenCalledTimes(1);
      expect(soundManager.getPlayer('ambience')).toBeUndefined();
    });

    it('should clear playing state when deleting', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);

      soundManager.handleMusicDelete('ambience', onDelete);

      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      expect(soundManager.getSoundStoppedManually().ambience).toBe(false);
    });

    it('should handle delete gracefully when player does not exist', () => {
      soundManager.handleMusicDelete('ambience', onDelete);

      expect(onDelete).toHaveBeenCalledWith('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });

    it('should handle delete when onDelete is not provided', () => {
      soundManager.handleMusicDelete('ambience');

      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });
  });
});
