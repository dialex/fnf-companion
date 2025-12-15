/**
 * Manager for playing sounds (local mp3 files, YouTube tracks, game-specific sounds)
 */

/**
 * Creates a SoundManager instance
 * @returns {Object} SoundManager with methods to play sounds
 */
export const createSoundManager = () => {
  /**
   * Plays a local mp3 sound file
   * @param {string} soundFile - The sound file name (e.g., 'rayman-lucky.mp3')
   * @param {Object} gameState - Game state containing mute settings
   * @param {boolean} gameState.allSoundsMuted - Whether all sounds are muted
   * @param {boolean} gameState.actionSoundsEnabled - Whether action sounds are enabled
   */
  const playLocalSound = (soundFile, gameState) => {
    if (gameState.allSoundsMuted || !gameState.actionSoundsEnabled) {
      return;
    }

    const audio = new Audio(`${import.meta.env.BASE_URL}audio/${soundFile}`);
    audio.play().catch((error) => {
      console.warn('Could not play audio:', error);
    });
  };

  /**
   * Plays the lucky sound effect
   * @param {Object} gameState - Game state containing mute settings
   * @param {boolean} gameState.allSoundsMuted - Whether all sounds are muted
   * @param {boolean} gameState.actionSoundsEnabled - Whether action sounds are enabled
   */
  const playLuckySound = (gameState) => {
    playLocalSound('rayman-lucky.mp3', gameState);
  };

  return {
    playLocalSound,
    playLuckySound,
  };
};
