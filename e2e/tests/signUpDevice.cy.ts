import type {
  SignupCreationRequest,
  SignupCreationResponse,
} from "../api/signup.api";
import { SignupPage } from "../pages/SignupPage";
import { createSignUpUserData } from "../test-data/dataGenerationCommon";
import { getLanguage } from "../support/language";

const deviceNames = [
  "iphone-se2",
  "iphone-6",
  "ipad-mini",
] as const satisfies readonly Cypress.ViewportPreset[];

describe("Sign Up on Devices", () => {
  const language = getLanguage();

  deviceNames.forEach((deviceName) => {
    it(
      `creates an account on ${deviceName} (${language})`,
      { retries: 0 },
      () => {
        cy.viewport(deviceName);

        const userData = createSignUpUserData();
        const signupPage = new SignupPage(language);

        cy.intercept("POST", "**/api/accounts").as("signupCreation");

        signupPage.visit();
        signupPage.documentLanguage().should("eq", language);
        signupPage.firstNameInput().should("be.visible");
        signupPage.lastNameInput().should("be.visible");
        signupPage.emailInput().should("be.visible");
        signupPage.passwordInput().should("be.visible");
        signupPage.submitButton().should("be.visible");
        signupPage.populateForm(userData);
        signupPage.submitSignup();

        cy.wait<SignupCreationRequest, SignupCreationResponse>(
          "@signupCreation",
        ).then(({ response }) => {
          expect(response, "signup response").to.exist;

          if (!response) {
            throw new Error(
              "Signup request completed without an HTTP response.",
            );
          }

          expect(response.statusCode).to.equal(201);
          expect(response.body.account.email).to.equal(userData.email);
        });
      },
    );
  });
});