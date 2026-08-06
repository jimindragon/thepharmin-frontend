"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InterestConditionCard } from "@/components/ui/InterestConditionCard";
import { JobUsageTipsCard } from "@/components/ui/JobUsageTipsCard";
import { LoginGateModal } from "@/components/ui/LoginGateModal";
import { sharedRoutes } from "@/config/routes";
import { mockUserPreferences } from "@/data/mockUserPreferences";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import { buildPreferenceChips } from "@/utils/preferenceChips";
import type { JobTrack, UserJobPreference } from "@/types/jobs";

interface SidebarQuickLinksProps {
  /** 관심조건을 읽고 쓸 현재 분야. 관심조건은 이 분야에 한해서만 적용·해제된다. */
  track: JobTrack;
  savedCount: number;
  preference: UserJobPreference | null;
  preferenceApplied: boolean;
  onApplyPreference: (preference: UserJobPreference) => void;
  onClearPreferenceFilters: () => void;
}

export function SidebarQuickLinks({
  track,
  savedCount,
  preference,
  preferenceApplied,
  onApplyPreference,
  onClearPreferenceFilters,
}: SidebarQuickLinksProps) {
  const router = useRouter();
  const [loginGateOpen, setLoginGateOpen] = useState(false);
  const { isLoggedIn, login } = usePersonalLoginState();
  const preferencesHref = `${sharedRoutes.myPagePreferences}?track=${track}`;
  /** 산업·약국처럼 이미 저장된 예시 관심조건이 있는 분야는 그 값을, 없는 분야(연구·병원)는 null을 쓴다. */
  const trackSeed = mockUserPreferences[track] ?? null;
  const savedPreference = preference ?? trackSeed;
  const preferenceChips = useMemo(() => (savedPreference ? buildPreferenceChips(savedPreference) : []), [savedPreference]);
  const hasPreference = isLoggedIn && Boolean(savedPreference);

  const goToPreferences = () => {
    if (!isLoggedIn) {
      setLoginGateOpen(true);
      return;
    }
    router.push(preferencesHref);
  };

  const handleApplyPreference = () => {
    if (savedPreference) {
      onApplyPreference(savedPreference);
    }
  };

  const handleClearPreference = () => {
    onClearPreferenceFilters();
  };

  return (
    <aside className="flex flex-col gap-4">
      <InterestConditionCard
        chips={hasPreference ? preferenceChips : []}
        emptyStateText={
          <>
            관심조건을 설정해두면 원하는 공고만
            <br />
            빠르게 확인할 수 있어요.
          </>
        }
        summaryText="관심조건에 맞는 공고만 빠르게 확인할 수 있어요."
        applied={preferenceApplied}
        primaryCtaLabel={hasPreference ? "관심조건으로 보기" : "관심조건 설정하기"}
        primaryCtaAppliedLabel="관심조건 해제"
        onPrimaryCtaClick={!hasPreference ? goToPreferences : preferenceApplied ? handleClearPreference : handleApplyPreference}
        secondaryActionLabel={hasPreference ? "관심조건 수정" : undefined}
        secondaryActionHref={hasPreference ? preferencesHref : undefined}
      />

      <JobUsageTipsCard
        savedCount={savedCount}
        onSavedClick={() => router.push(sharedRoutes.myPageScraps)}
        onRecentClick={() => router.push(sharedRoutes.myPageRecentJobs)}
        onPreferenceSettingsClick={goToPreferences}
      />

      {loginGateOpen ? (
        <LoginGateModal
          ariaLabel="관심조건 로그인 안내"
          description="관심조건 적용은 회원 기능입니다. 로그인 후 저장된 관심조건을 공고 목록에 바로 적용할 수 있어요."
          onClose={() => setLoginGateOpen(false)}
          onLogin={() => {
            login();
            setLoginGateOpen(false);
          }}
        />
      ) : null}
    </aside>
  );
}
