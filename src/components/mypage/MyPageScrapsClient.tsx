"use client";

import clsx from "clsx";
import { Bookmark, Building2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JobCard } from "@/components/JobCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { ScrapedOrganizationCard } from "@/components/mypage/ScrapedOrganizationCard";
import { ScrapUndoToast } from "@/components/mypage/ScrapUndoToast";
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-[#dfe4ea] bg-white p-10 text-center">
      <p className="text-[14px] font-medium text-[#303946]">{title}</p>
      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">{description}</p>
    </div>
  );
}

/** 기존 사이트의 트랙 탭(CategoryTabs) 선택/비선택 색상을 그대로 따르는 분야 필터 칩 + 개수 배지 */
function TrackFilterTabs({
  options,
  activeId,
  onChange,
}: {
  options: { id: TrackFilter; label: string; count: number }[];
  activeId: TrackFilter;
  onChange: (id: TrackFilter) => void;
}) {
  return (
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={clsx(
              "inline-flex h-9 shrink-0 items-center gap-1.5 border px-4 text-[13px] font-medium transition-colors",
              active
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#dddddd] bg-[#f4f4f4] text-[#555555] hover:border-[#bdbdbd] hover:bg-[#eeeeee] hover:text-[#111111]",
            )}
          >
            {option.label}
            <span
              className={clsx(
                "inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-[1px] text-[11px]",
                active ? "bg-white/20 text-white" : "bg-white text-[#8a93a1]",
              )}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </div>
  );
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
      title: "스크랩한 기관이 없습니다.",
      description: "관심 있는 기업, 연구기관, 병원, 약국을 스크랩해두면 새 공고가 올라왔을 때 이곳에서 한눈에 확인할 수 있어요.",
    };
  }

  const label = trackFilterOptions.find((option) => option.id === filter)?.label ?? "";
  return {
    title: `${label} 분야에 스크랩한 기관이 없습니다.`,
    description: "다른 분야를 선택하거나, 관심 있는 기관을 스크랩해보세요.",
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
    { id: "organizations", label: "스크랩한 기관", count: orgIds.length },
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

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">스크랩</h1>
      <p className="mt-2.5 max-w-[640px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        관심 있는 채용공고와 기관을 모아 보고, 마감 전에 다시 확인하세요.
      </p>

      <div className="mt-7 grid grid-cols-2 gap-0 overflow-hidden border border-[#e0e5eb] bg-white p-1.5 max-[560px]:grid-cols-1 max-[560px]:gap-1.5">
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
                "flex h-[48px] items-center justify-center gap-2 text-[15px] font-medium transition",
                active ? "bg-[#1b1f25] text-white shadow-[0_10px_22px_rgba(17,17,17,0.16)]" : "bg-white text-[#4b535f] hover:bg-[#f6f7f8]",
              )}
            >
              {tab.id === "jobs" ? <Bookmark size={16} strokeWidth={1.8} /> : <Building2 size={16} strokeWidth={1.8} />}
              <span>{tab.label}</span>
              <span
                className={clsx(
                  "inline-flex min-w-[24px] items-center justify-center rounded-full px-1.5 py-[2px] text-[12px]",
                  active ? "bg-white/18 text-white" : "bg-[#edf0f3] text-[#8a93a1]",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === "jobs" ? (
        <>
          <TrackFilterTabs options={jobFilterOptions} activeId={jobTrackFilter} onChange={setJobTrackFilter} />
          <div className="mt-5">
            {visibleJobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked onToggleBookmark={() => removeJob(job.id)} isScrapContext />
                ))}
              </div>
            ) : (
              <EmptyState title={jobEmptyCopy.title} description={jobEmptyCopy.description} />
            )}
          </div>
        </>
      ) : (
        <>
          <TrackFilterTabs options={organizationFilterOptions} activeId={orgTrackFilter} onChange={setOrgTrackFilter} />
          <div className="mt-5">
            {visibleOrganizations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleOrganizations.map((organization) => (
                  <ScrapedOrganizationCard key={organization.id} organization={organization} onRemove={removeOrganization} />
                ))}
              </div>
            ) : (
              <EmptyState title={organizationEmptyCopy.title} description={organizationEmptyCopy.description} />
            )}
          </div>
        </>
      )}

      {pendingRemoval ? (
        <ScrapUndoToast
          message={`${pendingRemoval.label} 스크랩을 해제했습니다.`}
          onUndo={undoRemoval}
          onDismiss={() => setPendingRemoval(null)}
        />
      ) : null}
    </MyPageShell>
  );
}
