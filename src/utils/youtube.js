/**
 * YouTube URL validation and video ID extraction utilities
 */

/**
 * Validates if a URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid YouTube URL, false otherwise
 */
export const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // YouTube URL patterns
  const patterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/, // Standard YouTube URLs
    /^https?:\/\/youtube\.com\/watch\?v=[\w-]+/, // youtube.com/watch?v=VIDEO_ID
    /^https?:\/\/youtu\.be\/[\w-]+/, // youtu.be/VIDEO_ID
    /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/, // youtube.com/embed/VIDEO_ID
  ];

  return patterns.some((pattern) => pattern.test(url.trim()));
};

/**
 * Extracts video ID from YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} The video ID or null if not found
 */
export const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();

  // Pattern for youtube.com/watch?v=VIDEO_ID
  let match = trimmedUrl.match(/[?&]v=([^&]+)/);
  if (match) {
    return match[1];
  }

  // Pattern for youtu.be/VIDEO_ID
  match = trimmedUrl.match(/youtu\.be\/([^?&]+)/);
  if (match) {
    return match[1];
  }

  // Pattern for youtube.com/embed/VIDEO_ID
  match = trimmedUrl.match(/\/embed\/([^?&]+)/);
  if (match) {
    return match[1];
  }

  return null;
};

/**
 * Converts YouTube URL to embeddable format
 * @param {string} url - The YouTube URL
 * @returns {string|null} The embeddable URL or null if invalid
 */
export const getEmbedUrl = (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return null;
  }
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
};
