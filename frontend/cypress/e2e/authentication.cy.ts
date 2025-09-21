describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedDatabase();
  });

  afterEach(() => {
    cy.cleanDatabase();
  });

  it('should complete user registration and login flow', () => {
    // 1. Visit registration page
    cy.visit('/register');
    
    // 2. Fill out registration form
    cy.get('[data-testid="first-name-input"]').type('John');
    cy.get('[data-testid="last-name-input"]').type('Doe');
    cy.get('[data-testid="email-input"]').type('john.doe@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('password123');
    
    // 3. Submit registration
    cy.get('[data-testid="register-button"]').click();
    
    // 4. Should be redirected to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, John');
    
    // 5. Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // 6. Should be redirected to homepage
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // 7. Login with the same credentials
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('john.doe@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // 8. Should be logged in and redirected to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, John');
  });

  it('should show validation errors for invalid registration', () => {
    cy.visit('/register');
    
    // Try to submit empty form
    cy.get('[data-testid="register-button"]').click();
    
    // Should show validation errors
    cy.get('[data-testid="first-name-error"]').should('contain', 'First name is required');
    cy.get('[data-testid="last-name-error"]').should('contain', 'Last name is required');
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
    
    // Test invalid email format
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email');
    
    // Test password mismatch
    cy.get('[data-testid="email-input"]').clear().type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="confirm-password-input"]').type('different123');
    cy.get('[data-testid="register-button"]').click();
    cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match');
  });

  it('should show error for invalid login credentials', () => {
    cy.visit('/login');
    
    // Try to login with invalid credentials
    cy.get('[data-testid="email-input"]').type('nonexistent@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Should show error message
    cy.get('[data-testid="login-error"]').should('contain', 'Invalid email or password');
    
    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should redirect to login when accessing protected routes', () => {
    // Try to access dashboard without being logged in
    cy.visit('/dashboard');
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
    
    // Should show message about needing to log in
    cy.get('[data-testid="login-required-message"]').should('be.visible');
  });

  it('should persist login state across page refreshes', () => {
    // Register and login
    cy.register({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: 'password123'
    });
    
    cy.visit('/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, Jane');
    
    // Refresh the page
    cy.reload();
    
    // Should still be logged in
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, Jane');
  });
});