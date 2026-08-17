"use client";

import { useEffect, useState } from "react";
import { InterestPromptModal, type InterestPromptAnswers } from "@/components/onboarding/InterestPromptModal";
import {
  hospitalJobCategoryOptions,
  industryJobCategoryOptions,
  pharmacyJobCategoryOptions,
  researchJobCategoryOptions,
} from "@/config/jobFilters";
import { emptyUserPreference } from "@/data/mockUserPreferences";
import { useInterestPromptSeen } from "@/hooks/useInterestPromptSeen";
import { normalizeRegionIdsForTrack } from "@/hooks/useJobFilters";
import { getAllStoredJobPreferences, setStoredJobPreference } from "@/hooks/useJobPreferenceStorage";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import type { JobTrack } from "@/types/jobs";

/**
 * 관심 조건 온보딩 창을 띄울지 판정하고, 답을 관심조건으로 저장하는 껍데기.
 *
 * 창(InterestPromptModal)은 값을 어디에 저장하는지 모른다 — 판정과 저장을 여기 한 곳에 모아 두고
 * 공고 목록 화면들은 이것 한 줄만 놓는다. 목록 화면이 둘(`/jobs`의 JobsPage와 트랙 랜딩의
 * TrackLandingClient)이라 판정을 각 화면에 적으면 두 벌이 되고, 곧 갈라진다.
 *
 * 미전환 회원은 여기까지 오지 않는다 — MigrationGuard가 개인 영역의 children을 통째로 내리고
 * /migration으로 보내므로 목록 화면 자체가 렌더되지 않는다. 이관이 먼저다.
 */

/** 트랙별 직무 **대분류**. 창이 보여주는 목록과 같은 정본(config/jobFilters)에서 가져온다. */
const CATEGORY_OPTIONS_BY_TRACK: Record<JobTrack, Array<{ id: string }>> = {
  industry: industryJobCategoryOptions,
  research: researchJobCategoryOptions,
  hospital: hospitalJobCategoryOptions,
  pharmacy: pharmacyJobCategoryOptions,
};

/**
 * 대분류 id → 트랙 역인덱스.
 *
 * 창은 직무를 트랙 구분 없이 한 배열로 돌려주는데(onSubmit의 categoryIds), 관심조건은 트랙별로
 * 나뉘어 저장된다. 그 사이를 잇는 것이 이 표다. 대분류 id는 네 트랙 사이에 겹치는 값이 없어
 * id만으로 소속 트랙이 하나로 정해진다(rd·pharmacist·hospital-pharmacist … 전부 유일).
 *
 * useJobFilters의 categoryIdForSubcategory는 트랙을 이미 알고 들어가는 소분류→대분류 조회라
 * 여기 쓸 수 없다. 대분류→트랙 조회는 코드베이스에 없어 새로 만든다.
 */
const TRACK_BY_CATEGORY_ID: Record<string, JobTrack> = Object.fromEntries(
  (Object.keys(CATEGORY_OPTIONS_BY_TRACK) as JobTrack[]).flatMap((track) =>
    CATEGORY_OPTIONS_BY_TRACK[track].map((option) => [option.id, track] as const),
  ),
);

/** 저장 완료 토스트가 떠 있는 시간. 마이페이지 관심조건 저장(MyPagePreferencesClient)과 같은 값이다. */
const TOAST_DURATION_MS = 2400;

export function InterestPromptGate({ onSaved }: { onSaved?: () => void } = {}) {
  const { isLoggedIn } = usePersonalLoginState();
  const { hasSeen, markSeen } = useInterestPromptSeen();
  const [showSavedToast, setShowSavedToast] = useState(false);

  /**
   * 관심조건을 이미 하나라도 저장해 뒀다면 묻지 않는다 — 설정해 본 사람은 리크루트를 이미 써 본
   * 사람이라 "처음 오셨네요"가 어색하다.
   *
   * 기본값을 "있음"에 두는 것은 hasSeen이 "봤음"에서 시작하는 것과 같은 이유다(첫 렌더 깜빡임 방지).
   */
  const [hasPreference, setHasPreference] = useState(true);

  useEffect(() => {
    setHasPreference(Object.keys(getAllStoredJobPreferences()).length > 0);
  }, []);

  const open = isLoggedIn && !hasSeen && !hasPreference;

  /**
   * 고른 직무를 소속 트랙별로 갈라 그 트랙의 관심조건으로 저장한다.
   * 직무를 하나도 고르지 않은 트랙도 빈 값으로 저장한다 — 분야를 골랐다는 사실 자체가 답이다.
   * 경력·지역은 트랙별로 따로 묻지 않았으므로 고른 값 하나를 전 트랙에 같이 넣는다.
   * 학력·급여 등 묻지 않은 나머지는 비워 둔다(emptyUserPreference).
   */
  const handleSubmit = ({ tracks, categoryIds, experienceId, regionIds }: InterestPromptAnswers) => {
    for (const track of tracks) {
      setStoredJobPreference(track, {
        ...emptyUserPreference,
        jobCategoryIds: categoryIds.filter((id) => TRACK_BY_CATEGORY_ID[id] === track),
        experienceId,
        // 약국·병원에는 "해외"가 없다 — 그 트랙에 남으면 화면에 칩이 없어 해제할 수 없는 값이 된다.
        regionIds: normalizeRegionIdsForTrack(track, regionIds),
      });
    }
    // TODO(backend): 온보딩 관심조건 저장 — 백엔드 연결 시 localStorage 대신 서버 저장으로 교체. 경력·지역은 전 트랙 동일 값 복사 정책(A안).

    markSeen();
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), TOAST_DURATION_MS);
    // 저장이 끝난 뒤에 알린다 — 받는 쪽(공고 목록)이 방금 쓴 값을 곧바로 다시 읽는다.
    onSaved?.();
  };

  /**
   * 미리 채울 값은 넘기지 않는다 — 회원의 소속·직무를 담아 둘 개인 회원 정보 저장소가 아직 없다.
   * 가입·재동의 화면(PersonalSignupClient·AffiliationConfirmClient)은 소속을 묻기만 하고 어디에도
   * 저장하지 않으며, myPageUser(config/myPageMenu.ts)는 이름·이메일뿐인 하드코딩 상수다.
   * 저장소가 생기면 여기서 defaultTracks·defaultCategoryIds로 넘기면 된다.
   *
   * 빈 배열을 넘기지 않는 것도 일부러다 — 매 렌더 새 배열이 되어 창 안의 선택이 계속 초기화된다.
   */
  return (
    <>
      <InterestPromptModal open={open} onClose={markSeen} onSubmit={handleSubmit} />
      {/* 마이페이지 관심조건 저장 토스트와 같은 자리·같은 모양 — 같은 일을 알리는 알림이 두 모양이 되지 않게. */}
      {showSavedToast ? (
        <div
          className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]"
          role="status"
          aria-live="polite"
        >
          관심 조건이 저장되었습니다
        </div>
      ) : null}
    </>
  );
}
