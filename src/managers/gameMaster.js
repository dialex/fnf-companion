/**
 * GameMaster - Orchestrates game actions and enforces game rules
 *
 * GameMaster coordinates between managers to execute game actions:
 * - Validates action preconditions
 * - Rolls dice (if needed) via DiceRoller
 * - Applies game rules
 * - Updates state via GameStateManager
 * - Shows feedback via GameShowManager (which triggers sounds via SoundManager)
 */

/**
 * Creates a GameMaster instance
 * @param {Object} dependencies - Manager dependencies
 * @param {Object} dependencies.diceRoller - DiceRoller instance
 * @param {Object} dependencies.gameStateManager - GameStateManager instance
 * @param {Object} dependencies.gameShowManager - GameShowManager instance
 * @param {Object} dependencies.soundManager - SoundManager instance
 * @returns {Object} GameMaster with action methods and game rules
 */
export const createGameMaster = ({
  diceRoller,
  gameStateManager,
  gameShowManager,
  soundManager,
}) => {
  // ============================================================================
  // Core Game Rules (Pure Functions)
  // ============================================================================

  /**
   * Determines if a luck test was successful
   * @param {number} rollSum - Sum of the two dice rolls
   * @param {number} currentLuck - Current luck value
   * @returns {boolean} True if rollSum <= currentLuck
   */
  const isLucky = (rollSum, currentLuck) => {
    return rollSum <= currentLuck;
  };

  /**
   * Checks if player can test luck
   * @param {number} currentLuck - Current luck value
   * @returns {boolean} True if currentLuck > 0
   */
  const canTestLuck = (currentLuck) => {
    return currentLuck > 0;
  };

  /**
   * Resolves combat between hero and monster
   * @param {number} heroTotal - Hero's dice sum + skill
   * @param {number} monsterTotal - Monster's dice sum + skill
   * @returns {string} 'heroWins' | 'monsterWins' | 'tie'
   */
  const resolveCombat = (heroTotal, monsterTotal) => {
    if (heroTotal > monsterTotal) {
      return 'heroWins';
    } else if (monsterTotal > heroTotal) {
      return 'monsterWins';
    } else {
      return 'tie';
    }
  };

  /**
   * Calculates damage dealt by winner
   * @param {string} winner - 'heroWins' | 'monsterWins'
   * @returns {number} Damage amount (always 2)
   */
  const calculateDamage = (winner) => {
    return 2;
  };

  /**
   * Calculates luck effect on health during fight
   * @param {boolean} heroWon - Whether hero won the last attack
   * @param {boolean} isLucky - Whether luck test was successful
   * @param {number} currentHealth - Current hero health
   * @param {number|null} maxHealth - Maximum hero health (null if no max)
   * @returns {Object} Object with heroHealthDelta and monsterHealthDelta
   */
  const calculateLuckEffect = (heroWon, isLucky, currentHealth, maxHealth) => {
    if (heroWon) {
      if (isLucky) {
        // Hero won + lucky: monster takes 1 extra damage
        return { heroHealthDelta: 0, monsterHealthDelta: -1 };
      } else {
        // Hero won + unlucky: monster recovers 1 health
        return { heroHealthDelta: 0, monsterHealthDelta: 1 };
      }
    } else {
      if (isLucky) {
        // Monster won + lucky: hero recovers 1 health (capped at max)
        const newHealth =
          maxHealth !== null
            ? Math.min(currentHealth + 1, maxHealth)
            : currentHealth + 1;
        const actualIncrease = newHealth - currentHealth;
        return { heroHealthDelta: actualIncrease, monsterHealthDelta: 0 };
      } else {
        // Monster won + unlucky: hero takes 1 extra damage
        return { heroHealthDelta: -1, monsterHealthDelta: 0 };
      }
    }
  };

  /**
   * Checks if fight has ended
   * @param {number} heroHealth - Current hero health
   * @param {number} monsterHealth - Current monster health
   * @returns {string|null} 'won' | 'lost' | null
   */
  const checkFightEnd = (heroHealth, monsterHealth) => {
    if (monsterHealth <= 0) {
      return 'won';
    } else if (heroHealth <= 0) {
      return 'lost';
    }
    return null;
  };

  // ============================================================================
  // Action Methods
  // ============================================================================

  /**
   * Executes a fight attack
   * @returns {Object} Fight result object with type, message, totals, badges, fightEnded, showUseLuck
   */
  const actionFight = () => {
    // Roll dice for both hero and monster
    const heroRolls = diceRoller.rollDiceTwo();
    const monsterRolls = diceRoller.rollDiceTwo();

    // Calculate totals
    const heroSkill = parseInt(gameStateManager.getSkill()) || 0;
    const monsterSkillValue = parseInt(gameStateManager.getMonsterSkill()) || 0;
    const heroTotal = heroRolls.sum + heroSkill;
    const monsterTotal = monsterRolls.sum + monsterSkillValue;

    // Resolve combat
    const resultType = resolveCombat(heroTotal, monsterTotal);

    // Get current health values
    const currentHealth = parseInt(gameStateManager.getHealth()) || 0;
    const currentMonsterHealth =
      parseInt(gameStateManager.getMonsterHealth()) || 0;

    // Calculate new health values
    let newHealth = currentHealth;
    let newMonsterHealth = currentMonsterHealth;
    const badges = [];

    if (resultType === 'heroWins') {
      newMonsterHealth = Math.max(
        0,
        currentMonsterHealth - calculateDamage('heroWins')
      );
      badges.push({ field: 'monsterHealth', value: '-2', type: 'danger' });
      soundManager.playMonsterDamageSound();
    } else if (resultType === 'monsterWins') {
      newHealth = Math.max(0, currentHealth - calculateDamage('monsterWins'));
      badges.push({ field: 'heroHealth', value: '-2', type: 'danger' });
      soundManager.playPlayerDamageSound();
    }

    // Update dice rolls in state
    gameStateManager.setHeroDiceRolls([heroRolls.roll1, heroRolls.roll2]);
    gameStateManager.setMonsterDiceRolls([
      monsterRolls.roll1,
      monsterRolls.roll2,
    ]);

    // Update health values
    if (newHealth !== currentHealth) {
      gameStateManager.setHealth(String(newHealth));
    }
    if (newMonsterHealth !== currentMonsterHealth) {
      gameStateManager.setMonsterHealth(String(newMonsterHealth));
    }

    // Check if fight ended
    const fightEnded = checkFightEnd(newHealth, newMonsterHealth);
    let showUseLuck = false;

    if (fightEnded === 'won') {
      // Handle victory
      gameStateManager.setFightOutcome('won');
      const creatureName = gameStateManager.getMonsterCreature().trim();
      if (creatureName) {
        const currentGraveyard = gameStateManager.getGraveyard().trim();
        const separator = currentGraveyard ? '\n' : '';
        // Note: Translation will be handled by App.jsx
        gameStateManager.setGraveyard(
          `${currentGraveyard}${separator}${creatureName}`
        );
      }
      // Note: Victory sound will be played by App.jsx via autoPlaySound('victory')
      gameStateManager.setIsFighting(false);
    } else if (fightEnded === 'lost') {
      // Handle defeat
      gameStateManager.setFightOutcome('lost');
      // Mark trail as died (handled by App.jsx via handleTrailPillNoteChange)
      // Note: Defeat sound and YOU DIED animation will be handled by App.jsx
      gameShowManager.showYouDied();
      gameStateManager.setIsFighting(false);
    } else {
      // Fight continues - show use luck button if there was a winner
      if (resultType === 'heroWins' || resultType === 'monsterWins') {
        showUseLuck = true;
        gameStateManager.setShowUseLuck(true);
      } else {
        // Tie - don't show use luck button
        showUseLuck = false;
        gameStateManager.setShowUseLuck(false);
      }

      // Set fight result
      // Note: Message translation will be handled by App.jsx
      gameStateManager.setFightResult({
        type: resultType,
        message: '', // Will be set by App.jsx with translation
        heroTotal,
        monsterTotal,
      });
    }

    // Reset luck used flag for new attack
    gameStateManager.setLuckUsed(false);

    return {
      type: resultType,
      heroTotal,
      monsterTotal,
      heroRolls: [heroRolls.roll1, heroRolls.roll2],
      monsterRolls: [monsterRolls.roll1, monsterRolls.roll2],
      badges,
      fightEnded,
      showUseLuck,
    };
  };

  /**
   * Uses luck during fight
   * @returns {Object} Luck test result object with roll1, roll2, isLucky, badges, fightEnded
   */
  const actionUseLuck = () => {
    const currentLuck = parseInt(gameStateManager.getLuck()) || 0;
    const fightResult = gameStateManager.getFightResult();

    if (!fightResult) {
      throw new Error('Cannot use luck without a fight result');
    }

    // Roll dice for luck test
    const rolls = diceRoller.rollDiceTwo();
    const isLuckyResult = isLucky(rolls.sum, currentLuck);

    // Show luck test result
    gameShowManager.showLuckTestResult(isLuckyResult);

    // Get current health values
    const currentHealth = parseInt(gameStateManager.getHealth()) || 0;
    const currentMonsterHealth =
      parseInt(gameStateManager.getMonsterHealth()) || 0;
    const maxHealth =
      gameStateManager.getMaxHealth() !== null
        ? parseInt(gameStateManager.getMaxHealth())
        : null;

    // Determine if hero won last fight
    const heroWonLastFight = fightResult.type === 'heroWins';

    // Calculate luck effect
    const luckEffect = calculateLuckEffect(
      heroWonLastFight,
      isLuckyResult,
      currentHealth,
      maxHealth
    );

    // Apply luck effect
    let newHealth = currentHealth + luckEffect.heroHealthDelta;
    let newMonsterHealth = currentMonsterHealth + luckEffect.monsterHealthDelta;

    // Ensure health doesn't go below 0
    newHealth = Math.max(0, newHealth);
    newMonsterHealth = Math.max(0, newMonsterHealth);

    // Update health values
    const badges = [];
    if (luckEffect.heroHealthDelta !== 0) {
      gameStateManager.setHealth(String(newHealth));
      if (luckEffect.heroHealthDelta > 0) {
        badges.push({ field: 'heroHealth', value: '+1', type: 'success' });
      } else {
        badges.push({ field: 'heroHealth', value: '-1', type: 'danger' });
        soundManager.playPlayerDamageSound();
      }
    }
    if (luckEffect.monsterHealthDelta !== 0) {
      gameStateManager.setMonsterHealth(String(newMonsterHealth));
      if (luckEffect.monsterHealthDelta > 0) {
        badges.push({ field: 'monsterHealth', value: '+1', type: 'success' });
      } else {
        badges.push({ field: 'monsterHealth', value: '-1', type: 'danger' });
        soundManager.playMonsterDamageSound();
      }
    }

    // Decrement luck
    const newLuck = Math.max(0, currentLuck - 1);
    gameStateManager.setLuck(String(newLuck));

    // Mark luck as used
    gameStateManager.setLuckUsed(true);

    // Check if fight ended
    const fightEnded = checkFightEnd(newHealth, newMonsterHealth);

    if (fightEnded === 'won') {
      // Handle victory
      gameStateManager.setFightOutcome('won');
      const creatureName = gameStateManager.getMonsterCreature().trim();
      if (creatureName) {
        const currentGraveyard = gameStateManager.getGraveyard().trim();
        const separator = currentGraveyard ? '\n' : '';
        gameStateManager.setGraveyard(
          `${currentGraveyard}${separator}${creatureName}`
        );
      }
      // Note: Victory sound will be played by App.jsx via autoPlaySound('victory')
      gameStateManager.setIsFighting(false);
    } else if (fightEnded === 'lost') {
      // Handle defeat
      gameStateManager.setFightOutcome('lost');
      // Mark trail as died (handled by App.jsx)
      // Note: Defeat sound and YOU DIED animation will be handled by App.jsx
      gameShowManager.showYouDied();
      gameStateManager.setIsFighting(false);
    }

    return {
      roll1: rolls.roll1,
      roll2: rolls.roll2,
      isLucky: isLuckyResult,
      badges,
      fightEnded,
    };
  };

  return {
    // Game rules
    isLucky,
    canTestLuck,
    resolveCombat,
    calculateDamage,
    calculateLuckEffect,
    checkFightEnd,

    // Actions
    actionFight,
    actionUseLuck,
  };
};
