describe('User Journey - Browse and Search Curricula', () => {
  beforeEach(() => {
    cy.seedDatabase();
    cy.visit('/');
  });

  afterEach(() => {
    cy.cleanDatabase();
  });

  it('should complete the full curriculum discovery journey', () => {
    // 1. User visits homepage
    cy.get('[data-testid="hero-heading"]').should('contain', 'Find the Perfect Homeschool Curriculum');
    
    // 2. User searches for curricula
    cy.get('[data-testid="search-input"]').type('math');
    cy.get('[data-testid="search-button"]').click();
    
    // 3. User should be on search results page
    cy.url().should('include', '/search');
    cy.get('[data-testid="search-results"]').should('be.visible');
    cy.get('[data-testid="curriculum-card"]').should('have.length.at.least', 1);
    
    // 4. User filters by grade level
    cy.get('[data-testid="filter-elementary"]').click();
    cy.get('[data-testid="curriculum-card"]').should('be.visible');
    
    // 5. User clicks on a curriculum to view details
    cy.get('[data-testid="curriculum-card"]').first().click();
    
    // 6. User should be on curriculum detail page
    cy.url().should('include', '/curriculum/');
    cy.get('[data-testid="curriculum-name"]').should('be.visible');
    cy.get('[data-testid="rating-display"]').should('be.visible');
    cy.get('[data-testid="curriculum-description"]').should('be.visible');
    
    // 7. User views all rating categories
    cy.get('[data-testid="target-age-rating"]').should('be.visible');
    cy.get('[data-testid="teaching-approach-rating"]').should('be.visible');
    cy.get('[data-testid="subjects-covered-rating"]').should('be.visible');
    cy.get('[data-testid="cost-rating"]').should('be.visible');
    
    // 8. User goes back to browse more curricula
    cy.get('[data-testid="browse-more-button"]').click();
    cy.url().should('include', '/browse');
    
    // 9. User browses by subject
    cy.get('[data-testid="subject-math"]').click();
    cy.get('[data-testid="curriculum-card"]').should('have.length.at.least', 1);
  });

  it('should handle search with no results gracefully', () => {
    cy.visit('/');
    
    // Search for something that doesn't exist
    cy.get('[data-testid="search-input"]').type('nonexistentcurriculum');
    cy.get('[data-testid="search-button"]').click();
    
    cy.url().should('include', '/search');
    cy.get('[data-testid="no-results-message"]').should('be.visible');
    cy.get('[data-testid="no-results-message"]').should('contain', 'No curricula found');
  });

  it('should show curriculum comparison functionality', () => {
    cy.visit('/browse');
    
    // Select multiple curricula for comparison
    cy.get('[data-testid="curriculum-card"]').first().find('[data-testid="compare-checkbox"]').click();
    cy.get('[data-testid="curriculum-card"]').eq(1).find('[data-testid="compare-checkbox"]').click();
    
    // Navigate to comparison page
    cy.get('[data-testid="compare-button"]').click();
    cy.url().should('include', '/compare');
    
    // Verify comparison table is displayed
    cy.get('[data-testid="comparison-table"]').should('be.visible');
    cy.get('[data-testid="curriculum-comparison-row"]').should('have.length', 2);
  });
});