export type Language = "en" | "fr";

export function getLanguage(): Language {
  const language: unknown = Cypress.expose("language") ?? "en";
  if (language !== "en" && language !== "fr") {
    throw new Error('Unsupported language. Use "en" or "fr".');
  }
  return language;
}

export function localizedPath(path: string, language: Language): string {
  return language === "fr" ? `/fr${path === "/" ? "" : path}` : path;
}
