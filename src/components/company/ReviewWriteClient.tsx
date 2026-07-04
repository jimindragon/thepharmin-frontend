"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldLabel, Segmented, SectionCard, TextInput } from "@/components/business/BusinessFormControls";
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

const TEXTAREA_CLASS =
  "h-auto w-full resize-y border border-[#d8e0e8] bg-white px-3.5 py-2.5 text-[13px] font-normal leading-relaxed text-[#303946] outline-none transition placeholder:text-[#a4adba] hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8";

/** 리뷰/면접 후기 작성 목업 폼. reviewType에 따라 필드 구성만 다르고, 제출은 실제 저장 없이 토스트 + 목록 이동만 한다. */
export function ReviewWriteClient({ companyId, companyName, track, reviewType }: ReviewWriteClientProps) {
  const router = useRouter();
  const isInterview = reviewType === "interview";

  const [jobRole, setJobRole] = useState("");
  const [authorStatus, setAuthorStatus] = useState<"현직자" | "전직자">("현직자");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [outcome, setOutcome] = useState<"합격" | "불합격" | "">("");
  const [interviewDifficulty, setInterviewDifficulty] = useState<InterviewDifficulty | "">("");
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat | "">("");
  const [showToast, setShowToast] = useState(false);

  const title = isInterview ? `${companyName} 면접 후기 작성` : `${companyName} 현직자 리뷰 작성`;
  const contentGuide = isInterview ? "200~350자 권장" : "100~150자 권장";
  const listHref = isInterview ? `/companies/${companyId}/interviews` : `/companies/${companyId}/reviews`;

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
      <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#1f2733]">{title}</h1>

      <SectionCard title="기본 정보" description="작성자 정보를 입력해주세요.">
        <div className="grid gap-5 max-[640px]:grid-cols-1 grid-cols-2">
          <div>
            <FieldLabel>직무</FieldLabel>
            <div className="mt-1.5">
              <TextInput value={jobRole} onChange={setJobRole} placeholder="예: RA, 병원약사" />
            </div>
          </div>
          <div>
            <FieldLabel>작성자 상태</FieldLabel>
            <div className="mt-1.5">
              {isInterview ? (
                <p className="flex h-11 items-center text-[13px] font-medium text-[#4f5967]">면접자</p>
              ) : (
                <Segmented
                  value={authorStatus}
                  options={[
                    { id: "현직자", label: "현직자" },
                    { id: "전직자", label: "전직자" },
                  ]}
                  onChange={setAuthorStatus}
                />
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="태그 선택" description={`가장 가깝게 느낀 항목을 최대 ${REVIEW_TAG_MAX}개까지 골라주세요.`}>
        <ReviewTagSelector track={track} reviewType={reviewType} selected={selectedTags} onToggle={handleToggleTag} />
      </SectionCard>

      <SectionCard title="상세 내용" description={contentGuide}>
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
        <p className="mt-1.5 text-right text-[11.5px] font-normal text-[#a0a9b7]">{content.length}자</p>
      </SectionCard>

      {isInterview ? (
        <SectionCard title="면접 정보" description="선택 입력 항목입니다.">
          <div className="grid gap-5">
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
              <select
                value={interviewFormat}
                onChange={(event) => setInterviewFormat(event.target.value as InterviewFormat | "")}
                className="mt-1.5 h-11 w-full border border-[#d8e0e8] bg-white px-3.5 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/8"
              >
                <option value="">선택 안 함</option>
                {interviewFormatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>
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
        <div className="fixed right-6 top-[84px] z-[80] border border-[#cfd8e3] bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          작성이 완료되었습니다.
        </div>
      ) : null}
    </div>
  );
}
