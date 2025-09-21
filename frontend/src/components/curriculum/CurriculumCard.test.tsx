import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CurriculumCard from './CurriculumCard';
import { AuthContext } from '../../contexts/AuthContext';

const mockCurriculum = {
  id: '1',
  name: 'Test Curriculum',
  publisher: 'Test Publisher',
  description: 'A test curriculum for homeschooling',
  imageUrl: '/test-image.jpg',
  targetAgeGrade: {
    minAge: 6,
    maxAge: 12,
    gradeRange: 'K-6',
    rating: 4
  },
  teachingApproach: {
    style: 'Traditional',
    description: 'Traditional approach',
    rating: 4
  },
  subjectsCovered: {
    subjects: ['Math', 'Reading'],
    comprehensiveness: 4,
    rating: 4
  },
  materialsIncluded: {
    components: ['Textbook', 'Workbook'],
    completeness: 4,
    rating: 4
  },
  instructionStyle: {
    type: 'Parent-led',
    supportLevel: 4,
    rating: 4
  },
  timeCommitment: {
    dailyMinutes: 60,
    weeklyHours: 5,
    flexibility: 3,
    rating: 4
  },
  cost: {
    priceRange: '$$',
    value: 4,
    rating: 4
  },
  strengths: ['Comprehensive', 'Well-structured'],
  weaknesses: ['Time-intensive'],
  bestFor: ['Traditional learners'],
  availability: {
    inPrint: true,
    digitalAvailable: true,
    usedMarket: true,
    rating: 5
  },
  overallRating: 4.2,
  reviewCount: 15,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('CurriculumCard', () => {
  it('renders curriculum information correctly', () => {
    renderWithProviders(<CurriculumCard curriculum={mockCurriculum} />);
    
    expect(screen.getByText('Test Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Test Publisher')).toBeInTheDocument();
    expect(screen.getByText('A test curriculum for homeschooling')).toBeInTheDocument();
    expect(screen.getByText('K-6')).toBeInTheDocument();
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('15 reviews')).toBeInTheDocument();
  });

  it('displays subjects correctly', () => {
    renderWithProviders(<CurriculumCard curriculum={mockCurriculum} />);
    
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Reading')).toBeInTheDocument();
  });

  it('shows price range', () => {
    renderWithProviders(<CurriculumCard curriculum={mockCurriculum} />);
    
    expect(screen.getByText('$$')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    renderWithProviders(<CurriculumCard curriculum={mockCurriculum} />);
    
    const image = screen.getByAltText('Test Curriculum');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('links to curriculum detail page', () => {
    renderWithProviders(<CurriculumCard curriculum={mockCurriculum} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/curriculum/1');
  });

  it('handles missing image gracefully', () => {
    const curriculumWithoutImage = { ...mockCurriculum, imageUrl: undefined };
    renderWithProviders(<CurriculumCard curriculum={curriculumWithoutImage} />);
    
    const image = screen.getByAltText('Test Curriculum');
    expect(image).toBeInTheDocument();
  });
});