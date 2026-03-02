module.exports = {
  projectId: "3b2dui",

  // Disable Cypress.env() in browser (migration to cy.env() / Cypress.expose())
  allowCypressEnv: false,

  e2e: {
    // Back (server.ts default port)
    baseUrl: "http://localhost:4500",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
  },
};
