import { describe, it, expect } from 'vitest';
import { getDiceIcon } from '../../utils/dice';
import {
  mdiDice1,
  mdiDice2,
  mdiDice3,
  mdiDice4,
  mdiDice5,
  mdiDice6,
} from '@mdi/js';

//TODO: this should be a responsibility of the DiceRoller component
describe('UI utilities', () => {
  describe('getDiceIcon', () => {
    it('should return correct icon for value 1', () => {
      expect(getDiceIcon(1)).toBe(mdiDice1);
    });

    it('should return correct icon for value 2', () => {
      expect(getDiceIcon(2)).toBe(mdiDice2);
    });

    it('should return correct icon for value 3', () => {
      expect(getDiceIcon(3)).toBe(mdiDice3);
    });

    it('should return correct icon for value 4', () => {
      expect(getDiceIcon(4)).toBe(mdiDice4);
    });

    it('should return correct icon for value 5', () => {
      expect(getDiceIcon(5)).toBe(mdiDice5);
    });

    it('should return correct icon for value 6', () => {
      expect(getDiceIcon(6)).toBe(mdiDice6);
    });

    it('should return default icon (dice1) for invalid values', () => {
      expect(getDiceIcon(0)).toBe(mdiDice1);
      expect(getDiceIcon(7)).toBe(mdiDice1);
      expect(getDiceIcon(-1)).toBe(mdiDice1);
      expect(getDiceIcon(null)).toBe(mdiDice1);
      expect(getDiceIcon(undefined)).toBe(mdiDice1);
    });
  });
});
