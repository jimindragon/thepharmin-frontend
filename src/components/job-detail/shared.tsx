"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bookmark, CalendarClock, CalendarPlus, ChevronRight, Layers, Lock, MapPin, Send, Share2, type LucideIcon } from "lucide-react";
import { JobCard } from "@/components/JobCard";
import { FLUSH_LIST_CLASS, FLUSH_SECTION_CLASS } from "@/components/flushListStyles";
import { AddToCalendarSheet } from "@/components/shared/AddToCalendarSheet";
import { SECTION_ANCHOR_SCROLL_MT_CLASS } from "@/components/shared/sectionAnchorStyles";
import {
  STAT_ROW_CAPTION,
  STAT_ROW_CELL,
  STAT_ROW_ICON,
  STAT_ROW_LABEL,
  STAT_ROW_LIST,
  STAT_ROW_VALUE,
} from "@/components/shared/statRowStyles";
import { EntityLogo } from "@/components/ui/EntityLogo";
import { APPLY_METHOD_LABELS } from "@/config/applyMethods";
import { companyLogos } from "@/config/companyImages";
import { companyDirectory } from "@/data/companyDirectory";
import type { CalendarExportEvent } from "@/lib/calendarExport";
import type { ApplyMethodId, FormattedContent, Job, JobApply, JobTrack } from "@/types/jobs";
import { getCompanyInitial } from "@/utils/companyInitial";
import { formatJobDeadlineLabel, formatKoreanDate, isJobDeadlineUrgent } from "@/utils/dday";

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

/**
 * 공고 상세의 기관 로고. lg는 본문 "기업/기관/병원 정보" 섹션 요약, sm은 히어로 액션 행(헤더)에 쓴다.
 *
 * 종전 정사각 칸(68×68 / 46×46)은 로고 자산 61개 중 93%가 가로형(중앙 비율 약 3:1)이라는 사실과 맞지 않아,
 * 3:1 로고가 각각 높이 11px / 6px까지 쪼그라들었다. EntityLogo의 wide variant로 높이는 그대로 두고 폭만 넓힌다.
 * 폭 140/130은 목록 행(JobCard 90×40 · 기업 목록 100×46)보다 커야 상세의 위계가 맞아 고른 기존 값이다.
 * 더 넓힐 수도 있었지만 140이 상한이다 — 160이면 병원 트랙 1280px에서 옆 소개문이 한 줄 늘어 블록이 +22px 커진다.
 * lg의 ≤640px 축소는 기업 목록 셀(CompaniesHomeClient)이 쓰는 값·중단점을 그대로 가져왔다 —
 * 좁은 화면에서는 옆 기관 소개문이 들어갈 폭을 남겨야 한다. 76은 390px에서 어느 트랙도 소개문 줄 수가
 * 늘지 않는 값이다(연구는 80까지, 산업은 90까지가 한계라 둘 중 좁은 쪽에 맞춘다).
 * 모바일에서도 로고는 커진다 — 폭이 아니라 padding 8→0에서 오는 몫이다.
 * sm은 중단점이 다르다. 헤더 좌측 묶음이 max-[560px]에서 [로고][기관명/관심 기업] 두 칸으로 접혀 그때부터
 * 기관명이 로고와 폭을 나눠 쓰기 때문에, 그 지점에서 76×35로 줄인다(100×46의 0.76배 — 폭만 줄이면 칸 비율이
 * 어긋난다). 긴 이름("한국과학기술연구원(KIST)")에 필요한 폭을 기관명 칸에 넘기는 것이 이 축소의 목적이다.
 *
 * 테두리·배경·그림자는 뺐다. 주변이 흰 카드라 bg-white는 보이지 않고 rounded-[var(--radius)]는 0으로 계산되며,
 * 칸이 로고 비율에 맞은 뒤로는 테두리로 감쌀 빈 공간 자체가 없다 — wide를 쓰는 다른 두 자리와도 같아진다.
 * 폴백은 건물 아이콘이 아니라 이니셜이다(JobCard와 같은 규격).
 */
export function CompanyLogo({
  name,
  logoUrl,
  size = "lg",
}: {
  name: string;
  logoUrl?: string;
  size?: "sm" | "lg";
}) {
  const resolvedLogoUrl = logoUrl ?? companyLogos[name];
  const isLarge = size === "lg";

  return (
    <EntityLogo
      name={name}
      logoUrl={resolvedLogoUrl}
      variant="wide"
      width={isLarge ? 140 : 130}
      height={isLarge ? 68 : 46}
      padding={0}
      className={clsx("shrink-0", isLarge ? "max-[640px]:!w-[76px]" : "max-[560px]:!h-[35px] max-[560px]:!w-[76px]")}
      fallback={<span className="text-[13px] font-semibold text-[#596373]">{getCompanyInitial(name)}</span>}
    />
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
 *
 * ≤760px 풀블리드(FLUSH_SECTION_CLASS)는 prop이 아니라 셸 안에 직접 박아 둔다.
 * 이 컴포넌트의 호출부는 4트랙 상세 본문(+아래 모바일 전용 두 섹션)뿐이고 전부 같은 한 열에
 * 서므로, 값이 하나뿐인 variant를 30여 개 호출부에 받아 적게 하는 건 부담만 남는다.
 * 상세 컨테이너 CSS로 내리는 방법은 쓸 수 없다 — 무변경이어야 할 히어로가 같은 컨테이너의
 * 형제 <section>이고, MobileApplyInfoSection·MobileDeadlineCalendarSection은 이 셸을
 * min-[721px]:hidden div로 한 겹 싸고 있어 자식 선택자가 닿지 않는다.
 * 이 셸을 본문 밖(사이드바 등)에 쓰게 되는 날 그때 variant를 만들 것.
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
    <section
      id={id}
      className={clsx(
        "scroll-mt-[130px] rounded-[var(--radius)] border border-border bg-white px-7 py-6 shadow-[var(--shadow)]",
        FLUSH_SECTION_CLASS,
        /* ≤760px 앵커 행이 덮는 만큼(헤더 64 + 앵커 44)으로 갈아끼운다 — 위 130px은 데스크톱 잔재다 */
        SECTION_ANCHOR_SCROLL_MT_CLASS,
      )}
    >
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

/** 상단 3열 요약 카드 그리드. SummaryStatCell과 함께 써서 라벨/값 크기·weight·여백·정렬·아이콘이 구조적으로 항상 같게 만든다.
 *  ≤760px는 세로 카드 대신 행 리스트로 눕는다(처방·사유는 statRowStyles). */
export function SummaryStatGrid({ children }: { children: React.ReactNode }) {
  return <div className={clsx("grid grid-cols-3 gap-4", STAT_ROW_LIST)}>{children}</div>;
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
    <div className={clsx("rounded-[var(--radius)] border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-5 text-center", STAT_ROW_CELL)}>
      <Icon size={20} className={clsx("mx-auto text-[#6b7280]", STAT_ROW_ICON)} aria-hidden />
      <p className={clsx("mt-2 text-[12.5px] font-medium text-[#8893a2]", STAT_ROW_LABEL)}>{label}</p>
      <div className={clsx("mt-2 text-[17px] font-bold leading-snug text-[#2f3845]", STAT_ROW_VALUE)}>{value}</div>
      {caption ? (
        <p className={clsx("mt-1 text-[12px] font-normal text-[#a0a9b7]", STAT_ROW_CAPTION)}>{caption}</p>
      ) : null}
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
 * method가 실제로 쓰는 값 하나를 고른다 — 지원 방식마다 값이 들어 있는 필드가 다르기 때문이다.
 * homepage는 지원 페이지 주소, email은 지원 이메일, phone·sms는 연락처를 쓴다(문자 연락처는
 * 전화번호와 같은 값이라 전용 필드를 두지 않는다). quick·guide는 값 없이 동작한다.
 */
export function getApplyValue(apply: JobApply): string {
  switch (apply.method) {
    case "homepage":
      return apply.url ?? "";
    case "email":
      return apply.email ?? "";
    case "phone":
    case "sms":
      return apply.phone ?? "";
    default:
      return "";
  }
}

/**
 * 지원 버튼을 눌렀을 때 실행할 동작. 지금은 homepage만 이동 동작이 있다.
 * 주소가 비어 있으면 undefined를 돌려준다 — window.open("")이 빈 창(about:blank)을 여는 것을 막는다.
 * 모바일 하단 바도 같은 규칙을 써야 하므로 카드 밖에서 재사용할 수 있게 분리해 둔다.
 */
export function getApplyAction(apply: JobApply): (() => void) | undefined {
  if (apply.method !== "homepage") return undefined;
  const url = getApplyValue(apply);
  if (!url) return undefined;
  return () => window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * 지원 버튼 문구. 사이드바 카드와 모바일 하단 바가 같은 문구를 써야 해서 한 곳에서 고른다.
 * 데이터의 method가 아직 string이라 여기서 한 번만 좁힌다(호출부에 캐스트를 퍼뜨리지 않는다).
 */
export function getApplyButtonLabel(apply: JobApply): string {
  return APPLY_BUTTON_LABELS[apply.method];
}

/**
 * 지원 연락처를 로그인 뒤로 잠그는 method인지. email·phone·sms만 해당하며,
 * quick·homepage·guide는 노출할 연락처 자체가 없다.
 */
function hasApplyContactGate(apply: JobApply): boolean {
  return Boolean(APPLY_GATED_LABELS[apply.method]);
}

/**
 * 지원 연락처(이메일·전화·문자) 게이트. 로그인 상태면 값을, 아니면 잠금 안내를 보여준다.
 * 사이드바 카드와 모바일 본문 섹션이 같은 내용을 써야 해서 분리했다 —
 * 바깥 여백·구분선은 놓이는 자리마다 달라서 호출부에 남긴다.
 */
export function ApplyContactGate({ apply, isLoggedIn }: { apply: JobApply; isLoggedIn: boolean }) {
  const method = apply.method;
  const gatedLabel = APPLY_GATED_LABELS[method];
  const gatedMessage = APPLY_GATED_MESSAGES[method];
  if (!gatedLabel || !gatedMessage) return null;

  if (!isLoggedIn) {
    return (
      <p className="flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#a0a9b7]">
        <Lock size={12} />
        {gatedMessage}
      </p>
    );
  }

  return (
    <div>
      <p className="text-[12px] font-medium text-[#8993a1]">{gatedLabel}</p>
      <p className="mt-1 break-all text-[13px] font-normal text-[#3f4855]">{getApplyValue(apply)}</p>
    </div>
  );
}

/**
 * 720px 이하 전용 지원 정보 섹션. 이 폭에서는 사이드바(ApplyCard)가 숨겨져 지원 이메일·연락처에
 * 닿을 방법이 없어, 본문에 게이트만 따로 놓는다.
 *
 * 연락처가 없는 method(quick·homepage·guide)에서는 null을 돌려준다 — 보여줄 값이 없고,
 * homepage는 하단 고정 바 버튼이 이미 이동을 담당한다. 반응형 클래스를 이 컴포넌트 안에 두는 이유도
 * 같다: 본문이 space-y-5라 바깥에 래퍼를 두면 null일 때 빈 div가 남아 20px 죽은 여백이 생긴다.
 */
export function MobileApplyInfoSection({ apply, isLoggedIn }: { apply: JobApply; isLoggedIn: boolean }) {
  if (!hasApplyContactGate(apply)) return null;

  return (
    <div className="min-[721px]:hidden">
      <IconSectionShell id="apply-info" icon={Send} title="지원 정보">
        <ApplyContactGate apply={apply} isLoggedIn={isLoggedIn} />
      </IconSectionShell>
    </div>
  );
}

// ── 마감일 캘린더 추가 ────────────────────────────────────────────────────────

/**
 * Job 레코드에서 캘린더 이벤트 입력을 만든다. 만들 수 없으면 null.
 *
 * 상시채용(closingStatus === "always", 60건 중 28건)은 날짜 자체가 없어 이벤트가 성립하지
 * 않는다. 비활성 버튼도 두지 않는다 — 누를 수 없는 버튼은 "언젠가 생길 것"이라는 잘못된
 * 기대만 남긴다. 호출부는 null이면 블록 자체를 렌더하지 않는다.
 *
 * url은 사이트 상대 경로다. 절대화는 AddToCalendarSheet가 핸들러 안에서 한다.
 */
function calendarEventFromJob(job: Job): CalendarExportEvent | null {
  if (job.closingStatus === "always" || !job.deadline) return null;

  return {
    uid: `job-${job.id}`,
    title: job.title,
    company: job.company,
    date: job.deadline,
    kind: "deadline",
    url: job.slug ? `/jobs/${job.slug}` : undefined,
    location: job.location,
  };
}

/**
 * ≤720px 본문의 마감일 블록.
 *
 * 이 폭에서는 사이드바(ApplyCard)가 숨겨져 **이 공고의 마감일이 화면 어디에도 없다** —
 * 보이는 D-day는 전부 페이지 최하단 "비슷한 공고" 카드의 것이다. 그래서 이 블록은
 * 캘린더 버튼을 놓는 자리이자 모바일에서 마감일을 처음 노출하는 자리이기도 하다.
 *
 * 반응형 클래스를 컴포넌트 안에 두는 이유는 MobileApplyInfoSection과 같다 — 본문이
 * space-y-5라 바깥에 래퍼를 두면 비렌더 시 빈 div가 남아 20px 죽은 여백이 생긴다.
 */
export function MobileDeadlineCalendarSection({ job }: { job?: Job }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const event = job ? calendarEventFromJob(job) : null;

  if (!job || !event) return null;

  const deadlineLabel = formatJobDeadlineLabel(job);
  const urgent = isJobDeadlineUrgent(job);

  return (
    <div className="min-[721px]:hidden">
      <IconSectionShell id="deadline-calendar" icon={CalendarClock} title="마감일">
        <p className={clsx("text-[24px] font-bold", urgent ? "text-danger" : "text-brand")}>{deadlineLabel}</p>
        {/* formatKoreanDate는 점 구분자를 받는다 — jobs.ts의 deadline은 대시 형식이라 바꿔 넘긴다 */}
        <p className="mt-1 text-[13px] font-normal text-[#8993a1]">{formatKoreanDate(job.deadline!.replace(/-/g, "."))}</p>

        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 border border-border bg-white text-[14px] font-medium text-[#4f5a66] transition hover:border-brand hover:text-brand"
        >
          <CalendarPlus size={16} />
          캘린더에 추가
        </button>

        <AddToCalendarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} event={event} />
      </IconSectionShell>
    </div>
  );
}

/**
 * 사이드바 지원 카드. method별로 버튼 문구와 하단 게이트/안내 영역만 분기하고,
 * 껍데기(카드 톤·타이포)는 PharmacyJobDetailV2/IndustryJobDetailClient가 쓰던 것을 그대로 계승한다.
 * 저장/공유는 JobDetailActionRow(히어로)로 옮겨졌으므로 이 카드는 순수 지원 CTA만 담당한다.
 *
 * apply를 통째로 받아 값 선택을 카드 안에서 끝낸다 — 호출부가 트랙마다 다른 필드를 골라
 * 넘기던 때는 어느 트랙이 어떤 필드를 넘기는지가 화면 코드에 흩어져 있었다.
 */
export function ApplyCard({
  job,
  apply,
  isLoggedIn,
}: {
  /**
   * 마감 표시(라벨·긴급색)는 이 jobs.ts 레코드에서 formatJobDeadlineLabel/isJobDeadlineUrgent로 파생한다.
   * jobs.ts에 조인할 레코드가 없는 미리보기 등 예외 경로를 위해 optional — 없으면 마감 표시를 생략한다.
   */
  job?: Job;
  apply: JobApply;
  /** 약국 상세가 미리보기에서 강제로 false를 내리므로 훅을 직접 부르지 않고 prop으로 받는다. */
  isLoggedIn: boolean;
}) {
  const method = apply.method;
  const onActivate = getApplyAction(apply);
  const deadlineLabel = job ? formatJobDeadlineLabel(job) : null;
  const urgent = job ? isJobDeadlineUrgent(job) : false;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarEvent = job ? calendarEventFromJob(job) : null;

  return (
    <section className="rounded-[var(--radius)] border border-border bg-white px-5 py-5 shadow-[var(--shadow)]">
      <p className="text-[13px] font-medium text-[#7d8796]">지원 정보</p>
      {deadlineLabel ? (
        <h2 className={clsx("mt-2 text-[24px] font-bold", urgent ? "text-danger" : "text-brand")}>{deadlineLabel}</h2>
      ) : null}
      {/* 마감일에 딸린 보조 동작이라 h2 바로 아래 텍스트 버튼으로 둔다 — 아래 지원 CTA(솔리드)와
          형태를 달리해 위계를 지킨다. 상시채용은 calendarEvent가 null이라 자동으로 빠진다. */}
      {calendarEvent ? (
        <button
          type="button"
          onClick={() => setCalendarOpen(true)}
          className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#5f6875] underline-offset-2 transition-colors hover:text-brand hover:underline"
        >
          <CalendarPlus size={14} />
          내 캘린더에 추가
        </button>
      ) : null}
      <p className="mt-2 text-[13px] font-medium text-[#8993a1]">{APPLY_METHOD_LABELS[method]}</p>

      <button
        type="button"
        onClick={onActivate}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-brand text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(17,17,17,0.2)] transition hover:bg-[var(--color-brand-dark)]"
      >
        {APPLY_BUTTON_LABELS[method]}
      </button>

      {/* 실제로 이동이 일어날 때만 안내한다 — 주소가 없어 버튼이 아무 동작도 안 하는 상태에서 이 문구가 남으면 거짓말이 된다 */}
      {method === "homepage" && onActivate ? (
        <p className="mt-3 text-center text-[12px] font-normal text-[#a0a9b7]">외부 기업 채용 페이지로 이동합니다.</p>
      ) : null}

      {/* 바깥 여백·구분선은 카드 리듬이라 여기 남기고, 안쪽 내용만 ApplyContactGate가 그린다 */}
      {hasApplyContactGate(apply) ? (
        <div className={isLoggedIn ? "mt-4 border-t border-[#e6ecf1] pt-4" : "mt-3"}>
          <ApplyContactGate apply={apply} isLoggedIn={isLoggedIn} />
        </div>
      ) : null}

      {apply.notice ? (
        <p className="mt-4 bg-[#f7f7f7] px-3 py-3 text-[12px] font-normal leading-[1.65] text-[#667181]">{apply.notice}</p>
      ) : null}

      {calendarEvent ? (
        <AddToCalendarSheet open={calendarOpen} onClose={() => setCalendarOpen(false)} event={calendarEvent} />
      ) : null}
    </section>
  );
}

// ── 히어로 액션 로우 (로고+기업명+관심 기업 저장 / 저장+공유) ─────────────────────────────

/**
 * 히어로 텍스트 영역 상단에 얹는 기업 정보 + 액션 묶음.
 * 왼쪽: [로고]+기업명+관심 기업 저장(기업 단위 액션), 오른쪽: 저장·공유(공고 단위 액션).
 * showLogo=false인 트랙(약국)은 로고 자리를 만들지 않고 기업명부터 시작한다.
 * 저장·공유는 767px 이하에서 모바일 하단바가 담당하므로 여기서는 숨긴다.
 *
 * ≤760px에서 관심 기업 버튼은 테두리를 벗고 텍스트 버튼이 된다(히트 영역만 h-10로 남긴다). 문구도
 * 기업 상세 히어로(2b12316)와 같은 "관심 기업"으로 줄인다 — 같은 동작을 두 화면이 다르게 부르지 않는다.
 * ≤560px에서는 [로고][기업명 / 관심 기업] 두 칸으로 접어 한 행에 담는다. 종전에는 로고 행 아래로
 * 전폭 버튼이 내려가 이 묶음만 98px(2.5행)을 먹었고, 그만큼 공고 제목이 아래로 밀려 있었다.
 * 그래서 로고와 기업명이 한 링크였던 것을 로고 링크 / 기업명 링크로 나눈다 — 로고가 두 줄(기업명+버튼)
 * 옆에 서려면 같은 부모의 형제여야 한다. 로고 쪽은 aria-hidden+tabIndex=-1로 접근성 트리·탭 순서에서
 * 빼, 같은 목적지 링크가 둘로 읽히지 않게 한다.
 *
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
  const logo = showLogo ? <CompanyLogo name={orgName} logoUrl={logoUrl} size="sm" /> : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 flex-wrap items-center gap-3 max-[560px]:flex-nowrap">
        {logo ? (
          companyId ? (
            <Link href={`/companies/${companyId}`} aria-hidden tabIndex={-1} className="flex shrink-0">
              {logo}
            </Link>
          ) : (
            logo
          )
        ) : null}

        {/* 기업명 + 관심 기업. showLogo 트랙만 ≤560px에서 두 줄로 접는다 — 로고가 없는 약국은
            접을 이유가 없고(이미 한 행), 접으면 오히려 버튼 높이만큼 늘어난다. */}
        <div
          className={clsx(
            "flex min-w-0 items-center gap-3",
            showLogo && "max-[560px]:flex-col max-[560px]:items-start max-[560px]:gap-0",
          )}
        >
          {/* ≤760px 기업명은 본문과 같은 15px에 굵기(500)로만 위계를 준다 — 히어로 하단 세 줄(기업명·메타·
              한줄 소개)이 모두 본문 크기로 수렴하고, 크기 대신 색·굵기가 순서를 말한다. */}
          {companyId ? (
            <Link href={`/companies/${companyId}`} className="min-w-0">
              <p className="text-[15px] font-normal text-[#667181] hover:text-brand max-[760px]:font-medium">{orgName}</p>
            </Link>
          ) : (
            <p className="text-[15px] font-normal text-[#667181] max-[760px]:font-medium">{orgName}</p>
          )}

          <button
            type="button"
            onClick={onToggleInterest}
            aria-label={interested ? "관심 기업 저장됨" : "관심 기업으로 저장"}
            className={clsx(
              "inline-flex h-8 shrink-0 items-center gap-1.5 border bg-white px-3 text-[12px] font-medium transition",
              "max-[760px]:h-10 max-[760px]:border-0 max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:text-[13px]",
              // 세로로 접히는 트랙에서만 8px 끌어올린다. gap은 이미 0인데도 기업명과 16.75px 벌어져 보이는데,
              // 그 공백은 버튼 h-10(터치 타깃)의 내부 여백 13px + 기업명 line-box 반쪽 3.75px이라 gap으로는
              // 못 줄인다. 높이를 깎는 대신 음수 마진으로 시각 위치만 당겨 히트 영역 40px는 남긴다.
              // 561px 이상 한 행 배치는 max-[560px] 밖이라 그대로다.
              showLogo && "max-[560px]:-mt-2",
              interested ? "border-brand text-brand" : "border-[#dfe5ec] text-[#596373] hover:border-brand hover:text-brand",
            )}
          >
            <Bookmark size={14} fill={interested ? "currentColor" : "none"} />
            <span className="max-[760px]:hidden">{interested ? "관심 기업 저장됨" : "관심 기업으로 저장"}</span>
            <span className="min-[761px]:hidden">관심 기업</span>
          </button>
        </div>
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

/**
 * 히어로 텍스트 블록 — 4트랙(산업·약국·병원·연구)이 같은 4줄(기업 행 / 공고 제목 / 메타 / 한줄 소개)을
 * 각자 복제하고 있던 것을 한 자리로 모은다. 트랙별로 다른 것은 필드 이름뿐이라(oneLineIntro vs summary 등)
 * 호출부에서 문자열로 넘긴다.
 *
 * DOM 순서는 모바일 위계를 따른다 — 공고 제목이 기업 행 바로 다음이다. 이 화면의 주어는 공고이고 기업은
 * 그 부가 정보인데, 종전에는 메타 한 줄이 제목 앞을 막고 있었다. >760px에서만 order로 메타를 제목 위로
 * 되돌려 데스크톱 배치를 그대로 유지한다(액션 행은 order 미지정=0이라 항상 맨 앞).
 * 메타~소개 사이 구분선은 ≤760px 전용이다 — 좁은 폭에서 메타와 소개가 같은 크기·비슷한 색으로 붙어
 * 한 문단처럼 읽히던 것을 끊는다.
 */
export function JobDetailHeroHeader({
  title,
  meta,
  intro,
  ...actionRow
}: React.ComponentProps<typeof JobDetailActionRow> & { title: string; meta: string; intro: string }) {
  return (
    <div className="flex flex-col">
      <JobDetailActionRow {...actionRow} />
      <h1 className="mt-4 text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#1f2733] max-[720px]:text-[24px] min-[761px]:order-3 min-[761px]:mt-2">
        {title}
      </h1>
      {/* ≤760px 타이포는 본문(FormattedContentView 15px/1.75/#3f4855)으로 수렴시킨다. 좁은 폭에서
          16px 소개와 15px 메타는 크기 차가 읽히지 않으면서 제목 아래 덩치만 키웠다. 위계는 색과 굵기가
          맡는다 — 메타는 한 단계 옅은 #8a94a3, 소개는 본문색. 공고 제목(h1)은 그대로 둔다. */}
      <p className="mt-2 text-[15px] font-normal text-[#667181] max-[760px]:text-[#8a94a3] min-[761px]:order-2 min-[761px]:mt-3">
        {meta}
      </p>
      <div className="mt-3 border-t border-[#edf1f4] min-[761px]:hidden" />
      <p className="mt-3 max-w-[760px] text-[16px] font-normal leading-[1.65] text-[#667181] max-[760px]:text-[15px] max-[760px]:leading-[1.75] max-[760px]:text-[#3f4855] min-[761px]:order-4 min-[761px]:mt-4">
        {intro}
      </p>
    </div>
  );
}

/** 공고 상세(산업·약국·병원·연구 V2 공통) "기관 정보" 섹션 하단 CTA 3버튼 — 기업 인사이트
 * (/companies/{companyId}, /reviews, /interviews)로 연결한다. companyId가 없는 경우(예: 산업·연구의
 * 미승격 기관) 호출부에서 아예 렌더하지 않으므로 이 컴포넌트는 항상 유효한 companyId를 받는다고 가정한다.
 * `detailLabel`은 첫 버튼 문구만 바꾼다 — 병원·약국·연구는 "기관 정보 더보기"(기관 단위 명칭에 더 맞음), 산업은
 * 기본값 "기업 정보 더보기"를 그대로 쓴다. 나머지 두 버튼("기업 리뷰 보기"/"면접 후기 보기")은 4트랙 공통이다. */
export function CompanyCtaButtons({ companyId, detailLabel = "기업 정보 더보기" }: { companyId: string; detailLabel?: string }) {
  /* ≤760px는 2열 그리드다 — 주 CTA(기업 정보 더보기)가 첫 행 전폭, 보조 둘이 둘째 행을 나눠 쓴다.
     종전 max-[640px]:flex-col은 세 버튼을 세로로 세우면서 h-11을 통째로 잃고 있었다: 세로 flex에서
     flex-1은 주축(=세로)의 flex-basis를 0으로 잡아 높이 지정을 이긴다. 실측 21·23·23px으로,
     지정한 44px의 절반도 안 되는 터치 타깃이었다. grid에서는 flex-* 자체가 무시되어 h-12가 그대로 선다. */
  const baseButton = "inline-flex h-11 flex-1 items-center justify-center px-5 text-[13px] transition max-[760px]:h-12";
  const secondaryButton = "border border-border bg-white font-medium text-[#4f5a66] hover:border-brand hover:text-brand";

  return (
    <div className="mt-9 flex flex-wrap gap-2 max-[760px]:grid max-[760px]:grid-cols-2">
      <Link
        href={`/companies/${companyId}`}
        className={clsx(baseButton, "bg-brand font-semibold text-white hover:bg-[var(--color-brand-dark)] max-[760px]:col-span-2")}
      >
        {detailLabel}
      </Link>
      <Link href={`/companies/${companyId}/reviews`} className={clsx(baseButton, secondaryButton)}>
        기업 리뷰 보기
      </Link>
      <Link href={`/companies/${companyId}/interviews`} className={clsx(baseButton, secondaryButton)}>
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
    <section className={clsx("border border-border bg-white px-7 py-6", FLUSH_SECTION_CLASS)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-[20px] font-bold tracking-[-0.02em] text-[#242b36]">
          <Layers size={18} className="shrink-0 text-[#6b7280]" aria-hidden />
          비슷한 공고
        </h2>
        <Link href={`/jobs?track=${track}`} className="shrink-0 text-[13px] font-medium text-[#777777] hover:text-[#111111]">
          관련 공고 더보기 ›
        </Link>
      </div>
      {/* 섹션이 이미 전폭이라 카드는 섹션 패딩(≤760px 24px = --shell-gutter/2)만큼 더 밀면 화면 끝에 닿는다 —
          FLUSH_LIST_CLASS의 음수 마진이 정확히 그 값이라 목록 페이지와 같은 한 줄을 쓴다. */}
      <div className={clsx("mt-5", FLUSH_LIST_CLASS)}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} isBookmarked={savedIds.has(job.id)} onToggleBookmark={toggleSave} variant="flush" />
        ))}
      </div>
    </section>
  );
}
