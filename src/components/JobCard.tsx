"use client";

import clsx from "clsx";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { companies } from "@/data/companies";
import { EntityLogo } from "@/components/ui/EntityLogo";
import type { Job } from "@/types/jobs";

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
  /** 스크랩 화면처럼 보조기술 라벨이 "스크랩"이라는 의미를 가져야 할 때 사용. 시각적 표시는 동일하다. */
  isScrapContext?: boolean;
}

/**
 * 가로형 일반 공고 카드. 홈/트랙별 목록/검색·둘러보기/스크랩 화면이 모두 이 컴포넌트 하나를 공유한다.
 * 페이지별로 다른 변형을 만들지 말고 이 컴포넌트를 확장할 것.
 */
export function JobCard({ job, isBookmarked, onToggleBookmark, isScrapContext }: JobCardProps) {
  const danger = job.closingStatus === "today" || job.deadlineOrder <= 7;
  const always = job.closingStatus === "always";
  const deadlineText =
    job.closingStatus === "today" ? "오늘 마감" : always ? "상시채용" : job.deadlineLabel.replace("마감 ", "");
  const applyLabel = job.applyMethod === "간편 지원" ? "간편지원" : "홈페이지 지원";
  const easyApply = job.applyMethod === "간편 지원";
  const hasCompanyProfile = Boolean(job.companyId && companies.some((item) => item.id === job.companyId));

  return (
    <article className="surface group relative border-[#dedede] px-5 py-4 shadow-none transition-colors hover:border-brand/55 hover:bg-[#fbfcfc] max-[560px]:p-4">
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

      <div className="flex items-start gap-3">
        <EntityLogo name={job.company} logoText={job.logoText} logoUrl={job.logoUrl} size={56} />

        <div className="min-w-0 flex-1">
          {hasCompanyProfile ? (
            <Link
              href={`/companies/${job.companyId}`}
              onClick={(event) => event.stopPropagation()}
              className="relative z-20 block max-w-full truncate text-[13px] font-medium text-[#5b6472] hover:text-brand"
            >
              {job.company}
            </Link>
          ) : (
            <p className="truncate text-[13px] font-medium text-[#5b6472]">{job.company}</p>
          )}

          <div className="mt-1.5 flex min-w-0 items-center gap-2">
            {job.postingSource === "headhunting" ? (
              <span className="shrink-0 border border-[#d7dce2] bg-[#f3f4f5] px-2 py-0.5 text-[11px] font-medium text-[#535c68]">
                헤드헌팅
              </span>
            ) : null}
            <h3 className="truncate text-[16px] font-bold text-[#242b36]">{job.title}</h3>
          </div>

          <p className="mt-1.5 truncate text-[12px] font-normal text-[#737d8a]">
            {job.career}
            <span className="px-2 text-[#c2c8d1]">·</span>
            {job.education}
            <span className="px-2 text-[#c2c8d1]">·</span>
            {job.employmentType}
            <span className="px-2 text-[#c2c8d1]">·</span>
            {job.location}
            <span className="px-2 text-[#c2c8d1]">|</span>
            {job.salary}
          </p>
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark(job.id);
          }}
          className={clsx(
            "relative z-20 grid h-10 w-10 shrink-0 translate-x-[13.875px] place-items-center rounded-[var(--radius)] transition-colors",
            isBookmarked ? "text-brand" : "text-[#a0a9b7] hover:bg-[#f4f7f9] hover:text-brand",
          )}
          aria-label={isScrapContext ? `${job.title} 스크랩 해제` : `${job.title} 북마크 ${isBookmarked ? "해제" : "저장"}`}
        >
          <Bookmark size={21} strokeWidth={1.7} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-1.5 flex flex-wrap items-start gap-3 pl-[68px] max-[560px]:pl-0">
        <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-[var(--radius)] border border-[#e5e9ef] bg-[#f5f7f9] px-2 py-0.5 text-[10px] font-medium text-[#7c8490]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="ml-auto shrink-0 -mt-[26.5px] text-right">
          <strong className={clsx("block text-[15px] font-bold leading-none", danger ? "text-danger" : "text-brand")}>{deadlineText}</strong>
          <span
            className={clsx(
              "mt-2.5 inline-flex h-[24px] cursor-default items-center rounded-[var(--radius)] px-2 text-[11px] font-medium",
              easyApply ? "bg-brand text-white" : "border border-[#d9e1e8] bg-white text-[#596373]",
            )}
          >
            {applyLabel}
          </span>
        </div>
      </div>
    </article>
  );
}
