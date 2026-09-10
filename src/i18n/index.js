// --- Locale resolution -----------------------------------------------------
// Option A: the language follows the visitor's browser locale on first visit,
// with a manual override (the EN/ES switch in the page topbar) remembered in
// localStorage. There is no URL segment and no router.

import en from "./en.js";
import es from "./es.js";

export const DICTS = { en, es };
export const LOCALES = Object.keys(DICTS); // ["en", "es"]
export const DEFAULT_LOCALE = "en";

const STORAGE_KEY = "pgd:locale";

// The active dictionary for a locale, always falling back to English.
export function getDict(locale) {
  return DICTS[locale] ?? DICTS[DEFAULT_LOCALE];
}

// Map any BCP-47 tag ("es", "es-AR", "ES") onto a locale we ship.
function normalize(tag) {
  const base = String(tag || "").toLowerCase().split("-")[0];
  return LOCALES.includes(base) ? base : null;
}

// First render: a remembered choice wins; otherwise the browser's languages,
// in order of preference; otherwise English. All storage access is guarded —
// private mode / blocked storage must never break the boot.
export function resolveInitialLocale() {
  try {
    const saved = normalize(localStorage.getItem(STORAGE_KEY));
    if (saved) return saved;
  } catch {
    /* storage unavailable — fall through to the browser languages */
  }

  const prefs =
    typeof navigator !== "undefined"
      ? navigator.languages ?? [navigator.language]
      : [];
  for (const tag of prefs) {
    const hit = normalize(tag);
    if (hit) return hit;
  }
  return DEFAULT_LOCALE;
}

export function persistLocale(locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* no persistence available — the choice just won't survive a reload */
  }
}

// Keep the document's lang attribute in step so screen readers and the browser
// pick the right pronunciation / hyphenation.
export function applyDocumentLocale(locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}
