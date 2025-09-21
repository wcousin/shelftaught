describe('Saved Curricula Management', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedDatabase();
    
    // Register and login a test user
    cy.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'testuser@example.com',
      password: 'password123'
    });
  });

  afterEach(() => {
    cy.cleanDatabase();
  });

  it('should allow user to save and manage curricula', () => {
    // 1. Browse curricula and save one
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    // 2. Should show success message
    cy.get('[data-testid="save-success-message"]').should('be.visible');
    cy.get('[data-testid="save-success-message"]').should('contain', 'Curriculum saved');
    
    // 3. Go to dashboard to view saved curricula
    cy.visit('/dashboard');
    cy.get('[data-testid="saved-curricula-section"]').should('be.visible');
    cy.get('[data-testid="saved-curriculum-card"]').should('have.length', 1);
    
    // 4. Add personal notes to saved curriculum
    cy.get('[data-testid="saved-curriculum-card"]').first().within(() => {
      cy.get('[data-testid="edit-notes-button"]').click();
      cy.get('[data-testid="notes-textarea"]').type('This looks perfect for my 8-year-old');
      cy.get('[data-testid="save-notes-button"]').click();
    });
    
    // 5. Verify notes are saved
    cy.get('[data-testid="saved-curriculum-card"]').first().within(() => {
      cy.get('[data-testid="personal-notes"]').should('contain', 'This looks perfect for my 8-year-old');
    });
    
    // 6. Remove curriculum from saved list
    cy.get('[data-testid="saved-curriculum-card"]').first().within(() => {
      cy.get('[data-testid="remove-curriculum-button"]').click();
    });
    
    // 7. Confirm removal
    cy.get('[data-testid="confirm-remove-button"]').click();
    
    // 8. Verify curriculum is removed
    cy.get('[data-testid="saved-curriculum-card"]').should('not.exist');
    cy.get('[data-testid="no-saved-curricula-message"]').should('be.visible');
  });

  it('should prevent saving the same curriculum twice', () => {
    // Save a curriculum
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    // Try to save the same curriculum again
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').should('be.disabled');
      cy.get('[data-testid="already-saved-indicator"]').should('be.visible');
    });
  });

  it('should allow saving curricula from detail page', () => {
    // Go to curriculum detail page
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().click();
    
    // Save from detail page
    cy.get('[data-testid="save-curriculum-button"]').click();
    cy.get('[data-testid="save-success-message"]').should('be.visible');
    
    // Verify it appears in dashboard
    cy.visit('/dashboard');
    cy.get('[data-testid="saved-curriculum-card"]').should('have.length', 1);
  });

  it('should show saved curricula count in navigation', () => {
    // Save multiple curricula
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    cy.get('[data-testid="curriculum-card"]').eq(1).within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    // Check saved count in navigation
    cy.get('[data-testid="saved-count-badge"]').should('contain', '2');
  });

  it('should allow editing and canceling notes', () => {
    // Save a curriculum first
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    // Go to dashboard
    cy.visit('/dashboard');
    
    // Start editing notes
    cy.get('[data-testid="saved-curriculum-card"]').first().within(() => {
      cy.get('[data-testid="edit-notes-button"]').click();
      cy.get('[data-testid="notes-textarea"]').type('Some notes');
      
      // Cancel editing
      cy.get('[data-testid="cancel-notes-button"]').click();
      
      // Should not save the notes
      cy.get('[data-testid="personal-notes"]').should('not.contain', 'Some notes');
    });
  });

  it('should require authentication to save curricula', () => {
    // Logout first
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Try to save a curriculum while not logged in
    cy.visit('/browse');
    cy.get('[data-testid="curriculum-card"]').first().within(() => {
      cy.get('[data-testid="save-curriculum-button"]').click();
    });
    
    // Should be redirected to login
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-required-message"]').should('contain', 'Please log in to save curricula');
  });
});