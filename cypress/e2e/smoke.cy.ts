/**
 * Minimal E2E smoke spec so Cypress finds at least one spec file.
 * Add real E2E tests here or under cypress/e2e/ as *.cy.ts
 */
describe("Smoke", () => {
  it("loads the app", () => {
    cy.visit("/");
    cy.contains("body", /.+/); // page has some content
  });
});
