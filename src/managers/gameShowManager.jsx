/**
 * Manager for visual/audio feedback to the user
 * Handles dice roll animations, results, messages, and triggers sounds
 */

import React from 'react';

const LUCK_TEST_MESSAGE_DURATION_MS = 3000;

/**
 * Creates a GameShowManager instance
 * @param {Object} soundManager - SoundManager instance for playing sounds
 * @returns {Object} GameShowManager with methods to show feedback
 */
export const createGameShowManager = (soundManager) => {
  let displayState = {
    diceRolling: null, // 1 or 2 (number of dice rolling), or null
    diceResult: null, // number, array, or null
    luckTestMessage: null, // JSX element or null
  };

  const listeners = new Set();

  const notifyListeners = () => {
    listeners.forEach((callback) => callback({ ...displayState }));
  };

  /**
   * Shows dice rolling animation
   * @param {number} diceCount - Number of dice rolling: 1 or 2
   */
  const showDiceRolling = (diceCount) => {
    displayState.diceRolling = diceCount;
    displayState.diceResult = null; // Clear previous result
    notifyListeners();
  };

  /**
   * Shows dice roll result
   * @param {number|Array} result - Single die result (number) or two dice result (array)
   */
  const showDiceResult = (result) => {
    displayState.diceRolling = null;
    displayState.diceResult = result;
    notifyListeners();
  };

  /**
   * Shows luck test result message and triggers sound if lucky
   * @param {boolean} isLucky - Whether the luck test was successful
   * @param {Object} gameState - Game state for sound manager
   */
  const showLuckTestResult = (isLucky, gameState) => {
    const messageText = isLucky ? 'You were lucky' : 'Tough luck'; //TODO: translate file?
    const alertType = isLucky ? 'success' : 'danger';

    displayState.luckTestMessage = (
      <div
        className={`alert content alert-${alertType} mb-0 text-center`}
        role="alert"
      >
        {messageText}
      </div>
    );

    if (isLucky) {
      soundManager.playLuckySound(gameState);
    }

    notifyListeners();

    // Clear message after duration
    setTimeout(() => {
      displayState.luckTestMessage = null;
      notifyListeners();
    }, LUCK_TEST_MESSAGE_DURATION_MS);
  };

  /**
   * Subscribe to display state changes
   * @param {Function} callback - Called with display state whenever it changes
   * @returns {Function} Unsubscribe function
   */
  const subscribe = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  /**
   * Get current display state
   * @returns {Object} Current display state
   */
  const getDisplayState = () => ({ ...displayState });

  return {
    showDiceRolling,
    showDiceResult,
    showLuckTestResult,
    subscribe,
    getDisplayState,
  };
};
