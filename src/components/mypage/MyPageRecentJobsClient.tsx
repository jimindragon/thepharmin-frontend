"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JobCard } from "@/components/JobCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { LinkButton } from "@/components/ui/Button";
import { readSavedJobs, writeSavedJobs } from "@/components/job-detail/shared";
import { jobs } from "@/data/jobs";
import { useRecentJobs } from "@/hooks/useRecentJobs";
import type { Job, JobTrack } from "@/types/jobs";

type TrackFilter = "all" | JobTrack;

/** 스크랩 페이지의 분야 필터와 동일한 순서·라벨 */
const trackFilterOptions: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "industry", label: "산업" },
  { id: "research", label: "연구" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-border bg-white p-10 text-center">
      <p className="text-[15px] font-medium text-[#303946]">{title}</p>
      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">{description}</p>
      <LinkButton href="/jobs" variant="secondary" size="sm" className="mt-5">
        공고 둘러보기
      </LinkButton>
    </div>
  );
}

/** 스크랩 페이지의 TrackFilterTabs 문법을 그대로 복제한 분야 필터 칩 + 개수 배지 */
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
    <div className="flex gap-2 overflow-x-auto pb-1">
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
                "inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-[1px] text-[12px] font-medium",
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

function emptyFilteredCopy(filter: TrackFilter) {
  if (filter === "all") {
    return {
      title: "최근 본 공고가 없습니다.",
      description: "공고를 열람하면 이곳에 순서대로 표시됩니다.",
    };
  }

  const label = trackFilterOptions.find((option) => option.id === filter)?.label ?? "";
  return {
    title: `${label} 분야에 최근 본 공고가 없습니다.`,
    description: "다른 분야를 선택하거나, 관심 있는 공고를 열람해보세요.",
  };
}

/** scraps 페이지와 동일한 목록 레이아웃·간격·트랙 필터 문법을 따르되 공고/기업 2분할 탭 없이 최신 열람순 공고만 보여준다. */
export function MyPageRecentJobsClient() {
  const { entries, clear } = useRecentJobs();
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("all");

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const toggleSave = (jobId: number) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      writeSavedJobs(next);
      return next;
    });
  };

  const recentJobs = entries
    .map((entry) => jobs.find((job) => job.id === entry.id))
    .filter((job): job is Job => Boolean(job));

  const visibleJobs = useMemo(
    () => (trackFilter === "all" ? recentJobs : recentJobs.filter((job) => job.track === trackFilter)),
    [recentJobs, trackFilter],
  );

  const filterOptions = useMemo(
    () =>
      trackFilterOptions.map((option) => ({
        ...option,
        count: option.id === "all" ? recentJobs.length : recentJobs.filter((job) => job.track === option.id).length,
      })),
    [recentJobs],
  );

  const emptyCopy = emptyFilteredCopy(trackFilter);

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "최근 본 공고" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">최근 본 공고</h1>
      <p className="mt-2.5 max-w-[640px] text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        최근 확인한 공고를 다시 볼 수 있습니다.
      </p>

      {recentJobs.length > 0 ? (
        <>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <TrackFilterTabs options={filterOptions} activeId={trackFilter} onChange={setTrackFilter} />
            </div>
            <button
              type="button"
              onClick={clear}
              className="shrink-0 text-[13px] font-medium text-[#8a94a3] transition hover:text-[#111111]"
            >
              전체 삭제
            </button>
          </div>
          <div className="mt-5">
            {visibleJobs.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} isBookmarked={savedIds.has(job.id)} onToggleBookmark={toggleSave} />
                ))}
              </div>
            ) : (
              <EmptyState title={emptyCopy.title} description={emptyCopy.description} />
            )}
          </div>
        </>
      ) : (
        <div className="mt-7">
          <EmptyState title="최근 본 공고가 없습니다." description="공고를 열람하면 이곳에 순서대로 표시됩니다." />
        </div>
      )}
    </MyPageShell>
  );
}
