"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 기존 더파마뉴스 회원의 "통합 계정 전환(재동의) 완료 여부".
 *
 * 로그인 여부와는 별개 축이라 세션 쿠키(thepharma_personal_session)에 섞지 않고 별도 키에 둔다 —
 * 기업 인증 상태(useOrgVerificationStatus)가 세션과 별도 키를 쓰는 것과 같은 방식이다.
 * 세션 값은 "1" 단일 문자열이고 실제 인증 단계에서 토큰이 들어올 자리로 예약돼 있다.
 *
 * 회원 식별자는 두지 않는다 — 프로젝트에 개인 회원 식별자 저장소가 아직 없어, 다른 개인 회원 키
 * (thepharmin:saved-jobs 등)와 같이 스코프 없는 단일 값으로 둔다. 실제 인증이 붙으면 이 값은
 * 서버가 회원 필드로 내려주게 되고 이 훅은 그 자리로 대체된다.
 */

/** 콜론형 — 개인 회원 데이터 키(thepharmin:job-preferences 등)가 모두 쓰는 규칙을 따른다. */
const STORAGE_KEY = "thepharmin:member-migration";

/** 저장되는 유일한 값. 키가 없거나 다른 값이면 미전환으로 본다. */
const MIGRATED_VALUE = "done";

/** 전환을 마친 뒤 재동의 화면을 다시 보기 위한 개발용 초기화 쿼리 — ?resetMigration=true */
const RESET_QUERY_KEY = "resetMigration";

/**
 * 값이 바뀐 사실을 같은 탭의 다른 인스턴스에 알리는 이벤트.
 *
 * 이 훅은 여러 곳에서 동시에 쓰인다 — 재동의 화면(MigrationClient)이 markMigrated를 부르는 동안
 * 루트 레이아웃의 MigrationGuard도 같은 훅을 들고 있다. 이벤트가 없으면 각자의 useState가 갈라져,
 * 전환을 마치고 클라이언트 이동을 해도 감시자는 여전히 "미전환"으로 알고 되돌려보낸다.
 * storage 이벤트는 같은 탭에서 발생하지 않아 대체 수단이 되지 못한다 —
 * useNotificationReadState가 이미 쓰는 방식과 같은 패턴이다.
 *
 * 판정 자체(키·값·기본값·비교 방식)는 바뀌지 않는다. 알림 경로만 붙는다.
 */
const MIGRATION_CHANGED_EVENT = "thepharmin:member-migration-changed";

function notifyMigrationChanged() {
  window.dispatchEvent(new Event(MIGRATION_CHANGED_EVENT));
}

export interface MemberMigrationState {
  isMigrated: boolean;
  /** 전환 완료 기록 */
  markMigrated: () => void;
  /** 초기화 — 개발 중 재동의 화면을 다시 확인할 때 쓴다 */
  resetMigration: () => void;
}

export function useMemberMigration(): MemberMigrationState {
  /**
   * localStorage는 서버에서 읽을 수 없어 첫 렌더에는 값을 알 수 없다. 그 사이의 기본값은
   * "전환 완료"로 둔다 — 재동의 화면이 모든 방문자에게 한 프레임 떴다 사라지는 편보다,
   * 미전환자에게 한 프레임 늦게 뜨는 편이 낫다. useOrgVerificationStatus가 기본값을 잠기지 않는
   * 쪽("approved")에 두고 마운트 후 교정하는 것과 같은 이유다.
   * 저장소 기준의 판정("키가 없으면 미전환")은 아래 useEffect가 마운트 직후에 확정한다.
   */
  const [isMigrated, setIsMigrated] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ?resetMigration=true 는 읽기 직전에 키를 지운다 — ?orgStatus가 읽기 전에 값을 써 두는 것과 같은 자리다.
    const params = new URLSearchParams(window.location.search);
    if (params.get(RESET_QUERY_KEY) === "true") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setIsMigrated(window.localStorage.getItem(STORAGE_KEY) === MIGRATED_VALUE);
  }, []);

  // 다른 인스턴스가 바꾼 값을 따라잡는다.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleChanged = () => setIsMigrated(window.localStorage.getItem(STORAGE_KEY) === MIGRATED_VALUE);
    window.addEventListener(MIGRATION_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(MIGRATION_CHANGED_EVENT, handleChanged);
  }, []);

  const markMigrated = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, MIGRATED_VALUE);
    setIsMigrated(true);
    notifyMigrationChanged();
  }, []);

  const resetMigration = useCallback(() => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    setIsMigrated(false);
    notifyMigrationChanged();
  }, []);

  return { isMigrated, markMigrated, resetMigration };
}
