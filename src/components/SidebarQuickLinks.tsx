"use client";

import clsx from "clsx";
import { Bookmark, CheckCircle2, Clock3, Filter, MailCheck, Settings2 } from "lucide-react";
import { useMemo, useState } from "react";
import { optionLabelMaps } from "@/config/jobFilters/index";
import { mockUserPreferences } from "@/data/mockUserPreferences";
import type { UserJobPreference } from "@/types/jobs";

interface SidebarQuickLinksProps {
  savedCount: number;
  preference: UserJobPreference | null;
  preferenceApplied: boolean;
  activeQuickLink: string;
  onQuickLinkClick: (key: string) => void;
  onSetPreference: (preference: UserJobPreference | null) => void;
  onApplyPreference: () => void;
  onClearPreferenceFilters: () => void;
}

function summarizePreference(preference: UserJobPreference) {
  const jobLabels = preference.jobSubcategoryIds
    .map((id) => optionLabelMaps.jobSubcategory.get(id))
    .filter(Boolean) as string[];
  const firstJob = jobLabels[0] ?? "관심 직무";
  const jobSummary = jobLabels.length > 1 ? `${firstJob} 외 ${jobLabels.length - 1}개` : firstJob;
  const details = [
    preference.experienceId ? optionLabelMaps.experience.get(preference.experienceId) : null,
    ...preference.regionIds.map((id) => optionLabelMaps.region.get(id)),
  ].filter(Boolean);

  return {
    jobSummary,
    detailSummary: details.join(" · "),
  };
}

export function SidebarQuickLinks({
  savedCount,
  preference,
  preferenceApplied,
  activeQuickLink,
  onQuickLinkClick,
  onSetPreference,
  onApplyPreference,
  onClearPreferenceFilters,
}: SidebarQuickLinksProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const preferenceSummary = useMemo(() => (preference ? summarizePreference(preference) : null), [preference]);

  const firstButtonLabel = !preference
    ? "관심 조건 설정"
    : preferenceApplied
      ? "관심 조건 적용 중"
      : "내 관심 조건 적용";
  const FirstIcon = preferenceApplied ? CheckCircle2 : Filter;

  const handleFirstClick = () => {
    onQuickLinkClick("preference");

    if (!preference) {
      onSetPreference(mockUserPreferences.configured);
      setPopoverOpen(false);
      return;
    }

    if (preferenceApplied) {
      setPopoverOpen((current) => !current);
      return;
    }

    onApplyPreference();
    setPopoverOpen(false);
  };

  const handleEditPreference = () => {
    onSetPreference(mockUserPreferences.configured);
    setPopoverOpen(false);
  };

  const handleClearPreference = () => {
    onClearPreferenceFilters();
    setPopoverOpen(false);
  };

  return (
    <aside className="sticky top-5">
      <div className="surface p-5">
        <div className="flex flex-col gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={handleFirstClick}
              className={clsx(
                "flex h-[46px] w-full items-center justify-center gap-2.5 rounded-[var(--radius)] border text-[14px] font-extrabold transition-all",
                preferenceApplied
                  ? "border-brand bg-[var(--color-brand-soft)] text-brand"
                  : "border-[#bdbdbd] text-brand hover:bg-[#f3f3f3]",
                activeQuickLink === "preference" && "ring-2 ring-[rgba(17,17,17,0.12)]",
              )}
            >
              <FirstIcon size={19} strokeWidth={2.1} />
              {firstButtonLabel}
            </button>

            {popoverOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[var(--radius)] border border-border bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]">
                <button
                  type="button"
                  onClick={handleEditPreference}
                  className="flex h-[36px] w-full items-center gap-2 rounded-[var(--radius)] px-3 text-left text-[13px] font-bold text-[#3d4653] hover:bg-[#f5f8fa]"
                >
                  <Settings2 size={15} />
                  관심 조건 수정
                </button>
                <button
                  type="button"
                  onClick={handleClearPreference}
                  className="flex h-[36px] w-full items-center gap-2 rounded-[var(--radius)] px-3 text-left text-[13px] font-bold text-[#3d4653] hover:bg-[#f5f8fa]"
                >
                  <Filter size={15} />
                  관심 조건 해제
                </button>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onQuickLinkClick("saved")}
            className={clsx(
              "flex h-[46px] items-center justify-center gap-2.5 rounded-[var(--radius)] border border-[#dfe4ec] text-[14px] font-extrabold text-[#596373] transition-all hover:border-brand hover:bg-[#f5f5f5] hover:text-brand",
              activeQuickLink === "saved" && "bg-[#f3f3f3] ring-2 ring-[rgba(17,17,17,0.12)]",
            )}
          >
            <Bookmark size={19} strokeWidth={2} />
            저장한 공고 {savedCount}
          </button>

          <button
            type="button"
            onClick={() => onQuickLinkClick("recent")}
            className={clsx(
              "flex h-[46px] items-center justify-center gap-2.5 rounded-[var(--radius)] border border-[#dfe4ec] text-[14px] font-extrabold text-[#596373] transition-all hover:border-brand hover:bg-[#f5f5f5] hover:text-brand",
              activeQuickLink === "recent" && "bg-[#f3f3f3] ring-2 ring-[rgba(17,17,17,0.12)]",
            )}
          >
            <Clock3 size={19} strokeWidth={2} />
            최근 본 공고
          </button>
        </div>

        <div className="mt-5 rounded-[var(--radius)] border border-[#eef2f6] bg-[#f8fafb] px-5 py-5">
          {!preference ? (
            <>
              <p className="text-[14px] font-extrabold leading-[1.55] text-[#3d4653]">
                관심 조건을 설정해두면
                <br />
                원하는 공고만 빠르게 볼 수 있어요.
              </p>
              <button
                type="button"
                onClick={() => onSetPreference(mockUserPreferences.configured)}
                className="mt-4 h-[36px] rounded-[var(--radius)] bg-brand px-4 text-[13px] font-bold text-white hover:bg-[var(--color-brand-dark)]"
              >
                관심 조건 설정하기
              </button>
              <p className="mt-4 text-[12px] font-semibold text-[#8a94a3]">새 공고 이메일 알림도 받을 수 있어요.</p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-bold text-[#8791a0]">내 관심 조건</p>
              <p className="mt-2 text-[17px] font-extrabold text-[#252b36]">{preferenceSummary?.jobSummary}</p>
              <p className="mt-1 text-[13px] font-bold leading-[1.5] text-[#687383]">{preferenceSummary?.detailSummary}</p>
              <button
                type="button"
                onClick={handleEditPreference}
                className="mt-4 h-[34px] rounded-[var(--radius)] border border-[#d9e1e8] bg-white px-3 text-[13px] font-bold text-[#46505f] hover:border-brand hover:text-brand"
              >
                관심 조건 수정
              </button>
              <div className="mt-5 flex items-center gap-2 rounded-[var(--radius)] bg-white px-3 py-2 text-[12px] font-bold text-[#687383]">
                <MailCheck size={17} className="text-brand" />
                {preference.emailAlertEnabled ? "이메일 알림 사용 중" : "새 공고 알림 받기"}
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
