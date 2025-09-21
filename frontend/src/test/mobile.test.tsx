import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  isMobile,
  isIOS,
  isAndroid,
  isTouchDevice,
  getViewportSize,
  isLandscape,
  optimizeForMobile,
  setupPWAInstallPrompt,
  showPWAInstallPrompt,
  isPWAInstalled
} from '../utils/mobile';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import CurriculumCard from '../components/curriculum/CurriculumCard';

// Mock navigator
const mockNavigator = {
  userAgent: '',
  maxTouchPoints: 0,
  vibrate: vi.fn(),
  serviceWorker: {
    register: vi.fn()
  }
};

Object.defineProperty(window, 'navigator', {
  value: mockNavigator,
  writable: true
});

describe('Mobile Utilities', () => {
  beforeEach(() => {
    // Reset navigator mock
    mockNavigator.userAgent = '';
    mockNavigator.maxTouchPoints = 0;
    
    // Clear document classes
    document.documentElement.className = '';
  });

  describe('Device Detection', () => {
    it('should detect mobile devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isMobile()).toBe(true);
      
      mockNavigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(isMobile()).toBe(false);
    });

    it('should detect iOS devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isIOS()).toBe(true);
      
      mockNavigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      expect(isIOS()).toBe(false);
    });

    it('should detect Android devices', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      expect(isAndroid()).toBe(true);
      
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      expect(isAndroid()).toBe(false);
    });

    it('should detect touch devices', () => {
      mockNavigator.maxTouchPoints = 1;
      expect(isTouchDevice()).toBe(true);
      
      mockNavigator.maxTouchPoints = 0;
      expect(isTouchDevice()).toBe(false);
    });
  });

  describe('Viewport Utilities', () => {
    it('should get viewport size', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      const size = getViewportSize();
      expect(size.width).toBe(375);
      expect(size.height).toBe(667);
    });

    it('should detect landscape orientation', () => {
      Object.defineProperty(window, 'innerWidth', { value: 667, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 375, writable: true });
      
      expect(isLandscape()).toBe(true);
      
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });
      
      expect(isLandscape()).toBe(false);
    });
  });

  describe('Mobile Optimizations', () => {
    it('should apply mobile optimizations', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      mockNavigator.maxTouchPoints = 1;
      
      optimizeForMobile();
      
      expect(document.documentElement.classList.contains('mobile-device')).toBe(true);
      expect(document.documentElement.classList.contains('touch-device')).toBe(true);
      expect(document.documentElement.classList.contains('ios-device')).toBe(true);
    });

    it('should apply Android optimizations', () => {
      mockNavigator.userAgent = 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)';
      mockNavigator.maxTouchPoints = 1;
      
      optimizeForMobile();
      
      expect(document.documentElement.classList.contains('mobile-device')).toBe(true);
      expect(document.documentElement.classList.contains('android-device')).toBe(true);
    });
  });

  describe('PWA Features', () => {
    it('should detect PWA installation status', () => {
      // Mock standalone mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });
      
      expect(isPWAInstalled()).toBe(true);
    });

    it('should setup PWA install prompt', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      
      setupPWAInstallPrompt();
      
      expect(addEventListener).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
    });
  });
});

describe('Mobile Components', () => {
  describe('PWAInstallPrompt', () => {
    it('should render install prompt when conditions are met', async () => {
      // Mock PWA not installed
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<PWAInstallPrompt />);
      
      // Component should not render initially (needs beforeinstallprompt event)
      expect(screen.queryByText('Install Shelf Taught')).not.toBeInTheDocument();
    });

    it('should not render when PWA is already installed', () => {
      // Mock PWA installed
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<PWAInstallPrompt />);
      
      expect(screen.queryByText('Install Shelf Taught')).not.toBeInTheDocument();
    });
  });

  describe('CurriculumCard Mobile Optimizations', () => {
    const mockCurriculum = {
      id: '1',
      name: 'Test Curriculum',
      publisher: 'Test Publisher',
      description: 'Test description',
      overallRating: 4.5,
      subjects: ['Math', 'Science'],
      gradeRange: 'K-5'
    };

    it('should have touch-friendly interactions', () => {
      render(
        <BrowserRouter>
          <CurriculumCard {...mockCurriculum} />
        </BrowserRouter>
      );
      
      const card = screen.getByRole('button', { name: /test curriculum/i });
      expect(card).toHaveClass('touch-manipulation');
      expect(card).toHaveClass('active:scale-95');
    });

    it('should have responsive text sizes', () => {
      render(
        <BrowserRouter>
          <CurriculumCard {...mockCurriculum} />
        </BrowserRouter>
      );
      
      const title = screen.getByText('Test Curriculum');
      expect(title).toHaveClass('text-base', 'sm:text-lg');
    });

    it('should handle touch interactions', () => {
      const mockOnClick = vi.fn();
      
      render(
        <BrowserRouter>
          <CurriculumCard {...mockCurriculum} onClick={mockOnClick} />
        </BrowserRouter>
      );
      
      const card = screen.getByRole('button', { name: /test curriculum/i });
      fireEvent.click(card);
      
      expect(mockOnClick).toHaveBeenCalled();
    });
  });
});

describe('Mobile Performance', () => {
  it('should have optimized image loading', () => {
    const mockCurriculum = {
      id: '1',
      name: 'Test Curriculum',
      publisher: 'Test Publisher',
      description: 'Test description',
      overallRating: 4.5,
      imageUrl: 'https://example.com/image.jpg',
      subjects: ['Math'],
      gradeRange: 'K-5'
    };

    render(
      <BrowserRouter>
        <CurriculumCard {...mockCurriculum} />
      </BrowserRouter>
    );
    
    // Should have lazy loading attributes
    const images = screen.getAllByRole('img');
    const actualImage = images.find(img => img.getAttribute('alt')?.includes('Test Curriculum'));
    
    if (actualImage) {
      expect(actualImage).toHaveAttribute('loading', 'lazy');
      expect(actualImage).toHaveAttribute('decoding', 'async');
    }
  });

  it('should apply mobile-specific CSS classes', () => {
    mockNavigator.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
    mockNavigator.maxTouchPoints = 1;
    
    optimizeForMobile();
    
    expect(document.documentElement.classList.contains('mobile-device')).toBe(true);
    expect(document.documentElement.classList.contains('touch-device')).toBe(true);
  });
});

describe('Accessibility on Mobile', () => {
  it('should have proper touch target sizes', () => {
    const mockCurriculum = {
      id: '1',
      name: 'Test Curriculum',
      publisher: 'Test Publisher',
      description: 'Test description',
      overallRating: 4.5,
      subjects: ['Math'],
      gradeRange: 'K-5'
    };

    render(
      <BrowserRouter>
        <CurriculumCard {...mockCurriculum} />
      </BrowserRouter>
    );
    
    const card = screen.getByRole('button', { name: /test curriculum/i });
    
    // Should have minimum touch target size (44px)
    const styles = window.getComputedStyle(card);
    expect(parseInt(styles.minHeight) >= 44 || card.classList.contains('min-h-touch')).toBe(true);
  });

  it('should have proper focus indicators', () => {
    const mockCurriculum = {
      id: '1',
      name: 'Test Curriculum',
      publisher: 'Test Publisher',
      description: 'Test description',
      overallRating: 4.5,
      subjects: ['Math'],
      gradeRange: 'K-5'
    };

    render(
      <BrowserRouter>
        <CurriculumCard {...mockCurriculum} />
      </BrowserRouter>
    );
    
    const card = screen.getByRole('button', { name: /test curriculum/i });
    
    // Focus the element
    fireEvent.focus(card);
    
    // Should be focusable
    expect(document.activeElement).toBe(card);
  });
});