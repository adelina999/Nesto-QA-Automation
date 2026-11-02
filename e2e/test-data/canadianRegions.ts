import type { Language } from "../support/language";

export const canadianRegions = [
  { code: "ON", en: "Ontario", fr: "Ontario" },
  { code: "QC", en: "Quebec", fr: "Québec" },
  { code: "AB", en: "Alberta", fr: "Alberta" },
  {
    code: "BC",
    en: "British-Columbia",
    fr: "Colombie-Britannique",
  },
  { code: "MB", en: "Manitoba", fr: "Manitoba" },
  { code: "NB", en: "New Brunswick", fr: "Nouveau-Brunswick" },
  { code: "NS", en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  {
    code: "NL",
    en: "Newfoundland and Labrador",
    fr: "Terre-Neuve-et-Labrador",
  },
  {
    code: "PE",
    en: "Prince Edward Island",
    fr: "Île-du-Prince-Édouard",
  },
  { code: "SK", en: "Saskatchewan", fr: "Saskatchewan" },
  {
    code: "NT",
    en: "Northwest Territories",
    fr: "Territoires du Nord-Ouest",
  },
  { code: "YT", en: "Yukon", fr: "Yukon" },
  { code: "NU", en: "Nunavut", fr: "Nunavut" },
] as const satisfies readonly {
  code: string;
  en: string;
  fr: string;
}[];

export const getCanadianRegionOptions = (language: Language) =>
  canadianRegions.map((region) => ({
    value: region.code,
    label: region[language],
  }));
