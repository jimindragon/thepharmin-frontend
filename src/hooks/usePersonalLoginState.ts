"use client";

import { useEffect, useState } from "react";

/**
 * 개인회원 로그인 상태 모킹. 현재 프로젝트에는 개인회원용 실제 로그인 라우트/인증이 없어,
 * `RecruitmentCalendarClient`의 `?guest=true` 미리보기 패턴과 동일하게 기본은 로그인 상태로
 * 두고, `?guest=true`일 때만 비로그인 상태를 미리 볼 수 있게 한다. `login()`은 실제 인증 없이
 * 로컬 상태만 로그인 상태로 되돌린다(데모용 "로그인하고 보기" 동작).
 */
export function usePersonalLoginState() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const guestMode = new URLSearchParams(window.location.search).get("guest") === "true";
    setIsLoggedIn(!guestMode);
  }, []);

  return { isLoggedIn, login: () => setIsLoggedIn(true) };
}
