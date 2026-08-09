"use client";

import clsx from "clsx";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { APPLY_METHOD_SHORT_LABELS } from "@/config/applyMethods";
import { companyLogos } from "@/config/companyImages";
import type { Job } from "@/types/jobs";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { formatHospitalSalary } from "@/utils/salary";
import { getCompanyInitial } from "@/utils/companyInitial";
import { getCompanyDetailHref } from "@/components/job-detail/shared";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { formatJobDeadlineLabel, isJobDeadlineUrgent } from "@/utils/dday";

interface JobCardProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: (jobId: number) => void;
  /** 약국 시급 필터가 활성화된 상태에서 환산 시급이 조건을 충족할 때 표시하는 배지. */
  showHourlyBadge?: boolean;
  /**
   * flush: 모바일 풀블리드 목록용 — 테두리는 목록 컨테이너의 divide-y가 담당.
   * ≤760px에서만 다르게 그리고 761px 이상에서는 default와 같은 모습이다.
   */
  variant?: "default" | "flush";
}

/**
 * .surface(globals.css)는 @tailwind utilities보다 뒤에 출력돼 같은 특이도의 border 유틸리티를
 * 이긴다 — 바깥에서 className으로 테두리를 지울 수 없다. 그래서 flush는 .surface를 붙이지 않고
 * 같은 값(border 1px var(--color-border) / background #ffffff)을 유틸리티로 직접 쓴다.
 * !important를 피하는 유일한 경로다.
 */
const ROOT_CLASS = {
  default: "surface group relative shadow-none transition-colors hover:border-[#111111]/55 hover:bg-[#fbfcfc]",
  flush:
    "group relative bg-white shadow-none transition-colors hover:bg-[#fbfcfc] min-[761px]:border min-[761px]:border-[var(--color-border)] min-[761px]:hover:border-[#111111]/55",
} as const;

/**
 * 가로형 일반 공고 카드. 홈/트랙별 목록/검색·둘러보기/스크랩 화면이 모두 이 컴포넌트 하나를 공유한다.
 * 페이지별로 다른 변형을 만들지 말고 이 컴포넌트를 확장할 것.
 */
export function JobCard({ job, isBookmarked, onToggleBookmark, showHourlyBadge, variant = "default" }: JobCardProps) {
  const danger = isJobDeadlineUrgent(job);
  const deadlineText = formatJobDeadlineLabel(job);
  const applyLabel = APPLY_METHOD_SHORT_LABELS[job.applyMethod];
  const easyApply = job.applyMethod === "quick";
  const companyDetailHref = getCompanyDetailHref(job.companyId);
  const logoUrl = job.logoUrl ?? companyLogos[job.company];

  return (
    <article className={clsx(ROOT_CLASS[variant])}>
      {job.slug && hasJobDetail(job.slug) ? (
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
        {/* 로고 컬럼 — ≤480px에서는 숨긴다. 회사명이 바로 옆에 텍스트로 중복 표시되므로
            정보 칸 폭을 확보하는 쪽이 우선 */}
        <div className="flex w-[130px] shrink-0 items-center justify-center px-5 max-[640px]:w-[96px] max-[640px]:px-3 max-[480px]:hidden">
          {/* 폭은 칸이 정한다 — EntityLogo가 인라인 style로 넣는 width를 !w-full로 덮어야
              칸의 ≤640px 축소(콘텐츠 폭 90→72)를 그대로 따라간다. 인라인 style은 클래스보다
              세므로 important 없이는 이길 수 없다.
              height 40 + padding 0은 종전 `max-h-10 w-full object-contain`과 같은 렌더 결과다.
              폴백은 건물 아이콘이 아니라 이니셜이다 — 로고 없는 항목이 여러 줄 연속으로
              깔리는 화면(약국 탭)에서 전부 같은 아이콘이 되면 행 구분이 사라진다. */}
          <EntityLogo
            name={job.company}
            logoUrl={logoUrl}
            variant="wide"
            height={40}
            padding={0}
            className="!w-full"
            fallback={<span className="text-[13px] font-semibold text-[#596373]">{getCompanyInitial(job.company)}</span>}
          />
        </div>

        {/* 세로 구분선 — 로고 칸과 함께 사라진다 */}
        <div className="w-px shrink-0 self-stretch bg-[#eeeeee] max-[480px]:hidden" />

        {/* 정보 컬럼 */}
        {/* ≤640px: flex-wrap + 메인 basis-full → 우측 side가 둘째 줄로 내려간다 */}
        <div className="flex min-w-0 flex-1 px-[22px] py-4 max-[640px]:flex-wrap max-[480px]:px-4">
          {/* 정보 메인 */}
          <div className="min-w-0 flex-1 max-[640px]:basis-full">
            {companyDetailHref ? (
              <Link
                href={companyDetailHref}
                onClick={(event) => event.stopPropagation()}
                className="relative z-20 block max-w-full truncate text-[13px] font-medium text-[#5b6472] hover:text-brand"
              >
                {job.company}
              </Link>
            ) : (
              <p className="truncate text-[13px] font-medium text-[#5b6472]">{job.company}</p>
            )}

            {/* ≤640px에서 제목이 두 줄이 되므로 배지를 첫 줄에 붙인다 */}
            <div className="mt-1.5 flex min-w-0 items-center gap-2 max-[640px]:items-start">
              {job.postingSource === "headhunting" ? (
                <span className="shrink-0 border border-[#d7dce2] bg-[#f3f4f5] px-2 py-0.5 text-[13px] font-medium text-[#535c68]">
                  헤드헌팅
                </span>
              ) : null}
              {/* truncate(white-space:nowrap)와 line-clamp(display:-webkit-box)는 서로 충돌하므로
                  겹치지 않게 브레이크포인트로 완전히 분리한다 */}
              <h3 className="text-[16px] font-semibold text-[#242b36] min-[641px]:truncate max-[640px]:line-clamp-2">
                {job.title}
              </h3>
            </div>

            {/* truncate 없음 — 좁은 폭에서는 잘리는 대신 여러 줄로 감긴다 */}
            <p className="mt-1.5 text-[13px] font-normal text-[#737d8a]">
              {job.career}
              <span className="px-1.5 text-[#c2c8d1]">·</span>
              {job.education}
              <span className="px-1.5 text-[#c2c8d1]">·</span>
              {job.employmentType}
              <span className="px-1.5 text-[#c2c8d1]">·</span>
              {job.location}
              <span className="px-1.5 text-[#c2c8d1]">|</span>
              {job.track === "hospital" ? formatHospitalSalary(job.salaryRange, job.salaryNote) : job.salary}
            </p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {/* slice(0, 5)는 그대로 두고, ≤480px에서는 3번째부터 CSS로 숨겨 2개만 보인다 */}
              {(job.coreKeywords ?? []).slice(0, 5).map((tag, index) => (
                <span
                  key={tag}
                  className={clsx(
                    "rounded-[var(--radius)] border border-[#e5e9ef] bg-[#f5f7f9] px-2 py-0.5 text-[12px] font-medium text-[#7c8490]",
                    index >= 2 && "max-[480px]:hidden",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
            {showHourlyBadge ? (
              <p className="mt-0.5 text-[13px] text-[#0d7369]">시급 조건 충족</p>
            ) : null}
          </div>

          {/* 우측 side: 북마크(상단) + D-day·지원방법(mt-auto 바닥 고정) */}
          {/* ≤640px: 둘째 줄에서 가로 한 줄로. flex-row-reverse라 DOM 순서(북마크→D-day)가
              시각적으로 [D-day·지원방법 … 북마크]로 뒤집힌다. ml-3 → mt-3으로 교체 */}
          <div className="ml-3 flex shrink-0 flex-col items-end max-[640px]:ml-0 max-[640px]:mt-3 max-[640px]:w-full max-[640px]:flex-row-reverse max-[640px]:items-center max-[640px]:justify-between">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBookmark(job.id);
              }}
              className={clsx(
                // -mr-[13px]: 40px 버튼 안에서 21px 아이콘이 중앙정렬(9.5px) + 획 안쪽 여백(3.63px)
                // = 13.13px 만큼 그림이 안쪽에 그려진다. 누르는 영역 40px은 그대로 두고 상자만 밀어
                // 아이콘 획 끝을 아래 D-day·배지의 오른쪽 정렬선에 맞춘다.
                "relative z-20 -mr-[13px] grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius)] transition-colors",
                isBookmarked ? "text-brand" : "text-[#a0a9b7] hover:bg-[#f4f7f9] hover:text-brand",
              )}
              aria-label={`${job.title} ${isBookmarked ? "스크랩 해제" : "스크랩"}`}
            >
              <Bookmark size={21} strokeWidth={1.7} fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            <div className="mt-auto text-right max-[640px]:mt-0 max-[640px]:flex max-[640px]:items-center max-[640px]:gap-2 max-[640px]:text-left">
              <strong className={clsx("block whitespace-nowrap text-[15px] font-bold leading-none", danger ? "text-danger" : "text-brand")}>
                {deadlineText}
              </strong>
              <span
                className={clsx(
                  "mt-2.5 inline-flex h-[28px] shrink-0 cursor-default items-center whitespace-nowrap rounded-[var(--radius)] px-2 text-[13px] font-medium max-[640px]:mt-0",
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
