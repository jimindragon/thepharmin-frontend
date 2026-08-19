"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 약사 인증 안내 창(PharmacistLicenseNoticeModal)을 이미 봤는지 여부.
 *
 * "봤다"의 기준은 창을 닫았는지다 — 한 번 읽고 닫은 안내를 방문마다 다시 띄우면 안내가 아니라
 * 방해가 된다. 면허를 실제로 등록했는지와는 별개 축이다(등록하면 인증 회원이 되어 애초에 뜨지 않는다).
 *
 * 키는 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences, thepharmin:interest-prompt-seen)가
 * 모두 쓰는 규칙을 따른다. 구조도 useInterestPromptSeen과 같다.
 *
 * 회원 식별자는 두지 않는다 — 프로젝트에 개인 회원 식별자 저장소가 아직 없어, 다른 개인 회원 키와
 * 같이 스코프 없는 단일 값으로 둔다.
 */

const STORAGE_KEY = "thepharmin:pharmacist-notice-seen";

/** 저장되는 유일한 값. 키가 없거나 다른 값이면 아직 안 본 것으로 본다. */
const SEEN_VALUE = "done";

export interface PharmacistNoticeSeenState {
  hasSeen: boolean;
  /** 봤음 기록 — 닫기·바깥 클릭·Escape 어느 쪽으로 닫혔든 똑같이 부른다 */
  markSeen: () => void;
}

export function usePharmacistNoticeSeen(): PharmacistNoticeSeenState {
  /**
   * localStorage는 서버에서 읽을 수 없어 첫 렌더에는 값을 알 수 없다. 그 사이의 기본값은 "봤음"으로
   * 둔다 — 안 본 것으로 시작하면 이미 닫아 본 회원에게도 창이 한 프레임 떴다 사라진다.
   * useInterestPromptSeen이 기본값을 "봤음"에 두고 마운트 후 교정하는 것과 같은 이유다.
   */
  const [hasSeen, setHasSeen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHasSeen(window.localStorage.getItem(STORAGE_KEY) === SEEN_VALUE);
  }, []);

  const markSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, SEEN_VALUE);
    setHasSeen(true);
  }, []);

  return { hasSeen, markSeen };
}
