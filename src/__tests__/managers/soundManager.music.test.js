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

  describe('Play/Pause button', () => {
    it('should play music from the last position where it stopped', () => {
      // Currently paused (default state)
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).not.toHaveBeenCalled(); // Should not seek, resumes from last position
      expect(onStateChange).toHaveBeenCalled();
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });

    it('should pause music when it is currently playing', () => {
      // Set playing state first
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });
      vi.clearAllMocks();

      // Now pause it
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(onStateChange).toHaveBeenCalled();
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });

    it('should resume music from the same position when paused', () => {
      // Play first
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });
      // Pause
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });
      vi.clearAllMocks();

      // Resume
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).not.toHaveBeenCalled(); // Should not seek, resumes from same position
      expect(onStateChange).toHaveBeenCalled();
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });

    it('should not play when all sounds are muted', () => {
      const mutedManager = createSoundManager({ allSoundsMuted: true });

      mutedManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.playVideo).not.toHaveBeenCalled();
      expect(onStateChange).not.toHaveBeenCalled();
    });

    it('should pause other music when starting new music', () => {
      const battlePlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      youtubePlayers.battle = battlePlayer;

      // Start battle music
      soundManager.handleMusicPlayPause('battle', {
        youtubePlayers,
        onStateChange,
      });
      vi.clearAllMocks();

      // Start ambience - should pause battle
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(battlePlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(soundManager.getSoundPlaying().battle).toBe(false);
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
    });
  });

  describe('Stop button', () => {
    it('should stop music completely', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });
      vi.clearAllMocks();

      soundManager.handleMusicStop('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
      expect(soundManager.getSoundStoppedManually().ambience).toBe(true);
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      expect(onStateChange).toHaveBeenCalled();
    });

    it('should reset music progress tracker to the beginning', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      soundManager.handleMusicStop('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.seekTo).toHaveBeenCalledWith(0, true);
    });

    it('should not stop if music is not currently playing', () => {
      soundManager.handleMusicStop('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
      expect(mockPlayer.seekTo).not.toHaveBeenCalled();
    });

    it('should not stop if player does not exist', () => {
      youtubePlayers.ambience = null;

      soundManager.handleMusicStop('ambience', {
        youtubePlayers,
        onStateChange,
      });

      expect(mockPlayer.pauseVideo).not.toHaveBeenCalled();
    });
  });

  describe('Delete button', () => {
    it('should call onDelete callback', () => {
      soundManager.handleMusicDelete('ambience', {
        youtubePlayers,
        onDelete,
        onStateChange,
      });

      expect(onDelete).toHaveBeenCalledWith('ambience');
    });

    it('should stop and remove the music player', () => {
      soundManager.handleMusicDelete('ambience', {
        youtubePlayers,
        onDelete,
        onStateChange,
      });

      expect(mockPlayer.stopVideo).toHaveBeenCalledTimes(1);
      expect(mockPlayer.destroy).toHaveBeenCalledTimes(1);
      expect(youtubePlayers.ambience).toBeUndefined();
    });

    it('should clear playing state when deleting', () => {
      // Start playing first
      soundManager.handleMusicPlayPause('ambience', {
        youtubePlayers,
        onStateChange,
      });

      soundManager.handleMusicDelete('ambience', {
        youtubePlayers,
        onDelete,
        onStateChange,
      });

      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      expect(soundManager.getSoundStoppedManually().ambience).toBe(false);
      expect(onStateChange).toHaveBeenCalled();
    });

    it('should handle delete gracefully when player does not exist', () => {
      youtubePlayers.ambience = null;

      soundManager.handleMusicDelete('ambience', {
        youtubePlayers,
        onDelete,
        onStateChange,
      });

      expect(onDelete).toHaveBeenCalledWith('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
    });
  });
});
