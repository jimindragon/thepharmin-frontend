"use client";

import { Lock, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { InterestConditionCard } from "@/components/ui/InterestConditionCard";
import { JobUsageTipsCard } from "@/components/ui/JobUsageTipsCard";
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

/** 비로그인 상태에서 "관심조건 적용하기"를 눌렀을 때 보여주는 안내. 실제 로그인 라우트가 없어
 * 캘린더 페이지(`RecruitmentCalendarClient`)와 동일하게 로컬 상태만 로그인 상태로 되돌린다. */
function PreferenceLoginGateModal({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5" role="dialog" aria-modal="true">
      <div className="w-full max-w-[420px] border border-[#20242b] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="grid h-10 w-10 place-items-center bg-[#111111] text-white">
              <Lock size={18} />
            </div>
            <h2 className="mt-5 text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#171b20]">로그인이 필요합니다</h2>
            <p className="mt-3 text-[13px] font-medium leading-6 text-[#7a8490]">
              관심조건 적용은 회원 기능입니다. 로그인 후 저장된 관심조건을 공고 목록에 바로 적용할 수 있어요.
            </p>
          </div>
          <button type="button" className="grid h-8 w-8 place-items-center hover:bg-[#f2f3f5]" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
          <button type="button" className="h-11 bg-[#111111] px-5 text-[13px] font-medium text-white" onClick={onLogin}>
            로그인하고 보기
          </button>
          <button type="button" className="h-11 border border-[#d9dee5] px-5 text-[13px] font-medium text-[#4b5563]" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
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
        <PreferenceLoginGateModal
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
