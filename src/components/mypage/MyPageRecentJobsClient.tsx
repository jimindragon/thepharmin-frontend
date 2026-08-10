"use client";

import { useEffect, useMemo, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { FLUSH_LIST_CLASS } from "@/components/flushListStyles";
import { JobCard } from "@/components/JobCard";
import { MyPageEmptyState } from "@/components/mypage/MyPageEmptyState";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { TrackFilterChips } from "@/components/mypage/TrackFilterChips";
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

/** 빈 상태에서 공통으로 붙는 행동 — 스크랩과 달리 이 화면은 "둘러보기" 경로를 준다 */
const browseJobsAction = (
  <LinkButton href="/jobs" variant="secondary" size="sm" className="mt-5">
    공고 둘러보기
  </LinkButton>
);

/** 칩 셸이 요구하는 { key, label, count } 모양으로만 바꾼다 — count 계산은 호출부 useMemo가 그대로 소유 */
function toChipItems(options: { id: TrackFilter; label: string; count: number }[]) {
  return options.map(({ id, label, count }) => ({ key: id, label, count }));
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
      <PageBreadcrumb keepOnMobile items={[{ label: "마이페이지" }, { label: "최근 본 공고" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36] max-[760px]:mt-4 max-[760px]:text-[24px]">최근 본 공고</h1>
      <p className="mt-2.5 max-w-[640px] text-[15px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        최근 확인한 공고를 다시 볼 수 있습니다.
      </p>

      {recentJobs.length > 0 ? (
        <>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 max-[760px]:mt-6">
            {/* ≤760px basis-full: 칩이 "전체 삭제"와 폭을 나눠 가지면 3줄로 깨진다.
                칩에 한 줄을 통째로 주고 버튼을 다음 줄로 내려 스크랩과 같은 2줄 wrap을 만든다. */}
            <div className="min-w-0 flex-1 max-[760px]:basis-full">
              {/* 이 칩 행은 "전체 삭제"와 같은 flex 행 안에 있어 바깥 마진을 갖지 않는다 */}
              <TrackFilterChips items={toChipItems(filterOptions)} activeKey={trackFilter} onSelect={setTrackFilter} />
            </div>
            <button
              type="button"
              onClick={clear}
              className="shrink-0 text-[13px] font-medium text-[#8a94a3] transition hover:text-[#111111] max-[760px]:ml-auto"
            >
              전체 삭제
            </button>
          </div>
          <div className="mt-5 max-[760px]:mt-4">
            {visibleJobs.length > 0 ? (
              <div className={FLUSH_LIST_CLASS}>
                {visibleJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isBookmarked={savedIds.has(job.id)}
                    onToggleBookmark={toggleSave}
                    variant="flush"
                  />
                ))}
              </div>
            ) : (
              <MyPageEmptyState title={emptyCopy.title} description={emptyCopy.description} action={browseJobsAction} />
            )}
          </div>
        </>
      ) : (
        <div className="mt-7 max-[760px]:mt-6">
          <MyPageEmptyState
            title="최근 본 공고가 없습니다."
            description="공고를 열람하면 이곳에 순서대로 표시됩니다."
            action={browseJobsAction}
          />
        </div>
      )}
    </MyPageShell>
  );
}
