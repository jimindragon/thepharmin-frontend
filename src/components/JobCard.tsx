"use client";

import clsx from "clsx";
import Link from "next/link";
import { Bookmark, Info } from "lucide-react";
import { companies } from "@/data/companies";
import type { Job } from "@/types/jobs";

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
}

export function JobCard({ job, isBookmarked, onToggleBookmark }: JobCardProps) {
  const danger = job.closingStatus === "today" || job.deadlineOrder <= 7;
  const always = job.closingStatus === "always";
  const deadlineText =
    job.closingStatus === "today" ? "오늘 마감" : always ? "상시채용" : job.deadlineLabel.replace("마감 ", "");
  const applyLabel = job.applyMethod === "간편 지원" ? "간편지원" : "홈페이지 지원";
  const easyApply = job.applyMethod === "간편 지원";

  return (
    <article className="surface group relative grid h-[96px] grid-cols-[226px_1fr_130px_36px] items-center border-[#dedede] px-3.5 py-2 shadow-none transition-colors hover:border-brand/60 hover:bg-[#fbfcfc] max-[720px]:h-auto max-[720px]:grid-cols-[1fr_40px] max-[720px]:gap-y-3 max-[720px]:px-3 max-[720px]:py-3">
      {job.slug ? (
        <Link
          href={`/jobs/${job.slug}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-[var(--radius)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.18)]"
          aria-label={`${job.title} 상세 보기`}
          onKeyDown={(event) => {
            if (event.key === " ") {
              event.preventDefault();
              event.currentTarget.click();
            }
          }}
        >
          <span className="sr-only">{job.title} 상세 보기</span>
        </Link>
      ) : null}

      <div className="flex h-full items-center gap-3 border-r border-border pr-3.5 max-[720px]:col-span-2 max-[720px]:border-b max-[720px]:border-r-0 max-[720px]:pb-3 max-[720px]:pr-0">
        <div className="flex w-[66px] flex-col items-center justify-center gap-0.5">
          <div className="relative grid h-[30px] w-[56px] place-items-center">
            <span
              className="absolute h-[22px] w-[22px] rounded-full opacity-90"
              style={{ backgroundColor: job.logoColor, left: 7, top: 8 }}
            />
            <span
              className="absolute h-[22px] w-[22px] rounded-full opacity-80"
              style={{ backgroundColor: job.logoAccent ?? job.logoColor, right: 9, top: 8 }}
            />
            <span
              className="absolute h-[22px] w-[22px] rounded-full opacity-75"
              style={{ backgroundColor: job.logoColor, left: 22, bottom: 1 }}
            />
          </div>
          <span className="max-w-[68px] text-center text-[10px] font-semibold leading-tight" style={{ color: job.logoColor }}>
            {job.logoText}
          </span>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-[#343c49]">{job.company}</p>
          {job.companyId && companies.some((item) => item.id === job.companyId) ? (
            <Link
              href={`/companies/${job.companyId}`}
              onClick={(event) => event.stopPropagation()}
              className="relative z-20 mt-1 inline-flex h-[25px] items-center gap-1 border border-[#d8dee7] bg-white px-2.5 text-[11px] font-medium text-[#4d5664] hover:border-brand hover:text-brand"
            >
              <Info size={14} />
              기업 정보
            </Link>
          ) : (
            <span className="mt-1 inline-flex h-[25px] items-center gap-1 border border-[#d8dee7] bg-white px-2.5 text-[11px] font-medium text-[#4d5664]">
              <Info size={14} />
              기업 정보
            </span>
          )}
        </div>
      </div>

      <div className="min-w-0 px-4 max-[720px]:col-span-2 max-[720px]:px-0">
        <div className="flex min-w-0 items-center gap-2">
          {job.postingSource === "headhunting" ? (
            <span className="shrink-0 border border-[#d7dce2] bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-medium text-[#535c68]">
              헤드헌팅
            </span>
          ) : null}
          <h3 className="truncate text-[15px] font-bold text-[#2b3340]">{job.title}</h3>
        </div>
        <p className="mt-1 truncate text-[11px] font-normal text-[#737d8a]">
          {job.career}
          <span className="px-2.5 text-[#c2c8d1]">·</span>
          {job.education}
          <span className="px-2.5 text-[#c2c8d1]">·</span>
          {job.employmentType}
          <span className="px-2.5 text-[#c2c8d1]">·</span>
          {job.location}
          <span className="px-2.5 text-[#c2c8d1]">|</span>
          {job.salary}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius)] border border-[#e5e9ef] bg-[#f5f7f9] px-2 py-0.5 text-[10px] font-medium text-[#7c8490]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-end justify-center gap-2 text-right max-[720px]:items-start max-[720px]:text-left">
        <strong className={clsx("text-[15px] font-semibold", danger ? "text-danger" : "text-brand")}>{deadlineText}</strong>
        <span
          className={clsx(
            "inline-flex h-[24px] cursor-default items-center rounded-[var(--radius)] px-2 text-[11px] font-medium",
            easyApply
              ? "bg-brand text-white"
              : "border border-[#d9e1e8] bg-white text-[#596373]",
          )}
        >
          {applyLabel}
        </span>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggleBookmark(job.id);
        }}
        className={clsx(
          "relative z-20 ml-auto grid h-[34px] w-[32px] place-items-center transition-colors",
          isBookmarked ? "text-brand" : "text-[#8a95a5] hover:bg-[#f4f7f9] hover:text-brand",
        )}
        aria-label={`${job.title} 북마크 ${isBookmarked ? "해제" : "저장"}`}
      >
        <Bookmark size={24} strokeWidth={1.8} fill={isBookmarked ? "currentColor" : "none"} />
      </button>
    </article>
  );
}
