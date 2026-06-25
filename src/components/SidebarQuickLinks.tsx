"use client";

import clsx from "clsx";
import { Bookmark, CheckCircle2, Clock3, Filter, Lock, MailCheck, Settings2, X } from "lucide-react";
import Link from "next/link";
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
  track,
  savedCount,
  preference,
  preferenceApplied,
  activeQuickLink,
  onQuickLinkClick,
  onApplyPreference,
  onClearPreferenceFilters,
}: SidebarQuickLinksProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loginGateOpen, setLoginGateOpen] = useState(false);
  const { isLoggedIn, login } = usePersonalLoginState();
  const preferencesHref = `${sharedRoutes.myPagePreferences}?track=${track}`;
  /** 산업·약국처럼 이미 저장된 예시 관심조건이 있는 분야는 그 값을, 없는 분야(연구·병원)는 null을 쓴다. */
  const trackSeed = mockUserPreferences[track] ?? null;
  const savedPreference = preference ?? trackSeed;
  const preferenceSummary = useMemo(() => (savedPreference ? summarizePreference(savedPreference) : null), [savedPreference]);

  const firstButtonLabel = preferenceApplied ? "관심조건 적용중" : "관심조건 적용하기";
  const FirstIcon = preferenceApplied ? CheckCircle2 : Filter;

  const handleFirstClick = () => {
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
      setPopoverOpen(false);
    }
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
            {isLoggedIn && !preferenceApplied && !savedPreference ? (
              <Link
                href={preferencesHref}
                onClick={() => onQuickLinkClick("preference")}
                className="flex h-[46px] w-full items-center justify-center gap-2.5 border border-[#bdbdbd] text-[14px] font-semibold text-brand transition-all hover:bg-[#f3f3f3]"
              >
                <Filter size={19} strokeWidth={2.1} />
                {firstButtonLabel}
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleFirstClick}
                className={clsx(
                  "flex h-[46px] w-full items-center justify-center gap-2.5 border text-[14px] font-semibold transition-all",
                  preferenceApplied
                    ? "border-brand bg-[var(--color-brand-soft)] text-brand"
                    : "border-[#bdbdbd] text-brand hover:bg-[#f3f3f3]",
                  activeQuickLink === "preference" && "ring-2 ring-[rgba(17,17,17,0.12)]",
                )}
              >
                <FirstIcon size={19} strokeWidth={2.1} />
                {firstButtonLabel}
              </button>
            )}

            {popoverOpen ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[var(--radius)] border border-border bg-white p-2 shadow-[0_8px_22px_rgba(20,32,46,0.12)]">
                <Link
                  href={preferencesHref}
                  className="flex h-[36px] w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-[#f5f8fa]"
                >
                  <Settings2 size={15} />
                  관심 조건 수정
                </Link>
                <button
                  type="button"
                  onClick={handleClearPreference}
                  className="flex h-[36px] w-full items-center gap-2 px-3 text-left text-[13px] font-medium text-[#3d4653] hover:bg-[#f5f8fa]"
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
              "flex h-[46px] items-center justify-center gap-2.5 border border-[#dfe4ec] text-[14px] font-semibold text-[#596373] transition-all hover:border-brand hover:bg-[#f5f5f5] hover:text-brand",
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
              "flex h-[46px] items-center justify-center gap-2.5 border border-[#dfe4ec] text-[14px] font-semibold text-[#596373] transition-all hover:border-brand hover:bg-[#f5f5f5] hover:text-brand",
              activeQuickLink === "recent" && "bg-[#f3f3f3] ring-2 ring-[rgba(17,17,17,0.12)]",
            )}
          >
            <Clock3 size={19} strokeWidth={2} />
            최근 본 공고
          </button>
        </div>

        <div className="mt-5 rounded-[var(--radius)] border border-[#eef2f6] bg-[#f8fafb] px-5 py-5">
          {!isLoggedIn ? (
            <>
              <p className="text-[14px] font-semibold leading-[1.55] text-[#3d4653]">
                관심 조건을 설정해두면
                <br />
                원하는 공고만 빠르게 볼 수 있어요.
              </p>
              <button
                type="button"
                onClick={() => setLoginGateOpen(true)}
                className="mt-4 h-[36px] bg-brand px-4 text-[13px] font-medium text-white hover:bg-[var(--color-brand-dark)]"
              >
                관심조건 적용하기
              </button>
              <p className="mt-4 text-[12px] font-normal text-[#8a94a3]">새 공고 이메일 알림도 받을 수 있어요.</p>
            </>
          ) : !savedPreference ? (
            <>
              <p className="text-[13px] font-medium text-[#8791a0]">내 관심 조건</p>
              <p className="mt-2 text-[15px] font-semibold text-[#3d4653]">설정된 조건 없음</p>
              <Link
                href={preferencesHref}
                onClick={() => onQuickLinkClick("preference")}
                className="mt-4 inline-flex h-[36px] items-center bg-brand px-4 text-[13px] font-medium text-white hover:bg-[var(--color-brand-dark)]"
              >
                관심조건 적용하기
              </Link>
              <p className="mt-4 text-[12px] font-normal text-[#8a94a3]">새 공고 이메일 알림도 받을 수 있어요.</p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-medium text-[#8791a0]">내 관심 조건</p>
              <p className="mt-2 text-[17px] font-semibold text-[#252b36]">{preferenceSummary?.jobSummary}</p>
              <p className="mt-1 text-[13px] font-medium leading-[1.5] text-[#687383]">{preferenceSummary?.detailSummary}</p>
              <Link
                href={preferencesHref}
                className="mt-4 inline-flex h-[34px] items-center border border-[#d9e1e8] bg-white px-3 text-[13px] font-medium text-[#46505f] hover:border-brand hover:text-brand"
              >
                관심 조건 수정
              </Link>
              <div className="mt-5 flex items-center gap-2 rounded-[var(--radius)] bg-white px-3 py-2 text-[12px] font-medium text-[#687383]">
                <MailCheck size={17} className="text-brand" />
                {savedPreference.emailAlertEnabled ? "이메일 알림 사용 중" : "새 공고 알림 받기"}
              </div>
            </>
          )}
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
