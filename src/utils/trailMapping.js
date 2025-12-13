/**
 * Mapping between trail pill semantic notes and their display colors
 */
const mapNoteColor = [
  { note: 'died', color: 'dark' },
  { note: 'question', color: 'info' },
  { note: 'good', color: 'success' },
  { note: 'bad', color: 'danger' },
  { note: 'important', color: 'warning' },
];

/**
 * Convert color to annotation
 * @param {string} color - The color value
 * @returns {string|null} - The annotation or null if no annotation
 */
export const convertColorToNote = (color) => {
  const pair = mapNoteColor.find((p) => p.color === color);
  return pair ? pair.note : null;
};

/**
 * Convert annotation to color
 * @param {string} annotation - The annotation value
 * @returns {string|null} - The color or null if no color
 */
export const convertNoteToColor = (annotation) => {
  const pair = mapNoteColor.find((p) => p.note === annotation);
  return pair ? pair.color : null;
};

/**
 * Convert trail sequence item from annotation to color format
 * @param {Object} item - Item with { number, annotation }
 * @returns {Object} - Item with { number, color } (color defaults to 'light' if no valid annotation)
 */
export const convertNoteItemtoColor = (item) => {
  const color = item.annotation ? convertNoteToColor(item.annotation) : null;
  return {
    number: item.number,
    color: color || 'light',
  };
};
