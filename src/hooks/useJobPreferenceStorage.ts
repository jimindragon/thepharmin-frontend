import type { UserJobPreference } from "@/types/jobs";

const STORAGE_KEY = "thepharmin:job-preference";

export function getStoredJobPreference(): UserJobPreference | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as UserJobPreference;
  } catch {
    return null;
  }
}

export function setStoredJobPreference(preference: UserJobPreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
}
