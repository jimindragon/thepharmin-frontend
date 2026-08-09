"use client";

import clsx from "clsx";
import { Bookmark, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JobCard } from "@/components/JobCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { MyPageEmptyState } from "@/components/mypage/MyPageEmptyState";
import { ScrapedOrganizationCard } from "@/components/mypage/ScrapedOrganizationCard";
import { ScrapUndoToast } from "@/components/mypage/ScrapUndoToast";
import { TrackFilterChips } from "@/components/mypage/TrackFilterChips";
import { jobs } from "@/data/jobs";
import { scrapedJobIds, scrapedOrganizationTypeTrack, scrapedOrganizations } from "@/data/scraps";
import type { Job, JobTrack } from "@/types/jobs";

type ScrapTab = "jobs" | "organizations";
type TrackFilter = "all" | JobTrack;

type PendingRemoval =
  | { type: "job"; id: number; label: string; index: number }
  | { type: "organization"; id: string; label: string; index: number };

/** 전체/산업/연구/병원/약국 — 스크랩한 공고·기관 두 탭이 공유하는 분야 분류 순서 */
const trackFilterOptions: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "industry", label: "산업" },
  { id: "research", label: "연구" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

/** 스크랩 칩 행은 본문 흐름에 놓이므로 바깥 마진을 여기서 준다 (TrackFilterChips는 마진을 갖지 않는다) */
const CHIP_ROW_CLASS = "mt-5 max-[760px]:mt-4";

/** 칩 셸이 요구하는 { key, label, count } 모양으로만 바꾼다 — count 계산은 호출부 useMemo가 그대로 소유 */
function toChipItems(options: { id: TrackFilter; label: string; count: number }[]) {
  return options.map(({ id, label, count }) => ({ key: id, label, count }));
}

function emptyJobCopy(filter: TrackFilter) {
  if (filter === "all") {
    return {
      title: "스크랩한 채용공고가 없습니다.",
      description: "관심 있는 공고를 스크랩해두면 마감 전에 이곳에서 빠르게 다시 확인할 수 있어요.",
    };
  }

  const label = trackFilterOptions.find((option) => option.id === filter)?.label ?? "";
  return {
    title: `${label} 분야에 스크랩한 채용공고가 없습니다.`,
    description: "다른 분야를 선택하거나, 관심 있는 공고를 스크랩해보세요.",
  };
}

function emptyOrganizationCopy(filter: TrackFilter) {
  if (filter === "all") {
    return {
      title: "관심 등록한 기업·기관이 없습니다.",
      description: "관심 있는 기업, 연구기관, 병원, 약국을 저장해두면 새 공고가 올라왔을 때 이곳에서 한눈에 확인할 수 있어요.",
    };
  }

  const label = trackFilterOptions.find((option) => option.id === filter)?.label ?? "";
  return {
    title: `${label} 분야에 관심 등록한 곳이 없습니다.`,
    description: "다른 분야를 선택하거나, 관심 있는 기업·기관을 저장해보세요.",
  };
}

export function MyPageScrapsClient() {
  const [activeTab, setActiveTab] = useState<ScrapTab>("jobs");
  const [jobIds, setJobIds] = useState<number[]>(scrapedJobIds);
  const [orgIds, setOrgIds] = useState<string[]>(scrapedOrganizations.map((organization) => organization.id));
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [jobTrackFilter, setJobTrackFilter] = useState<TrackFilter>("all");
  const [orgTrackFilter, setOrgTrackFilter] = useState<TrackFilter>("all");

  const allScrapedJobs = useMemo(
    () => jobIds.map((id) => jobs.find((job) => job.id === id)).filter((job): job is Job => Boolean(job)),
    [jobIds],
  );

  const allScrapedOrganizations = useMemo(
    () => orgIds.map((id) => scrapedOrganizations.find((organization) => organization.id === id)).filter((item): item is (typeof scrapedOrganizations)[number] => Boolean(item)),
    [orgIds],
  );

  const visibleJobs = useMemo(
    () => (jobTrackFilter === "all" ? allScrapedJobs : allScrapedJobs.filter((job) => job.track === jobTrackFilter)),
    [allScrapedJobs, jobTrackFilter],
  );

  const visibleOrganizations = useMemo(
    () =>
      orgTrackFilter === "all"
        ? allScrapedOrganizations
        : allScrapedOrganizations.filter((organization) => scrapedOrganizationTypeTrack[organization.type] === orgTrackFilter),
    [allScrapedOrganizations, orgTrackFilter],
  );

  const jobFilterOptions = useMemo(
    () =>
      trackFilterOptions.map((option) => ({
        ...option,
        count: option.id === "all" ? allScrapedJobs.length : allScrapedJobs.filter((job) => job.track === option.id).length,
      })),
    [allScrapedJobs],
  );

  const organizationFilterOptions = useMemo(
    () =>
      trackFilterOptions.map((option) => ({
        ...option,
        count:
          option.id === "all"
            ? allScrapedOrganizations.length
            : allScrapedOrganizations.filter((organization) => scrapedOrganizationTypeTrack[organization.type] === option.id).length,
      })),
    [allScrapedOrganizations],
  );

  const tabs: { id: ScrapTab; label: string; count: number }[] = [
    { id: "jobs", label: "스크랩한 공고", count: jobIds.length },
    { id: "organizations", label: "관심 기업·기관", count: orgIds.length },
  ];

  const removeJob = (jobId: number) => {
    const index = jobIds.indexOf(jobId);
    if (index === -1) return;
    const job = jobs.find((item) => item.id === jobId);
    setJobIds((current) => current.filter((id) => id !== jobId));
    setPendingRemoval({ type: "job", id: jobId, label: job ? `${job.company} · ${job.title}` : "공고", index });
  };

  const removeOrganization = (organizationId: string) => {
    const index = orgIds.indexOf(organizationId);
    if (index === -1) return;
    const organization = scrapedOrganizations.find((item) => item.id === organizationId);
    setOrgIds((current) => current.filter((id) => id !== organizationId));
    setPendingRemoval({ type: "organization", id: organizationId, label: organization?.name ?? "기관", index });
  };

  const undoRemoval = () => {
    if (!pendingRemoval) return;

    if (pendingRemoval.type === "job") {
      setJobIds((current) => {
        const next = [...current];
        next.splice(pendingRemoval.index, 0, pendingRemoval.id);
        return next;
      });
    } else {
      setOrgIds((current) => {
        const next = [...current];
        next.splice(pendingRemoval.index, 0, pendingRemoval.id);
        return next;
      });
    }

    setPendingRemoval(null);
  };

  const jobEmptyCopy = emptyJobCopy(jobTrackFilter);
  const organizationEmptyCopy = emptyOrganizationCopy(orgTrackFilter);

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "스크랩" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36] max-[760px]:mt-4 max-[760px]:text-[24px]">스크랩</h1>
      <p className="mt-2.5 max-w-[640px] text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        관심 있는 채용공고와 기관을 모아 보고, 마감 전에 다시 확인하세요.
      </p>

      <div className="mt-7 flex items-center gap-6 border-b border-border max-[760px]:mt-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                // ≤760px pb-4: 탭 높이 37 → 41px로 터치 타깃 확보. 밑줄은 after:-bottom-px라 함께 내려간다.
                "relative flex items-center gap-1.5 pb-3 text-[15px] font-medium transition-colors max-[760px]:pb-4",
                active
                  ? "text-[#111111] after:absolute after:-bottom-px after:left-0 after:h-[2px] after:w-full after:bg-[#111111]"
                  : "text-[#8a94a3] hover:text-[#111111]",
              )}
            >
              {tab.id === "jobs" ? <Bookmark size={15} strokeWidth={1.8} /> : <Building2 size={15} strokeWidth={1.8} />}
              <span>{tab.label}</span>
              <span className={clsx("text-[13px]", active ? "font-bold text-[#111111]" : "font-normal text-[#a0a9b7]")}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "jobs" ? (
        <>
          <TrackFilterChips
            items={toChipItems(jobFilterOptions)}
            activeKey={jobTrackFilter}
            onSelect={setJobTrackFilter}
            className={CHIP_ROW_CLASS}
          />
          <div className="mt-5 max-[760px]:mt-4">
            {visibleJobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked onToggleBookmark={() => removeJob(job.id)} />
                ))}
              </div>
            ) : (
              <MyPageEmptyState title={jobEmptyCopy.title} description={jobEmptyCopy.description} />
            )}
          </div>
        </>
      ) : (
        <>
          <TrackFilterChips
            items={toChipItems(organizationFilterOptions)}
            activeKey={orgTrackFilter}
            onSelect={setOrgTrackFilter}
            className={CHIP_ROW_CLASS}
          />
          <div className="mt-5 max-[760px]:mt-4">
            {visibleOrganizations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleOrganizations.map((organization) => (
                  <ScrapedOrganizationCard key={organization.id} organization={organization} onRemove={removeOrganization} />
                ))}
              </div>
            ) : (
              <MyPageEmptyState title={organizationEmptyCopy.title} description={organizationEmptyCopy.description} />
            )}
          </div>
        </>
      )}

      {/* 공고는 "스크랩", 기관은 "관심" — 등록 지점(/companies 히어로 "관심 기업으로 저장")과 말을 맞춘다 */}
      {pendingRemoval ? (
        <ScrapUndoToast
          message={`${pendingRemoval.label} ${pendingRemoval.type === "organization" ? "관심" : "스크랩"}을 해제했습니다.`}
          onUndo={undoRemoval}
          onDismiss={() => setPendingRemoval(null)}
        />
      ) : null}
    </MyPageShell>
  );
}
