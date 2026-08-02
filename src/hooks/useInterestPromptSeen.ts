"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 관심 분야 안내 창(InterestPromptModal)을 이미 봤는지 여부.
 *
 * "봤다"의 기준은 저장했는지가 아니라 창을 닫았는지다 — 건너뛴 사람에게 다음 방문마다 다시 묻는
 * 것은 묻지 않은 것만 못하다. 그래서 저장(관심조건)과는 별개 축이고, 관심조건 저장소
 * (thepharmin:job-preferences)에 섞지 않고 별도 키에 둔다 — 계정 전환 여부(useMemberMigration)가
 * 세션과 별도 키를 쓰는 것과 같은 방식이다.
 *
 * 회원 식별자는 두지 않는다 — 프로젝트에 개인 회원 식별자 저장소가 아직 없어, 다른 개인 회원 키
 * (thepharmin:job-preferences 등)와 같이 스코프 없는 단일 값으로 둔다.
 *
 * 같은 탭의 다른 인스턴스에 변경을 알리는 이벤트는 두지 않았다 — useMemberMigration이 그것을 둔 이유는
 * 재동의 화면과 루트 레이아웃의 감시자가 이 값을 동시에 들고 있기 때문인데, 이 값의 소비자는
 * 화면당 InterestPromptGate 하나뿐이라 갈라질 상대가 없다. 필요해지면 그때 같은 방식으로 붙인다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:interest-prompt-seen";

/** 저장되는 유일한 값. 키가 없거나 다른 값이면 아직 안 본 것으로 본다. */
const SEEN_VALUE = "done";

/** 안내 창을 다시 보기 위한 개발용 초기화 쿼리 — ?resetInterestPrompt=true */
const RESET_QUERY_KEY = "resetInterestPrompt";

export interface InterestPromptSeenState {
  hasSeen: boolean;
  /** 봤음 기록 — 저장했을 때도, 건너뛰었을 때도 똑같이 부른다 */
  markSeen: () => void;
  /** 초기화 — 개발 중 안내 창을 다시 확인할 때 쓴다 */
  resetSeen: () => void;
}

export function useInterestPromptSeen(): InterestPromptSeenState {
  /**
   * localStorage는 서버에서 읽을 수 없어 첫 렌더에는 값을 알 수 없다. 그 사이의 기본값은 "봤음"으로
   * 둔다 — 안 본 것으로 시작하면 모든 방문자에게 창이 한 프레임 떴다 사라진다.
   * useMemberMigration이 기본값을 "전환 완료"에, useOrgVerificationStatus가 "approved"에 두고
   * 마운트 후 교정하는 것과 같은 이유다.
   */
  const [hasSeen, setHasSeen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ?resetInterestPrompt=true 는 읽기 직전에 키를 지운다 — ?resetMigration이 놓인 자리와 같다.
    const params = new URLSearchParams(window.location.search);
    if (params.get(RESET_QUERY_KEY) === "true") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setHasSeen(window.localStorage.getItem(STORAGE_KEY) === SEEN_VALUE);
  }, []);

  const markSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, SEEN_VALUE);
    setHasSeen(true);
  }, []);

  const resetSeen = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setHasSeen(false);
  }, []);

  return { hasSeen, markSeen, resetSeen };
}
