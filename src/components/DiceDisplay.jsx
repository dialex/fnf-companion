import React from 'react';
import Icon from '@mdi/react';
import { mdiDice3 } from '@mdi/js';
import { createDiceRoller } from '../managers/diceRoller';

const diceRoller = createDiceRoller();

/**
 * Displays dice animation and results
 * @param {number} diceRolling - Number of dice rolling (1 or 2, or null if not rolling)
 * @param {number|Array} result - Dice result (single number or array of two numbers)
 * @param {string} color - Dice color (default: '#007e6e')
 */
export default function DiceDisplay({
  diceRolling,
  result,
  color = '#007e6e',
}) {
  if (diceRolling !== null && diceRolling !== undefined) {
    const diceCount = diceRolling;
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
