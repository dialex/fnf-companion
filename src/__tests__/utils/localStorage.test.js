import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getFromStorage,
  saveToStorage,
  removeFromStorage,
} from '../../utils/localStorage';

describe('LocalStorage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console.warn spy
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getFromStorage', () => {
    it('should return stored value when key exists', () => {
      const testData = { name: 'test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(testData));

      const result = getFromStorage('testKey');

      expect(result).toEqual(testData);
    });

    it('should return defaultValue when key does not exist', () => {
      const defaultValue = { default: true };

      const result = getFromStorage('nonExistentKey', defaultValue);

      expect(result).toBe(defaultValue);
    });

    it('should return null when key does not exist and no defaultValue provided', () => {
      const result = getFromStorage('nonExistentKey');

      expect(result).toBe(null);
    });

    it('should return defaultValue when JSON.parse fails', () => {
      localStorage.setItem('invalidJson', 'not valid json{');
      const defaultValue = 'default';

      const result = getFromStorage('invalidJson', defaultValue);

      expect(result).toBe(defaultValue);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle localStorage.getItem throwing an error', () => {
      const getItemSpy = vi
        .spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });
      const defaultValue = 'default';

      const result = getFromStorage('testKey', defaultValue);

      expect(result).toBe(defaultValue);
      expect(console.warn).toHaveBeenCalled();
      getItemSpy.mockRestore();
    });

    it('should handle various data types', () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { nested: { data: 'value' } } },
        { key: 'null', value: null },
      ];

      testCases.forEach(({ key, value }) => {
        saveToStorage(key, value);
        expect(getFromStorage(key)).toEqual(value);
      });
    });
  });

  describe('saveToStorage', () => {
    it('should save value to localStorage', () => {
      const testData = { name: 'test', value: 123 };

      saveToStorage('testKey', testData);

      const stored = localStorage.getItem('testKey');
      expect(JSON.parse(stored)).toEqual(testData);
    });

    it('should handle localStorage.setItem throwing an error', () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Quota exceeded');
        });

      saveToStorage('testKey', { data: 'test' });

      expect(console.warn).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });

    it('should handle circular references gracefully', () => {
      const circular = { name: 'test' };
      circular.self = circular;

      // JSON.stringify will throw for circular references
      saveToStorage('circular', circular);

      expect(console.warn).toHaveBeenCalled();
    });

    it('should save various data types', () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { nested: { data: 'value' } } },
        { key: 'null', value: null },
      ];

      testCases.forEach(({ key, value }) => {
        saveToStorage(key, value);
        const stored = localStorage.getItem(key);
        expect(JSON.parse(stored)).toEqual(value);
      });
    });
  });

  describe('removeFromStorage', () => {
    it('should remove key from localStorage', () => {
      localStorage.setItem('testKey', JSON.stringify({ data: 'test' }));

      removeFromStorage('testKey');

      expect(localStorage.getItem('testKey')).toBe(null);
    });

    it('should handle removing non-existent key', () => {
      removeFromStorage('nonExistentKey');

      // Should not throw or warn
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('should handle localStorage.removeItem throwing an error', () => {
      const removeItemSpy = vi
        .spyOn(Storage.prototype, 'removeItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      removeFromStorage('testKey');

      expect(console.warn).toHaveBeenCalled();
      removeItemSpy.mockRestore();
    });
  });

  describe('integration', () => {
    it('should work together: save, get, remove', () => {
      const testData = { name: 'test', value: 123 };

      // Save
      saveToStorage('testKey', testData);
      expect(getFromStorage('testKey')).toEqual(testData);

      // Remove
      removeFromStorage('testKey');
      expect(getFromStorage('testKey')).toBe(null);

      // Get with default after removal
      expect(getFromStorage('testKey', 'default')).toBe('default');
    });
  });
});
