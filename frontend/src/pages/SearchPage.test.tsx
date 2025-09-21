import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SearchPage from './SearchPage';
import { AuthContext } from '../contexts/AuthContext';
import { AppContext } from '../contexts/AppContext';

// Mock the API service
vi.mock('../services/api', () => ({
  searchCurricula: vi.fn().mockResolvedValue({
    data: {
      curricula: [
        {
          id: '1',
          name: 'Math Curriculum',
          publisher: 'Test Publisher',
          description: 'A comprehensive math curriculum',
          overallRating: 4.5,
          reviewCount: 10,
          targetAgeGrade: { gradeRange: 'K-6' },
          subjectsCovered: { subjects: ['Math'] },
          cost: { priceRange: '$$' }
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    }
  })
}));

// Mock useSearchParams
const mockSearchParams = new URLSearchParams('?q=math');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, vi.fn()]
  };
});

const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAppContext = {
  categories: {
    subjects: [{ id: '1', name: 'Math', description: 'Math curricula', curriculumCount: 25 }],
    gradeLevels: [{ id: '1', name: 'Elementary', ageRange: '5-10', curriculumCount: 45 }]
  },
  loading: false,
  error: null,
  refreshCategories: vi.fn()
};

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

describe('SearchPage', () => {
  it('renders search results heading', async () => {
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/search results/i)).toBeInTheDocument();
    });
  });

  it('displays search query in heading', async () => {
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/results for "math"/i)).toBeInTheDocument();
    });
  });

  it('renders sidebar with filters', () => {
    renderWithProviders(<SearchPage />);
    
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Grade Levels')).toBeInTheDocument();
  });

  it('displays search results', async () => {
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Math Curriculum')).toBeInTheDocument();
    });
  });

  it('shows results count', async () => {
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/1 result/i)).toBeInTheDocument();
    });
  });

  it('renders sorting options', () => {
    renderWithProviders(<SearchPage />);
    
    expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    expect(screen.getByText(/relevance/i)).toBeInTheDocument();
    expect(screen.getByText(/rating/i)).toBeInTheDocument();
    expect(screen.getByText(/price/i)).toBeInTheDocument();
  });

  it('handles filter changes', async () => {
    renderWithProviders(<SearchPage />);
    
    const mathCheckbox = screen.getByLabelText('Math');
    fireEvent.click(mathCheckbox);
    
    // Should trigger a new search with filters
    await waitFor(() => {
      expect(screen.getByLabelText('Math')).toBeChecked();
    });
  });

  it('handles sort changes', async () => {
    renderWithProviders(<SearchPage />);
    
    const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
    fireEvent.change(sortSelect, { target: { value: 'rating' } });
    
    expect(sortSelect).toHaveValue('rating');
  });

  it('shows no results message when no curricula found', async () => {
    // Mock empty results
    const { searchCurricula } = await import('../services/api');
    vi.mocked(searchCurricula).mockResolvedValueOnce({
      data: {
        curricula: [],
        total: 0,
        page: 1,
        totalPages: 0
      }
    });
    
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/no curricula found/i)).toBeInTheDocument();
    });
  });

  it('renders pagination when multiple pages exist', async () => {
    // Mock paginated results
    const { searchCurricula } = await import('../services/api');
    vi.mocked(searchCurricula).mockResolvedValueOnce({
      data: {
        curricula: [
          {
            id: '1',
            name: 'Math Curriculum',
            publisher: 'Test Publisher',
            description: 'A comprehensive math curriculum',
            overallRating: 4.5,
            reviewCount: 10,
            targetAgeGrade: { gradeRange: 'K-6' },
            subjectsCovered: { subjects: ['Math'] },
            cost: { priceRange: '$$' }
          }
        ],
        total: 25,
        page: 1,
        totalPages: 3
      }
    });
    
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  it('shows loading state during search', () => {
    renderWithProviders(<SearchPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('handles search errors gracefully', async () => {
    // Mock search error
    const { searchCurricula } = await import('../services/api');
    vi.mocked(searchCurricula).mockRejectedValueOnce(new Error('Search failed'));
    
    renderWithProviders(<SearchPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/error loading search results/i)).toBeInTheDocument();
    });
  });
});