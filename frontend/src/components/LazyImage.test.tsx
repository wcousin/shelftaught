import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LazyImage from './LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock react-intersection-observer
vi.mock('react-intersection-observer', () => ({
  useInView: () => ({ ref: vi.fn(), inView: true })
}));

describe('LazyImage Component', () => {
  it('should render with alt text', () => {
    render(<LazyImage src="test.jpg" alt="Test image" />);
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeDefined();
  });

  it('should apply custom className', () => {
    render(<LazyImage src="test.jpg" alt="Test image" className="custom-class" />);
    
    const container = screen.getByAltText('Test image').parentElement;
    expect(container?.className).toContain('custom-class');
  });

  it('should handle loading prop', () => {
    render(<LazyImage src="test.jpg" alt="Test image" loading="eager" />);
    
    const image = screen.getByAltText('Test image');
    expect(image.getAttribute('loading')).toBe('eager');
  });
});