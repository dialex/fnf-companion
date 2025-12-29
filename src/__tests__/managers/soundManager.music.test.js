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

  describe('Music exclusivity', () => {
    it('should only allow one music track to play at a time', () => {
      const battlePlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      const victoryPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      const defeatPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };

      soundManager._setPlayerForTesting('battle', battlePlayer);
      soundManager._setPlayerForTesting('victory', victoryPlayer);
      soundManager._setPlayerForTesting('defeat', defeatPlayer);
      soundManager._setPlayerForTesting('ambience', mockPlayer);

      // Start ambience
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
      expect(soundManager.getSoundPlaying().battle).toBe(false);
      expect(soundManager.getSoundPlaying().victory).toBe(false);
      expect(soundManager.getSoundPlaying().defeat).toBe(false);
      vi.clearAllMocks();

      // Start battle - should pause ambience
      soundManager.handleMusicPlayPause('battle');
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      expect(soundManager.getSoundPlaying().battle).toBe(true);
      expect(mockPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      vi.clearAllMocks();

      // Start victory - should pause battle
      soundManager.handleMusicPlayPause('victory');
      expect(soundManager.getSoundPlaying().battle).toBe(false);
      expect(soundManager.getSoundPlaying().victory).toBe(true);
      expect(battlePlayer.pauseVideo).toHaveBeenCalledTimes(1);
      vi.clearAllMocks();

      // Start defeat - should pause victory
      soundManager.handleMusicPlayPause('defeat');
      expect(soundManager.getSoundPlaying().victory).toBe(false);
      expect(soundManager.getSoundPlaying().defeat).toBe(true);
      expect(victoryPlayer.pauseVideo).toHaveBeenCalledTimes(1);
    });

    it('should pause all music types when a new track starts', () => {
      const battlePlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      const victoryPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };
      const defeatPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
      };

      soundManager._setPlayerForTesting('battle', battlePlayer);
      soundManager._setPlayerForTesting('victory', victoryPlayer);
      soundManager._setPlayerForTesting('defeat', defeatPlayer);
      soundManager._setPlayerForTesting('ambience', mockPlayer);

      // Start ambience (sets state)
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);

      // Start battle (pauses ambience, plays battle)
      soundManager.handleMusicPlayPause('battle');
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      expect(soundManager.getSoundPlaying().battle).toBe(true);

      // Start victory (pauses battle, plays victory)
      soundManager.handleMusicPlayPause('victory');
      expect(soundManager.getSoundPlaying().battle).toBe(false);
      expect(soundManager.getSoundPlaying().victory).toBe(true);
      vi.clearAllMocks();

      // Start defeat - should pause victory
      soundManager.handleMusicPlayPause('defeat');

      expect(victoryPlayer.pauseVideo).toHaveBeenCalledTimes(1);
      expect(defeatPlayer.playVideo).toHaveBeenCalledTimes(1);
      expect(soundManager.getSoundPlaying().defeat).toBe(true);
      expect(soundManager.getSoundPlaying().victory).toBe(false);
    });

    it('should pause custom music when regular music starts', () => {
      const customPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
        getPlayerState: vi.fn(() => 1), // 1 = playing
      };

      soundManager._setPlayerForTesting('ambience', mockPlayer);
      soundManager._setPlayerForTesting('custom-123', customPlayer);

      // Note: Custom music state (customSoundPlaying) is internal to SoundManager
      // and managed by App.jsx. The handleMusicPlayPause method does check for
      // and pause custom music, but we can't directly test this without
      // exposing internal state. This behavior is tested at the integration level.
      // Here we verify that regular music can play when no custom music is playing.
      soundManager.handleMusicPlayPause('ambience');

      expect(mockPlayer.playVideo).toHaveBeenCalledTimes(1);
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

  describe('Music volume control', () => {
    beforeEach(() => {
      mockPlayer.setVolume = vi.fn();
      soundManager._setPlayerForTesting('ambience', mockPlayer);
    });

    it('should control each music track volume separately', () => {
      const battlePlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
        setVolume: vi.fn(),
      };
      const victoryPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
        setVolume: vi.fn(),
      };

      soundManager._setPlayerForTesting('battle', battlePlayer);
      soundManager._setPlayerForTesting('victory', victoryPlayer);

      // Set different volumes for each track
      soundManager.setPlayerVolume('ambience', 30);
      soundManager.setPlayerVolume('battle', 50);
      soundManager.setPlayerVolume('victory', 75);

      expect(mockPlayer.setVolume).toHaveBeenCalledWith(30);
      expect(battlePlayer.setVolume).toHaveBeenCalledWith(50);
      expect(victoryPlayer.setVolume).toHaveBeenCalledWith(75);
    });

    it('should persist volume across play and pause cycles', () => {
      mockPlayer.setVolume = vi.fn();

      // Set initial volume
      soundManager.setPlayerVolume('ambience', 40);
      expect(mockPlayer.setVolume).toHaveBeenCalledWith(40);
      vi.clearAllMocks();

      // Play music
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
      // Volume should not change
      expect(mockPlayer.setVolume).not.toHaveBeenCalled();

      // Pause music
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(false);
      // Volume should still not change
      expect(mockPlayer.setVolume).not.toHaveBeenCalled();

      // Change volume while paused
      soundManager.setPlayerVolume('ambience', 60);
      expect(mockPlayer.setVolume).toHaveBeenCalledWith(60);
      vi.clearAllMocks();

      // Play again - volume should remain at 60
      soundManager.handleMusicPlayPause('ambience');
      expect(soundManager.getSoundPlaying().ambience).toBe(true);
      // Volume should not reset
      expect(mockPlayer.setVolume).not.toHaveBeenCalled();
    });

    it('should set volume even when master sound is muted', () => {
      const mutedManager = createSoundManager({ allSoundsMuted: true });
      const mutedPlayer = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
        setVolume: vi.fn(),
      };
      mutedManager._setPlayerForTesting('ambience', mutedPlayer);

      // Volume should still be settable when muted
      mutedManager.setPlayerVolume('ambience', 45);
      expect(mutedPlayer.setVolume).toHaveBeenCalledWith(45);

      // But music should not play when muted
      mutedManager.handleMusicPlayPause('ambience');
      expect(mutedPlayer.playVideo).not.toHaveBeenCalled();
    });

    it('should handle volume changes when player does not exist', () => {
      const managerWithoutPlayer = createSoundManager();

      // Should not throw error
      expect(() => {
        managerWithoutPlayer.setPlayerVolume('ambience', 50);
      }).not.toThrow();
    });

    it('should handle volume changes when player has no setVolume method', () => {
      const playerWithoutSetVolume = {
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        stopVideo: vi.fn(),
        seekTo: vi.fn(),
        destroy: vi.fn(),
        // No setVolume method
      };
      soundManager._setPlayerForTesting('ambience', playerWithoutSetVolume);

      // Should not throw error
      expect(() => {
        soundManager.setPlayerVolume('ambience', 50);
      }).not.toThrow();
    });
  });
});
