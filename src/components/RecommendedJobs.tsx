"use client";

import clsx from "clsx";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { EntityLogo } from "@/components/ui/EntityLogo";
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
  prevLabel = "이전 추천 공고",
  nextLabel = "다음 추천 공고",
}: {
  onPrev: () => void;
  onNext: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  prevLabel?: string;
  nextLabel?: string;
}) {
  return (
    <div className="ml-auto flex gap-1">
      <button
        type="button"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label={prevLabel}
        className="grid h-8 w-8 place-items-center border border-[#d8dce2] text-[#333333] transition-colors hover:border-[#111111] disabled:cursor-not-allowed disabled:text-[#9aa3af] disabled:hover:border-[#d8dce2]"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label={nextLabel}
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

// Premium · Standard: 로고 + 세로 구분선 + 회사명 한 줄
function LogoLine({
  company,
  logoUrl,
  width,
  height,
}: {
  company: string;
  logoUrl: string | undefined;
  width: number;
  height: number;
}) {
  return (
    <div className="flex items-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={company}
          className="shrink-0 object-contain"
          style={{ width, height }}
        />
      ) : (
        <span
          className="flex shrink-0 items-center justify-center text-[13px] font-semibold text-[#596373]"
          style={{ width, height }}
        >
          {company.slice(0, 2)}
        </span>
      )}
      <div className="mx-[10px] w-px shrink-0 bg-[#eeeeee]" style={{ height }} />
      <p className="min-w-0 truncate text-[12px] font-medium text-[#6f7785]">{company}</p>
    </div>
  );
}

// Featured: 흰색 둥근 패치 위에 로고
function LogoPatch({
  company,
  logoUrl,
}: {
  company: string;
  logoUrl: string | undefined;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-[5px] bg-white p-1"
      style={{ width: 88, height: 34 }}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={company}
          className="h-full w-full object-contain"
        />
      ) : (
        <span className="text-[13px] font-semibold text-[#596373]">
          {company.slice(0, 2)}
        </span>
      )}
    </div>
  );
}

// D-day / 지원방법 축약 유틸
function shortApplyMethod(method: string): string {
  if (method.includes("홈페이지")) return "홈페이지";
  if (method.includes("간편")) return "간편";
  return method;
}
function shortDDay(dDay: string): string {
  if (dDay === "상시채용") return "상시";
  return dDay;
}

function PremiumCard({ job }: { job: RecommendedJob }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-[#e5e5e5] bg-white shadow-none transition duration-[180ms] hover:border-[#d5d5d5] hover:shadow-[0_6px_18px_rgba(12,18,24,0.07)]">
      <div className="relative aspect-[19/6] overflow-hidden bg-[linear-gradient(120deg,#070707_0%,#242424_48%,#8f9397_100%)]">
        <img src={job.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86)_0%,rgba(0,0,0,0.46)_55%,rgba(255,255,255,0.08)_100%)]" />
      </div>
      <div className="flex flex-1 flex-col px-[22px] pb-[20px] pt-[22px]">
        <div className="mb-2.5">
          <LogoLine company={job.company} logoUrl={job.logoUrl} width={82} height={32} />
        </div>
        <h3 className="line-clamp-2 text-[19px] font-bold text-[#202734]">{job.title}</h3>
        <p className="mt-1 truncate text-[12px] font-normal text-[#9ca3af]">{job.condition}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {job.tags.map((tag) => (
            <span key={tag} className="border border-[#f0f0f0] bg-[#f6f6f6] px-2 py-0.5 text-[12px] font-medium text-[#777f8c]">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[11px] font-medium text-[#6b7481]">{job.applyMethod}</span>
          <strong className="text-[13px] font-medium text-danger">{job.dDay}</strong>
        </div>
      </div>
    </article>
  );
}

function FeaturedCard({ job }: { job: RecommendedJob }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-[#e5e5e5] bg-white shadow-none transition duration-[180ms] hover:border-[#dcdcdc] hover:shadow-[0_6px_18px_rgba(12,18,24,0.06)]">
      <div className="flex items-center gap-2.5 bg-[#fafafa] px-[18px] py-[14px]">
        <LogoPatch company={job.company} logoUrl={job.logoUrl} />
        <p className="min-w-0 truncate text-[12px] font-medium text-[#4b5563]">{job.company}</p>
      </div>
      <div className="flex flex-1 flex-col px-[18px] pb-[18px] pt-[18px]">
        <h3 className="line-clamp-2 text-[16px] font-bold text-[#202734]">{job.title}</h3>
        <p className="mt-1 truncate text-[12px] font-normal text-[#9ca3af]">{job.condition}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[11px] font-medium text-[#6b7481]">{job.applyMethod}</span>
          <strong className="text-[13px] font-medium text-danger">{job.dDay}</strong>
        </div>
      </div>
    </article>
  );
}

function StandardCard({ job }: { job: RecommendedJob }) {
  const dDayShort = shortDDay(job.dDay);
  const isJangsi = dDayShort === "상시";
  return (
    <article className="flex h-full min-h-[130px] flex-col overflow-hidden border border-[#e5e5e5] bg-white shadow-sm transition duration-[180ms] hover:border-[#dcdcdc] hover:shadow-[0_6px_18px_rgba(12,18,24,0.06)]">
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="mb-2">
          <LogoLine company={job.company} logoUrl={job.logoUrl} width={74} height={30} />
        </div>
        <h3 className="truncate text-[15px] font-bold text-[#202734]">{job.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] font-medium text-[#6b7481]">{shortApplyMethod(job.applyMethod)}</span>
          <strong className={`text-[13px] font-medium ${isJangsi ? "text-[#6b7280]" : "text-danger"}`}>
            {dDayShort}
          </strong>
        </div>
      </div>
    </article>
  );
}

const ZONE_LABEL_CLASS = "mb-3 text-[11px] font-semibold tracking-[0.12em] text-[#c2c2c2]";
const LINK_CLASS = "block cursor-pointer focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.18)]";
const onSpaceKey = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
  if (e.key === " ") { e.preventDefault(); e.currentTarget.click(); }
};

function cardLink(id: number, slug: string | undefined, children: React.ReactNode) {
  return slug ? (
    <Link key={id} href={`/jobs/${slug}`} className={LINK_CLASS} onKeyDown={onSpaceKey}>
      {children}
    </Link>
  ) : (
    <div key={id}>{children}</div>
  );
}

export function RecommendedJobsGrid({ jobs }: { jobs: RecommendedJob[] }) {
  const premiumJobs = jobs.filter((j) => j.adTier === "premium");
  const featuredJobs = jobs.filter((j) => j.adTier === "featured");
  const standardJobs = jobs.filter((j) => j.adTier === "standard");

  return (
    <div>
      {premiumJobs.length > 0 && (
        <div>
          <p className={ZONE_LABEL_CLASS}>PREMIUM</p>
          <div className="grid grid-cols-3 gap-[14px]">
            {premiumJobs.map((job) => cardLink(job.id, job.jobSlug, <PremiumCard job={job} />))}
          </div>
        </div>
      )}

      {featuredJobs.length > 0 && (
        <div className="mt-[34px]">
          <p className={ZONE_LABEL_CLASS}>FEATURED</p>
          <div className="grid grid-cols-4 gap-[14px]">
            {featuredJobs.map((job) => cardLink(job.id, job.jobSlug, <FeaturedCard job={job} />))}
          </div>
        </div>
      )}

      {standardJobs.length > 0 && (
        <div className="mt-[34px]">
          <p className={ZONE_LABEL_CLASS}>STANDARD</p>
          <div className="grid grid-cols-5 gap-[14px]">
            {standardJobs.map((job) => cardLink(job.id, job.jobSlug, <StandardCard job={job} />))}
          </div>
        </div>
      )}
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
