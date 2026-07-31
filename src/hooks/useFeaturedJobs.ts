"use client";

import { useEffect, useMemo, useState } from "react";
import { recommendedJobs } from "@/data/recommendedJobs";
import type { JobTrack, RecommendedJob } from "@/types/jobs";

type AdTier = RecommendedJob["adTier"];

/**
 * 존별 한 페이지 분량 — `RecommendedJobsGrid`의 존별 열 수(premium 3 / featured 4 / standard 5)와
 * 같은 값이어야 한다. 한쪽만 바꾸면 그리드에 빈 칸이 생기므로 항상 함께 수정할 것.
 */
const ZONE_PAGE_SIZE: Record<AdTier, number> = {
  premium: 3,
  featured: 4,
  standard: 5,
};

const AD_TIERS: AdTier[] = ["premium", "featured", "standard"];

/**
 * 홈 화면과 분야별 랜딩 페이지가 공유하는 "주목할 만한 공고" 슬라이드 상태.
 * track이 "all"이면 전체 분야의 추천 공고를 모아 보여준다.
 *
 * 페이지를 나눌 때 전체를 일괄로 n개씩 자르지 않고 **존(광고 등급)별로 따로 자른다.**
 * 그리드가 존마다 3·4·5열 고정이라, 일괄로 자르면 한 페이지가 존 경계를 걸쳐
 * "STANDARD 2장이 5열 트랙에 들어가고 3칸이 비는" 상태가 된다. 존별로 열 수와 같은
 * 개수를 자르면 각 존이 항상 꽉 찬 행으로 떨어진다.
 *
 * 항목 수가 열 수보다 적은 존은 열 수를 줄이지 않고 그대로 둔다 — 카드 폭 자체가
 * 유료 구좌 위계를 나타내므로, 열을 줄이면 STANDARD 카드가 PREMIUM보다 넓어진다.
 */
export function useFeaturedJobs(track: JobTrack | "all") {
  const [page, setPage] = useState(0);

  const trackJobs = useMemo(
    () => (track === "all" ? recommendedJobs : recommendedJobs.filter((job) => job.track === track)),
    [track],
  );

  const jobsByTier = useMemo(
    () =>
      ({
        premium: trackJobs.filter((job) => job.adTier === "premium"),
        featured: trackJobs.filter((job) => job.adTier === "featured"),
        standard: trackJobs.filter((job) => job.adTier === "standard"),
      }) satisfies Record<AdTier, typeof trackJobs>,
    [trackJobs],
  );

  // 가장 많은 페이지가 필요한 존을 기준으로 — 먼저 소진된 존은 그 페이지에서 렌더되지 않는다
  const pageCount = Math.max(
    1,
    ...AD_TIERS.map((tier) => Math.ceil(jobsByTier[tier].length / ZONE_PAGE_SIZE[tier])),
  );

  useEffect(() => {
    setPage(0);
  }, [track]);

  const safePage = Math.min(page, pageCount - 1);
  const jobs = useMemo(
    () =>
      AD_TIERS.flatMap((tier) =>
        jobsByTier[tier].slice(safePage * ZONE_PAGE_SIZE[tier], (safePage + 1) * ZONE_PAGE_SIZE[tier]),
      ),
    [jobsByTier, safePage],
  );

  const canGoPrev = safePage > 0;
  const canGoNext = safePage < pageCount - 1;

  const onPrev = () => setPage((current) => Math.max(0, current - 1));
  const onNext = () => setPage((current) => Math.min(pageCount - 1, current + 1));

  return { jobs, onPrev, onNext, canGoPrev, canGoNext };
}
