import { BasePage } from "../pages/BasePage";
import { getLanguage } from "../support/language";

describe(`Framework Smoke Tests (${getLanguage()})`, () => {
  it("should load the application and display the main page", () => {
    const page = new BasePage("/");
    page.visit();
    page.documentLanguage().should("eq", getLanguage());
  });
});
