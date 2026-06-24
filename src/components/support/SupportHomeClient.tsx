"use client";

import clsx from "clsx";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { BusinessImageBand } from "@/components/business/BusinessMarketingSections";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, typeScale } from "@/components/ui/Typography";
import { heroImages } from "@/config/companyImages";

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  title: string;
  description: string;
  items: FaqItem[];
}

const faqGroups: FaqGroup[] = [
  {
    id: "personal",
    title: "개인회원",
    description: "구직 · 지원 · 이력서 이용 안내",
    items: [
      {
        category: "이력서",
        question: "약사면허증은 어떻게 등록하나요?",
        answer:
          "마이페이지 > 이력서 관리에서 면허증 첨부 필드를 통해 업로드합니다. 등록된 면허증은 관리자 검토 후 인증 배지가 부여되며, 검토는 영업일 기준 1일 이내 완료됩니다.",
      },
      {
        category: "지원·합격",
        question: "지원한 공고를 취소할 수 있나요?",
        answer: "마이페이지 > 지원 현황에서 지원 취소를 선택합니다. 단, 기업이 이미 서류를 열람한 경우 취소가 제한될 수 있습니다.",
      },
      {
        category: "지원·합격",
        question: "지원 현황 단계별 의미가 궁금해요.",
        answer: "지원 → 열람 → 검토 → 면접 → 최종 순으로 진행됩니다. 각 단계는 기업 처리에 따라 자동 갱신되며, 변경 시 알림으로 안내드립니다.",
      },
      {
        category: "회원·계정",
        question: "비밀번호를 잊어버렸어요.",
        answer: "로그인 화면의 아이디·비밀번호 찾기에서 가입 시 등록한 이메일로 재설정 링크를 받을 수 있습니다.",
      },
      {
        category: "채용정보",
        question: "채용 캘린더의 마감일은 어떻게 표시되나요?",
        answer: "공고의 마감일시를 기준으로 캘린더에 자동 배치됩니다. 관심 등록한 공고는 내 관심 보기에서 마감 임박 순으로 모아볼 수 있습니다.",
      },
    ],
  },
  {
    id: "business",
    title: "기업회원",
    description: "공고 등록 · 헤드헌팅 · 인재검색 이용 안내",
    items: [
      {
        category: "공고관리",
        question: "공고 등록은 어떻게 하나요?",
        answer:
          "기업회원 로그인 후 채용관리 > 공고 등록에서 작성합니다. 마감일시를 입력하면 채용 캘린더에 자동 노출되며, 직군·직무는 등록 시 선택한 분류 기준으로 필터링됩니다.",
      },
      {
        category: "헤드헌팅",
        question: "헤드헌팅을 의뢰하고 싶어요.",
        answer: "상단 헤드헌팅 메뉴에서 의뢰서를 작성하면 담당 컨설턴트가 배정됩니다. 직무·인원·희망 조건을 남겨주시면 영업일 기준 1~2일 내 연락드립니다.",
      },
      {
        category: "인재검색",
        question: "인재검색 서비스를 이용하려면?",
        answer: "인재정보 메뉴에서 직무·경력·자격 조건으로 후보자를 검색할 수 있습니다. 열람권은 결제 후 활성화됩니다.",
      },
      {
        category: "회원·계정",
        question: "사업자등록번호 인증이 되지 않아요.",
        answer:
          "국세청 정보와 사업자등록번호가 일치하는지 확인해주세요. 휴·폐업 상태이거나 형식이 다르면 인증이 제한됩니다. 반복 실패 시 문서확인번호로 수동 인증이 가능합니다.",
      },
      {
        category: "결제",
        question: "세금계산서는 어떻게 발급받나요?",
        answer: "결제 완료 후 채용관리 > 결제 내역에서 신청하면 등록된 사업자 정보로 발급됩니다.",
      },
    ],
  },
];

function FaqAccordion({ groupId, items }: { groupId: string; items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) {
    return <p className="py-4 text-[13px] font-normal text-[#a0a9b7]">검색 결과가 없습니다.</p>;
  }

  return (
    <div className="divide-y divide-[#edf1f5]">
      {items.map((item, index) => {
        const open = openIndex === index;
        const triggerId = `${groupId}-faq-trigger-${index}`;
        const panelId = `${groupId}-faq-panel-${index}`;

        return (
          <div key={`${item.question}-${index}`}>
            <button
              id={triggerId}
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenIndex(open ? null : index)}
              className="group flex w-full items-start justify-between gap-4 py-4 text-left transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a94a3]">{item.category}</span>
                <span
                  className={clsx(
                    "mt-1.5 block text-[14px] font-semibold leading-[1.5] tracking-[-0.01em] transition-colors",
                    open ? "text-[#111111]" : "text-[#242b36] group-hover:text-[#111111]",
                  )}
                >
                  {item.question}
                </span>
              </span>
              <ChevronDown
                size={18}
                className={clsx(
                  "mt-0.5 shrink-0 text-[#8a94a3] transition-transform duration-300 group-hover:text-[#111111]",
                  open && "rotate-180 text-[#111111]",
                )}
              />
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className={clsx("grid transition-[grid-template-rows] duration-300 ease-in-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
            >
              <div className="overflow-hidden">
                <p className="pb-4 pr-8 text-[13px] font-normal leading-[1.75] tracking-[-0.01em] text-[#68717e]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SupportHomeClient() {
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const keyword = query.trim();
    if (!keyword) return faqGroups;
    return faqGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.question.includes(keyword) || item.category.includes(keyword)),
    }));
  }, [query]);

  return (
    <>
      <Header />
      <main className="bg-white pb-20">
        <BusinessImageBand image={heroImages.support} gradient="vertical" align="center" variant="hero">
          <Eyebrow tone="dark" align="center">
            THE PHARMA · HELP CENTER
          </Eyebrow>
          <h1 className={`mt-4 text-white ${typeScale.heroTitle}`}>무엇을 도와드릴까요?</h1>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] font-normal leading-[1.75] tracking-[-0.01em] text-white/72">
            개인회원과 기업회원이 함께 이용하는 통합 고객센터입니다.
          </p>
          <div className="mx-auto mt-8 flex h-14 max-w-[560px] items-center gap-3 border border-white/15 bg-white px-5 shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition focus-within:border-[#111111]">
            <Search size={19} className="shrink-0 text-[#8a94a3]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="예) 이력서 등록, 지원 취소, 공고 등록 방법"
              className="min-w-0 flex-1 bg-transparent text-[15px] font-normal text-[#242b36] outline-none placeholder:text-[#a0a9b7]"
            />
          </div>
        </BusinessImageBand>

        <div className="app-shell--default">
          <div className="mt-10 grid grid-cols-2 gap-5 max-[900px]:grid-cols-1">
            {filteredGroups.map((group) => (
              <section key={group.id} className="border border-[#dfe4ea] bg-white p-6">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 bg-[#111111]" />
                  <h2 className="text-[18px] font-bold tracking-[-0.02em] text-[#17202c]">{group.title}</h2>
                </div>
                <p className="mt-1.5 text-[13px] font-normal text-[#8a94a3]">{group.description}</p>

                <div className="mt-4">
                  <FaqAccordion groupId={group.id} items={group.items} />
                </div>
              </section>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-[1fr_1fr_1.2fr] gap-5 border border-[#dfe4ea] bg-[#fbfcfd] p-6 max-[760px]:grid-cols-1">
            <div>
              <p className="text-[13px] font-medium text-[#8a94a3]">평균 답변 소요</p>
              <p className="mt-1.5 text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">영업일 기준 1~2일</p>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#8a94a3]">운영 시간</p>
              <p className="mt-1.5 text-[18px] font-bold tracking-[-0.01em] text-[#17202c]">평일 10:00 - 18:00</p>
            </div>
            <div className="flex items-center justify-between gap-4 max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-3">
              <p className="text-[13px] font-medium text-[#8a94a3]">원하는 답을 찾지 못하셨나요?</p>
              <LinkButton href="/support/contact" variant="gradient" size="md" className="shrink-0">
                1:1 문의하기
              </LinkButton>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
