"use client";

import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { BusinessCenterShell } from "@/components/business/BusinessCenterShell";
import { FieldLabel, SectionCard, TextInput } from "@/components/business/BusinessFormControls";
import { businessCompanyManager } from "@/data/businessCompanyProfile";

export function BusinessHeadhuntingNewClient() {
  const [positionTitle, setPositionTitle] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [experienceCondition, setExperienceCondition] = useState("");
  const [requirements, setRequirements] = useState("");
  const [managerName, setManagerName] = useState(businessCompanyManager.managerName);
  const [submitted, setSubmitted] = useState(false);

  const isValid = positionTitle.trim().length > 0 && jobCategory.trim().length > 0 && managerName.trim().length > 0;

  if (submitted) {
    return (
      <BusinessCenterShell>
        <section className="mx-auto max-w-[640px] border border-[#dfe4ea] bg-white p-10 text-center">
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
          <h1 className="text-[34px] font-bold tracking-[-0.02em] text-[#17202c]">새 헤드헌팅 의뢰</h1>
          <Link
            href="/business/headhunting/manage"
            className="inline-flex h-10 items-center gap-1.5 border border-[#cfd8e3] bg-white px-4 text-[12px] font-medium text-[#303946] hover:border-[#111111]"
          >
            <ArrowLeft size={14} />
            목록으로
          </Link>
        </div>
        <p className="mt-2 text-[13px] font-normal text-[#68717e]">전문 직무 인재 탐색을 위한 헤드헌팅 상담을 요청합니다.</p>

        <div className="mt-6 space-y-5">
          <SectionCard title="채용 정보" description="찾고 있는 포지션과 채용 조건을 입력해 주세요.">
            <div className="grid grid-cols-2 gap-x-5 gap-y-5 max-[820px]:grid-cols-1">
              <div className="space-y-2">
                <FieldLabel required>포지션명</FieldLabel>
                <TextInput value={positionTitle} onChange={setPositionTitle} placeholder="예: 임상개발 PM" />
              </div>
              <div className="space-y-2">
                <FieldLabel required>직무 분야</FieldLabel>
                <TextInput value={jobCategory} onChange={setJobCategory} placeholder="예: 임상·CRA, RA·허가, QA·QC" />
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
                <TextInput value={businessCompanyManager.phone} disabled />
              </div>
            </div>
          </SectionCard>

          <div className="sticky bottom-0 z-20 border border-[#dfe4ea] bg-white/96 px-6 py-4 backdrop-blur max-[760px]:px-4">
            <div className="flex items-center justify-between gap-4 max-[640px]:flex-col">
              <p className="text-[12px] font-normal text-[#7b8491]">제출 후 담당 매니저가 1~2영업일 내에 연락드립니다.</p>
              <button
                type="button"
                onClick={() => isValid && setSubmitted(true)}
                disabled={!isValid}
                className="inline-flex h-11 items-center justify-center gap-2 bg-[#111111] px-7 text-[13px] font-medium text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:bg-[#cfd8e3] max-[640px]:w-full"
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
