"use client";

import { useSession } from "@/components/session/SessionProvider";
import { clearClientSession, writeClientSession } from "@/lib/session";

/**
 * 기업회원 로그인 상태. 저장소는 localStorage에서 기업 세션 쿠키
 * (thepharma_business_session)로 옮겼고, 이름·시그니처는 호출부가 깨지지 않도록 그대로 둔다.
 *
 * mark/clear는 훅 바깥(모듈 함수)에서도 호출되므로 컨텍스트를 쓰지 않고 쿠키를 직접 다룬다 —
 * 대신 쿠키 변경 이벤트가 SessionProvider로 전달돼 상태와 서버 컴포넌트가 함께 갱신된다.
 */
export function markBusinessMember() {
  writeClientSession("BUSINESS");
}

/** markBusinessMember의 짝. 기업 계정 메뉴의 로그아웃에서 쓴다. */
export function clearBusinessMember() {
  clearClientSession("BUSINESS");
}

export function useBusinessMember() {
  return useSession().isBusinessLoggedIn;
}
