"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 약사 면허 인증의 검토 상태 데모.
 *
 * 실제 검토는 운영진이 회원의 이름과 면허번호를 보건복지부 기관조회로 대조하는 일이고,
 * 면허증 사진은 그것이 어려울 때 보는 보조 자료다. 그 결과가 회원 데이터에 남아야 하지만
 * (PersonalMember에는 아직 상태 필드가 없다) 저장소도 검토 파이프라인도 없어, 지금은
 * "어느 상태를 보고 싶은가"만 저장한다 — DEV 상태 전환 패널이 고르고 회원정보 화면이 읽는다.
 * 구조·키 규칙·이벤트는 useReviewAccessDemo를 그대로 따른다.
 *
 * 값이 없으면(키 미설정) null이다. 그때는 읽는 쪽이 기존 규칙(번호와 면허증이 모두 있으면
 * 검토 중)으로 정한다 — 패널을 한 번도 만지지 않은 방문자에게 저장소가 개입하지 않게 하려는 것이다.
 *
 * QNA 접근 판정(qnaAccess.ts)과는 잇지 않는다. 그쪽은 서버 컴포넌트가 쿼리로 가르는 별개 축이라
 * localStorage를 읽을 수 없다 — 실제 회원 필드가 생길 때 두 축을 함께 그 값으로 옮길 자리다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:license-verification-demo";

/**
 * 값이 바뀐 사실을 같은 탭의 다른 인스턴스에 알리는 이벤트.
 * 패널과 회원정보 화면이 동시에 이 값을 들고 있어, 이벤트가 없으면 각자의 useState가 갈라진다 —
 * storage 이벤트는 같은 탭에서 발생하지 않아 대체 수단이 되지 못한다.
 */
const DEMO_CHANGED_EVENT = "thepharmin:license-verification-demo-changed";

/**
 * 검토 상태 4단계. 화면에 나가는 말은 이 값과 별개로 정한다 —
 * none은 아무것도 띄우지 않고, 나머지는 "검토 중"·"인증 완료"·"반려"로 읽힌다.
 */
export type LicenseVerificationState = "none" | "pending" | "approved" | "rejected";

function isValidState(value: string | null): value is LicenseVerificationState {
  return value === "none" || value === "pending" || value === "approved" || value === "rejected";
}

function readStoredState(): LicenseVerificationState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isValidState(raw) ? raw : null;
}

export interface LicenseVerificationDemoState {
  /** 패널이 고른 상태. 미설정이면 null */
  demoState: LicenseVerificationState | null;
  setDemoState: (next: LicenseVerificationState) => void;
}

export function useLicenseVerificationDemo(): LicenseVerificationDemoState {
  /**
   * localStorage는 서버에서 읽을 수 없어 첫 렌더에는 값을 알 수 없다. 그 사이의 기본값은 null —
   * "미설정"이라 읽는 쪽이 기존 규칙으로 그리고, 마운트 직후 저장된 값이 있으면 교정된다.
   */
  const [demoState, setState] = useState<LicenseVerificationState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setState(readStoredState());

    const onChange = () => setState(readStoredState());
    window.addEventListener(DEMO_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DEMO_CHANGED_EVENT, onChange);
  }, []);

  const setDemoState = useCallback((next: LicenseVerificationState) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, next);
    setState(next);
    window.dispatchEvent(new Event(DEMO_CHANGED_EVENT));
  }, []);

  return { demoState, setDemoState };
}
