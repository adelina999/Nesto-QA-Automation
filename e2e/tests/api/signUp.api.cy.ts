import {
  createSignupAccount,
  type SignupCreationErrorResponse,
  type SignupCreationRequest,
  type SignupCreationResponse,
} from "../../api/signup.api";
import { createSignUpUserData } from "../../test-data/dataGenerationCommon";

const toSignupCreationRequest = (
  userData: ReturnType<typeof createSignUpUserData>,
): SignupCreationRequest => ({
  firstName: userData.firstName,
  lastName: userData.lastName,
  email: userData.email,
  phone: `+1${userData.phone}`,
  region: userData.province,
  leadDistributeConsentAgreement: userData.consent === true,
});

describe("Sign Up API", () => {
  it("creates an account with valid data", { retries: 0 }, () => {
    const userData = createSignUpUserData();
    const payload = toSignupCreationRequest(userData);

    expect(userData.phone).to.have.length(10);
    createSignupAccount<SignupCreationResponse>(payload).then(
      ({ body, status }) => {
        expect(status).to.equal(201);
        expect(body.account.firstName).to.equal(userData.firstName);
        expect(body.account.lastName).to.equal(userData.lastName);
        expect(body.account.email).to.equal(userData.email);
        expect(body.account.phone).to.equal(payload.phone);
        expect(body.account.region).to.equal(userData.province);
        expect(body.account.leadDistributeConsentAgreement).to.equal(true);
      },
    );
  });

  it(
    "rejects account creation when province is missing/Bug in API",
    { retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      delete payload.region;

      createSignupAccount<unknown>(payload, {
        failOnStatusCode: false,
      }).then(({ status }) => {
        expect(status).to.equal(400);
      });
    },
  );

  it("trims leading and trailing whitespace from names", { retries: 0 }, () => {
    const userData = createSignUpUserData();
    const payload = toSignupCreationRequest(userData);
    payload.firstName = `  ${userData.firstName}  `;
    payload.lastName = `\t${userData.lastName}\n`;

    createSignupAccount<SignupCreationResponse>(payload).then(
      ({ body, status }) => {
        expect(status).to.equal(201);
        expect(body.account.firstName).to.equal(userData.firstName);
        expect(body.account.lastName).to.equal(userData.lastName);
      },
    );
  });

  it("rejects account creation when email is missing/Bug in API",{ retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      payload.email = "";

      createSignupAccount<SignupCreationErrorResponse>(payload, {
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(422);
        expect(response.body).to.have.property("error");
        expect(response.body.error).to.match(/invalid parameters/i);
        expect(response.body.parameters).to.include("email");
      });
    },
  );

  it("rejects account creation when email contains only whitespace",{ retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      payload.email = " \t ";

      createSignupAccount<SignupCreationErrorResponse>(payload, {
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(422);
        expect(response.body.error).to.match(/invalid parameters/i);
        expect(response.body.parameters).to.include("email");
      });
    },
  );

  it("rejects account creation when phone is missing/Bug in API",
    { retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      payload.phone = "";

      createSignupAccount<SignupCreationErrorResponse>(payload, {
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(422);
        expect(response.body).to.have.property("error");
      });
    },
  );

  it("rejects a phone number longer than the 10-digit Canadian input",
    { retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      payload.phone = `${payload.phone}0`;

      createSignupAccount<SignupCreationErrorResponse>(payload, {
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(422);
        expect(response.body.error).to.match(/invalid parameters/i);
        expect(response.body.parameters).to.include("phone");
      });
    },
  );

  it("rejects account creation when leadDistributeConsentAgreement is null/Bug in API",
    { retries: 0 },
    () => {
      const payload = toSignupCreationRequest(createSignUpUserData());
      delete (payload as Partial<SignupCreationRequest>)
        .leadDistributeConsentAgreement;
      createSignupAccount<SignupCreationErrorResponse>(payload, {
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(422);
        expect(response.body).to.have.property("error");
      });
    },
  );
});
