import { faker } from "@faker-js/faker";
import type { SignupUser } from "../pages/SignupPage";

export type SignupUserOverrides = Partial<SignupUser>;

export const generatePassword = (length = 14): string => {
  if (!Number.isInteger(length) || length < 12 || length > 32) {
    throw new RangeError(
      "Password length must be between 12 and 32 characters.",
    );
  }

  const uppercase = faker.string.alpha({ length: 3, casing: "upper" });
  const lowercase = faker.string.alpha({ length: 3, casing: "lower" });
  const digits = faker.string.numeric({ length: 3 });
  const fillers = faker.string.alphanumeric({ length: length - 9 });
  const password = [...uppercase, ...lowercase, ...digits, ...fillers];

  return faker.helpers.shuffle(password).join("");
};

const generateCanadianPhoneNumber = (): string => {
  const areaCode = faker.helpers.arrayElement(["416", "437", "647"]);
  const exchangeCode = `${faker.helpers.arrayElement("23456789".split(""))}${faker.string.numeric(2)}`;

  return `${areaCode}${exchangeCode}${faker.string.numeric(4)}`;
};

const generateEmail = (): string => {
  const baseEmail = faker.internet.email();
  const [localPart, domain] = baseEmail.split("@");
  return `${localPart}+${faker.string.alphanumeric({ length: 3 })}@nesto.com`;
};

export const createSignUpUserData = (
  overrides: SignupUserOverrides = {},
): SignupUser => {
  const password = overrides.password ?? generatePassword();

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    countryCode: "CA",
    province: "ON",
    phone: generateCanadianPhoneNumber(),
    email: generateEmail(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
    consent: true,
    ...overrides,
  };
};
