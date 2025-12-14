/**
 * Manager for handling action sounds based on game events
 */

/**
 * Plays a sound effect
 * @param {string} soundFile - The sound file name (e.g., 'rayman-lucky.mp3')
 */
export const playSound = (soundFile) => {
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${soundFile}`);
  audio.play().catch((error) => {
    console.warn('Could not play audio:', error);
  });
};

export const createActionSoundsManager = () => {
  /**
   * Handles a luck test result and plays sound if needed
   * @param {boolean} isLucky - Whether the luck test was successful
   * @param {boolean} actionSoundsEnabled - Whether action sounds are enabled
   */
  const echoLuckTest = (isLucky, actionSoundsEnabled) => {
    if (actionSoundsEnabled && isLucky) {
      playSound('rayman-lucky.mp3');
    }
  };

  return {
    echoLuckTest,
  };
};
