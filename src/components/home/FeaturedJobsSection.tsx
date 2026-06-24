"use client";

import clsx from "clsx";
import { JobNoticePopover, RecommendedJobsGrid } from "@/components/RecommendedJobs";
import { typeScale } from "@/components/ui/Typography";
import type { RecommendedJob } from "@/types/jobs";

/**
 * 홈 화면(흰색 배경 영역의 마지막)과 분야별 랜딩 페이지(히어로 바로 아래)가
 * 공유하는 독립 "주목할 만한 공고" 섹션. 다른 섹션과 동일한 큰 제목 스타일을 쓰고,
 * 카드 영역만 기존 비율 유지를 위해 최대 너비를 둔다.
 */
export function FeaturedJobsSection({ jobs, onNext }: { jobs: RecommendedJob[]; onNext: () => void }) {
  return (
    <section className="mt-16" aria-label="주목할 만한 공고">
      <div className="mb-5 flex items-center gap-2">
        <h2 className={clsx(typeScale.sectionTitle, "text-[#111111]")}>주목할 만한 공고</h2>
        <span className="mt-1">
          <JobNoticePopover />
        </span>
      </div>
      <div className="max-w-[1040px]">
        <RecommendedJobsGrid jobs={jobs} onNext={onNext} />
      </div>
    </section>
  );
}
