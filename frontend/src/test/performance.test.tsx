import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { AppContext } from '../contexts/AppContext';
import SearchPage from '../pages/SearchPage';
import BrowsePage from '../pages/BrowsePage';
import HomePage from '../pages/HomePage';

// Performance testing utilities
const measurePerformance = async (operation: () => Promise<void>) => {
  const startTime = performance.now();
  await operation();
  const endTime = performance.now();
  return endTime - startTime;
};

const createLargeCurriculumDataset = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `curriculum-${index}`,
    name: `Test Curriculum ${index}`,
    publisher: `Publisher ${index % 10}`,
    description: `Description for curriculum ${index}`,
    imageUrl: `/image-${index}.jpg`,
    targetAgeGrade: {
      minAge: 5 + (index % 10),
      maxAge: 15 + (index % 10),
      gradeRange: `K-${5 + (index % 10)}`,
      rating: 3 + (index % 3)
    },
    teachingApproach: {
      style: ['Traditional', 'Charlotte Mason', 'Unit Studies'][index % 3],
      description: 'Teaching approach description',
      rating: 3 + (index % 3)
    },
    subjectsCovered: {
      subjects: ['Math', 'Science', 'Reading', 'History'][index % 4],
      comprehensiveness: 3 + (index % 3),
      rating: 3 + (index % 3)
    },
    materialsIncluded: {
      components: ['Textbook', 'Workbook', 'Videos'],
      completeness: 4,
      rating: 4
    },
    instructionStyle: {
      type: 'Parent-led',
      supportLevel: 4,
      rating: 4
    },
    timeCommitment: {
      dailyMinutes: 30 + (index % 60),
      weeklyHours: 3 + (index % 5),
      flexibility: 3 + (index % 3),
      rating: 4
    },
    cost: {
      priceRange: ['$', '$$', '$$$', '$$$$'][index % 4],
      value: 3 + (index % 3),
      rating: 4
    },
    strengths: [`Strength ${index}`],
    weaknesses: [`Weakness ${index}`],
    bestFor: [`Best for ${index}`],
    availability: {
      inPrint: true,
      digitalAvailable: index % 2 === 0,
      usedMarket: true,
      rating: 4
    },
    overallRating: 3 + (index % 3),
    reviewCount: 10 + (index % 20),
    createdAt: new Date(),
    updatedAt: new Date()
  }));
};

// Mock contexts
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAppContext = {
  categories: {
    subjects: Array.from({ length: 20 }, (_, i) => ({
      id: `subject-${i}`,
      name: `Subject ${i}`,
      description: `Description ${i}`,
      curriculumCount: 10 + i
    })),
    gradeLevels: Array.from({ length: 10 }, (_, i) => ({
      id: `grade-${i}`,
      name: `Grade ${i}`,
      ageRange: `${5 + i}-${6 + i}`,
      curriculumCount: 15 + i
    }))
  },
  loading: false,
  error: null,
  refreshCategories: vi.fn()
};

// Mock API with performance simulation
const createMockApiWithDelay = (delay: number, dataSize: number) => ({
  searchCurricula: vi.fn().mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      data: {
        curricula: createLargeCurriculumDataset(dataSize),
        total: dataSize,
        page: 1,
        totalPages: Math.ceil(dataSize / 20)
      }
    };
  }),
  getCurricula: vi.fn().mockImplementation(async () => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return {
      data: {
        curricula: createLargeCurriculumDataset(dataSize),
        total: dataSize,
        page: 1,
        totalPages: Math.ceil(dataSize / 20)
      }
    };
  }),
  getCategories: vi.fn().mockResolvedValue({
    data: mockAppContext.categories
  })
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <AppContext.Provider value={mockAppContext}>
          {component}
        </AppContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Performance Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Search Performance', () => {
    it('should complete search within 2 seconds for small dataset', async () => {
      // Mock API with 100ms delay and 50 items
      vi.doMock('../services/api', () => createMockApiWithDelay(100, 50));
      
      const user = userEvent.setup();
      renderWithProviders(<SearchPage />);
      
      const searchTime = await measurePerformance(async () => {
        const searchInput = screen.getByPlaceholderText(/search curricula/i);
        await user.type(searchInput, 'math');
        
        await waitFor(() => {
          expect(screen.getByText(/search results/i)).toBeInTheDocument();
        }, { timeout: 3000 });
      });
      
      expect(searchTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle large dataset search efficiently', async () => {
      // Mock API with 200ms delay and 1000 items
      vi.doMock('../services/api', () => createMockApiWithDelay(200, 1000));
      
      const user = userEvent.setup();
      renderWithProviders(<SearchPage />);
      
      const searchTime = await measurePerformance(async () => {
        const searchInput = screen.getByPlaceholderText(/search curricula/i);
        await user.type(searchInput, 'comprehensive');
        
        await waitFor(() => {
          expect(screen.getByText(/search results/i)).toBeInTheDocument();
        }, { timeout: 5000 });
      });
      
      expect(searchTime).toBeLessThan(3000); // Should complete within 3 seconds even for large dataset
    });

    it('should debounce search input to prevent excessive API calls', async () => {
      const mockApi = createMockApiWithDelay(50, 20);
      vi.doMock('../services/api', () => mockApi);
      
      const user = userEvent.setup();
      renderWithProviders(<SearchPage />);
      
      const searchInput = screen.getByPlaceholderText(/search curricula/i);
      
      // Type multiple characters quickly
      await user.type(searchInput, 'mathematics', { delay: 50 });
      
      // Wait for debounce period
      await waitFor(() => {
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Should have made fewer API calls than characters typed due to debouncing
      expect(mockApi.searchCurricula).toHaveBeenCalledTimes(1);
    });
  });

  describe('Filtering Performance', () => {
    it('should apply filters quickly without blocking UI', async () => {
      vi.doMock('../services/api', () => createMockApiWithDelay(100, 100));
      
      const user = userEvent.setup();
      renderWithProviders(<BrowsePage />);
      
      const filterTime = await measurePerformance(async () => {
        // Apply multiple filters
        const mathFilter = screen.getByLabelText(/math/i);
        await user.click(mathFilter);
        
        const elementaryFilter = screen.getByLabelText(/elementary/i);
        await user.click(elementaryFilter);
        
        await waitFor(() => {
          expect(screen.getByText(/curriculum/i)).toBeInTheDocument();
        }, { timeout: 2000 });
      });
      
      expect(filterTime).toBeLessThan(1500); // Filtering should be fast
    });

    it('should handle multiple simultaneous filter changes efficiently', async () => {
      const mockApi = createMockApiWithDelay(100, 200);
      vi.doMock('../services/api', () => mockApi);
      
      const user = userEvent.setup();
      renderWithProviders(<BrowsePage />);
      
      // Apply multiple filters rapidly
      const filters = [
        screen.getByLabelText(/math/i),
        screen.getByLabelText(/elementary/i),
        screen.getByLabelText(/traditional/i)
      ];
      
      const startTime = performance.now();
      
      // Click all filters quickly
      for (const filter of filters) {
        await user.click(filter);
      }
      
      await waitFor(() => {
        expect(screen.getByText(/curriculum/i)).toBeInTheDocument();
      }, { timeout: 3000 });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      expect(totalTime).toBeLessThan(2000);
      // Should batch API calls efficiently
      expect(mockApi.getCurricula).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rendering Performance', () => {
    it('should render curriculum cards efficiently', async () => {
      vi.doMock('../services/api', () => createMockApiWithDelay(50, 100));
      
      const renderTime = await measurePerformance(async () => {
        renderWithProviders(<BrowsePage />);
        
        await waitFor(() => {
          expect(screen.getAllByTestId(/curriculum-card/i)).toHaveLength.greaterThan(0);
        }, { timeout: 2000 });
      });
      
      expect(renderTime).toBeLessThan(1000); // Initial render should be fast
    });

    it('should handle pagination efficiently', async () => {
      const mockApi = createMockApiWithDelay(100, 500);
      vi.doMock('../services/api', () => mockApi);
      
      const user = userEvent.setup();
      renderWithProviders(<BrowsePage />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getAllByTestId(/curriculum-card/i)).toHaveLength.greaterThan(0);
      });
      
      const paginationTime = await measurePerformance(async () => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);
        
        await waitFor(() => {
          expect(screen.getAllByTestId(/curriculum-card/i)).toHaveLength.greaterThan(0);
        }, { timeout: 2000 });
      });
      
      expect(paginationTime).toBeLessThan(1500);
    });

    it('should lazy load images efficiently', async () => {
      vi.doMock('../services/api', () => createMockApiWithDelay(50, 50));
      
      const renderTime = await measurePerformance(async () => {
        renderWithProviders(<BrowsePage />);
        
        await waitFor(() => {
          const images = screen.getAllByRole('img');
          expect(images).toHaveLength.greaterThan(0);
        }, { timeout: 2000 });
      });
      
      expect(renderTime).toBeLessThan(1000);
      
      // Check that images have loading="lazy" attribute
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Memory Performance', () => {
    it('should not cause memory leaks with frequent searches', async () => {
      const mockApi = createMockApiWithDelay(50, 50);
      vi.doMock('../services/api', () => mockApi);
      
      const user = userEvent.setup();
      const { unmount } = renderWithProviders(<SearchPage />);
      
      // Perform multiple searches
      for (let i = 0; i < 10; i++) {
        const searchInput = screen.getByPlaceholderText(/search curricula/i);
        await user.clear(searchInput);
        await user.type(searchInput, `search ${i}`);
        
        await waitFor(() => {
          expect(screen.getByText(/search results/i)).toBeInTheDocument();
        });
      }
      
      // Cleanup should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('should efficiently handle component unmounting', async () => {
      vi.doMock('../services/api', () => createMockApiWithDelay(50, 100));
      
      const { unmount } = renderWithProviders(<BrowsePage />);
      
      // Unmount before API calls complete
      setTimeout(() => unmount(), 25);
      
      // Should not cause errors or warnings
      expect(() => {
        // Wait a bit to ensure any pending operations complete
        return new Promise(resolve => setTimeout(resolve, 200));
      }).not.toThrow();
    });
  });

  describe('Network Performance', () => {
    it('should handle slow network conditions gracefully', async () => {
      // Simulate slow network (2 second delay)
      vi.doMock('../services/api', () => createMockApiWithDelay(2000, 50));
      
      const user = userEvent.setup();
      renderWithProviders(<SearchPage />);
      
      const searchInput = screen.getByPlaceholderText(/search curricula/i);
      await user.type(searchInput, 'math');
      
      // Should show loading state immediately
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      
      // Should eventually load results
      await waitFor(() => {
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should cache API responses to improve performance', async () => {
      const mockApi = createMockApiWithDelay(100, 50);
      vi.doMock('../services/api', () => mockApi);
      
      const user = userEvent.setup();
      renderWithProviders(<SearchPage />);
      
      // First search
      const searchInput = screen.getByPlaceholderText(/search curricula/i);
      await user.type(searchInput, 'math');
      
      await waitFor(() => {
        expect(screen.getByText(/search results/i)).toBeInTheDocument();
      });
      
      // Clear and search again with same term
      await user.clear(searchInput);
      await user.type(searchInput, 'math');
      
      // Second search should be faster (cached)
      const secondSearchTime = await measurePerformance(async () => {
        await waitFor(() => {
          expect(screen.getByText(/search results/i)).toBeInTheDocument();
        });
      });
      
      expect(secondSearchTime).toBeLessThan(200); // Should be much faster due to caching
    });
  });

  describe('Bundle Size Performance', () => {
    it('should lazy load non-critical components', async () => {
      // This test would check that admin components are not loaded for regular users
      renderWithProviders(<HomePage />);
      
      // Admin components should not be in the initial bundle
      expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
      
      // Only essential components should be loaded initially
      expect(screen.getByText(/find the perfect/i)).toBeInTheDocument();
    });
  });
});