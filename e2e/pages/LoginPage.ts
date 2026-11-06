export class LoginPage {
  loginWith(email: string, password: string): Cypress.Chainable<unknown> {
    return cy.origin(
      "https://auth.qa.nesto.ca",
      { args: { email, password } },
      ({ email, password }) => {
        cy.get('input[name="email"]')
          .should("be.visible")
          .type(email, { log: false });
        cy.get('input[name="password"]')
          .should("be.visible")
          .type(password, { log: false });
        cy.get('button[name="submit"]').click();
      },
    );
  }
}
