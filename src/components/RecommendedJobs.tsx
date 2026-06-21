"use client";

import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import type { RecommendedJob } from "@/types/jobs";

interface RecommendedJobsProps {
  jobs: RecommendedJob[];
  onNext: () => void;
}

export function RecommendedJobs({ jobs, onNext }: RecommendedJobsProps) {
  const renderCard = (job: RecommendedJob) => (
    <article className="surface h-full overflow-hidden border-[#dedede] shadow-none transition duration-150 hover:border-[#111111]/55 hover:shadow-[0_8px_22px_rgba(12,18,24,0.08)]">
      <div className="relative h-[82px] overflow-hidden bg-[linear-gradient(120deg,#070707_0%,#242424_48%,#8f9397_100%)]">
        <img src={job.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.46)_55%,rgba(255,255,255,0.08)_100%)]" />
        <span className="absolute left-3 top-3 rounded-[var(--radius)] bg-white px-3 py-1.5 text-[11px] font-black text-[#111111]">
          추천
        </span>
      </div>
      <div className="px-3.5 pb-3 pt-3">
        <p className="mb-1 text-[12px] font-extrabold text-[#6f7785]">{job.company}</p>
        <h3 className="truncate text-[15px] font-extrabold text-[#202734]">{job.title}</h3>
        <p className="mt-1 truncate text-[11px] font-semibold text-[#7d8796]">{job.condition}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.postingSource === "headhunting" ? (
            <span className="rounded-[var(--radius)] border border-[#d7dce2] bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-black text-[#535c68]">
              헤드헌팅
            </span>
          ) : null}
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius)] border border-[#e4e8ef] bg-[#f7f9fb] px-2 py-0.5 text-[11px] font-bold text-[#777f8c]"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <strong className="text-[15px] font-extrabold text-danger">{job.dDay}</strong>
          <span className="text-[11px] font-bold text-[#6b7481]">{job.applyMethod}</span>
        </div>
      </div>
    </article>
  );

  return (
    <section className="mt-[18px]" aria-label="주목할 만한 공고">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[16px] font-extrabold text-[#2b3340]">주목할 만한 공고</h2>
        <Info size={16} color="#a1aabb" />
      </div>
      <div className="relative">
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
        <button
          type="button"
          onClick={onNext}
          className="absolute right-[-14px] top-[92px] grid h-[36px] w-[36px] place-items-center rounded-[var(--radius)] border border-[#dfe5ec] bg-white text-[#a3adba] shadow-[0_4px_12px_rgba(20,32,46,0.12)] transition-colors hover:border-brand hover:text-brand max-[720px]:right-0"
          aria-label="추천 공고 다음 보기"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}
