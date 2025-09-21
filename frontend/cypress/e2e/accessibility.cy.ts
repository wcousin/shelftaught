describe('Accessibility E2E Tests', () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit('/');
    cy.injectAxe();
  });

  afterEach(() => {
    cy.cleanDatabase();
  });

  it('Homepage should be accessible', () => {
    cy.checkA11y();
  });

  it('Search functionality should be accessible', () => {
    // Test search page accessibility
    cy.get('[data-testid="search-input"]').type('math');
    cy.get('[data-testid="search-button"]').click();
    
    cy.url().should('include', '/search');
    cy.checkA11y();
    
    // Test keyboard navigation in search results
    cy.get('[data-testid="curriculum-card"]').first().focus();
    cy.focused().should('have.attr', 'data-testid', 'curriculum-card');
    
    // Test filter accessibility
    cy.get('[data-testid="filter-elementary"]').should('be.visible');
    cy.checkA11y('[data-testid="sidebar"]');
  });

  it('Curriculum detail page should be accessible', () => {
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().click();
    
    cy.url().should('include', '/curriculum/');
    cy.checkA11y();
    
    // Check specific accessibility concerns for curriculum details
    cy.get('[data-testid="rating-display"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="curriculum-name"]').should('be.visible');
  });

  it('Authentication forms should be accessible', () => {
    // Test login form
    cy.visit('/login');
    cy.checkA11y();
    
    // Check form labels and ARIA attributes
    cy.get('input[type="email"]').should('have.attr', 'aria-label');
    cy.get('input[type="password"]').should('have.attr', 'aria-label');
    
    // Test registration form
    cy.visit('/register');
    cy.checkA11y();
    
    // Test form validation accessibility
    cy.get('[data-testid="register-button"]').click();
    
    // Error messages should be associated with inputs
    cy.get('[data-testid="first-name-error"]').should('be.visible');
    cy.get('input[name="firstName"]').should('have.attr', 'aria-describedby');
  });

  it('User dashboard should be accessible', () => {
    // Register and login
    cy.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    });
    
    cy.visit('/dashboard');
    cy.checkA11y();
    
    // Test saved curricula section
    cy.get('[data-testid="saved-curricula-section"]').should('be.visible');
    cy.checkA11y('[data-testid="saved-curricula-section"]');
  });

  it('Navigation should be keyboard accessible', () => {
    // Test keyboard navigation through main menu
    cy.get('body').tab();
    cy.focused().should('contain', 'Shelf Taught'); // Logo/home link
    
    cy.focused().tab();
    cy.focused().should('contain', 'Browse');
    
    cy.focused().tab();
    cy.focused().should('contain', 'Compare');
    
    // Test search bar keyboard accessibility
    cy.get('[data-testid="search-input"]').focus();
    cy.focused().type('math');
    cy.focused().type('{enter}');
    
    cy.url().should('include', '/search');
  });

  it('Color contrast should meet WCAG standards', () => {
    cy.visit('/');
    
    // Check color contrast specifically
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
    
    // Test different pages for color contrast
    cy.visit('/browse');
    cy.checkA11y(null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });
  });

  it('Images should have proper alt text', () => {
    cy.visit('/browse');
    
    // Check that all images have alt attributes
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
    
    cy.checkA11y();
  });

  it('Form validation should be accessible', () => {
    cy.visit('/register');
    
    // Submit empty form to trigger validation
    cy.get('[data-testid="register-button"]').click();
    
    // Check that error messages are properly associated
    cy.get('[data-testid="first-name-error"]').should('be.visible');
    cy.get('input[name="firstName"]')
      .should('have.attr', 'aria-describedby')
      .and('have.attr', 'aria-invalid', 'true');
    
    cy.checkA11y();
  });

  it('Interactive elements should have focus indicators', () => {
    cy.visit('/');
    
    // Test that buttons have visible focus indicators
    cy.get('button').each(($button) => {
      cy.wrap($button).focus();
      // Focus should be visible (this would need custom CSS checking)
      cy.wrap($button).should('be.focused');
    });
    
    // Test that links have visible focus indicators
    cy.get('a').each(($link) => {
      cy.wrap($link).focus();
      cy.wrap($link).should('be.focused');
    });
  });

  it('Headings should have proper hierarchy', () => {
    cy.visit('/');
    
    // Check heading structure
    cy.get('h1').should('have.length.at.least', 1);
    
    // Verify heading hierarchy (h1 -> h2 -> h3, etc.)
    cy.checkA11y(null, {
      rules: {
        'heading-order': { enabled: true }
      }
    });
  });

  it('ARIA landmarks should be present', () => {
    cy.visit('/');
    
    // Check for main landmark
    cy.get('main, [role="main"]').should('exist');
    
    // Check for navigation landmark
    cy.get('nav, [role="navigation"]').should('exist');
    
    // Check for banner (header) landmark
    cy.get('header, [role="banner"]').should('exist');
    
    // Check for contentinfo (footer) landmark
    cy.get('footer, [role="contentinfo"]').should('exist');
    
    cy.checkA11y();
  });

  it('Skip links should be available', () => {
    cy.visit('/');
    
    // Test skip to main content link
    cy.get('body').tab();
    cy.focused().should('contain', 'Skip to main content');
    
    // Activate skip link
    cy.focused().type('{enter}');
    cy.focused().should('be.within', 'main');
  });

  it('Tables should have proper headers', () => {
    // Visit comparison page which likely has tables
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().find('[data-testid="compare-checkbox"]').click();
    cy.get('[data-testid="curriculum-card"]').eq(1).find('[data-testid="compare-checkbox"]').click();
    cy.get('[data-testid="compare-button"]').click();
    
    // Check table accessibility
    cy.get('table').should('exist');
    cy.get('th').should('exist');
    
    cy.checkA11y('table');
  });

  it('Loading states should be accessible', () => {
    cy.visit('/');
    
    // Trigger a loading state
    cy.get('[data-testid="search-input"]').type('math');
    cy.get('[data-testid="search-button"]').click();
    
    // Loading indicator should have proper ARIA attributes
    cy.get('[data-testid="loading-spinner"]', { timeout: 1000 })
      .should('have.attr', 'aria-label')
      .and('contain', 'Loading');
    
    cy.checkA11y();
  });

  it('Error messages should be accessible', () => {
    cy.visit('/login');
    
    // Trigger an error by submitting invalid credentials
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Error message should be announced to screen readers
    cy.get('[data-testid="login-error"]')
      .should('be.visible')
      .and('have.attr', 'role', 'alert');
    
    cy.checkA11y();
  });

  it('Modal dialogs should be accessible', () => {
    // This would test modal accessibility when modals are implemented
    // For now, test any overlay or popup functionality
    
    cy.visit('/dashboard');
    
    // If there are any modal triggers, test them
    cy.get('[data-testid="modal-trigger"]').then(($triggers) => {
      if ($triggers.length > 0) {
        cy.wrap($triggers).first().click();
        
        // Modal should trap focus
        cy.get('[role="dialog"]').should('be.visible');
        cy.checkA11y('[role="dialog"]');
      }
    });
  });
});