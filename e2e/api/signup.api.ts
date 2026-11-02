export interface SignupCreationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  region?: string;
  leadDistributeConsentAgreement: boolean;
}

export interface SignupCreationResponse {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    region: string;
    leadDistributeConsentAgreement: boolean;
  };
}

export interface SignupCreationErrorResponse {
  error: string;
  parameters: string[];
}

export interface SignupCreationOptions {
  failOnStatusCode?: boolean;
}

export const createSignupAccount = <TResponse = SignupCreationResponse>(
  payload: SignupCreationRequest,
  options: SignupCreationOptions = {},
): Cypress.Chainable<Cypress.Response<TResponse>> =>
  cy.request<TResponse>({
    method: "POST",
    url: "/api/accounts",
    body: payload,
    ...options,
  });
