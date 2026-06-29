"use client";

import clsx from "clsx";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { useBusinessMember } from "@/hooks/useBusinessMember";

// ── 가격 데이터 ─────────────────────────────────────────────
type Cat = "industry" | "hospital" | "pharmacy";
interface PP { price: string; original?: string; }
function won(n: number) { return n.toLocaleString("ko-KR") + "원"; }

const PRICES: Record<"premium" | "featured" | "standard", Record<Cat, [PP, PP, PP, PP]>> = {
  premium: {
    industry: [
      { price: won(857_000) },
      { price: won(1_200_000), original: won(2_400_000) },
      { price: won(1_543_000), original: won(2_571_000) },
      { price: won(1_714_000), original: won(3_428_000) },
    ],
    hospital: [
      { price: won(1_029_000) },
      { price: won(1_440_000), original: won(2_057_000) },
      { price: won(1_851_000), original: won(3_087_000) },
      { price: won(2_057_000), original: won(4_116_000) },
    ],
    pharmacy: [
      { price: won(86_000) },
      { price: won(120_000), original: won(171_000) },
      { price: won(154_000), original: won(258_000) },
      { price: won(171_000), original: won(344_000) },
    ],
  },
  featured: {
    industry: [
      { price: won(564_000) },
      { price: won(790_000), original: won(1_129_000) },
      { price: won(1_016_000), original: won(1_692_000) },
      { price: won(1_129_000), original: won(2_256_000) },
    ],
    hospital: [
      { price: won(457_000) },
      { price: won(640_000), original: won(914_000) },
      { price: won(823_000), original: won(1_371_000) },
      { price: won(914_000), original: won(1_828_000) },
    ],
    pharmacy: [
      { price: won(57_000) },
      { price: won(80_000), original: won(114_000) },
      { price: won(103_000), original: won(171_000) },
      { price: won(114_000), original: won(228_000) },
    ],
  },
  standard: {
    industry: [
      { price: won(400_000) },
      { price: won(560_000), original: won(800_000) },
      { price: won(720_000), original: won(1_200_000) },
      { price: won(800_000), original: won(1_600_000) },
    ],
    hospital: [
      { price: won(343_000) },
      { price: won(480_000), original: won(686_000) },
      { price: won(617_000), original: won(1_029_000) },
      { price: won(686_000), original: won(1_372_000) },
    ],
    pharmacy: [
      { price: won(21_000) },
      { price: won(29_000), original: won(41_000) },
      { price: won(37_000), original: won(63_000) },
      { price: won(41_000), original: won(84_000) },
    ],
  },
};

const PERIOD_OPTS = [
  { label: "1주", discount: "" },
  { label: "2주", discount: "30%↓" },
  { label: "3주", discount: "40%↓" },
  { label: "4주", discount: "50%↓" },
] as const;

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
function PeriodSelect({ value, onChange }: { value: number; onChange: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const opt = PERIOD_OPTS[value];
  const label = opt.discount ? `${opt.label} (${opt.discount})` : opt.label;

  return (
    <div ref={ref} className="relative mb-[14px]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border border-[#e5e5e5] bg-white px-3 py-[9px] text-[13px] font-medium text-[#404040] transition-colors hover:border-[#a3a3a3]"
      >
        <span>이용기간: <span className="font-semibold">{label}</span></span>
        <ChevronDown size={13} className={clsx("ml-1 shrink-0 text-[#737373] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-[210px] border border-[#e5e5e5] bg-white shadow-[0_8px_22px_rgba(20,32,46,0.12)]">
          {PERIOD_OPTS.map((o, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { onChange(idx); setOpen(false); }}
              className={clsx(
                "flex w-full items-center justify-between px-4 py-3 text-[13.5px] transition-colors hover:bg-[#f5f5f5]",
                value === idx ? "font-semibold text-[#0a0a0a]" : "text-[#404040]",
              )}
            >
              <span>{o.label}{o.discount ? ` (${o.discount})` : ""}</span>
              {value === idx && <Check size={14} className="text-[#17A68C]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export function BusinessPricingClient() {
  const isMember = useBusinessMember();
  const [activeCat, setActiveCat] = useState<Cat>("industry");

  // 카드별 독립 기간 상태 (default: 2주 = index 1)
  const [premPeriod, setPremPeriod] = useState(1);
  const [featPeriod, setFeatPeriod] = useState(1);
  const [stdPeriod,  setStdPeriod]  = useState(1);

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

  const applyHref = isMember ? "/support/contact" : "/business/signup";
  const freeHref  = isMember ? "/business/jobs/new" : "/business/signup";

  return (
    <>
      <BusinessHeader />
      <main className="bg-white">

        {/* ══ HERO ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1d1c] px-6 text-white">
          {/* 배경 사진 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[.28]"
            style={{
              backgroundImage: "url(/images/business-hero-skyline.jpg)",
              WebkitMaskImage: "linear-gradient(100deg,#000 0%,#000 32%,transparent 78%)",
              maskImage: "linear-gradient(100deg,#000 0%,#000 32%,transparent 78%)",
            }}
          />
          {/* 그린 글로우 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(120% 80% at 88% 8%,rgba(35,217,165,.10),transparent 55%)" }}
          />
          <div className="app-shell--default relative z-10 w-full py-[100px] max-[760px]:py-16">
            <p className="text-[12px] font-semibold tracking-[.14em] text-[#7fcdb9]">결국, 사람이 경쟁력입니다</p>
            <h1
              className="mt-5 font-semibold text-white"
              style={{ fontSize: "clamp(36px,5.2vw,58px)", letterSpacing: "-.045em", lineHeight: 1.15 }}
            >
              제약·바이오·약국·병원 전문 채용,
              <br />
              <span className="text-gradient-cta font-bold">더파마 리크루트</span> 하나로.
            </h1>
            <p className="mt-6 max-w-[52ch] text-[17px] leading-[1.7] text-[#c4c8c6]">
              통합 구독자 6,000명의 약사·연구원·업계 실무자 네트워크.<br />다른 채용 플랫폼이 닿지 못하는 제약·바이오 전문 인재를 직접 연결합니다.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <LinkButton href="#pricing" variant="gradient" size="lg">
                노출 상품 보기
                <ChevronRight size={17} />
              </LinkButton>
              <a
                href={freeHref}
                className="inline-flex h-12 items-center border border-white/30 px-7 text-[15px] font-medium text-white transition-colors hover:bg-white/10"
              >
                무료로 공고 등록
              </a>
            </div>
          </div>
        </section>

        {/* ══ 지표 밴드 ══════════════════════════════════════════ */}
        <div className="border-b border-[#e5e5e5] bg-[#f5f5f5]">
          <div className="app-shell--default grid grid-cols-3 max-[640px]:grid-cols-1">
            {([
              { value: "평균 3~4만 회", sub: "SNS 단독 공고 1건당 조회수" },
              { value: "4,000명",        sub: "카카오톡 단독 공고 대상" },
              { value: "약 10배",        sub: "미디어 연계 노출 (일반 대비)" },
            ] as const).map((s, i) => (
              <div key={i} className="relative py-[34px] text-center max-[640px]:border-t max-[640px]:border-[#e5e5e5]">
                {i > 0 && <span className="absolute inset-y-7 left-0 w-px bg-[#e5e5e5] max-[640px]:hidden" />}
                <b
                  className="block font-bold text-[#0a0a0a]"
                  style={{ fontSize: "clamp(26px,3.2vw,34px)", letterSpacing: "-.035em" }}
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
            <div className="group mt-[54px] overflow-x-auto">
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
                  {([
                    { label: "업계 전문성",           tp: "약사·업계 출신 전문 컨설턴트가 직접 운영",                             gen: "분야 비전문 일반 채용 운영" },
                    { label: "SNS·미디어 홍보",        tp: "LinkedIn·Instagram 등 미디어 연계 노출 (타 플랫폼 대비 약 10배)", gen: "자사 공고 게시판 노출에 한정" },
                    { label: "공고 1건당 평균 조회수",  tp: "평균 3~4만 회 노출",                                               gen: "수백~수천 회 수준" },
                    { label: "타깃 인재",              tp: "제약·바이오·약국·병원 전문 인재 (통합 구독자 6,000명)",            gen: "분야 무관 불특정 다수" },
                    { label: "채용 방식",              tp: "채용공고 + 헤드헌팅 + 기업 정보 관리 통합",                        gen: "공고 등록 위주" },
                    { label: "후보 검증·추천",          tp: "업계 이해 기반의 검증·추천",                                      gen: "키워드 자동 매칭" },
                  ] as const).map((row) => (
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
            <p className="mt-6 text-center text-[12.5px] text-[#a3a3a3]">
              * 더파마 리크루트 자체 채널 운영 기준. 노출·조회수는 직무·시기에 따라 달라질 수 있습니다.
            </p>
          </div>
        </section>

        {/* ══ HEADHUNTING ══════════════════════════════════════ */}
        <section className="bg-white px-6 py-[88px] max-[760px]:py-[60px]">
          <div className="app-shell--default reveal">
            <div className="grid grid-cols-[0.85fr_1.15fr] items-center gap-[56px] max-[980px]:grid-cols-1 max-[980px]:gap-9">
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
                    className="flex items-center gap-[18px] border border-[#e5e5e5] bg-white px-6 py-5 transition-[transform,box-shadow,border-color] duration-[220ms] hover:-translate-y-0.5 hover:border-[#d4d4d4] hover:shadow-[0_10px_26px_-16px_rgba(0,0,0,0.18)]"
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
                    <button type="button" className="shrink-0 border border-[#e5e5e5] px-4 py-[9px] text-[13px] font-semibold text-[#0a0a0a] transition-colors hover:bg-[#fafafa]">
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
            <div className="grid grid-cols-[1fr_0.9fr] items-center gap-[56px] max-[980px]:grid-cols-1 max-[980px]:gap-8">
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
              <div className="border-l border-[#e5e5e5] pl-[40px]">
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
              산업·기관 / 병원 / 약국에 따라 금액이 다릅니다.
            </p>

            {/* 분류 탭 — 중앙 정렬 */}
            <div className="mt-9 flex justify-center">
              <div className="flex gap-2">
                {(["industry","hospital","pharmacy"] as const).map((cat) => {
                  const label = cat === "industry" ? "산업·기관" : cat === "hospital" ? "병원" : "약국";
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCat(cat)}
                      className={clsx(
                        "border px-[26px] py-[11px] text-[14px] font-semibold transition-all",
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

            {/* 미리보기 + 카드 */}
            <div className="mt-[44px] grid grid-cols-[0.95fr_1.05fr] items-start gap-8 max-[980px]:grid-cols-1">
              {/* 브라우저 목업 */}
              <div className="sticky top-[88px] border border-[#e5e5e5] bg-white max-[980px]:hidden">
                <div className="flex items-center gap-2 border-b border-[#e5e5e5] px-4 py-[14px]">
                  {[0,1,2].map((i) => <span key={i} className="h-[11px] w-[11px] rounded-full bg-[#d4d4d4]" />)}
                  <span className="ml-[10px] text-[12.5px] text-[#a3a3a3]">thepharma.com/jobs</span>
                </div>
                <div className="p-[18px]">
                  <div className="mb-[14px] flex items-center gap-[10px] border border-dashed border-[#a7d3c4] bg-[#f1f8f5] px-[14px] py-3 text-[12.5px]">
                    <span className="bg-[#d7ede5] px-[7px] py-[3px] text-[10px] font-bold text-[#0D7369]">POPUP</span>
                    이주의 추천 공고 팝업으로도 노출돼요
                  </div>
                  <div className="mb-[14px] border-2 border-[#2c6f63] bg-[#eef6f2] px-[14px] py-3">
                    <div className="mb-[10px] flex items-center justify-between text-[12.5px] font-semibold">
                      <span><span className="mr-[6px] bg-[#3c7d6f] px-[7px] py-[3px] text-[10px] font-bold text-white">프리미엄</span>최상단 추천 배너</span>
                      <span className="font-semibold text-[#0D7369]">↑ 내 공고</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-[30px] flex-[1.6] bg-[linear-gradient(160deg,#0D7369,#17A68C)]" />
                      <div className="h-[30px] flex-1 bg-[#e5e5e5]" />
                    </div>
                  </div>
                  {[
                    { label: "상단 추천", cols: 3 },
                    { label: "추천 공고", cols: 4 },
                    { label: "일반 공고", cols: 4 },
                  ].map((b) => (
                    <div key={b.label} className="mb-[10px] border border-[#e5e5e5] p-3 last:mb-0">
                      <p className="mb-[9px] text-[12px] font-semibold">{b.label}</p>
                      <div className="flex gap-2">
                        {Array.from({ length: b.cols }).map((_, i) => (
                          <div key={i} className="h-[28px] flex-1 border border-[#e5e5e5] bg-[#f5f5f5]" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="border-t border-[#e5e5e5] py-3 text-center text-[12px] text-[#a3a3a3]">
                  상품을 선택하면 노출 위치가 미리보기에 표시돼요.
                </p>
              </div>

              {/* 가격 카드 */}
              <div className="flex flex-col gap-4">
                {/* PREMIUM */}
                <div className="border-2 border-[#2c6f63] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-16px_rgba(13,115,105,0.3)]">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">PREMIUM</b>
                        <span className="bg-[#3c7d6f] px-2 py-[3px] text-[11px] font-bold text-white">최상단 추천 영역</span>
                      </div>
                      <div className="mb-3"><span className="bg-[#17A68C] px-2 py-[3px] text-[10.5px] font-bold text-white">빠른 채용</span></div>
                      <div>
                        <p className="text-[15px] font-medium text-[#0a0a0a]">전 채널 집중 노출 패키지</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">웹사이트 최상단부터 SNS·카카오톡·미디어까지 한 번에.<br />가장 빠른 채용이 필요할 때.</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={premPeriod} onChange={setPremPeriod} />
                      {prem.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {prem.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{prem.price}</p>
                      <LinkButton href={applyHref} variant="gradient" size="md" className="mt-[14px] w-full justify-center">신청하기</LinkButton>
                    </div>
                  </div>
                </div>

                {/* FEATURED */}
                <div className="border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">FEATURED</b>
                        <span className="border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-[3px] text-[11px] font-semibold text-[#737373]">상단 추천 영역</span>
                      </div>
                      <div className="mb-3"><span className="bg-[#0a0a0a] px-2 py-[3px] text-[10.5px] font-bold text-white">BEST</span></div>
                      <div>
                        <p className="text-[15px] font-medium text-[#0a0a0a]">추천 + 채널 노출 구성</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">상단 추천 노출에 SNS·카카오톡 주간 노출을 더해<br />도달을 넓힙니다.</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={featPeriod} onChange={setFeatPeriod} />
                      {feat.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {feat.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{feat.price}</p>
                      <a href={applyHref} className="mt-[14px] block w-full bg-[#0a0a0a] py-3 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">신청하기</a>
                    </div>
                  </div>
                </div>

                {/* STANDARD */}
                <div className="border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">STANDARD</b>
                        <span className="border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-[3px] text-[11px] font-semibold text-[#737373]">추천 공고 영역</span>
                      </div>
                      <div className="mt-[6px]">
                        <p className="text-[15px] font-medium text-[#0a0a0a]">웹사이트 추천 노출</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">추천 공고 영역에 14일간 안정적으로 노출됩니다.</p>
                      </div>
                    </div>
                    <div className="min-w-[190px] text-right max-[640px]:text-left">
                      <PeriodSelect value={stdPeriod} onChange={setStdPeriod} />
                      {std.original && <p className="text-[12.5px] text-[#a3a3a3] line-through">정상가 {std.original}</p>}
                      <p className="my-[3px] text-[26px] font-bold tracking-[-0.02em] text-[#0a0a0a]">{std.price}</p>
                      <a href={applyHref} className="mt-[14px] block w-full bg-[#0a0a0a] py-3 text-center text-[14px] font-semibold text-white transition-opacity hover:opacity-[.88]">신청하기</a>
                    </div>
                  </div>
                </div>

                {/* BASIC — 무료, 드롭다운 없음 */}
                <div className="border border-[#e5e5e5] p-[24px_26px] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-18px_rgba(0,0,0,0.2)]">
                  <div className="grid grid-cols-[1fr_auto] items-start gap-5 max-[640px]:grid-cols-1">
                    <div>
                      <div className="mb-[6px] flex flex-wrap items-center gap-[9px]">
                        <b className="text-[18px] font-bold">BASIC</b>
                        <span className="border border-[#e5e5e5] bg-[#f5f5f5] px-2 py-[3px] text-[11px] font-semibold text-[#737373]">전체 공고 목록</span>
                      </div>
                      <div className="mt-[6px]">
                        <p className="text-[15px] font-medium text-[#0a0a0a]">공고 등록·게시 무료</p>
                        <p className="mt-[4px] text-[13px] text-[#a3a3a3]">마감일까지 노출, 별도 마감이 없으면 최대 30일.</p>
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
            <div className="mt-[18px] overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse">
                <thead>
                  <tr>
                    <th className="w-[30%] py-[22px] pl-6 text-left text-[14px] font-semibold text-[#0a0a0a]">제공 항목</th>
                    {([
                      { tier: "BASIC",    sub: "무료 공고",  prem: false },
                      { tier: "STANDARD", sub: "기본 노출",  prem: false },
                      { tier: "FEATURED", sub: "확장 노출",  prem: false },
                      { tier: "PREMIUM",  sub: "집중 노출",  prem: true  },
                    ] as const).map((h) => (
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
                  {([
                    { label: "더파마 리크루트 공고 등록",   b: true,  s: true,    f: true,    p: true,  gap: false },
                    { label: "웹사이트 추천 공고 노출",      b: false, s: "14일",  f: "14일",  p: "14일", gap: false },
                    { label: "웹사이트 상단 추천 노출",      b: false, s: false,   f: "14일",  p: "14일", gap: false },
                    { label: "웹사이트 최상단 추천 노출",    b: false, s: false,   f: false,   p: "14일", gap: false },
                    { label: "SNS 주간 추천 공고",  sub: "업계 타깃 채널 묶음 노출",        b: false, s: false, f: "1회", p: "1회", gap: true },
                    { label: "카카오톡 주간 추천 공고", sub: "4,000명 대상 노출",              b: false, s: false, f: "1회", p: "1회", gap: false },
                    { label: "이주의 추천 공고 팝업",        b: false, s: false,   f: false,   p: "7일",  gap: true },
                    { label: "SNS 단독 공고 노출",   sub: "평균 조회수 3~4만 회",             b: false, s: false, f: false, p: "1회", gap: false },
                    { label: "카카오톡 단독 공고 노출", sub: "4,000명 대상 노출",              b: false, s: false, f: false, p: "1회", gap: false },
                    { label: "더파마뉴스 사이드 배너",       b: false, s: false,   f: false,   p: "7일",  gap: false },
                  ] as const).map((row, ri) => (
                    <tr key={ri} className={row.gap ? "border-t-[8px] border-[#f5f5f5]" : ""}>
                      <td className="border-t border-[#e5e5e5] py-[18px] pl-6 text-[15px] font-semibold text-[#0a0a0a]">
                        {row.label}
                        {"sub" in row && row.sub && <small className="mt-[3px] block text-[12px] font-normal text-[#a3a3a3]">{row.sub}</small>}
                      </td>
                      {([row.b, row.s, row.f, row.p] as const).map((val, ci) => (
                        <td key={ci} className={clsx("border-t border-[#e5e5e5] py-[18px] text-center text-[15px] font-semibold", ci === 3 && "bg-[rgba(23,166,140,0.05)]")}>
                          {val === true  ? <span className="inline-flex justify-center"><Check size={18} strokeWidth={2} className="text-[#17A68C]" /></span>
                          : val === false ? <span className="text-[#d4d4d4]">—</span>
                          : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-center text-[12.5px] text-[#a3a3a3]">
              * 노출 기간·횟수는 상품 기준이며, 직무·시기에 따라 달라질 수 있습니다. 모든 금액은 부가세 별도입니다.
            </p>
          </div>
        </section>

        {/* ══ CLOSING CTA ══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#1a1d1c] px-6 text-center text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[.32]"
            style={{
              backgroundImage: "url(/images/business-hero-skyline.jpg)",
              WebkitMaskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
              maskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
            style={{ background: "var(--gradient-cta)" }}
          />
          <div className="app-shell--default relative z-10 w-full py-[96px] max-[760px]:py-16">
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
