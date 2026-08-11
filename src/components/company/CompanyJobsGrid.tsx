"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { FLUSH_LIST_CLASS } from "@/components/flushListStyles";
import { readSavedJobs, writeSavedJobs } from "@/components/job-detail/shared";
import type { Job } from "@/types/jobs";

/**
 * CompanyJobsPreview(서버 컴포넌트)가 getActiveJobs()로 조회한 실공고 목록을 JobCard로 렌더한다.
 * 북마크 상태는 job-detail 트랙 클라이언트들(JobDetailClient 등)과 동일하게
 * 로컬스토리지 기반 readSavedJobs/writeSavedJobs로 관리해 저장 상태가 앱 전역에서 일치한다.
 *
 * flush: ≤760px에서 카드를 화면 폭까지 밀어내는 목록판. 공고 탭(/companies/{id}/jobs)처럼 목록이
 * 그 화면의 본문 전부인 자리에 쓴다 — 공고 상세 "비슷한 공고"·스크랩·테마관이 쓰는 것과 같은 한 줄
 * (FLUSH_LIST_CLASS + JobCard variant="flush")이다. 761px 이상은 두 값 모두 종전과 같은 모습이라
 * 데스크톱 렌더에 차이가 없다. 개요 탭의 미리보기(최대 2건)는 섹션 카드 안의 곁들임이라 기본값을 쓴다.
 */
export function CompanyJobsGrid({ jobs, flush = false }: { jobs: Job[]; flush?: boolean }) {
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

  return (
    <div className={clsx(flush ? FLUSH_LIST_CLASS : "flex flex-col gap-3")}>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isBookmarked={savedIds.has(job.id)}
          onToggleBookmark={toggleSave}
          variant={flush ? "flush" : "default"}
        />
      ))}
    </div>
  );
}
