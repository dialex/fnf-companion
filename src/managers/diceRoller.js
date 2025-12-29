import {
  mdiDice1,
  mdiDice2,
  mdiDice3,
  mdiDice4,
  mdiDice5,
  mdiDice6,
} from '@mdi/js';

/**
 * Manager for rolling dice
 * Pure logic only - no display, no UI concerns
 */
export const createDiceRoller = () => {
  /**
   * Roll a single die (returns 1-6)
   * @returns {number} A random integer between 1 and 6
   */
  const rollDiceOne = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  /**
   * Roll two dice and return both values and their sum
   * @returns {Object} Object with roll1, roll2, and sum properties
   */
  const rollDiceTwo = () => {
    const roll1 = rollDiceOne();
    const roll2 = rollDiceOne();
    return {
      roll1,
      roll2,
      sum: roll1 + roll2,
    };
  };

  /**
   * Get the dice icon path for a given value (1-6)
   * @param {number} value - The dice value
   * @returns {string} The icon path for the dice value
   */
  const getDiceIcon = (value) => {
    switch (value) {
      case 1:
        return mdiDice1;
      case 2:
        return mdiDice2;
      case 3:
        return mdiDice3;
      case 4:
        return mdiDice4;
      case 5:
        return mdiDice5;
      case 6:
        return mdiDice6;
      default:
        return mdiDice1;
    }
  };

  return {
    rollDiceOne,
    rollDiceTwo,
    getDiceIcon,
  };
};
