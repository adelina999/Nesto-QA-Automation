import { defineConfig } from "cypress";

export default defineConfig({
  viewportWidth: 1280,
  viewportHeight: 800,
  video: false,
  screenshotOnRunFailure: true,
  screenshotsFolder: "e2e/screenshots",
  retries: { runMode: 2, openMode: 0 },
  reporter: "junit",
  reporterOptions: {
    mochaFile: "e2e/reports/results-[hash].xml",
    toConsole: true,
  },
  e2e: {
    baseUrl: process.env["CYPRESS_BASE_URL"] || "https://app.qa.nesto.ca",
    specPattern: "e2e/**/*.cy.{js,ts}",
    supportFile: "e2e/support/e2e.ts",
    fixturesFolder: "e2e/fixtures",
    testIsolation: true,
  },
});
