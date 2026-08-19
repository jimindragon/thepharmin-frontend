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

/**
 * 저장된 관심조건을 트랙 구분 없이 통째로 지운다 — 현재 소비처는 DEV 상태 전환 패널의
 * "관심조건 안내 · 다시 보기"뿐이다(온보딩을 저장 이전 상태부터 재현하기 위해).
 *
 * 빈 객체로 덮지 않고 키를 지운다. readAll이 키 없음과 빈 객체를 똑같이 {}로 돌려주므로 읽는 쪽
 * 결과는 같지만, 저장소에는 "한 번도 저장한 적 없음"과 구분되지 않는 유령 키가 남는다 —
 * 다른 초기화(useInterestPromptSeen.resetSeen, useMemberMigration.resetMigration)도 모두
 * removeItem 쪽이라 저장소 안에서 초기화의 뜻이 한 가지로 읽힌다.
 *
 * 변경을 알리는 이벤트는 발행하지 않는다 — 이 저장소에는 애초에 그런 이벤트가 없고, 읽는 쪽
 * (채용 목록·캘린더·마이페이지 관심조건/대시보드/알림설정·온보딩 게이트)이 전부 마운트 때 한 번만
 * 읽는다. 화면 갱신은 다음 마운트에 반영된다.
 */
export function clearAllStoredJobPreferences() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
