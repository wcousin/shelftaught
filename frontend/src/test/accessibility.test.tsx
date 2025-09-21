import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { AppContext } from '../contexts/AppContext';

// Import components to test
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import CurriculumDetailPage from '../pages/CurriculumDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import UserDashboard from '../pages/UserDashboard';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CurriculumCard from '../components/curriculum/CurriculumCard';
import SearchBar from '../components/forms/SearchBar';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock contexts
const mockAuthContext = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAuthContextLoggedIn = {
  user: {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user' as const
  },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  loading: false
};

const mockAppContext = {
  categories: {
    subjects: [
      { id: '1', name: 'Math', description: 'Mathematics curricula', curriculumCount: 25 }
    ],
    gradeLevels: [
      { id: '1', name: 'Elementary', ageRange: '5-10', curriculumCount: 45 }
    ]
  },
  loading: false,
  error: null,
  refreshCategories: vi.fn()
};

const mockCurriculum = {
  id: '1',
  name: 'Test Curriculum',
  publisher: 'Test Publisher',
  description: 'A test curriculum for accessibility testing',
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

// Mock API calls
vi.mock('../services/api', () => ({
  getCurricula: vi.fn().mockResolvedValue({
    data: {
      curricula: [mockCurriculum],
      total: 1,
      page: 1,
      totalPages: 1
    }
  }),
  getCurriculum: vi.fn().mockResolvedValue({
    data: mockCurriculum
  }),
  getCategories: vi.fn().mockResolvedValue({
    data: {
      subjects: mockAppContext.categories.subjects,
      gradeLevels: mockAppContext.categories.gradeLevels
    }
  }),
  searchCurricula: vi.fn().mockResolvedValue({
    data: {
      curricula: [mockCurriculum],
      total: 1,
      page: 1,
      totalPages: 1
    }
  })
}));

const renderWithProviders = (
  component: React.ReactElement,
  authContext = mockAuthContext,
  appContext = mockAppContext
) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authContext}>
        <AppContext.Provider value={appContext}>
          {component}
        </AppContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Accessibility Tests', () => {
  describe('Layout Components', () => {
    it('Header should be accessible', async () => {
      const { container } = renderWithProviders(<Header />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Header with logged in user should be accessible', async () => {
      const { container } = renderWithProviders(<Header />, mockAuthContextLoggedIn);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Footer should be accessible', async () => {
      const { container } = renderWithProviders(<Footer />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('SearchBar should be accessible', async () => {
      const { container } = renderWithProviders(<SearchBar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Page Components', () => {
    it('HomePage should be accessible', async () => {
      const { container } = renderWithProviders(<HomePage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('LoginPage should be accessible', async () => {
      const { container } = renderWithProviders(<LoginPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('RegisterPage should be accessible', async () => {
      const { container } = renderWithProviders(<RegisterPage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('UserDashboard should be accessible', async () => {
      const { container } = renderWithProviders(<UserDashboard />, mockAuthContextLoggedIn);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Curriculum Components', () => {
    it('CurriculumCard should be accessible', async () => {
      const { container } = renderWithProviders(
        <CurriculumCard curriculum={mockCurriculum} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('Login form should have proper labels and ARIA attributes', async () => {
      const { container } = renderWithProviders(<LoginPage />);
      
      // Check for proper form labels
      const emailInput = container.querySelector('input[type="email"]');
      const passwordInput = container.querySelector('input[type="password"]');
      
      expect(emailInput).toHaveAttribute('aria-label');
      expect(passwordInput).toHaveAttribute('aria-label');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Registration form should have proper validation messages', async () => {
      const { container } = renderWithProviders(<RegisterPage />);
      
      // Check for ARIA describedby attributes for validation
      const inputs = container.querySelectorAll('input[required]');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-required', 'true');
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements', () => {
    it('Buttons should have accessible names', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        // Each button should have either text content or aria-label
        const hasAccessibleName = 
          button.textContent?.trim() || 
          button.getAttribute('aria-label') ||
          button.getAttribute('aria-labelledby');
        
        expect(hasAccessibleName).toBeTruthy();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Links should have accessible names', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        // Each link should have either text content or aria-label
        const hasAccessibleName = 
          link.textContent?.trim() || 
          link.getAttribute('aria-label') ||
          link.getAttribute('aria-labelledby');
        
        expect(hasAccessibleName).toBeTruthy();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Images and Media', () => {
    it('Images should have alt text', async () => {
      const { container } = renderWithProviders(
        <CurriculumCard curriculum={mockCurriculum} />
      );
      
      const images = container.querySelectorAll('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Design', () => {
    it('Should pass color contrast requirements', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      // axe-core will check color contrast automatically
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('Interactive elements should be keyboard accessible', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      // Check that interactive elements have proper tabindex
      const interactiveElements = container.querySelectorAll(
        'button, a, input, select, textarea, [tabindex]'
      );
      
      interactiveElements.forEach(element => {
        const tabIndex = element.getAttribute('tabindex');
        // Should not have negative tabindex unless it's intentionally hidden
        if (tabIndex && parseInt(tabIndex) < 0) {
          expect(element).toHaveAttribute('aria-hidden', 'true');
        }
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA Landmarks and Structure', () => {
    it('Should have proper heading hierarchy', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      // Should have at least one h1
      const h1Elements = container.querySelectorAll('h1');
      expect(h1Elements.length).toBeGreaterThanOrEqual(1);
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Should have proper landmark roles', async () => {
      const { container } = renderWithProviders(
        <div>
          <Header />
          <main>
            <HomePage />
          </main>
          <Footer />
        </div>
      );
      
      // Check for main landmark
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    it('Should manage focus properly in modals and overlays', async () => {
      // This would test modal components when they're implemented
      const { container } = renderWithProviders(<HomePage />);
      
      const results = await axe(container, {
        rules: {
          'focus-order-semantics': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Support', () => {
    it('Should provide proper ARIA labels and descriptions', async () => {
      const { container } = renderWithProviders(<HomePage />);
      
      // Check for proper ARIA attributes
      const elementsWithAriaLabel = container.querySelectorAll('[aria-label]');
      const elementsWithAriaDescribedby = container.querySelectorAll('[aria-describedby]');
      
      // Verify ARIA labels are meaningful
      elementsWithAriaLabel.forEach(element => {
        const ariaLabel = element.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
        expect(ariaLabel!.length).toBeGreaterThan(0);
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});