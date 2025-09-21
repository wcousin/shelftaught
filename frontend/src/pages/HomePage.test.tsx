import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';
import { AuthContext } from '../contexts/AuthContext';
import { AppContext } from '../contexts/AppContext';

// Mock the API service
vi.mock('../services/api', () => ({
  getCurricula: vi.fn().mockResolvedValue({
    data: {
      curricula: [
        {
          id: '1',
          name: 'Featured Curriculum 1',
          publisher: 'Test Publisher',
          description: 'A great curriculum',
          overallRating: 4.5,
          reviewCount: 10,
          targetAgeGrade: { gradeRange: 'K-6' },
          subjectsCovered: { subjects: ['Math', 'Reading'] },
          cost: { priceRange: '$$' }
        }
      ],
      total: 1,
      page: 1,
      totalPages: 1
    }
  }),
  getCategories: vi.fn().mockResolvedValue({
    data: {
      subjects: [{ id: '1', name: 'Math', curriculumCount: 25 }],
      gradeLevels: [{ id: '1', name: 'Elementary', curriculumCount: 45 }]
    }
  })
}));

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

describe('HomePage', () => {
  it('renders hero section with main heading', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText(/find the perfect homeschool curriculum/i)).toBeInTheDocument();
  });

  it('renders search interface', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByPlaceholderText(/search curricula/i)).toBeInTheDocument();
  });

  it('renders featured curricula section', async () => {
    renderWithProviders(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/featured curricula/i)).toBeInTheDocument();
    });
  });

  it('displays featured curriculum cards', async () => {
    renderWithProviders(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured Curriculum 1')).toBeInTheDocument();
    });
  });

  it('renders browse by subject section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText(/browse by subject/i)).toBeInTheDocument();
    expect(screen.getByText('Math')).toBeInTheDocument();
  });

  it('renders browse by grade level section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText(/browse by grade level/i)).toBeInTheDocument();
    expect(screen.getByText('Elementary')).toBeInTheDocument();
  });

  it('renders call-to-action sections', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText(/why choose shelf taught/i)).toBeInTheDocument();
    expect(screen.getByText(/get started today/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    const loadingAppContext = { ...mockAppContext, loading: true };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <AppContext.Provider value={loadingAppContext}>
            <HomePage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const errorAppContext = { ...mockAppContext, error: 'Failed to load data' };
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <AppContext.Provider value={errorAppContext}>
            <HomePage />
          </AppContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
    
    expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
  });

  it('renders testimonials section', () => {
    renderWithProviders(<HomePage />);
    
    expect(screen.getByText(/what parents are saying/i)).toBeInTheDocument();
  });

  it('has proper navigation links', () => {
    renderWithProviders(<HomePage />);
    
    const browseLink = screen.getByRole('link', { name: /browse all curricula/i });
    expect(browseLink).toHaveAttribute('href', '/browse');
  });
});