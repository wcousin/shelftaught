import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparisonTable from './ComparisonTable';
import type { Curriculum } from '../../types';

const mockCurriculum: Curriculum = {
  id: '1',
  name: 'Test Curriculum',
  publisher: 'Test Publisher',
  description: 'Test description',
  imageUrl: 'test.jpg',
  targetAgeGrade: {
    minAge: 6,
    maxAge: 12,
    gradeRange: 'K-6',
    rating: 4.5
  },
  teachingApproach: {
    style: 'Traditional',
    description: 'Traditional approach',
    rating: 4.0
  },
  subjectsCovered: {
    subjects: ['Math', 'Reading'],
    comprehensiveness: 4,
    rating: 4.2
  },
  materialsIncluded: {
    components: ['Textbook', 'Workbook'],
    completeness: 4,
    rating: 4.1
  },
  instructionStyle: {
    type: 'Parent-led',
    supportLevel: 3,
    rating: 3.8
  },
  timeCommitment: {
    dailyMinutes: 60,
    weeklyHours: 5,
    flexibility: 3,
    rating: 3.5
  },
  cost: {
    priceRange: '$$',
    value: 4,
    rating: 4.0
  },
  strengths: ['Easy to use'],
  weaknesses: ['Limited scope'],
  bestFor: ['Beginners'],
  availability: {
    inPrint: true,
    digitalAvailable: false,
    usedMarket: true,
    rating: 4.0
  },
  overallRating: 4.0,
  reviewCount: 10,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
};

describe('ComparisonTable', () => {
  it('renders empty state when no curricula provided', () => {
    render(<ComparisonTable curricula={[]} />);
    expect(screen.getByText('No curricula selected for comparison')).toBeInTheDocument();
  });

  it('renders comparison table with curricula', () => {
    render(<ComparisonTable curricula={[mockCurriculum]} />);
    expect(screen.getByText('Curriculum Comparison')).toBeInTheDocument();
    expect(screen.getByText('Test Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Test Publisher')).toBeInTheDocument();
  });

  it('displays rating information correctly', () => {
    render(<ComparisonTable curricula={[mockCurriculum]} />);
    expect(screen.getByText('Overall Rating')).toBeInTheDocument();
    expect(screen.getByText('Grade Range')).toBeInTheDocument();
    expect(screen.getByText('K-6')).toBeInTheDocument();
  });
});