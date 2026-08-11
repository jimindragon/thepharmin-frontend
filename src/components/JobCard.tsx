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
    "group relative bg-white shadow-none transition-colors hover:bg-[#fbfcfc] min-[761px]:border min-[761px]:border-border min-[761px]:hover:border-[#111111]/55",
} as const;

/**
 * flush는 목록 컨테이너가 --shell-gutter만큼 좌우로 빠져나가 카드가 화면 끝에 붙는다 —
 * 카드 안쪽 패딩이 그대로 화면 여백이 되므로, 같은 화면의 h1·탭이 서 있는
 * --shell-gutter/2(=24px, ≤760px) 선에 맞춘다. default는 app-shell 안에 있어 이미 그 선을
 * 확보한 상태라 종전 값을 그대로 둔다.
 *
 * flush가 px 대신 pl/pr을 쓰는 이유: 왼쪽만 24px로 올리고 오른쪽은 종전대로 두어야 하는데,
 * px 단축형과 pl을 섞으면 어느 쪽이 이기는지가 Tailwind 출력 순서에 달린다. 축을 나눠 쓰면
 * 같은 축 안에서 "변형 없는 유틸리티 < 변형 붙은 유틸리티"만 남아 순서에 기대지 않는다.
 */
const LOGO_COL_CLASS = {
  default: "px-5 max-[640px]:px-3",
  flush: "pl-5 pr-5 max-[760px]:pl-6 max-[640px]:pr-3",
} as const;

/** ≤480px에서는 로고 칸이 숨어 이 칸의 좌측 패딩이 곧 카드 왼쪽 여백이 된다. */
const INFO_COL_CLASS = {
  default: "max-[480px]:px-4",
  flush: "max-[480px]:px-6",
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
        <div
          className={clsx(
            "flex w-[130px] shrink-0 items-center justify-center max-[640px]:w-[96px] max-[480px]:hidden",
            LOGO_COL_CLASS[variant],
          )}
        >
          {/* 폭은 칸이 정한다 — EntityLogo가 인라인 style로 넣는 width를 !w-full로 덮어야
              칸의 축소(default 기준 ≤640px에서 콘텐츠 폭 90→72)를 그대로 따라간다. 인라인 style은
              클래스보다 세므로 important 없이는 이길 수 없다.
              flush는 좌측 정렬 보정(LOGO_COL_CLASS) 때문에 값이 다르다 — 641~760px 86, 481~640px 60.
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
        {/* ≤640px: flex-wrap + D-day 겹의 basis-full → 마감·지원방법만 둘째 줄로 내려간다.
            메인은 basis-0(flex-1)이라 첫 줄에서 북마크(40px, shrink-0)와 폭을 나눈다 —
            종전처럼 메인에 basis-full을 주면 북마크까지 둘째 줄로 딸려 내려간다. */}
        <div className={clsx("flex min-w-0 flex-1 px-[22px] py-4 max-[640px]:flex-wrap", INFO_COL_CLASS[variant])}>
          {/* 정보 메인 */}
          <div className="min-w-0 flex-1">
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
          {/* ≤640px: 이 겹을 display:contents로 접어 두 자식을 정보 칸의 직계 flex 항목으로 올린다.
              북마크는 첫 줄 끝(=카드 우상단)에 서고, basis-full을 받은 D-day·지원방법만 둘째 줄로
              내려간다. 종전에는 겹째로 둘째 줄에 내려간 뒤 flex-row-reverse가 북마크를 그 줄의
              오른쪽 끝(=카드 우하단)에 세웠다 — 북마크만 폭 구간에 따라 자리가 갈리던 것을
              전 폭 우상단 하나로 통일한다. 배지 두 개는 종전대로 하단에 남는다.
              겹을 지우지 않고 접기만 하는 이유: >640px는 이 겹의 flex-col + items-end가
              [북마크 / D-day] 세로 쌓기를 그대로 담당해야 하고, 폭마다 버튼 인스턴스를 따로 두면
              onToggleBookmark·aria-label이 갈라져 나중에 어긋난다.
              display 유틸리티가 둘(flex·contents)이지만 승부가 출력 순서에 달리지 않는다 —
              변형 없는 flex < 변형 붙은 max-[640px]:contents로 확정된다. */}
          <div className="ml-3 flex shrink-0 flex-col items-end max-[640px]:contents">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleBookmark(job.id);
              }}
              className={clsx(
                // -mr-[13px]: 40px 버튼 안에서 21px 아이콘이 중앙정렬(9.5px) + 획 안쪽 여백(3.63px)
                // = 13.13px 만큼 그림이 안쪽에 그려진다. 누르는 영역 40px은 그대로 두고 상자만 밀어
                // 아이콘 획 끝을 정보 칸의 오른쪽 패딩선(>640px 기준 아래 D-day·배지의 정렬선)에 맞춘다.
                // 폭과 무관하게 h-10 w-10이라 ≤640px에서도 누르는 영역은 40×40 그대로다.
                // ≤640px ml-3: 겹의 ml-3이 contents와 함께 사라지므로 버튼이 직접 갖는다 —
                // 제목·태그가 쓰는 칸과 데스크톱과 같은 12px을 띄운다. 북마크가 absolute가 아니라
                // 흐름 안에 있어 메인 칸이 그만큼 좁아지므로, 겹침을 pr로 피할 필요가 없다.
                "relative z-20 -mr-[13px] grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius)] transition-colors max-[640px]:ml-3",
                isBookmarked ? "text-brand" : "text-[#a0a9b7] hover:bg-[#f4f7f9] hover:text-brand",
              )}
              aria-label={`${job.title} ${isBookmarked ? "스크랩 해제" : "스크랩"}`}
            >
              <Bookmark size={21} strokeWidth={1.7} fill={isBookmarked ? "currentColor" : "none"} />
            </button>

            {/* ≤640px basis-full: 이 겹만 둘째 줄로 넘기는 장치다(앞의 두 항목은 첫 줄에 다 들어간다).
                mt-3은 종전에 겹이 갖고 있던 값과 같다 — 첫 줄 높이는 메인 칸이 정하므로 태그행과의
                간격이 종전 그대로 12px이다. mt-auto(>640px 바닥 고정)는 변형이 붙은 이 값에 진다.

                ≤640px justify-between: 이 줄은 basis-full이라 폭을 다 받는데 내용은 두 배지뿐이라,
                좌측 정렬로 두면 오른쪽 절반이 빈 채로 남는다. 북마크가 우상단으로 올라가기 전에는
                이 줄의 flex-row-reverse+justify-between이 북마크를 오른쪽 끝에 세워 양끝이 잡혀
                있었다 — 그 앵커를 요소를 옮기지 않고 줄 자체의 정렬로 되살린다.
                gap-2는 남긴다. 양끝 정렬이 남는 폭을 배분하는 것과 별개로 gap은 두 배지 사이의
                최소 간격 바닥값이라, 마감이 "상시채용"이고 배지가 "홈페이지 지원"처럼 둘 다 긴
                조합에서 폭이 빠듯해져도 글자끼리 붙지 않는다. */}
            <div className="mt-auto text-right max-[640px]:mt-3 max-[640px]:flex max-[640px]:basis-full max-[640px]:items-center max-[640px]:justify-between max-[640px]:gap-2 max-[640px]:text-left">
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
