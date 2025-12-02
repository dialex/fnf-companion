import {
  mdiDice1,
  mdiDice2,
  mdiDice3,
  mdiDice4,
  mdiDice5,
  mdiDice6,
} from '@mdi/js';

/**
 * Get the dice icon for a given value (1-6)
 */
export const getDiceIcon = (value) => {
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

/**
 * Roll a single die (returns 1-6)
 */
export const rollDie = () => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Roll two dice and return the sum
 */
export const rollTwoDice = () => {
  const roll1 = rollDie();
  const roll2 = rollDie();
  return {
    roll1,
    roll2,
    sum: roll1 + roll2,
  };
};
