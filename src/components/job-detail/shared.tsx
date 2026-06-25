"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, MapPin, ShieldCheck } from "lucide-react";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { getPharmacyCoverImage } from "@/utils/pharmacyImage";
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
  const showImage = Boolean(logoUrl) && !imageFailed;
  const boxSize = size === "lg" ? "h-[68px] w-[68px]" : "h-[46px] w-[46px]";
  const boxPx = size === "lg" ? 68 : 46;

  if (!showImage) {
    return <EntityLogo name={name} logoText={logoText} size={boxPx} className="shrink-0" />;
  }

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-[var(--radius)] border border-border bg-white shadow-[0_3px_10px_rgba(20,32,46,0.04)]",
        boxSize,
      )}
      aria-label={`${name} 로고`}
    >
      <img src={logoUrl} alt={`${name} 로고`} className="h-full w-full object-contain p-2" onError={() => setImageFailed(true)} />
    </div>
  );
}

export function HeaderTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3 py-1.5 text-[13px] font-normal text-[#4f5a66]">
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

  const sharedKeyword = similarJob.tags.find((tag) => [...baseJob.tags, ...(baseJob.coreKeywords ?? [])].includes(tag));
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
  const fallback = job.company.replace(/\(.*?\)/g, "").trim().slice(0, 1) || "더";

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
export function SimilarJobs({
  baseJob,
  jobs,
  savedIds,
  onToggleSave,
}: {
  baseJob: Job;
  jobs: Job[];
  savedIds: Set<number>;
  onToggleSave: (jobId: number) => void;
}) {
  if (!jobs.length) {
    return <p className="text-[14px] font-normal text-[#667181]">조건이 비슷한 공고를 준비 중입니다.</p>;
  }

  return (
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
                <span key={reason} className="rounded-[var(--radius)] border border-[#dfe5ec] bg-[#f4f5f6] px-2 py-1 text-[11px] font-medium text-[#4f5a66]">
                  {reason}
                </span>
              ))}
              {similarJob.tags.slice(0, Math.max(0, 2 - reasons.length)).map((tag) => (
                <span key={tag} className="rounded-[var(--radius)] border border-[#e4e8ef] bg-white px-2 py-1 text-[11px] font-medium text-[#777f8c]">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        );

        return similarJob.slug ? (
          <Link key={similarJob.id} href={`/jobs/${similarJob.slug}`} className="block rounded-[var(--radius)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-[rgba(17,17,17,0.2)]">
            {card}
          </Link>
        ) : (
          <div key={similarJob.id}>{card}</div>
        );
      })}
    </div>
  );
}
