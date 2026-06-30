"use client";

import { BusinessImageBand, BusinessCard, BusinessSection } from "@/components/business/BusinessMarketingSections";
import { BusinessHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, SectionIntro, typeScale } from "@/components/ui/Typography";
import { companyExampleImages } from "@/config/companyImages";
import { useBusinessMember } from "@/hooks/useBusinessMember";

const reasons = [
  {
    number: "01",
    title: "제약·바이오 산업 전문성",
    description: "기업의 사업 영역과 개발 단계, 채용 직무의 특성을 이해하고 후보자를 탐색합니다.",
  },
  {
    number: "02",
    title: "업계 네트워크 기반 탐색",
    description: "더파마뉴스와 더파마 리크루트를 통해 형성된 산업 접점을 기반으로 인재를 찾습니다.",
  },
  {
    number: "03",
    title: "적합도 중심의 인재추천",
    description: "경력과 직무 경험, 이직 의사를 확인한 후보자를 선별해 추천합니다.",
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
  { number: "01", title: "채용 컨설팅", description: "채용 배경과 조직의 상황을 이해하고, 포지션의 역할과 핵심 역량을 구체화합니다." },
  { number: "02", title: "후보자 탐색", description: "축적된 인재풀과 업계 네트워크를 바탕으로 포지션에 적합한 후보자를 발굴합니다." },
  { number: "03", title: "후보자 추천", description: "경력과 역량, 조직 적합도와 이직 의사를 검증한 인재를 엄선해 추천합니다." },
  { number: "04", title: "면접 및 입사 지원", description: "면접 일정과 피드백 조율부터 처우 협의, 최종 입사까지 전 과정을 세심하게 지원합니다." },
];

function HeroCtaRow({ isMember }: { isMember: boolean }) {
  if (isMember) {
    return (
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/business/headhunting/manage/new" variant="gradient" size="lg">
          인재추천 의뢰하기
        </LinkButton>
        <LinkButton href="/business/headhunting/manage" variant="secondary" tone="dark" size="lg">
          서비스 소개자료 받기
        </LinkButton>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-3">
      <LinkButton href="/business/signup" variant="gradient" size="lg">
        인재추천 의뢰하기
      </LinkButton>
      <LinkButton href="/business/support" variant="secondary" tone="dark" size="lg">
        서비스 소개자료 받기
      </LinkButton>
    </div>
  );
}

export function BusinessHeadhuntingIntroClient() {
  const isMember = useBusinessMember();

  return (
    <>
      <BusinessHeader />
      <main>
        <BusinessImageBand image={companyExampleImages.headhuntingHero} gradient="horizontal" variant="hero">
          <p className="text-[12px] font-medium uppercase tracking-[0.08em]" style={{ color: "#7fcdb9" }}>THE PHARMA HEADHUNTING</p>
          <h1
            className="mt-4 max-w-[980px] text-white"
            style={{ fontSize: "clamp(36px, 5.2vw, 58px)", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.045em" }}
          >
            제약·바이오·약국·병원 채용은
            <br />
            산업을 이해하는 파트너에게 맡기세요.
          </h1>
          <p className="mt-6 max-w-[75ch] text-[17px] font-normal leading-[1.7] text-[#c4c8c6]">
            채용공고만으로 만나기 어려운 인재, 더파마가 찾아드립니다.<br />
            연구개발부터 임상, 사업개발, 생산·품질까지 기업이 찾는 인재를 직접 발굴해 연결합니다.
          </p>
          <div className="mt-9">
            <HeroCtaRow isMember={isMember} />
          </div>
          <p className="mt-5 text-[12px] font-normal text-white/50">기업의 채용 정보와 상담 내용은 비공개로 관리됩니다.</p>
        </BusinessImageBand>

        <BusinessSection tone="light">
          <div className="text-center">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#a3a3a3" }}>WHY THE PHARMA</p>
            <h2 className="mt-[14px] font-bold text-[#17202c] tracking-[-0.02em]" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.22 }}>더파마 헤드헌팅이 특별한 이유</h2>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
            {reasons.map((reason) => (
              <BusinessCard key={reason.number} padding="lg" className="!bg-[#fafafa] transition-[transform,box-shadow] duration-[220ms] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <p className="text-[22px] font-bold text-[#b8c2d0]">{reason.number}</p>
                <h3 className="mt-3 text-[20px] font-bold tracking-[-0.02em] text-[#17202c]">{reason.title}</h3>
                <p className="mt-2 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{reason.description}</p>
              </BusinessCard>
            ))}
          </div>
        </BusinessSection>

        <BusinessSection tone="muted" className="!bg-[#fafafa]">
          <div className="text-center">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "#a3a3a3" }}>SPECIALIZED POSITIONS</p>
            <h2 className="mt-[14px] font-bold text-[#17202c] tracking-[-0.02em]" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.22 }}>
              제약·바이오 주요 직무의
              <br className="max-[640px]:hidden" />
              전문인재를 연결합니다.
            </h2>
            <p className="mx-auto mt-[14px] max-w-[52ch] text-center text-[16px] font-normal leading-[1.6] text-[#737373]">
              산업계부터 보건의료인까지, 기업의 사업 구조와 포지션별 요구 경험을 고려해{" "}
              <br className="max-[640px]:hidden" />
              실무자부터 팀장·임원급까지 적합한 후보자를 탐색합니다.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
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
          <p className="mt-8 text-center text-[13px] font-normal text-[#68717e]">
            제약회사, 바이오텍, CRO, CDMO, 의료기기 및 헬스케어 기업의 채용을 지원합니다.
          </p>
        </BusinessSection>

        <BusinessSection tone="dark" className="!bg-[#1a1d1c]">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: "rgba(255,255,255,0.55)" }}>PROCESS</p>
            <h2 className="mt-[14px] font-semibold text-white" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
              인재 채용의 시작부터 최종 입사까지
              <br />
              더파마가 전 과정을 정교하게 설계합니다.
            </h2>
          </div>

          <div className="relative mt-[54px]">
            {/* Horizontal connecting line — desktop only */}
            <div
              className="pointer-events-none absolute hidden md:block"
              style={{
                top: "12px",
                left: "calc(12.5% - 7.5px)",
                right: "calc(12.5% - 7.5px)",
                height: "1px",
                background: "linear-gradient(90deg, rgba(31,191,146,0.5) 0%, rgba(255,255,255,0.16) 18%, rgba(255,255,255,0.16) 82%, rgba(31,191,146,0.5) 100%)",
                zIndex: 0,
              }}
            />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-5">
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
          </div>
        </BusinessSection>

        <BusinessImageBand image={companyExampleImages.workspace} gradient="vertical" align="center">
          <h2 className="font-bold tracking-[-0.02em] text-white" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.22 }}>
            채용공고만으로 찾기 어려운 인재,
            <br />
            더파마와 함께 찾아보세요.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[14px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
            채용 직무와 필요한 경력을 남겨주시면{" "}
            <br className="max-[640px]:hidden" />
            담당자가 확인 후 적합한 진행 방법을 안내드립니다.
          </p>
          <div className="mt-8 flex justify-center">
            <HeroCtaRow isMember={isMember} />
          </div>
          <p className="mt-5 text-[12px] font-normal text-white/50">
            상담 신청 단계에서는 별도의 비용이 발생하지 않습니다. 구체적인 진행 조건과 비용은 상담 후 안내드립니다.
          </p>
        </BusinessImageBand>
      </main>
    </>
  );
}
