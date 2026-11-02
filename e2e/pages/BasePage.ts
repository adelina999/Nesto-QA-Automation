import { getLanguage, localizedPath, type Language } from "../support/language";

export class BasePage {
  constructor(
    protected readonly path: string,
    protected readonly language: Language = getLanguage(),
  ) {}

  visit() {
    return cy.visit(localizedPath(this.path, this.language));
  }

  documentLanguage(): Cypress.Chainable<string | undefined> {
    return cy.get("html").invoke("attr", "lang");
  }
}
