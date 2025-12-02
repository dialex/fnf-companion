/**
 * Utility functions for localStorage operations
 */

/**
 * Get a value from localStorage
 * @param {string} key - The key to retrieve
 * @param {*} defaultValue - Default value if key doesn't exist or error occurs
 * @returns {*} The stored value or defaultValue
 */
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (error) {
    console.warn(`Could not read ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Save a value to localStorage
 * @param {string} key - The key to store under
 * @param {*} value - The value to store (will be JSON stringified)
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage:`, error);
  }
};

/**
 * Remove a value from localStorage
 * @param {string} key - The key to remove
 */
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Could not remove ${key} from localStorage:`, error);
  }
};
