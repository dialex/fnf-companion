/**
 * Manager for playing sounds (local mp3 files, YouTube tracks, game-specific sounds)
 * Owns sound playback state: mute settings, playing status, etc.
 */

/**
 * Creates a SoundManager instance
 * @param {Object} options - Initialization options
 * @param {boolean} options.allSoundsMuted - Initial mute state (default: false)
 * @param {boolean} options.actionSoundsEnabled - Initial action sounds state (default: true)
 * @returns {Object} SoundManager with methods to play sounds and manage music
 */
export const createSoundManager = (options = {}) => {
  // Internal state
  let allSoundsMuted = options.allSoundsMuted ?? false;
  let actionSoundsEnabled = options.actionSoundsEnabled ?? true;
  const soundPlaying = {
    ambience: false,
    battle: false,
    victory: false,
    defeat: false,
  };
  const customSoundPlaying = {};
  const soundStoppedManually = {
    ambience: false,
    battle: false,
    victory: false,
    defeat: false,
  };
  // YouTube player instances
  const youtubePlayers = {};
  // State change listeners (for React updates)
  const stateChangeListeners = new Set();
  /**
   * Gets the current mute state
   * @returns {boolean} Whether all sounds are muted
   */
  const getAllSoundsMuted = () => allSoundsMuted;

  /**
   * Sets the mute state
   * @param {boolean} muted - Whether to mute all sounds
   */
  const setAllSoundsMuted = (muted) => {
    allSoundsMuted = muted;
  };

  /**
   * Gets the action sounds enabled state
   * @returns {boolean} Whether action sounds are enabled
   */
  const getActionSoundsEnabled = () => actionSoundsEnabled;

  /**
   * Sets the action sounds enabled state
   * @param {boolean} enabled - Whether to enable action sounds
   */
  const setActionSoundsEnabled = (enabled) => {
    actionSoundsEnabled = enabled;
  };

  /**
   * Gets which sounds are currently playing
   * @returns {Object} Object with sound types as keys and boolean playing status
   */
  const getSoundPlaying = () => ({ ...soundPlaying });

  /**
   * Gets which custom sounds are currently playing
   * @returns {Object} Object with custom sound IDs as keys and boolean playing status
   */
  const getCustomSoundPlaying = () => ({ ...customSoundPlaying });

  /**
   * Gets which sounds were manually stopped
   * @returns {Object} Object with sound types as keys and boolean stopped status
   */
  const getSoundStoppedManually = () => ({ ...soundStoppedManually });

  /**
   * Notify listeners of state changes (for React updates)
   */
  const notifyStateChange = () => {
    stateChangeListeners.forEach((callback) => callback());
  };

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called when sound playing state changes
   * @returns {Function} Unsubscribe function
   */
  const subscribe = (callback) => {
    stateChangeListeners.add(callback);
    return () => stateChangeListeners.delete(callback);
  };

  /**
   * Plays a local mp3 sound file
   * @param {string} soundFile - The sound file name (e.g., 'rayman-lucky.mp3')
   */
  const playLocalSound = (soundFile) => {
    if (allSoundsMuted || !actionSoundsEnabled) {
      return;
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${soundFile}`);
    audio.play().catch((error) => {
      console.warn('Could not play audio:', error);
    });
  };

  /**
   * Plays the lucky sound effect
   */
  const playLuckySound = () => {
    playLocalSound('rayman-lucky.mp3');
  };

  /**
   * Plays the drink potion sound effect
   */
  const playDrinkSound = () => {
    playLocalSound('minecraft-drink.mp3');
  };

  /**
   * Plays the consume meal sound effect
   */
  const playEatSound = () => {
    playLocalSound('minecraft-eat.mp3');
  };

  /**
   * Plays the monster took damage sound effect
   */
  const playMonsterDamageSound = () => {
    playLocalSound('minecraft-hit-monster.mp3');
  };

  /**
   * Plays the player took damage sound effect
   */
  const playPlayerDamageSound = () => {
    playLocalSound('minecraft-hurt.mp3');
  };

  /**
   * Plays the purchase sound effect
   */
  const playPurchaseSound = () => {
    playLocalSound('purchase.mp3');
  };

  /**
   * Handles play/pause for music (YouTube tracks)
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   */
  const handleMusicPlayPause = (soundType) => {
    if (allSoundsMuted) return;

    const player = youtubePlayers[soundType];
    if (!player) return;

    try {
      if (soundPlaying[soundType]) {
        // Currently playing - pause it
        player.pauseVideo();
        soundPlaying[soundType] = false;
        notifyStateChange();
      } else {
        // Not playing - pause all other music and play this one
        // Pause all other regular sounds
        const soundTypes = ['ambience', 'battle', 'victory', 'defeat'];
        soundTypes.forEach((st) => {
          if (st !== soundType && soundPlaying[st]) {
            const otherPlayer = youtubePlayers[st];
            if (otherPlayer) {
              try {
                otherPlayer.pauseVideo();
                soundPlaying[st] = false;
              } catch (e) {
                // Ignore errors
              }
            }
          }
        });
        // Pause all custom sounds
        Object.keys(customSoundPlaying).forEach((customId) => {
          if (customSoundPlaying[customId]) {
            const customPlayer = youtubePlayers[`custom-${customId}`];
            if (customPlayer) {
              try {
                customPlayer.pauseVideo();
                delete customSoundPlaying[customId];
              } catch (e) {
                // Ignore errors
              }
            }
          }
        });
        // Play the selected sound
        player.playVideo();
        soundPlaying[soundType] = true;
        notifyStateChange();
      }
    } catch (e) {
      console.error('Error controlling YouTube player:', e);
    }
  };

  /**
   * Handles stop for music (YouTube tracks)
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   */
  const handleMusicStop = (soundType) => {
    const player = youtubePlayers[soundType];
    if (!player) return;

    // Only stop if it's currently playing
    if (!soundPlaying[soundType]) return;

    try {
      // Mark as manually stopped to prevent auto-restart
      soundStoppedManually[soundType] = true;
      // Pause first, then seek to beginning
      player.pauseVideo();
      player.seekTo(0, true); // true = allowSeekAhead
      soundPlaying[soundType] = false;
      notifyStateChange();
    } catch (e) {
      console.error('Error stopping YouTube player:', e);
    }
  };

  /**
   * Handles delete for music (YouTube tracks)
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   * @param {Function} onDelete - Callback for external cleanup (setSoundUrls, setSoundInputs, setSoundErrors)
   */
  const handleMusicDelete = (soundType, onDelete) => {
    // Stop and destroy the player
    const player = youtubePlayers[soundType];
    if (player) {
      try {
        player.stopVideo();
        player.destroy();
      } catch (e) {
        // Ignore errors
      }
      delete youtubePlayers[soundType];
    }

    // Update internal state
    soundPlaying[soundType] = false;
    soundStoppedManually[soundType] = false;

    // Notify external systems (GameStateManager for URLs, App.jsx for UI state)
    if (onDelete) {
      onDelete(soundType);
    }
    notifyStateChange();
  };

  /**
   * Initialize a YouTube player for a sound type
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   * @param {string} videoId - YouTube video ID
   * @param {Object} options - Options object
   * @param {number} options.volume - Initial volume (0-100)
   * @param {Function} options.onStateChange - Callback for player state changes
   * @returns {Object|null} YouTube player instance or null if creation failed
   */
  const initPlayer = (
    soundType,
    videoId,
    { volume = 25, onStateChange } = {}
  ) => {
    if (!window.YT || !window.YT.Player) {
      return null;
    }

    // Destroy existing player if it exists
    if (youtubePlayers[soundType]) {
      try {
        youtubePlayers[soundType].destroy();
      } catch (e) {
        // Ignore errors
      }
      delete youtubePlayers[soundType];
    }

    const playerId = `youtube-player-${soundType}`;
    // Create hidden iframe container
    let container = document.getElementById(playerId);
    if (!container) {
      container = document.createElement('div');
      container.id = playerId;
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    try {
      const shouldLoop = soundType === 'ambience' || soundType === 'battle';
      youtubePlayers[soundType] = new window.YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          ...(shouldLoop ? { loop: 1, playlist: videoId } : {}),
        },
        events: {
          onReady: (event) => {
            const player = event.target;
            if (player && typeof player.setVolume === 'function') {
              try {
                player.setVolume(volume);
              } catch (e) {
                console.error('Error setting initial volume:', e);
              }
            }
          },
          onStateChange: (event) => {
            // 0 = ended, 1 = playing, 2 = paused
            if (soundStoppedManually[soundType]) {
              if (event.data === 0 || event.data === 2) {
                soundPlaying[soundType] = false;
                notifyStateChange();
              }
              return;
            }

            if (event.data === 0) {
              // Video ended
              if (shouldLoop) {
                // Restart if it should loop (ambience/battle)
                try {
                  const player = youtubePlayers[soundType];
                  if (player) {
                    player.seekTo(0);
                    player.playVideo();
                  }
                } catch (e) {
                  soundPlaying[soundType] = false;
                  notifyStateChange();
                }
              } else {
                // Stop for victory and defeat - ensure they don't loop
                try {
                  const player = youtubePlayers[soundType];
                  if (player) {
                    player.stopVideo();
                  }
                } catch (e) {
                  // Ignore errors
                }
                soundPlaying[soundType] = false;
                notifyStateChange();
              }
            } else if (event.data === 2) {
              // Paused
              soundPlaying[soundType] = false;
              notifyStateChange();
            } else if (event.data === 1) {
              // Playing
              soundPlaying[soundType] = true;
              notifyStateChange();
            }

            // Call external callback if provided
            if (onStateChange) {
              onStateChange(event);
            }
          },
        },
      });
      return youtubePlayers[soundType];
    } catch (e) {
      console.error('Error creating YouTube player:', e);
      return null;
    }
  };

  /**
   * Initialize a YouTube player for a custom sound
   * @param {string} customId - Custom sound ID
   * @param {string} videoId - YouTube video ID
   * @param {Object} options - Options object
   * @param {number} options.volume - Initial volume (0-100)
   * @returns {Object|null} YouTube player instance or null if creation failed
   */
  const initCustomPlayer = (customId, videoId, { volume = 25 } = {}) => {
    if (!window.YT || !window.YT.Player) {
      return null;
    }

    const playerKey = `custom-${customId}`;
    if (youtubePlayers[playerKey]) {
      return youtubePlayers[playerKey]; // Player already exists
    }

    const playerId = `youtube-player-${playerKey}`;
    let container = document.getElementById(playerId);
    if (!container) {
      container = document.createElement('div');
      container.id = playerId;
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    try {
      youtubePlayers[playerKey] = new window.YT.Player(playerId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            const player = event.target;
            if (player && typeof player.setVolume === 'function') {
              try {
                player.setVolume(volume);
              } catch (e) {
                console.error('Error setting initial volume:', e);
              }
            }
          },
          onStateChange: (event) => {
            if (soundStoppedManually[playerKey]) {
              if (event.data === 0 || event.data === 2) {
                delete customSoundPlaying[customId];
                notifyStateChange();
              }
              return;
            }

            if (event.data === 0) {
              // Video ended - stop it
              try {
                const player = youtubePlayers[playerKey];
                if (player) {
                  player.stopVideo();
                }
              } catch (e) {
                // Ignore errors
              }
              delete customSoundPlaying[customId];
              notifyStateChange();
            } else if (event.data === 2) {
              // Paused
              delete customSoundPlaying[customId];
              notifyStateChange();
            } else if (event.data === 1) {
              // Playing
              customSoundPlaying[customId] = true;
              notifyStateChange();
            }
          },
        },
      });
      return youtubePlayers[playerKey];
    } catch (e) {
      console.error('Error creating custom YouTube player:', e);
      return null;
    }
  };

  /**
   * Get a YouTube player instance
   * @param {string} soundType - The sound type or custom sound key
   * @returns {Object|undefined} YouTube player instance or undefined
   */
  const getPlayer = (soundType) => {
    return youtubePlayers[soundType];
  };

  /**
   * Set a player directly (for testing purposes)
   * @param {string} soundType - The sound type or custom sound key
   * @param {Object} player - YouTube player instance
   */
  const _setPlayerForTesting = (soundType, player) => {
    youtubePlayers[soundType] = player;
  };

  /**
   * Set volume on a player
   * @param {string} soundType - The sound type or custom sound key
   * @param {number} volume - Volume (0-100)
   */
  const setPlayerVolume = (soundType, volume) => {
    const player = youtubePlayers[soundType];
    if (player && typeof player.setVolume === 'function') {
      try {
        player.setVolume(volume);
      } catch (e) {
        console.error('Error setting volume:', e);
      }
    }
  };

  return {
    // State getters/setters
    getAllSoundsMuted,
    setAllSoundsMuted,
    getActionSoundsEnabled,
    setActionSoundsEnabled,
    getSoundPlaying,
    getCustomSoundPlaying,
    getSoundStoppedManually,
    // Local sound methods
    playLocalSound,
    playLuckySound,
    playDrinkSound,
    playEatSound,
    playMonsterDamageSound,
    playPlayerDamageSound,
    playPurchaseSound,
    // Music control methods
    handleMusicPlayPause,
    handleMusicStop,
    handleMusicDelete,
    // Player management
    initPlayer,
    initCustomPlayer,
    getPlayer,
    setPlayerVolume,
    subscribe,
    // Test helpers
    _setPlayerForTesting,
  };
};
