# My assumptions and open decisions

These are my assumptions about the current automation and signup behavior. I
reproduced the reported behavior and documented it in [BUGS.md](BUGS.md). I
consider it a suspected bug, but I need the product/API requirements to confirm
the expected result and define acceptance criteria.

| ID | My assumption or current convention | Why I assume this / what I don't know | What I need confirmed |
| --- | --- | --- | --- |
| A-01 | I assume the default target is QA at `https://app.qa.nesto.ca` and `.env` is not loaded | `cypress.config.ts` reads `CYPRESS_BASE_URL` directly | I need the environment owner to confirm permitted runs and account/data retention |
| A-02 | I assume English is the default and French signup uses `/fr/signup` | `language.ts` and locale expectations; selected specs use the CLI locale while others cover both | I need product to confirm supported locales, switching and persistence |
| A-03 | I assume duplicate-email failures should be shown clearly next to the email field, in the selected locale | For duplicate email, the backend returns an error, but the UI shows a generic toast instead of a clear inline email error; the response shown was `bad format` / `error creating account` | I need product/localization to confirm the expected duplicate-email message and whether it should appear inline in English and French |
| A-04 | I assume the province list should contain all 13 Canadian provinces/territories in the current order | `canadianRegions.ts`; tests assert the full ordered list | I need product to confirm accepted regions, labels and whether ordering matters |
| A-05 | I assume passwords should be limited to 12–32 characters; I don't know the email length limit | The test data and validation tests use 12–32 character passwords; I reproduced password and email inputs accepting more than 32 characters | I need product/security to confirm password and email limits and UI/API enforcement |
| A-06 | I assume phone input should use a supported format and UI/API validation should be consistent; I don't yet know whether country code is separately required | Test data uses ten Canadian digits and the positive spec checks `+1`; I reproduced missing UI format validation, API acceptance of invalid numbers, and API account creation without country code | I need product/API to confirm supported countries/formats and whether country code is separate or part of an E.164 phone |
| A-07 | I assume the post-account-creation authentication and account redirect are one regression, separate from signup-form validation | Account creation succeeds, then `/co/authenticate` returns 400 and the user is no longer redirected to the account; the redirect worked previously. I don't know whether the 400 causes the redirect failure | I need the team to investigate the auth/redirect regression and restore the previously working behavior |
| A-08 | I assume email format and length need an agreed validation contract | I reproduced acceptance of an address containing `+` before `@` and an email longer than 32 characters; I don't know whether plus-addressing is supported | I need product/API to confirm the email length limit and supported syntax, including plus-addressing |
| A-09 | I assume API errors should be actionable and distinguish client errors from server failures | I reproduced the lack of distinct messages for 400 and 500 errors; current tests assert only selected invalid-input responses | I need product/API to confirm the error response schema and user-facing behavior for 4xx versus 5xx |
| A-10 | I assume missing province should return 400, and invalid email/phone/omitted consent should return 422 | Those are the current API test assertions; I don't have an external contract | I need the API owner to confirm status codes, schema and field requirements |
| A-11 | I assume omitted, null and false consent may have different meanings | The current builder defaults to true; the null-labelled test omits the property | I need product/legal/API to confirm whether consent is optional or required |
| A-14 | I assume generated identity data is safe for QA and unlikely to collide | Faker is unseeded; emails use `nesto.com`, and phone numbers are not reserved test numbers | I need the environment owner to confirm an owned mail sink, safe phone data and notification suppression |
| A-15 | I assume created accounts may remain after runs | No cleanup is implemented; support `afterEach` is a TODO | I need the environment/API owner to confirm cleanup, ownership and retention |
| A-16 | Future TODO, if I had more time: make the duplicate-email test independent of pre-existing QA data by creating an account, saving its generated email, then reusing it for the duplicate attempt | The current test uses a hard-coded email, which may stop working after a QA database wipe | I would add account setup through the approved API path and pass the created email into the duplicate test |
| A-17 | I assume the current browser and device coverage represent supported clients | The suite uses a 1280×800 viewport and Cypress presets for iPhone SE 2, iPhone 6, and iPad mini; I don't have a supported-device matrix | I need product/QA to confirm supported browsers, devices, and screen sizes |

## Future test coverage

The suite already has mobile signup coverage, API validation cases, and
end-to-end signup and request-recovery tests. If I had more time, I would:

- Confirm product/API rules, then add UI and API tests for boundary values and
  ensure both layers validate inputs consistently.
- Extend mobile coverage with validation and layout checks at the supported
  screen sizes and browsers.
- Add accessibility checks for keyboard navigation, focus, labels, and error
  messages.
- Add authentication tests if the team provides an approved test-token flow.
- Use safe, unique test data and clean up created accounts when supported.
- Configure CI to report failures clearly and retain test reports; track known
  bugs separately from new regressions.
