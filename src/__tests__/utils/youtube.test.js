import { describe, it, expect } from 'vitest';
import {
  isValidYouTubeUrl,
  extractVideoId,
  getEmbedUrl,
} from '../../utils/youtube';

describe('YouTube URL validation', () => {
  describe('Valid URLs', () => {
    it('should validate standard youtube.com URLs', () => {
      expect(
        isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe(true);
      expect(
        isValidYouTubeUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe(true);
      expect(isValidYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
        true
      );
    });

    it('should validate youtu.be URLs', () => {
      expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
      expect(isValidYouTubeUrl('http://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('should validate embed URLs', () => {
      expect(
        isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
      ).toBe(true);
      expect(isValidYouTubeUrl('https://youtube.com/embed/dQw4w9WgXcQ')).toBe(
        true
      );
    });

    it('should handle URLs with whitespace', () => {
      expect(
        isValidYouTubeUrl('  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ')
      ).toBe(true);
    });
  });

  describe('Invalid URLs', () => {
    it('should reject non-YouTube URLs', () => {
      expect(isValidYouTubeUrl('https://example.com/video')).toBe(false);
      expect(isValidYouTubeUrl('https://vimeo.com/123456')).toBe(false);
      expect(isValidYouTubeUrl('https://google.com')).toBe(false);
    });

    it('should reject empty or null values', () => {
      expect(isValidYouTubeUrl('')).toBe(false);
      expect(isValidYouTubeUrl(null)).toBe(false);
      expect(isValidYouTubeUrl(undefined)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(isValidYouTubeUrl(123)).toBe(false);
      expect(isValidYouTubeUrl({})).toBe(false);
      expect(isValidYouTubeUrl([])).toBe(false);
    });

    it('should reject malformed YouTube URLs', () => {
      expect(isValidYouTubeUrl('youtube.com')).toBe(false);
      expect(isValidYouTubeUrl('youtube.com/watch')).toBe(false);
      expect(isValidYouTubeUrl('https://youtube.com')).toBe(false);
    });
  });

  describe('Video ID extraction', () => {
    it('should extract video ID from watch URLs', () => {
      expect(
        extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).toBe('dQw4w9WgXcQ');
      expect(extractVideoId('https://youtube.com/watch?v=abc123')).toBe(
        'abc123'
      );
    });

    it('should extract video ID from youtu.be URLs', () => {
      expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ'
      );
      expect(extractVideoId('http://youtu.be/abc123')).toBe('abc123');
    });

    it('should extract video ID from embed URLs', () => {
      expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
        'dQw4w9WgXcQ'
      );
    });

    it('should return null for invalid URLs', () => {
      expect(extractVideoId('https://example.com')).toBe(null);
      expect(extractVideoId('')).toBe(null);
      expect(extractVideoId(null)).toBe(null);
    });
  });

  describe('Embed URL conversion', () => {
    it('should convert valid URLs to embed format', () => {
      const embedUrl = getEmbedUrl(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
      expect(embedUrl).toContain('youtube.com/embed/dQw4w9WgXcQ');
      expect(embedUrl).toContain('enablejsapi=1');
    });

    it('should return null for invalid URLs', () => {
      expect(getEmbedUrl('https://example.com')).toBe(null);
      expect(getEmbedUrl('')).toBe(null);
    });
  });
});
