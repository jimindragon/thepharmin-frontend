"use client";

import { ArrowLeft, ChevronDown, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { FieldLabel, SectionCard, TextInput } from "@/components/business/BusinessFormControls";
import { industryJobCategoryOptions } from "@/config/jobFilters";
import { initialIndustryOrgManager } from "@/data/businessCompanyProfile";

export function BusinessHeadhuntingNewClient() {
  const [positionTitle, setPositionTitle] = useState("");
  const [jobCategoryId, setJobCategoryId] = useState("");
  const [jobSubcategoryId, setJobSubcategoryId] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [experienceCondition, setExperienceCondition] = useState("");
  const [requirements, setRequirements] = useState("");
  const [managerName, setManagerName] = useState(initialIndustryOrgManager.managerName);
  const [submitted, setSubmitted] = useState(false);

  const jobSubcategoryOptions =
    industryJobCategoryOptions.find((category) => category.id === jobCategoryId)?.subcategories ?? [];

  const isValid =
    positionTitle.trim().length > 0 &&
    jobCategoryId.trim().length > 0 &&
    jobSubcategoryId.trim().length > 0 &&
    managerName.trim().length > 0;

  if (submitted) {
    return (
      <BusinessCenterShell>
        <section className="mx-auto max-w-[640px] border border-border bg-white p-10 text-center">
          <p className="text-[12px] font-medium text-[#111111]">접수 완료</p>
          <h1 className="mt-3 text-[26px] font-bold tracking-[-0.02em] text-[#17202c]">헤드헌팅 의뢰가 접수되었습니다.</h1>
          <p className="mt-3 text-[13px] font-normal leading-[1.8] text-[#68717e]">
            담당 매니저가 의뢰 내용을 검토한 후 1~2영업일 내에 추천 후보자 탐색을 시작합니다.
          </p>
          <Link
            href="/business/headhunting/manage"
            className="mt-7 inline-flex h-11 items-center justify-center bg-[#111111] px-6 text-[13px] font-medium text-white hover:bg-[#2a2a2a]"
          >
            헤드헌팅 관리로 이동
          </Link>
        </section>
      </BusinessCenterShell>
    );
  }

  return (
    <BusinessCenterShell>
      <div>
        <PageBreadcrumb items={[{ label: "기업센터", href: "/business/dashboard" }, { label: "헤드헌팅" }, { label: "의뢰 등록" }]} />
        <div className="mt-5 flex items-center justify-between gap-4">
          <h1 className="text-[34px] font-bold leading-[1.2] tracking-[-0.02em] text-[#242b36]">새 헤드헌팅 의뢰</h1>
          <Link
            href="/business/headhunting/manage"
            className="inline-flex h-10 items-center gap-1.5 border border-[#cfd8e3] bg-white px-4 text-[13px] font-medium text-[#303946] hover:border-[#111111]"
          >
            <ArrowLeft size={14} />
            목록으로
          </Link>
        </div>
        <p className="mt-2 text-[15px] font-normal leading-[1.7] text-[#68717e]">전문 직무 인재 탐색을 위한 헤드헌팅 상담을 요청합니다.</p>

        <div className="mt-6 space-y-5">
          <SectionCard title="채용 정보" description="찾고 있는 포지션과 채용 조건을 입력해 주세요.">
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 max-[820px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>포지션명</FieldLabel>
                <TextInput value={positionTitle} onChange={setPositionTitle} placeholder="예: 임상개발 PM" />
              </div>
              <div className="space-y-2">
                <FieldLabel required>직무 분야</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <select
                      value={jobCategoryId}
                      onChange={(event) => {
                        setJobCategoryId(event.target.value);
                        setJobSubcategoryId("");
                      }}
                      className="h-10 w-full appearance-none border border-[#cfd8e3] bg-white pl-3 pr-8 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111]"
                    >
                      <option value="">대분류 선택</option>
                      {industryJobCategoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a94a3]"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={jobSubcategoryId}
                      onChange={(event) => setJobSubcategoryId(event.target.value)}
                      disabled={!jobCategoryId}
                      className="h-10 w-full appearance-none border border-[#cfd8e3] bg-white pl-3 pr-8 text-[13px] font-medium text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] disabled:cursor-not-allowed disabled:border-[#e2e8ef] disabled:bg-[#f5f6f7] disabled:text-[#b7bfc9]"
                    >
                      <option value="">소분류 선택</option>
                      {jobSubcategoryOptions.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a94a3]"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <FieldLabel required>채용 인원</FieldLabel>
                <TextInput
                  value={headcount}
                  onChange={setHeadcount}
                  right={<span className="grid h-11 w-10 place-items-center border-y border-r border-[#d8e0e8] bg-white text-[12px] font-normal text-[#7b8491]">명</span>}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>경력 조건</FieldLabel>
                <TextInput value={experienceCondition} onChange={setExperienceCondition} placeholder="예: 7년 이상, 팀장급" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="상세 요구사항" description="우대 조건, 필수 역량 등 추천 시 참고할 내용을 자유롭게 작성해 주세요.">
            <textarea
              value={requirements}
              onChange={(event) => setRequirements(event.target.value)}
              maxLength={1000}
              placeholder="예: 글로벌 임상시험 경험자 우대, 영어 커뮤니케이션 가능자 우대"
              className="min-h-[148px] w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-3 text-[13px] font-normal leading-[1.7] text-[#303946] outline-none focus:border-[#111111]"
            />
            <p className="text-right text-[11px] font-normal text-[#8a94a3]">{requirements.length} / 1000</p>
          </SectionCard>

          <SectionCard title="담당자 정보" description="추천 후보자 안내와 진행 상황을 전달받을 담당자입니다.">
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 max-[820px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>담당자명</FieldLabel>
                <TextInput value={managerName} onChange={setManagerName} />
              </div>
              <div className="space-y-2">
                <FieldLabel>연락처</FieldLabel>
                <TextInput value={initialIndustryOrgManager.phone} disabled />
              </div>
            </div>
          </SectionCard>

          <div className="sticky bottom-0 z-30 min-h-[64px] border-t border-border bg-white/95 px-6 py-4 shadow-[0_-4px_16px_rgba(20,32,46,0.08)] backdrop-blur max-[760px]:px-4">
            <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
              <p className="text-[13px] font-normal text-[#7b8491]">1~2영업일 내에 담당 매니저가 연락드립니다.</p>
              <button
                type="button"
                onClick={() => isValid && setSubmitted(true)}
                disabled={!isValid}
                className="inline-flex h-11 items-center justify-center gap-2 px-9 text-[13px] font-bold text-white transition disabled:cursor-not-allowed disabled:bg-[#cfd8e3] max-[640px]:w-full"
                /* 그라데이션은 활성 상태에만 — background-image는 disabled:bg-[#cfd8e3]를 덮으므로 비활성 시 아예 걸지 않는다. */
                style={isValid ? { backgroundImage: "var(--gradient-cta)", textShadow: "0 1px 3px rgba(5,60,55,0.28)" } : undefined}
              >
                <Send size={15} />
                의뢰 제출하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </BusinessCenterShell>
  );
}
