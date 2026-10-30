import { BasePage } from "./BasePage";

export interface SignupUser {
  firstName: string;
  lastName: string;
  countryCode?: string;
  province: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent?: boolean;
}

export class SignupPage extends BasePage {
  constructor() {
    super("/signup");
  }

  private readonly selectors = {
    firstName: "first-name-input",
    firstNameLabel: '[data-testid="first-name-input-placeholder"]',
    lastName: "last-name-input",
    lastNameLabel: '[data-testid="last-name-input-placeholder"]',
    countryCode: 'select[name="phoneCountry"]',
    phone: "phoneInput",
    phoneLabel: '[data-testid="input-placeholder"]',
    province: "region-select",
    provinceLabel: '[data-testid="select-placeholder"]',
    email: "email-input",
    emailLabel: '[data-testid="email-input-placeholder"]',
    password: "password-input",
    passwordLabel: '[data-testid="password-input-placeholder"]',
    confirmPassword: "passwordConfirmation-input",
    confirmPasswordLabel:
      '[data-testid="passwordConfirmation-input-placeholder"]',
    infoPasswordText: '[data-testid="typography"]',
    consent: "agreement-checkbox",
    consentMessage: "",
    createAccountButton: "submit-button",
    loginLink: '[data-testid="login-link"]',
  } as const;

  populateForm(data: SignupUser): Cypress.Chainable<JQuery<HTMLElement>> {
    cy.getByTestId(this.selectors.province).select(data.province);

    if (data.firstName) {
      cy.typeInInput(this.selectors.firstName, data.firstName);
    }

    if (data.lastName) {
      cy.typeInInput(this.selectors.lastName, data.lastName);
    }

    if (data.phone) {
      cy.typeInInput(this.selectors.phone, data.phone);
    }

    if (data.countryCode) {
      cy.get(this.selectors.countryCode).select(data.countryCode);
    }

    if (data.email) {
      cy.typeInInput(this.selectors.email, data.email);
    }

    if (data.password) {
      cy.typeInInput(this.selectors.password, data.password);
    }

    if (data.confirmPassword) {
      cy.typeInInput(this.selectors.confirmPassword, data.confirmPassword);
    }

    if (data.consent === true) {
      return cy.getByTestId(this.selectors.consent).check();
    }

    if (data.consent === false) {
      return cy.getByTestId(this.selectors.consent).uncheck();
    }

    return cy.getByTestId(this.selectors.consent);
  }

  submitSignup(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.getByTestId(this.selectors.createAccountButton).click();
  }

  firstNameInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.firstName);
  }

  lastNameInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.lastName);
  }

  countryCodeSelect(): Cypress.Chainable<JQuery<HTMLSelectElement>> {
    return cy.get<HTMLSelectElement>(this.selectors.countryCode);
  }

  phoneInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.phone);
  }

  provinceSelect(): Cypress.Chainable<JQuery<HTMLSelectElement>> {
    return cy.getByTestId<HTMLSelectElement>(this.selectors.province);
  }

  emailInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.email);
  }

  passwordInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.password);
  }

  confirmPasswordInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.confirmPassword);
  }

  consentCheckbox(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.getByTestId<HTMLInputElement>(this.selectors.consent);
  }
}
