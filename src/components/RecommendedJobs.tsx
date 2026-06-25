"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { typeScale } from "@/components/ui/Typography";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import type { RecommendedJob } from "@/types/jobs";

interface RecommendedJobsProps {
  jobs: RecommendedJob[];
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

/**
 * 이전·다음 버튼 한 그룹. "테마별 공고" 섹션 제목 옆 캐러셀 컨트롤과 동일한 크기·간격·아이콘을 쓴다.
 * 카드 영역 위에 떠 있는 별도 버튼을 만들지 말고 이 컨트롤을 섹션 제목 라인에 재사용할 것.
 */
export function CarouselControl({
  onPrev,
  onNext,
  canGoPrev,
  canGoNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}) {
  return (
    <div className="ml-auto flex gap-1">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="이전 추천 공고"
        className="grid h-8 w-8 place-items-center border border-[#d8dce2] text-[#333333] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#9aa3af] disabled:hover:border-[#d8dce2]"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="다음 추천 공고"
        className="grid h-8 w-8 place-items-center border border-[#d8dce2] text-[#333333] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#9aa3af] disabled:hover:border-[#d8dce2]"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export function JobNoticePopover() {
  const { open, setOpen, containerRef } = useDropdownMenu<HTMLDivElement>();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="주목할 만한 공고 안내"
        className="grid h-4 w-4 place-items-center text-[#a1aabb] hover:text-[#6b7280]"
      >
        <Info size={16} />
      </button>

      {open ? (
        <div
          role="dialog"
          className="dropdown-panel absolute left-1/2 top-[calc(100%+8px)] z-30 flex w-[240px] max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-3 border border-[#e5e9ef] bg-white p-4 text-center shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <p className="text-[14px] font-bold text-[#17202c]">공고 노출 효과를 높여보세요</p>
          <p className="break-keep text-[12px] font-normal leading-[1.6] text-[#687383]">기업회원 전용 노출 상품과 요금제를 확인할 수 있습니다.</p>
          <Link
            href="/business/pricing"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 items-center justify-center bg-brand px-4 text-[13px] font-medium text-white hover:bg-[var(--color-brand-dark)]"
          >
            요금제 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function RecommendedJobsGrid({ jobs }: { jobs: RecommendedJob[] }) {
  const renderCard = (job: RecommendedJob) => (
    <article className="surface h-full overflow-hidden border-[#dedede] shadow-none transition duration-150 hover:border-[#111111]/55 hover:shadow-[0_8px_22px_rgba(12,18,24,0.08)]">
      <div className="relative h-[82px] overflow-hidden bg-[linear-gradient(120deg,#070707_0%,#242424_48%,#8f9397_100%)]">
        <img src={job.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.46)_55%,rgba(255,255,255,0.08)_100%)]" />
        <span className="absolute left-3 top-3 rounded-[var(--radius)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#111111]">
          추천
        </span>
      </div>
      <div className="px-3.5 pb-3 pt-3">
        <p className="mb-1 text-[12px] font-normal text-[#6f7785]">{job.company}</p>
        <h3 className="truncate text-[15px] font-bold text-[#202734]">{job.title}</h3>
        <p className="mt-1 truncate text-[11px] font-normal text-[#7d8796]">{job.condition}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.postingSource === "headhunting" ? (
            <span className="rounded-[var(--radius)] border border-[#d7dce2] bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-medium text-[#535c68]">
              헤드헌팅
            </span>
          ) : null}
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius)] border border-[#e4e8ef] bg-[#f7f9fb] px-2 py-0.5 text-[11px] font-medium text-[#777f8c]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <strong className="text-[15px] font-semibold text-danger">{job.dDay}</strong>
          <span className="text-[11px] font-normal text-[#6b7481]">{job.applyMethod}</span>
        </div>
      </div>
    </article>
  );

  return (
    <div className="grid grid-cols-3 gap-[14px]">
      {jobs.map((job) => (
        job.jobSlug ? (
          <Link
            key={job.id}
            href={`/jobs/${job.jobSlug}`}
            className="block cursor-pointer rounded-[var(--radius)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.18)]"
            onKeyDown={(event) => {
              if (event.key === " ") {
                event.preventDefault();
                event.currentTarget.click();
              }
            }}
          >
            {renderCard(job)}
          </Link>
        ) : (
          <div key={job.id}>{renderCard(job)}</div>
        )
      ))}
    </div>
  );
}

export function RecommendedJobs({ jobs, onPrev, onNext, canGoPrev, canGoNext }: RecommendedJobsProps) {
  return (
    <section className="mt-[18px]" aria-label="주목할 만한 공고">
      <div className="mb-3 flex items-center gap-2">
        <h2 className={clsx(typeScale.cardTitle, "text-[#2b3340]")}>주목할 만한 공고</h2>
        <JobNoticePopover />
        <CarouselControl onPrev={onPrev} onNext={onNext} canGoPrev={canGoPrev} canGoNext={canGoNext} />
      </div>
      <RecommendedJobsGrid jobs={jobs} />
    </section>
  );
}
