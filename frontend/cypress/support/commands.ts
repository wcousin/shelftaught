/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/login',
    body: {
      email,
      password,
    },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.data.token);
  });
});

// Custom command for registration
Cypress.Commands.add('register', (userData) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/auth/register',
    body: userData,
  }).then((response) => {
    window.localStorage.setItem('token', response.body.data.token);
  });
});

// Custom command to seed test data
Cypress.Commands.add('seedDatabase', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/test/seed',
    failOnStatusCode: false,
  });
});

// Custom command to clean test data
Cypress.Commands.add('cleanDatabase', () => {
  cy.request({
    method: 'DELETE',
    url: 'http://localhost:3000/api/test/clean',
    failOnStatusCode: false,
  });
});