# Nesto QA Automation

Cypress and TypeScript tests for Nesto signup flows, including English and
French UI coverage and API tests.

## Requirements

- Node.js and npm versions supported by Cypress 16
- Internet access to the QA application (`https://app.qa.nesto.ca` by default)
- Chrome is optional; install it to use the Chrome runner

The project dependencies are installed through npm: Cypress, Mochawesome,
`mochawesome-merge`, `mochawesome-report-generator`, TypeScript,
`@faker-js/faker`, and `@types/node`.

## Install

```powershell
npm ci

```

## Run tests

```powershell
npm run cy:run:spec -- --spec "e2e/tests/signUp.negative.cy.ts"
npm run cy:run
npm run cy:run:headed
npm run cy:run:headed:spec -- --spec "e2e/tests/signUp.negative.cy.ts"
npm run cy:open

```

Generate a merged Mochawesome report for a headless run only when requested:

```powershell
npm run cy:run:report -- --spec "e2e/tests/signUp.negative.cy.ts"
```

Regular `cy:run`, `cy:run:spec`, `cy:run:headed`, and `npm test` commands invoke
Cypress directly and do not generate Mochawesome reports.

Choose a browser for a run or the interactive Cypress app:

```powershell
npm run cy:run:browser -- --browser chrome
npm run cy:run:headed:spec -- --browser chrome --spec "e2e/tests/smoke.cy.ts"
npm run cy:open:browser -- --browser chrome
```

The `cy:run:spec` and `cy:run:headed:spec` scripts accept Cypress CLI options
after `--`; use `--spec` to select one spec file. The browser scripts accept
Cypress browser names such as `chrome` or `edge`. `npm test` remains an alias
for running all specs headlessly.

The negative signup spec runs its validation cases in both English and French
in one run. For specs that use the selected language, choose English (default)
or French with `--env language=en` or `--env language=fr`:

```powershell
npm run cy:run -- --env language=fr --spec "e2e/tests/signUp.negative.cy.ts"
```

## Configuration and project layout

Override the default application URL by setting `CYPRESS_BASE_URL` in the
shell before running Cypress. For example:

```powershell
$env:CYPRESS_BASE_URL = "https://your-qa-environment.example"
npm run cy:run
```

The GitHub Actions QA workflow is integrated and runs on demand. It uses the
`QA` environment, passes its `CYPRESS_BASE_URL` variable to Cypress, and runs
the TypeScript check before the Cypress suite. Cypress test failures do not
stop the workflow from finishing. At this time, the workflow does not attach or
publish test reports as run artifacts.

The project does not automatically load `.env` files. Do not commit credentials
or other secrets.

```text
e2e/
  api/             Signup API helper and request/response types
  pages/           Base and signup page objects
  support/         Cypress setup, commands, and language configuration
  test-data/       Signup inputs, generated data, Canadian regions, and locales
  tests/
    api/           Signup endpoint specs
    *.cy.ts        Signup UI, smoke, and request-recovery specs
  reports/         Generated Mochawesome JSON and merged HTML reports (git-ignored)
  screenshots/     Screenshots from failed Cypress tests (git-ignored)
```

## Test coverage

The Cypress suite currently covers:

- **Signup UI, English and French:** required and malformed inputs, password
  confirmation and length, duplicate email and long phone validation, localized
  labels and messages, and the Canadian province/territory list.
- **Successful signup:** submits generated user data and checks the request and
  created account response.
- **Request recovery, English and French:** verifies the error and retry path
  after simulated HTTP 400, HTTP 503, and network failures.
- **Signup API:** valid account creation, name trimming, and invalid or missing
  email, phone, province, and consent inputs.
- **Smoke test:** confirms the application loads using the selected language.

Run all specs locally with `npm test`, or select a UI language with
`--env language=en` or `--env language=fr` as shown above. The negative signup
and request-recovery specs generate cases for both languages in the same run;
the other locale-sensitive specs use the selected language. Some negative
scenarios are intended to expose known application/API validation issues and
may fail against the current QA environment.

Cypress writes a JSON report per spec during headless runs, then merges those
reports into one HTML report for that run. Each report is saved in its own
timestamped folder under `e2e/reports/`. Headed runs use Cypress's spec reporter
and do not generate Mochawesome reports. Failure screenshots are saved to
`e2e/screenshots/`. These output folders are ignored by Git; if they are hidden
in VS Code, disable **Explorer: Exclude Git Ignore** or list reports in
PowerShell:

```powershell
Get-ChildItem e2e\reports\*\report.html
```
