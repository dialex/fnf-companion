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
   * @param {Object} params - Parameters object
   * @param {Object} params.youtubePlayers - Object containing YouTube player instances (external - DOM objects)
   * @param {Function} params.onStateChange - Optional callback when playing state changes (for React updates)
   */
  const handleMusicPlayPause = (
    soundType,
    { youtubePlayers, onStateChange }
  ) => {
    if (allSoundsMuted) return;

    const player = youtubePlayers[soundType];
    if (!player) return;

    try {
      if (soundPlaying[soundType]) {
        // Currently playing - pause it
        player.pauseVideo();
        soundPlaying[soundType] = false;
        if (onStateChange) onStateChange();
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
        if (onStateChange) onStateChange();
      }
    } catch (e) {
      console.error('Error controlling YouTube player:', e);
    }
  };

  /**
   * Handles stop for music (YouTube tracks)
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   * @param {Object} params - Parameters object
   * @param {Object} params.youtubePlayers - Object containing YouTube player instances (external - DOM objects)
   * @param {Function} params.onStateChange - Optional callback when playing state changes (for React updates)
   */
  const handleMusicStop = (soundType, { youtubePlayers, onStateChange }) => {
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
      if (onStateChange) onStateChange();
    } catch (e) {
      console.error('Error stopping YouTube player:', e);
    }
  };

  /**
   * Handles delete for music (YouTube tracks)
   * @param {string} soundType - The sound type ('ambience', 'battle', 'victory', 'defeat')
   * @param {Object} params - Parameters object
   * @param {Object} params.youtubePlayers - Object containing YouTube player instances (external - DOM objects)
   * @param {Function} params.onDelete - Callback with delete actions (setSoundUrls, setSoundInputs, setSoundErrors)
   * @param {Function} params.onStateChange - Optional callback when playing state changes (for React updates)
   */
  const handleMusicDelete = (
    soundType,
    { youtubePlayers, onDelete, onStateChange }
  ) => {
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
    if (onStateChange) onStateChange();
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
  };
};
