import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import ReviewForm from './ReviewForm';

const mockCurriculum = {
  id: '1',
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

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields for new curriculum', () => {
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/curriculum name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/publisher/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('populates form fields when editing existing curriculum', () => {
    render(
      <ReviewForm 
        curriculum={mockCurriculum}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByDisplayValue('Test Curriculum')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Publisher')).toBeInTheDocument();
    expect(screen.getByDisplayValue('A test curriculum')).toBeInTheDocument();
  });

  it('renders rating sections', () => {
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByText(/target age\/grade/i)).toBeInTheDocument();
    expect(screen.getByText(/teaching approach/i)).toBeInTheDocument();
    expect(screen.getByText(/subjects covered/i)).toBeInTheDocument();
    expect(screen.getByText(/materials included/i)).toBeInTheDocument();
    expect(screen.getByText(/instruction style/i)).toBeInTheDocument();
    expect(screen.getByText(/time commitment/i)).toBeInTheDocument();
    expect(screen.getByText(/cost/i)).toBeInTheDocument();
    expect(screen.getByText(/availability/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const submitButton = screen.getByRole('button', { name: /save curriculum/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/curriculum name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/publisher is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText(/curriculum name/i), 'New Curriculum');
    await user.type(screen.getByLabelText(/publisher/i), 'New Publisher');
    await user.type(screen.getByLabelText(/description/i), 'New description');
    
    // Fill in some rating fields
    await user.type(screen.getByLabelText(/minimum age/i), '5');
    await user.type(screen.getByLabelText(/maximum age/i), '10');
    await user.type(screen.getByLabelText(/grade range/i), 'K-5');
    
    const submitButton = screen.getByRole('button', { name: /save curriculum/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Curriculum',
          publisher: 'New Publisher',
          description: 'New description'
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('handles rating input changes', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const ratingInput = screen.getByLabelText(/target age.*rating/i);
    await user.clear(ratingInput);
    await user.type(ratingInput, '5');
    
    expect(ratingInput).toHaveValue(5);
  });

  it('handles subjects array input', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const subjectsInput = screen.getByLabelText(/subjects/i);
    await user.type(subjectsInput, 'Math, Science, Reading');
    
    expect(subjectsInput).toHaveValue('Math, Science, Reading');
  });

  it('handles strengths and weaknesses arrays', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const strengthsInput = screen.getByLabelText(/strengths/i);
    const weaknessesInput = screen.getByLabelText(/weaknesses/i);
    
    await user.type(strengthsInput, 'Comprehensive, Well-organized');
    await user.type(weaknessesInput, 'Expensive, Time-consuming');
    
    expect(strengthsInput).toHaveValue('Comprehensive, Well-organized');
    expect(weaknessesInput).toHaveValue('Expensive, Time-consuming');
  });

  it('handles boolean availability fields', async () => {
    const user = userEvent.setup();
    render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    const inPrintCheckbox = screen.getByLabelText(/in print/i);
    const digitalCheckbox = screen.getByLabelText(/digital available/i);
    
    await user.click(inPrintCheckbox);
    await user.click(digitalCheckbox);
    
    expect(inPrintCheckbox).toBeChecked();
    expect(digitalCheckbox).toBeChecked();
  });

  it('shows different button text for editing vs creating', () => {
    const { rerender } = render(<ReviewForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    
    expect(screen.getByRole('button', { name: /save curriculum/i })).toBeInTheDocument();
    
    rerender(
      <ReviewForm 
        curriculum={mockCurriculum}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByRole('button', { name: /update curriculum/i })).toBeInTheDocument();
  });

  it('handles form submission errors', async () => {
    const user = userEvent.setup();
    const mockOnSubmitWithError = vi.fn().mockRejectedValue(new Error('Submission failed'));
    
    render(<ReviewForm onSubmit={mockOnSubmitWithError} onCancel={mockOnCancel} />);
    
    await user.type(screen.getByLabelText(/curriculum name/i), 'Test');
    await user.type(screen.getByLabelText(/publisher/i), 'Test Publisher');
    
    const submitButton = screen.getByRole('button', { name: /save curriculum/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/submission failed/i)).toBeInTheDocument();
    });
  });
});