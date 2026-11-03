import { faker, fakerFR } from "@faker-js/faker";
import type { SignupUser } from "../pages/SignupPage";
import { canadianRegions } from "./canadianRegions";

export type SignupUserOverrides = Partial<SignupUser>;

export const generatePassword = (length = 14): string => {
  if (!Number.isInteger(length) || length < 12 || length > 32) {
    throw new RangeError(
      "Password length must be between 12 and 32 characters.",
    );
  }
  //There is no clear requirement for special characters so we don't use them
  const uppercase = faker.string.alpha({ length: 3, casing: "upper" });
  const lowercase = faker.string.alpha({ length: 3, casing: "lower" });
  const digits = faker.string.numeric({ length: 3 });
  const fillers = faker.string.alphanumeric({ length: length - 9 });
  const password = [...uppercase, ...lowercase, ...digits, ...fillers];

  return faker.helpers.shuffle(password).join("");
};

const generateCanadianPhoneNumber = (): string => {
  //we use real canadian area code to make sure country identified as Canada
  const areaCode = faker.helpers.arrayElement([
    "416",
    "437",
    "647",
    "403",
    "587",
  ]);
  const exchangeCode = `${faker.helpers.arrayElement("23456789".split(""))}${faker.string.numeric(2)}`;

  return `${areaCode}${exchangeCode}${faker.string.numeric(4)}`;
};

const generateEmail = (): string => {
  //this method generate a fake email, to make sure we don't use real email we modify the domain and the local part
  const baseEmail = faker.internet.email();
  const [localPart, domain] = baseEmail.split("@");
  return `${localPart}${faker.string.alphanumeric({ length: 3 })}@nesto.com`;
};

export const createSignUpUserData = (
  overrides: SignupUserOverrides = {},
): SignupUser => {
  const password = overrides.password ?? generatePassword();

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    countryCode: "CA",
    province: canadianRegions[0].code,
    phone: generateCanadianPhoneNumber(),
    email: generateEmail(),
    password,
    confirmPassword: overrides.confirmPassword ?? password,
    consent: true,
    ...overrides,
  };
};

export const createFrenchSignUpUserData = (
  overrides: SignupUserOverrides = {},
): SignupUser => {
  const firstName = overrides.firstName ?? fakerFR.person.firstName();
  const lastName = overrides.lastName ?? fakerFR.person.lastName();
  const emailLocalPart = `${firstName}.${lastName}${fakerFR.string.alphanumeric(
    3,
  )}é`
    .toLocaleLowerCase("fr")
    .replace(/[^\p{L}\p{N}.]/gu, "");

  return createSignUpUserData({
    ...overrides,
    firstName,
    lastName,
    email: overrides.email ?? `${emailLocalPart}@nesto.com`,
  });
};
