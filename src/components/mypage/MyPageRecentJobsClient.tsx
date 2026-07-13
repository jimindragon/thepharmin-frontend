"use client";

import { useEffect, useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { JobCard } from "@/components/JobCard";
import { MyPageShell } from "@/components/mypage/MyPageShell";
import { LinkButton } from "@/components/ui/Button";
import { readSavedJobs, writeSavedJobs } from "@/components/job-detail/shared";
import { jobs } from "@/data/jobs";
import { useRecentJobs } from "@/hooks/useRecentJobs";
import type { Job } from "@/types/jobs";

function EmptyState() {
  return (
    <div className="border border-[#dfe4ea] bg-white p-10 text-center">
      <p className="text-[14px] font-medium text-[#303946]">최근 본 공고가 없습니다.</p>
      <p className="mt-2 text-[13px] font-normal leading-[1.6] text-[#8a94a3]">
        공고를 열람하면 이곳에 순서대로 표시됩니다.
      </p>
      <LinkButton href="/jobs" variant="secondary" size="sm" className="mt-5">
        공고 둘러보기
      </LinkButton>
    </div>
  );
}

/** scraps 페이지와 동일한 목록 레이아웃·간격을 따르되 탭/트랙 필터 없이 최신 열람순 공고만 보여준다. */
export function MyPageRecentJobsClient() {
  const { entries, clear } = useRecentJobs();
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());

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

  return (
    <MyPageShell>
      <PageBreadcrumb items={[{ label: "마이페이지" }, { label: "최근 본 공고" }]} />

      <h1 className="mt-5 text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">최근 본 공고</h1>
      <p className="mt-2.5 max-w-[640px] text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">
        최근 확인한 공고를 다시 볼 수 있습니다.
      </p>

      {recentJobs.length > 0 ? (
        <>
          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={clear}
              className="text-[13px] font-medium text-[#8a94a3] transition hover:text-[#111111]"
            >
              전체 삭제
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-3">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} isBookmarked={savedIds.has(job.id)} onToggleBookmark={toggleSave} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-7">
          <EmptyState />
        </div>
      )}
    </MyPageShell>
  );
}
