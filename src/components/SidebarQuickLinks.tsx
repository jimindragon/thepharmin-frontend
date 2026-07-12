"use client";

import { Bookmark, Clock3, Info, Lightbulb, Lock, LucideIcon, Settings2, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { optionLabelMaps } from "@/config/jobFilters/index";
import { sharedRoutes } from "@/config/routes";
import { mockUserPreferences } from "@/data/mockUserPreferences";
import { usePersonalLoginState } from "@/hooks/usePersonalLoginState";
import type { JobTrack, UserJobPreference } from "@/types/jobs";

interface SidebarQuickLinksProps {
  /** 관심조건을 읽고 쓸 현재 분야. 관심조건은 이 분야에 한해서만 적용·해제된다. */
  track: JobTrack;
  savedCount: number;
  preference: UserJobPreference | null;
  preferenceApplied: boolean;
  activeQuickLink: string;
  onQuickLinkClick: (key: string) => void;
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

/** 저장된 관심조건의 각 필드를 칩으로 나열하기 위한 라벨 목록. 순서는 직무 > 지역 > 근무 조건 > 그 외. */
function buildPreferenceChips(preference: UserJobPreference): string[] {
  const groups: Array<[string[], string]> = [
    [preference.jobSubcategoryIds, "jobSubcategory"],
    [preference.regionIds, "region"],
    [preference.experienceId ? [preference.experienceId] : [], "experience"],
    [preference.educationId ? [preference.educationId] : [], "education"],
    [preference.employmentTypeIds, "employmentType"],
    [preference.workTypeIds, "workType"],
    [preference.workModeIds, "workMode"],
    [preference.scheduleIds, "schedule"],
    [preference.hospitalTypeIds, "hospitalType"],
    [preference.shiftTypeIds, "shiftType"],
    [preference.contractPeriodIds, "contractPeriod"],
    [preference.salaryId ? [preference.salaryId] : [], "salary"],
    [preference.hourlyPayRangeId ? [preference.hourlyPayRangeId] : [], "hourlyPay"],
    [preference.companyTypeIds, "companyType"],
    [preference.institutionTypeIds, "institutionType"],
    [preference.pharmacyFeatureIds, "pharmacyFeature"],
  ];

  return groups.flatMap(([ids, mapKey]) =>
    ids.map((id) => optionLabelMaps[mapKey]?.get(id)).filter((label): label is string => Boolean(label)),
  );
}

function TipRow({
  icon: Icon,
  title,
  badge,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  badge?: number;
  description: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-start gap-3 py-4 text-left transition hover:bg-gray-50">
      <Icon size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-gray-700" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[#171b20]">{title}</span>
          {badge != null ? <span className="text-[12px] font-medium text-gray-400">{badge}</span> : null}
        </span>
        <span className="mt-1 block text-[13px] leading-[1.5] text-gray-500">{description}</span>
      </span>
    </button>
  );
}

export function SidebarQuickLinks({
  track,
  savedCount,
  preference,
  preferenceApplied,
  activeQuickLink,
  onQuickLinkClick,
  onApplyPreference,
  onClearPreferenceFilters,
}: SidebarQuickLinksProps) {
  const router = useRouter();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loginGateOpen, setLoginGateOpen] = useState(false);
  const { isLoggedIn, login } = usePersonalLoginState();
  const preferencesHref = `${sharedRoutes.myPagePreferences}?track=${track}`;
  /** 산업·약국처럼 이미 저장된 예시 관심조건이 있는 분야는 그 값을, 없는 분야(연구·병원)는 null을 쓴다. */
  const trackSeed = mockUserPreferences[track] ?? null;
  const savedPreference = preference ?? trackSeed;
  const preferenceChips = useMemo(() => (savedPreference ? buildPreferenceChips(savedPreference) : []), [savedPreference]);
  const hasPreference = isLoggedIn && Boolean(savedPreference);

  const goToPreferences = () => {
    onQuickLinkClick("preference");
    setPopoverOpen(false);
    if (!isLoggedIn) {
      setLoginGateOpen(true);
      return;
    }
    router.push(preferencesHref);
  };

  const handlePrimaryClick = () => {
    if (!isLoggedIn) {
      setLoginGateOpen(true);
      return;
    }

    onQuickLinkClick("preference");

    if (preferenceApplied) {
      setPopoverOpen((current) => !current);
      return;
    }

    if (savedPreference) {
      onApplyPreference(savedPreference);
    }
  };

  const handleClearPreference = () => {
    onClearPreferenceFilters();
    setPopoverOpen(false);
  };

  return (
    <aside className="flex flex-col gap-4">
      <div className="border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={17} strokeWidth={2} className="text-gray-700" />
            <h3 className="text-[15px] font-semibold text-[#171b20]">내 관심조건</h3>
          </div>
          <Info size={15} className="text-gray-400" />
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          {hasPreference ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {preferenceChips.map((label, index) => (
                  <span key={`${label}-${index}`} className="bg-gray-100 px-2.5 py-1 text-[13px] leading-[1.4] text-[#3d4653]">
                    {label}
                  </span>
                ))}
              </div>

              <div className="relative mt-4">
                <button
                  type="button"
                  onClick={handlePrimaryClick}
                  className="h-11 w-full text-[14px] font-semibold text-white transition hover:brightness-95"
                  style={{ backgroundImage: "var(--gradient-cta)" }}
                >
                  관심조건으로 보기
                </button>

                {popoverOpen ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 border border-gray-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={handleClearPreference}
                      className="flex h-9 w-full items-center px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-gray-50"
                    >
                      관심조건 해제
                    </button>
                  </div>
                ) : null}
              </div>

              <Link
                href={preferencesHref}
                onClick={() => onQuickLinkClick("preference")}
                className="mt-2 flex h-11 w-full items-center justify-center border border-gray-300 text-[14px] font-semibold text-[#171b20] hover:bg-gray-50"
              >
                관심조건 수정
              </Link>

              <p className="mt-4 text-[13px] text-gray-500">관심조건에 맞는 공고만 빠르게 확인할 수 있어요.</p>
            </>
          ) : (
            <>
              <p className="text-[13px] leading-[1.6] text-gray-500">
                관심조건을 설정해두면 원하는 공고만
                <br />
                빠르게 확인할 수 있어요.
              </p>
              <button
                type="button"
                onClick={goToPreferences}
                className="mt-4 h-11 w-full text-[14px] font-semibold text-white transition hover:brightness-95"
                style={{ backgroundImage: "var(--gradient-cta)" }}
              >
                관심조건 설정하기
              </button>
            </>
          )}
        </div>
      </div>

      <div className="border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Lightbulb size={17} strokeWidth={2} className="text-gray-700" />
          <h3 className="text-[15px] font-semibold text-[#171b20]">공고 활용 팁</h3>
        </div>

        <div className="mt-4 divide-y divide-gray-200 border-t border-gray-200">
          <TipRow
            icon={Bookmark}
            title="저장한 공고"
            badge={savedCount}
            description="관심 있는 공고를 저장하고 나중에 다시 확인할 수 있어요."
            onClick={() => onQuickLinkClick("saved")}
          />
          <TipRow
            icon={Clock3}
            title="최근 본 공고"
            description="최근 확인한 공고를 빠르게 다시 볼 수 있어요."
            onClick={() => onQuickLinkClick("recent")}
          />
          <TipRow
            icon={Settings2}
            title="관심조건 설정"
            description="원하는 조건을 저장하면 맞춤 공고를 빠르게 볼 수 있어요."
            onClick={goToPreferences}
          />
        </div>
      </div>

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
