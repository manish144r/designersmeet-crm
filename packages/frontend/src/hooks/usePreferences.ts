// User-facing preferences persisted to localStorage under `dm.preferences`.
// Wave-A scope: language, timezone, date format. Used by date renderers
// across the app (Dashboard, Projects, Contacts list) via useDatePreference.
//
// The store is intentionally tiny + framework-free at the persistence layer so
// the same module can be imported from non-React utility code (e.g. the
// invoice PDF generator) without dragging a hook context along.

import { useEffect, useState } from "react";

export type DateFormat = "iso" | "us" | "eu";
export type Language = "en" | "es" | "fr";

export interface Preferences {
  timezone: string;
  language: Language;
  dateFormat: DateFormat;
}

const STORAGE_KEY = "dm.preferences";

const DEFAULTS: Preferences = {
  timezone: "Asia/Kolkata",
  language: "en",
  dateFormat: "iso",
};

function safeRead(): Preferences {
  if (typeof localStorage === "undefined") return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      timezone: typeof parsed.timezone === "string" ? parsed.timezone : DEFAULTS.timezone,
      language: ["en", "es", "fr"].includes(parsed.language as string)
        ? (parsed.language as Language)
        : DEFAULTS.language,
      dateFormat: ["iso", "us", "eu"].includes(parsed.dateFormat as string)
        ? (parsed.dateFormat as DateFormat)
        : DEFAULTS.dateFormat,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

function safeWrite(value: Preferences) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Quota / private mode — drop silently. Demo session only.
  }
}

// Pub/sub so multiple hook instances stay in sync without remount.
const subscribers = new Set<() => void>();
function emit() {
  for (const fn of subscribers) {
    try { fn(); } catch { /* listener errors must not break preferences */ }
  }
}

let cached: Preferences | null = null;
function getPreferences(): Preferences {
  if (!cached) cached = safeRead();
  return cached;
}

export function setPreferences(patch: Partial<Preferences>) {
  cached = { ...getPreferences(), ...patch };
  safeWrite(cached);
  emit();
}

export function usePreferences(): [Preferences, (patch: Partial<Preferences>) => void] {
  const [, force] = useState(0);
  useEffect(() => {
    const listener = () => force((n) => n + 1);
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  }, []);
  return [getPreferences(), setPreferences];
}

// ── Date renderer ────────────────────────────────────────────────────────
// Returns a `formatDate(input)` function bound to the current preferences.
// Accepts a Date | string | number; missing/invalid → empty string so
// callers can safely render <span>{formatDate(row.due)}</span> without
// guarding.
export function useDatePreference() {
  const [prefs] = usePreferences();
  return {
    prefs,
    formatDate(input: Date | string | number | null | undefined): string {
      if (input == null || input === "") return "";
      const d = input instanceof Date ? input : new Date(input);
      if (Number.isNaN(d.getTime())) return String(input);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");

      switch (prefs.dateFormat) {
        case "us":
          return `${mm}/${dd}/${yyyy}`;
        case "eu":
          return `${dd}/${mm}/${yyyy}`;
        case "iso":
        default:
          return `${yyyy}-${mm}-${dd}`;
      }
    },
  };
}

// IANA list — small curated set for the dropdown. Realistic for the
// DesignersMeet AU/IN customer base; not exhaustive.
export const TIMEZONES = [
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Berlin",
  "Australia/Sydney",
  "Australia/Melbourne",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
] as const;

export const LANGUAGES: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

export const DATE_FORMATS: Array<{ code: DateFormat; label: string; sample: string }> = [
  { code: "iso", label: "ISO (YYYY-MM-DD)", sample: "2026-05-20" },
  { code: "us", label: "US (MM/DD/YYYY)", sample: "05/20/2026" },
  { code: "eu", label: "EU (DD/MM/YYYY)", sample: "20/05/2026" },
];
