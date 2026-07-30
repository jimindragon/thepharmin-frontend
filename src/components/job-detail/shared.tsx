"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronRight, Layers, Lock, MapPin, Share2, type LucideIcon } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { companyLogos } from "@/config/companyImages";
import { companyDirectory } from "@/data/companyDirectory";
import type { FormattedContent, Job, JobTrack } from "@/types/jobs";
import { formatJobDeadlineLabel, isJobDeadlineUrgent } from "@/utils/dday";

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

/** companyId를 기업 상세 링크로 바꾼다. 프로필이 없는 기업은 companyDirectory.detailHref가 /reviews로 폴백하므로 여기서도 같은 값을 그대로 쓴다. 매칭되는 기업이 없으면 undefined를 반환해 호출부가 링크 없이 렌더할 수 있게 한다. */
export function getCompanyDetailHref(companyId?: string) {
  if (!companyId) return undefined;
  return companyDirectory.find((entry) => entry.id === companyId)?.detailHref;
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

export function FormattedContentView({ content, fallback }: { content?: FormattedContent; fallback?: string[] }) {
  const normalized = content ?? (fallback ? { format: "bullet" as const, items: fallback } : undefined);

  if (!normalized || normalized.items.length === 0) {
    return null;
  }

  if (normalized.format === "paragraph") {
    return (
      <div className="space-y-3 text-[15px] font-normal leading-[1.75] text-[#3f4855]">
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
  action,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  /** 제목 우측 보조 링크 등. 넘기지 않으면 기존과 동일하게 h2만 렌더한다. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)] max-[720px]:px-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em] text-[#242b36]">
          <Icon size={18} className="shrink-0 text-[#6b7280]" aria-hidden />
          {title}
        </h2>
        {action}
      </div>
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
        <p className="mt-0.5 text-[12px] font-normal text-[#8993a1]">{address}</p>
      </div>
    </div>
  );
}

/** "라벨 + 값" 가로 정렬 행. 여러 개를 divide-y로 묶어 옅은 구분선의 리스트를 만든다(박스 나열 대체). */
export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-x-6 py-3 max-[560px]:grid-cols-1 max-[560px]:gap-x-0 max-[560px]:gap-y-1">
      <span className="text-[14px] font-medium text-[#8993a1]">{label}</span>
      <span className="min-w-0 text-left text-[15px] font-normal leading-relaxed text-[#2f3845]">
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
  job,
  method,
  target,
  notice,
  isLoggedIn,
}: {
  /**
   * 마감 표시(라벨·긴급색)는 이 jobs.ts 레코드에서 formatJobDeadlineLabel/isJobDeadlineUrgent로 파생한다.
   * jobs.ts에 조인할 레코드가 없는 미리보기 등 예외 경로를 위해 optional — 없으면 마감 표시를 생략한다.
   */
  job?: Job;
  method: ApplyMethodId;
  target: string;
  notice?: string;
  isLoggedIn: boolean;
}) {
  const gatedLabel = APPLY_GATED_LABELS[method];
  const gatedMessage = APPLY_GATED_MESSAGES[method];
  const deadlineLabel = job ? formatJobDeadlineLabel(job) : null;
  const urgent = job ? isJobDeadlineUrgent(job) : false;

  return (
    <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
      <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
      {deadlineLabel ? (
        <h2 className={clsx("mt-2 text-[24px] font-bold", urgent ? "text-danger" : "text-brand")}>{deadlineLabel}</h2>
      ) : null}
      <p className="mt-2 text-[13px] font-medium text-[#8993a1]">{APPLY_METHOD_LABELS[method]}</p>

      <button
        type="button"
        onClick={method === "homepage" ? () => window.open(target, "_blank", "noopener,noreferrer") : undefined}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
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

// ── 히어로 액션 로우 (로고+기업명+관심 기업 저장 / 저장+공유) ─────────────────────────────

/**
 * 히어로 텍스트 영역 상단에 얹는 기업 정보 + 액션 묶음.
 * 왼쪽: [로고]+기업명+관심 기업 저장(기업 단위 액션), 오른쪽: 저장·공유(공고 단위 액션).
 * showLogo=false인 트랙(약국)은 로고 자리를 만들지 않고 기업명부터 시작한다.
 * 모바일(≤560px)에서는 로고+기업명 행 아래로 관심 기업 저장 버튼이 full-width로 내려가고,
 * 저장·공유는 기존 모바일 하단바가 담당하므로 여기서는 숨긴다.
 * companyId가 있으면 로고+기업명을 /companies/{companyId}로 감싼다 — 프로필 존재 여부와 무관하게
 * 항상 링크(하단 CompanyCtaButtons "기업 정보 더보기"와 동일한 무조건부 링크 관례). companyId가 없는
 * 공고(비공개 기업, 연구 트랙 free-text 기관 등)는 기존처럼 비링크 텍스트로 둔다.
 */
export function JobDetailActionRow({
  orgName,
  companyId,
  showLogo,
  logoUrl,
  saved,
  onToggleSave,
  interested,
  onToggleInterest,
  onShare,
}: {
  orgName: string;
  companyId?: string | null;
  showLogo: boolean;
  logoUrl?: string;
  saved: boolean;
  onToggleSave: () => void;
  interested: boolean;
  onToggleInterest: () => void;
  onShare: () => void;
}) {
  const companyContent = (
    <>
      {showLogo ? <CompanyLogo name={orgName} logoText="" logoUrl={logoUrl} size="sm" /> : null}
      <p className="text-[15px] font-normal text-[#667181]">{orgName}</p>
    </>
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 max-[560px]:w-full max-[560px]:flex-col max-[560px]:items-start">
        {companyId ? (
          <Link href={`/companies/${companyId}`} className="group flex items-center gap-3">
            {showLogo ? <CompanyLogo name={orgName} logoText="" logoUrl={logoUrl} size="sm" /> : null}
            <p className="text-[15px] font-normal text-[#667181] group-hover:text-brand">{orgName}</p>
          </Link>
        ) : (
          <div className="flex items-center gap-3">{companyContent}</div>
        )}

        <button
          type="button"
          onClick={onToggleInterest}
          className={clsx(
            "inline-flex h-8 items-center gap-1.5 border bg-white px-3 text-[12px] font-medium transition max-[560px]:h-10 max-[560px]:w-full max-[560px]:justify-center",
            interested ? "border-brand text-brand" : "border-[#dfe5ec] text-[#596373] hover:border-brand hover:text-brand",
          )}
        >
          <Bookmark size={14} fill={interested ? "currentColor" : "none"} />
          {interested ? "관심 기업 저장됨" : "관심 기업으로 저장"}
        </button>
      </div>

      {/* 공고 단위 액션(저장·공유)은 768px부터 여기, 767px 이하는 모바일 하단바가 통째로 담당한다 —
          두 곳에 동시에 보이는 구간이 없다. 왼쪽 기업 버튼과 아이콘(Bookmark)이 같지만, 기업 버튼은
          텍스트가 있고 이쪽은 아이콘 전용이라 형태로 구분된다. */}
      <div className="flex shrink-0 items-center gap-2 max-[767px]:hidden">
        <ActionIconButton label={saved ? "공고 스크랩 해제" : "공고 스크랩"} onClick={onToggleSave} active={saved}>
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
        className="inline-flex h-11 flex-1 items-center justify-center bg-brand px-5 text-[13px] font-semibold text-white transition hover:bg-[var(--color-brand-dark)]"
      >
        {detailLabel}
      </Link>
      <Link
        href={`/companies/${companyId}/reviews`}
        className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[13px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
      >
        기업 리뷰 보기
      </Link>
      <Link
        href={`/companies/${companyId}/interviews`}
        className="inline-flex h-11 flex-1 items-center justify-center border border-border bg-white px-5 text-[13px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
      >
        면접 후기 보기
      </Link>
    </div>
  );
}

// ── 비슷한 공고 (본문 최하단) ──────────────────────────────────────────────────────

/**
 * V2 상세(산업/병원/약국/연구 공통) 본문 최하단 "비슷한 공고" 섹션. 본문 카드들(IconSectionShell,
 * rounded+shadow)과 달리 radius 0·그림자 없이 눌러, "다음으로 볼 공고"라는 다른 성격의 구역임을
 * 구분한다. 카드는 목록 페이지와 동일한 JobCard를 그대로 써서 저장 상태(readSavedJobs/writeSavedJobs)와
 * 링크 가드(JobCard 내부의 hasJobDetail 체크)를 공유한다. jobs가 비어 있으면(이론상 발생하지 않지만)
 * 섹션 자체를 렌더하지 않는다. 우상단 "관련 공고 더보기" 링크는 /jobs의 track 쿼리 파라미터로
 * 해당 트랙 탭을 바로 연다(useJobFilters가 초기화 시 읽는 값과 동일한 키).
 */
export function SimilarJobsSection({ jobs, track }: { jobs: Job[]; track: JobTrack }) {
  const [savedIds, setSavedIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setSavedIds(readSavedJobs());
  }, []);

  if (jobs.length === 0) {
    return null;
  }

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

  return (
    <section className="border border-border bg-white px-7 py-6 max-[720px]:px-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em] text-[#242b36]">
          <Layers size={18} className="shrink-0 text-[#6b7280]" aria-hidden />
          비슷한 공고
        </h2>
        <Link href={`/jobs?track=${track}`} className="shrink-0 text-[13px] font-medium text-[#777777] hover:text-[#111111]">
          관련 공고 더보기 ›
        </Link>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isBookmarked={savedIds.has(job.id)} onToggleBookmark={toggleSave} />
        ))}
      </div>
    </section>
  );
}
