import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  video: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: "e2e/screenshots",
  retries: { runMode: 2, openMode: 0 },
  reporter: "mochawesome",
  reporterOptions: {
    reportDir: "e2e/reports",
    reportFilename: "[status]-[datetime]-[name]",
    html: true,
    json: false,
  },
  e2e: {
    setupNodeEvents(_on, config) {
      const language: unknown = config.env["language"] ?? "en";
      if (language !== "en" && language !== "fr") {
        throw new Error(
          "Unsupported language. Use --env language=en or language=fr.",
        );
      }
      // Language is public test configuration, exposed for synchronous use in specs.
      config.expose = { ...config.expose, language };
      return config;
    },
    baseUrl: process.env["CYPRESS_BASE_URL"] || "https://app.qa.nesto.ca",
    specPattern: "e2e/**/*.cy.{js,ts}",
    supportFile: "e2e/support/e2e.ts",
    fixturesFolder: "e2e/fixtures",
    testIsolation: true,
  },
});
