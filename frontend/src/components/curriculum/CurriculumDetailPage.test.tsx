import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CurriculumDetailPage from '../../pages/CurriculumDetailPage';

// Mock the API
vi.mock('../../services/api', () => ({
  api: {
    getCurriculumById: vi.fn(),
    saveCurriculum: vi.fn(),
  }
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-id' }),
    useNavigate: () => vi.fn(),
  };
});

describe('CurriculumDetailPage', () => {
  it('renders loading state initially', () => {
    render(
      <BrowserRouter>
        <CurriculumDetailPage />
      </BrowserRouter>
    );
    
    // Should show loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});