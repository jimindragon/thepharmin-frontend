"use client";

import { useCallback, useEffect, useState } from "react";
import type { InterviewAccessUserState } from "@/components/company/InterviewAccessStatusCard";

/**
 * 면접 후기 열람권 데모의 "프리셋" 하나만 담는다 — DEV 상태 전환 패널이 고르고,
 * 면접 후기 목록(CompanyInterviewsListClient)이 읽는다.
 *
 * 보유 장수(credits)·열람한 후기 id는 여기 들어오지 않는다. 그 둘은 열람할 때마다 변하는 진행
 * 상태라 페이지 로컬 useState로 남겨두고, 이 훅은 "어느 상태를 보고 싶은가"만 기억한다.
 *
 * 값이 없으면(키 미설정) null이다 — 그때는 읽는 쪽이 기존 규칙(로그인 여부)으로 정한다.
 * 패널을 한 번도 만지지 않은 방문자에게 저장소가 개입하지 않게 하려는 것이다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:review-access-demo";

/**
 * 값이 바뀐 사실을 같은 탭의 다른 인스턴스에 알리는 이벤트.
 * 패널과 후기 목록이 동시에 이 값을 들고 있어, 이벤트가 없으면 각자의 useState가 갈라진다 —
 * storage 이벤트는 같은 탭에서 발생하지 않아 대체 수단이 되지 못한다.
 * useNotificationReadState·useMemberMigration이 이미 쓰는 방식과 같은 패턴이다.
 */
const DEMO_CHANGED_EVENT = "thepharmin:review-access-demo-changed";

function isValidState(value: string | null): value is InterviewAccessUserState {
  return value === "loggedOut" || value === "noCredits" || value === "hasCredits";
}

function readStoredState(): InterviewAccessUserState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isValidState(raw) ? raw : null;
}

export interface ReviewAccessDemoState {
  /** 패널이 고른 프리셋. 미설정이면 null */
  demoState: InterviewAccessUserState | null;
  setDemoState: (next: InterviewAccessUserState) => void;
}

export function useReviewAccessDemo(): ReviewAccessDemoState {
  /**
   * localStorage는 서버에서 읽을 수 없어 첫 렌더에는 값을 알 수 없다. 그 사이의 기본값은 null —
   * "미설정"이라 읽는 쪽이 기존 규칙으로 그리고, 마운트 직후 저장된 값이 있으면 교정된다.
   * 다른 훅들이 기본값을 "잠기지 않는 쪽"에 두고 마운트 후 교정하는 것과 같은 자리다.
   */
  const [demoState, setState] = useState<InterviewAccessUserState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setState(readStoredState());

    const onChange = () => setState(readStoredState());
    window.addEventListener(DEMO_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DEMO_CHANGED_EVENT, onChange);
  }, []);

  const setDemoState = useCallback((next: InterviewAccessUserState) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setState(next);
    window.dispatchEvent(new Event(DEMO_CHANGED_EVENT));
  }, []);

  return { demoState, setDemoState };
}
