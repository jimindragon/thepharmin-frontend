"use client";

import { useMemo, useState } from "react";
import { recommendedJobs } from "@/data/recommendedJobs";
import type { JobTrack } from "@/types/jobs";

/**
 * 홈 화면과 분야별 랜딩 페이지가 공유하는 "주목할 만한 공고" 슬라이드 상태.
 * 분야에 맞는 추천 공고 3개를 보여주고, 다음 버튼으로 한 칸씩 밀어서 보여준다.
 */
export function useFeaturedJobs(track: JobTrack) {
  const [offset, setOffset] = useState(0);

  const jobs = useMemo(() => {
    const trackJobs = recommendedJobs.filter((job) => job.track === track);
    if (trackJobs.length === 0) return [];
    return trackJobs.map((_, index) => trackJobs[(index + offset) % trackJobs.length]).slice(0, 3);
  }, [track, offset]);

  const onNext = () => setOffset((current) => (current + 1) % Math.max(1, recommendedJobs.length));

  return { jobs, onNext };
}
