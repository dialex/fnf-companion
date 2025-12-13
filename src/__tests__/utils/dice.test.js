import { describe, it, expect } from 'vitest';
import { rollDie, rollTwoDice } from '../../utils/dice';

describe('Dice utilities', () => {
  describe('rollDie', () => {
    it('should return a number between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollDie();
        expect(Number.isInteger(result)).toBe(true);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('rollTwoDice', () => {
    it('should return an object with roll1, roll2, and sum', () => {
      const result = rollTwoDice();
      expect(result).toHaveProperty('roll1');
      expect(result).toHaveProperty('roll2');
      expect(result).toHaveProperty('sum');
    });

    it('should calculate sum correctly', () => {
      const result = rollTwoDice();
      expect(result.sum).toBe(result.roll1 + result.roll2);
      expect(result.sum).toBeGreaterThanOrEqual(2);
      expect(result.sum).toBeLessThanOrEqual(12);
    });

    it('should return valid dice values (1-6) for both rolls', () => {
      for (let i = 0; i < 100; i++) {
        const result = rollTwoDice();
        expect(result.roll1).toBeGreaterThanOrEqual(1);
        expect(result.roll1).toBeLessThanOrEqual(6);
        expect(result.roll2).toBeGreaterThanOrEqual(1);
        expect(result.roll2).toBeLessThanOrEqual(6);
      }
    });
  });
});
