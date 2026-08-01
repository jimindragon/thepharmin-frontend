/**
 * 목업 세션 쿠키의 단일 정의.
 *
 * 개인 계정과 기업 계정은 완전히 분리된 두 쿠키로 관리하며, 둘을 잇는 식별자는 두지 않는다.
 * 값은 "1" 하나뿐 — 실제 인증이 붙으면 이 자리가 토큰으로 대체된다.
 *
 * 이 파일은 서버·클라이언트 양쪽에서 import되므로 `next/headers`를 쓰지 않는다.
 * 서버에서 쿠키를 읽을 때는 `@/lib/session.server`의 읽기 함수를 쓴다.
 */

export const SESSION_COOKIE = {
  PERSONAL: "thepharma_personal_session",
  BUSINESS: "thepharma_business_session",
} as const;

export type SessionKind = keyof typeof SESSION_COOKIE;

/** 로그인 표식. 실제 인증 단계에서 토큰 문자열로 대체된다. */
export const SESSION_VALUE = "1";

/** 7일 */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * 쿠키가 바뀐 사실을 알리는 브라우저 이벤트.
 *
 * `markBusinessMember`처럼 훅 바깥에서 호출되는 모듈 함수도 쿠키를 바꾸기 때문에,
 * SessionProvider가 이 이벤트 하나만 구독하면 어느 경로로 바뀌든 상태와
 * 서버 컴포넌트(router.refresh)를 함께 갱신할 수 있다.
 * `useNotificationReadState`가 이미 쓰는 방식과 같은 패턴이다.
 */
export const SESSION_CHANGED_EVENT = "thepharma:session-changed";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  for (const entry of document.cookie.split(";")) {
    const trimmed = entry.trim();
    if (trimmed.startsWith(`${name}=`)) return trimmed.slice(name.length + 1);
  }
  return null;
}

function notifySessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));
}

export function readClientSession(kind: SessionKind): boolean {
  return readCookie(SESSION_COOKIE[kind]) === SESSION_VALUE;
}

/** 도메인 속성은 지정하지 않는다 — 상위 도메인 분리는 실제 인증 단계에서 붙인다. */
export function writeClientSession(kind: SessionKind) {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE[kind]}=${SESSION_VALUE}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
  notifySessionChanged();
}

export function clearClientSession(kind: SessionKind) {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE[kind]}=; path=/; max-age=0; SameSite=Lax`;
  notifySessionChanged();
}
