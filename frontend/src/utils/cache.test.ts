import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cache } from './cache';

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.clear();
  });

  it('should store and retrieve data', () => {
    const testData = { message: 'Hello World' };
    cache.set('test-key', testData);
    
    const retrieved = cache.get('test-key');
    expect(retrieved).toEqual(testData);
  });

  it('should return null for non-existent keys', () => {
    const result = cache.get('non-existent-key');
    expect(result).toBeNull();
  });

  it('should respect TTL and expire data', async () => {
    const testData = { message: 'Temporary data' };
    cache.set('temp-key', testData, 100); // 100ms TTL
    
    // Should exist immediately
    expect(cache.get('temp-key')).toEqual(testData);
    
    // Wait for expiry
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Should be expired
    expect(cache.get('temp-key')).toBeNull();
  });

  it('should check if key exists', () => {
    cache.set('exists-key', 'data');
    
    expect(cache.has('exists-key')).toBe(true);
    expect(cache.has('non-existent')).toBe(false);
  });

  it('should delete specific keys', () => {
    cache.set('delete-me', 'data');
    expect(cache.has('delete-me')).toBe(true);
    
    cache.delete('delete-me');
    expect(cache.has('delete-me')).toBe(false);
  });

  it('should clear all data', () => {
    cache.set('key1', 'data1');
    cache.set('key2', 'data2');
    
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(true);
    
    cache.clear();
    
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
  });

  it('should provide cache statistics', () => {
    cache.set('stat1', 'data1');
    cache.set('stat2', 'data2');
    
    const stats = cache.getStats();
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('stat1');
    expect(stats.keys).toContain('stat2');
  });

  it('should cleanup expired items', async () => {
    cache.set('keep', 'data', 1000); // 1 second TTL
    cache.set('expire', 'data', 50);  // 50ms TTL
    
    // Wait for one to expire
    await new Promise(resolve => setTimeout(resolve, 100));
    
    cache.cleanup();
    
    expect(cache.has('keep')).toBe(true);
    expect(cache.has('expire')).toBe(false);
  });
});