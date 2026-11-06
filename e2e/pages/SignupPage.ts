import { BasePage } from "./BasePage";
import { getLanguage, type Language } from "../support/language";

export interface SignupUser {
  firstName: string;
  lastName: string;
  // Optional initial selection; the app may update it from the phone area code.
  countryCode?: string;
  province: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent?: boolean;
}

export class SignupPage extends BasePage {
  constructor(language: Language = getLanguage()) {
    super("/signup", language);
  }

  private readonly selectors = {
    nestoLogo: 'img[alt="nesto"]',
    accountHeading: "h2",
    headerLoginButton: "header-login-button",
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
    validationMessages: {
      firstName: '[data-testid="first-name-error-message-typography"] > span',
      lastName: '[data-testid="last-name-error-message-typography"] > span',
      phone: '[data-testid="phone-error-message-typography"] > span',
      email: '[data-testid="email-error-message-typography"] > span',
      password: '[data-testid="password-error-message-typography"] > span',
      confirmPassword:
        '[data-testid="passwordConfirmation-error-message-typography"] > span',
    },
  } as const;

  // Omitted fields stay untouched; "" clears inputs or selects an empty option.
  populateForm(
    data: Partial<SignupUser>,
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    if (data.countryCode !== undefined) {
      cy.get(this.selectors.countryCode).select(data.countryCode);
    }

    // Phone entry may update the initial country selection from its area code.
    if (data.phone !== undefined) {
      cy.typeInInput(this.selectors.phone, data.phone);
    }

    if (data.firstName !== undefined) {
      cy.typeInInput(this.selectors.firstName, data.firstName);
    }

    if (data.lastName !== undefined) {
      cy.typeInInput(this.selectors.lastName, data.lastName);
    }

    if (data.email !== undefined) {
      cy.typeInInput(this.selectors.email, data.email);
    }

    if (data.password !== undefined) {
      cy.typeInInput(this.selectors.password, data.password);
    }

    if (data.confirmPassword !== undefined) {
      cy.typeInInput(this.selectors.confirmPassword, data.confirmPassword);
    }

    // Set the region after phone and the other form updates so those
    // updates cannot reset the selection before submission.
    if (data.province !== undefined) {
      cy.getByTestId(this.selectors.province).select(data.province);
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
    return this.submitButton().click();
  }

  submitButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.getByTestId(this.selectors.createAccountButton);
  }

  nestoLogo(): Cypress.Chainable<JQuery<HTMLImageElement>> {
    return cy.get<HTMLImageElement>(this.selectors.nestoLogo);
  }

  accountHeading(): Cypress.Chainable<JQuery<HTMLHeadingElement>> {
    return cy.get<HTMLHeadingElement>(this.selectors.accountHeading);
  }

  headerLoginButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.getByTestId(this.selectors.headerLoginButton);
  }

  openLogin(): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.headerLoginButton().click();
  }

  firstNameLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.firstNameLabel);
  }

  lastNameLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.lastNameLabel);
  }

  phoneLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.phoneLabel);
  }

  provinceLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.provinceLabel);
  }

  emailLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.emailLabel);
  }

  passwordLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.passwordLabel);
  }

  confirmPasswordLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.confirmPasswordLabel);
  }

  consentLabel(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('label[for="leadDistributeConsentAgreement"]');
  }

  validationMessage(
    field: keyof SignupPage["selectors"]["validationMessages"],
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.selectors.validationMessages[field]);
  }

  requestErrorAlert(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('[role="alert"]');
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
