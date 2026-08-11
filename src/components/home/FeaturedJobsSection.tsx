"use client";

import { JobNoticePopover, RecommendedJobsGrid, type RecommendedJobsGridOptions } from "@/components/RecommendedJobs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { RecommendedJob } from "@/types/jobs";

/** 존 배치 옵션은 그대로 그리드에 흘려보낸다 — 이 섹션은 제목 줄만 책임진다. */
interface FeaturedJobsSectionProps extends RecommendedJobsGridOptions {
  jobs: RecommendedJob[];
}

/**
 * 홈 화면(흰색 배경 영역의 마지막)과 분야별 랜딩 페이지(히어로 바로 아래)가
 * 공유하는 독립 "주목할 만한 공고" 섹션. adTier별 세 존(premium/featured/standard)을
 * 정적으로 모두 렌더링한다.
 */
export function FeaturedJobsSection({ jobs, showHeadhuntingBanner, standardLimit }: FeaturedJobsSectionProps) {
  return (
    <section className="mt-16" aria-label="주목할 만한 공고">
      {/* 안내 팝오버는 제목의 각주라 우측 액션이 아니라 제목 옆(adornment)에 붙는다. */}
      <SectionHeader
        title="주목할 만한 공고"
        adornment={
          <span className="mt-1 shrink-0">
            <JobNoticePopover />
          </span>
        }
      />
      <RecommendedJobsGrid jobs={jobs} showHeadhuntingBanner={showHeadhuntingBanner} standardLimit={standardLimit} />
    </section>
  );
}
