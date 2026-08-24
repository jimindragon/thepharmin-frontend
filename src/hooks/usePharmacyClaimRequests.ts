"use client";

import { useEffect, useState } from "react";

/**
 * 약국 단위 서비스 상태. 등록부(원천정보)와 분리. 실서비스에서는 서버 상태로 교체.
 *
 * 등록부(pharmacyRegistry)는 심평원이 내려주는 사실만 든다 — 누가 인증을 신청했는지는 그쪽에 없는,
 * 이 서비스가 스스로 만든 상태다. 그래서 등록부 항목에 필드를 얹지 않고 여기 따로 쌓는다.
 *
 * 계정 단위 데모 상태(usePharmacyClaimDemo)와도 다른 축이다. 그쪽은 "이 계정이 어느 약국의 주인인가",
 * 이쪽은 "이 약국에 신청이 들어와 있는가"다 — 약국 상세는 로그인하지 않은 사람에게도 열리므로
 * 계정 축으로는 그 화면의 안내를 가릴 수 없다.
 *
 * 지금 담기는 상태는 "검토 중"(pending) 하나다. 승인·반려는 이 목업이 흉내 낼 수 있는 절차가 아니라
 * 넣지 않는다 — 승인되면 그 약국은 companies.ts로 올라가고 claimStatus가 "claimed"가 된다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:pharmacy-claim-requests";

/** 같은 탭의 두 화면(게이트·상세)이 값을 나눠 갖고 있어, 이벤트가 없으면 각자의 useState가 갈라진다. */
const CHANGED_EVENT = "thepharmin:pharmacy-claim-requests-changed";

export interface PharmacyClaimRequest {
  status: "pending";
  /** 신청 시각(ISO). 화면에 찍지는 않지만, 검토 대기가 길어지는 것을 나중에 볼 수 있게 남긴다 */
  requestedAt: string;
}

type ClaimRequestMap = Record<string, PharmacyClaimRequest>;

/** 화면이 보는 상태. "loading"은 저장소를 아직 읽지 못한 순간이다 — 서버 렌더와 마운트 직전이 여기다 */
export type PharmacyClaimRequestState = "loading" | "pending" | "none";

function readAll(): ClaimRequestMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    // 배열·문자열 같은 다른 모양이 들어 있으면 읽을 것이 없다
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ClaimRequestMap;
  } catch {
    // 깨진 문자열은 덮어쓰지 않고 그대로 둔다 — 되살릴 수 있는 값인지 여기서는 알 수 없다.
    return {};
  }
}

export function getClaimRequest(registryId: string): PharmacyClaimRequest | undefined {
  return readAll()[registryId];
}

export function setClaimRequestPending(registryId: string) {
  if (typeof window === "undefined") return;
  const next: ClaimRequestMap = { ...readAll(), [registryId]: { status: "pending", requestedAt: new Date().toISOString() } };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/**
 * 한 약국의 신청 상태.
 *
 * 첫 값이 "none"이 아니라 "loading"인 것은 이 훅을 쓰는 자리가 **버튼**이기 때문이다 — 기본값을
 * "none"으로 두면 신청을 이미 넣은 사람에게도 "약국 인증하기"가 한 프레임 떴다가 사라진다.
 * 그 한 프레임은 누를 수 있는 시간이고, 누르면 이미 낸 신청을 다시 내러 가게 된다.
 */
export function usePharmacyClaimRequest(registryId: string): { state: PharmacyClaimRequestState } {
  const [state, setState] = useState<PharmacyClaimRequestState>("loading");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sync = () => setState(getClaimRequest(registryId) ? "pending" : "none");
    sync();

    window.addEventListener(CHANGED_EVENT, sync);
    return () => window.removeEventListener(CHANGED_EVENT, sync);
  }, [registryId]);

  return { state };
}
