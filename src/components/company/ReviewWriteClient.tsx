"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { FieldLabel, Segmented, TextInput } from "@/components/business/BusinessFormControls";
import { Button } from "@/components/ui/Button";
import { ReviewTagSelector } from "@/components/company/ReviewTagSelector";
import { REVIEW_TAG_MAX, interviewDifficultyOptions, interviewFormatOptions } from "@/config/reviewTags";
import type { CompanyReviewType, JobTrack } from "@/types/jobs";

interface ReviewWriteClientProps {
  companyId: string;
  companyName: string;
  track: JobTrack;
  reviewType: CompanyReviewType;
}

type InterviewDifficulty = (typeof interviewDifficultyOptions)[number];
type InterviewFormat = (typeof interviewFormatOptions)[number];

/** 트랙별 직무 입력 placeholder — 폼이 받는 track prop(getCompanyTrack 경로)을 그대로 키로 쓴다 */
const JOB_ROLE_PLACEHOLDERS: Record<JobTrack, string> = {
  industry: "예: RA, 임상 PM",
  hospital: "예: 병원약사, 약제부",
  pharmacy: "예: 근무약사",
  research: "예: 연구원, 박사후연구원",
};

const TEXTAREA_CLASS =
  "h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[13px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";

/** 이 폼 전용 섹션 래퍼. 좌측 열(번호+제목+안내)과 우측 열(입력 영역) 2컬럼 배치.
 * BusinessFormControls의 SectionCard와 시각 톤(흰 배경·얇은 보더·radius 0)만 맞추고, 기업 폼 11곳이 공유하는 그 컴포넌트는 건드리지 않기 위해 이 파일 안에서만 쓰는 로컬 컴포넌트다. */
function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-white p-6 shadow-[var(--shadow)] max-[760px]:p-4">
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <div>
          <p className="text-[12px] font-normal tracking-[0.02em] text-[#a0a9b7]">{number}</p>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-[-0.02em] text-[#1f2733]">{title}</h2>
          <div className="mt-2 grid gap-1 text-[13px] font-normal leading-[1.65] text-[#7b8491]">{description}</div>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}

/** 리뷰/면접 후기 작성 목업 폼. reviewType에 따라 필드 구성만 다르고, 제출은 실제 저장 없이 토스트 + 목록 이동만 한다. */
export function ReviewWriteClient({ companyId, companyName, track, reviewType }: ReviewWriteClientProps) {
  const router = useRouter();
  const isInterview = reviewType === "interview";

  const [jobRole, setJobRole] = useState("");
  const [authorStatus, setAuthorStatus] = useState<"현직자" | "전직자">("현직자");
  const [applyYear, setApplyYear] = useState<number | "">("");
  const [applyHalf, setApplyHalf] = useState<"상반기" | "하반기" | "">("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [outcome, setOutcome] = useState<"합격" | "불합격" | "">("");
  const [interviewDifficulty, setInterviewDifficulty] = useState<InterviewDifficulty | "">("");
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat | "">("");
  const [showToast, setShowToast] = useState(false);

  const titleLabel = isInterview ? "면접 후기 작성" : "기업 리뷰 작성";
  const contentGuide = isInterview ? "200~350자 권장" : "100~150자 권장";
  const listHref = isInterview ? `/companies/${companyId}/interviews` : `/companies/${companyId}/reviews`;
  const applyYearOptions = Array.from({ length: 7 }, (_, index) => new Date().getFullYear() - index);

  const pageIntro = isInterview
    ? "실제 경험을 바탕으로 다른 구직자에게 도움이 되는 정보를 공유해 주세요."
    : "실제 근무 경험을 바탕으로 다른 구직자에게 도움이 되는 정보를 공유해 주세요.";
  const basicInfoGuide = isInterview ? "면접에 대한 기본 정보를 입력해 주세요." : "리뷰에 대한 기본 정보를 입력해 주세요.";
  const tagSelectGuide = isInterview
    ? `가장 기억에 남는 면접 경험을 최대 ${REVIEW_TAG_MAX}개까지 선택해 주세요.`
    : `가장 기억에 남는 근무 경험을 최대 ${REVIEW_TAG_MAX}개까지 선택해 주세요.`;
  const contentDetailGuide = isInterview ? "경험을 자유롭게 작성해 주세요." : "근무 경험을 자유롭게 작성해 주세요.";
  const CONTENT_RECOMMENDED_MAX = isInterview ? 350 : 150;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((item) => item !== tag);
      if (prev.length >= REVIEW_TAG_MAX) return prev;
      return [...prev, tag];
    });
  };

  const handleSubmit = () => {
    setShowToast(true);
    window.setTimeout(() => {
      router.push(listHref);
    }, 900);
  };

  return (
    <div className="grid gap-5 py-8">
      <div>
        <h1 className="flex items-baseline gap-3 text-[24px] font-bold tracking-[-0.02em] text-[#1f2733]">
          {titleLabel}
          <span className="border-l border-[#dfe5ec] pl-3 text-[20px] font-medium text-[#8791a0]">{companyName}</span>
        </h1>
        <p className="mt-2 text-[13px] font-normal text-[#8791a0]">{pageIntro}</p>
      </div>

      <FormSection number="01" title="기본 정보" description={<p>{basicInfoGuide}</p>}>
        <div
          className={
            isInterview
              ? "grid gap-y-[18px]"
              : "grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[44px] gap-y-[18px] max-[640px]:grid-cols-1"
          }
        >
          <div>
            <FieldLabel>직무</FieldLabel>
            <div className="mt-1.5">
              <TextInput value={jobRole} onChange={setJobRole} placeholder={JOB_ROLE_PLACEHOLDERS[track]} />
            </div>
          </div>
          {isInterview ? null : (
            <div>
              <FieldLabel>작성자 상태</FieldLabel>
              <div className="mt-1.5">
                <Segmented
                  value={authorStatus}
                  options={[
                    { id: "현직자", label: "현직자" },
                    { id: "전직자", label: "전직자" },
                  ]}
                  onChange={setAuthorStatus}
                />
              </div>
            </div>
          )}
        </div>
        {isInterview ? (
          <div className="mt-5">
            <FieldLabel>면접 시기</FieldLabel>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <div className="relative w-[160px] max-[640px]:w-full">
                <select
                  value={applyYear}
                  onChange={(event) => setApplyYear(event.target.value ? Number(event.target.value) : "")}
                  className="h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-9 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                >
                  <option value="">선택 안 함</option>
                  {applyYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}년
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={16} />
              </div>
              <Segmented<"상반기" | "하반기" | "">
                value={applyHalf}
                options={[
                  { id: "상반기", label: "상반기" },
                  { id: "하반기", label: "하반기" },
                ]}
                onChange={(value) => setApplyHalf((prev) => (prev === value ? "" : value))}
              />
            </div>
          </div>
        ) : null}
      </FormSection>

      <FormSection number="02" title="태그 선택" description={<p>{tagSelectGuide}</p>}>
        <ReviewTagSelector track={track} reviewType={reviewType} selected={selectedTags} onToggle={handleToggleTag} />
      </FormSection>

      <FormSection
        number="03"
        title="상세 내용"
        description={
          <>
            <p>{contentGuide}</p>
            <p>{contentDetailGuide}</p>
          </>
        }
      >
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={isInterview ? 8 : 5}
          className={TEXTAREA_CLASS}
          placeholder={
            isInterview
              ? "면접에서 어떤 질문을 받았는지, 분위기는 어땠는지 알려주세요."
              : "직무 경험, 근무 환경 등을 자유롭게 작성해주세요."
          }
        />
        <p className="mt-1.5 text-right text-[11.5px] font-normal text-[#a0a9b7]">
          {content.length}/{CONTENT_RECOMMENDED_MAX}
        </p>
      </FormSection>

      {isInterview ? (
        <FormSection number="04" title="면접 정보" description={<p>선택 입력 항목입니다.</p>}>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[44px] gap-y-[18px] max-[640px]:grid-cols-1">
            <div>
              <FieldLabel>합격 여부</FieldLabel>
              <div className="mt-1.5">
                <Segmented<"합격" | "불합격" | "">
                  value={outcome}
                  options={[
                    { id: "합격", label: "합격" },
                    { id: "불합격", label: "불합격" },
                  ]}
                  onChange={(value) => setOutcome((prev) => (prev === value ? "" : value))}
                />
              </div>
            </div>
            <div>
              <FieldLabel>면접 난이도</FieldLabel>
              <div className="mt-1.5">
                <Segmented<InterviewDifficulty | "">
                  value={interviewDifficulty}
                  options={interviewDifficultyOptions.map((option) => ({ id: option, label: option }))}
                  onChange={setInterviewDifficulty}
                />
              </div>
            </div>
            <div>
              <FieldLabel>면접 유형</FieldLabel>
              <div className="relative mt-1.5">
                <select
                  value={interviewFormat}
                  onChange={(event) => setInterviewFormat(event.target.value as InterviewFormat | "")}
                  className="h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-9 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
                >
                  <option value="">선택 안 함</option>
                  {interviewFormatOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={16} />
              </div>
            </div>
          </div>
        </FormSection>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.push(listHref)}>
          취소
        </Button>
        <Button type="button" variant="gradient" onClick={handleSubmit}>
          작성 완료
        </Button>
      </div>

      {showToast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          작성이 완료되었습니다.
        </div>
      ) : null}
    </div>
  );
}
