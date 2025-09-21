describe('Admin Panel Functionality', () => {
  beforeEach(() => {
    cy.cleanDatabase();
    cy.seedDatabase();
    
    // Login as admin user
    cy.login('admin@example.com', 'adminpassword');
  });

  afterEach(() => {
    cy.cleanDatabase();
  });

  it('should allow admin to create new curriculum', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    cy.get('[data-testid="admin-panel-heading"]').should('be.visible');
    
    // 2. Go to curriculum management
    cy.get('[data-testid="curriculum-management-tab"]').click();
    
    // 3. Click create new curriculum
    cy.get('[data-testid="create-curriculum-button"]').click();
    
    // 4. Fill out curriculum form
    cy.get('[data-testid="curriculum-name-input"]').type('New Test Curriculum');
    cy.get('[data-testid="publisher-input"]').type('Test Publisher');
    cy.get('[data-testid="description-textarea"]').type('A comprehensive test curriculum for all subjects');
    
    // Fill rating sections
    cy.get('[data-testid="min-age-input"]').type('6');
    cy.get('[data-testid="max-age-input"]').type('12');
    cy.get('[data-testid="grade-range-input"]').type('K-6');
    cy.get('[data-testid="target-age-rating-input"]').type('4');
    
    cy.get('[data-testid="teaching-style-input"]').type('Traditional');
    cy.get('[data-testid="teaching-approach-rating-input"]').type('4');
    
    cy.get('[data-testid="subjects-input"]').type('Math, Reading, Science');
    cy.get('[data-testid="subjects-rating-input"]').type('5');
    
    cy.get('[data-testid="price-range-select"]').select('$$');
    cy.get('[data-testid="cost-rating-input"]').type('4');
    
    // 5. Submit form
    cy.get('[data-testid="save-curriculum-button"]').click();
    
    // 6. Should show success message and redirect
    cy.get('[data-testid="success-message"]').should('contain', 'Curriculum created successfully');
    cy.get('[data-testid="curriculum-list"]').should('contain', 'New Test Curriculum');
  });

  it('should allow admin to edit existing curriculum', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    cy.get('[data-testid="curriculum-management-tab"]').click();
    
    // 2. Click edit on first curriculum
    cy.get('[data-testid="curriculum-row"]').first().within(() => {
      cy.get('[data-testid="edit-curriculum-button"]').click();
    });
    
    // 3. Update curriculum name
    cy.get('[data-testid="curriculum-name-input"]').clear().type('Updated Curriculum Name');
    
    // 4. Update description
    cy.get('[data-testid="description-textarea"]').clear().type('Updated description for this curriculum');
    
    // 5. Save changes
    cy.get('[data-testid="update-curriculum-button"]').click();
    
    // 6. Should show success message
    cy.get('[data-testid="success-message"]').should('contain', 'Curriculum updated successfully');
    cy.get('[data-testid="curriculum-list"]').should('contain', 'Updated Curriculum Name');
  });

  it('should allow admin to delete curriculum', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    cy.get('[data-testid="curriculum-management-tab"]').click();
    
    // 2. Get initial curriculum count
    cy.get('[data-testid="curriculum-row"]').then(($rows) => {
      const initialCount = $rows.length;
      
      // 3. Click delete on first curriculum
      cy.get('[data-testid="curriculum-row"]').first().within(() => {
        cy.get('[data-testid="delete-curriculum-button"]').click();
      });
      
      // 4. Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();
      
      // 5. Should show success message and remove curriculum
      cy.get('[data-testid="success-message"]').should('contain', 'Curriculum deleted successfully');
      cy.get('[data-testid="curriculum-row"]').should('have.length', initialCount - 1);
    });
  });

  it('should display analytics dashboard', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    
    // 2. Go to analytics tab
    cy.get('[data-testid="analytics-tab"]').click();
    
    // 3. Should display key metrics
    cy.get('[data-testid="total-curricula-metric"]').should('be.visible');
    cy.get('[data-testid="total-users-metric"]').should('be.visible');
    cy.get('[data-testid="total-reviews-metric"]').should('be.visible');
    
    // 4. Should display charts
    cy.get('[data-testid="popular-curricula-chart"]').should('be.visible');
    cy.get('[data-testid="user-activity-chart"]').should('be.visible');
    
    // 5. Should display recent activity
    cy.get('[data-testid="recent-activity-list"]').should('be.visible');
  });

  it('should allow admin to manage users', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    
    // 2. Go to user management tab
    cy.get('[data-testid="user-management-tab"]').click();
    
    // 3. Should display user list
    cy.get('[data-testid="user-list"]').should('be.visible');
    cy.get('[data-testid="user-row"]').should('have.length.at.least', 1);
    
    // 4. Should be able to search users
    cy.get('[data-testid="user-search-input"]').type('test');
    cy.get('[data-testid="user-row"]').should('be.visible');
    
    // 5. Should be able to view user details
    cy.get('[data-testid="user-row"]').first().within(() => {
      cy.get('[data-testid="view-user-button"]').click();
    });
    
    cy.get('[data-testid="user-details-modal"]').should('be.visible');
    cy.get('[data-testid="user-email"]').should('be.visible');
    cy.get('[data-testid="user-registration-date"]').should('be.visible');
  });

  it('should handle content moderation', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    
    // 2. Go to content moderation tab
    cy.get('[data-testid="content-moderation-tab"]').click();
    
    // 3. Should display flagged content
    cy.get('[data-testid="flagged-content-list"]').should('be.visible');
    
    // 4. Should be able to approve content
    cy.get('[data-testid="flagged-item"]').first().within(() => {
      cy.get('[data-testid="approve-content-button"]').click();
    });
    
    cy.get('[data-testid="success-message"]').should('contain', 'Content approved');
    
    // 5. Should be able to reject content
    cy.get('[data-testid="flagged-item"]').first().within(() => {
      cy.get('[data-testid="reject-content-button"]').click();
    });
    
    cy.get('[data-testid="success-message"]').should('contain', 'Content rejected');
  });

  it('should prevent non-admin access to admin panel', () => {
    // Logout and login as regular user
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    cy.login('user@example.com', 'userpassword');
    
    // Try to access admin panel
    cy.visit('/admin');
    
    // Should be redirected or show access denied
    cy.url().should('not.include', '/admin');
    cy.get('[data-testid="access-denied-message"]').should('be.visible');
  });

  it('should validate curriculum form inputs', () => {
    // 1. Navigate to admin panel
    cy.visit('/admin');
    cy.get('[data-testid="curriculum-management-tab"]').click();
    cy.get('[data-testid="create-curriculum-button"]').click();
    
    // 2. Try to submit empty form
    cy.get('[data-testid="save-curriculum-button"]').click();
    
    // 3. Should show validation errors
    cy.get('[data-testid="name-error"]').should('contain', 'Curriculum name is required');
    cy.get('[data-testid="publisher-error"]').should('contain', 'Publisher is required');
    
    // 4. Test invalid rating values
    cy.get('[data-testid="target-age-rating-input"]').type('6'); // Should be 1-5
    cy.get('[data-testid="save-curriculum-button"]').click();
    cy.get('[data-testid="rating-error"]').should('contain', 'Rating must be between 1 and 5');
  });
});