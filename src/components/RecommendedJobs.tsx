"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Info, UserRoundSearch } from "lucide-react";
import { APPLY_METHOD_SHORT_LABELS } from "@/config/applyMethods";
import { hasJobDetail } from "@/data/jobDetailIndex";
import { useDropdownMenu } from "@/hooks/useDropdownMenu";
import { getCompanyInitial } from "@/utils/companyInitial";
import type { RecommendedJob } from "@/types/jobs";

/**
 * 존 배치 옵션. 기본값은 "아무것도 하지 않음"이라 옵션을 넘기지 않는 소비처
 * (트랙 랜딩·/jobs 캐러셀)는 예전 렌더 그대로다.
 */
export interface RecommendedJobsGridOptions {
  /** FEATURED와 STANDARD 사이에 헤드헌팅 안내 행을 넣는다. 홈에서만 켠다. */
  showHeadhuntingBanner?: boolean;
  /** STANDARD 존에 노출할 최대 장수. 없으면 전량. */
  standardLimit?: number;
}

interface RecommendedJobsProps extends RecommendedJobsGridOptions {
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
          className="dropdown-panel absolute left-1/2 top-[calc(100%+8px)] z-30 flex w-[240px] max-w-[calc(100vw-32px)] -translate-x-1/2 flex-col items-center gap-3 border border-border bg-white p-4 text-center shadow-[0_8px_22px_rgba(20,32,46,0.12)]"
        >
          <p className="text-[14px] font-bold text-[#17202c]">공고 노출 효과를 높여보세요</p>
          <p className="break-keep text-[12px] font-normal leading-[1.6] text-[#687383]">기업회원 전용 노출 상품과 요금제를 확인할 수 있습니다.</p>
          <Link
            href="/business#pricing"
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
          {getCompanyInitial(company)}
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
          {getCompanyInitial(company)}
        </span>
      )}
    </div>
  );
}

// D-day 축약 유틸
function shortDDay(dDay: string): string {
  if (dDay === "상시채용") return "상시";
  return dDay;
}

/** JobCard의 긴급 판정과 같은 경계 — 마감 7일 이내. */
const URGENT_DDAY_MAX_DAYS = 7;

/**
 * 이 파일 카드들의 D-day 긴급(빨강) 판정.
 *
 * 카드가 받는 건 Job이 아니라 RecommendedJob(광고 티어 뷰모델)이라 isJobDeadlineUrgent(job)를
 * 그대로 부를 수 없다. 대신 dDay 문자열에서 되읽는다 — 이 값은 recommendedJobs.ts가 한 곳에서
 * formatJobDeadlineLabel(job)로 만든 것이라(손입력 값이 섞이지 않는다) 라벨만으로 원래 판정을
 * 그대로 복원할 수 있다. 그 함수가 내는 네 가지가 아래 분기와 1:1로 맞물린다.
 *   "오늘 마감" → 긴급 / "D-n" → n ≤ 7이면 긴급 / "상시채용"·"마감" → 아님
 * 결과는 isJobDeadlineUrgent(오늘 마감이거나 0 ≤ 남은 일수 ≤ 7)와 같다.
 *
 * dDay가 손입력으로 바뀌거나 형식이 늘어나면 이 파싱이 조용히 회색으로 떨어진다 —
 * 그때는 라벨을 되읽지 말고 RecommendedJob에 판정 결과를 필드로 실어 내려보낼 것.
 */
function isUrgentDDay(dDay: string): boolean {
  if (dDay === "오늘 마감") return true;
  const daysLeft = dDay.match(/^D-(\d+)$/);
  return daysLeft ? Number(daysLeft[1]) <= URGENT_DDAY_MAX_DAYS : false;
}

/** 세 등급 카드가 공유하는 D-day 색. 한 곳에서 갈라야 등급마다 규칙이 어긋나지 않는다. */
function ddayColorClass(dDay: string): string {
  return isUrgentDDay(dDay) ? "text-danger" : "text-[#6b7280]";
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
          <span className="text-[11px] font-medium text-[#6b7481]">{APPLY_METHOD_SHORT_LABELS[job.applyMethod]}</span>
          <strong className={`text-[13px] font-medium ${ddayColorClass(job.dDay)}`}>{job.dDay}</strong>
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
        {/* 광고 등급 제목: PREMIUM 19 / FEATURED 17 / STANDARD 15 — 2px 간격을 유지해야
            세 등급이 각각 다른 급으로 읽힌다. 16이면 STANDARD(15)와 1px 차라 뭉개진다.
            타이포 스케일 예외로 확정됨 — PREMIUM 19는 스케일(최대 17)을 넘지만 유료 구좌
            위계라 콘텐츠 카드(17)보다 큰 것이 의도다. 19/17/15 사다리를 유지할 것. */}
        <h3 className="line-clamp-2 text-[17px] font-bold text-[#202734]">{job.title}</h3>
        <p className="mt-1 truncate text-[12px] font-normal text-[#9ca3af]">{job.condition}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[11px] font-medium text-[#6b7481]">{APPLY_METHOD_SHORT_LABELS[job.applyMethod]}</span>
          <strong className={`text-[13px] font-medium ${ddayColorClass(job.dDay)}`}>{job.dDay}</strong>
        </div>
      </div>
    </article>
  );
}

function StandardCard({ job }: { job: RecommendedJob }) {
  const dDayShort = shortDDay(job.dDay);
  return (
    <article className="flex h-full min-h-[130px] flex-col overflow-hidden border border-[#e5e5e5] bg-white shadow-sm transition duration-[180ms] hover:border-[#dcdcdc] hover:shadow-[0_6px_18px_rgba(12,18,24,0.06)]">
      <div className="flex flex-1 flex-col px-5 pb-5 pt-5">
        <div className="mb-2">
          <LogoLine company={job.company} logoUrl={job.logoUrl} width={74} height={30} />
        </div>
        <h3 className="truncate text-[15px] font-bold text-[#202734]">{job.title}</h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-[11px] font-medium text-[#6b7481]">{APPLY_METHOD_SHORT_LABELS[job.applyMethod]}</span>
          {/* 종전에는 "상시"만 갈라내 나머지가 전부 빨강이었다 — 이미 마감된 공고와 D-30이
              마감 당일과 같은 색으로 섰다. 판정을 위 ddayColorClass 하나로 모은다.
              표시는 축약형(dDayShort), 판정은 원본(job.dDay)이다. */}
          <strong className={`text-[13px] font-medium ${ddayColorClass(job.dDay)}`}>
            {dDayShort}
          </strong>
        </div>
      </div>
    </article>
  );
}

/**
 * 존과 존 사이 구분선. 등급명(PREMIUM/FEATURED/STANDARD)을 구직자에게 그대로 보이던 라벨을
 * 걷어낸 자리라, 위아래 여백 합(30+30)이 예전 "라벨 + 여백"이 차지하던 높이와 맞도록 잡혀 있다.
 * 존 경계에만 들어가야 하므로 첫 존에는 붙이지 않는다 — 아래 zones 배열이 그 순서를 관리한다.
 */
const ZONE_DIVIDER_CLASS = "mt-[30px] border-t border-[#eeeeee] pt-[30px]";
/** 헤드헌팅 안내 행이 낀 경계 — 행 자신의 테두리가 경계를 대신하므로 선 없이 간격만 준다. */
const ZONE_GAP_CLASS = "mt-[30px]";
const LINK_CLASS = "block cursor-pointer focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.18)]";
const onSpaceKey = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
  if (e.key === " ") { e.preventDefault(); e.currentTarget.click(); }
};

function cardLink(id: number, slug: string | undefined, children: React.ReactNode) {
  return slug && hasJobDetail(slug) ? (
    <Link key={id} href={`/jobs/${slug}`} className={LINK_CLASS} onKeyDown={onSpaceKey}>
      {children}
    </Link>
  ) : (
    <div key={id}>{children}</div>
  );
}

/**
 * 유료 구좌 사이에 끼는 헤드헌팅 안내 행. 광고 카드가 아니라 안내 톤이라
 * 흰 배경 + 1px 테두리로만 두고 그라데이션·초록·차콜 솔리드·그림자를 쓰지 않는다.
 * 행 자신의 테두리가 존 경계를 대신하므로 구분선을 겹쳐 넣지 않는다(호출부의 ZONE_GAP_CLASS).
 *
 * 홈 "채용을 준비 중인 담당자이신가요?" 띠(HomePageClient의 RecruiterSolutionBanner)와
 * 한 쌍이다 — 한 줄 문구 + 우측 아웃라인 버튼, px-6 py-5까지 같은 문법으로 맞춰 두 안내 행이
 * 같은 종류로 읽히게 한다. 그쪽이 인라인이라 클래스를 공유하지 못하니 한쪽을 고치면 함께 볼 것.
 */
function HeadhuntingNoticeRow() {
  return (
    <div className="flex items-center justify-between gap-6 border border-border bg-[#fafafa] px-6 py-5">
      {/* 문구+버튼을 한 겹 더 싸서, 데스크톱은 이 겹이 폭을 다 먹고 좌우로 벌리고(종전과 같은 렌더)
          ≤760px는 세로로 쌓여 좌측 정렬 덩어리가 된다. 우측 아이콘은 이 겹 밖이라 항상 행 끝에 선다. */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-6 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-4">
        <p className="min-w-0 text-[15px] font-medium text-[#333333]">
          내 경력에 맞는{" "}
          <br className="hidden max-[760px]:inline" />
          포지션을 제안받아 보세요
        </p>
        <Link
          href="/headhunting"
          className="inline-flex shrink-0 items-center gap-1.5 border border-[#111111] px-4 py-2 text-[13px] font-medium text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
        >
          헤드헌팅 알아보기
          <ArrowRight size={14} />
        </Link>
      </div>
      {/* ≤760px 전용 장식 — 홈 RecruiterSolutionBanner와 같은 규격(36px, #d1d6dd, strokeWidth 1.5). */}
      <UserRoundSearch className="hidden h-9 w-9 shrink-0 text-[#d1d6dd] max-[760px]:block" strokeWidth={1.5} aria-hidden />
    </div>
  );
}

/**
 * 존별 열 수(premium 3 / featured 4 / standard 5)는 `useFeaturedJobs`의 `ZONE_PAGE_SIZE`와
 * 같은 값이어야 한다 — /jobs처럼 페이지를 나눠 넘기는 화면에서 한쪽만 바꾸면 마지막 행에
 * 빈 칸이 남는다. Tailwind JIT가 동적 클래스명을 못 만들어 열 수는 리터럴로 둘 수밖에 없으니,
 * 바꿀 때는 두 파일을 반드시 함께 고칠 것.
 */
export function RecommendedJobsGrid({
  jobs,
  showHeadhuntingBanner = false,
  standardLimit,
}: { jobs: RecommendedJob[] } & RecommendedJobsGridOptions) {
  const premiumJobs = jobs.filter((j) => j.adTier === "premium");
  const featuredJobs = jobs.filter((j) => j.adTier === "featured");
  // slice는 표시만 줄인다 — orderedSlugs가 만든 순서를 그대로 앞에서부터 자르고 원본은 건드리지 않는다.
  const allStandardJobs = jobs.filter((j) => j.adTier === "standard");
  const standardJobs = standardLimit === undefined ? allStandardJobs : allStandardJobs.slice(0, standardLimit);

  // 비어 있는 존은 배열에 담기지 않는다 — 구분선을 "첫 항목을 제외한 모든 항목"에 붙이는 것만으로
  // 존 사이에만 선이 들어간다. 약국처럼 FEATURED가 0건인 트랙에서도 맨 위에 선이 생기지 않는다.
  const zones: { key: string; node: React.ReactNode; isNotice?: boolean }[] = [];

  if (premiumJobs.length > 0) {
    zones.push({
      key: "premium",
      node: (
        <div className="grid grid-cols-3 gap-[14px] max-[900px]:grid-cols-2 max-[640px]:grid-cols-1">
          {premiumJobs.map((job) => cardLink(job.id, job.jobSlug, <PremiumCard job={job} />))}
        </div>
      ),
    });
  }

  if (featuredJobs.length > 0) {
    zones.push({
      key: "featured",
      node: (
        <div className="grid grid-cols-4 gap-[14px] max-[1024px]:grid-cols-3 max-[760px]:grid-cols-2 max-[640px]:grid-cols-1">
          {featuredJobs.map((job) => cardLink(job.id, job.jobSlug, <FeaturedCard job={job} />))}
        </div>
      ),
    });
  }

  // FEATURED가 없는 데이터(약국형)에서는 끼울 경계 자체가 없으므로 넣지 않는다.
  if (showHeadhuntingBanner && featuredJobs.length > 0) {
    zones.push({ key: "headhunting-notice", node: <HeadhuntingNoticeRow />, isNotice: true });
  }

  if (standardJobs.length > 0) {
    zones.push({
      key: "standard",
      node: (
        <div className="grid grid-cols-5 gap-[14px] max-[1180px]:grid-cols-4 max-[900px]:grid-cols-3 max-[760px]:grid-cols-2 max-[640px]:grid-cols-1">
          {standardJobs.map((job) => cardLink(job.id, job.jobSlug, <StandardCard job={job} />))}
        </div>
      ),
    });
  }

  return (
    <div>
      {zones.map((zone, i) => {
        // 안내 행이 걸친 두 경계(위·아래)는 선을 빼고 간격만 준다 — 행의 테두리와 구분선이 겹쳐 보이지 않게.
        const spacing =
          i === 0 ? undefined
          : zone.isNotice || zones[i - 1].isNotice ? ZONE_GAP_CLASS
          : ZONE_DIVIDER_CLASS;
        return (
          <div key={zone.key} className={spacing}>
            {zone.node}
          </div>
        );
      })}
    </div>
  );
}

export function RecommendedJobs({ jobs, onPrev, onNext, canGoPrev, canGoNext, showHeadhuntingBanner, standardLimit }: RecommendedJobsProps) {
  return (
    <section className="mt-[18px]" aria-label="주목할 만한 공고">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#2b3340]">주목할 만한 공고</h2>
        <JobNoticePopover />
        {/* 페이지가 하나뿐이면(=양쪽 다 못 넘김) 눌리지 않는 회색 화살표만 남으므로 아예 렌더하지 않는다.
            광고가 늘어 페이지가 둘 이상이 되면 자동으로 다시 나타난다.
            우측 정렬은 CarouselControl 자신의 `ml-auto`가 하므로, 빠져도 제목 줄 정렬은 그대로다. */}
        {canGoPrev || canGoNext ? (
          <CarouselControl onPrev={onPrev} onNext={onNext} canGoPrev={canGoPrev} canGoNext={canGoNext} />
        ) : null}
      </div>
      <RecommendedJobsGrid jobs={jobs} showHeadhuntingBanner={showHeadhuntingBanner} standardLimit={standardLimit} />
    </section>
  );
}
