import React from 'react';
import Icon from '@mdi/react';
import { mdiDice3 } from '@mdi/js';
import { createDiceRoller } from '../managers/diceRoller';

const diceRoller = createDiceRoller();

/**
 * Get dice count for a roll type
 * @param {string} rollType - The roll type
 * @returns {number} Number of dice to display
 */
const getDiceCount = (rollType) => {
  if (rollType === 'rollDie') return 1;
  return 2; // rollDice, testSkill, testLuck, fight, useLuck all use 2 dice
};

/**
 * Displays dice animation and results
 * @param {string} rollingType - Current rolling type (null if not rolling)
 * @param {number|Array} result - Dice result (single number or array of two numbers)
 * @param {string} color - Dice color (default: '#007e6e')
 */
export default function DiceDisplay({
  rollingType,
  result,
  color = '#007e6e',
}) {
  if (rollingType) {
    const diceCount = getDiceCount(rollingType);
    const dice = [];

    for (let i = 0; i < diceCount; i++) {
      dice.push(
        <Icon
          key={i}
          path={mdiDice3}
          size={3}
          className="dice-rolling"
          style={{
            color,
            animationDuration: '0.3s',
          }}
        />
      );
    }

    return <div className="d-flex align-items-center gap-2">{dice}</div>;
  }

  if (result) {
    const results = Array.isArray(result) ? result : [result];
    return (
      <div className="d-flex align-items-center gap-2">
        {results.map((value, index) => (
          <Icon
            key={index}
            path={diceRoller.getDiceIcon(value)}
            size={3}
            style={{ color }}
          />
        ))}
      </div>
    );
  }

  return null;
}
