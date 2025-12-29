/**
 * File manager for handling game state file operations (save/load YAML files)
 */

import yaml from 'js-yaml';

/**
 * Sanitize a string for use in filename
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string (lowercase, special chars replaced with hyphens)
 */
const sanitizeFilename = (str) => {
  return str.replace(/[^a-z0-9]/gi, '-').toLowerCase();
};

/**
 * Generate filename for saved game state
 * Format: <book>-<charactername>-<YYYYMMDD>-<HHMMSS>.yaml
 * @param {string} bookName - Book name
 * @param {string} characterName - Character name
 * @returns {string} Generated filename
 */
export const generateFilename = (bookName, characterName) => {
  const now = new Date();
  const datePart =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const timePart =
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');

  const bookPart = sanitizeFilename(bookName || 'book');
  const namePart = sanitizeFilename(characterName || 'character');
  return `${bookPart}-${namePart}-${datePart}-${timePart}.yaml`;
};

/**
 * Save state to YAML file and trigger download
 * @param {Object} state - Game state object to save
 * @param {string} bookName - Book name for filename
 * @param {string} characterName - Character name for filename
 */
export const saveToFile = (state, bookName, characterName) => {
  const filename = generateFilename(bookName, characterName);
  const yamlString = yaml.dump(state, { indent: 2, lineWidth: -1 });
  const blob = new Blob([yamlString], { type: 'text/yaml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Prompt user to select a YAML file and load it
 * @returns {Promise<Object|null>} Loaded state object or null if cancelled/invalid
 */
export const loadFromFile = () => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yaml';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }

      // Validate file extension
      if (!file.name.toLowerCase().endsWith('.yaml')) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target.result;
          const loadedState = yaml.load(fileContent);

          // Validate it's a valid state object
          if (!loadedState || typeof loadedState !== 'object') {
            resolve(null);
            return;
          }

          resolve(loadedState);
        } catch (error) {
          console.error('Error loading game file:', error);
          resolve(null);
        }
      };
      reader.onerror = () => {
        resolve(null);
      };
      reader.readAsText(file);
    };
    input.click();
  });
};
