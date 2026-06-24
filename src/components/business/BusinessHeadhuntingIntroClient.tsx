"use client";

import { BusinessImageBand, BusinessCard, BusinessSection } from "@/components/business/BusinessMarketingSections";
import { BusinessPublicHeader } from "@/components/business/BusinessHeaders";
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
  { number: "01", title: "채용 상담", description: "채용 배경, 주요 업무와 필요한 경력을 확인합니다." },
  { number: "02", title: "후보자 탐색", description: "인재풀과 업계 네트워크를 통해 적합한 후보자를 발굴합니다." },
  { number: "03", title: "후보자 추천", description: "경력과 포지션 적합도, 이직 의사를 확인한 인재를 추천합니다." },
  { number: "04", title: "면접 및 채용", description: "면접 일정과 피드백, 처우 협의와 입사 과정을 지원합니다." },
];

function HeroCtaRow({ isMember }: { isMember: boolean }) {
  if (isMember) {
    return (
      <div className="flex flex-wrap gap-3">
        <LinkButton href="/business/headhunting/manage/new" variant="gradient" size="lg">
          새 헤드헌팅 의뢰
        </LinkButton>
        <LinkButton href="/business/headhunting/manage" variant="secondary" tone="dark" size="lg">
          내 의뢰 현황 보기
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
      <BusinessPublicHeader />
      <main>
        <BusinessImageBand image={companyExampleImages.culture} gradient="horizontal" variant="hero">
          <Eyebrow tone="dark">THE PHARMA HEADHUNTING</Eyebrow>
          <h1 className={`mt-4 max-w-[980px] text-white ${typeScale.heroTitle}`}>
            제약·바이오 채용은
            <br />
            산업을 이해하는 파트너에게 맡기세요.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
            채용공고만으로 만나기 어려운 인재, 더파마가 찾아드립니다. 연구개발부터 임상, 허가, 사업개발, 생산·품질까지 기업이 찾는 인재를 이해하고 직접 발굴해 연결합니다.
          </p>
          <div className="mt-9">
            <HeroCtaRow isMember={isMember} />
          </div>
          <p className="mt-5 text-[12px] font-normal text-white/50">기업의 채용 정보와 상담 내용은 비공개로 관리됩니다.</p>
        </BusinessImageBand>

        <BusinessSection tone="light">
          <SectionIntro eyebrow="WHY THE PHARMA" title="더파마 헤드헌팅이 특별한 이유" />
          <div className="mt-10 grid grid-cols-3 gap-5 max-[900px]:grid-cols-1">
            {reasons.map((reason) => (
              <BusinessCard key={reason.number} padding="lg">
                <p className="text-[22px] font-bold text-[#cfd8e3]">{reason.number}</p>
                <h3 className={`mt-3 text-[#17202c] ${typeScale.cardTitle}`}>{reason.title}</h3>
                <p className="mt-2 text-[13px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{reason.description}</p>
              </BusinessCard>
            ))}
          </div>
        </BusinessSection>

        <BusinessSection tone="muted">
          <SectionIntro
            eyebrow="SPECIALIZED POSITIONS"
            title={
              <>
                제약·바이오 주요 직무의
                <br className="max-[640px]:hidden" />
                전문인재를 연결합니다.
              </>
            }
            description="산업계부터 보건의료인까지, 기업의 사업 구조와 포지션별 요구 경험을 고려해 실무자부터 팀장·임원급까지 적합한 후보자를 탐색합니다."
          />
          <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
            {specializedPositions.map((position) => (
              <BusinessCard key={position.title} padding="none" className="overflow-hidden transition hover:border-[#111111]">
                <div className="h-[140px] overflow-hidden bg-[#f2f3f4]">
                  <img src={position.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="px-5 py-4">
                  <h3 className={`text-[#17202c] ${typeScale.cardTitle}`}>{position.title}</h3>
                  <p className="mt-2 text-[12px] font-normal leading-[1.7] tracking-[-0.01em] text-[#8a94a3]">{position.tags}</p>
                </div>
              </BusinessCard>
            ))}
          </div>
          <p className="mt-8 text-center text-[13px] font-normal text-[#68717e]">
            제약회사, 바이오텍, CRO, CDMO, 의료기기 및 헬스케어 기업의 채용을 지원합니다.
          </p>
        </BusinessSection>

        <BusinessSection tone="dark">
          <SectionIntro
            tone="dark"
            eyebrow="PROCESS"
            title={
              <>
                채용 의뢰부터 입사까지
                <br className="max-[640px]:hidden" />
                더파마가 함께합니다.
              </>
            }
          />
          <div className="mt-10 grid grid-cols-4 gap-5 max-[900px]:grid-cols-2 max-[520px]:grid-cols-1">
            {processSteps.map((step) => (
              <BusinessCard key={step.number}>
                <p className="text-[20px] font-bold text-[#111111]">{step.number}</p>
                <h3 className="mt-3 text-[15px] font-bold tracking-[-0.02em] text-[#17202c]">{step.title}</h3>
                <p className="mt-2 text-[12px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{step.description}</p>
              </BusinessCard>
            ))}
          </div>
        </BusinessSection>

        <BusinessImageBand image={companyExampleImages.workspace} gradient="vertical" align="center">
          <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.02em] text-white max-[640px]:text-[21px]">
            채용공고만으로 찾기 어려운 인재,
            <br />
            더파마와 함께 찾아보세요.
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[14px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
            채용 직무와 필요한 경력을 남겨주시면 담당자가 확인 후 적합한 진행 방법을 안내드립니다.
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
