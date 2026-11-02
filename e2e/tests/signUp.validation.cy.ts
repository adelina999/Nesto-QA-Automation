import { SignupPage } from "../pages/SignupPage";
import { signupLanguages } from "../test-data/signupLanguages";

describe("Sign Up Validation Tests", () => {
  (["en", "fr"] as const).forEach((language) => {
    const locale = signupLanguages[language];

    it(`shows visible labels and validation messages in ${locale.name} (${language})`, () => {
      const signupPage = new SignupPage(language);

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
    });
  });
});
