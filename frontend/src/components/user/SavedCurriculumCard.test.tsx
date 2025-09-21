import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import SavedCurriculumCard from './SavedCurriculumCard';

const mockSavedCurriculum = {
  id: '1',
  userId: 'user1',
  curriculumId: 'curr1',
  personalNotes: 'Great for my child',
  savedAt: new Date('2024-01-01'),
  curriculum: {
    id: 'curr1',
    name: 'Test Curriculum',
    publisher: 'Test Publisher',
    description: 'A test curriculum',
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
      components: ['Textbook'],
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
    strengths: ['Comprehensive'],
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
  }
};

const mockOnRemove = vi.fn();
const mockOnUpdateNotes = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SavedCurriculumCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders curriculum information', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByText('Test Curriculum')).toBeInTheDocument();
    expect(screen.getByText('Test Publisher')).toBeInTheDocument();
    expect(screen.getByText('K-6')).toBeInTheDocument();
  });

  it('displays personal notes', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByText('Great for my child')).toBeInTheDocument();
  });

  it('shows saved date', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByText(/saved on/i)).toBeInTheDocument();
  });

  it('renders remove button', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('renders edit notes button', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByRole('button', { name: /edit notes/i })).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('shows edit form when edit notes is clicked', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit notes/i });
    fireEvent.click(editButton);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onUpdateNotes when notes are saved', async () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit notes/i });
    fireEvent.click(editButton);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Updated notes' } });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnUpdateNotes).toHaveBeenCalledWith('1', 'Updated notes');
    });
  });

  it('cancels editing when cancel button is clicked', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit notes/i });
    fireEvent.click(editButton);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Great for my child')).toBeInTheDocument();
  });

  it('links to curriculum detail page', () => {
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={mockSavedCurriculum}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/curriculum/curr1');
  });

  it('handles curriculum without notes', () => {
    const curriculumWithoutNotes = {
      ...mockSavedCurriculum,
      personalNotes: null
    };
    
    renderWithRouter(
      <SavedCurriculumCard 
        savedCurriculum={curriculumWithoutNotes}
        onRemove={mockOnRemove}
        onUpdateNotes={mockOnUpdateNotes}
      />
    );
    
    expect(screen.getByText(/no notes added/i)).toBeInTheDocument();
  });
});