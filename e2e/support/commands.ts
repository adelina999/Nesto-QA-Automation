// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
export {};
//
declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      getByTestId<E extends Node = HTMLElement>(
        testId: string,
        args?: object,
      ): Chainable<JQuery<E>>;
      logout(): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
      typeInInput(
        testId: string,
        value: string,
        clearExistingValue?: boolean,
      ): Chainable<JQuery<HTMLElement>>;
    }
  }
}

Cypress.Commands.add("getByTestId", (testId, ...args) => {
  return cy.get(`[data-testid="${testId}"]`, ...args);
});

Cypress.Commands.add("logout", () => {
  // TODO: Implement logout functionality
});

Cypress.Commands.add("login", (email, password) => {
  // TODO: Implement login functionality
});

Cypress.Commands.add(
  "typeInInput",
  (testId, value, clearExistingValue = true) => {
    const input = cy.getByTestId(testId);
    const preparedInput = clearExistingValue ? input.clear() : input;

    return preparedInput.type(value);
  },
);