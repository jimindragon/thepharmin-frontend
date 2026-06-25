"use client";

import { useEffect, useMemo, useState } from "react";
import { recommendedJobs } from "@/data/recommendedJobs";
import type { JobTrack } from "@/types/jobs";

const PAGE_SIZE = 3;

/**
 * 홈 화면과 분야별 랜딩 페이지가 공유하는 "주목할 만한 공고" 슬라이드 상태.
 * 분야에 맞는 추천 공고를 3개씩 페이지 단위로 보여주고, 첫/마지막 페이지에서는
 * 이전·다음 버튼이 비활성화된다. track이 "all"이면 전체 분야의 추천 공고를 모아 보여준다.
 */
export function useFeaturedJobs(track: JobTrack | "all") {
  const [page, setPage] = useState(0);

  const trackJobs = useMemo(
    () => (track === "all" ? recommendedJobs : recommendedJobs.filter((job) => job.track === track)),
    [track],
  );
  const pageCount = Math.max(1, Math.ceil(trackJobs.length / PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [track]);

  const safePage = Math.min(page, pageCount - 1);
  const jobs = useMemo(() => trackJobs.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE), [trackJobs, safePage]);

  const canGoPrev = safePage > 0;
  const canGoNext = safePage < pageCount - 1;

  const onPrev = () => setPage((current) => Math.max(0, current - 1));
  const onNext = () => setPage((current) => Math.min(pageCount - 1, current + 1));

  return { jobs, onPrev, onNext, canGoPrev, canGoNext };
}
