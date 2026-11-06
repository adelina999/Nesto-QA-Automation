import { SignupPage, type SignupUser } from "../pages/SignupPage";
import { createSignUpUserData } from "../test-data/dataGenerationCommon";
import { signupLanguages } from "../test-data/signupLanguages";
import type { Language } from "../support/language";

interface SignupScenarioFixture extends Partial<SignupUser> {
  name: string;
  country?: string;
}

interface MissingFieldCase {
  name: string;
  field:
    | "firstName"
    | "lastName"
    | "phone"
    | "email"
    | "password"
    | "confirmPassword";
  overrides: Partial<SignupUser>;
  error:
    | "required"
    | "invalidPhone"
    | "invalidEmail"
    | "invalidMaxPassword"
    | "invalidMinPassword"
    | "passwordMismatch"
    | "duplicateEmail"
    | "";
}

const missingFieldCases: readonly MissingFieldCase[] = [
  {
    name: "first name",
    field: "firstName",
    overrides: { firstName: "" },
    error: "required",
  },
  {
    name: "last name",
    field: "lastName",
    overrides: { lastName: "" },
    error: "required",
  },
  {
    name: "phone number",
    field: "phone",
    overrides: { phone: "" },
    error: "invalidPhone",
  },
  {
    name: "email",
    field: "email",
    overrides: { email: "" },
    error: "invalidEmail",
  },
  {
    name: "password",
    field: "password",
    overrides: { password: "" },
    error: "invalidMinPassword",
  },
];

const malformedEmails = [
  { name: "missing the domain", email: "missing-domain@" },
  { name: "missing the local part", email: "@missing-local.com" },
  { name: "missing a top-level domain", email: "missing-tld@example" },
] as const;

const invalidNameCases = [
  {
    name: "first name",
    field: "firstName",
    overrides: { firstName: "Jane123" },
  },
  {
    name: "last name",
    field: "lastName",
    overrides: { lastName: "Smith123" },
  },
] as const;

const visitSignupWithCreationGuard = (language: Language): SignupPage => {
  cy.intercept("POST", "**/api/accounts", (request) => {
    request.destroy();
  }).as("signupCreation");

  const signupPage = new SignupPage(language);
  signupPage.visit();
  signupPage.documentLanguage().should("eq", language);
  return signupPage;
};

const assertSubmissionWasBlocked = (language: Language): void => {
  cy.location("pathname").should("eq", signupLanguages[language].path);
  cy.get("@signupCreation.all").should("have.length", 0);
};

const assertValidationError = (
  signupPage: SignupPage,
  field: MissingFieldCase["field"],
  error: MissingFieldCase["error"],
  language: Language,
): void => {
  signupPage
    .validationMessage(field)
    .should("be.visible")
    .and("have.text", signupLanguages[language].validation[error]);
};

const defineNegativeTestsForLanguage = (language: Language): void => {
  const locale = signupLanguages[language];

  missingFieldCases.forEach(({ name, field, overrides, error }) => {
    it(
      `blocks submission when ${name} is missing in ${locale.name} (${language})`,
      { retries: 0 },
      () => {
        const signupPage = visitSignupWithCreationGuard(language);

        signupPage.populateForm(createSignUpUserData(overrides));
        signupPage.submitSignup();

        assertValidationError(signupPage, field, error, language);
        assertSubmissionWasBlocked(language);
      },
    );
  });

  invalidNameCases.forEach(({ name, field, overrides }) => {
    it(
      `rejects digits in the ${name} in ${locale.name} (${language})`,
      { retries: 0 },
      () => {
        const signupPage = visitSignupWithCreationGuard(language);

        signupPage.populateForm(createSignUpUserData(overrides));
        signupPage.submitSignup();

        signupPage
          .validationMessage(field)
          .should("be.visible")
          .should(($message) => {
            expect(
              $message.text().trim(),
              `${name} validation message`,
            ).not.to.equal("");
          });
        assertSubmissionWasBlocked(language);
      },
    );
  });

  it(
    `shows errors for all empty fields and blocks submission in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);

      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(
            ({ name }) => name === "requiredFields",
          );
          if (!scenario) {
            throw new Error("Missing requiredFields signup scenario.");
          }

          const {
            name: _name,
            country: _country,
            province: _province,
            ...overrides
          } = scenario;
          signupPage.populateForm(overrides);
        },
      );

      signupPage.submitSignup();
      assertValidationError(signupPage, "firstName", "required", language);
      assertValidationError(signupPage, "lastName", "required", language);
      assertValidationError(signupPage, "phone", "invalidPhone", language);
      assertValidationError(signupPage, "email", "invalidEmail", language);
      assertValidationError(
        signupPage,
        "password",
        "invalidMinPassword",
        language,
      );
      assertSubmissionWasBlocked(language);
    },
  );

  malformedEmails.forEach(({ name, email }) => {
    it(
      `rejects an email ${name} in ${locale.name} (${language})`,
      { retries: 0 },
      () => {
        const signupPage = visitSignupWithCreationGuard(language);

        signupPage.populateForm(createSignUpUserData({ email }));
        signupPage.submitSignup();

        assertValidationError(signupPage, "email", "invalidEmail", language);
        assertSubmissionWasBlocked(language);
      },
    );
  });

  it(
    `shows a confirmation error when passwords differ and blocks submission in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);
      const userData = createSignUpUserData();

      signupPage.populateForm({
        ...userData,
        confirmPassword: `${userData.password}Mismatch1`,
      });
      signupPage.submitSignup();

      signupPage
        .validationMessage("confirmPassword")
        .should("be.visible")
        .and("have.text", locale.validation.passwordMismatch);
      assertSubmissionWasBlocked(language);
    },
  );

  it(
    `rejects the invalidEmail fixture and blocks submission in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);

      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(
            ({ name }) => name === "invalidEmail",
          );
          if (!scenario || typeof scenario.email !== "string") {
            throw new Error("Missing invalidEmail signup scenario.");
          }

          signupPage.populateForm(
            createSignUpUserData({ email: scenario.email }),
          );
        },
      );

      signupPage.submitSignup();
      assertValidationError(signupPage, "email", "invalidEmail", language);
      assertSubmissionWasBlocked(language);
    },
  );

  it(
    `password and confirmed password are differ and the right error displayed in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);
      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(
            ({ name }) => name === "passwordMismatch",
          );
          if (
            !scenario ||
            typeof scenario.password !== "string" ||
            typeof scenario.confirmPassword !== "string"
          ) {
            throw new Error("Missing passwordMismatch signup scenario.");
          }
          signupPage.populateForm(scenario);
        },
      );
      signupPage.submitSignup();
      assertValidationError(
        signupPage,
        "confirmPassword",
        "passwordMismatch",
        language,
      );
      assertSubmissionWasBlocked(language);
    },
  );

  it(
    `Password over 32 characters display the right error in ${locale.name} (${language})`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);
      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(
            ({ name }) => name === "longPassword",
          );
          if (
            !scenario ||
            typeof scenario.password !== "string" ||
            typeof scenario.confirmPassword !== "string"
          ) {
            throw new Error("Missing longPassword signup scenario.");
          }
          signupPage.populateForm(scenario);
        },
      );
      signupPage.submitSignup();
      assertValidationError(
        signupPage,
        "password",
        "invalidMaxPassword",
        language,
      );
      assertSubmissionWasBlocked(language);
    },
  );

  it(
    `use existing email for signup should display the right error in ${locale.name} (${language})/*BUG Currently this test is failing as the ui doesn't display the error and only api return general error`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);
      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(
            ({ name }) => name === "duplicateEmail",
          );
          if (
            !scenario ||
            typeof scenario.password !== "string" ||
            typeof scenario.confirmPassword !== "string"
          ) {
            throw new Error("Missing longPassword signup scenario.");
          }
          signupPage.populateForm(scenario);
        },
      );
      signupPage.submitSignup();
      assertValidationError(signupPage, "email", "duplicateEmail", language);
      assertSubmissionWasBlocked(language);
    },
  );

  it(
    `use phone number longer than 10 digits for signup should display the right error in ${locale.name} (${language})/BUG Currently we are able to create an account with wrong phone number and account is created`,
    { retries: 0 },
    () => {
      const signupPage = visitSignupWithCreationGuard(language);
      cy.readFile<SignupScenarioFixture[]>("e2e/test-data/signUp.json").then(
        (scenarios) => {
          const scenario = scenarios.find(({ name }) => name === "longPhone");
          if (
            !scenario ||
            typeof scenario.password !== "string" ||
            typeof scenario.confirmPassword !== "string"
          ) {
            throw new Error("Missing longPhone signup scenario.");
          }
          signupPage.populateForm(scenario);
        },
      );
      signupPage.submitSignup();
      assertValidationError(signupPage, "phone", "invalidPhone", language);
      assertSubmissionWasBlocked(language);
    },
  );
};

describe("Sign Up Negative Tests", () => {
  (["en", "fr"] as const satisfies readonly Language[]).forEach(
    defineNegativeTestsForLanguage,
  );
});

describe("Sign Up Validation Tests", () => {
  (["en", "fr"] as const satisfies readonly Language[]).forEach((language) => {
    const locale = signupLanguages[language];

    it(`shows visible labels and validation messages in ${locale.name} (${language})`, () => {
      const signupPage = visitSignupWithCreationGuard(language);

      signupPage.documentLanguage().should("eq", language);

      signupPage
        .nestoLogo()
        .should("be.visible")
        .and("have.attr", "alt", "nesto");
      signupPage
        .accountHeading()
        .should("be.visible")
        .and("have.text", locale.accountHeading);
      signupPage
        .headerLoginButton()
        .should("be.visible")
        .and("have.text", locale.loginButton);

      signupPage
        .firstNameLabel()
        .should("be.visible")
        .and("have.text", locale.firstNameLabel);
      signupPage
        .lastNameLabel()
        .should("be.visible")
        .and("have.text", locale.lastNameLabel);
      signupPage
        .phoneLabel()
        .should("be.visible")
        .and("have.text", locale.phoneLabel);
      signupPage
        .provinceLabel()
        .should("be.visible")
        .and("have.text", locale.provinceLabel);
      signupPage
        .emailLabel()
        .should("be.visible")
        .and("have.text", locale.emailLabel);
      signupPage
        .passwordLabel()
        .should("be.visible")
        .and("have.text", locale.passwordLabel);
      signupPage
        .confirmPasswordLabel()
        .should("be.visible")
        .and("have.text", locale.confirmPasswordLabel);
      signupPage.consentLabel().should("be.visible").and("not.be.empty");
      signupPage
        .submitButton()
        .should("be.visible")
        .and("have.text", locale.submit);

      signupPage.submitSignup();

      signupPage
        .validationMessage("firstName")
        .should("be.visible")
        .and("have.text", locale.validation.required);
      signupPage
        .validationMessage("lastName")
        .should("be.visible")
        .and("have.text", locale.validation.required);
      signupPage
        .validationMessage("phone")
        .should("be.visible")
        .and("have.text", locale.validation.invalidPhone);
      signupPage
        .validationMessage("email")
        .should("be.visible")
        .and("have.text", locale.validation.invalidEmail);
      signupPage
        .validationMessage("password")
        .should("be.visible")
        .and("have.text", locale.validation.invalidMinPassword);
      assertSubmissionWasBlocked(language);
    });
  });
});
