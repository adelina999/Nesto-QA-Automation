import type { Language } from "../support/language";

// Routes and copy observed on the QA signup page. These expectations are
// intentionally stored here rather than read from the app during a test.
export const signupLanguages = {
  en: {
    name: "English",
    path: "/signup",
    accountHeading: "Create a nesto account",
    loginButton: "Login",
    firstNameLabel: "First name",
    lastNameLabel: "Last name",
    phoneLabel: "Phone number",
    provinceLabel: "Province of purchase",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    submit: "Create your account",
    validation: {
      required: "The field is required",
      invalidPhone: "Invalid value",
      invalidEmail: "Invalid email",
      invalidMinPassword: "Minimum of 12 letters required",
      invalidMaxPassword: "Maximum of 32 letters required",
      passwordMismatch: "Passwords do not match",
      duplicateEmail: "Email already in use",
    },
  },
  fr: {
    name: "French",
    path: "/fr/signup",
    accountHeading: "Créez un compte nesto",
    loginButton: "Connexion",
    firstNameLabel: "Prénom",
    lastNameLabel: "Nom",
    phoneLabel: "Téléphone",
    provinceLabel: "Province de l'achat",
    emailLabel: "Courriel",
    passwordLabel: "Mot de passe",
    confirmPasswordLabel: "Confirmation du mot de passe",
    submit: "Créez votre compte",
    validation: {
      required: "Ce champ est obligatoire.",
      invalidPhone: "Valeur invalide.",
      invalidEmail: "Courriel invalide",
      invalidMinPassword: "Minimum de 12 lettres requises",
      invalidMaxPassword: "Maximum de 32 lettres requises",
      passwordMismatch: "Les mots de passe ne correspondent pas",
      duplicateEmail: "",
    },
  },
} as const satisfies Record<
  Language,
  {
    name: string;
    path: string;
    accountHeading: string;
    loginButton: string;
    firstNameLabel: string;
    lastNameLabel: string;
    phoneLabel: string;
    provinceLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submit: string;
    validation: {
      required: string;
      invalidPhone: string;
      invalidEmail: string;
      invalidMinPassword: string;
      invalidMaxPassword: string;
      passwordMismatch: string;
      duplicateEmail: string;
    };
  }
>;
