import { describe, it, expect } from 'vitest';
import {
  convertColorToNote,
  convertNoteToColor,
  convertItemColorToAnnotation,
  convertItemAnnotationToColor,
} from '../../utils/trailMapping';

describe('Trail mapping utilities', () => {
  describe('convertColorToNote', () => {
    it.each([
      ['dark', 'died'],
      ['info', 'question'],
      ['success', 'good'],
      ['danger', 'bad'],
      ['warning', 'important'],
    ])('should convert "%s" to "%s"', (color, expected) => {
      expect(convertColorToNote(color)).toBe(expected);
    });

    it.each(['unknown', 'light', '', null, undefined])(
      'should return null for unknown or invalid color "%s"',
      (color) => {
        expect(convertColorToNote(color)).toBe(null);
      }
    );
  });

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

  describe('convertItemColorToAnnotation', () => {
    it.each([
      [1, { number: 1, annotation: null }],
      [{ number: 42 }, { number: 42, annotation: null }],
    ])('should convert item without annotation: %s', (input, expected) => {
      expect(convertItemColorToAnnotation(input)).toEqual(expected);
    });

    it.each([
      [
        { number: 1, color: 'dark' },
        { number: 1, annotation: 'died' },
      ],
      [
        { number: 5, color: 'success' },
        { number: 5, annotation: 'good' },
      ],
    ])(
      'should convert item with color to annotation: %s',
      (input, expected) => {
        expect(convertItemColorToAnnotation(input)).toEqual(expected);
      }
    );

    it.each(['light', 'unknown'])(
      'should convert item with unknown color "%s" to null annotation',
      (color) => {
        expect(convertItemColorToAnnotation({ number: 1, color })).toEqual({
          number: 1,
          annotation: null,
        });
      }
    );
  });

  describe('convertItemAnnotationToColor', () => {
    it.each([
      [1, { number: 1, color: 'light' }],
      [42, { number: 42, color: 'light' }],
    ])(
      'should convert number %s to item with light color',
      (input, expected) => {
        expect(convertItemAnnotationToColor(input)).toEqual(expected);
      }
    );

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
      'should convert item with annotation to color: %s',
      (input, expected) => {
        expect(convertItemAnnotationToColor(input)).toEqual(expected);
      }
    );

    it.each([
      [{ number: 1, annotation: null }],
      [{ number: 1 }],
      [{ number: 1, annotation: 'unknown' }],
    ])(
      'should convert item to light color when no valid annotation: %s',
      (input) => {
        expect(convertItemAnnotationToColor(input)).toEqual({
          number: 1,
          color: 'light',
        });
      }
    );
  });
});
