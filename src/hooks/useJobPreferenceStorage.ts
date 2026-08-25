import { trackFilterConfigs } from "@/config/jobFilters";
import { emptyUserPreference } from "@/data/mockUserPreferences";
import type { JobTrack, TrackPreferences, UserJobPreference } from "@/types/jobs";

const STORAGE_KEY = "thepharmin:job-preferences";

/**
 * 트랙별 유효 직무 id 집합. 필터 정본(trackFilterConfigs → 각 트랙 config의 `kind: "job"` 필터)에서
 * 뽑되 한 번 만든 집합은 재사용한다 — 정본은 모듈 상수라 런타임에 바뀌지 않는다.
 */
const validJobIdsByTrack = new Map<JobTrack, { categoryIds: Set<string>; subcategoryIds: Set<string> }>();

function validJobIds(track: JobTrack) {
  const cached = validJobIdsByTrack.get(track);
  if (cached) return cached;

  const categories = trackFilterConfigs[track].filters.find((definition) => definition.kind === "job")?.categories ?? [];
  const ids = {
    categoryIds: new Set(categories.map((category) => category.id)),
    subcategoryIds: new Set(categories.flatMap((category) => category.subcategories.map((subcategory) => subcategory.id))),
  };
  validJobIdsByTrack.set(track, ids);
  return ids;
}

/** `in`은 toString 같은 프로토타입 키까지 참으로 만든다 — 저장소 키는 남이 넣을 수 있으니 자기 키만 본다. */
function isJobTrack(key: string): key is JobTrack {
  return Object.prototype.hasOwnProperty.call(trackFilterConfigs, key);
}

function sanitizeIds(stored: unknown, valid: Set<string>): { ids: string[]; changed: boolean } {
  if (!Array.isArray(stored)) return { ids: [], changed: true };

  const ids = stored.filter((id): id is string => typeof id === "string" && valid.has(id));
  return { ids, changed: ids.length !== stored.length };
}

/**
 * 기본값의 모양이 곧 그 필드의 정본이다 — 다중 선택 자리에는 배열, 알림 on/off 자리에는 boolean,
 * 단일 선택 자리에는 문자열이나 null만 온다. 필드가 아예 없으면 `undefined`라 어느 검사도 통과하지
 * 못하고, 그대로 "채워야 할 자리"로 잡힌다.
 */
function matchesDefaultShape(value: unknown, fallback: unknown) {
  if (Array.isArray(fallback)) return Array.isArray(value);
  if (typeof fallback === "boolean") return typeof value === "boolean";
  return value === null || typeof value === "string";
}

/**
 * 누락되거나 모양이 어긋난 필드를 `emptyUserPreference`의 기본값으로 되돌린다.
 * 되돌릴 것이 없으면 원본을 그대로 돌려준다 — 멀쩡한 값을 새 객체로 갈아끼우지 않는다.
 */
function fillDefaults(typed: UserJobPreference): { preference: UserJobPreference; changed: boolean } {
  const stored = typed as unknown as Record<string, unknown>;
  const restored: Record<string, unknown> = {};

  for (const [field, fallback] of Object.entries(emptyUserPreference)) {
    if (!matchesDefaultShape(stored[field], fallback)) restored[field] = fallback;
  }

  if (Object.keys(restored).length === 0) return { preference: typed, changed: false };

  // 기본값을 바닥에 깔아 필드 순서를 정본과 맞추고, 그 위에 저장된 값과 되돌린 값을 얹는다.
  return { preference: { ...emptyUserPreference, ...typed, ...restored } as UserJobPreference, changed: true };
}

/**
 * 저장된 값을 읽는 쪽이 기대하는 모양으로 되돌린다. 하는 일은 두 가지다.
 *
 * 1. 정본에 없는 직무 id를 걸러낸다. 분류 체계가 바뀌면(대분류 분리·소분류 삭제 등) 예전 id가
 *    저장소에 그대로 남는데, 읽는 쪽은 라벨을 못 찾으면 id 원문을 그대로 칩에 그린다
 *    (`useJobFilters`의 `?? id` 폴백). 화면에 정본에 없는 칩이 뜨고 해제할 UI도 없어 스스로
 *    지울 수 없는 유령 값이 된다.
 * 2. 누락되거나 모양이 어긋난 필드를 `emptyUserPreference`의 기본값으로 채운다. 읽는 쪽이 배열
 *    필드를 곧장 훑기 때문에(`buildAppliedChips`·`buildPreferenceChips`·`toQuery`·
 *    `clearPreferenceFilters`) 필드 하나만 없어도 화면이 통째로 죽는다. 스칼라 필드는 조용히
 *    넘어가지만, 저장 화면이 그 값을 그대로 되쓰기 때문에 누락이 저장소에 눌러앉는다.
 *
 * 그 밖에 사용자가 넣은 유효한 값은 바꾸지 않는다 — 직무 분류 말고는 값의 옳고 그름을 판정할
 * 정본이 없어, 더 손대면 근거 없이 사용자 설정을 지우게 된다.
 */
function sanitizeAll(parsed: unknown): { preferences: TrackPreferences; changed: boolean } {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { preferences: {}, changed: true };
  }

  const stored = parsed as Record<string, unknown>;
  const preferences: TrackPreferences = {};
  let changed = false;

  for (const key of Object.keys(stored)) {
    const preference = stored[key];

    // 트랙 키가 아니거나 관심조건 모양이 아니면 어느 트랙 것인지조차 알 수 없어 되살릴 수 없다.
    if (!isJobTrack(key) || typeof preference !== "object" || preference === null || Array.isArray(preference)) {
      changed = true;
      continue;
    }

    const valid = validJobIds(key);
    const typed = preference as UserJobPreference;
    const filled = fillDefaults(typed);
    const categories = sanitizeIds(filled.preference.jobCategoryIds, valid.categoryIds);
    const subcategories = sanitizeIds(filled.preference.jobSubcategoryIds, valid.subcategoryIds);

    // 직무 id가 멀쩡해도 다른 필드가 비어 있으면 통과시키지 않는다 — 그 통과가 곧 크래시 통로였다.
    if (!filled.changed && !categories.changed && !subcategories.changed) {
      preferences[key] = typed;
      continue;
    }

    changed = true;
    preferences[key] = { ...filled.preference, jobCategoryIds: categories.ids, jobSubcategoryIds: subcategories.ids };
  }

  return { preferences, changed };
}

function readAll(): TrackPreferences {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // 깨진 문자열은 덮어쓰지 않고 그대로 둔다 — 되살릴 수 있는 값인지 여기서는 알 수 없다.
    return {};
  }

  const { preferences, changed } = sanitizeAll(parsed);
  // 걸러낸 김에 저장소도 정제본으로 덮어 다음 로드부터는 대조할 유령 값이 남지 않게 한다.
  // 걸러낼 것이 없었으면 쓰지 않는다 — 읽기만 해도 매번 쓰는 저장소가 되면 안 된다.
  if (changed) writeAll(preferences);
  return preferences;
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
