import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Mock the API service
vi.mock('../../services/api', () => ({
  searchCurricula: vi.fn().mockResolvedValue({
    data: {
      curricula: [
        { id: '1', name: 'Math Curriculum' },
        { id: '2', name: 'Science Curriculum' }
      ]
    }
  })
}));

describe('SearchBar', () => {
  it('renders search input correctly', () => {
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    expect(searchInput).toBeInTheDocument();
  });

  it('renders search button', () => {
    renderWithRouter(<SearchBar />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    await user.type(searchInput, 'math');
    
    expect(searchInput).toHaveValue('math');
  });

  it('shows suggestions when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    await user.type(searchInput, 'math');
    
    await waitFor(() => {
      expect(screen.getByText('Math Curriculum')).toBeInTheDocument();
    });
  });

  it('navigates to search page on form submit', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    const searchButton = screen.getByRole('button', { name: /search/i });
    
    await user.type(searchInput, 'science');
    await user.click(searchButton);
    
    // Check if URL contains search query
    expect(window.location.pathname).toBe('/search');
  });

  it('clears suggestions when input is cleared', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    
    await user.type(searchInput, 'math');
    await waitFor(() => {
      expect(screen.getByText('Math Curriculum')).toBeInTheDocument();
    });
    
    await user.clear(searchInput);
    
    await waitFor(() => {
      expect(screen.queryByText('Math Curriculum')).not.toBeInTheDocument();
    });
  });

  it('handles keyboard navigation in suggestions', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText(/search curricula/i);
    await user.type(searchInput, 'curriculum');
    
    await waitFor(() => {
      expect(screen.getByText('Math Curriculum')).toBeInTheDocument();
    });
    
    // Test arrow key navigation
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(window.location.pathname).toBe('/curriculum/1');
  });
});