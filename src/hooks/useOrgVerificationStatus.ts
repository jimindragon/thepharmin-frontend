"use client";

import { useEffect, useState } from "react";
import type { CompanyVerificationStatus } from "@/data/businessCompanyProfile";

const STORAGE_KEY = "thepharmin_org_verification_status";

function isValidStatus(value: string | null): value is CompanyVerificationStatus {
  return value === "pending" || value === "approved";
}

/**
 * 인증 상태를 직접 쓴다 — DEV 상태 전환 패널이 쓰는 진입점이다.
 *
 * 훅 반환값이 필드 없는 문자열 하나라 setter를 얹을 자리가 없어, 훅 바깥의 모듈 함수로 둔다 —
 * useBusinessMember의 markBusinessMember/clearBusinessMember와 같은 형태다.
 * 읽는 쪽(사이드바·헤더·대시보드)이 모두 마운트 때 한 번만 읽으므로 화면 갱신은 호출부가 책임진다.
 */
export function setOrgVerificationStatus(status: CompanyVerificationStatus) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, status);
}

export function useOrgVerificationStatus(): CompanyVerificationStatus {
  const [status, setStatus] = useState<CompanyVerificationStatus>("approved");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const orgStatus = params.get("orgStatus");
    if (isValidStatus(orgStatus)) {
      window.localStorage.setItem(STORAGE_KEY, orgStatus);
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    setStatus(isValidStatus(stored) ? stored : "approved");
  }, []);

  return status;
}
