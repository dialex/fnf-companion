import { describe, it, expect } from 'vitest';
import { createDiceRoller } from '../../managers/diceRoller';

describe('DiceRoller', () => {
  describe('rollDiceOne', () => {
    it('should return a number between 1 and 6', () => {
      const diceRoller = createDiceRoller();

      for (let i = 0; i < 100; i++) {
        const result = diceRoller.rollDiceOne();
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('rollDiceTwo', () => {
    it('should return an object with roll1, roll2, and sum', () => {
      const diceRoller = createDiceRoller();
      const result = diceRoller.rollDiceTwo();

      expect(result).toHaveProperty('roll1');
      expect(result).toHaveProperty('roll2');
      expect(result).toHaveProperty('sum');
    });

    it('should calculate sum correctly', () => {
      const diceRoller = createDiceRoller();
      const result = diceRoller.rollDiceTwo();

      expect(result.sum).toBe(result.roll1 + result.roll2);
      expect(result.sum).toBeGreaterThanOrEqual(2);
      expect(result.sum).toBeLessThanOrEqual(12);
    });

    it('should return valid dice values (1-6) for both rolls', () => {
      const diceRoller = createDiceRoller();

      for (let i = 0; i < 100; i++) {
        const result = diceRoller.rollDiceTwo();
        expect(result.roll1).toBeGreaterThanOrEqual(1);
        expect(result.roll1).toBeLessThanOrEqual(6);
        expect(result.roll2).toBeGreaterThanOrEqual(1);
        expect(result.roll2).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('getDiceIcon', () => {
    it('should return correct icon for each dice value 1-6', () => {
      const diceRoller = createDiceRoller();

      // Import the icon paths to verify
      const {
        mdiDice1,
        mdiDice2,
        mdiDice3,
        mdiDice4,
        mdiDice5,
        mdiDice6,
      } = require('@mdi/js');

      expect(diceRoller.getDiceIcon(1)).toBe(mdiDice1);
      expect(diceRoller.getDiceIcon(2)).toBe(mdiDice2);
      expect(diceRoller.getDiceIcon(3)).toBe(mdiDice3);
      expect(diceRoller.getDiceIcon(4)).toBe(mdiDice4);
      expect(diceRoller.getDiceIcon(5)).toBe(mdiDice5);
      expect(diceRoller.getDiceIcon(6)).toBe(mdiDice6);
    });

    it('should return default icon (dice1) for invalid values', () => {
      const diceRoller = createDiceRoller();
      const { mdiDice1 } = require('@mdi/js');

      expect(diceRoller.getDiceIcon(0)).toBe(mdiDice1);
      expect(diceRoller.getDiceIcon(7)).toBe(mdiDice1);
      expect(diceRoller.getDiceIcon(-1)).toBe(mdiDice1);
      expect(diceRoller.getDiceIcon(null)).toBe(mdiDice1);
      expect(diceRoller.getDiceIcon(undefined)).toBe(mdiDice1);
    });
  });
});
