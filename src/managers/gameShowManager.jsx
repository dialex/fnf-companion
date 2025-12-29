/**
 * Manager for visual/audio feedback to the user
 * Handles dice roll animations, results, messages, badges, and triggers sounds
 */

import React from 'react';
import { i18nManager } from './i18nManager';
import { createFieldBadgeManager } from '../utils/fieldBadges';

/**
 * Creates a GameShowManager instance
 * @param {Object} soundManager - SoundManager instance for playing sounds
 * @param {Object} gameStateManager - GameStateManager instance for checking state
 * @returns {Object} GameShowManager with methods to show feedback
 */
export const createGameShowManager = (soundManager, gameStateManager) => {
  const t = i18nManager.t.bind(i18nManager);
  const fieldBadgeManager = createFieldBadgeManager();
  let displayState = {
    diceRolling: null, // 1 or 2 (number of dice rolling), or null
    diceResult: null, // number, array, or null
    luckTestMessage: null, // JSX element or null
    youDiedOverlay: null, // JSX element or null - YOU DIED animation overlay
    fieldBadges: {}, // Field badges state
  };

  const listeners = new Set();

  // Subscribe to field badge manager to sync badges into display state
  fieldBadgeManager.subscribe((badges) => {
    displayState.fieldBadges = badges;
    notifyListeners();
  });

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
    displayState.luckTestMessage = null; // Clear previous luck test message
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
   */
  const showLuckTestResult = (isLucky) => {
    const messageText = isLucky
      ? t('dice.youWereLucky')
      : t('dice.youWereUnlucky');
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
      soundManager.playLuckySound();
    }

    notifyListeners();
    // Message will be cleared when a new dice roll starts, not automatically
  };

  /**
   * Shows YOU DIED animation
   * Automatically hides after 9 seconds
   */
  const showYouDied = () => {
    displayState.youDiedOverlay = (
      <div className="you-died-overlay">
        <div className="you-died-text">{t('fight.youDied')}</div>
      </div>
    );
    notifyListeners();

    // Auto-hide after 9 seconds
    setTimeout(() => {
      displayState.youDiedOverlay = null;
      notifyListeners();
    }, 9000);
  };

  /**
   * Shows a field badge (e.g., +5 health, -2 damage)
   * @param {string} fieldName - Name of the field (e.g., 'health', 'skill')
   * @param {string} value - Badge value to display (e.g., '+5', '-2')
   * @param {string} type - Badge type ('success', 'danger', etc.)
   */
  const showFieldBadge = (fieldName, value, type = 'success') => {
    fieldBadgeManager.showBadge(fieldName, value, type);
  };

  /**
   * Triggers confetti celebration animation
   * Used when player reaches chapter 400
   */
  const celebrate = () => {
    // Dynamically import confetti to avoid bundling it if not used
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      // Create a confetti cannon effect with custom colors
      const colors = ['#FF0000', '#FFD700', '#FFFFFF'];
      const duration = 1000 * 15; // 15 seconds
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 200,
        zIndex: 0,
        colors: colors,
      };

      function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Launch confetti from multiple positions
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    });
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

  /**
   * Handles monster name input focus - UI reactivity rule
   * If fight has ended, clears fight results immediately to improve UX
   */
  const onMonsterNameFocus = () => {
    if (!gameStateManager) return;

    const fightEnded = gameStateManager.getFightOutcome() !== null;

    // UI reactivity rule: If fight ended and user focuses input, clear fight results immediately
    if (fightEnded) {
      gameStateManager.clearFightResults();
    }
  };

  return {
    showDiceRolling,
    showDiceResult,
    showLuckTestResult,
    showYouDied,
    showFieldBadge,
    celebrate,
    onMonsterNameFocus,
    subscribe,
    getDisplayState,
  };
};
