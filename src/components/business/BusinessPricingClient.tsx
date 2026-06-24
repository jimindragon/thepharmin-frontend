"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { useState } from "react";
import { BusinessImageBand, BusinessCard, BusinessSection } from "@/components/business/BusinessMarketingSections";
import { BusinessPublicHeader } from "@/components/business/BusinessHeaders";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, SectionIntro, typeScale } from "@/components/ui/Typography";
import { companyExampleImages } from "@/config/companyImages";
import { useBusinessMember } from "@/hooks/useBusinessMember";

const heroHighlights = ["모든 트랙 공고 등록 무료", "약국 트랙 등록·게시 무료", "오픈 1년 입점 기업 부스트 최대 40% 할인"];

const freePostingRows = [
  { label: "약국", value: "공고 등록 및 게시 무료" },
  { label: "산업·연구·병원", value: "상시 공고 1건 무료 게시" },
];

const boostTiers = [
  { id: "none", label: "부스트 미적용", description: "기본 채용공고 목록에 노출", price: "무료" },
  { id: "1w", label: "부스트 1주", description: "단기간에 공고 노출을 높이고 싶을 때", originalPrice: "120,000원", price: "84,000원", discount: "30% 할인" },
  { id: "2w", label: "부스트 2주", description: "지원자를 확보하며 비용 부담을 낮출 때", originalPrice: "228,000원", price: "148,000원", discount: "35% 할인" },
  { id: "4w", label: "부스트 4주", description: "채용 기간이 길거나 다수 지원자가 필요할 때", originalPrice: "432,000원", price: "259,000원", discount: "40% 할인" },
];

const boostChecklist = ["트랙별 채용공고 목록 상단 노출", "'주목 공고' 배지 적용", "관련 직무 인재 대상 공고 알림 발송"];

const faqItems = [
  {
    question: "공고를 등록하면 부스트를 반드시 이용해야 하나요?",
    answer: "아닙니다. 공고 등록은 무료이며 부스트는 선택 상품입니다. 부스트를 이용하지 않은 공고도 기본 채용공고 목록에 정상적으로 노출됩니다.",
  },
  {
    question: "약국 공고에도 부스트를 적용할 수 있나요?",
    answer: "네. 약국 공고에도 부스트를 적용할 수 있습니다. 공고 등록과 게시는 무료이며, 더 많은 인재에게 빠르게 노출하고 싶을 때만 부스트를 선택하면 됩니다.",
  },
  {
    question: "오픈 1년 입점 혜택은 누구에게 적용되나요?",
    answer: "서비스 오픈일로부터 1년 이내 입점한 기업에 적용됩니다. 해당 기업은 확대된 무료 게시 혜택과 부스트 할인 혜택을 이용할 수 있습니다.",
  },
  {
    question: "프로모션 종료 후에도 공고를 무료로 등록할 수 있나요?",
    answer: "네. 무료 공고 등록 정책은 계속 유지됩니다. 산업·연구·병원 트랙은 트랙별 상시 1건을 무료로 게시할 수 있으며, 약국 트랙은 등록과 게시를 계속 무료로 이용할 수 있습니다.",
  },
  {
    question: "부스트 이용 기간 중 채용이 완료되면 어떻게 되나요?",
    answer: "채용이 완료된 공고는 언제든 마감할 수 있습니다. 이용 중인 부스트의 환불 및 잔여 기간 정책은 상품 이용 안내에서 확인할 수 있습니다.",
  },
];

export function BusinessPricingClient() {
  const isMember = useBusinessMember();
  const [selectedBoost, setSelectedBoost] = useState("none");

  const primaryCta = isMember ? { href: "/business/jobs/new", label: "무료로 공고 등록하기" } : { href: "/business/signup", label: "무료로 공고 등록하기" };
  const secondaryCta = isMember ? { href: "/support/contact", label: "고객센터에 문의하기" } : { href: "/business/support", label: "고객센터에 문의하기" };

  return (
    <>
      <BusinessPublicHeader />
      <main className="bg-white">
        <BusinessImageBand image={companyExampleImages.research} gradient="horizontal" variant="hero">
          <div className="flex items-start justify-between gap-12 max-[900px]:flex-col max-[900px]:gap-8">
            <div className="max-w-[560px]">
              <Eyebrow tone="dark">PRICING</Eyebrow>
              <h1 className={`mt-4 text-white ${typeScale.heroTitle}`}>
                채용의 시작,
                <br />
                공고 등록은 무료입니다.
              </h1>
              <p className="mt-5 text-[15px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
                제약·바이오·병원·약국 전문 인재를 위한 채용공고를 비용 없이 등록하세요. 더 많은 인재에게 빠르게 도달해야 할 때만 부스트를 선택해 공고 노출을 높일 수 있습니다.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <LinkButton href={primaryCta.href} variant="gradient" size="lg">
                  {primaryCta.label}
                </LinkButton>
                <LinkButton href={secondaryCta.href} variant="secondary" tone="dark" size="lg">
                  {secondaryCta.label}
                </LinkButton>
              </div>
            </div>
            <div className="shrink-0 space-y-3.5 max-[900px]:w-full">
              {heroHighlights.map((highlight) => (
                <div key={highlight} className="flex items-center gap-2.5 text-[13px] font-medium text-white/85">
                  <Check size={15} className="shrink-0 text-[#00a896]" />
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </BusinessImageBand>

        <BusinessSection tone="light">
          <SectionIntro
            eyebrow="HOW IT WORKS"
            title="무료로 등록하고, 필요할 때 노출을 높이세요"
            description="공고 등록은 무료입니다. 채용을 보다 빠르게 진행하고 싶을 때만 부스트를 선택해 목록 상단 노출과 인재 알림 혜택을 이용할 수 있습니다."
          />

          <div className="mt-10 grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
            <BusinessCard padding="lg">
              <span className="inline-flex h-6 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#596373]">기본 제공</span>
              <h3 className="mt-4 text-[24px] font-extrabold tracking-[-0.02em] text-[#17202c]">무료 공고 등록</h3>
              <p className="mt-2 text-[14px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">모든 채용 트랙에서 공고를 무료로 등록할 수 있습니다.</p>
              <div className="mt-5 divide-y divide-[#edf1f5] border-y border-[#edf1f5]">
                {freePostingRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                    <span className="font-medium text-[#303946]">{row.label}</span>
                    <span className="font-normal text-[#68717e]">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 border border-[#e3e7ed] bg-[#fbfcfd] p-3 text-[13px] font-normal leading-[1.65] text-[#596373]">
                서비스 오픈일로부터 1년 이내 입점한 기업은 프로모션 기간 동안 산업·연구·병원 트랙도 공고 수 제한 없이 무료로 게시할 수 있습니다.
              </p>
            </BusinessCard>

            <BusinessCard padding="lg">
              <span className="inline-flex h-6 items-center border border-[#cfd8e3] bg-[#f7f8fa] px-2.5 text-[12px] font-medium text-[#596373]">추가 노출 상품</span>
              <h3 className="mt-4 text-[24px] font-extrabold tracking-[-0.02em] text-[#17202c]">부스트</h3>
              <p className="mt-2 text-[13px] font-medium text-[#8a94a3]">① 적용할 공고 선택 → ② 이용 기간 선택</p>

              <div className="mt-5 space-y-2">
                {boostTiers.map((tier) => (
                  <label
                    key={tier.id}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 border px-4 py-3 transition",
                      selectedBoost === tier.id ? "border-[#111111] bg-[#fbfcfd]" : "border-[#e1e6ec] bg-white hover:border-[#bcc5cf]",
                    )}
                  >
                    <input
                      type="radio"
                      name="boost"
                      checked={selectedBoost === tier.id}
                      onChange={() => setSelectedBoost(tier.id)}
                      className="h-4 w-4 accent-[#111111]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-[#303946]">{tier.label}</span>
                      <span className="block text-[13px] font-normal text-[#8a94a3]">{tier.description}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {tier.discount ? <span className="mr-2 inline-flex h-6 items-center bg-[#e8f0fc] px-2 text-[12px] font-medium text-[#337ddf]">{tier.discount}</span> : null}
                      {tier.originalPrice ? <span className="mr-1.5 text-[13px] font-normal text-[#b6bec9] line-through">{tier.originalPrice}</span> : null}
                      <span className="text-[16px] font-bold text-[#17202c]">{tier.price}</span>
                    </span>
                  </label>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-[#edf1f5] pt-4">
                {boostChecklist.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[13px] font-normal text-[#4f5967]">
                    <Check size={14} className="text-[#111111]" />
                    {item}
                  </div>
                ))}
              </div>
            </BusinessCard>
          </div>
        </BusinessSection>

        <section className="bg-[#050505] px-6 py-16 text-white max-[760px]:py-11">
          <div className="app-shell--default flex items-center justify-between gap-8 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-5">
            <div>
              <span className="inline-flex h-6 items-center border border-[#337ddf]/40 bg-[#337ddf]/10 px-2.5 text-[11px] font-medium text-[#6fa3ec]">
                서비스 오픈 1년 한정
              </span>
              <h2 className="mt-3 max-w-[560px] text-[31px] font-extrabold leading-[1.3] tracking-[-0.02em] text-white">지금 입점하면 부스트를 최대 40% 할인받을 수 있습니다</h2>
              <p className="mt-3 max-w-[560px] text-[13px] font-normal leading-[1.75] tracking-[-0.01em] text-white/65">
                서비스 오픈일로부터 1년 이내 입점한 기업에는 모든 부스트 상품의 할인 혜택이 적용됩니다. 현재 표시된 부스트 금액에는 입점 할인 혜택이 반영되어 있습니다.
              </p>
            </div>
            <div className="shrink-0 text-right max-[760px]:text-left">
              <p className="text-[44px] font-bold leading-none tracking-[-0.02em] text-[#337ddf]">-40%</p>
              <p className="mt-2 text-[12px] font-normal text-white/55">이용 기간이 길수록 더 높은 할인율이 적용됩니다</p>
            </div>
          </div>
        </section>

        <BusinessSection tone="light">
          <SectionIntro eyebrow="GOOD TO KNOW" title="자주 묻는 질문" />
          <div className="mt-10 grid grid-cols-2 gap-5 max-[760px]:grid-cols-1">
            {faqItems.map((item) => (
              <BusinessCard key={item.question}>
                <h3 className="text-[15px] font-bold tracking-[-0.02em] text-[#17202c]">{item.question}</h3>
                <p className="mt-2 text-[13px] font-normal leading-[1.7] tracking-[-0.01em] text-[#68717e]">{item.answer}</p>
              </BusinessCard>
            ))}
          </div>
        </BusinessSection>

        <BusinessImageBand image={companyExampleImages.office} gradient="vertical" align="center">
          <h2 className="text-[28px] font-bold leading-[1.35] tracking-[-0.02em] text-white max-[640px]:text-[21px]">비용 부담 없이 첫 공고를 등록해 보세요</h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[14px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
            공고 등록은 무료입니다. 추가 노출이 필요한 경우 언제든 부스트를 적용할 수 있습니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <LinkButton href={primaryCta.href} variant="gradient" size="lg">
              {primaryCta.label}
            </LinkButton>
            <LinkButton href={secondaryCta.href} variant="secondary" tone="dark" size="lg">
              {secondaryCta.label}
            </LinkButton>
          </div>
          <p className="mt-5 text-[12px] font-normal text-white/50">표시된 금액은 VAT 별도이며, 서비스 오픈 1년 입점 할인 혜택이 반영된 가격입니다.</p>
        </BusinessImageBand>
      </main>
    </>
  );
}
