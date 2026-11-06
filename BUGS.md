# My bug findings

I reviewed the current application behavior and Cypress tests. The priorities
below are my suggestions, not an agreed release gate. I have reproduced the
application behaviors I describe; where I have not confirmed the product/API
requirement, I label the expected behavior as an assumption to confirm.

## Confirmed automation defects (source review)

### BUG-AUTO-001 — Duplicate-email test cannot verify the backend result

- Priority: P1. Status: future test TODO; confirmed by source inspection.
- Evidence: `e2e/tests/signUp.negative.cy.ts`,
  `visitSignupWithCreationGuard` and the existing-email test.
- Reproduction: follow the existing-email case: the helper destroys every account
  POST, the test expects a duplicate-email error, then requires zero POSTs.
- Actual: the test uses a hard-coded email, destroys the account POST, and
  expects zero submissions. It neither creates the duplicate account nor checks
  the backend's duplicate response, and depends on persistent QA data.
- Future improvement: create an account through the approved setup path, retain
  its generated email, and reuse it for the duplicate attempt. Assert the
  duplicate submission reaches the backend and inspect the real response.
- Impact: failures can be incorrectly attributed to the API; duplicate handling
  is not reliably covered.

### BUG-AUTO-002 — French duplicate-email expectation is empty

- Priority: P2. Status: open; confirmed by source inspection.
- Evidence: `e2e/test-data/signupLanguages.ts`, `fr.validation.duplicateEmail`;
  `assertValidationError` in `e2e/tests/signUp.negative.cy.ts`.
- Reproduce: inspect or run the duplicate-email case with `--env language=fr`.
- Actual: the locale fixture sets the duplicate-email inline message to an empty
  string, and the test asserts that empty value. In the reproduced duplicate
  case, an error is returned and shown as a generic toast, not as a clear inline
  email-field message. The assertion therefore does not verify the observed
  error or a useful French duplicate-email message.
- Expected: once the intended UX and translation are approved, assert the
  duplicate-email error at its intended location with the approved French copy.

### BUG-AUTO-003 — Null-consent API scenario sends an omitted property

- Priority: P2. Status: open; confirmed by source inspection.
- Evidence: final case in `e2e/tests/api/signUp.api.cy.ts`.
- Reproduce: compare its title with payload construction; it uses `delete` on
  `leadDistributeConsentAgreement` rather than setting it to `null`.
- Actual: the request tests an absent field; explicit null is never sent. The
  existing report observed HTTP 201 for the omitted-consent request.
- Expected: make the test title say consent is omitted. Add explicit-null or
  false cases only if the API contract requires those distinctions.

## Reproduced application behavior — expected contract to confirm

I reproduced the application behavior below. Existing Cypress reports provide
HTTP status evidence for the API cases noted. "Expected" describes my current
assumption or the test's current expectation, not an approved contract unless
I explicitly say otherwise.

### APP-001 / P1

- **Actual:** API account creation returned HTTP 201 when `region` was omitted
  (existing API report).
- **Expected:** Reject the request if province/region is required; the current
  test expects HTTP 400. Confirm the contract.

### APP-002 / P1

- **Actual:** API account creation returned HTTP 201 when `phone` was empty
  (existing API report).
- **Expected:** Reject the request if phone is required; the current test
  expects HTTP 422. Confirm the contract.

### APP-003 / P1

- **Actual:** API account creation returned HTTP 201 when consent was omitted.
  The test is titled as a null case but deletes the property.
- **Expected:** Reject omitted consent if it is required; the current test
  expects HTTP 422. Explicit `null` has not been tested. Confirm consent
  requirements.

### APP-004 / P1

- **Actual:** I reproduced no clear inline UI validation for invalid phone
  formats. The API report also shows HTTP 201 for a number longer than the
  ten-digit Canadian input.
- **Expected:** I expect clear UI validation and API rejection of unsupported
  values. The current API test expects HTTP 422; I need to confirm the supported
  formats.

### APP-005 / P1

- **Actual:** After account creation succeeds, `POST /co/authenticate` returns
  HTTP 400 and I am no longer redirected to the account. The redirect used to
  work. I group these as one post-account-creation/authentication regression,
  separate from signup-form validation; I have not confirmed whether the 400
  causes the redirect failure.
- **Expected:** I expect the previously working behavior to be restored:
  authentication succeeds and I am redirected to my account. I can login into
  the creaed account by going to login page directly

### APP-006 / P1

- **Actual:** For duplicate email, I saw the API response
  `{"error":"bad format","description":"error creating account"}`. The UI
  displays a generic toast ("Something went wrong..."), not a clear inline
  email-field error.
- **Expected:** I expect a clear duplicate-email error at the email field in the
  selected locale. I need the approved message confirmed.

### APP-007 / P2

- **Actual:** The UI accepts passwords longer than 32 characters; the form says
  passwords must be 12–32 characters.
- **Expected:** Enforce the stated 32-character maximum in the UI. Confirm
  whether the API also needs a server-side limit.

### APP-008 / P2

- **Actual:** I reproduced the UI accepting email addresses longer than 32
  characters.
- **Expected:** I expect a 32-character email maximum if that is the product
  requirement; I need to confirm the limit.

### APP-009 / P1

- **Actual:** I reproduced the API allowing account creation without a country
  code.
- **Expected:** I expect the API to require/validate a country code if
  mandatory; I need to confirm whether it is a separate field or part of the
  E.164 `phone` value.

### APP-010 / P2 suspected

- **Actual:** I confirmed an email address with `+` before `@` is accepted, and
  I suspect this may violate the product's email rules.
- **Expected:** I expect the application to follow the intended email-address
  policy. I need to confirm whether plus-addressing (for example,
  `name+tag@example.com`) is allowed before deciding whether this is a bug.

### APP-011 / P2

- **Actual:** I reproduced 400 and 500 failures showing no distinct, clear UI
  messages; the error appears in a generic toast.
- **Expected:** I expect actionable messages appropriate to client errors
  versus server failures; I need to confirm the copy and error mapping.

### APP-012 / P2

- **Actual:** In French signup, I entered an email with an accented French
  character in its local part and saw the inline `Courriel invalide` validation
  error (see my screenshot).
- **Expected:** I expect the address to be accepted if French/internationalized
  email local parts are supported. Otherwise, I expect the limitation to be
  documented and the validation message to be accurate. I need to confirm the
  supported email format with product/API.

### APP-013 / P2 suspected

- **Actual:** I can enter spaces in all signup input fields.
- **Expected:** I expect each field to handle spaces according to its purpose:
  trim surrounding whitespace where appropriate and reject whitespace-only or
  otherwise invalid values. I need to confirm the field-specific rules.

### APP-014 / P3 suspected

- **Actual:** French signup uses `/fr/signup`, while English signup uses
  `/signup` without a locale prefix.
- **Expected:** I propose using a consistent locale-prefixed route such as
  `/en/signup` for English, if that fits the product's URL and redirect
  conventions.

### APP-015 / P2 suspected

- **Actual:** When I click the NESTO logo, nothing happens.
- **Expected:** I expect the logo to navigate somewhere useful, likely the
  relevant home or account page. I need to confirm the intended destination.

### APP-016 / P2 suspected

- **Actual:** The signup page shows the hamburger menu on iPhone SE and iPhone 6
  viewport sizes. The hamburger is absent on iPad mini and desktop viewport
  sizes.
- **Expected:** I would expect the hamburger menu to appear on ony device and any responsive site.
