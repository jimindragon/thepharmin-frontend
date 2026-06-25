import type { JobTrack, TrackPreferences, UserJobPreference } from "@/types/jobs";

const STORAGE_KEY = "thepharmin:job-preferences";

function readAll(): TrackPreferences {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as TrackPreferences;
  } catch {
    return {};
  }
}

function writeAll(preferences: TrackPreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

/** 분야(트랙)별로 독립된 관심조건을 읽어온다. 트랙마다 별도로 저장·수정되며 서로 덮어쓰지 않는다. */
export function getStoredJobPreference(track: JobTrack): UserJobPreference | null {
  return readAll()[track] ?? null;
}

export function getAllStoredJobPreferences(): TrackPreferences {
  return readAll();
}

export function setStoredJobPreference(track: JobTrack, preference: UserJobPreference) {
  if (typeof window === "undefined") return;
  const all = readAll();
  all[track] = preference;
  writeAll(all);
}
