import { describe, it, expect } from 'vitest';
import {
  convertNoteToColor,
  convertNoteItemtoColor,
} from '../../utils/trailMapping';

//TODO: consider if we should have a TrailManager
describe('Trail mapping utilities', () => {
  describe('convertNoteToColor', () => {
    it.each([
      ['died', 'dark'],
      ['question', 'info'],
      ['good', 'success'],
      ['bad', 'danger'],
      ['important', 'warning'],
    ])('should convert "%s" to "%s"', (annotation, expected) => {
      expect(convertNoteToColor(annotation)).toBe(expected);
    });

    it.each(['unknown', '', null, undefined])(
      'should return null for unknown annotation "%s"',
      (annotation) => {
        expect(convertNoteToColor(annotation)).toBe(null);
      }
    );
  });

  describe('convertNoteItemtoColor', () => {
    it.each([
      [
        { number: 1, annotation: 'died' },
        { number: 1, color: 'dark' },
      ],
      [
        { number: 2, annotation: 'question' },
        { number: 2, color: 'info' },
      ],
      [
        { number: 3, annotation: 'good' },
        { number: 3, color: 'success' },
      ],
      [
        { number: 4, annotation: 'bad' },
        { number: 4, color: 'danger' },
      ],
      [
        { number: 5, annotation: 'important' },
        { number: 5, color: 'warning' },
      ],
    ])(
      "should convert item's annotation to its color format",
      (input, expected) => {
        expect(convertNoteItemtoColor(input)).toEqual(expected);
      }
    );

    it("should return default color when item's annotation is missing", () => {
      expect(convertNoteItemtoColor({ number: 1 })).toEqual({
        number: 1,
        color: 'light',
      });
    });

    it("should return default color when item's annotation is missing or null", () => {
      expect(convertNoteItemtoColor({ number: 1, annotation: null })).toEqual({
        number: 1,
        color: 'light',
      });
      expect(
        convertNoteItemtoColor({ number: 1, annotation: 'invalid' })
      ).toEqual({
        number: 1,
        color: 'light',
      });
    });

    it("should return default color when item's annotation is empty", () => {
      expect(convertNoteItemtoColor({ number: 1, annotation: '' })).toEqual({
        number: 1,
        color: 'light',
      });
    });
  });
});
