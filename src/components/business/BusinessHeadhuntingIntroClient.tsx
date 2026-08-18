"use client";

/**
 * 이 파일은 마케팅 랜딩 전용 타이포 스케일을 쓴다 — 확정 타이포 스케일
 * (34/28/24/22/20/17/16/15/14/13/12)의 예외로 인정됨.
 *
 * 히어로 h1은 clamp(36px,5.2vw,58px), 섹션 h2는 clamp(24px,3vw,38px)로 뷰포트에 따라
 * 유동한다. BusinessPricingClient와 같은 값을 쓰며, 두 랜딩은 한 쌍으로 유지한다.
 * "스케일 위반"으로 보고 일괄 치환하지 말 것 — 바꾸려면 두 랜딩을 함께 재설계해야 한다.
 */

import { useEffect } from "react";
import Link from "next/link";
import { BusinessImageBand, BusinessCard, BusinessSection } from "@/components/business/BusinessMarketingSections";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { companyExampleImages } from "@/config/companyImages";
import { useBusinessMember } from "@/hooks/useBusinessMember";

const reasons = [
  {
    number: "01",
    title: "제약·바이오 산업 전문성",
    description: "제약·바이오 산업을 깊이 이해하고 후보자를 탐색합니다.",
  },
  {
    number: "02",
    title: "업계 네트워크 기반 탐색",
    description: "더파마뉴스로 형성된 산업 접점을 기반으로 인재를 찾습니다.",
  },
  {
    number: "03",
    title: "적합도 중심의 인재추천",
    description: "경력과 직무 경험을 확인한 후보자를 선별해 추천합니다.",
  },
];

const specializedPositions = [
  { title: "전문직·산업 약사", tags: "산업약사 · 학술(MSL) · 의학부 · 메디컬 자문 · 의사 · 약사", image: companyExampleImages.primary },
  { title: "연구·개발", tags: "신약개발 · 바이오연구 · 제제연구 · 분석연구 · 비임상", image: companyExampleImages.hero },
  { title: "임상·메디컬·허가", tags: "임상개발 · Clinical Operations · CRA · Medical Affairs · MSL · RA · PV", image: companyExampleImages.workspace },
  { title: "사업개발·전략", tags: "BD · 라이선싱 · Alliance Management · 사업전략", image: companyExampleImages.culture },
  { title: "금융·투자", tags: "IR · 재무 · 회계 · 투자심사 · M&A · 라이선싱 금융", image: companyExampleImages.lab },
  { title: "영업·마케팅", tags: "제품마케팅 · 영업 · Market Access · 학술마케팅 · 디지털마케팅", image: companyExampleImages.meeting },
];

const processSteps = [
  { number: "01", title: "채용 컨설팅", description: "채용 배경과 조직 상황을 이해하고 포지션의 역할과 핵심 역량을 구체화합니다." },
  { number: "02", title: "후보자 탐색", description: "인재풀과 업계 네트워크로 적합한 후보자를 발굴합니다." },
  { number: "03", title: "후보자 추천", description: "경력과 역량, 이직 의사를 검증한 인재를 선별해 추천합니다." },
  { number: "04", title: "면접 및 입사 지원", description: "면접 조율부터 처우 협의, 입사까지 전 과정을 지원합니다." },
];

function ClosingCtaRow({ isMember }: { isMember: boolean }) {
  const hrefs = isMember
    ? { primary: "/business/headhunting/manage/new", secondary: "/business/headhunting/manage" }
    : { primary: "/business/signup", secondary: "/business/support" };
  return (
    <>
      {/* ≤760px 풀폭 세로 스택. 히어로와 달리 보조를 밑줄로 강등하지 않는다 — 이 섹션은
          어두운 배경 위에 버튼 둘만 서 있어 아웃라인이 사라지면 두 번째 CTA가 배경에 묻힌다. */}
      <Link
        href={hrefs.primary}
        className="inline-flex items-center bg-[linear-gradient(160deg,#0D7369,#17A68C)] px-[30px] py-[15px] text-[15px] font-semibold text-white transition-[filter] hover:brightness-[1.08] max-[760px]:w-full max-[760px]:justify-center"
      >
        인재추천 의뢰하기
      </Link>
      <Link
        href={hrefs.secondary}
        className="inline-flex items-center border border-white/40 px-[30px] py-[15px] text-[15px] font-semibold text-white transition-colors hover:bg-white/10 max-[760px]:w-full max-[760px]:justify-center"
      >
        서비스 소개자료 받기
      </Link>
    </>
  );
}

/**
 * ≤760px에서는 버튼 두 장이 같은 무게로 나란히 서지 않게 한다 — 주 CTA는 풀폭,
 * 보조는 아웃라인을 벗겨 텍스트 링크로 내린다. 위계가 생기므로 세로 간격도 함께 좁힌다.
 * (BusinessPricingClient 히어로와 같은 처리.)
 * h-11(44px)은 테두리를 벗긴 뒤에도 터치 타깃을 유지하기 위한 것이다.
 */
const HERO_PRIMARY_CTA = "max-[760px]:w-full";
const HERO_SECONDARY_CTA =
  "max-[760px]:h-11 max-[760px]:w-full max-[760px]:justify-center max-[760px]:border-0 max-[760px]:underline max-[760px]:underline-offset-4";

function HeroCtaRow({ isMember }: { isMember: boolean }) {
  if (isMember) {
    return (
      <div className="flex flex-wrap gap-3 max-[760px]:gap-1">
        <LinkButton href="/business/headhunting/manage/new" variant="gradient" size="lg" className={HERO_PRIMARY_CTA}>
          인재추천 의뢰하기
        </LinkButton>
        <LinkButton href="/business/headhunting/manage" variant="secondary" tone="dark" size="lg" className={HERO_SECONDARY_CTA}>
          서비스 소개자료 받기
        </LinkButton>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3 max-[760px]:gap-1">
      <LinkButton href="/business/signup" variant="gradient" size="lg" className={HERO_PRIMARY_CTA}>
        인재추천 의뢰하기
      </LinkButton>
      <LinkButton href="/business/support" variant="secondary" tone="dark" size="lg" className={HERO_SECONDARY_CTA}>
        서비스 소개자료 받기
      </LinkButton>
    </div>
  );
}

export function BusinessHeadhuntingIntroClient() {
  const isMember = useBusinessMember();

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

  return (
    <>
      <BusinessHeader />
      <main>
        {/* ≤760px 좌우 여백은 셸 gutter 하나가 담당한다 — 섹션마다 붙은 px-6(24px)이 셸
            gutter(--shell-gutter 48px = 좌우 24px씩)와 겹쳐 실제로는 한쪽 48px씩 물고 있었고,
            390px에서 본문이 294px까지 눌렸다. 각 섹션의 px를 그 폭에서만 접어 24px로 되돌린다.
            (BusinessPricingClient가 같은 겹침을 먼저 푼 선례가 있다.)
            히어로는 밴드가 px를 쥐고 있어 className으로 덮을 수 없으므로 mobileFlush로 켠다. */}
        <BusinessImageBand image={companyExampleImages.headhuntingHero} gradient="horizontal" variant="hero" mobileFlush>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#7fcdb9]">THE PHARMA HEADHUNTING</p>
          {/* fontSize·fontWeight를 인라인 style에서 클래스로 옮겼다 — 인라인은 max-[760px] 분기로
              덮을 수 없다. clamp 값(36/5.2vw/58)과 600은 그대로라 >760px 렌더 결과는 동일하다.
              행간·자간은 분기가 없어 인라인에 남긴다.

              ≤760px는 카피가 다르다(데스크톱 벌은 팀 논의 대기 중인 의도된 이원화). h1을 둘로 늘리지
              않고 한 h1 안에서 두 벌을 갈라 끼운다 — 문서에 h1이 두 개 있는 것으로 읽히지 않게.

              모바일 두 줄에 nowrap을 걸 수 있는 것은 카피가 짧아졌기 때문이다. 28px·weight 500·
              자간 -0.045em에서 실측 240.5px / 172.3px이고 본문 폭은 뷰포트-48px이므로, 320px(272px)에서
              첫 줄이 31.5px 남는다. 폰트 실측 오차 ±3%를 얹어도 248px이라 320px에서 안전하고,
              289px 아래로 내려가야 넘친다. 데스크톱 벌은 종전대로 break-keep에 맡긴다
              (그쪽 첫 소절은 28px 환산 299px이라 nowrap을 걸면 320px에서 잘린다). */}
          <h1
            className="mt-4 max-w-[980px] break-keep text-[clamp(36px,5.2vw,58px)] font-semibold text-white max-[760px]:text-[28px] max-[760px]:font-medium"
            style={{ lineHeight: 1.15, letterSpacing: "-0.045em" }}
          >
            <span className="max-[760px]:hidden">
              제약·바이오·약국·병원 채용은
              <br />
              산업을 이해하는 파트너에게 맡기세요.
            </span>
            {/* 줄마다 nowrap — 두 줄은 <br>로 고정하고, 그 안에서 다시 접히는 일이 없게 한다. */}
            <span className="hidden max-[760px]:block">
              <span className="whitespace-nowrap">산업을 아는 파트너에게</span>
              <br />
              <span className="whitespace-nowrap">채용을 맡기세요.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-[75ch] break-keep text-[17px] font-normal leading-[1.7] text-[#c4c8c6] max-[760px]:text-[15px]">
            채용공고만으로 만나기 어려운 인재를 더파마가 직접 발굴해 연결합니다.
          </p>
          <div className="mt-9">
            <HeroCtaRow isMember={isMember} />
          </div>
          <p className="mt-5 text-[12px] font-normal text-white/50">기업의 채용 정보와 상담 내용은 비공개로 관리됩니다.</p>
        </BusinessImageBand>

        {/* .reveal은 섹션이 아니라 안쪽 콘텐츠에 건다 — 섹션에 걸면 배경면째로 떠올라
            바탕색이 위아래 섹션과 함께 흔들린다. BusinessSection이 쥔 app-shell--default에
            직접 클래스를 줄 수 없어(공용 컴포넌트) 안쪽 래퍼 한 겹으로 같은 결과를 만든다. */}
        {/* ≤760px pb-0 — 풀블리드 이미지 띠가 이 섹션의 마지막 요소라, 섹션 하단 py(72px)가 띠
            아래에 흰 면으로 한 겹 더 깔리고 그 아래 직무 섹션의 pt(72px)가 또 붙어 여백이 두 번
            들어갔다. 띠는 아래 섹션과 바로 맞닿는 것이 맞다(위 여백 mt-9는 콘텐츠→띠 간격이라 유지).
            BusinessSection의 py는 축약형이라 pb만 따로 끌 수 없어 호출부에서 덮는다 —
            생성 CSS에서 pb-0이 py 뒤에 와 이긴다(Tailwind의 padding 속성 정렬 순서). */}
        <BusinessSection tone="light" className="max-[760px]:px-0 max-[760px]:pb-0">
          <div className="reveal">
          <div className="text-center">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">WHY THE PHARMA</p>
            <h2 className="mt-[14px] font-bold text-[#17202c] tracking-[-0.04em]" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.22 }}>더파마 헤드헌팅이 특별한 이유</h2>
          </div>
          {/* 3분할은 세로 칸막이 선이 세 항목을 가르는 구조라, 1열로 접히면(≤900px) 선이 사라지고
              32px 간격만 남아 세 덩이를 구분하는 요소가 아무것도 없다. ≤760px에서는 아래 번호
              리스트로 교체한다(reasons 하나를 두 렌더가 공유). 761~900px 구간은 종전 그대로다. */}
          <div className="mt-10 grid grid-cols-3 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[760px]:hidden">
            {reasons.map((reason, index) => {
              const isFirst = index === 0;
              const isLast = index === reasons.length - 1;
              return (
                <div
                  key={reason.number}
                  className={[
                    isFirst ? "pr-8 max-[900px]:pr-0" : "",
                    isLast ? "pl-8 max-[900px]:pl-0" : "",
                    !isFirst && !isLast ? "pl-8 pr-8 max-[900px]:pl-0 max-[900px]:pr-0" : "",
                    index > 0 ? "border-l-[0.5px] border-[#e0e0e0] max-[900px]:border-l-0" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <h3 className="mt-0 text-[22px] font-bold leading-[1.3] tracking-[-0.02em] text-[#17202c]">{reason.title}</h3>
                  <p className="mt-2 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{reason.description}</p>
                </div>
              );
            })}
          </div>
          {/* ≤760px 번호 구분선 리스트. 데이터에만 있고 여태 렌더되지 않던 number를 여기서 처음 쓴다 —
              가로 칸막이가 사라진 자리를 번호 열과 가로선이 대신한다.
              번호는 tabular-nums로 폭을 고정해 세 행의 제목 시작선이 어긋나지 않게 한다. */}
          <div className="mt-8 hidden text-left max-[760px]:block">
            {reasons.map((reason, index) => {
              const isLast = index === reasons.length - 1;
              return (
                <div
                  key={reason.number}
                  className={["flex border-t border-border py-[16px]", isLast ? "border-b" : ""].filter(Boolean).join(" ")}
                >
                  <span className="w-6 shrink-0 text-[13px] font-semibold tabular-nums leading-[1.4] text-[#0D7369]">{reason.number}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-keep text-[14px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#0a0a0a]">{reason.title}</h3>
                    <p className="mt-1 break-keep text-[12.5px] font-normal leading-[1.6] text-[#737373]">{reason.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="relative mt-9 h-[200px] max-[640px]:h-[140px] overflow-hidden"
            style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url(/images/why-visual.jpg)",
                filter: "grayscale(1)",
                opacity: 0.35,
                WebkitMaskImage: "linear-gradient(180deg,transparent 0%,#000 55%,#000 100%)",
                maskImage: "linear-gradient(180deg,transparent 0%,#000 55%,#000 100%)",
              }}
            />
          </div>
          </div>
        </BusinessSection>

        <BusinessSection tone="muted" className="!bg-[#fafafa] max-[760px]:px-0">
          <div className="reveal">
          <div className="text-center">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.06em] text-[#a3a3a3]">SPECIALIZED POSITIONS</p>
            <h2 className="mt-[14px] font-bold text-[#17202c] tracking-[-0.04em]" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.22 }}>
              {/* {" "}는 br이 숨는 폭(≤640px)에서 두 줄이 한 줄로 이어질 때의 어절 공백이다 —
                  JSX가 줄바꿈 앞뒤 공백을 지우므로 이게 없으면 "직무의전문인재를"로 붙는다.
                  아래 리드문·CTA 리드문이 이미 쓰는 것과 같은 자리(br 앞)에 둔다. */}
              제약·바이오 주요 직무의{" "}
              <br className="max-[640px]:hidden" />
              전문인재를 연결합니다.
            </h2>
            {/* ≤760px 16→14px — 섹션 리드는 타이틀과 본문 사이를 잇는 줄이라 좁은 폭에서
                본문(14px 안팎)과 같은 크기까지 내려도 위계가 유지된다. leading은 이미 1.6이라 그대로. */}
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] font-normal leading-[1.6] text-[#737373] max-[760px]:text-[14px]">
              사업 구조와 포지션별 요구 경험을 고려해{" "}
              <br className="max-[640px]:hidden" />
              실무자부터 임원급까지 적합한 후보자를 탐색합니다.
            </p>
          </div>
          {/* 이미지 카드 6장은 1열로 접히면 카드 하나가 250px 남짓이라 여섯 장이 1,600px을 넘는다 —
              사진이 294px 폭에서 크게 잘리기까지 해 스크롤만 길어진다. ≤760px에서는 아래 컴팩트
              리스트로 교체한다(specializedPositions 하나를 두 렌더가 공유).
              max-[760px]:grid-cols-1은 남겨 둔다 — "이미지 복원" 결정이 나면 아래 리스트와 이
              max-[760px]:hidden만 걷어 내면 종전 1열 카드가 그대로 살아난다. */}
          <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1 max-[760px]:hidden">
            {specializedPositions.map((position) => (
              <BusinessCard key={position.title} padding="none" className="overflow-hidden transition-[transform,box-shadow,border-color] duration-[220ms] hover:-translate-y-0.5 hover:border-[#111111] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <div className="h-[140px] overflow-hidden bg-[#f2f3f4]">
                  <img src={position.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="px-5 py-4">
                  <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#17202c]">{position.title}</h3>
                  <p className="mt-2 text-[13px] font-normal leading-[1.7] tracking-[-0.01em] text-[#8a94a3]">{position.tags}</p>
                </div>
              </BusinessCard>
            ))}
          </div>
          {/* ≤760px 컴팩트 리스트 — 흰 박스 하나에 여섯 행. 행 사이 선만 두고 카드 테두리는 겹치지 않는다. */}
          <div className="mt-8 hidden border border-[#e5e5e5] bg-white text-left max-[760px]:block">
            {specializedPositions.map((position, index) => (
              <div
                key={position.title}
                className={["px-4 py-[13px]", index > 0 ? "border-t border-border" : ""].filter(Boolean).join(" ")}
              >
                <h3 className="text-[13px] font-semibold leading-[1.4] tracking-[-0.01em] text-[#0a0a0a]">{position.title}</h3>
                <p className="mt-1 break-keep text-[11.5px] font-normal leading-[1.5] text-[#8a94a3]">{position.tags}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] font-normal text-[#68717e] max-[760px]:mt-6">
            제약사·바이오텍·CRO·CDMO·의료기기·헬스케어 기업의 채용을 지원합니다.
          </p>
          </div>
        </BusinessSection>

        <BusinessSection tone="dark" className="!bg-[#1a1d1c] max-[760px]:px-0">
          <div className="reveal">
          <div className="text-center">
            {/* 다크 섹션 eyebrow. text-white/55 = rgba(255,255,255,0.55) — 종전 인라인 색과 같은 값이다. */}
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/55">PROCESS</p>
            <h2 className="mt-[14px] font-semibold text-white" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.25, letterSpacing: "-0.04em" }}>
              채용 의뢰부터 입사까지
              <br />
              더파마가 함께합니다.
            </h2>
          </div>

          {/* ≤760px 32px — WHY·직무의 모바일 리스트와 같은 머리-본문 간격으로 맞춘다(데스크톱 54px 유지). */}
          <div className="relative mt-[54px] max-[760px]:mt-8">
            {/* Horizontal connecting line — desktop only.
                브레이크포인트는 이 페이지의 760 단일 기준을 쓴다(종전 md=768은 761~768px에서
                4열 그리드만 먼저 켜져 연결선과 어긋났다). */}
            <div
              className="pointer-events-none absolute hidden min-[761px]:block"
              style={{
                top: "12px",
                left: "calc(12.5% - 7.5px)",
                right: "calc(12.5% - 7.5px)",
                height: "1px",
                background: "linear-gradient(90deg, rgba(31,191,146,0.5) 0%, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0.16) 82%, rgba(31,191,146,0.5) 100%)",
                zIndex: 0,
              }}
            />

            {/* 4단계를 잇는 것은 위 가로선인데 그 선이 ≤760px에서 꺼지고, 마커·텍스트가 전부
                가운데 정렬이라 1열에서는 넉 덩이가 순서 없이 반복되는 것으로만 읽힌다.
                ≤760px에서는 아래 세로 타임라인으로 교체한다(processSteps 하나를 두 렌더가 공유). */}
            <div className="grid grid-cols-1 gap-8 min-[761px]:grid-cols-4 min-[761px]:gap-5 max-[760px]:hidden">
              {processSteps.map((step, index) => {
                const isLast = index === processSteps.length - 1;
                return (
                  <div key={step.number} className="flex flex-col items-center">
                    <div
                      className="relative z-10 flex items-center justify-center"
                      style={{
                        width: 25,
                        height: 25,
                        background: "#1FBF92",
                        borderRadius: 0,
                        boxShadow: isLast
                          ? "0 0 0 5px rgba(31,191,146,0.18)"
                          : "0 0 0 5px rgba(31,191,146,0.12)",
                      }}
                    >
                      {isLast ? (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4.5L4.5 8L11 1" stroke="#1a1d1c" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
                        </svg>
                      ) : (
                        <div style={{ width: 7, height: 7, background: "#1a1d1c" }} />
                      )}
                    </div>

                    <div className="mt-5 text-center">
                      <p style={{ color: "#23D9A5", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em" }}>
                        STEP {step.number}
                      </p>
                      <h3 className="mt-2" style={{ color: "#ffffff", fontSize: 17, fontWeight: 500, letterSpacing: "-0.01em" }}>
                        {step.title}
                      </h3>
                      <p className="mt-1.5" style={{ color: "#aeb4b2", fontSize: 13, lineHeight: 1.7 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ≤760px 세로 타임라인. 마커는 네 단계 모두 같은 형태로 통일한다 — 데스크톱은 가로선이
                진행 방향을 그려 주지만 세로 1열에서는 레일 자체가 순서를 말하므로, 04만 체크로 다르면
                "마지막"이 아니라 "완료된 것"으로 읽힌다(데스크톱 벌은 종전대로 체크를 유지).
                연결선은 마지막 행에만 없다 — 레일이 끝나는 자리가 곧 과정의 끝이다. */}
            <div className="hidden text-left max-[760px]:block">
              {processSteps.map((step, index) => {
                const isLast = index === processSteps.length - 1;
                return (
                  <div key={step.number} className="flex gap-4">
                    <div className="flex w-6 shrink-0 flex-col items-center">
                      <span aria-hidden="true" className="grid h-6 w-6 shrink-0 place-items-center bg-[#23D9A5]">
                        <span className="block h-2 w-2 bg-[#0a0a0a]" />
                      </span>
                      {!isLast && (
                        <span
                          aria-hidden="true"
                          className="w-px flex-1"
                          style={{ background: "linear-gradient(180deg, rgba(35,217,165,0.5), rgba(255,255,255,0.15))" }}
                        />
                      )}
                    </div>
                    <div className={isLast ? "min-w-0 flex-1" : "min-w-0 flex-1 pb-6"}>
                      <p className="text-[11px] font-semibold tabular-nums tracking-[.08em] text-[#7fcdb9]">STEP {step.number}</p>
                      <h3 className="mt-1.5 break-keep text-[14.5px] font-semibold leading-[1.4] tracking-[-0.01em] text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 break-keep text-[12.5px] font-normal leading-[1.6] text-[#a8adaa]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </BusinessSection>

        {/* ══ CLOSING CTA ══════════════════════════════════════ */}
        {/* 구분선 규칙(인접 섹션의 배경이 같을 때만 아래 섹션 상단에 선을 둔다): 위 PROCESS와
            이 섹션은 같은 #1a1d1c라 규칙상 선이 필요한 자리다. 아래 3px 그라데이션 띠가 그 경계를
            이미 긋고 있으므로 1px 선을 겹쳐 두지 않는다 — 같은 자리에 경계가 두 번 그어진다.
            나머지 인접(히어로→WHY, WHY→직무, 직무→PROCESS)은 배경이 모두 달라 선이 없다. */}
        <section className="relative overflow-hidden bg-[#1a1d1c] px-6 text-center text-white max-[760px]:px-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[.32]"
            style={{
              backgroundImage: "url(/images/headhunting-hero.jpg)",
              WebkitMaskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
              maskImage: "linear-gradient(180deg,transparent,#000 40%,#000 70%,transparent)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] opacity-[.65]"
            style={{ background: "var(--gradient-cta)" }}
          />
          <div className="app-shell--default relative z-10 py-[96px] max-[760px]:py-[72px]">
            <h2
              className="font-semibold text-white"
              style={{ fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.04em", lineHeight: 1.22 }}
            >
              채용공고만으로 찾기 어려운 인재,
              <br />
              더파마와 함께 찾아보세요.
            </h2>
            {/* ≤760px 16→14px. leading은 값이 없어 body의 1.65를 물려받고 있었으므로
                다른 리드와 같은 1.6을 좁은 폭에서만 명시한다. */}
            <p className="mx-auto mt-[14px] max-w-[52ch] text-[16px] text-[#c4c8c6] max-[760px]:text-[14px] max-[760px]:leading-[1.6]">
              채용 직무와 필요 경력을 남겨주시면{" "}
              <br className="max-[640px]:hidden" />
              담당자가 진행 방법을 안내드립니다.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ClosingCtaRow isMember={isMember} />
            </div>
            <p className="mx-auto mt-5 max-w-[52ch] text-[12px] font-normal text-white/50">
              상담 신청 단계에서는 비용이 발생하지 않으며, 진행 조건과 비용은 상담 후 안내드립니다.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
