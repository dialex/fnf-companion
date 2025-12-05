/**
 * Mapping between trail pill colors and their annotations
 */
const COLOR_TO_ANNOTATION = {
  dark: 'died',
  info: 'question',
  success: 'good',
  danger: 'bad',
  warning: 'important',
};

const ANNOTATION_TO_COLOR = {
  died: 'dark',
  question: 'info',
  good: 'success',
  bad: 'danger',
  important: 'warning',
};

/**
 * Convert color to annotation
 * @param {string} color - The color value
 * @returns {string|null} - The annotation or null if no annotation
 */
export const colorToAnnotation = (color) => {
  return COLOR_TO_ANNOTATION[color] || null;
};

/**
 * Convert annotation to color
 * @param {string} annotation - The annotation value
 * @returns {string|null} - The color or null if no color
 */
export const annotationToColor = (annotation) => {
  return ANNOTATION_TO_COLOR[annotation] || null;
};

/**
 * Convert trail sequence item from color to annotation format
 * @param {Object} item - Item with { number, color }
 * @returns {Object} - Item with { number, annotation } (annotation is null if no annotation)
 */
export const convertItemColorToAnnotation = (item) => {
  if (typeof item === 'number') {
    return { number: item, annotation: null };
  }
  return {
    number: item.number,
    annotation: colorToAnnotation(item.color),
  };
};

/**
 * Convert trail sequence item from annotation to color format
 * @param {Object} item - Item with { number, annotation }
 * @returns {Object} - Item with { number, color } (color defaults based on number if no annotation)
 */
export const convertItemAnnotationToColor = (item) => {
  if (typeof item === 'number') {
    const num = item;
    return {
      number: num,
      color: 'light',
    };
  }
  const num = item.number;
  const annotation = item.annotation;

  // If there's an annotation, convert it to color
  if (annotation) {
    const color = annotationToColor(annotation);
    if (color) {
      return { number: num, color };
    }
  }

  // Default to light if no annotation
  return { number: num, color: 'light' };
};
