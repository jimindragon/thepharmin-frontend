"use client";

import { useSession } from "@/components/session/SessionProvider";

/**
 * 개인회원 로그인 상태. 판정 근거는 개인 세션 쿠키(thepharma_personal_session) 하나뿐이며,
 * SessionProvider가 서버에서 읽어 내려준 값을 구독한다. URL 쿼리는 더 이상 보지 않는다.
 *
 * `login()`/`logout()`은 쿠키를 쓰고 지운다 — 서버 컴포넌트 갱신(router.refresh)은
 * SessionProvider가 쿠키 변경 이벤트를 받아 대신 처리한다.
 */
export function usePersonalLoginState() {
  const { isPersonalLoggedIn, loginPersonal, logoutPersonal } = useSession();

  return { isLoggedIn: isPersonalLoggedIn, login: loginPersonal, logout: logoutPersonal };
}
