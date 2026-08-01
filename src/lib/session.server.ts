import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/session";

/**
 * 서버 컴포넌트 전용 세션 읽기.
 *
 * `next/headers`는 클라이언트 번들에 들어갈 수 없어 쿠키 이름·클라이언트 헬퍼가 있는
 * `@/lib/session`과 파일을 나눠 둔다. 이 파일은 서버 컴포넌트에서만 import할 것.
 *
 * 이 프로젝트의 Next(15.5.x)에서 `cookies()`는 Promise를 반환하므로 두 함수 모두 async다.
 */

async function hasSessionCookie(name: string): Promise<boolean> {
  const store = await cookies();
  return store.get(name)?.value === SESSION_VALUE;
}

export function readPersonalSession(): Promise<boolean> {
  return hasSessionCookie(SESSION_COOKIE.PERSONAL);
}

export function readBusinessSession(): Promise<boolean> {
  return hasSessionCookie(SESSION_COOKIE.BUSINESS);
}
