"use client";

import clsx from "clsx";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useState } from "react";
import { companies } from "@/data/companies";
import { companyLogos } from "@/config/companyImages";
import type { Job } from "@/types/jobs";
import { formatHospitalSalary } from "@/utils/salary";

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
  /** 스크랩 화면처럼 보조기술 라벨이 "스크랩"이라는 의미를 가져야 할 때 사용. 시각적 표시는 동일하다. */
  isScrapContext?: boolean;
  /** 약국 시급 필터가 활성화된 상태에서 환산 시급이 조건을 충족할 때 표시하는 배지. */
  showHourlyBadge?: boolean;
}

/**
 * 가로형 일반 공고 카드. 홈/트랙별 목록/검색·둘러보기/스크랩 화면이 모두 이 컴포넌트 하나를 공유한다.
 * 페이지별로 다른 변형을 만들지 말고 이 컴포넌트를 확장할 것.
 */
export function JobCard({ job, isBookmarked, onToggleBookmark, isScrapContext, showHourlyBadge }: JobCardProps) {
  const danger = job.closingStatus === "today" || job.deadlineOrder <= 7;
  const always = job.closingStatus === "always";
  const deadlineText =
    job.closingStatus === "today" ? "오늘 마감" : always ? "상시채용" : job.deadlineLabel.replace("마감 ", "");
  const applyLabel = job.applyMethod === "간편 지원" ? "간편지원" : "홈페이지 지원";
  const easyApply = job.applyMethod === "간편 지원";
  const hasCompanyProfile = Boolean(job.companyId && companies.some((item) => item.id === job.companyId));
  const logoUrl = job.logoUrl ?? companyLogos[job.company];
  const [logoFailed, setLogoFailed] = useState(false);
  const showLogoImage = Boolean(logoUrl) && !logoFailed;

  return (
    <article className="surface group relative border-[#dedede] shadow-none transition-colors hover:border-brand/55 hover:bg-[#fbfcfc]">
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

      {/* 2컬럼: [로고] [세로선] [정보] — items-stretch(기본)로 세로선이 카드 전체 높이에 걸림 */}
      <div className="flex">
        {/* 로고 컬럼 */}
        <div className="flex w-[130px] shrink-0 items-center justify-center px-5">
          {showLogoImage ? (
            <img
              src={logoUrl}
              alt={job.company}
              className="max-h-10 w-full object-contain"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <span className="text-[13px] font-semibold text-[#596373]">{job.company.slice(0, 2)}</span>
          )}
        </div>

        {/* 세로 구분선 */}
        <div className="w-px shrink-0 self-stretch bg-[#eeeeee]" />

        {/* 정보 컬럼 */}
        <div className="flex min-w-0 flex-1 px-[22px] py-4">
          {/* 정보 메인 */}
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
              {job.track === "hospital" ? formatHospitalSalary(job.salaryRange, job.salaryNote) : job.salary}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[var(--radius)] border border-[#e5e9ef] bg-[#f5f7f9] px-2 py-0.5 text-[10px] font-medium text-[#7c8490]"
                >
                  {tag}
                </span>
              ))}
            </div>
            {showHourlyBadge ? (
              <p className="mt-0.5 text-[11px] text-[#0d7369]">시급 조건 충족</p>
            ) : null}
          </div>

          {/* 우측 side: 북마크(상단) + D-day·지원방법(mt-auto 바닥 고정) */}
          <div className="ml-3 flex shrink-0 flex-col items-end">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBookmark(job.id);
              }}
              className={clsx(
                "relative z-20 grid h-10 w-10 place-items-center rounded-[var(--radius)] transition-colors",
                isBookmarked ? "text-brand" : "text-[#a0a9b7] hover:bg-[#f4f7f9] hover:text-brand",
              )}
              aria-label={isScrapContext ? `${job.title} 스크랩 해제` : `${job.title} 북마크 ${isBookmarked ? "해제" : "저장"}`}
            >
              <Bookmark size={21} strokeWidth={1.7} fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <div className="mt-auto text-right">
              <strong className={clsx("block text-[15px] font-bold leading-none", danger ? "text-danger" : "text-brand")}>
                {deadlineText}
              </strong>
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
        </div>
      </div>
    </article>
  );
}
