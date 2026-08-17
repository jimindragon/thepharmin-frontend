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
import { Check, ChevronDown, ChevronRight, X } from "lucide-react";
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
 * VS 대조표 행. 데스크톱 표(>760px)와 모바일 표(≤760px)가 같은 배열을 렌더한다 —
 * 두 렌더가 갈라지는 것은 마크업뿐이고 문구는 여기 한 곳에만 둔다.
 *
 * 라벨·문구는 모바일 3열 표에 맞춰 짧게 고쳤다. 열 하나가 130px 남짓이라 종전의
 * 긴 문장("LinkedIn·Instagram 등 미디어 연계 노출 (타 플랫폼 대비 약 10배)")은
 * 셀 안에서 네댓 줄로 접혀 좌우 비교라는 표의 목적 자체가 사라진다.
 * 데스크톱 표도 같은 배열을 읽으므로 함께 짧아진다(의도된 것).
 *
 * 6행이던 것을 5행으로 줄였다 — 마지막 "후보 검증·추천"은 바로 위 "채용 방식"의
 * 헤드헌팅과 같은 것을 말이만 바꿔 되풀이한다.
 */
const VS_ROWS = [
  { label: "운영 주체",     tp: "약사·업계 출신 전문 컨설턴트", gen: "분야 비전문 일반 운영" },
  { label: "홍보 채널",     tp: "SNS·미디어 연계 노출 약 10배", gen: "자사 게시판 한정" },
  { label: "평균 조회수",   tp: "SNS 단독 공고당 3~4만 회",     gen: "수백~수천 회" },
  { label: "타깃 인재",     tp: "업계 전문 인재 6,000명",       gen: "분야 무관 불특정 다수" },
  { label: "채용 방식",     tp: "공고 + 헤드헌팅 + 기업정보 통합", gen: "공고 등록 위주" },
] as const;

/** 표 헤더의 두 열 이름. 모바일 표에서도 그대로 열 머리글로 쓴다(로고 이미지를 쓸 자리가 없다). */
const VS_TP_LABEL = "더파마 리크루트";
const VS_GEN_LABEL = "다른 채용 플랫폼";

// ── 하단 무료 안내 배너 ─────────────────────────────────────
/**
 * 닫음 기록. 세션 한정이라 sessionStorage에 둔다 — 다음 방문에는 다시 보여도 되는 안내이고,
 * 영구 저장할 만큼 무거운 선택이 아니다. 키는 콜론형(thepharmin:resume-convert-draft 등)을 따른다.
 */
const FREE_BANNER_KEY = "thepharmin:business-free-banner";
const FREE_BANNER_DISMISSED = "done";

// ── 헤드헌팅 ────────────────────────────────────────────────
/**
 * 헤드헌팅 섹션이 쓰는 두 목록. JSX 안에 있던 배열을 그대로 끌어올린 것으로 내용은 바뀌지 않았다.
 * 데스크톱 렌더와 ≤760px 렌더가 같은 배열을 읽어야 해서(VS_ROWS와 같은 이유) 모듈 스코프에 둔다.
 */
const HH_POINTS = [
  "포지션·직무 요건 정밀 분석",
  "산업 네트워크 기반 핵심 인재 서칭",
  "이직 의향·이력 검증된 후보 추천",
  "전담 컨설턴트의 채용 동행",
] as const;

const HH_CANDIDATES = [
  { init: "K", role: "임상개발 PM",            meta: "경력 8년 · 서울",  tags: ["임상 2/3상","종양학"],     dark: false },
  { init: "L", role: "공정개발 (Downstream)", meta: "경력 6년 · 인천",  tags: ["CDMO","정제공정"],         dark: true  },
  { init: "P", role: "사업개발 BD",             meta: "경력 10년 · 서울", tags: ["라이선싱","글로벌"],       dark: false },
] as const;

/** 아바타 배경 — 데스크톱 카드와 ≤760px 리스트가 같은 두 색을 쓴다. */
function hhAvatarBg(dark: boolean) {
  return dark ? "bg-[#2c6f63]" : "bg-[#232726]";
}

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

/**
 * 제공/미제공 마크 — 데스크톱 표 셀과 모바일 리스트가 같은 기호를 쓴다.
 * 체크 색·크기만 호출부가 덮을 수 있다: 모바일 리스트는 다른 모바일 블록과 같은 딥 톤(#0D7369)을
 * 쓰고, 데스크톱 표는 종전의 밝은 틸(#17A68C)을 기본값으로 그대로 받는다.
 */
function FeatureMark({
  value,
  checkSize = 18,
  checkClassName = "text-[#17A68C]",
}: {
  value: boolean | string;
  checkSize?: number;
  checkClassName?: string;
}) {
  if (value === true) return <span className="inline-flex justify-center"><Check size={checkSize} strokeWidth={2} className={checkClassName} /></span>;
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

// ── 분류 선택 칩 ────────────────────────────────────────────
/**
 * 산업·연구기관 / 병원 / 약국 칩. PRICING 상단의 분류 탭과 제공 항목 비교의 기준 전환기가
 * 같은 부품을 쓴다 — 둘 다 activeCat 하나를 읽고 쓰는데 생김새가 갈리면 같은 컨트롤을
 * 두 번 다르게 배우게 된다. 전환기 쪽에 있던 검정 세그먼트가 이쪽 값으로 흡수된 것이다.
 *
 * 바깥 정렬·위 여백은 호출부가 정한다(탭은 mt-9, 전환기는 mt-[14px]).
 *
 * 칩 높이는 14px×1.65 + py-[11px]×2 = 45.1px이라 ≤760px 터치 타깃 44px을 상자 자체로 채운다.
 * 전환기가 쓰던 투명 ::after 확장은 그래서 함께 걷었다 — 같은 목적을 두 벌로 들 이유가 없다.
 */
function TrackChips({ value, onChange }: { value: Cat; onChange: (cat: Cat) => void }) {
  return (
    // flex-wrap — 좁은 폭에서 세 칩이 한 줄에 못 들어가면 잘리는 대신 접힌다.
    // 데스크톱은 한 줄로 들어가므로 wrap이 걸리지 않는다.
    <div className="flex flex-wrap justify-center gap-2">
      {CATS.map((cat) => {
        const label = CAT_LABEL[cat];
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={value === cat}
            className={clsx(
              "border px-[26px] py-[11px] text-[14px] font-semibold transition-all max-[760px]:px-4",
              value === cat
                ? "border-transparent bg-[linear-gradient(160deg,#0D7369,#17A68C)] text-white"
                : "border-[#e5e5e5] bg-white text-[#737373] hover:border-[#a3a3a3]",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
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

  /**
   * ≤760px 상품 아코디언에서 펼쳐 둔 등급. 한 번에 하나만 열린다.
   * 미리보기 하이라이트(pinnedTier)와 묶지 않는다 — 저쪽은 "어느 구좌를 짚어 보는가"이고
   * 이쪽은 "어느 상품을 읽는가"라, 묶으면 카드를 펼칠 때마다 미리보기가 따라 움직인다.
   * (featureTier를 pinnedTier와 분리해 둔 것과 같은 이유다.)
   */
  const [openTier, setOpenTier] = useState<PreviewTier | null>("premium");

  /**
   * 하단 무료 안내 배너를 닫았는지. 기본값을 "닫음"에 두고 마운트 후 교정한다 —
   * sessionStorage는 서버에서 읽을 수 없어, 안 닫은 것으로 시작하면 이미 닫은 사람에게도
   * 배너가 한 프레임 떴다 사라진다(useInterestPromptSeen이 hasSeen을 다루는 방식과 같다).
   */
  const [bannerDismissed, setBannerDismissed] = useState(true);

  useEffect(() => {
    setBannerDismissed(window.sessionStorage.getItem(FREE_BANNER_KEY) === FREE_BANNER_DISMISSED);
  }, []);

  const dismissBanner = () => {
    window.sessionStorage.setItem(FREE_BANNER_KEY, FREE_BANNER_DISMISSED);
    setBannerDismissed(true);
  };

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

  /**
   * ≤760px 상품 아코디언이 읽는 표. 데스크톱 카드 네 장이 각자 인라인으로 들고 있던 값을 한 줄씩
   * 모은 것으로, 문구·가격·링크는 전부 같은 출처(premCopy·PRICES·applyHref)를 가리킨다 —
   * 아코디언용으로 따로 적어 두면 데스크톱 카드와 곧 갈라진다.
   *
   * collapsed(접힌 행)에 적는 값은 2주 기준가다. 카드를 펼치기 전에는 기간을 고를 수 없는데
   * 기간마다 값이 다르므로, 기본 기간(2주 = PeriodSelect의 초기 index 1)의 할인가에 "~"를 붙여
   * 하한선임을 표시한다. 하드코딩하지 않고 PRICES에서 뽑는다.
   */
  const mobileTierCards = [
    {
      id: "premium" as PreviewTier,
      name: "PREMIUM",
      area: "최상단 추천 영역",
      accent: "빠른 채용",
      copy: premCopy,
      period: { value: premPeriod, onChange: setPremPeriod, points: BOOST_PRICING.premium[activeCat] },
      pp: prem,
      collapsed: `${PRICES.premium[activeCat][1].price}~`,
      cta: { label: "신청하기", href: applyHref, kind: "gradient" as const },
    },
    {
      id: "featured" as PreviewTier,
      name: "FEATURED",
      area: "상단 추천 영역",
      accent: "BEST",
      copy: featCopy,
      period: { value: featPeriod, onChange: setFeatPeriod, points: BOOST_PRICING.featured[activeCat] },
      pp: feat,
      collapsed: `${PRICES.featured[activeCat][1].price}~`,
      cta: { label: "신청하기", href: applyHref, kind: "black" as const },
    },
    {
      id: "standard" as PreviewTier,
      name: "STANDARD",
      area: "추천 공고 영역",
      accent: null,
      copy: { subtitle: "웹사이트 추천 노출", desc: "추천 공고 영역에 선택한 기간 동안 안정적으로 노출됩니다." },
      period: { value: stdPeriod, onChange: setStdPeriod, points: BOOST_PRICING.standard[activeCat] },
      pp: std,
      collapsed: `${PRICES.standard[activeCat][1].price}~`,
      cta: { label: "신청하기", href: applyHref, kind: "black" as const },
    },
    {
      id: "basic" as PreviewTier,
      name: "BASIC",
      area: "전체 공고 목록",
      accent: null,
      // subtitle은 네 등급이 같은 표를 쓰기 위해 자리를 지킬 뿐 아코디언은 렌더하지 않는다 —
      // 무료 상품은 접힌 행의 "무료"와 겹쳐서 뺐다(펼침 렌더 참조). 데스크톱 BASIC 카드는 자기 문구를 따로 갖는다.
      copy: { subtitle: "공고 등록·게시 무료", desc: "마감일까지 노출되며, 별도 마감일이 없으면 최대 30일까지 게시됩니다." },
      period: null,
      pp: null,
      collapsed: "무료",
      cta: { label: "무료로 등록", href: freeHref, kind: "outline" as const },
    },
  ];

  return (
    <>
      <BusinessHeader />
      <main className="bg-white">

        {/* ≤760px 좌우 여백은 셸 gutter 하나가 담당한다 — 섹션마다 붙은 px-6(24px)이 셸
            gutter(--shell-gutter 48px = 좌우 24px씩)와 겹쳐 실제로는 한쪽 48px씩 물고 있었고,
            390px에서 본문이 294px까지 눌렸다. 각 섹션의 px를 그 폭에서만 접어 24px로 되돌린다.
            (기업센터 셸이 max-[760px]:px-0으로 같은 겹침을 이미 푼 선례가 있다.)

            이 페이지의 실측 주석들이 원래 이 폭을 전제로 쓰였다는 근거도 있다 —
            히어로 지표 스트립의 "320px에서 셀이 약 91px", VS 표의 "열 하나가 130px 남짓"은
            좌우 24px씩일 때의 값이고, 48px씩에서는 각각 74.7px·103px이었다.

            상하는 ≤760px 60px(다크 두 섹션은 64px)을 72px로 모은다. */}
        {/* ══ HERO ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1a1a] px-6 text-white max-[760px]:px-0">
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
<div className="app-shell--default relative z-10 py-[100px] max-[760px]:py-[72px]">
            {/* ≤760px에서 자간·색을 한 단계씩 죽인다 — 좁은 폭에서는 넓은 자간이 한 줄을 더 잡아먹고,
                밝은 민트가 바로 아래 h1의 그라데이션과 같은 채도로 경쟁한다. 둘 다 페이지 안의 기존 값. */}
            <p className="text-[12px] font-semibold tracking-[.14em] text-[#7fcdb9] max-[760px]:tracking-[.12em] max-[760px]:text-[#5cb89f]">결국, 사람이 경쟁력입니다</p>
            {/* fontSize를 인라인 style에서 클래스로 옮겼다 — 인라인은 max-[760px] 분기로 덮을 수 없다.
                clamp 값은 그대로라 >760px 렌더 결과는 동일하다. 자간(-.045em)·행간은 건드리지 않는다.

                ≤760px는 카피가 다르다(팀 결정 대기 중인 의도된 이원화). h1을 둘로 늘리지 않고
                한 h1 안에서 두 벌을 갈라 끼운다 — 문서에 h1이 두 개 있는 것으로 읽히지 않게.

                크기가 두 단인 이유: 모바일 두 줄은 nowrap이라 폭이 곧 하한이다. 둘째 줄
                "더파마 리크루트 하나로."는 글자당 폭이 대략 자간 포함 10.2배라 28px에서 약 285px,
                26px에서 약 265px다. 본문 폭이 뷰포트-48px이므로 28px은 334px보다 좁은 화면에서
                넘친다 — 폰트 실측 오차(±3%)를 얹어 경계를 344px로 잡고 그 아래만 26px로 내린다.
                (320px에서 26px 둘째 줄이 265px, 본문 272px으로 들어간다.) */}
            <h1
              className="mt-5 text-[clamp(36px,5.2vw,58px)] font-semibold text-white max-[760px]:text-[28px] max-[760px]:font-medium max-[344px]:text-[26px]"
              style={{ letterSpacing: "-.045em", lineHeight: 1.15 }}
            >
              <span className="max-[760px]:hidden">
                제약·바이오·약국·병원 전문 채용,{" "}
                <br />
                <span className="text-gradient-cta font-bold">더파마 리크루트</span> 하나로.
              </span>
              {/* 줄마다 nowrap — 두 줄은 <br>로 고정하고, 그 안에서 다시 접히는 일이 없게 한다.
                  자연 줄바꿈에 맡기면 폭에 따라 "채용," 한 어절만 둘째 줄로 떨어진다. */}
              <span className="hidden max-[760px]:block">
                <span className="whitespace-nowrap">제약·바이오 전문 채용,</span>
                <br />
                <span className="whitespace-nowrap">
                  <span className="text-gradient-cta font-bold">더파마 리크루트</span> 하나로.
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-[#c4c8c6] max-[760px]:text-[15px]">
              <span className="max-[760px]:hidden">
                통합 구독자 6,000명의 약사·연구원·업계 실무자 네트워크.{" "}
                <br />다른 채용 플랫폼이 닿지 못하는 제약·바이오 전문 인재를 직접 연결합니다.
              </span>
              {/* break-keep이 어절 중간을 막고, 두 묶음은 그 위에 한 덩어리를 더 지정한 것이다 —
                  keep-all은 가운뎃점·쉼표 뒤의 끊을 자리까지 막지는 않아 "약국· / 병원까지",
                  "6, / 000명"이 남는다. */}
              <span className="hidden break-keep max-[760px]:block">
                <span className="whitespace-nowrap">약국·병원까지,</span> 약사·연구원·업계 실무자{" "}
                <span className="whitespace-nowrap">6,000명</span> 네트워크에 직접 연결합니다.
              </span>
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
                  밑줄로만 링크임을 표시한다. 글자색은 아웃라인 버튼의 것을 그대로 쓴다.
                  ≤760px에서 w-full + justify-center: 위 주 CTA가 풀폭이라 그 아래 텍스트 링크만
                  왼쪽에 붙어 있으면 두 CTA가 다른 축에 선다. 밑줄은 글자에만 걸리므로 그대로다. */}
              <a
                href={freeHref}
                className="inline-flex h-12 items-center border border-white/30 px-7 text-[15px] font-medium text-white transition-colors hover:bg-white/10 max-[760px]:h-11 max-[760px]:w-full max-[760px]:justify-center max-[760px]:border-0 max-[760px]:px-0 max-[760px]:underline max-[760px]:underline-offset-4 max-[760px]:hover:bg-transparent"
              >
                무료로 공고 등록
              </a>
            </div>

            {/* ≤760px 지표 스트립 — 아래 회색 지표 밴드를 히어로 다크 영역 안으로 흡수한 것.
                밴드가 히어로 바로 뒤에 별도 블록으로 서면 좁은 폭에서 회색 면이 한 겹 끼어 히어로와
                본문이 두 번 끊긴다. 수치는 히어로 카피를 뒷받침하는 근거라 CTA와 같은 면에 둔다.
                데스크톱(>760px)은 종전대로 아래 밴드가 맡으므로 이 스트립은 ≤760px에서만 켠다 —
                둘이 동시에 보이면 같은 수치가 두 번 나온다. */}
            <div className="mt-8 hidden grid-cols-3 border-t border-[rgba(255,255,255,0.18)] pt-5 max-[760px]:grid">
              {/* 캡션을 앞머리와 꼬리로 나눠 둔다 — 렌더되는 문자열은 "앞머리 + 공백 + 꼬리"로 종전과 같고,
                  꼬리만 nowrap으로 묶어 "1건당 / 조회", "(일반 / 대비)"처럼 한 덩어리로 읽히는 말이
                  줄 끝에서 갈라지지 않게 한다. */}
              {([
                { value: "3~4만 회", subHead: "SNS 단독 공고",   subTail: "1건당 조회" },
                { value: "4,000명",  subHead: "카카오톡 단독",    subTail: "공고 대상" },
                { value: "약 10배",  subHead: "미디어 연계 노출", subTail: "(일반 대비)" },
              ] as const).map((s, i) => (
                <div key={s.value} className="relative px-2 text-center">
                  {/* 열 사이 세로선. 위 구분선과 같은 값을 쓴다 — 어두운 배경 위에서 두 선의 밝기가
                      갈리면 스트립이 격자가 아니라 서로 다른 두 요소로 읽힌다. */}
                  {i > 0 && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-[rgba(255,255,255,0.18)]" />}
                  <b className="block text-[16px] font-semibold text-white">{s.value}</b>
                  {/* 설명은 2줄까지 접히도록 줄 전체에 nowrap을 걸지 않는다 — 320px에서 셀이 약 91px이라
                      "SNS 공고 1건당 평균 조회"는 반드시 접힌다. 회색은 히어로 본문과 같은 값.
                      break-keep은 어절 중간(카카오 / 톡)에서 끊기는 것만 막고, 꼬리 묶음은 그 위에
                      한 덩어리를 더 지정한 것이다. 묶음 자체는 320px 셀(약 75px)에도 들어가 넘치지 않는다. */}
                  <span className="mt-1 block break-keep text-[11px] leading-[1.4] text-[#c4c8c6]">
                    {s.subHead} <span className="whitespace-nowrap">{s.subTail}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 지표 밴드 (>760px 전용) ═══════════════════════════ */}
        {/* 이 밴드만 px-6이 없어 다른 섹션보다 좌우 24px씩 넓게 나갔다.
            app-shell--default는 ≤1180px에서 100vw가 아닌 100% 기준이라, 부모 패딩이 폭에 그대로 반영된다.
            그래서 무조건 px-6을 주면 1041~1180px 구간의 폭까지 함께 바뀐다 — 데스크톱 무변화를 위해
            표준 브레이크포인트 1040 이하로만 건다(그 위는 원래 정렬을 그대로 유지). */}
        {/* ≤760px에서는 통째로 내린다 — 같은 수치를 히어로 스트립이 맡는다.
            아래 셀의 max-[640px]:* / max-[760px]:* 클래스는 그래서 이제 닿지 않는 구간이다.
            지우지 않고 둔 것은 주석에 남은 실측값(2열 147px·320px 셀 102px) 때문이며,
            스트립을 되돌리면 그대로 살아난다. 모바일 렌더를 여기서 고치려 하지 말 것. */}
        <div className="border-b border-[#e5e5e5] bg-[#f5f5f5] max-[1040px]:px-6 max-[760px]:hidden">
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
        {/* 구분선 규칙: 인접 섹션의 배경이 같을 때만 아래 섹션 상단에 선을 둔다.
            ≤760px에서는 위 지표 밴드가 숨어 이 섹션이 다크 히어로와 맞닿으므로 선을 끈다 —
            면이 이미 바뀌는 자리에 선을 겹치면 경계가 두 번 그어진다.
            >760px은 밴드(#f5f5f5)가 그대로 위에 있어 종전 선을 유지한다. */}
        <section className="border-t border-[#e5e5e5] bg-[#fafafa] px-6 py-[88px] max-[760px]:border-t-0 max-[760px]:px-0 max-[760px]:py-[72px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">WHY THE PHARMA</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.28 }}
            >
              다른 채용 플랫폼과<br />무엇이 다를까요?
            </h2>
            {/* ≤760px 16→14px — 섹션 리드는 타이틀과 본문 사이를 잇는 줄이라 좁은 폭에서
                본문(14px 안팎)과 같은 크기까지 내려도 위계가 유지된다. leading은 1.6 그대로.
                ≤760px에서는 아예 내린다 — 바로 아래 체크 배지 두 줄이 같은 말을 근거로 다시 하고,
                좁은 폭에서는 타이틀과 배지 사이에 낀 두 줄이 표까지 가는 길만 늘린다. */}
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] leading-[1.6] text-[#737373] max-[760px]:hidden max-[760px]:text-[14px]">
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

            {/* ≤760px 대체 — 카드 6장을 3열 표 하나로 되돌린다.
                카드는 한 행마다 라벨·더파마·타사를 세로로 쌓아서, 두 값을 나란히 놓고 견주는 동작이
                스크롤로 바뀌어 있었다. 좁아도 두 열을 맞대어 두는 편이 대조표의 목적에 맞다.

                데스크톱 표(위)와 다른 점은 폭에서 오는 것뿐이다 — 로고 대신 글자 머리글, 초록 열 배경
                대신 #fafafa(목록 사이 안내 행과 같은 값), 채워진 초록 사각 대신 딥 톤 체크.
                초록 면을 130px 열에 깔면 같은 화면의 CTA·미리보기 하이라이트와 채도로 경쟁한다.

                table-fixed — 열 폭을 글자 수가 아니라 이쪽에서 정한다. auto로 두면 행마다 열 경계가
                움직여 좌우 비교가 성립하지 않는다. 라벨 84px을 뺀 나머지는 55:45로 나눈다 —
                더파마 열의 문구가 항상 더 길어서 반씩 주면 그쪽만 줄 수가 늘어난다. */}
            <div className="mt-8 hidden max-[760px]:block">
              {/* 격자를 걷고 데스크톱 표와 같은 문법으로 맞춘다 — 외곽선·세로선을 지우고 행 사이
                  가로선 하나만 남긴 뒤, 더파마 열은 선이 아니라 면(그라데이션 머리 + #eef6f2 본문)으로
                  세운다. 색 값은 전부 위 데스크톱 표가 쓰는 리터럴 그대로다.
                  선이 빠진 만큼 세로 여백이 리듬을 맡는다(py 12→16px). 좌우는 10px 그대로. */}
              {/* break-keep — 어절 안에서 끊지 않는다. 기본 word-break는 CJK를 아무 데서나 잘라
                  "3~4만 / 회", "약 10 / 배"처럼 수치와 단위가 갈라졌다. 표에 걸면 머리행·라벨·두 값 열이
                  모두 물려받는다. 끊을 자리가 없는 어절(최장 "SNS·미디어" 약 62px)도 열 폭 안에 들어가
                  넘치는 셀은 없다. */}
              <table className="w-full table-fixed break-keep border-collapse text-left">
                <thead>
                  <tr>
                    {/* 84px — 최장 라벨 "평균 조회수"가 한 줄에 들어가는 최소값이다. 12px 5자 + 어절 공백이
                        약 62.4px이고 좌우 padding 20px을 빼면 64px이 남는다.
                        더 줄이면 이 라벨만 두 줄이 되어 다른 네 행과 첫 줄 시작선이 어긋난다. */}
                    <th className="w-[84px] px-[10px] py-[16px] align-middle" />
                    {/* 나머지 폭의 55%. 셋째 열은 폭을 주지 않아 남는 45%를 그대로 받는다 —
                        두 열에 각각 %를 적으면 합이 100%를 넘어 브라우저가 임의로 줄인다.
                        머리행 그라데이션은 데스크톱 표의 것과 같은 값이다(그쪽은 로고, 이쪽은 글자). */}
                    <th className="w-[calc((100%_-_84px)_*_0.55)] bg-[linear-gradient(160deg,#0D7369,#17A68C)] px-[10px] py-[16px] align-middle text-[12.5px] font-medium leading-[1.55] text-white">
                      {VS_TP_LABEL}
                    </th>
                    <th className="px-[10px] py-[16px] align-middle text-[11px] font-semibold leading-[1.55] text-[#737373]">
                      {VS_GEN_LABEL}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* 행선은 각 행의 상단에만 둔다 — 첫 행의 것이 머리행과의 경계를 겸한다.
                      마지막 행만 아래를 닫아 표의 끝을 알린다(외곽선이 없으므로 이 선이 그 몫이다). */}
                  {VS_ROWS.map((row, i) => {
                    const last = i === VS_ROWS.length - 1;
                    return (
                      <tr key={row.label}>
                        {/* 라벨 11→12px — 두 값 열과 같은 크기다. 항목 이름이 답보다 작으면
                            무엇을 견주는 표인지가 답보다 늦게 읽힌다. 구분은 굵기(600)가 맡는다.
                            세 열 모두 align-top + 같은 py라 첫 줄이 한 시작선에서 출발한다 —
                            라벨만 중앙에 두면 두 줄짜리 값 옆에서 항목 이름이 답보다 아래에서 시작한다. */}
                        <td className={clsx("border-t border-border px-[10px] py-[16px] align-top text-[12px] font-semibold leading-[1.55] text-[#111111]", last && "border-b")}>
                          {row.label}
                        </td>
                        <td className={clsx("border-t border-border bg-[#eef6f2] px-[10px] py-[16px] align-top text-[12px] leading-[1.55] text-[#111111]", last && "border-b")}>
                          {/* flex — 둘째 줄이 체크 아래로 파고들지 않게 매단다(카드 뷰에서 쓰던 처리 그대로).
                              items-start + mt-[3px]: 12px 글자의 첫 줄 상자가 18.6px(12×1.55)이고 아이콘이
                              12px이라 (18.6-12)/2 ≈ 3px 내리면 체크가 첫 줄 한가운데 선다.
                              이 열만 위 정렬인 것은 체크가 첫 줄에 걸려야 하기 때문이다(데스크톱은 체크가
                              인라인이라 같은 문제가 없다). */}
                          <span className="flex items-start gap-1">
                            <Check size={12} strokeWidth={2.5} className="mt-[3px] shrink-0 text-[#0D7369]" />
                            <span className="min-w-0">{row.tp}</span>
                          </span>
                        </td>
                        <td className={clsx("border-t border-border px-[10px] py-[16px] align-top text-[12px] leading-[1.55] text-[#8a94a3]", last && "border-b")}>
                          {/* 데스크톱 표와 같은 표기(값 앞의 연회색 대시)를 옆 열 체크와 같은 구조로 매단다 —
                              인라인으로 두면 둘째 줄이 대시 아래로 파고들어 두 열의 둘째 줄 시작선이 어긋났다.
                              체크와 달리 mt 보정이 없는 것은 대시가 아이콘이 아니라 같은 12px 글자라
                              줄 상자 높이가 본문과 같기 때문이다. 간격은 체크와 같은 gap-1. */}
                          <span className="flex items-start gap-1">
                            <span className="shrink-0 text-[#d4d4d4]">—</span>
                            <span className="min-w-0">{row.gen}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-[12.5px] text-[#a3a3a3]">
              * 더파마 리크루트 자체 채널 운영 기준. 노출·조회수는 직무·시기에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>

        {/* ══ HEADHUNTING ══════════════════════════════════════ */}
        <section className="bg-white px-6 py-[88px] max-[760px]:px-0 max-[760px]:py-[72px]">
          <div className="app-shell--default reveal">
            <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-[56px] max-[1040px]:grid-cols-1 max-[1040px]:gap-9">
              <div>
                {/* ≤760px에서 머리 세 줄(아이브로·타이틀·리드)만 가운데로 세운다 — 1열로 접히면
                    이 블록이 화면 맨 위에 서는데, WHY·PRICING의 머리는 가운데라 여기만 왼쪽이면
                    섹션마다 시작하는 방식이 달라진다. 아래 체크리스트·후보 목록·버튼은 왼쪽 그대로 —
                    읽는 덩어리가 아니라 훑는 목록이라 시작선이 하나여야 한다. */}
                <p className="text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3] max-[760px]:text-center">HEADHUNTING</p>
                <h2
                  className="mt-[14px] font-bold text-[#0a0a0a] max-[760px]:text-center"
                  style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.035em", lineHeight: 1.28 }}
                >
                  필요한 인재를<br />더파마가 찾아드립니다.
                </h2>
                {/* ≤760px 16→14px, leading 1.7→1.6 — 다른 섹션 리드와 같은 값으로 모은다.
                    break-keep은 좁은 폭에만 건다(데스크톱 줄바꿈을 바꾸지 않기 위해서다).
                    가운데 정렬에서는 어절 하나가 홀로 떨어진 줄이 왼쪽 정렬보다 눈에 띈다.
                    "서칭·검증해"는 keep-all이 가운뎃점 뒤 끊을 자리까지 막지는 않아 따로 묶었다. */}
                <p className="mt-4 text-[16px] leading-[1.7] text-[#525252] max-[760px]:break-keep max-[760px]:text-center max-[760px]:text-[14px] max-[760px]:leading-[1.6]">
                  포지션 요건을 정밀 분석해, 공개 시장에 드러나지 않는 업계 핵심 인재까지 직접{" "}
                  <span className="max-[760px]:whitespace-nowrap">서칭·검증해</span> 추천합니다.
                </p>
                <div className="mt-6 flex flex-col gap-[13px] max-[760px]:hidden">
                  {HH_POINTS.map((c) => (
                    <div key={c} className="flex items-center gap-[11px] text-[15px] text-[#404040]">
                      <BlackIc />{c}
                    </div>
                  ))}
                </div>

                {/* ≤760px 대체 — 검정 사각 아이콘을 걷고 구분선 리스트로 바꾼다. 좁은 폭에서는 20px
                    사각이 네 줄 왼쪽에 블록처럼 쌓여 글보다 먼저 읽힌다. 선 하나면 항목 구분은 충분하다. */}
                <div className="mt-5 hidden max-[760px]:block">
                  {HH_POINTS.map((c) => (
                    <div key={c} className="flex items-start gap-2 border-b border-border py-[11px] text-[12.5px] leading-[1.5] text-[#333333]">
                      <Check size={13} strokeWidth={2.5} className="mt-[2px] shrink-0 text-[#0D7369]" />
                      <span className="min-w-0">{c}</span>
                    </div>
                  ))}
                </div>

                <Link href="/business/headhunting" className="mt-[30px] inline-flex bg-[#0a0a0a] px-[26px] py-[14px] text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88] max-[760px]:hidden">
                  헤드헌팅 의뢰하기
                </Link>
              </div>
              <div className="flex flex-col gap-[14px]">
                {/* ≤760px에서만 붙는 소제목 — 리스트가 컴팩트해지면서 이 세 줄이 무엇인지 알려 주는
                    단서가 카드 모양뿐이던 것이 사라진다. */}
                <p className="hidden text-[11px] text-[#a3a3a3] max-[760px]:block">최근 추천 인재 예시</p>

                {/* ≤760px 대체 — 카드 세 장을 테두리 하나에 담은 리스트 행으로 낮춘다.
                    카드에서는 태그가 칩으로 서고 "프로필 보기"가 둘째 줄을 통째로 먹어 한 장이 120px을
                    넘었다. 이 목록은 헤드헌팅이 어떤 인재를 다루는지 보여주는 예시라 그만한 자리를
                    쓸 것이 아니다 — 태그는 메타 줄에 · 로 잇고 버튼은 뺀다(행마다 갈 곳이 같았다). */}
                <div className="hidden border border-[#e5e5e5] max-[760px]:block">
                  {HH_CANDIDATES.map((c, i) => (
                    <div key={c.role} className={clsx("flex items-center gap-3 px-4 py-3", i > 0 && "border-t border-border")}>
                      <span className={clsx("grid h-9 w-9 shrink-0 place-items-center text-[14px] font-bold text-white", hhAvatarBg(c.dark))}>
                        {c.init}
                      </span>
                      <div className="min-w-0 flex-1">
                        <b className="block text-[13px] font-medium text-[#0a0a0a]">{c.role}</b>
                        <p className="mt-[2px] text-[11.5px] leading-[1.4] text-[#737373]">
                          {c.meta} · {c.tags.join(" · ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 모바일 CTA는 섹션 맨 아래 — 예시를 본 다음에 놓인다. 데스크톱 버튼(위)은 왼쪽 열
                    본문 끝에 붙어 있어 1열로 접히면 후보 목록보다 위로 올라간다. */}
                <Link
                  href="/business/headhunting"
                  className="hidden h-12 w-full items-center justify-center border border-[#111111] bg-white text-[14px] font-semibold text-[#111111] transition-colors hover:bg-[#f5f5f5] max-[760px]:mt-1 max-[760px]:flex"
                >
                  헤드헌팅 의뢰하기
                </Link>

                <div className="contents max-[760px]:hidden">
                {HH_CANDIDATES.map((c) => (
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
          </div>
        </section>

        {/* ══ BOOST (>760px 전용) ══════════════════════════════ */}
        {/* ≤760px에서는 통째로 내리고 PRICING 도입부 두 줄이 대신한다 — 1열로 접히면 이 섹션은
            "등록은 무료" 한 마디를 위해 제목·본문·3행 표로 화면 하나를 더 쓰는 꼴이 되고,
            바로 아래 PRICING이 같은 말을 상품으로 다시 한다. */}
        <section className="bg-[#fafafa] px-6 py-[88px] max-[760px]:hidden max-[760px]:px-0 max-[760px]:py-[72px]">
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
        {/* ≤760px에서는 위 START FREE(#fafafa)가 숨어 흰 배경의 HEADHUNTING과 바로 맞닿는다 —
            같은 면이 이어지므로 여기에 구분선이 필요하다. >760px은 배경이 갈리므로 선 없이 그대로. */}
        <section id="pricing" className="scroll-mt-[88px] bg-white px-6 py-[88px] max-[760px]:border-t max-[760px]:border-border max-[760px]:px-0 max-[760px]:py-[72px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">PRICING</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              분류별 상품 안내
            </h2>
            {/* ≤760px 전용 — 위에서 내린 START FREE 섹션이 하던 말을 두 줄로 옮겨 온 것.
                "유료 상품 안내"만 먼저 보이면 등록 자체가 유료인 것처럼 읽힌다. */}
            <p className="mx-auto mt-[14px] hidden max-w-[52ch] text-center text-[14px] leading-[1.6] text-[#525252] max-[760px]:block">
              공고 등록·게시는 모든 트랙에서 무료.
              <br />
              노출이 필요할 때만 상품을 더하세요.
            </p>

            {/* "산업·연구기관 / 병원 / 약국에 따라 금액이 다릅니다." 줄은 걷었다 —
                바로 아래 분류 탭이 세 이름을 그대로 늘어놓아 같은 말을 두 번 하고 있었다. */}
            {/* 분류 탭 — 중앙 정렬 */}
            <div className="mt-9 flex justify-center">
              <TrackChips value={activeCat} onChange={setActiveCat} />
            </div>

            {/* 761~1040px 축약 미리보기 — 오른쪽 목업이 빠지는 폭에서 그 자리를 대신한다.
                같은 activeTier를 읽는다. sticky top은 헤더(h-[64px] sticky top-0 z-50) 바로 아래.
                z는 헤더보다 낮게 두되 가격 카드의 기간 드롭다운(z-20)보다도 낮아야 드롭다운이 이 위에 뜬다.

                ≤760px에서는 끈다 — 상품 카드가 아코디언이 되면서 화면에 한 장만 펼쳐지는데, 이 바가
                화면 위 88px을 상시 물고 있으면 펼친 카드가 볼 자리를 그만큼 잃는다. 노출 위치는
                카드 안 배지("최상단 추천 영역" 등)가 이미 말한다.
                MiniPreviewZone은 이 구간(761~1040px)에서 계속 쓰이므로 컴포넌트는 그대로 둔다. */}
            <div className="sticky top-[64px] z-10 mt-7 hidden border border-[#e5e5e5] bg-white max-[1040px]:block max-[760px]:hidden">
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

              {/* ≤760px 상품 아코디언 — 카드 네 장을 그대로 세우면 한 장이 화면 대부분을 먹어
                  네 상품을 견주려면 아래위로 한참 오가야 한다. 한 번에 한 장만 펼치고 나머지는
                  이름·배지·기준가만 남긴 행으로 접어 네 상품이 한 화면에 들어오게 한다.
                  펼친 내용은 데스크톱 카드와 같은 구성(배지·설명·기간·가격·CTA)이다. */}
              <div className="hidden flex-col gap-2 max-[760px]:flex">
                {mobileTierCards.map((t) => {
                  const open = openTier === t.id;
                  // PREMIUM만 1.5px 검정 — 접혀 있을 때도 유지한다. 데스크톱 카드가 2px 검정으로
                  // 급을 가르는 것과 같은 장치이며, 펼칠 때만 굵어지면 테두리가 상태 표시로 읽힌다.
                  return (
                    <div key={t.id} className={clsx("border", t.id === "premium" ? "border-[1.5px] border-[#111111]" : "border-[#e5e5e5]")}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenTier((current) => (current === t.id ? null : t.id))}
                        className="flex min-h-[44px] w-full items-center gap-2 px-4 py-3 text-left"
                      >
                        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                          <b className="text-[15px] font-bold text-[#0a0a0a]">{t.name}</b>
                          <span className={AREA_BADGE}>{t.area}</span>
                        </span>
                        {/* 접힌 행의 기준가. BASIC만 초록으로 — 무료라는 사실이 이 목록에서 가장 다른 값이다. */}
                        <span className={clsx("shrink-0 text-[13px] font-semibold", t.id === "basic" ? "text-[#0D7369]" : "text-[#0a0a0a]")}>
                          {t.collapsed}
                        </span>
                        <ChevronDown
                          size={16}
                          aria-hidden="true"
                          className={clsx("shrink-0 text-[#737373] transition-transform duration-150", open && "rotate-180")}
                        />
                      </button>

                      {open ? (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          {t.accent ? <div className="mb-[10px]"><span className={ACCENT_BADGE}>{t.accent}</span></div> : null}
                          {/* 무료 상품(pp 없음)은 부제·가격 블록을 함께 뺀다 — 접힌 행이 이미 우측에
                              "무료"를 달고 있어서, 펼치면 "공고 등록·게시 무료" / "무료" / "공고 등록 무료" /
                              "무료로 등록"까지 같은 말이 네 번 서 있었다. 남는 것은 조건을 말하는 설명과
                              버튼뿐이다. 유료 3종은 pp가 있어 종전 구성 그대로 지난다. */}
                          {t.pp ? (
                            <p className="text-[14px] font-medium text-[#0a0a0a]">{t.copy.subtitle}</p>
                          ) : null}
                          <p className={clsx(t.pp && "mt-[4px]", "text-[12.5px] leading-[1.5] text-[#a3a3a3]")}>{t.copy.desc}</p>

                          {t.pp ? (
                            <div className="mt-4">
                              {t.period ? (
                                <PeriodSelect value={t.period.value} onChange={t.period.onChange} points={t.period.points} />
                              ) : null}
                              {t.pp.original ? (
                                <p className="text-[12px] text-[#a3a3a3] line-through">정상가 {t.pp.original}</p>
                              ) : null}
                              <p className="my-[3px] text-[22px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
                                {t.pp.price}
                              </p>
                            </div>
                          ) : null}

                          {t.cta.kind === "gradient" ? (
                            <LinkButton href={t.cta.href} variant="gradient" size="md" className="mt-3 w-full justify-center">
                              {t.cta.label}
                            </LinkButton>
                          ) : t.cta.kind === "black" ? (
                            <a href={t.cta.href} className="mt-3 flex min-h-[44px] w-full items-center justify-center bg-[#0a0a0a] text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">
                              {t.cta.label}
                            </a>
                          ) : (
                            // mt-4 — 이 분기(outline)를 쓰는 것은 가격 블록이 빠진 무료 상품뿐이라,
                            // 버튼이 그 자리를 대신하며 유료 카드의 설명→가격 간격(mt-4)을 그대로 받는다.
                            <a href={t.cta.href} className="mt-4 flex min-h-[44px] w-full items-center justify-center border border-[#e5e5e5] text-[14px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#f5f5f5]">
                              {t.cta.label}
                            </a>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* 가격 카드 */}
              <div className="flex flex-col gap-4 max-[760px]:hidden">
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
                      {/* 캡션("공고 등록 무료")은 걷었다 — 부제·큰 값·버튼이 이미 무료를 말한다.
                          큰 "무료"는 남긴다: 네 카드의 가격 슬롯이 같은 자리에서 시작하게 하는 것이 이 값이다. */}
                      <p className="text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">
                        무료
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
        {/* 위 PRICING과 같은 흰 배경이라 선을 둔다(양쪽 폭 공통). ≤760px에서만 색을 토큰으로 —
            좁은 폭의 섹션 구분선은 border-border 하나로 통일한다. */}
        <section className="border-t border-[#e5e5e5] bg-white px-6 py-[88px] max-[760px]:border-border max-[760px]:px-0 max-[760px]:py-[72px]">
          <div className="app-shell--default reveal">
            <p className="text-center text-[12px] font-semibold tracking-[.06em] text-[#a3a3a3]">PRICING</p>
            <h2
              className="mt-[14px] text-center font-bold text-[#0a0a0a]"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              상품별 제공 항목 비교
            </h2>
            {/* 부제("추천 · 상단 · 최상단 노출까지…")는 걷었다 — 표가 바로 아래에서 같은 것을
                항목으로 보여 주므로, 읽고 나서 다시 표를 읽어야 하는 줄이었다. */}
            {/* 분류 탭에서 한참 아래로 떨어진 표라, 지금 어느 분류를 보고 있는지 여기서 다시 알려 준다.
                읽기만 하던 "○○ 기준" 캡션을 컨트롤로 바꾼 것 — 분류를 바꾸려고 화면 위 탭까지
                되돌아가야 했다. 상태는 위 탭과 같은 activeCat이라 어느 쪽을 눌러도 함께 움직인다.
                생김새도 위 탭과 같은 부품을 쓴다(TrackChips) — 같은 것을 두 번 다르게 배우지 않게. */}
            <div className="mt-[14px] flex justify-center">
              <TrackChips value={activeCat} onChange={setActiveCat} />
            </div>
            <p className="mt-2 text-center text-[12px] text-[#a3a3a3] max-[760px]:text-[11px]">
              위 상품 안내와 같은 기준으로 표시됩니다
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
                        ? "border-transparent bg-[#111111] text-white"
                        : "border-[#e5e5e5] bg-white text-[#737373]",
                    )}
                  >
                    {h.tier}
                    <span className={clsx("ml-[6px] text-[12px] font-normal", featureTier === i ? "text-white/70" : "text-[#a3a3a3]")}>{h.sub}</span>
                  </button>
                ))}
              </div>
              {/* 행 높이를 한 단계 낮춘다 — 10행이 세로로 늘어서는 목록이라 행마다 4px씩만 줄여도
                  한 화면에 들어오는 항목 수가 달라진다. 값은 500으로 — 좌우가 같은 굵기면
                  어느 쪽이 항목이고 어느 쪽이 답인지 흐려지고, 600은 10행이 전부 강조가 된다. */}
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {FEATURE_ROWS.map((row, ri) => (
                  <li key={ri} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-[12.5px] leading-[1.5] text-[#0a0a0a]">{row.label}</p>
                      {row.sub && <small className="mt-[2px] block text-[11px] leading-[1.4] text-[#a3a3a3]">{row.sub}</small>}
                    </div>
                    <span className="shrink-0 text-[12.5px] font-medium text-[#0a0a0a]">
                      <FeatureMark value={featureCell(row, featureTier, activeCat)} checkSize={15} checkClassName="text-[#0D7369]" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* 각주는 가운데 정렬을 걷고 왼쪽으로 세운다 — 가운데로 모으면 줄마다 시작 x가 달라
                세 줄이 한 묶음으로 읽히지 않는다. pl/-indent 짝은 hanging indent다: * 가 첫 줄
                왼쪽에 걸리고 접힌 줄은 본문 시작선에 맞는다(8px ≈ "* "의 폭).
                약국 각주는 약국을 보고 있을 때만 — 다른 분류에서는 해당 없는 예외 설명이다. */}
            <div className="mt-6 text-left text-[12px] leading-[1.6] text-[#a3a3a3] max-[760px]:text-[11px]">
              <p className="pl-[8px] -indent-[8px]">
                * 노출 기간·횟수는 상품 기준이며, 직무·시기에 따라 달라질 수 있습니다. 모든 금액은 부가세 별도입니다.
              </p>
              <p className="mt-1 pl-[8px] -indent-[8px]">
                * 웹사이트 노출은 구매한 이용 기간 동안 적용됩니다.
              </p>
              {activeCat === "pharmacy" ? (
                <p className="mt-1 pl-[8px] -indent-[8px]">
                  * 약국 상품은 웹사이트 노출 중심으로 구성되며 SNS·카카오톡·미디어 노출이 포함되지 않습니다.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* ══ CLOSING CTA ══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1d1c] px-6 text-center text-white max-[760px]:px-0">
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
          <div className="app-shell--default relative z-10 py-[96px] max-[760px]:py-[72px]">
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              지금, 더파마 채용솔루션을 시작하세요.
            </h2>
            {/* ≤760px 16→14px. leading은 값이 없어 body의 1.65를 물려받고 있었으므로
                다른 리드와 같은 1.6을 좁은 폭에서만 명시한다. */}
            <p className="mx-auto mt-[14px] max-w-[52ch] text-[16px] text-[#c4c8c6] max-[760px]:text-[14px] max-[760px]:leading-[1.6]">
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

      {/* ══ ≤760px 하단 무료 안내 배너 ═══════════════════════════ */}
      {/* 페이지가 유료 상품 안내로 길게 이어지는 동안 "등록 자체는 무료"라는 사실이 히어로와
          PRICING 도입부에만 있어 스크롤 중에는 보이지 않는다. 그 한 줄만 화면에 붙여 둔다.

          이미 기업 회원이면 띄우지 않는다 — 가입 유도 문구인데 그들에게는 할 말이 아니다.
          z-[60]: 페이지 콘텐츠 위, 모달 계열(70)·드로어(75)·토스트(80) 아래.
          이 랜딩에는 하단 탭바가 없다(BusinessTabBar의 allowlist에 /business가 없다) —
          겹칠 상대가 없어 본문 하단 보정 없이 얹는다. */}
      {!isMember && !bannerDismissed ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] hidden bg-[#15181c] pb-[env(safe-area-inset-bottom)] max-[760px]:block">
          {/* py-1 — 44px 닫기 버튼이 높이를 정하고 위아래 4px씩만 더해 52px에 맞춘다. */}
          <div className="flex items-center gap-2 px-6 py-1">
            <p className="min-w-0 flex-1 text-[12.5px] leading-[1.4] text-white">
              공고 등록·게시는 <span className="font-medium text-[#23D9A5]">무료</span>입니다
            </p>
            {/* 히어로 "무료로 공고 등록"과 같은 분기(freeHref)를 그대로 쓴다 — 두 곳이 갈라지면 안 된다. */}
            <a
              href={freeHref}
              className="shrink-0 px-[14px] py-2 text-[12px] font-semibold text-white transition-[filter] hover:brightness-[1.08]"
              style={{ background: "var(--gradient-cta)" }}
            >
              무료로 등록
            </a>
            {/* -mr-2 — 44px 터치 타깃은 그대로 두고 아이콘만 가장자리 쪽으로 당긴다. */}
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="안내 닫기"
              className="-mr-2 grid h-11 w-11 shrink-0 place-items-center text-[#8a94a3] transition-colors hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
