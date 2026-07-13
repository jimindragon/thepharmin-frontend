"use client";

import { useEffect } from "react";
import { recordRecentJobView } from "@/hooks/useRecentJobs";

/** 공고 상세 화면에 마운트해 열람 이력을 1회 기록만 하는 비시각 컴포넌트. */
export function RecentJobRecorder({ jobId }: { jobId: number }) {
  useEffect(() => {
    recordRecentJobView(jobId);
  }, [jobId]);

  return null;
}
