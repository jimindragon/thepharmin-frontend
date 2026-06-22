"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Heart,
  Home,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  WalletCards,
  X,
} from "lucide-react";
import type {
  Company,
  CompanyNewsArticle,
  CompanyReview,
  CompanyReviewType,
  FormattedContent,
  Job,
  ReviewAccessState,
} from "@/types/jobs";

interface JobDetailClientProps {
  job: Job;
  company: Company | null;
  similarJobs: Job[];
  reviews: CompanyReview[];
  reviewAccess: ReviewAccessState;
}

interface SectionItem {
  id: string;
  label: string;
  visible: boolean;
}

const saveStorageKey = "thepharmin:saved-jobs";

function readSavedJobs() {
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

function writeSavedJobs(ids: Set<number>) {
  window.localStorage.setItem(saveStorageKey, JSON.stringify(Array.from(ids)));
}

function careerLabel(job: Job) {
  return job.career.replace(/^경력\s*/, "");
}

function deadlineLabel(job: Job) {
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

function deadlineDetail(job: Job) {
  if (job.deadlineType === "untilHired" || job.closingStatus === "always") {
    return "채용 시 마감";
  }

  return job.deadlineDate;
}

function applyButtonLabel(job: Job) {
  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원") {
    return "더파마 리크루트로 지원하기";
  }

  if (job.applyMethod === "기업 홈페이지 지원") {
    return "기업 홈페이지에서 지원하기";
  }

  if (job.applyMethod === "이메일 지원") {
    return "이메일로 지원하기";
  }

  return "지원 안내 확인하기";
}

function applyNotice(job: Job) {
  if (job.applyMethod === "기업 홈페이지 지원") {
    return job.applicationNotice ?? "지원 시 기업 채용 페이지로 이동합니다. 지원 결과와 전형 진행은 해당 기업에서 관리됩니다.";
  }

  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원") {
    return "지원서 제출 후 마이페이지에서 지원 현황을 확인할 수 있습니다.";
  }

  if (job.applyMethod === "이메일 지원") {
    return "이력서와 제출서류를 첨부해 지정된 이메일로 지원해 주세요.";
  }

  return job.applicationGuide ?? "공고 본문에 안내된 지원 방법을 확인해 주세요.";
}

function applyHref(job: Job) {
  if (job.applyMethod === "기업 홈페이지 지원") {
    return job.applicationUrl;
  }

  if (job.applyMethod === "이메일 지원" && job.applicationEmail) {
    return `mailto:${job.applicationEmail}`;
  }

  if (job.applyMethod === "간편 지원" || job.applyMethod === "더파마 간편지원") {
    return `/jobs/${job.slug ?? job.id}/apply`;
  }

  return undefined;
}

function getCoverImage(job: Job, company: Company | null) {
  if (job.coverImageMode === "upload" && job.coverImageUrl) {
    return job.coverImageUrl;
  }

  if (job.coverImageMode === "company") {
    return company?.coverImage ?? company?.defaultImage ?? job.coverImage;
  }

  if (job.coverImageMode === "none") {
    return undefined;
  }

  return job.coverImageUrl ?? job.coverImage ?? company?.coverImage ?? company?.defaultImage;
}

function getVisibleJobTags(job: Job) {
  return [
    job.role ?? job.jobCategory ?? job.tags[0],
    job.industry ?? job.category,
    careerLabel(job),
    job.education,
    job.employmentType,
    job.location,
  ].filter(Boolean).slice(0, 6);
}

function getCompanyNewsForJob(job: Job): CompanyNewsArticle[] {
  if (job.companyNews?.length) {
    return job.companyNews.slice(0, 3);
  }

  return [
    {
      id: "fallback-regulatory",
      type: "regulatory",
      label: "인허가 동향",
      title: "RA 직무가 확인해야 할 허가 심사 자료 관리 기준",
      publishedAt: "2026.06.04",
      source: "더파마뉴스",
      summary: "의약품 허가 심사와 CTD 제출 과정에서 확인해야 할 최신 규제 흐름을 정리했습니다.",
      keywords: ["RA", "CTD", "허가심사"],
      url: "https://www.thepharmanews.com/news/regulatory-guide",
    },
    {
      id: "fallback-industry",
      type: "industry",
      label: "산업 뉴스",
      title: "제약·바이오 기업, 글로벌 인허가 역량 강화 움직임",
      publishedAt: "2026.05.28",
      source: "더파마뉴스",
      summary: "해외 허가와 파트너십 확대에 따라 RA, 품질, 사업개발 협업의 중요성이 커지고 있습니다.",
      keywords: ["제약·바이오", "글로벌 인허가", job.role ?? job.jobCategory ?? "채용"],
      url: "https://www.thepharmanews.com/news/global-ra",
    },
  ];
}

function CompanyLogo({
  name,
  logoText,
  logoUrl,
  logoColor,
  logoAccent,
  size = "lg",
}: {
  name: string;
  logoText: string;
  logoUrl?: string;
  logoColor: string;
  logoAccent?: string;
  size?: "sm" | "lg";
}) {
  const boxSize = size === "lg" ? "h-[68px] w-[68px]" : "h-[46px] w-[46px]";
  const shapeSize = size === "lg" ? "h-[22px] w-[22px]" : "h-[16px] w-[16px]";
  const textSize = size === "lg" ? "text-[12px]" : "text-[8px]";

  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-[var(--radius)] border border-border bg-white shadow-[0_3px_10px_rgba(20,32,46,0.04)]",
        boxSize,
      )}
      aria-label={`${name} 로고`}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={`${name} 로고`} className="h-full w-full object-contain p-2" />
      ) : (
        <>
          <div className={clsx("relative", size === "lg" ? "h-9 w-[52px]" : "h-6 w-9")}>
            <span
              className={clsx("absolute rounded-full opacity-90", shapeSize)}
              style={{ backgroundColor: logoColor, left: size === "lg" ? 5 : 3, top: size === "lg" ? 8 : 5 }}
            />
            <span
              className={clsx("absolute rounded-full opacity-80", shapeSize)}
              style={{ backgroundColor: logoAccent ?? logoColor, right: size === "lg" ? 5 : 3, top: size === "lg" ? 8 : 5 }}
            />
            <span
              className={clsx("absolute rounded-full opacity-70", shapeSize)}
              style={{ backgroundColor: logoColor, left: size === "lg" ? 19 : 11, bottom: 0 }}
            />
          </div>
          <span className={clsx("-mt-1 max-w-[58px] truncate font-black", textSize)} style={{ color: logoColor }}>
            {logoText}
          </span>
        </>
      )}
    </div>
  );
}

function HeaderTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3 py-1.5 text-[13px] font-extrabold text-[#4f5a66]">
      {children}
    </span>
  );
}

function ActionIconButton({
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
        "grid h-11 w-11 shrink-0 place-items-center rounded-[var(--radius)] border bg-white transition",
        active
          ? "border-brand text-brand shadow-[0_4px_14px_rgba(17,17,17,0.14)]"
          : "border-border text-[#818b98] hover:border-brand hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

function DefaultCover({ job }: { job: Job }) {
  return (
    <div className="relative h-[286px] overflow-hidden border-t border-border bg-[#071115] max-[720px]:h-[210px]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 88% 20%, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 18%, transparent 19%), radial-gradient(circle at 82% 88%, rgba(255,255,255,0.10) 0, rgba(255,255,255,0.10) 16%, transparent 17%), linear-gradient(115deg, #071115 0%, #2b2f34 44%, #777b80 74%, #b7babd 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.22)_58%,rgba(0,0,0,0.04)_100%)]" />
      <div className="absolute left-8 top-8 flex items-center gap-4 max-[720px]:left-5 max-[720px]:top-5">
        <CompanyLogo
          name={job.company}
          logoText={job.logoText}
          logoColor={job.logoColor}
          logoAccent={job.logoAccent}
          size="sm"
        />
        <div>
          <p className="text-[14px] font-black text-white">{job.company}</p>
          <p className="mt-1 text-[12px] font-bold text-white/66">{job.industry ?? job.category} · {job.role ?? job.jobCategory ?? "채용"}</p>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 right-8 max-w-[720px] max-[720px]:bottom-6 max-[720px]:left-5 max-[720px]:right-5">
        <p className="text-[15px] font-black text-white/78">THE PHARMA Recruit</p>
        <p className="mt-2 text-[28px] font-black leading-[1.25] text-white max-[720px]:text-[22px]">{job.company}</p>
      </div>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
      <p className="text-[12px] font-black text-[#8893a2]">{label}</p>
      <p className="mt-1.5 text-[15px] font-extrabold text-[#2f3845]">{value}</p>
    </div>
  );
}

function SectionShell({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
      <h2 className="text-[22px] font-black tracking-[0] text-[#242b36]">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function FormattedContentView({ content, fallback }: { content?: FormattedContent; fallback?: string[] }) {
  const normalized = content ?? (fallback ? { format: "bullet" as const, items: fallback } : undefined);

  if (!normalized || normalized.items.length === 0) {
    return null;
  }

  if (normalized.format === "paragraph") {
    return (
      <div className="space-y-3 text-[16px] font-semibold leading-[1.85] text-[#3f4855]">
        {normalized.items.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    );
  }

  const ListTag = normalized.format === "numbered" ? "ol" : "ul";

  return (
    <ListTag className={clsx("space-y-3 text-[15px] font-semibold leading-[1.75] text-[#3f4855]", normalized.format === "numbered" && "list-decimal pl-5")}>
      {normalized.items.map((item, index) => (
        <li key={`${item}-${index}`} className={normalized.format === "bullet" ? "flex gap-2.5" : undefined}>
          {normalized.format === "bullet" ? <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#111111]" /> : null}
          <span>{item}</span>
        </li>
      ))}
    </ListTag>
  );
}

function AdditionalMaterials({ job }: { job: Job }) {
  const legacyImages = (job.detailBlocks ?? [])
    .filter((block) => block.type === "image" && block.url)
    .map((block) => ({ url: block.url as string, alt: block.alt ?? block.title ?? "채용 소개 이미지", title: block.title }));
  const legacyFiles = (job.detailBlocks ?? [])
    .filter((block) => block.type === "file" && block.url)
    .map((block) => ({ name: block.fileName ?? block.title ?? "첨부 자료", url: block.url as string, description: block.content }));
  const images = [...(job.additionalMaterials?.images ?? []), ...legacyImages];
  const files = [...(job.additionalMaterials?.files ?? []), ...legacyFiles];

  if (!images.length && !files.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {images.length ? (
        <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
          {images.map((image) => (
            <figure key={image.url} className="overflow-hidden rounded-[var(--radius)] border border-border bg-[#fbfcfd]">
              <img src={image.url} alt={image.alt} className="h-[180px] w-full object-cover" />
              {image.title ? <figcaption className="px-4 py-3 text-[13px] font-bold text-[#687382]">{image.title}</figcaption> : null}
            </figure>
          ))}
        </div>
      ) : null}
      {files.length ? (
        <div className="grid gap-2">
          {files.map((file) => (
            <a
              key={file.url}
              href={file.url}
              className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-4 py-3 transition hover:border-[#111111]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius)] bg-[#f4f5f6] text-[#4f5a66]">
                  <FileText size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-black text-[#2f3845]">{file.name}</span>
                  {file.description ? <span className="mt-0.5 block truncate text-[12px] font-bold text-[#8a95a5]">{file.description}</span> : null}
                </span>
              </span>
              <Download size={17} className="shrink-0 text-[#8a95a5]" />
            </a>
          ))}
        </div>
      ) : null}
      <p className="text-[12px] font-bold leading-[1.6] text-[#8a95a5]">기업이 제공한 채용 소개 이미지와 첨부 자료입니다.</p>
    </div>
  );
}

function WorkConditions({ job }: { job: Job }) {
  const items = job.workConditionItems ?? job.workConditions?.map((item) => {
    const [label, ...rest] = item.split(":");
    return { label, value: rest.join(":").trim() || item };
  }) ?? [];
  const [expanded, setExpanded] = useState(false);
  const benefitItems = job.benefits ?? [];
  const visibleBenefits = expanded ? benefitItems : benefitItems.slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        {items.map((item) => (
          <div key={item.label} className="rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3.5">
            <p className="text-[12px] font-black text-[#8893a2]">{item.label}</p>
            <p className="mt-1.5 text-[15px] font-extrabold leading-[1.55] text-[#2f3845]">{item.value}</p>
          </div>
        ))}
      </div>
      {benefitItems.length > 0 ? (
        <div>
          <h3 className="text-[15px] font-black text-[#303947]">복리후생</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {visibleBenefits.map((benefit) => (
              <span key={benefit} className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-3.5 py-2 text-[13px] font-extrabold text-[#4f5a66]">
                {benefit}
              </span>
            ))}
            {benefitItems.length > 5 ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="rounded-[var(--radius)] border border-brand bg-white px-3.5 py-2 text-[13px] font-black text-brand transition hover:bg-brand-soft"
              >
                {expanded ? "접기" : `더 보기 ${benefitItems.length - 5}개`}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {job.workConditionDetail ? (
        <div className="rounded-[var(--radius)] border border-[#e2e8ef] bg-white px-4 py-3.5">
          <p className="text-[12px] font-black text-[#8893a2]">근무조건 상세</p>
          <p className="mt-1.5 text-[14px] font-semibold leading-[1.7] text-[#3f4855]">{job.workConditionDetail}</p>
        </div>
      ) : null}
    </div>
  );
}

function HiringProcess({ steps }: { steps?: string[] }) {
  if (!steps?.length) {
    return null;
  }

  return (
    <div>
      <div className="grid grid-cols-5 gap-2 max-[960px]:grid-cols-3 max-[640px]:grid-cols-1">
        {steps.map((step, index) => (
          <div key={step} className="relative rounded-[var(--radius)] border border-[#dfe7ee] bg-[#fbfcfd] px-3.5 py-4 text-center">
            <span className="mx-auto grid h-8 w-8 place-items-center rounded-[var(--radius)] bg-brand text-[13px] font-black text-white">
              {index + 1}
            </span>
            <p className="mt-2.5 text-[13px] font-extrabold text-[#3f4855]">{step}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12px] font-bold text-[#8a95a5]">채용 절차와 일정은 기업 사정에 따라 변경될 수 있습니다.</p>
    </div>
  );
}

function CompanyNewsSection({ job }: { job: Job }) {
  const articles = getCompanyNewsForJob(job);
  const hasDirectCompanyNews = Boolean(job.companyNews?.some((article) => article.type === "company"));

  return (
    <div>
      {!hasDirectCompanyNews ? (
        <p className="mb-4 rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-bold leading-[1.6] text-[#7d8796]">
          아직 이 기업과 직접 관련된 기사가 없습니다. 대신 이 공고와 관련된 제약·바이오 산업 뉴스를 확인해 보세요.
        </p>
      ) : null}
      <div className="grid grid-cols-3 gap-3 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1">
        {articles.map((article) => (
          <article key={article.id} className="rounded-[var(--radius)] border border-[#e0e6ee] bg-white p-4 transition hover:border-[#111111]">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-[var(--radius)] bg-[#f4f5f6] px-2.5 py-1 text-[11px] font-black text-[#4f5a66]">{article.label}</span>
              <span className="text-[11px] font-bold text-[#9aa4b2]">{article.publishedAt}</span>
            </div>
            <h3 className="mt-3 line-clamp-2 text-[15px] font-black leading-[1.45] text-[#252d39]">{article.title}</h3>
            <p className="mt-2 line-clamp-2 text-[13px] font-semibold leading-[1.65] text-[#667181]">{article.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {article.keywords.slice(0, 3).map((keyword) => (
                <span key={keyword} className="rounded-[var(--radius)] border border-[#e4e9ef] bg-[#fbfcfd] px-2 py-1 text-[11px] font-bold text-[#687382]">
                  {keyword}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 text-[12px] font-bold text-[#8a95a5]">
              <span>출처: {article.source}</span>
              <a href={article.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-black text-[#2f3845] hover:text-brand">
                기사 보기
                <ExternalLink size={13} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MapPlaceholder({ job, company }: { job: Job; company: Company | null }) {
  const detail = job.locationDetail;
  const address = detail?.address ?? job.address ?? company?.address;
  const addressLabel = detail?.address || job.address ? "주소" : "기업 대표 주소";

  return (
    <div className="grid gap-4">
      {address ? (
        <div className="relative grid h-[190px] place-items-center overflow-hidden rounded-[var(--radius)] border border-dashed border-[#cbd8df] bg-[#f3f3f3]">
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage:
                "linear-gradient(#dedede 1px, transparent 1px), linear-gradient(90deg, #dedede 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="relative z-10 rounded-[var(--radius)] border border-[#d7dde5] bg-white px-5 py-3 text-center shadow-[0_5px_14px_rgba(20,32,46,0.08)]">
            <MapPin className="mx-auto text-[#111111]" size={22} />
            <p className="mt-1 text-[13px] font-black text-[#3f4855]">지도 영역</p>
          </div>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 max-[720px]:grid-cols-1">
        <OverviewCard label="근무지역" value={job.location} />
        {address ? <OverviewCard label={addressLabel} value={address} /> : <OverviewCard label="상세 주소" value="상세 주소는 지원 과정에서 기업을 통해 확인해 주세요." />}
        {detail?.building ? <OverviewCard label="건물" value={detail.building} /> : null}
        {detail?.nearestStation ? <OverviewCard label="가까운 역" value={detail.nearestStation} /> : null}
        {detail?.walkingTime ? <OverviewCard label="도보" value={detail.walkingTime} /> : null}
        {detail?.workMode ? <OverviewCard label="근무 방식" value={detail.workMode} /> : null}
      </div>
    </div>
  );
}

function ReviewWriteModal({
  companyName,
  jobTitle,
  open,
  onClose,
  onComplete,
}: {
  companyName: string;
  jobTitle: string;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [type, setType] = useState<CompanyReviewType>("interview");
  const [content, setContent] = useState("");
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => firstButtonRef.current?.focus(), 30);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        document.querySelectorAll<HTMLElement>("[data-review-modal] button, [data-review-modal] textarea"),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(16,24,32,0.42)] px-4" role="presentation">
      <section
        data-review-modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        className="w-full max-w-[520px] rounded-[var(--radius)] border border-border bg-white p-6 shadow-[0_20px_60px_rgba(16,24,32,0.18)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-black text-brand">후기 작성</p>
            <h2 id="review-modal-title" className="mt-1 text-[22px] font-black text-[#202734]">
              열람권 받기
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-[var(--radius)] border border-border text-[#7d8796] hover:border-brand hover:text-brand"
            aria-label="후기 작성 닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2" role="tablist" aria-label="후기 유형 선택">
          {[
            { id: "interview", label: "면접 후기" },
            { id: "company", label: "회사 후기" },
          ].map((tab) => (
            <button
              key={tab.id}
              ref={tab.id === "interview" ? firstButtonRef : undefined}
              type="button"
              role="tab"
              aria-selected={type === tab.id}
              onClick={() => setType(tab.id as CompanyReviewType)}
              className={clsx(
                "h-11 rounded-[var(--radius)] border text-[14px] font-black transition",
                type === tab.id
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-[#dfe5ec] bg-white text-[#596373] hover:border-brand hover:text-brand",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 rounded-[var(--radius)] bg-[#f8fafb] p-4 text-[13px] font-bold text-[#596373]">
          <p>기업: {companyName}</p>
          <p>직무: {jobTitle}</p>
          <p className="leading-[1.6] text-[#7d8796]">익명으로 표시되며, 개인정보나 특정인을 식별할 수 있는 내용은 작성하지 마세요.</p>
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="후기를 간단히 작성해 주세요."
          className="mt-4 min-h-[128px] w-full resize-none rounded-[var(--radius)] border border-[#dfe5ec] px-4 py-3 text-[14px] font-semibold leading-[1.7] text-[#2f3845] outline-none transition placeholder:text-[#a3adba] focus:border-brand focus:ring-4 focus:ring-[rgba(17,17,17,0.12)]"
        />

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-[var(--radius)] border border-[#dfe5ec] px-5 text-[14px] font-black text-[#596373] hover:border-brand hover:text-brand"
          >
            취소
          </button>
          <button
            type="button"
            disabled={content.trim().length < 8}
            data-testid="review-submit"
            onClick={() => {
              setContent("");
              onComplete();
            }}
            className="h-11 rounded-[var(--radius)] bg-brand px-5 text-[14px] font-black text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)] disabled:cursor-not-allowed disabled:bg-[#c7c7c7]"
          >
            작성 완료
          </button>
        </div>
      </section>
    </div>
  );
}

function ReviewsSection({
  company,
  job,
  reviews,
  initialAccess,
}: {
  company: Company | null;
  job: Job;
  reviews: CompanyReview[];
  initialAccess: ReviewAccessState;
}) {
  const [tab, setTab] = useState<CompanyReviewType>("interview");
  const [remainingPasses, setRemainingPasses] = useState(initialAccess.remainingPasses);
  const [modalOpen, setModalOpen] = useState(false);
  const canRead = initialAccess.canRead || remainingPasses > 0;
  const visibleReviews = reviews.filter((review) => review.type === tab).slice(0, 2);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_230px] items-start gap-4 max-[900px]:grid-cols-1">
      <div className="min-w-0">
        <div className="inline-flex rounded-[var(--radius)] border border-[#dfe5ec] bg-[#f8fafb] p-1" role="tablist" aria-label="후기 유형">
          {[
            { id: "interview", label: "면접 후기" },
            { id: "company", label: "회사 후기" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id as CompanyReviewType)}
              className={clsx(
                "h-9 rounded-[var(--radius)] px-4 text-[13px] font-black transition",
                tab === item.id ? "bg-white text-brand shadow-[0_2px_8px_rgba(20,32,46,0.07)]" : "text-[#7d8796] hover:text-brand",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 max-[720px]:flex max-[720px]:overflow-x-auto">
          {visibleReviews.map((review) => (
            <article key={review.id} className="min-w-0 rounded-[var(--radius)] border border-[#e1e8ef] bg-[#fbfcfd] p-4 max-[720px]:w-[280px] max-[720px]:shrink-0">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-[var(--radius)] bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                  {review.type === "interview" ? "면접" : "회사"}
                </span>
                <span className="text-[11px] font-bold text-[#9aa5b2]">{review.writtenAt}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {review.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="rounded-[var(--radius)] border border-[#e4e9ef] bg-white px-2 py-1 text-[11px] font-bold text-[#687382]">
                    {tag}
                  </span>
                ))}
              </div>
              <p className={clsx("mt-3 text-[13px] font-semibold leading-[1.7] text-[#3f4855]", !canRead && "blur-[3px] select-none")}>
                {review.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-[#8a95a5]">
                <span>
                  {review.jobRole} · {review.authorStatus}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp size={12} />
                  {review.helpfulCount}
                </span>
              </div>
            </article>
          ))}
        </div>

        <Link
          href={`/companies/${company?.id ?? job.companyId ?? "thepharmin-pharma"}/reviews`}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-4 text-[14px] font-black text-[#4f5a66] transition hover:border-brand hover:text-brand"
        >
          {job.company} 기업정보·후기 페이지로 이동
          <ChevronRight size={16} />
        </Link>
      </div>

      <aside className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#fbfcfd] p-4">
        <h3 className="flex items-center gap-2 text-[16px] font-black text-[#202734]">
          <WalletCards size={17} className="text-[#4f5a66]" />
          후기 열람권
        </h3>
        <p className="mt-3 text-[14px] font-bold text-[#667181]">
          <span className="text-[24px] font-black text-[#111111]">{remainingPasses}</span>장 남음
        </p>
        <p className="mt-2 text-[12px] font-semibold leading-[1.6] text-[#667181]">후기를 작성하면 열람권을 추가로 받을 수 있습니다.</p>
        <p className="mt-2 text-[12px] font-semibold leading-[1.6] text-[#8a95a5]">면접 후기와 회사 후기를 확인할 수 있습니다.</p>
        {!canRead ? (
          <p className="mt-3 rounded-[var(--radius)] bg-white px-3 py-2 text-[12px] font-bold text-danger">열람권이 없어 후기 일부만 표시됩니다.</p>
        ) : null}
        <button
          type="button"
          data-testid="review-pass-cta"
          onClick={() => setModalOpen(true)}
          className="mt-4 h-10 w-full rounded-[var(--radius)] border border-[#111111] bg-white text-[13px] font-black text-[#111111] transition hover:bg-[#f4f4f4]"
        >
          후기 작성하고 열람권 받기
        </button>
      </aside>

      <ReviewWriteModal
        companyName={job.company}
        jobTitle={job.jobCategory ?? job.title}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onComplete={() => {
          setRemainingPasses((value) => value + 1);
          setModalOpen(false);
        }}
      />
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
  const fallback = job.company.replace(/\(.*?\)/g, "").trim().slice(0, 1) || "더";

  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#dfe5ec] bg-[#f4f5f6] text-[12px] font-black text-[#2f3845]">
      {job.logoUrl ? <img src={job.logoUrl} alt={`${job.company} 로고`} className="h-full w-full rounded-full object-contain p-1" /> : fallback}
    </span>
  );
}

function SimilarJobs({ baseJob, jobs, savedIds, onToggleSave }: { baseJob: Job; jobs: Job[]; savedIds: Set<number>; onToggleSave: (jobId: number) => void }) {
  if (!jobs.length) {
    return <p className="text-[14px] font-semibold text-[#667181]">조건이 비슷한 공고를 준비 중입니다.</p>;
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
                <p className="min-w-0 truncate text-[12px] font-black text-[#596373]">{similarJob.company}</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleSave(similarJob.id);
                }}
                className={clsx("grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius)]", savedIds.has(similarJob.id) ? "text-brand" : "text-[#8a95a5] hover:bg-[#f4f7f9] hover:text-brand")}
                aria-label={`${similarJob.title} 저장`}
              >
                <Bookmark size={18} fill={savedIds.has(similarJob.id) ? "currentColor" : "none"} />
              </button>
            </div>
            <h3 className="mt-2 line-clamp-2 min-h-[42px] text-[15px] font-black leading-[1.4] text-[#2b3340]">{similarJob.title}</h3>
            <p className="mt-2 text-[12px] font-bold text-[#7d8796]">
              {careerLabel(similarJob)} · {similarJob.employmentType} · {similarJob.location}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {reasons.map((reason) => (
                <span key={reason} className="rounded-[var(--radius)] border border-[#dfe5ec] bg-[#f4f5f6] px-2 py-1 text-[11px] font-black text-[#4f5a66]">
                  {reason}
                </span>
              ))}
              {similarJob.tags.slice(0, Math.max(0, 2 - reasons.length)).map((tag) => (
                <span key={tag} className="rounded-[var(--radius)] border border-[#e4e8ef] bg-white px-2 py-1 text-[11px] font-bold text-[#777f8c]">
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

export function JobDetailClient({ job, company, similarJobs, reviews, reviewAccess }: JobDetailClientProps) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());
  const [activeSection, setActiveSection] = useState("intro");
  const [shareMessage, setShareMessage] = useState("");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  const saved = savedIds.has(job.id);
  const isClosed = job.isClosed || deadlineLabel(job) === "마감";
  const applyUrl = applyHref(job);
  const canApply = !isClosed && Boolean(applyUrl);
  const coverImage = getCoverImage(job, company);

  const overview = useMemo(
    () => [
      { label: "경력", value: careerLabel(job) },
      { label: "학력", value: job.education },
      { label: "모집인원", value: job.headcount ?? "1명" },
      { label: "고용형태", value: job.employmentType },
      { label: "급여", value: job.salary },
      { label: "근무지역", value: job.location },
      { label: "접수마감", value: deadlineDetail(job) },
      { label: "지원방법", value: job.applyMethod },
    ],
    [job],
  );

  const sections: SectionItem[] = [
    { id: "intro", label: "포지션 소개", visible: Boolean(job.introduction || job.oneLineIntro) },
    {
      id: "qualifications",
      label: "업무·자격",
      visible: Boolean(
        job.responsibilitiesContent?.items.length ||
          job.responsibilities?.length ||
          job.requirementsContent?.items.length ||
          job.requirements?.length ||
          job.preferredContent?.items.length ||
          job.preferredQualifications?.length,
      ),
    },
    { id: "keywords", label: "핵심 키워드", visible: Boolean(job.coreKeywords?.length || job.tags.length) },
    { id: "work", label: "근무조건", visible: Boolean(job.workConditionItems?.length || job.workConditions?.length) },
    { id: "company", label: "기업정보", visible: true },
    { id: "news", label: "기업뉴스", visible: true },
    { id: "reviews", label: "후기·비슷한 공고", visible: true },
  ].filter((section) => section.visible);

  useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!nodes.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { rootMargin: "-130px 0px -58% 0px", threshold: [0.16, 0.32, 0.48] },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  const toggleSave = (jobId: number) => {
    setSavedIds((current) => {
      const next = new Set(current);

      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }

      writeSavedJobs(next);
      return next;
    });
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        setShareMessage("공유를 준비했습니다.");
        window.setTimeout(() => setShareMessage(""), 2200);
        void navigator
          .share({ title: job.title, text: `${job.company} ${job.title}`, url })
          .then(() => {
            setShareMessage("공유를 완료했습니다.");
            window.setTimeout(() => setShareMessage(""), 2200);
          })
          .catch(async () => {
            try {
              await navigator.clipboard.writeText(url);
              setShareMessage("공고 링크를 복사했습니다.");
            } catch {
              setShareMessage("공유를 완료하지 못했습니다.");
            }
            window.setTimeout(() => setShareMessage(""), 2200);
          });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareMessage("공고 링크를 복사했습니다.");
      window.setTimeout(() => setShareMessage(""), 2200);
    } catch {
      setShareMessage("공유를 완료하지 못했습니다.");
      window.setTimeout(() => setShareMessage(""), 2200);
    }
  };

  const handleApply = () => {
    if (isClosed) {
      setApplyMessage("마감된 공고입니다.");
      return;
    }

    if (!applyUrl) {
      setApplyMessage("지원 방법을 확인 중입니다.");
      return;
    }

    setApplyMessage(job.applyMethod === "기업 홈페이지 지원" ? "기업 채용 페이지를 새 탭으로 엽니다." : "지원 화면을 엽니다.");
    window.open(applyUrl, "_blank", "noopener,noreferrer");
  };

  const topTags = getVisibleJobTags(job);
  const bodyKeywords = (job.coreKeywords?.length ? job.coreKeywords : job.tags).slice(0, 8);
  const hasAdditionalMaterials = Boolean(
    job.additionalMaterials?.images?.length ||
      job.additionalMaterials?.files?.length ||
      job.detailBlocks?.some((block) => (block.type === "image" || block.type === "file") && block.url),
  );
  const hasHiringProcess = Boolean(job.hiringProcess?.length);

  return (
    <>
      <main className="bg-[#f5f5f3] pb-28 pt-6">
        <div className="app-shell">
          <nav className="flex items-center gap-2 text-[13px] font-bold text-[#8a95a5]" aria-label="breadcrumb">
            <Home size={15} />
            <Link href="/jobs" className="hover:text-brand">
              채용공고
            </Link>
            <ChevronRight size={14} />
            <span className="text-[#4e5968]">{job.role ?? job.jobCategory ?? "공고 상세"}</span>
          </nav>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_318px] gap-6 max-[1120px]:grid-cols-1">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-[var(--shadow)]">
                <div className="px-7 pb-6 pt-7 max-[720px]:px-5">
                  <div className="flex items-start justify-between gap-5 max-[720px]:flex-col">
                    <div className="flex min-w-0 gap-4">
                      <CompanyLogo
                        name={company?.name ?? job.company}
                        logoText={company?.logoText ?? job.logoText}
                        logoUrl={company?.logoUrl ?? job.logoUrl}
                        logoColor={company?.logoColor ?? job.logoColor}
                        logoAccent={company?.logoAccent ?? job.logoAccent}
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-extrabold text-[#667181]">{job.company}</p>
                          {company?.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                              <ShieldCheck size={13} />
                              인증기업
                            </span>
                          ) : null}
                          <button
                            type="button"
                            className="inline-flex h-8 items-center gap-1.5 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-3 text-[12px] font-black text-[#596373] transition hover:border-brand hover:text-brand"
                          >
                            <Heart size={14} />
                            관심기업
                          </button>
                        </div>
                        <h1 className="mt-3 text-[33px] font-black leading-[1.18] tracking-[0] text-[#1f2733] max-[720px]:text-[25px]">
                          {job.title}
                        </h1>
                        {job.oneLineIntro ? (
                          <p className="mt-3 max-w-[760px] text-[16px] font-semibold leading-[1.65] text-[#667181]">{job.oneLineIntro}</p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {topTags.map((tag) => (
                            <HeaderTag key={tag}>{tag}</HeaderTag>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <ActionIconButton label={saved ? "공고 저장 해제" : "공고 저장"} onClick={() => toggleSave(job.id)} active={saved}>
                        <Bookmark size={23} fill={saved ? "currentColor" : "none"} />
                      </ActionIconButton>
                      <ActionIconButton label="공고 공유" onClick={handleShare}>
                        <Share2 size={22} />
                      </ActionIconButton>
                    </div>
                  </div>
                </div>

                {coverImage ? (
                  <img src={coverImage} alt={`${job.company} 대표 이미지`} className="h-[286px] w-full border-t border-border object-cover max-[720px]:h-[210px]" />
                ) : (
                  <DefaultCover job={job} />
                )}
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-[22px] font-black text-[#242b36]">공고 한눈에 보기</h2>
                  <span className={clsx("rounded-[var(--radius)] px-3 py-1.5 text-[12px] font-black", isClosed ? "bg-[#fff1f1] text-danger" : "bg-brand-soft text-brand")}>
                    {deadlineLabel(job)}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 max-[1020px]:grid-cols-3 max-[720px]:grid-cols-2">
                  {overview.map((item) => (
                    <OverviewCard key={item.label} label={item.label} value={item.value} />
                  ))}
                </div>
              </section>

              <nav className="sticky top-[64px] z-30 -mx-1 overflow-x-auto rounded-[var(--radius)] border border-border bg-white/95 px-2 py-2 shadow-[0_5px_18px_rgba(20,32,46,0.06)] backdrop-blur" aria-label="공고 섹션 이동">
                <div className="flex min-w-max gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                      className={clsx(
                        "h-10 rounded-[var(--radius)] px-3.5 text-[13px] font-black transition",
                        activeSection === section.id ? "bg-brand-soft text-brand" : "text-[#6d7785] hover:bg-[#f4f4f4] hover:text-brand",
                      )}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </nav>

              <SectionShell id="intro" title="포지션 소개">
                <p className="text-[16px] font-semibold leading-[1.85] text-[#3f4855]">{job.introduction ?? job.oneLineIntro}</p>
              </SectionShell>

              <SectionShell id="qualifications" title="업무·자격">
                <div className="space-y-7">
                  <div>
                    <h3 className="text-[17px] font-black text-[#2f3845]">주요업무</h3>
                    <div className="mt-3">
                      <FormattedContentView content={job.responsibilitiesContent} fallback={job.responsibilities} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-[#2f3845]">자격요건</h3>
                    <div className="mt-3">
                      <FormattedContentView content={job.requirementsContent} fallback={job.requirements} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[17px] font-black text-[#2f3845]">우대사항</h3>
                    <div className="mt-3">
                      <FormattedContentView content={job.preferredContent} fallback={job.preferredQualifications} />
                    </div>
                  </div>
                </div>
              </SectionShell>

              <SectionShell id="keywords" title="핵심 키워드">
                <div className="flex flex-wrap gap-2">
                  {bodyKeywords.map((keyword) => (
                    <span key={keyword} className="rounded-[var(--radius)] border border-[#dedede] bg-[#f7f7f7] px-3.5 py-2 text-[13px] font-black text-[#2f3845]">
                      {keyword}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[12px] font-bold text-[#8a95a5]">선택된 키워드를 기준으로 유사 공고와 맞춤 추천이 제공됩니다.</p>
              </SectionShell>

              {hasAdditionalMaterials ? (
                <SectionShell id="detail-materials" title="기업 추가 자료">
                  <AdditionalMaterials job={job} />
                </SectionShell>
              ) : null}

              <SectionShell id="work" title="근무조건">
                <WorkConditions job={job} />
                <div className="mt-6 border-t border-[#edf1f4] pt-6">
                  <h3 className="mb-4 text-[17px] font-black text-[#2f3845]">근무지</h3>
                  <MapPlaceholder job={job} company={company} />
                </div>
              </SectionShell>

              {hasHiringProcess ? (
                <SectionShell id="process" title="채용 절차">
                  <HiringProcess steps={job.hiringProcess} />
                </SectionShell>
              ) : null}

              <SectionShell id="company" title="기업 정보">
                <div className="flex gap-4 max-[640px]:flex-col">
                  <CompanyLogo
                    name={company?.name ?? job.company}
                    logoText={company?.logoText ?? job.logoText}
                    logoUrl={company?.logoUrl ?? job.logoUrl}
                    logoColor={company?.logoColor ?? job.logoColor}
                    logoAccent={company?.logoAccent ?? job.logoAccent}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-black text-[#252d39]">{company?.name ?? job.company}</h3>
                      {company?.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-[var(--radius)] bg-brand-soft px-2.5 py-1 text-[11px] font-black text-brand">
                          <ShieldCheck size={13} />
                          인증기업
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[14px] font-semibold leading-[1.75] text-[#566171]">{company?.description ?? job.companyDescription}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
                  <OverviewCard label="업종" value={company?.industry ?? job.industry ?? "제약·바이오"} />
                  <OverviewCard label="사원 수" value={company?.employeeCount ?? "정보 없음"} />
                  <OverviewCard label="설립연도" value={company?.foundedYear ?? "정보 없음"} />
                  <OverviewCard label="진행 중 공고" value={`${company?.activeJobCount ?? 1}개`} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/companies/${company?.id ?? job.companyId ?? "thepharmin-pharma"}`}
                    className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-4 text-[14px] font-black text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    기업정보 더보기
                    <ChevronRight size={16} />
                  </Link>
                  {company?.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-[#dfe5ec] bg-white px-4 text-[14px] font-black text-[#4f5a66] transition hover:border-brand hover:text-brand"
                    >
                      홈페이지
                      <ExternalLink size={15} />
                    </a>
                  ) : null}
                </div>
              </SectionShell>

              <SectionShell id="news" title="더파마뉴스에서 본 이 기업">
                <p className="-mt-1 mb-5 text-[14px] font-semibold leading-[1.7] text-[#667181]">
                  더파마뉴스에 보도된 기업 관련 기사와 산업 뉴스를 확인해 보세요.
                </p>
                <CompanyNewsSection job={job} />
              </SectionShell>

              <SectionShell id="reviews" title="기업 후기">
                <ReviewsSection company={company} job={job} reviews={reviews} initialAccess={reviewAccess} />
              </SectionShell>

              <SectionShell id="similar" title="비슷한 공고">
                <p className="-mt-1 mb-5 text-[14px] font-semibold leading-[1.7] text-[#667181]">
                  이 공고와 직무, 키워드, 경력 조건이 비슷한 공고입니다.
                </p>
                <SimilarJobs baseJob={job} jobs={similarJobs} savedIds={savedIds} onToggleSave={toggleSave} />
              </SectionShell>
            </div>

            <aside className="sticky top-[88px] self-start h-fit space-y-3 max-[1120px]:static max-[720px]:hidden">
              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <p className="text-[13px] font-black text-[#7d8796]">지원 정보</p>
                <h2 className={clsx("mt-2 text-[30px] font-black", isClosed ? "text-danger" : "text-brand")}>{deadlineLabel(job)}</h2>
                <p className="mt-1 text-[13px] font-bold text-[#687382]">{deadlineDetail(job)}</p>

                <div className="mt-5 space-y-3 border-y border-[#e6ecf1] py-4">
                  {[
                    { icon: BriefcaseBusiness, label: "경력", value: careerLabel(job) },
                    { icon: Building2, label: "고용형태", value: job.employmentType },
                    { icon: MapPin, label: "근무지역", value: job.location },
                    { icon: CalendarDays, label: "지원방법", value: job.applyMethod },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="flex items-start gap-2.5 text-[13px]">
                        <Icon size={16} className="mt-0.5 shrink-0 text-[#6b7280]" />
                        <div>
                          <p className="font-black text-[#8993a1]">{item.label}</p>
                          <p className="mt-0.5 font-extrabold text-[#3f4855]">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {canApply && applyUrl ? (
                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setApplyMessage(job.applyMethod === "기업 홈페이지 지원" ? "기업 채용 페이지를 새 탭으로 엽니다." : "지원 화면을 엽니다.")}
                    className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius)] bg-brand text-[15px] font-black text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
                  >
                    {applyButtonLabel(job)}
                    <ExternalLink size={17} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled
                    className="mt-5 flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius)] bg-[#b8b8b8] text-[15px] font-black text-white"
                  >
                    {isClosed ? "마감된 공고입니다" : "지원 방법을 확인 중입니다"}
                  </button>
                )}
                {applyMessage ? <p className="mt-2 text-[12px] font-bold text-danger">{applyMessage}</p> : null}

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(job.id)}
                    className={clsx(
                      "flex h-11 items-center justify-center gap-2 rounded-[var(--radius)] border bg-white text-[14px] font-black transition",
                      saved ? "border-brand text-brand" : "border-border text-[#4f5a66] hover:border-brand hover:text-brand",
                    )}
                  >
                    <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex h-11 items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-white text-[14px] font-black text-[#4f5a66] transition hover:border-brand hover:text-brand"
                  >
                    <Share2 size={17} />
                    공유
                  </button>
                </div>
                {shareMessage ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-brand">
                    <Copy size={13} />
                    {shareMessage}
                  </p>
                ) : null}
                <p className="mt-4 rounded-[var(--radius)] bg-[#f7f7f7] px-3 py-3 text-[12px] font-semibold leading-[1.65] text-[#667181]">
                  {applyNotice(job)}
                </p>
              </section>

              <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
                <h2 className="flex items-center gap-2 text-[16px] font-black text-[#252d39]">
                  <Sparkles size={18} className="text-[#6b7280]" />
                  더파마 매칭
                </h2>
                <p className="mt-2 text-[13px] font-semibold leading-[1.65] text-[#667181]">
                  이 공고의 직무 키워드와 최근 본 공고를 바탕으로 유사 공고를 추천합니다.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[
                    `${job.role ?? job.jobCategory ?? "직무"} 직무 일치`,
                    bodyKeywords[0] ? `${bodyKeywords[0]} 키워드 일치` : "",
                    job.industry ?? job.category,
                    `${job.location.split(" ")[0]}권 근무지`,
                  ]
                    .filter((reason): reason is string => Boolean(reason))
                    .slice(0, 4)
                    .map((reason) => (
                      <span key={reason} className="rounded-[var(--radius)] border border-[#e0e0e0] bg-[#f8f8f8] px-2 py-1 text-[11px] font-black text-[#596373]">
                        {reason}
                      </span>
                    ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_20px_rgba(20,32,46,0.08)] md:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-[92px_1fr] gap-2">
          <button
            type="button"
            onClick={() => toggleSave(job.id)}
            className={clsx(
              "flex h-12 items-center justify-center gap-1.5 rounded-[var(--radius)] border bg-white text-[13px] font-black",
              saved ? "border-brand text-brand" : "border-border text-[#4f5a66]",
            )}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
            저장
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius)] bg-brand text-[14px] font-black text-white disabled:bg-[#b8b8b8]"
          >
            {isClosed ? "마감된 공고입니다" : canApply ? applyButtonLabel(job) : "지원 방법 확인 중"}
            {canApply ? <ArrowRight size={17} /> : null}
          </button>
        </div>
      </div>
    </>
  );
}
