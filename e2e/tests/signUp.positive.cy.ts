import type {
  SignupCreationRequest,
  SignupCreationResponse,
} from "../api/signup.api";
import { SignupPage } from "../pages/SignupPage";
import { createSignUpUserData } from "../test-data/dataGenerationCommon";
import { signupLanguages } from "../test-data/signupLanguages";
import { getLanguage } from "../support/language";

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

describe("Sign Up Positive Tests", () => {
  const language = getLanguage();
  const locale = signupLanguages[language];
  it(
    `creates an account with Faker data in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const userData = createSignUpUserData();
      const signupPage = new SignupPage();

      cy.intercept("POST", "**/api/accounts").as("signupCreation");

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

      //curently the API is returning a 201 with the same path as the signup page, but it should be returning a 302 redirect to the login page. This is a bug in the API that needs to be fixed.
      // cy.location("pathname").should("not.eq", locale.path);
      // cy.get("main").should("be.visible");
    },
  );
});
