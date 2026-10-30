import { faker } from "@faker-js/faker";
import type { SignupUser } from "../pages/SignupPage";

export interface SignupUserOverrides extends Partial<SignupUser> {
  country?: string;
  name?: string;
}

export interface SignupScenario extends SignupUserOverrides {
  name: string;
}

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

export const createSignUpUserData = (
  overrides: SignupUserOverrides = {},
): SignupUser => {
  const { name: _name, country, ...userOverrides } = overrides;
  const password = userOverrides.password ?? generatePassword();

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    countryCode: country ?? "CA",
    province: "ON",
    phone: generateCanadianPhoneNumber(),
    email: faker.internet.email(),
    password,
    confirmPassword: userOverrides.confirmPassword ?? password,
    consent: true,
    ...userOverrides,
  };
};
