import type {
  SignupCreationRequest,
  SignupCreationResponse,
} from "../api/signup.api";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { getCanadianRegionOptions } from "../test-data/canadianRegions";
import {
  createFrenchSignUpUserData,
  createSignUpUserData,
} from "../test-data/dataGenerationCommon";
import { signupLanguages } from "../test-data/signupLanguages";
import { getLanguage, type Language } from "../support/language";

const formatCanadianPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");

  if (digits.length !== 10) {
    throw new Error("A Canadian phone number must contain exactly 10 digits.");
  }

  const areaCode = digits.slice(0, 3);
  const firstPart = digits.slice(3, 6);
  const lastPart = digits.slice(6, 10);

  return `(${areaCode}) ${firstPart}-${lastPart}`;
};

const toCanadianE164PhoneNumber = (phone: string): string => `+1${phone}`;

const getApplicationOrigin = (): string => {
  const baseUrl = Cypress.config("baseUrl");
  if (typeof baseUrl !== "string") {
    throw new Error("Cypress baseUrl must be configured to verify login.");
  }

  return new URL(baseUrl).origin;
};

describe("Sign Up Positive Tests", () => {
  (["en", "fr"] as const satisfies readonly Language[]).forEach((language) => {
    const locale = signupLanguages[language];

    it(`shows all Canadian provinces and territories in ${locale.name} (${language})`, () => {
      const signupPage = new SignupPage(language);

      signupPage.visit();
      signupPage.documentLanguage().should("eq", language);
      signupPage
        .provinceSelect()
        .find("option")
        .should(($options) => {
          const options = Array.from($options, (option) => ({
            value: option.value,
            label: option.textContent?.trim() ?? "",
          }));

          expect(options).to.deep.equal([
            { value: "", label: locale.provinceLabel },
            ...getCanadianRegionOptions(language),
          ]);
        });
    });
  });

  const language = getLanguage();
  const locale = signupLanguages[language];
  it(
    `creates and authenticates an account in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const userData = createSignUpUserData();
      const signupPage = new SignupPage();

      cy.intercept("POST", "**/api/accounts").as("signupCreation");
      cy.intercept("POST", "**/co/authenticate").as("authenticate");

      signupPage.visit();
      signupPage.documentLanguage().should("eq", language);
      signupPage
        .firstNameLabel()
        .should("be.visible")
        .and("have.text", locale.firstNameLabel);
      signupPage
        .lastNameLabel()
        .should("be.visible")
        .and("have.text", locale.lastNameLabel);
      signupPage
        .submitButton()
        .should("be.visible")
        .and("have.text", locale.submit);
      signupPage.populateForm(userData);

      cy.location("pathname").should("eq", locale.path);
      signupPage.firstNameInput().should("have.value", userData.firstName);
      signupPage.lastNameInput().should("have.value", userData.lastName);
      signupPage.countryCodeSelect().should("have.value", userData.countryCode);
      signupPage
        .phoneInput()
        .should("have.value", formatCanadianPhoneNumber(userData.phone));
      signupPage.provinceSelect().should("have.value", userData.province);
      signupPage.emailInput().should("have.value", userData.email);
      signupPage.passwordInput().should("have.value", userData.password);
      signupPage
        .confirmPasswordInput()
        .should("have.value", userData.confirmPassword);
      signupPage.consentCheckbox().should("be.checked");

      signupPage.submitSignup();

      cy.wait<SignupCreationRequest, SignupCreationResponse>(
        "@signupCreation",
      ).then(({ request, response }) => {
        expect(response, "signup response").to.exist;

        if (!response) {
          throw new Error("Signup request completed without an HTTP response.");
        }

        expect(response.statusCode).to.equal(201);
        expect(request.body.firstName).to.equal(userData.firstName);
        expect(request.body.lastName).to.equal(userData.lastName);
        expect(request.body.email).to.equal(userData.email);
        expect(request.body.phone).to.equal(
          toCanadianE164PhoneNumber(userData.phone),
        );
        expect(request.body.region).to.equal(userData.province);
        expect(request.body.leadDistributeConsentAgreement).to.equal(
          userData.consent,
        );
        expect(response.body.account.firstName).to.equal(userData.firstName);
        expect(response.body.account.lastName).to.equal(userData.lastName);
        expect(response.body.account.email).to.equal(userData.email);
        expect(response.body.account.phone).to.equal(
          toCanadianE164PhoneNumber(userData.phone),
        );
        expect(response.body.account.region).to.equal(userData.province);
        expect(response.body.account.leadDistributeConsentAgreement).to.equal(
          userData.consent,
        );
      });

      cy.wait("@authenticate").then(({ response }) => {
        expect(response, "authentication response").to.exist;

        if (!response) {
          throw new Error(
            "Authentication request completed without an HTTP response.",
          );
        }

        expect(response.statusCode).to.equal(200);
      });

      cy.location("origin").should("eq", getApplicationOrigin());
      cy.location("pathname").should("eq", "/getaquote");
      cy.get("main").should("be.visible");
    },
  );

  it(
    "creates an account with French Faker data and an accented email in French (fr)/BUG if the email has accented email we get an error",
    { retries: 0 },
    () => {
      const userData = createFrenchSignUpUserData();
      const signupPage = new SignupPage("fr");

      expect(userData.email.split("@")[0]).to.match(/[àâäéèêëîïôöùûüÿçœæ]/i);
      cy.intercept("POST", "**/api/accounts").as("signupCreation");

      signupPage.visit();
      signupPage.documentLanguage().should("eq", "fr");
      signupPage.populateForm(userData);
      signupPage.submitSignup();

      cy.wait<SignupCreationRequest, SignupCreationResponse>(
        "@signupCreation",
      ).then(({ request, response }) => {
        expect(response, "signup response").to.exist;

        if (!response) {
          throw new Error("Signup request completed without an HTTP response.");
        }

        expect(response.statusCode).to.equal(201);
        expect(request.body.firstName).to.equal(userData.firstName);
        expect(request.body.lastName).to.equal(userData.lastName);
        expect(request.body.email).to.equal(userData.email);
        expect(response.body.account.email).to.equal(userData.email);
      });

      signupPage.visit();
      signupPage.openLogin();
      new LoginPage().loginWith(userData.email, userData.password);
      cy.location("origin").should("eq", getApplicationOrigin());
    },
  );
});
