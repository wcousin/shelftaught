import { describe, it, expect } from 'vitest';
import { 
  createSlug, 
  createCurriculumUrl, 
  createSearchUrl, 
  createBrowseUrl,
  extractIdFromUrl,
  isValidSlug,
  normalizeUrl
} from './url';

describe('URL Utilities', () => {
  describe('createSlug', () => {
    it('should create valid slugs from text', () => {
      expect(createSlug('Hello World')).toBe('hello-world');
      expect(createSlug('Math & Science!')).toBe('math-science');
      expect(createSlug('  Spaced   Out  ')).toBe('spaced-out');
      expect(createSlug('Under_scores')).toBe('under-scores');
    });

    it('should handle special characters', () => {
      expect(createSlug('C++ Programming')).toBe('c-programming');
      expect(createSlug('K-12 Education')).toBe('k-12-education');
      expect(createSlug('100% Complete')).toBe('100-complete');
    });
  });

  describe('createCurriculumUrl', () => {
    it('should create SEO-friendly curriculum URLs', () => {
      const url = createCurriculumUrl('123', 'Saxon Math', 'Saxon Publishers');
      expect(url).toBe('/curriculum/123/saxon-math-by-saxon-publishers');
    });

    it('should handle curriculum without publisher', () => {
      const url = createCurriculumUrl('456', 'Teaching Textbooks');
      expect(url).toBe('/curriculum/456/teaching-textbooks');
    });
  });

  describe('createSearchUrl', () => {
    it('should create search URLs with query', () => {
      const url = createSearchUrl('math curriculum');
      expect(url).toBe('/search?q=math+curriculum');
    });

    it('should include filters in search URL', () => {
      const url = createSearchUrl('science', { grade: 'K-2', subject: 'biology' });
      expect(url).toContain('/search?');
      expect(url).toContain('q=science');
      expect(url).toContain('grade=K-2');
      expect(url).toContain('subject=biology');
    });

    it('should handle empty query', () => {
      const url = createSearchUrl('');
      expect(url).toBe('/search');
    });
  });

  describe('createBrowseUrl', () => {
    it('should create browse URLs with filters', () => {
      const url = createBrowseUrl('math', 'elementary');
      expect(url).toContain('/browse?');
      expect(url).toContain('category=math');
      expect(url).toContain('grade=elementary');
    });

    it('should handle no filters', () => {
      const url = createBrowseUrl();
      expect(url).toBe('/browse');
    });
  });

  describe('extractIdFromUrl', () => {
    it('should extract curriculum ID from URL', () => {
      const id = extractIdFromUrl('/curriculum/abc123/saxon-math-by-saxon');
      expect(id).toBe('abc123');
    });

    it('should return null for invalid URLs', () => {
      const id = extractIdFromUrl('/invalid/url');
      expect(id).toBeNull();
    });
  });

  describe('isValidSlug', () => {
    it('should validate slugs correctly', () => {
      expect(isValidSlug('valid-slug-123')).toBe(true);
      expect(isValidSlug('invalid_slug')).toBe(false);
      expect(isValidSlug('Invalid-Slug')).toBe(false);
      expect(isValidSlug('invalid slug')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize URLs correctly', () => {
      expect(normalizeUrl('/path//to///resource/')).toBe('path/to/resource');
      expect(normalizeUrl('PATH/TO/RESOURCE')).toBe('path/to/resource');
      expect(normalizeUrl('//multiple//slashes//')).toBe('multiple/slashes');
    });
  });
});