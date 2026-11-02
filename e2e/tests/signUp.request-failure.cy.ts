import type { SignupCreationResponse } from "../api/signup.api";
import { SignupPage } from "../pages/SignupPage";
import { createSignUpUserData } from "../test-data/dataGenerationCommon";
import { signupLanguages } from "../test-data/signupLanguages";
import type { Language } from "../support/language";

type SimulatedFailure =
  | {
      name: string;
      kind: "http";
      statusCode: 400 | 503;
    }
  | {
      name: string;
      kind: "network";
    };

const failures: readonly SimulatedFailure[] = [
  { name: "HTTP 400", kind: "http", statusCode: 400 },
  { name: "HTTP 503", kind: "http", statusCode: 503 },
  { name: "network error", kind: "network" },
];

const successfulResponse = (
  userData: ReturnType<typeof createSignUpUserData>,
): SignupCreationResponse => ({
  account: {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phone: userData.phone,
    region: userData.province,
    leadDistributeConsentAgreement: userData.consent === true,
  },
});

describe("Sign Up Request Failure Recovery", () => {
  (["en", "fr"] as const satisfies readonly Language[]).forEach((language) => {
    const locale = signupLanguages[language];

    failures.forEach((failure) => {
      it(
        `shows an error and allows retry after ${failure.name} in ${locale.name} (${language})`,
        { retries: 0 },
        () => {
          const userData = createSignUpUserData();
          let requestCount = 0;

          cy.intercept("POST", "**/co/authenticate", (request) => {
            request.destroy();
          });

          cy.intercept("POST", "**/api/accounts", (request) => {
            requestCount += 1;

            if (requestCount === 1 && failure.kind === "network") {
              request.destroy();
              return;
            }

            if (requestCount === 1 && failure.kind === "http") {
              request.reply({
                statusCode: failure.statusCode,
                body: { error: "Simulated signup request failure" },
                delay: 250,
              });
              return;
            }

            request.reply({
              statusCode: 201,
              body: successfulResponse(userData),
            });
          }).as("signupCreation");

          const signupPage = new SignupPage(language);
          signupPage.visit();
          signupPage.documentLanguage().should("eq", language);
          signupPage.populateForm(userData);
          signupPage.submitSignup();

          cy.wait("@signupCreation");
          signupPage
            .requestErrorAlert()
            .should("be.visible")
            .and(($alert) => expect($alert.text()).to.match(/\S/));
          signupPage.submitButton().should("not.be.disabled");

          signupPage.submitSignup();
          cy.wait("@signupCreation");
          cy.get("@signupCreation.all").should("have.length", 2);
        },
      );
    });
  });
});
