describe("Framework Smoke Tests", () => {
  it("should load the application and display the main page", () => {
    cy.visit("/");
  });
});
