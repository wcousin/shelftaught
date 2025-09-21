import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

const mockCategories = {
  subjects: [
    { id: '1', name: 'Mathematics', description: 'Math curricula', curriculumCount: 25 },
    { id: '2', name: 'Science', description: 'Science curricula', curriculumCount: 18 },
    { id: '3', name: 'Language Arts', description: 'Reading and writing', curriculumCount: 32 }
  ],
  gradeLevels: [
    { id: '1', name: 'Elementary', ageRange: '5-10', curriculumCount: 45 },
    { id: '2', name: 'Middle School', ageRange: '11-13', curriculumCount: 28 },
    { id: '3', name: 'High School', ageRange: '14-18', curriculumCount: 22 }
  ]
};

const mockFilters = {
  subjects: [],
  gradeLevels: [],
  priceRange: '',
  teachingApproach: ''
};

const mockOnFilterChange = vi.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders subject categories', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('Language Arts')).toBeInTheDocument();
  });

  it('renders grade level categories', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByText('Grade Levels')).toBeInTheDocument();
    expect(screen.getByText('Elementary')).toBeInTheDocument();
    expect(screen.getByText('Middle School')).toBeInTheDocument();
    expect(screen.getByText('High School')).toBeInTheDocument();
  });

  it('displays curriculum counts for each category', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByText('(25)')).toBeInTheDocument();
    expect(screen.getByText('(18)')).toBeInTheDocument();
    expect(screen.getByText('(32)')).toBeInTheDocument();
    expect(screen.getByText('(45)')).toBeInTheDocument();
  });

  it('calls onFilterChange when subject is selected', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const mathCheckbox = screen.getByLabelText('Mathematics');
    fireEvent.click(mathCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      subjects: ['1']
    });
  });

  it('calls onFilterChange when grade level is selected', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const elementaryCheckbox = screen.getByLabelText('Elementary');
    fireEvent.click(elementaryCheckbox);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      gradeLevels: ['1']
    });
  });

  it('renders price range filter', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByLabelText('$')).toBeInTheDocument();
    expect(screen.getByLabelText('$$')).toBeInTheDocument();
    expect(screen.getByLabelText('$$$')).toBeInTheDocument();
    expect(screen.getByLabelText('$$$$')).toBeInTheDocument();
  });

  it('renders teaching approach filter', () => {
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={mockFilters} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByText('Teaching Approach')).toBeInTheDocument();
    expect(screen.getByLabelText('Traditional')).toBeInTheDocument();
    expect(screen.getByLabelText('Charlotte Mason')).toBeInTheDocument();
    expect(screen.getByLabelText('Unit Studies')).toBeInTheDocument();
  });

  it('shows selected filters as checked', () => {
    const filtersWithSelections = {
      subjects: ['1'],
      gradeLevels: ['2'],
      priceRange: '$$',
      teachingApproach: 'Traditional'
    };
    
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={filtersWithSelections} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByLabelText('Mathematics')).toBeChecked();
    expect(screen.getByLabelText('Middle School')).toBeChecked();
    expect(screen.getByLabelText('$$')).toBeChecked();
    expect(screen.getByLabelText('Traditional')).toBeChecked();
  });

  it('renders clear filters button when filters are applied', () => {
    const filtersWithSelections = {
      subjects: ['1'],
      gradeLevels: [],
      priceRange: '',
      teachingApproach: ''
    };
    
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={filtersWithSelections} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
  });

  it('clears all filters when clear button is clicked', () => {
    const filtersWithSelections = {
      subjects: ['1', '2'],
      gradeLevels: ['1'],
      priceRange: '$$',
      teachingApproach: 'Traditional'
    };
    
    renderWithRouter(
      <Sidebar 
        categories={mockCategories} 
        filters={filtersWithSelections} 
        onFilterChange={mockOnFilterChange} 
      />
    );
    
    const clearButton = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearButton);
    
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      subjects: [],
      gradeLevels: [],
      priceRange: '',
      teachingApproach: ''
    });
  });
});