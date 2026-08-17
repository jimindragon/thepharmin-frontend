"use client";

/**
 * 이 파일은 마케팅 랜딩 전용 타이포 스케일을 쓴다 — 확정 타이포 스케일
 * (34/28/24/22/20/17/16/15/14/13/12)의 예외로 인정됨.
 *
 * 히어로 h1은 clamp(36px,5.2vw,58px), 섹션 h2는 clamp(24px,3vw,38px)로 뷰포트에 따라
 * 유동한다. 본문·배지 쪽에도 12.5/13.5/10.5 같은 소수점 값이 섞여 있는데, 유료 상품
 * 위계를 촘촘히 나누기 위한 것이라 그대로 둔다.
 * "스케일 위반"으로 보고 일괄 치환하지 말 것 — 바꾸려면 랜딩 전체를 함께 재설계해야 한다.
 */

import clsx from "clsx";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { useBusinessMember } from "@/hooks/useBusinessMember";
import { BOOST_PRICING, discountPercent, type BoostGrade, type BoostPricePoint, type PricingCat } from "@/data/boostPricing";

// ── 가격 데이터 ─────────────────────────────────────────────
type Cat = PricingCat;
interface PP { price: string; original?: string; }

function formatKrw(n: number) { return n.toLocaleString("ko-KR") + "원"; }

function toPP(points: BoostPricePoint[]): [PP, PP, PP, PP] {
  return points.map((p) =>
    p.originalKrw === p.discountedKrw
      ? { price: formatKrw(p.discountedKrw) }
      : { price: formatKrw(p.discountedKrw), original: formatKrw(p.originalKrw) },
  ) as [PP, PP, PP, PP];
}

const GRADES: BoostGrade[] = ["premium", "featured", "standard"];
const CATS: Cat[] = ["industry", "hospital", "pharmacy"];

const PRICES = GRADES.reduce((acc, grade) => {
  acc[grade] = CATS.reduce((catAcc, cat) => {
    catAcc[cat] = toPP(BOOST_PRICING[grade][cat]);
    return catAcc;
  }, {} as Record<Cat, [PP, PP, PP, PP]>);
  return acc;
}, {} as Record<BoostGrade, Record<Cat, [PP, PP, PP, PP]>>);

/** 기간 드롭다운 라벨 — 할인율은 가격 데이터에서 파생한다(boostPricing의 discountPercent). */
function periodLabel(p: BoostPricePoint): string {
  const pct = discountPercent(p);
  return pct === null ? `${p.weeks}주` : `${p.weeks}주 (${pct}%↓)`;
}

/**
 * 가격 카드 배지 2종. 브랜드 그라데이션·초록은 핵심 CTA("신청하기")에만 쓰는 규칙이라
 * 배지는 전부 모노크롬으로 둔다 — 한 카드 안에 초록이 여러 채도로 겹치면 CTA가 묻힌다.
 * 네 장이 같은 문자열을 공유해야 하므로 각 카드에 인라인으로 흩지 말 것.
 */
const AREA_BADGE = "border border-[#e5e5e5] px-2 py-[3px] text-[11px] font-semibold text-[#737373]";
const ACCENT_BADGE = "bg-[#0a0a0a] px-2 py-[3px] text-[10.5px] font-bold text-white";

const CAT_LABEL: Record<Cat, string> = {
  industry: "산업·연구기관",
  hospital: "병원",
  pharmacy: "약국",
};

/**
 * VS 대조표 행. 데스크톱 표(>760px)와 모바일 카드 리스트(≤760px)가 같은 배열을 렌더한다 —
 * 두 렌더가 갈라지는 것은 마크업뿐이고 문구는 여기 한 곳에만 둔다.
 */
const VS_ROWS = [
  { label: "업계 전문성",           tp: "약사·업계 출신 전문 컨설턴트가 직접 운영",                             gen: "분야 비전문 일반 채용 운영" },
  { label: "SNS·미디어 홍보",        tp: "LinkedIn·Instagram 등 미디어 연계 노출 (타 플랫폼 대비 약 10배)", gen: "자사 공고 게시판 노출에 한정" },
  { label: "공고 1건당 평균 조회수",  tp: "평균 3~4만 회 노출",                                               gen: "수백~수천 회 수준" },
  { label: "타깃 인재",              tp: "제약·바이오·약국·병원 전문 인재 (통합 구독자 6,000명)",            gen: "분야 무관 불특정 다수" },
  { label: "채용 방식",              tp: "채용공고 + 헤드헌팅 + 기업 정보 관리 통합",                        gen: "공고 등록 위주" },
  { label: "후보 검증·추천",          tp: "업계 이해 기반의 검증·추천",                                      gen: "키워드 자동 매칭" },
] as const;

/** 표 헤더의 두 열 이름. 모바일 카드에서는 행 라벨로 다시 쓴다(로고 이미지를 쓸 자리가 없다). */
const VS_TP_LABEL = "더파마 리크루트";
const VS_GEN_LABEL = "다른 채용 플랫폼";

// ── 상품별 제공 항목 비교 ───────────────────────────────────
/** 등급 열. 데스크톱 표의 <th>와 모바일 등급 탭이 같은 순서·이름을 쓴다. */
const FEATURE_TIERS = [
  { tier: "BASIC",    sub: "무료 공고",  prem: false },
  { tier: "STANDARD", sub: "기본 노출",  prem: false },
  { tier: "FEATURED", sub: "확장 노출",  prem: false },
  { tier: "PREMIUM",  sub: "집중 노출",  prem: true  },
] as const;

interface FeatureRow {
  label: string;
  sub?: string;
  /** BASIC / STANDARD / FEATURED / PREMIUM 순. true=제공, false=미제공, 문자열=횟수·기간 */
  cells: [boolean | string, boolean | string, boolean | string, boolean | string];
  /** 데스크톱 표에서 항목 묶음을 가르는 두꺼운 행 간격 */
  gap: boolean;
  pharmacyExcluded?: boolean;
}

/* pharmacyExcluded: 약국 상품은 웹사이트 노출만 묶은 구성이라 채널·팝업이 빠진다.
   가격 카드 문구(premCopy·featCopy의 약국 분기)가 이미 SNS·카카오톡을 빼고 말하는데
   이 표만 제공한다고 적혀 있던 것을 맞춘 것 — 셀마다 분기하지 말고 이 플래그로만 다룰 것. */
const FEATURE_ROWS: FeatureRow[] = [
  { label: "더파마 리크루트 공고 등록",                                       cells: [true,  true,  true,  true],  gap: false },
  // 웹사이트 노출 3행은 기간이 상품마다 다른 게 아니라 "구매한 이용 기간만큼"이라 제공/미제공만 남긴다(각주로 보충).
  { label: "웹사이트 추천 공고 노출",                                          cells: [false, true,  true,  true],  gap: false },
  { label: "웹사이트 상단 추천 노출",                                          cells: [false, false, true,  true],  gap: false },
  { label: "웹사이트 최상단 추천 노출",                                        cells: [false, false, false, true],  gap: false },
  { label: "SNS 주간 추천 공고",     sub: "업계 타깃 채널 묶음 노출",           cells: [false, false, "1회", "1회"], gap: true,  pharmacyExcluded: true },
  { label: "카카오톡 주간 추천 공고", sub: "4,000명 대상 노출",                 cells: [false, false, "1회", "1회"], gap: false, pharmacyExcluded: true },
  { label: "이주의 추천 공고 팝업",                                            cells: [false, false, false, "7일"], gap: true,  pharmacyExcluded: true },
  { label: "SNS 단독 공고 노출",      sub: "평균 조회수 3~4만 회",              cells: [false, false, false, "1회"], gap: false, pharmacyExcluded: true },
  { label: "카카오톡 단독 공고 노출", sub: "4,000명 대상 노출",                 cells: [false, false, false, "1회"], gap: false, pharmacyExcluded: true },
  { label: "더파마뉴스 사이드 배너",                                           cells: [false, false, false, "7일"], gap: false, pharmacyExcluded: true },
];

/**
 * 한 칸의 최종 값. 약국 분기가 표(데스크톱)와 리스트(모바일) 두 곳에 있으므로 여기서만 계산한다 —
 * 렌더마다 따로 구현하면 두 화면이 서로 다른 표를 보여주게 된다.
 * 제외되는 것은 유료 상단 두 등급(FEATURED·PREMIUM)뿐 — BASIC·STANDARD는 원래 미제공이라 그대로 둔다.
 */
function featureCell(row: FeatureRow, tierIndex: number, cat: Cat): boolean | string {
  const excluded = cat === "pharmacy" && !!row.pharmacyExcluded;
  return excluded && tierIndex >= 2 ? false : row.cells[tierIndex];
}

/** 제공/미제공 마크 — 데스크톱 표 셀과 모바일 리스트가 같은 기호를 쓴다. */
function FeatureMark({ value }: { value: boolean | string }) {
  if (value === true) return <span className="inline-flex justify-center"><Check size={18} strokeWidth={2} className="text-[#17A68C]" /></span>;
  if (value === false) return <span className="text-[#d4d4d4]">—</span>;
  return <>{value}</>;
}

// ── 공용 서브 컴포넌트 ──────────────────────────────────────
function BlackIc() {
  return (
    <span className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center bg-[#111111]">
      <Check size={11} strokeWidth={3} className="text-white" />
    </span>
  );
}

function GreenCheck() {
  return <Check size={14} strokeWidth={2} className="mt-[2px] shrink-0 text-[#17A68C]" />;
}

function TpCheck() {
  return (
    <span className="mr-[11px] inline-grid h-5 w-5 shrink-0 place-items-center bg-[#5cb89f]">
      <Check size={12} strokeWidth={3} className="text-white" />
    </span>
  );
}

// ── 카드 내장 기간 선택 드롭다운 ────────────────────────────
function PeriodSelect({ value, onChange, points }: { value: number; onChange: (i: number) => void; points: BoostPricePoint[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const label = periodLabel(points[value]);

  return (
    // 카드 전체가 미리보기 하이라이트 고정용 onClick을 갖고 있다 — 기간을 고르는 것은
    // 등급 선택이 아니므로 여기서 전파를 끊어 드롭다운 조작이 고정을 건드리지 않게 한다.
    <div ref={ref} className="relative mb-[14px]" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border border-[#e5e5e5] bg-white px-3 py-[9px] text-[13px] font-medium text-[#404040] transition-colors hover:border-[#a3a3a3] max-[760px]:min-h-[44px]"
      >
        <span>이용기간: <span className="font-semibold">{label}</span></span>
        <ChevronDown size={13} className={clsx("ml-1 shrink-0 text-[#737373] transition-transform", open && "rotate-180")} />
      </button>
      {/* 패널: ≤760px에서는 w-full로 컨테이너를 따라간다 — 320px에서 210px 고정폭이 카드 밖으로 삐져나갔다.
          데스크톱 우측 열은 190px이라 w-full로 바꾸면 패널이 좁아지므로 고정폭을 그대로 둔다. */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-[210px] max-w-[210px] border border-[#e5e5e5] bg-white shadow-[0_8px_22px_rgba(20,32,46,0.12)] max-[760px]:w-full">
          {points.map((p, idx) => (
            <button
              key={p.weeks}
              type="button"
              onClick={() => { onChange(idx); setOpen(false); }}
              className={clsx(
                "flex w-full items-center justify-between px-4 py-3 text-[13.5px] transition-colors hover:bg-[#f5f5f5]",
                value === idx ? "font-semibold text-[#0a0a0a]" : "text-[#404040]",
              )}
            >
              <span>{periodLabel(p)}</span>
              {value === idx && <Check size={14} className="text-[#0a0a0a]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 노출 위치 미리보기 (추상 스켈레톤) ──────────────────────
/**
 * 실제 추천 공고 구좌(RecommendedJobs.tsx의 RecommendedJobsGrid)의 축소 재현이다.
 * 실컴포넌트·실데이터는 일부러 쓰지 않는다 — 저 그리드는 1240px 폭을 전제로 만들어져
 * 이 535px 박스에 넣으면 반응형 분기가 걸려 열 수가 무너지고, 그러면 카드 크기 사다리가
 * 뒤집혀(STANDARD가 PREMIUM보다 넓어짐) 구좌 위계라는 안내 목적 자체가 깨진다.
 *
 * 대신 실제 구좌에서 위계를 만드는 세 가지만 그대로 가져온다:
 *   - 열 수 3 / 4 / 5 (RecommendedJobsGrid의 존별 grid-cols)
 *   - 카드 높이 사다리: 커버 이미지 있음 → 헤더 띠 → 납작한 한 줄
 *   - 존 라벨 타이포(11px · tracking 0.12em · #c2c2c2 대문자)
 * 이 셋 중 하나라도 바꾸려면 RecommendedJobs.tsx와 함께 봐야 한다.
 */
type PreviewTier = BoostGrade | "basic";

const PREVIEW_ZONE_LABEL = "mb-[7px] text-[11px] font-semibold uppercase tracking-[0.12em]";

function PreviewZone({
  label,
  active,
  muted,
  children,
}: {
  label: string;
  active: boolean;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    // 테두리는 평시에도 2px 투명으로 잡아 둔다 — 강조 시에만 두르면 레이아웃이 밀린다.
    <div
      className={clsx(
        "border-2 px-[10px] pb-[11px] pt-[9px] transition-colors duration-150",
        active ? "border-[#2c6f63] bg-[#eef6f2]" : "border-transparent",
      )}
    >
      <p className={clsx(PREVIEW_ZONE_LABEL, muted ? "text-[#dcdcdc]" : "text-[#c2c2c2]")}>{label}</p>
      {children}
    </div>
  );
}

function PreviewBar({ w, tone = "strong" }: { w: string; tone?: "strong" | "weak" }) {
  return (
    <span
      className={clsx("block", tone === "strong" ? "h-[5px] bg-[#d9d9d9]" : "h-[4px] bg-[#ececec]")}
      style={{ width: w }}
    />
  );
}

function PreviewPremiumCard() {
  return (
    <div className="border border-[#e5e5e5] bg-white">
      {/* 커버 이미지 자리 — PREMIUM만 갖는 19:6 배너 */}
      <div className="aspect-[19/6] bg-[linear-gradient(160deg,#0D7369,#17A68C)]" />
      <div className="flex flex-col gap-[5px] p-[8px]">
        <PreviewBar w="78%" />
        <PreviewBar w="46%" tone="weak" />
      </div>
    </div>
  );
}

function PreviewFeaturedCard() {
  return (
    <div className="border border-[#e5e5e5] bg-white">
      <div className="flex items-center gap-[4px] bg-[#fafafa] px-[6px] py-[5px]">
        {/* 흰 로고 패치 자리 */}
        <span className="block h-[11px] w-[22px] shrink-0 rounded-[2px] border border-[#ececec] bg-white" />
        <span className="block h-[4px] flex-1 bg-[#e5e5e5]" />
      </div>
      <div className="flex flex-col gap-[5px] p-[7px]">
        <PreviewBar w="84%" />
        <PreviewBar w="52%" tone="weak" />
      </div>
    </div>
  );
}

function PreviewStandardCard() {
  return (
    <div className="flex items-center gap-[4px] border border-[#e5e5e5] bg-white px-[5px] py-[7px]">
      {/* 로고 사각 */}
      <span className="block h-[11px] w-[11px] shrink-0 bg-[#ececec]" />
      <span className="block h-[4px] flex-1 bg-[#d9d9d9]" />
    </div>
  );
}

/**
 * ≤1040px 축약 미리보기의 존 한 줄.
 *
 * 데스크톱 PreviewZone과 같은 것을 말하되(존 순서·라벨·강조 문법 동일), 브라우저 목업을 통째로
 * 세로로 눌러 담는다 — 목업을 그대로 줄이면 존당 카드가 5장까지 들어가 스켈레톤이 뭉개진다.
 * 대신 "존 이름 + 그 존의 구좌 수"만 남긴다. 카드 장수는 데스크톱 존의 grid-cols와 같은 값을 쓴다.
 */
function MiniPreviewZone({ label, active, slots, muted }: { label: string; active: boolean; slots: number; muted?: boolean }) {
  return (
    // 테두리는 평시에도 2px 투명으로 잡아 둔다 — 데스크톱 존과 같은 이유(강조 시 밀림 방지).
    <div
      className={clsx(
        "flex items-center gap-[10px] border-2 px-[8px] py-[5px] transition-colors duration-150",
        active ? "border-[#2c6f63] bg-[#eef6f2]" : "border-transparent",
      )}
    >
      <span className={clsx("w-[64px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em]", muted ? "text-[#dcdcdc]" : "text-[#c2c2c2]")}>
        {label}
      </span>
      <span className="flex flex-1 gap-[4px]">
        {Array.from({ length: slots }).map((_, i) => (
          <span key={i} className={clsx("h-[16px] flex-1", muted ? "border border-[#efefef] bg-[#fafafa]" : "border border-[#e5e5e5] bg-[#f0f0f0]")} />
        ))}
      </span>
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export function BusinessPricingClient() {
  const isMember = useBusinessMember();
  const [activeCat, setActiveCat] = useState<Cat>("industry");

  // ≤760px 제공 항목 비교 리스트에서 보고 있는 등급 열. 기본은 페이지가 밀고 있는 PREMIUM(마지막 열).
  const [featureTier, setFeatureTier] = useState(FEATURE_TIERS.length - 1);

  // 카드별 독립 기간 상태 (default: 2주 = index 1)
  const [premPeriod, setPremPeriod] = useState(1);
  const [featPeriod, setFeatPeriod] = useState(1);
  const [stdPeriod,  setStdPeriod]  = useState(1);

  // 미리보기 하이라이트 — hover는 스쳐가는 강조, click은 고정.
  // hover가 풀리면 고정해 둔 등급으로 돌아간다(둘 다 없으면 무강조).
  const [hoveredTier, setHoveredTier] = useState<PreviewTier | null>(null);
  const [pinnedTier, setPinnedTier] = useState<PreviewTier | null>(null);
  const activeTier = hoveredTier ?? pinnedTier;

  // 터치 기기에서는 탭이 mouseenter까지 발생시키고 mouseleave가 오지 않는다. 그러면 같은 카드를
  // 다시 눌러 고정을 풀어도 hoveredTier가 남아 하이라이트가 안 꺼진다(고스트 하이라이트).
  // hover가 실제로 되는 포인터에서만 hover 강조를 붙인다 — 데스크톱 동작은 그대로다.
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const tierHighlight = (tier: PreviewTier) => ({
    ...(canHover
      ? { onMouseEnter: () => setHoveredTier(tier), onMouseLeave: () => setHoveredTier(null) }
      : null),
    onClick: () => setPinnedTier((current) => (current === tier ? null : tier)),
  });

  // 스크롤 페이드인
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const prem = PRICES.premium[activeCat][premPeriod];
  const feat = PRICES.featured[activeCat][featPeriod];
  const std  = PRICES.standard[activeCat][stdPeriod];

  const premCopy = activeCat === "pharmacy"
    ? { subtitle: "빠른 채용을 위한 최상단 노출", desc: "웹사이트 최상단 추천 영역에 노출됩니다. 가장 빠른 채용이 필요할 때 추천합니다." }
    : { subtitle: "빠른 채용을 위한 전 채널 집중 노출 패키지", desc: "웹사이트 최상단부터 SNS·카카오톡·미디어까지 한 번에 노출합니다. 가장 빠른 채용이 필요할 때 추천합니다." };
  const featCopy = activeCat === "pharmacy"
    ? { subtitle: "상단 추천 노출", desc: "상단 추천 영역에 노출되어 공고 도달 범위를 넓힙니다." }
    : { subtitle: "추천 노출 + 주요 채널 노출 구성", desc: "상단 추천 노출에 SNS·카카오톡 주간 노출을 더해 공고 도달 범위를 넓힙니다." };

  const applyHref = isMember ? "/support/contact" : "/business/signup";
  const freeHref  = isMember ? "/business/jobs/new" : "/business/signup";

  return (
    <>
      <BusinessHeader />
      <main className="bg-white">

        {/* ══ HERO ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1a1a] px-6 text-white">
          {/* 배경 사진 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[.55]"
            style={{ backgroundImage: "url(/images/business-hero.jpg)" }}
          />
          {/* 어둠 오버레이 — 왼쪽(글씨 영역) 진하게, 오른쪽으로 페이드 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(90deg,rgba(12,12,12,.68) 0%,rgba(12,12,12,.62) 30%,rgba(12,12,12,.3) 75%,rgba(12,12,12,.15) 100%)" }}
          />
<div className="app-shell--default relative z-10 py-[100px] max-[760px]:py-16">
            {/* ≤760px에서 자간·색을 한 단계씩 죽인다 — 좁은 폭에서는 넓은 자간이 한 줄을 더 잡아먹고,
                밝은 민트가 바로 아래 h1의 그라데이션과 같은 채도로 경쟁한다. 둘 다 페이지 안의 기존 값. */}
            <p className="text-[12px] font-semibold tracking-[.14em] text-[#7fcdb9] max-[760px]:tracking-[.12em] max-[760px]:text-[#5cb89f]">결국, 사람이 경쟁력입니다</p>
            {/* fontSize를 인라인 style에서 클래스로 옮겼다 — 인라인은 max-[760px] 분기로 덮을 수 없다.
                clamp 값은 그대로라 >760px 렌더 결과는 동일하다. 자간(-.045em)은 건드리지 않는다. */}
            <h1
              className="mt-5 text-[clamp(36px,5.2vw,58px)] font-semibold text-white max-[760px]:text-[32px]"
              style={{ letterSpacing: "-.045em", lineHeight: 1.15 }}
            >
              제약·바이오·약국·병원 전문 채용,{" "}
              {/* ≤760px에서는 강제 줄바꿈을 풀어 자연 줄바꿈에 맡긴다(390·360px에서 4줄 → 3줄).
                  앞의 {" "}는 br이 꺼졌을 때 어절이 붙지 않게 하는 것 — 데스크톱에서는 줄 끝 공백이라 렌더에 영향이 없다. */}
              <br className="max-[760px]:hidden" />
              <span className="text-gradient-cta font-bold">더파마 리크루트</span> 하나로.
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-[#c4c8c6] max-[760px]:text-[15px]">
              통합 구독자 6,000명의 약사·연구원·업계 실무자 네트워크.{" "}
              <br className="max-[760px]:hidden" />다른 채용 플랫폼이 닿지 못하는 제약·바이오 전문 인재를 직접 연결합니다.
            </p>
            {/* ≤760px에서는 버튼 두 장이 같은 무게로 나란히 서지 않게 한다 — 주 CTA는 풀폭,
                보조는 아웃라인을 벗겨 텍스트 링크로 내린다. 위계가 생기므로 세로 간격도 함께 좁힌다. */}
            <div className="mt-10 flex flex-wrap gap-3 max-[760px]:gap-1">
              {/* 사진 히어로 위 주 CTA — 어두운 변형(보조 버튼·하단 CTA는 기존 유지) */}
              <LinkButton href="#pricing" variant="gradient-dark" size="lg" className="max-[760px]:w-full">
                노출 상품 보기
                <ChevronRight size={17} />
              </LinkButton>
              {/* h-11(44px)은 테두리를 벗긴 뒤에도 터치 타깃을 유지하기 위한 것 — 글자는 담백하게 두고
                  밑줄로만 링크임을 표시한다. 글자색은 아웃라인 버튼의 것을 그대로 쓴다. */}
              <a
                href={freeHref}
                className="inline-flex h-12 items-center border border-white/30 px-7 text-[15px] font-medium text-white transition-colors hover:bg-white/10 max-[760px]:h-11 max-[760px]:border-0 max-[760px]:px-0 max-[760px]:underline max-[760px]:underline-offset-4 max-[760px]:hover:bg-transparent"
              >
                무료로 공고 등록
              </a>
            </div>
          </div>
        </section>

        {/* ══ 지표 밴드 ══════════════════════════════════════════ */}
        {/* 이 밴드만 px-6이 없어 다른 섹션보다 좌우 24px씩 넓게 나갔다.
            app-shell--default는 ≤1180px에서 100vw가 아닌 100% 기준이라, 부모 패딩이 폭에 그대로 반영된다.
            그래서 무조건 px-6을 주면 1041~1180px 구간의 폭까지 함께 바뀐다 — 데스크톱 무변화를 위해
            표준 브레이크포인트 1040 이하로만 건다(그 위는 원래 정렬을 그대로 유지). */}
        <div className="border-b border-[#e5e5e5] bg-[#f5f5f5] max-[1040px]:px-6">
          {/* 2열에서는 열 간격이 필요하다 — 3열 데스크톱은 셀이 넓어 gap 없이도 떨어져 보이지만,
              2열(147px)에서는 "평균 3~4만 회"가 셀을 꽉 채워 옆 셀 값과 맞닿는다. */}
          <div className="app-shell--default grid grid-cols-3 max-[640px]:grid-cols-2 max-[640px]:gap-x-5">
            {([
              { value: "평균 3~4만 회", sub: "SNS 단독 공고 1건당 조회수" },
              { value: "4,000명",        sub: "카카오톡 단독 공고 대상" },
              { value: "약 10배",        sub: "미디어 연계 노출 (일반 대비)" },
            ] as const).map((s, i) => (
              <div key={i} className="relative py-[34px] text-center max-[640px]:border-t max-[640px]:border-[#e5e5e5] max-[640px]:text-left max-[760px]:py-6">
                {i > 0 && <span className="absolute inset-y-7 left-0 w-px bg-[#e5e5e5] max-[640px]:hidden" />}
                {/* h1과 같은 이유로 fontSize를 클래스로 옮겼다(인라인은 분기 불가). clamp 값은 그대로.
                    ≤760px 18px — 가장 긴 "평균 3~4만 회"가 2열 셀에서 한 줄에 들어가는 최대 크기다.
                    320px 셀이 102px이라 19px 이상은 "평균 3~4만 / 회"로 접힌다(실측). */}
                <b
                  className="block text-[clamp(26px,3.2vw,34px)] font-bold text-[#0a0a0a] max-[760px]:text-[18px] max-[760px]:font-semibold"
                  style={{ letterSpacing: "-.035em" }}
                >
                  {s.value}
                </b>
                <span className="mt-2 block text-[13.5px] text-[#737373]">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══ VS 대조표 ═════════════════════════════════════════ */}
        <section className="border-t border-[#e5e5e5] bg-[#fafafa] px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">WHY THE PHARMA</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.28 }}
            >
              다른 채용 플랫폼과<br />무엇이 다를까요?
            </h2>
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] leading-[1.6] text-[#737373]">
              같은 비용으로, 업계 전문 인재에게 훨씬 더 넓고 정확하게 도달합니다.
            </p>
            <div className="mt-[22px] flex flex-wrap justify-center gap-x-[28px] gap-y-[10px]">
              {([
                { label: "더파마뉴스 레거시", sub: "전문 미디어 독자 기반" },
                { label: "전 직무 커버",      sub: "연구개발~약국·병원" },
              ] as const).map((item) => (
                <div key={item.label} className="flex items-center gap-[7px]">
                  <GreenCheck />
                  <span className="text-[14px] font-semibold text-[#0a0a0a]">{item.label}</span>
                  <span className="text-[13px] text-[#a3a3a3]">— {item.sub}</span>
                </div>
              ))}
            </div>
            {/* group: .vs:hover → 더파마 헤더 float-up */}
            {/* 표는 min-w-[760px]이라 모바일에서는 가로 스크롤 없이는 타사 열이 아예 안 보인다.
                ≤760px에서는 아래 카드 리스트로 교체한다(데이터는 VS_ROWS 하나를 공유). */}
            <div className="group mt-[54px] overflow-x-auto max-[760px]:hidden">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-[28%] border-b border-[#e5e5e5] pb-6 text-left" />
                    <th className="w-[44%] bg-[linear-gradient(160deg,#0D7369,#17A68C)] px-[26px] py-[26px] text-center text-[16px] font-bold text-white shadow-[0_12px_32px_-14px_rgba(13,115,105,.55)] transition-[transform,box-shadow] duration-[250ms] group-hover:-translate-y-0.5 group-hover:shadow-[0_18px_42px_-14px_rgba(13,115,105,.6)]">
                      <img
                        src="/images/white_logo_1.svg"
                        alt="더파마 리크루트"
                        className="inline-block h-[20px] w-auto"
                      />
                    </th>
                    <th className="w-[28%] border-b border-[#e5e5e5] pb-6 text-center text-[14px] font-semibold text-[#737373]">
                      다른 채용 플랫폼
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {VS_ROWS.map((row) => (
                    <tr key={row.label}>
                      <td className="border-b border-[#e5e5e5] py-[22px] text-[15px] font-semibold text-[#0a0a0a]">{row.label}</td>
                      <td className="whitespace-nowrap border-b border-[#e5e5e5] bg-[#eef6f2] px-[26px] py-[22px] text-left text-[15px] font-medium">
                        <TpCheck />{row.tp}
                      </td>
                      <td className="border-b border-[#e5e5e5] px-[16px] py-[22px] text-left text-[15px] text-[#a3a3a3]">
                        <span className="mr-[10px] text-[#d4d4d4]">—</span>{row.gen}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ≤760px 대체 — 한 행을 한 장의 카드로 세운다. 표 헤더(로고 / "다른 채용 플랫폼")가 사라지므로
                두 값이 각각 누구 것인지 카드 안에서 라벨로 밝힌다. nowrap은 쓰지 않는다(자연 줄바꿈). */}
            <div className="mt-8 hidden flex-col gap-3 max-[760px]:flex">
              {VS_ROWS.map((row) => (
                <div key={row.label} className="border border-[#e5e5e5] bg-white p-5">
                  <p className="text-[15px] font-semibold text-[#0a0a0a]">{row.label}</p>
                  <div className="mt-3 flex flex-col gap-2">
                    {/* flex — 기호(체크·대시)는 그대로 두고 둘째 줄이 기호 아래로 파고들지 않게 매단다.
                        데스크톱 셀은 nowrap이라 줄바꿈이 없어 이 문제가 없었다. */}
                    <div className="bg-[#eef6f2] px-4 py-3">
                      <p className="text-[12px] text-[#737373]">{VS_TP_LABEL}</p>
                      <p className="mt-[5px] flex text-[15px] font-medium text-[#0a0a0a]"><TpCheck />{row.tp}</p>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[12px] text-[#737373]">{VS_GEN_LABEL}</p>
                      <p className="mt-[5px] flex text-[15px] text-[#a3a3a3]">
                        <span className="mr-[10px] text-[#d4d4d4]">—</span>{row.gen}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-[12.5px] text-[#a3a3a3]">
              * 더파마 리크루트 자체 채널 운영 기준. 노출·조회수는 직무·시기에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>

        {/* ══ HEADHUNTING ══════════════════════════════════════ */}
        <section className="bg-white px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-[56px] max-[1040px]:grid-cols-1 max-[1040px]:gap-9">
              <div>
                <p className="text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">HEADHUNTING</p>
                <h2
                  className="mt-[14px] font-bold text-[#0a0a0a]"
                  style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.035em", lineHeight: 1.28 }}
                >
                  필요한 인재를<br />더파마가 찾아드립니다.
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-[#525252]">
                  포지션 요건을 정밀 분석해, 공개 시장에 드러나지 않는 업계 핵심 인재까지 직접 서칭·검증해 추천합니다.
                </p>
                <div className="mt-6 flex flex-col gap-[13px]">
                  {([
                    "포지션·직무 요건 정밀 분석",
                    "산업 네트워크 기반 핵심 인재 서칭",
                    "이직 의향·이력 검증된 후보 추천",
                    "전담 컨설턴트의 채용 동행",
                  ] as const).map((c) => (
                    <div key={c} className="flex items-center gap-[11px] text-[15px] text-[#404040]">
                      <BlackIc />{c}
                    </div>
                  ))}
                </div>
                <Link href="/business/headhunting" className="mt-[30px] inline-flex bg-[#0a0a0a] px-[26px] py-[14px] text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">
                  헤드헌팅 의뢰하기
                </Link>
              </div>
              <div className="flex flex-col gap-[14px]">
                {([
                  { init: "K", role: "임상개발 PM",            meta: "경력 8년 · 서울",  tags: ["임상 2/3상","종양학"],     dark: false },
                  { init: "L", role: "공정개발 (Downstream)", meta: "경력 6년 · 인천",  tags: ["CDMO","정제공정"],         dark: true  },
                  { init: "P", role: "사업개발 BD",             meta: "경력 10년 · 서울", tags: ["라이선싱","글로벌"],       dark: false },
                ] as const).map((c) => (
                  <div
                    key={c.role}
                    className="flex items-center gap-[18px] border border-[#e5e5e5] bg-white px-6 py-5 transition-[transform,box-shadow,border-color] duration-[220ms] hover:-translate-y-0.5 hover:border-[#d4d4d4] hover:shadow-[0_10px_26px_-16px_rgba(0,0,0,0.18)] max-[760px]:flex-wrap"
                  >
                    <span className={clsx("grid h-[52px] w-[52px] shrink-0 place-items-center text-[18px] font-bold text-white", c.dark ? "bg-[#2c6f63]" : "bg-[#232726]")}>
                      {c.init}
                    </span>
                    <div className="min-w-0 flex-1">
                      <b className="text-[17px] font-bold tracking-[-0.01em]">{c.role}</b>
                      <p className="my-[3px] text-[13px] text-[#737373]">{c.meta}</p>
                      <div className="flex flex-wrap gap-[6px]">
                        {c.tags.map((t) => <span key={t} className="bg-[#f5f5f5] px-[9px] py-1 text-[11.5px] text-[#525252]">{t}</span>)}
                      </div>
                    </div>
                    {/* ≤760px: basis-full로 둘째 줄에 내려 전폭 버튼이 된다. 한 행에 남겨 두면
                        아바타·버튼이 shrink-0이라 가운데 텍스트 열이 64px까지 눌려 전 요소가 2줄로 쪼개진다.
                        (390px 실측 64px / 360px 34px / 320px 0px) */}
                    <button type="button" className="shrink-0 border border-[#e5e5e5] px-4 py-[9px] text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#fafafa] max-[760px]:min-h-[44px] max-[760px]:basis-full">
                      프로필 보기
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ BOOST ════════════════════════════════════════════ */}
        <section className="bg-[#fafafa] px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <div className="grid grid-cols-[1fr_0.9fr] items-center gap-[56px] max-[1040px]:grid-cols-1 max-[1040px]:gap-8">
              <div>
                <p className="text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">START FREE</p>
                <h2
                  className="mt-[14px] font-bold text-[#0a0a0a]"
                  style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.035em", lineHeight: 1.28 }}
                >
                  등록은 무료,<br />노출은 필요한 만큼만
                </h2>
                <p className="mt-4 text-[16px] leading-[1.7] text-[#525252]">
                  모든 채용 트랙에서 공고 등록과 게시는 무료입니다. 채용을 빠르게 진행하고 싶을 때만 아래 부스트로 추천 노출을 더하세요.
                </p>
              </div>
              {/* 1040px에서 1단으로 적층된다 — 세로 구분선·들여쓰기는 2열일 때만 의미가 있어 함께 끈다. */}
              <div className="border-l border-[#e5e5e5] pl-[40px] max-[1040px]:border-l-0 max-[1040px]:pl-0">
                <div className="flex items-center justify-between py-[18px]">
                  <span className="text-[15px] text-[#0a0a0a]">공고 등록·게시</span>
                  <span className="text-[15px] font-bold text-[#0F6E56]">무료</span>
                </div>
                <div className="border-t border-[#e5e5e5]" />
                <div className="flex items-center justify-between py-[18px]">
                  <span className="text-[15px] text-[#0a0a0a]">추천 노출·인재 알림</span>
                  <span className="text-[14px] text-[#a3a3a3]">부스트 선택 시</span>
                </div>
                <div className="border-t border-[#e5e5e5]" />
                <div className="flex items-center justify-between py-[18px]">
                  <span className="text-[15px] text-[#0a0a0a]">노출 기간</span>
                  <span className="text-[14px] text-[#a3a3a3]">필요한 만큼 선택</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PRICING ══════════════════════════════════════════ */}
        <section id="pricing" className="scroll-mt-[88px] bg-white px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">PRICING</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              분류별 상품 안내
            </h2>
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] leading-[1.6] text-[#737373]">
              산업·연구기관 / 병원 / 약국에 따라 금액이 다릅니다.
            </p>

            {/* 분류 탭 — 중앙 정렬 */}
            <div className="mt-9 flex justify-center">
              {/* flex-wrap — 좁은 폭에서 세 탭이 한 줄에 못 들어가면 잘리는 대신 접힌다.
                  데스크톱은 한 줄로 들어가므로 wrap이 걸리지 않는다. */}
              <div className="flex flex-wrap justify-center gap-2">
                {CATS.map((cat) => {
                  const label = CAT_LABEL[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCat(cat)}
                      className={clsx(
                        "border px-[26px] py-[11px] text-[14px] font-semibold transition-all max-[760px]:px-4",
                        activeCat === cat
                          ? "border-transparent bg-[linear-gradient(160deg,#0D7369,#17A68C)] text-white"
                          : "border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3]",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ≤1040px 축약 미리보기 — 오른쪽 목업이 빠지는 폭에서 그 자리를 대신한다.
                데스크톱 목업의 max-[1040px]:hidden과 정확히 상보적으로 켜지고, 같은 activeTier를 읽는다.
                sticky top은 헤더(h-[64px] sticky top-0 z-50) 바로 아래. z는 헤더보다 낮게 두되
                가격 카드의 기간 드롭다운(z-20)보다도 낮아야 드롭다운이 이 위에 뜬다. */}
            <div className="sticky top-[64px] z-10 mt-7 hidden border border-[#e5e5e5] bg-white max-[1040px]:block">
              <div className="flex flex-col gap-[2px] p-[8px]">
                <MiniPreviewZone label="PREMIUM"  active={activeTier === "premium"}  slots={3} />
                <MiniPreviewZone label="FEATURED" active={activeTier === "featured"} slots={4} />
                <MiniPreviewZone label="STANDARD" active={activeTier === "standard"} slots={5} />
                {/* BASIC 대응 — 데스크톱 목업과 같이 유료 구좌 밖의 전체 목록이라 한 단계 죽인다 */}
                <MiniPreviewZone label="전체 공고" active={activeTier === "basic"}    slots={3} muted />
              </div>
              <p className="border-t border-[#e5e5e5] py-[7px] text-center text-[11px] text-[#a3a3a3]">
                상품을 선택하면 노출 위치가 미리보기에 표시돼요.
              </p>
            </div>

            {/* 미리보기 + 카드 */}
            <div className="mt-[44px] grid grid-cols-[0.95fr_1.05fr] items-start gap-8 max-[1040px]:grid-cols-1">
              {/* 브라우저 목업 */}
              <div className="sticky top-[88px] border border-[#e5e5e5] bg-white max-[1040px]:hidden">
                <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4 py-[7px]">
                  {[0,1,2].map((i) => <span key={i} className="h-[11px] w-[11px] rounded-full bg-[#d4d4d4]" />)}
                </div>
                <div className="px-[12px] pb-[12px] pt-[14px]">
                  {/* 이주의 추천 공고 팝업 — 화면을 덮는 상품이라 띠가 아니라 창 모양으로 그린다.
                      PREMIUM 전용 상품(비교표에서 PREMIUM만 7일)이라 PREMIUM일 때만 존과 함께 켠다. */}
                  <div
                    className={clsx(
                      // 테두리는 평시에도 2px로 잡고 색만 바꾼다 — 굵기를 바꾸면 강조될 때 창 내부가 1px 밀린다(존과 같은 방식).
                      "mx-auto mb-[12px] w-[54%] border-2 bg-white transition-colors duration-150",
                      activeTier === "premium" ? "border-[#2c6f63]" : "border-[#e5e5e5]",
                    )}
                  >
                    <div className="flex items-center justify-between border-b border-[#e5e5e5] px-[8px] py-[5px]">
                      <span className="text-[11px] text-[#a3a3a3]">이주의 추천 공고</span>
                      <span aria-hidden="true" className="text-[11px] leading-none text-[#c2c2c2]">×</span>
                    </div>
                    <div className="flex items-center gap-[8px] p-[8px]">
                      <span className="h-[26px] w-[42px] shrink-0 bg-[linear-gradient(160deg,#0D7369,#17A68C)]" />
                      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
                        <PreviewBar w="86%" />
                        <PreviewBar w="54%" tone="weak" />
                      </div>
                    </div>
                  </div>

                  <PreviewZone label="PREMIUM" active={activeTier === "premium"}>
                    <div className="grid grid-cols-3 gap-[7px]">
                      {[0, 1, 2].map((i) => <PreviewPremiumCard key={i} />)}
                    </div>
                  </PreviewZone>

                  <PreviewZone label="FEATURED" active={activeTier === "featured"}>
                    <div className="grid grid-cols-4 gap-[6px]">
                      {[0, 1, 2, 3].map((i) => <PreviewFeaturedCard key={i} />)}
                    </div>
                  </PreviewZone>

                  <PreviewZone label="STANDARD" active={activeTier === "standard"}>
                    <div className="grid grid-cols-5 gap-[6px]">
                      {[0, 1, 2, 3, 4].map((i) => <PreviewStandardCard key={i} />)}
                    </div>
                  </PreviewZone>

                  {/* BASIC 대응 — 유료 구좌 밖의 전체 목록이라 라벨·행 모두 한 단계 죽인다 */}
                  <PreviewZone label="전체 공고" active={activeTier === "basic"} muted>
                    <div className="flex flex-col gap-[5px]">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-[11px] border border-[#efefef] bg-[#fafafa]" />
                      ))}
                    </div>
                  </PreviewZone>
                </div>
                <p className="border-t border-[#e5e5e5] py-3 text-center text-[12px] text-[#a3a3a3]">
                  상품을 선택하면 노출 위치가 미리보기에 표시돼요.
                </p>
              </div>

              {/* 가격 카드 */}
              <div className="flex flex-col gap-4">
                {/* PREMIUM — 2px 검정 테두리로 다른 세 장과 급을 가른다.
                    초록은 CTA와 미리보기 존 하이라이트(선택 연동 신호) 몫이라 카드 프레임에 쓰지 않는다. */}
                <div
                  {...tierHighlight("premium")}
                  className="cursor-default border-2 border-[#0a0a0a] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(0,0,0,0.2)]"
                >
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">PREMIUM</b>
                        <span className={AREA_BADGE}>최상단 추천 영역</span>
                      </div>
                      <div className="mb-3"><span className={ACCENT_BADGE}>빠른 채용</span></div>
                      <div>
                        <p className="text-[15px] font-medium text-[#0a0a0a]">{premCopy.subtitle}</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">{premCopy.desc}</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={premPeriod} onChange={setPremPeriod} points={BOOST_PRICING.premium[activeCat]} />
                      {prem.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {prem.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{prem.price}</p>
                      <LinkButton href={applyHref} variant="gradient" size="md" className="mt-[14px] w-full justify-center">신청하기</LinkButton>
                    </div>
                  </div>
                </div>

                {/* FEATURED */}
                <div
                  {...tierHighlight("featured")}
                  className="cursor-default border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]"
                >
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">FEATURED</b>
                        <span className={AREA_BADGE}>상단 추천 영역</span>
                      </div>
                      <div className="mb-3"><span className={ACCENT_BADGE}>BEST</span></div>
                      <div>
                        <p className="text-[15px] font-medium text-[#0a0a0a]">{featCopy.subtitle}</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">{featCopy.desc}</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={featPeriod} onChange={setFeatPeriod} points={BOOST_PRICING.featured[activeCat]} />
                      {feat.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {feat.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{feat.price}</p>
                      <a href={applyHref} className="mt-[14px] block w-full bg-[#0a0a0a] py-3 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">신청하기</a>
                    </div>
                  </div>
                </div>

                {/* STANDARD */}
                <div
                  {...tierHighlight("standard")}
                  className="cursor-default border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]"
                >
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">STANDARD</b>
                        <span className={AREA_BADGE}>추천 공고 영역</span>
                      </div>
                      <div className="mt-[6px]">
                        <p className="text-[15px] font-medium text-[#0a0a0a]">웹사이트 추천 노출</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">추천 공고 영역에 선택한 기간 동안 안정적으로 노출됩니다.</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={stdPeriod} onChange={setStdPeriod} points={BOOST_PRICING.standard[activeCat]} />
                      {std.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {std.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{std.price}</p>
                      <a href={applyHref} className="mt-[14px] block w-full bg-[#0a0a0a] py-3 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">신청하기</a>
                    </div>
                  </div>
                </div>

                {/* BASIC — 무료, 드롭다운 없음 */}
                <div
                  {...tierHighlight("basic")}
                  className="cursor-default border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]"
                >
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">BASIC</b>
                        <span className={AREA_BADGE}>전체 공고 목록</span>
                      </div>
                      <div className="mt-[6px]">
                        <p className="text-[15px] font-medium text-[#0a0a0a]">공고 등록·게시 무료</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">마감일까지 노출되며, 별도 마감일이 없으면 최대 30일까지 게시됩니다.</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <p className="text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
                        무료<small className="mt-[2px] block text-[12px] font-normal text-[#737373]">공고 등록 무료</small>
                      </p>
                      <a href={freeHref} className="mt-[14px] block w-full border border-[#e5e5e5] py-3 text-center text-[14px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">무료로 등록</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-[34px] text-center text-[12.5px] text-[#a3a3a3]">
              채용공고 등록은 무료이며, 유료 상품은 추천 영역·SNS·카카오톡·미디어 추가 노출 상품입니다. 모든 금액은 부가세 별도입니다.
            </p>
          </div>
        </section>

        {/* ══ 상품별 제공 항목 비교표 ══════════════════════════ */}
        <section className="border-t border-[#e5e5e5] bg-white px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">PRICING</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              상품별 제공 항목 비교
            </h2>
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] leading-[1.6] text-[#737373]">
              추천 · 상단 · 최상단 노출까지, 상품별로 한눈에 비교하세요.
            </p>
            {/* 분류 탭에서 한참 아래로 떨어진 표라, 지금 어느 분류를 보고 있는지 여기서 다시 알려 준다 */}
            <p className="mt-[10px] text-center text-[13px] font-semibold text-[#0D7369]">
              {CAT_LABEL[activeCat]} 기준
            </p>
            {/* 5열 × 10행 표라 모바일에서는 등급 열이 전부 화면 밖으로 나간다.
                ≤760px에서는 아래 등급 탭 + 1열 리스트로 교체한다(FEATURE_ROWS·featureCell 공유). */}
            <div className="mt-[18px] overflow-x-auto max-[760px]:hidden">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-[30%] py-[22px] pl-6 text-left text-[14px] font-semibold text-[#0a0a0a]">제공 항목</th>
                    {FEATURE_TIERS.map((h) => (
                      <th
                        key={h.tier}
                        className={clsx("w-[17.5%] py-[22px] text-center", h.prem && "bg-[linear-gradient(160deg,#0D7369,#17A68C)] text-white")}
                      >
                        <span className="block text-[15px] font-bold">{h.tier}</span>
                        <span className={clsx("mt-1 block text-[12px]", h.prem ? "text-white/80" : "text-[#a3a3a3]")}>{h.sub}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, ri) => (
                    <tr key={ri} className={row.gap ? "border-t-[8px] border-[#f5f5f5]" : ""}>
                      <td className="border-t border-[#e5e5e5] py-[18px] pl-6 text-[15px] font-semibold text-[#0a0a0a]">
                        {row.label}
                        {row.sub && <small className="mt-[3px] block text-[12px] font-normal text-[#a3a3a3]">{row.sub}</small>}
                      </td>
                      {FEATURE_TIERS.map((_, ci) => (
                        <td key={ci} className={clsx("border-t border-[#e5e5e5] py-[18px] text-center text-[15px] font-semibold", ci === 3 && "bg-[rgba(23,166,140,0.05)]")}>
                          <FeatureMark value={featureCell(row, ci, activeCat)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ≤760px 대체 — 등급 하나를 골라 그 열만 세로로 읽는다.
                탭 상태는 미리보기 하이라이트(pinnedTier)와 별개다. 여기서 고르는 것은 "표의 어느 열을 볼지"라
                두 상태를 묶으면 가격 카드를 탭할 때 이 표가 같이 움직여 버린다. */}
            <div className="mt-6 hidden max-[760px]:block">
              {/* 2열 2행 — 4개를 한 줄에 넣으면 320px에서 STANDARD/FEATURED가 잘린다. 순서는 표와 동일 */}
              <div className="grid grid-cols-2 gap-2">
                {FEATURE_TIERS.map((h, i) => (
                  <button
                    key={h.tier}
                    type="button"
                    onClick={() => setFeatureTier(i)}
                    className={clsx(
                      "min-h-[44px] border px-3 py-[10px] text-[13px] font-semibold transition-colors",
                      featureTier === i
                        ? "border-transparent bg-[#0a0a0a] text-white"
                        : "border-[#e5e5e5] bg-white text-[#737373]",
                    )}
                  >
                    {h.tier}
                    <span className={clsx("ml-[6px] text-[12px] font-normal", featureTier === i ? "text-white/70" : "text-[#a3a3a3]")}>{h.sub}</span>
                  </button>
                ))}
              </div>
              <ul className="mt-5 divide-y divide-[#e5e5e5] border-y border-[#e5e5e5]">
                {FEATURE_ROWS.map((row, ri) => (
                  <li key={ri} className="flex items-start justify-between gap-4 py-[14px]">
                    <div className="min-w-0">
                      <p className="text-[14px] text-[#0a0a0a]">{row.label}</p>
                      {row.sub && <small className="mt-[3px] block text-[12px] text-[#a3a3a3]">{row.sub}</small>}
                    </div>
                    <span className="shrink-0 text-[14px] font-semibold text-[#0a0a0a]">
                      <FeatureMark value={featureCell(row, featureTier, activeCat)} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-6 text-center text-[12.5px] text-[#a3a3a3]">
              * 노출 기간·횟수는 상품 기준이며, 직무·시기에 따라 달라질 수 있습니다. 모든 금액은 부가세 별도입니다.
              <br />
              * 웹사이트 노출은 구매한 이용 기간 동안 적용됩니다.
              <br />
              * 약국 상품은 웹사이트 노출 중심으로 구성되며 SNS·카카오톡·미디어 노출이 포함되지 않습니다.
            </p>
          </div>
        </section>

        {/* ══ CLOSING CTA ══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1d1c] px-6 text-center text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[.32]"
            style={{
              backgroundImage: "url(/images/business-hero.jpg)",
              WebkitMaskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
              maskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "var(--gradient-cta)" }}
          />
          <div className="app-shell--default relative z-10 py-[96px] max-[760px]:py-16">
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              지금, 더파마 채용솔루션을 시작하세요.
            </h2>
            <p className="mx-auto mt-[14px] max-w-[52ch] text-[16px] text-[#c4c8c6]">
              담당자가 채용 목표에 맞는 진행 방법과 상품을 안내해 드립니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="/support/contact"
                className="inline-flex items-center bg-[linear-gradient(160deg,#0D7369,#17A68C)] px-[30px] py-[15px] text-[15px] font-semibold text-white transition-[filter] hover:brightness-[1.08]"
              >
                도입 문의하기
              </a>
              <Link
                href="/business/headhunting"
                className="inline-flex items-center border border-white/40 px-[30px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                헤드헌팅 의뢰
              </Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
