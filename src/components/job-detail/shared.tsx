"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronRight, Heart, Lock, MapPin, Share2, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { getPharmacyCoverImage } from "@/utils/pharmacyImage";
import { getIndustryJobCoverImage } from "@/utils/industryImage";
import { getHospitalJobCoverImage } from "@/utils/hospitalImage";
import { getResearchJobCoverImage } from "@/utils/researchImage";
import { getCompanyInitial } from "@/utils/companyInitial";
import { companyLogos } from "@/config/companyImages";
import { companyDirectory } from "@/data/companyDirectory";
import { hasJobDetail } from "@/data/jobDetailIndex";
import type { Company, FormattedContent, Job } from "@/types/jobs";

/**
 * 공고 상세 페이지(산업/약국 등 트랙 공용)에서 재사용하는 패널·타이포그래피·저장 상태 유틸.
 * 트랙별 페이지는 이 모듈의 컴포넌트로 골격을 맞추고, 트랙 고유 섹션만 각자 구성한다.
 */

const saveStorageKey = "thepharmin:saved-jobs";

export function readSavedJobs() {
  if (typeof window === "undefined") {
    return new Set<number>();
  }

  try {
    const value = window.localStorage.getItem(saveStorageKey);
    const ids = value ? (JSON.parse(value) as number[]) : [];
    return new Set(ids);
  } catch {
    return new Set<number>();
  }
}

export function writeSavedJobs(ids: Set<number>) {
  window.localStorage.setItem(saveStorageKey, JSON.stringify(Array.from(ids)));
}

/**
 * 상세 사이드바 sticky top 값을 계산한다. 사이드바가 뷰포트보다 짧으면 topOffset에 고정(기존과 동일),
 * 사이드바가 뷰포트보다 길면 top을 줄여 사이드바 하단이 "뷰포트 하단 - bottomGap"에서 멈추게 한다.
 * 스크롤 리스너 없이 position:sticky 자체가 나머지(자연스러운 노출→고정 전환)를 처리하도록,
 * 뷰포트/콘텐츠 높이가 바뀔 때만(ResizeObserver·resize) top 값을 재계산한다.
 */
export function useStickySidebarTop(topOffset = 88, bottomGap = 24) {
  const ref = useRef<HTMLElement | null>(null);
  const [top, setTop] = useState(topOffset);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function recalc() {
      const height = el!.getBoundingClientRect().height;
      const minTop = window.innerHeight - height - bottomGap;
      setTop(Math.min(topOffset, minTop));
    }

    recalc();
    const resizeObserver = new ResizeObserver(recalc);
    resizeObserver.observe(el);
    window.addEventListener("resize", recalc);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [topOffset, bottomGap]);

  return { ref, top };
}

export function careerLabel(job: Job) {
  return job.career.replace(/^경력\s*/, "");
}

export function deadlineLabel(job: Job) {
  if (job.isClosed) {
    return "마감";
  }

  if (job.deadlineType === "untilHired" || job.closingStatus === "always") {
    return "채용 시 마감";
  }

  if (!job.deadline) {
    return job.deadlineLabel.replace("마감 ", "");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${job.deadline}T00:00:00`);
  const diff = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);

  if (diff < 0) {
    return "마감";
  }

  if (diff === 0 || job.closingStatus === "today") {
    return "오늘 마감";
  }

  return `D-${diff}`;
}

export function deadlineDetail(job: Job) {
  if (job.deadlineType === "untilHired" || job.closingStatus === "always") {
    return "채용 시 마감";
  }

  return job.deadlineDate;
}

/** companyId를 기업 상세 링크로 바꾼다. 프로필이 없는 기업은 companyDirectory.detailHref가 /reviews로 폴백하므로 여기서도 같은 값을 그대로 쓴다. 매칭되는 기업이 없으면 undefined를 반환해 호출부가 링크 없이 렌더할 수 있게 한다. */
export function getCompanyDetailHref(companyId?: string) {
  if (!companyId) return undefined;
  return companyDirectory.find((entry) => entry.id === companyId)?.detailHref;
}

export function getCoverImage(job: Job, company: Company | null) {
  const explicitCover =
    job.coverImageMode === "upload"
      ? job.coverImageUrl
      : job.coverImageMode === "company"
        ? company?.coverImage ?? company?.defaultImage ?? job.coverImage
        : job.coverImageMode === "none"
          ? undefined
          : job.coverImageUrl ?? job.coverImage ?? company?.coverImage ?? company?.defaultImage;

  if (explicitCover) {
    return explicitCover;
  }

  /** 대표 이미지가 없는 약국 공고(coverImageMode가 "none"인 경우 포함)는 약국명 기준으로 결정론적으로 배정된 예시 사진을 대신 보여준다 */
  if (job.track === "pharmacy") {
    return getPharmacyCoverImage(job.company);
  }

  /** 대표 이미지가 없는 산업 트랙 공고는 slug 기준으로 결정론적으로 배정된 예시 사진을 대신 보여준다 */
  if (job.track === "industry") {
    return getIndustryJobCoverImage(job.slug ?? String(job.id));
  }

  /** 대표 이미지가 없는 병원 트랙 공고는 slug 기준으로 결정론적으로 배정된 예시 사진을 대신 보여준다 */
  if (job.track === "hospital") {
    return getHospitalJobCoverImage(job.slug ?? String(job.id));
  }

  /** 대표 이미지가 없는 연구 트랙 공고는 slug 기준으로 결정론적으로 배정된 예시 사진을 대신 보여준다 */
  if (job.track === "research") {
    return getResearchJobCoverImage(job.slug ?? String(job.id));
  }

  return undefined;
}

export function CompanyLogo({
  name,
  logoText,
  logoUrl,
  size = "lg",
}: {
  name: string;
  logoText: string;
  logoUrl?: string;
  size?: "sm" | "lg";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedLogoUrl = logoUrl ?? companyLogos[name];
  const showImage = Boolean(resolvedLogoUrl) && !imageFailed;
  const boxSize = size === "lg" ? "h-[68px] w-[68px]" : "h-[46px] w-[46px]";
  const boxPx = size === "lg" ? 68 : 46;

  if (!showImage) {
    return <EntityLogo name={name} size={boxPx} className="shrink-0" />;
  }

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-[var(--radius)] border border-border bg-white shadow-[0_3px_10px_rgba(20,32,46,0.04)]",
        boxSize,
      )}
      aria-label={`${name} 로고`}
    >
      <img src={resolvedLogoUrl} alt={`${name} 로고`} className="h-full w-full object-contain p-2" onError={() => setImageFailed(true)} />
    </div>
  );
}

export function HeaderTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-[#d7dce2] bg-white px-2.5 py-1 text-[13px] font-medium text-[#2f3845]">
      {children}
    </span>
  );
}

export function ActionIconButton({
  label,
  children,
  onClick,
  active,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={clsx(
        "grid h-11 w-11 shrink-0 place-items-center border bg-white transition",
        active
          ? "border-brand text-brand shadow-[0_4px_14px_rgba(17,17,17,0.14)]"
          : "border-border text-[#818b98] hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

/** 기업 인증 등 신뢰 배지. 산업 페이지는 "인증기업", 약국 페이지는 "약사 인증"처럼 라벨만 다르게 쓴다. */
export function VerifiedBadge({ label = "인증기업" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
      <ShieldCheck size={13} />
      {label}
    </span>
  );
}

export function DefaultCover({ job }: { job: Job }) {
  return (
    <div className="relative h-[286px] overflow-hidden rounded-[var(--radius)] border border-border bg-[#071115] max-[720px]:h-[210px]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 88% 20%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 18%, transparent 19%), radial-gradient(circle at 82% 88%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 16%, transparent 17%), linear-gradient(115deg, #071115 0%, #2b2f34 44%, #777b80 74%, #b7babd 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.22)_58%,rgba(0,0,0,0.04)_100%)]" />
      <div className="absolute left-8 top-8 flex items-center gap-4 max-[720px]:left-5 max-[720px]:top-5">
        <CompanyLogo name={job.company} logoText={job.logoText} logoUrl={job.logoUrl} size="sm" />
        <div>
          <p className="text-[14px] font-medium text-white">{job.company}</p>
          <p className="mt-1 text-[12px] font-medium text-white/66">{job.industry ?? job.category} · {job.role ?? job.jobCategory ?? "채용"}</p>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8 max-w-[720px] max-[720px]:bottom-6 max-[720px]:left-5 max-[720px]:right-5">
        <p className="text-[15px] font-medium text-white/78">THE PHARMA Recruit</p>
        <p className="mt-2 text-[28px] font-medium leading-[1.25] text-white max-[720px]:text-[22px]">{job.company}</p>
      </div>
    </div>
  );
}

/**
 * 항목 카드. emphasize는 색상 대신 테두리/글자 굵기만으로 약하게 강조한다
 * (심평원 등록, 자동조제기처럼 근무 자격·환경을 구분하는 값에 사용).
 */
export function OverviewCard({ label, value, emphasize }: { label: string; value: React.ReactNode; emphasize?: boolean }) {
  return (
    <div className={clsx("rounded-[var(--radius)] border bg-[#fbfcfd] px-4 py-3.5", emphasize ? "border-[#c7cfd8]" : "border-[#e2e8ef]")}>
      <p className="text-[12px] font-medium text-[#8893a2]">{label}</p>
      <p className={clsx("mt-1.5 text-[15px] text-[#2f3845]", emphasize ? "font-bold" : "font-normal")}>{value}</p>
    </div>
  );
}

export function SectionShell({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
      <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function FormattedContentView({ content, fallback }: { content?: FormattedContent; fallback?: string[] }) {
  const normalized = content ?? (fallback ? { format: "bullet" as const, items: fallback } : undefined);

  if (!normalized || normalized.items.length === 0) {
    return null;
  }

  if (normalized.format === "paragraph") {
    return (
      <div className="space-y-3 text-[16px] font-normal leading-[1.85] text-[#3f4855]">
        {normalized.items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    );
  }

  const ListTag = normalized.format === "numbered" ? "ol" : "ul";

  return (
    <ListTag className={clsx("space-y-3 text-[15px] font-normal leading-[1.75] text-[#3f4855]", normalized.format === "numbered" && "list-decimal pl-5")}>
      {normalized.items.map((item, index) => (
        <li key={`${item}-${index}`} className={normalized.format === "bullet" ? "flex gap-2.5" : undefined}>
          {normalized.format === "bullet" ? <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" /> : null}
          <span>{item}</span>
        </li>
      ))}
    </ListTag>
  );
}

export function HiringProcess({ steps }: { steps?: string[] }) {
  if (!steps?.length) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 max-[960px]:grid-cols-3 max-[640px]:grid-cols-1">
        {steps.map((step, index) => (
          <div key={step} className="relative rounded-[var(--radius)] border border-[#dfe7ee] bg-[#fbfcfd] px-3.5 py-4 text-center">
            <span className="mx-auto grid h-8 w-8 place-items-center rounded-[var(--radius)] bg-brand text-[13px] font-medium text-white">
              {index + 1}
            </span>
            <p className="mt-2.5 text-[13px] font-normal text-[#3f4855]">{step}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-medium text-[#8a95a5]">채용 절차와 일정은 기업 사정에 따라 변경될 수 있습니다.</p>
    </div>
  );
}

/**
 * V2 상세 "전형절차 및 제출서류"용 타임라인형 스텝. 박스 없이 배지+단계명만 두어 가볍게 렌더한다.
 * 데스크톱은 고정 리듬(연결선 64px 고정폭)으로 왼쪽 정렬해 콘텐츠 크기만큼만 앉히고, 640px 이하에서는
 * 한 줄 배치가 어색해지므로 2열 그리드로 전환하고 연결선은 숨긴다(각 스텝 내부 마크업은 그대로 재사용
 * 되도록 매 스텝을 `contents` 래퍼로 감싸 flex/grid 컨테이너에 직접 자식으로 편입시키는 방식).
 * 진행 상태 개념이 없는 정적 안내이므로 전 단계 동일 톤이다.
 */
export function HiringProcessSteps({ steps }: { steps?: string[] }) {
  if (!steps?.length) {
    return null;
  }

  return (
    <div className="mt-1.5 -mb-1.5 flex items-start max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:gap-x-4 max-[640px]:gap-y-6">
      {steps.map((step, index) => (
        <div key={step} className="contents">
          <div className="flex min-w-[88px] shrink-0 flex-col items-center">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eef0f3] text-[15px] font-semibold text-[#4f5967]">
              {index + 1}
            </span>
            <p className="mt-2.5 whitespace-nowrap text-[14px] font-medium text-[#374151]">{step}</p>
          </div>
          {index < steps.length - 1 ? (
            <div className="flex h-9 shrink-0 items-center px-3.5 max-[640px]:hidden">
              <span className="h-px w-16 bg-[#d8e0e8]" aria-hidden />
              <ChevronRight size={16} className="-ml-0.5 shrink-0 text-[#c3cad3]" aria-hidden />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** 지도 SDK 없이 쓰는 자리표시자 박스. 주소가 있을 때만 렌더링한다. */
export function MapBox({ address }: { address?: string }) {
  if (!address) {
    return null;
  }

  return (
    <div className="relative grid h-[190px] place-items-center overflow-hidden rounded-[var(--radius)] border border-dashed border-[#cbd8df] bg-[#f3f3f3]">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: "linear-gradient(#dedede 1px, transparent 1px), linear-gradient(90deg, #dedede 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 rounded-[var(--radius)] border border-[#d7dde5] bg-white px-5 py-3 text-center shadow-[0_5px_14px_rgba(20,32,46,0.08)]">
        <MapPin className="mx-auto text-[#111111]" size={22} />
        <p className="mt-1 text-[13px] font-medium text-[#3f4855]">지도 영역</p>
      </div>
    </div>
  );
}

function getSimilarJobReasons(baseJob: Job, similarJob: Job) {
  const reasons: string[] = [];

  if ((baseJob.role ?? baseJob.jobCategory) && (baseJob.role ?? baseJob.jobCategory) === (similarJob.role ?? similarJob.jobCategory)) {
    reasons.push(`${baseJob.role ?? baseJob.jobCategory} 직무 일치`);
  } else if (similarJob.jobSubcategoryIds.some((id) => baseJob.jobSubcategoryIds.includes(id))) {
    reasons.push("직무 분류 유사");
  }

  const sharedKeyword = (similarJob.coreKeywords ?? []).find((tag) => (baseJob.coreKeywords ?? []).includes(tag));
  if (sharedKeyword) {
    reasons.push(`${sharedKeyword} 키워드 일치`);
  }

  if ((baseJob.industry ?? baseJob.category) === (similarJob.industry ?? similarJob.category)) {
    reasons.push(`${baseJob.industry ?? baseJob.category} 산업`);
  }

  if (baseJob.regionId === similarJob.regionId) {
    reasons.push(`${similarJob.location.split(" ")[0]}권 근무지`);
  }

  return reasons.slice(0, 2);
}

function SimilarCompanyLogo({ job }: { job: Job }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(job.logoUrl) && !imageFailed;
  const fallback = getCompanyInitial(job.company).slice(0, 1) || "더";

  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#dfe5ec] bg-[#f4f5f6] text-[12px] font-medium text-[#2f3845]">
      {showImage ? (
        <img src={job.logoUrl} alt={`${job.company} 로고`} className="h-full w-full rounded-full object-contain p-1" onError={() => setImageFailed(true)} />
      ) : (
        fallback
      )}
    </span>
  );
}

/** 직무/지역/키워드가 비슷한 공고 카드 그리드. 트랙에 상관없이 동일한 카드 스타일을 쓴다. */
/**
 * 사이드바에 있던 "더파마 매칭"(matchReasons/matchKeywords)을 본문 "비슷한 공고" 섹션에 흡수한 것.
 * matchReasons/matchKeywords가 없으면(연구 트랙 등) 공고 카드 그리드만 렌더링된다.
 */
export function SimilarJobs({
  baseJob,
  jobs,
  savedIds,
  onToggleSave,
  matchReasons,
  matchKeywords,
}: {
  baseJob: Job;
  jobs: Job[];
  savedIds: Set<number>;
  onToggleSave: (jobId: number) => void;
  matchReasons?: string[];
  matchKeywords?: string[];
}) {
  return (
    <div>
      {matchReasons && matchReasons.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <Sparkles size={15} className="mr-0.5 shrink-0 text-[#6b7280]" />
          {matchReasons.map((reason) => (
            <span key={reason} className="border border-[#d7dce2] bg-white px-2 py-1 text-[11px] font-medium text-[#2f3845]">
              {reason}
            </span>
          ))}
        </div>
      ) : null}

      {!jobs.length ? (
        <p className="text-[14px] font-normal text-[#667181]">조건이 비슷한 공고를 준비 중입니다.</p>
      ) : (
        <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-[720px]:flex max-[720px]:overflow-x-auto">
          {jobs.slice(0, 4).map((similarJob) => {
            const reasons = getSimilarJobReasons(baseJob, similarJob);
            const card = (
              <article className="group h-full rounded-[var(--radius)] border border-border bg-white p-4 transition hover:border-brand/45 hover:bg-[#fbfbfb] max-[720px]:w-[270px] max-[720px]:shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <SimilarCompanyLogo job={similarJob} />
                    <p className="min-w-0 truncate text-[12px] font-medium text-[#596373]">{similarJob.company}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onToggleSave(similarJob.id);
                    }}
                    className={clsx("grid h-8 w-8 shrink-0 place-items-center", savedIds.has(similarJob.id) ? "text-brand" : "text-[#8a95a5] hover:bg-[#f4f7f9] hover:text-brand")}
                    aria-label={`${similarJob.title} 저장`}
                  >
                    <Bookmark size={18} fill={savedIds.has(similarJob.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-bold leading-[1.4] text-[#2b3340]">{similarJob.title}</h3>
                <p className="mt-2 text-[12px] font-medium text-[#7d8796]">
                  {careerLabel(similarJob)} · {similarJob.employmentType} · {similarJob.location}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {reasons.map((reason) => (
                    <span key={reason} className="border border-[#d7dce2] bg-white px-2 py-1 text-[11px] font-medium text-[#2f3845]">
                      {reason}
                    </span>
                  ))}
                  {(similarJob.coreKeywords ?? []).slice(0, Math.max(0, 2 - reasons.length)).map((tag) => (
                    <span key={tag} className="border border-[#d7dce2] bg-white px-2 py-1 text-[11px] font-medium text-[#2f3845]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );

            return similarJob.slug && hasJobDetail(similarJob.slug) ? (
              <Link key={similarJob.id} href={`/jobs/${similarJob.slug}`} className="block rounded-[var(--radius)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.2)]">
                {card}
              </Link>
            ) : (
              <div key={similarJob.id}>{card}</div>
            );
          })}
        </div>
      )}

      {matchKeywords && matchKeywords.length > 0 ? (
        <div className="mt-5 border-t border-[#f0f2f5] pt-4">
          <h3 className="text-[13px] font-medium text-[#7d8796]">매칭 키워드</h3>
          <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-1.5">
            {matchKeywords.map((keyword) => (
              <span key={keyword} className="text-[13px] font-medium text-[#667181]">
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── 트랙 상세(약국/산업 등) 공용 로컬 UI 조각 ──────────────────────────────────
// PharmacyJobDetailV2.tsx/IndustryJobDetailClient.tsx가 각자 로컬로 두고 있던
// 것을 그대로 승격한 것. 클래스·구조는 원본과 동일하게 유지한다.

export function firstWords(text: string, count: number): string {
  return text.split(" ").slice(0, count).join(" ");
}

/**
 * SectionShell(위)과 동일한 카드 셸(배경/border/shadow/radius/padding)을 그대로 쓰되,
 * title이 string 전용이라 아이콘 슬롯이 없어 제목 옆 아이콘만 추가로 지원하는 버전.
 */
export function IconSectionShell({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
      <h2 className="flex items-center gap-2 text-[26px] font-bold tracking-[-0.02em] text-[#242b36]">
        <Icon size={18} className="shrink-0 text-[#6b7280]" aria-hidden />
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** 상단 3열 요약 카드 그리드. SummaryStatCell과 함께 써서 라벨/값 크기·weight·여백·정렬·아이콘이 구조적으로 항상 같게 만든다. */
export function SummaryStatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-3 gap-4 max-[720px]:grid-cols-1">{children}</div>;
}

export function SummaryStatCell({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-5 text-center">
      <Icon size={20} className="mx-auto text-[#6b7280]" aria-hidden />
      <p className="mt-2 text-[12.5px] font-medium text-[#8893a2]">{label}</p>
      <div className="mt-2 text-[17px] font-bold leading-snug text-[#2f3845]">{value}</div>
      {caption ? <p className="mt-1 text-[12px] font-normal text-[#a0a9b7]">{caption}</p> : null}
    </div>
  );
}

/** 지도 SDK 없이 쓰는 자리표시자. 격자 패턴+핀+카드에 기관명(약국명/기업명)을 표시한다. */
export function MapPlaceholder({ address, orgName }: { address: string; orgName: string }) {
  return (
    <div className="relative grid h-[190px] place-items-center overflow-hidden border border-dashed border-[#cbd8df] bg-[#f3f3f3]">
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(#dedede 1px, transparent 1px), linear-gradient(90deg, #dedede 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative z-10 border border-[#d7dde5] bg-white px-5 py-3 text-center shadow-[0_5px_14px_rgba(20,32,46,0.08)]">
        <MapPin className="mx-auto text-[#6b7280]" size={20} aria-hidden />
        <p className="mt-1 text-[13px] font-bold text-[#2f3845]">{orgName}</p>
        <p className="mt-0.5 text-[11.5px] font-normal text-[#8993a1]">{address}</p>
      </div>
    </div>
  );
}

/** "라벨 + 값" 가로 정렬 행. 여러 개를 divide-y로 묶어 옅은 구분선의 리스트를 만든다(박스 나열 대체). */
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-6 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-x-0 max-[560px]:gap-y-1">
      <span className="text-[13px] font-medium text-[#8993a1]">{label}</span>
      <span className="min-w-0 text-left text-[14px] font-normal leading-relaxed text-[#2f3845]">
        {value}
      </span>
    </div>
  );
}

export function InfoRowList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-[#f0f2f5]">{children}</div>;
}

// ── 지원 CTA 공통 카드 ──────────────────────────────────────────────────────────

export type ApplyMethodId = "quick" | "homepage" | "email" | "phone" | "sms" | "guide";

const APPLY_METHOD_LABELS: Record<ApplyMethodId, string> = {
  quick: "간편지원",
  homepage: "기업 홈페이지 지원",
  email: "이메일 지원",
  phone: "전화 지원",
  sms: "문자 지원",
  guide: "별도 안내",
};

const APPLY_BUTTON_LABELS: Record<ApplyMethodId, string> = {
  quick: "간편지원하기",
  homepage: "지원하기",
  email: "이메일 지원하기",
  phone: "전화번호 확인",
  sms: "문자 지원하기",
  guide: "지원 방법 확인",
};

const APPLY_GATED_LABELS: Partial<Record<ApplyMethodId, string>> = {
  email: "지원 이메일",
  phone: "전화번호",
  sms: "문자 연락처",
};

const APPLY_GATED_MESSAGES: Partial<Record<ApplyMethodId, string>> = {
  email: "로그인 후 지원 이메일을 확인할 수 있습니다.",
  phone: "전화번호는 로그인 후 확인할 수 있습니다.",
  sms: "연락처는 로그인 후 확인할 수 있습니다.",
};

/**
 * 사이드바 지원 카드. method별로 버튼 문구와 하단 게이트/안내 영역만 분기하고,
 * 껍데기(카드 톤·타이포)는 PharmacyJobDetailV2/IndustryJobDetailClient가 쓰던 것을 그대로 계승한다.
 * 저장/공유는 JobDetailActionRow(히어로)로 옮겨졌으므로 이 카드는 순수 지원 CTA만 담당한다.
 */
export function ApplyCard({
  deadlineLabel,
  method,
  target,
  notice,
  isLoggedIn,
}: {
  deadlineLabel: string;
  method: ApplyMethodId;
  target: string;
  notice?: string;
  isLoggedIn: boolean;
}) {
  const gatedLabel = APPLY_GATED_LABELS[method];
  const gatedMessage = APPLY_GATED_MESSAGES[method];

  return (
    <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
      <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
      <h2 className="mt-2 text-[30px] font-bold text-brand">{deadlineLabel}</h2>
      <p className="mt-2 text-[13px] font-medium text-[#8993a1]">{APPLY_METHOD_LABELS[method]}</p>

      <button
        type="button"
        onClick={method === "homepage" ? () => window.open(target, "_blank", "noopener,noreferrer") : undefined}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-medium text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
      >
        {APPLY_BUTTON_LABELS[method]}
      </button>

      {method === "homepage" ? (
        <p className="mt-3 text-center text-[12px] font-normal text-[#a0a9b7]">외부 기업 채용 페이지로 이동합니다.</p>
      ) : null}

      {gatedLabel && gatedMessage ? (
        isLoggedIn ? (
          <div className="mt-4 border-t border-[#e6ecf1] pt-4">
            <p className="text-[12px] font-medium text-[#8993a1]">{gatedLabel}</p>
            <p className="mt-1 break-all text-[13px] font-normal text-[#3f4855]">{target}</p>
          </div>
        ) : (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#a0a9b7]">
            <Lock size={12} />
            {gatedMessage}
          </p>
        )
      ) : null}

      {notice ? (
        <p className="mt-4 bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">{notice}</p>
      ) : null}
    </section>
  );
}

// ── 히어로 액션 로우 (로고+기업명+관심기업 / 저장+공유) ─────────────────────────────

/**
 * 히어로 텍스트 영역 상단에 얹는 기업 정보 + 액션 묶음.
 * 왼쪽: [로고]+기업명+관심기업(기업 단위 액션), 오른쪽: 저장·공유(공고 단위 액션).
 * showLogo=false인 트랙(약국)은 로고 자리를 만들지 않고 기업명부터 시작한다.
 * 모바일(≤560px)에서는 로고+기업명 행 아래로 관심기업 버튼이 full-width로 내려가고,
 * 저장·공유는 기존 모바일 하단바가 담당하므로 여기서는 숨긴다.
 */
export function JobDetailActionRow({
  orgName,
  showLogo,
  logoUrl,
  saved,
  onToggleSave,
  interested,
  onToggleInterest,
  onShare,
}: {
  orgName: string;
  showLogo: boolean;
  logoUrl?: string;
  saved: boolean;
  onToggleSave: () => void;
  interested: boolean;
  onToggleInterest: () => void;
  onShare: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 max-[560px]:w-full max-[560px]:flex-col max-[560px]:items-start">
        <div className="flex items-center gap-3">
          {showLogo ? <CompanyLogo name={orgName} logoText="" logoUrl={logoUrl} size="sm" /> : null}
          <p className="text-[15px] font-normal text-[#667181]">{orgName}</p>
        </div>

        <button
          type="button"
          onClick={onToggleInterest}
          className={clsx(
            "inline-flex h-8 items-center gap-1.5 border bg-white px-3 text-[12px] font-medium transition max-[560px]:h-10 max-[560px]:w-full max-[560px]:justify-center",
            interested ? "border-brand text-brand" : "border-[#dfe5ec] text-[#596373] hover:border-brand hover:text-brand",
          )}
        >
          <Heart size={14} fill={interested ? "currentColor" : "none"} />
          {interested ? "관심 기업 등록됨" : "관심 기업 등록"}
        </button>
      </div>

      <div className="flex shrink-0 gap-2 max-[560px]:hidden">
        <ActionIconButton label={saved ? "공고 저장 해제" : "공고 저장"} onClick={onToggleSave} active={saved}>
          <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
        </ActionIconButton>
        <ActionIconButton label="공고 공유" onClick={onShare}>
          <Share2 size={17} />
        </ActionIconButton>
      </div>
    </div>
  );
}

/** 공고 상세(산업·약국·병원·연구 V2 공통) "기관 정보" 섹션 하단 CTA 3버튼 — 기업 인사이트
 * (/companies/{companyId}, /reviews, /interviews)로 연결한다. companyId가 없는 경우(예: 산업·연구의
 * 미승격 기관) 호출부에서 아예 렌더하지 않으므로 이 컴포넌트는 항상 유효한 companyId를 받는다고 가정한다.
 * `detailLabel`은 첫 버튼 문구만 바꾼다 — 병원·약국·연구는 "기관 정보 더보기"(기관 단위 명칭에 더 맞음), 산업은
 * 기본값 "기업 정보 더보기"를 그대로 쓴다. 나머지 두 버튼("기업 리뷰 보기"/"면접 후기 보기")은 4트랙 공통이다. */
export function CompanyCtaButtons({ companyId, detailLabel = "기업 정보 더보기" }: { companyId: string; detailLabel?: string }) {
  return (
    <div className="mt-9 flex flex-wrap gap-2 max-[640px]:flex-col">
      <Link
        href={`/companies/${companyId}`}
        className="inline-flex h-11 flex-1 items-center justify-center bg-brand px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
      >
        {detailLabel}
      </Link>
      <Link
        href={`/companies/${companyId}/reviews`}
        className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
      >
        기업 리뷰 보기
      </Link>
      <Link
        href={`/companies/${companyId}/interviews`}
        className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
      >
        면접 후기 보기
      </Link>
    </div>
  );
}
