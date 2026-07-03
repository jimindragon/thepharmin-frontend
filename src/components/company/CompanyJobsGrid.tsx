"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/JobCard";
import { readSavedJobs, writeSavedJobs } from "@/components/job-detail/shared";
import type { Job } from "@/types/jobs";

/**
 * CompanyJobsPreview(서버 컴포넌트)가 getActiveJobs()로 조회한 실공고 목록을 JobCard로 렌더한다.
 * 북마크 상태는 job-detail 트랙 클라이언트들(JobDetailClient 등)과 동일하게
 * 로컬스토리지 기반 readSavedJobs/writeSavedJobs로 관리해 저장 상태가 앱 전역에서 일치한다.
 */
export function CompanyJobsGrid({ jobs }: { jobs: Job[] }) {
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
    <div className="flex flex-col gap-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} isBookmarked={savedIds.has(job.id)} onToggleBookmark={toggleSave} />
      ))}
    </div>
  );
}
