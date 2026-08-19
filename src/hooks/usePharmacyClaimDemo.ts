"use client";

import { useEffect, useState } from "react";

/**
 * 약국 계정이 "우리 약국"을 인증(claim)했는지의 데모 상태.
 *
 * 기업 인증(useOrgVerificationStatus)과 다른 축이다. 그쪽은 사업자등록증명원으로 회사가 실재하는지를
 * 보는 절차이고, 이쪽은 그 계정이 **어느 약국의** 주인인지를 잇는 절차다 — 후기 관리는 회사가
 * 실재하는지가 아니라 어느 약국의 후기를 보여줄지가 정해져야 성립한다.
 *
 * 구조·키 규칙·이벤트는 useLicenseVerificationDemo·useReviewAccessDemo를 그대로 따른다.
 * 값이 없으면 인증 완료로 본다 — 기업 인증과 달리 이 축은 아직 신청 파이프라인이 없어, 패널을 만지지
 * 않은 방문자에게 기본값이 게이트면 화면 자체를 볼 수 없다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:pharmacy-claim-demo";

/** 같은 탭의 패널과 화면이 값을 나눠 갖고 있어, 이벤트가 없으면 각자의 useState가 갈라진다. */
const DEMO_CHANGED_EVENT = "thepharmin:pharmacy-claim-demo-changed";

export type PharmacyClaimState = "claimed" | "unclaimed";

function isValidState(value: string | null): value is PharmacyClaimState {
  return value === "claimed" || value === "unclaimed";
}

function readStoredState(): PharmacyClaimState {
  if (typeof window === "undefined") return "claimed";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isValidState(raw) ? raw : "claimed";
}

export function setPharmacyClaimState(next: PharmacyClaimState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, next);
  window.dispatchEvent(new Event(DEMO_CHANGED_EVENT));
}

export function usePharmacyClaimState(): PharmacyClaimState {
  /**
   * 서버에서는 저장소를 읽을 수 없어 첫 렌더의 값은 "claimed"다 — 잠기지 않은 쪽을 기본값으로 두고
   * 마운트 직후 교정한다(다른 데모 훅과 같은 자리). 게이트를 기본값으로 두면 서버 HTML과
   * 클라이언트 첫 프레임이 어긋나면서 화면이 한 번 깜빡인다.
   */
  const [state, setState] = useState<PharmacyClaimState>("claimed");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setState(readStoredState());

    const onChange = () => setState(readStoredState());
    window.addEventListener(DEMO_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(DEMO_CHANGED_EVENT, onChange);
  }, []);

  return state;
}
