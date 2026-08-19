"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { FieldLabel, Segmented, TextInput } from "@/components/business/BusinessFormControls";
import { InlineInfoHint } from "@/components/shared/InlineInfoHint";
import { Button } from "@/components/ui/Button";
import { PharmacyReviewFormSections } from "@/components/company/PharmacyReviewFormSections";
import { FormSection, TEXTAREA_CLASS } from "@/components/company/ReviewFormSection";
import { ReviewTagSelector } from "@/components/company/ReviewTagSelector";
import { companyAnchorIds } from "@/config/companyDetailAnchors";
import { MOCK_TODAY_DATE } from "@/config/mockToday";
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

/** 기업 상세 모바일 통합 브레이크포인트 — CompanyDetailTabs(모바일 탭 행 숨김)·CompanyMobileOverviewRedirect와 동일 기준 */
const MOBILE_QUERY = "(max-width: 760px)";

/** 리뷰/면접 후기 작성 목업 폼. reviewType에 따라 필드 구성만 다르고, 제출은 실제 저장 없이 토스트 + 이동만 한다.
 * 떠날 곳은 폭이 가른다(getLeaveHref) — 761px 이상은 목록, ≤760px는 개요의 해당 섹션 앵커다. */
export function ReviewWriteClient({ companyId, companyName, track, reviewType }: ReviewWriteClientProps) {
  const router = useRouter();
  const isInterview = reviewType === "interview";
  /**
   * 약국 재직 후기만 구조화 문항 폼으로 간다.
   *
   * 조건이 트랙 하나가 아니라 트랙 × 리뷰 타입인 것은 면접 후기가 같은 약국에서도 옛 폼을 그대로
   * 쓰기 때문이다 — 근무 형태·휴게·연차는 다녀 본 사람만 답할 수 있는 값이라 면접 경험에는 물을 수 없다.
   * 나머지 세 트랙의 기업 리뷰도 종전 경로 그대로다(이번 단계의 범위가 약국이다).
   */
  const isPharmacyReview = track === "pharmacy" && reviewType === "company";

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
  /** ≤760px 개요에서 이 후기가 들어가 있는 섹션. 목록 라우트가 그 폭에서 리다이렉트로 도착하는 곳과 같은 앵커다. */
  const overviewHref = `/companies/${companyId}#${isInterview ? companyAnchorIds.interviews : companyAnchorIds.reviews}`;

  /**
   * 폼을 떠날 때의 목적지. 제출·취소가 함께 쓴다.
   *
   * ≤760px에서 목록 라우트로 보내면 도착하자마자 CompanyMobileOverviewRedirect가 개요로 다시 옮기므로,
   * 떠나려던 폼 대신 목록이 한 프레임 스쳤다가 사라진다(리다이렉트는 마운트 후에 도는 클라이언트 동작).
   * 그 폭에서는 최종 도착지인 개요 앵커로 곧장 보낸다 — 목적지는 같고 경유만 없앤 것이다.
   * 761px 이상은 목록이 그대로 도착지라 종전과 같다.
   *
   * 렌더가 아니라 이동 시점에 폭을 재는 것은 두 가지 이유다: SSR에는 window가 없고, 폼을 길게 열어 둔
   * 사이 창 폭이 바뀌었을 수 있다.
   */
  const getLeaveHref = () => (window.matchMedia(MOBILE_QUERY).matches ? overviewHref : listHref);
  // 실제 시계를 쓰지 않는다 — 시연 기준일 연도부터 7년치를 거슬러 만든다.
  const applyYearOptions = Array.from({ length: 7 }, (_, index) => MOCK_TODAY_DATE.getFullYear() - index);

  const pageIntro = isInterview
    ? "실제 경험을 바탕으로 다른 구직자에게 도움이 되는 정보를 공유해 주세요."
    : "실제 근무 경험을 바탕으로 다른 구직자에게 도움이 되는 정보를 공유해 주세요.";
  const basicInfoGuide = isInterview ? "면접에 대한 기본 정보를 입력해 주세요." : "리뷰에 대한 기본 정보를 입력해 주세요.";
  const tagSelectGuide = isInterview
    ? `가장 기억에 남는 면접 경험을 최대 ${REVIEW_TAG_MAX}개까지 선택해 주세요.`
    : `가장 기억에 남는 근무 경험을 최대 ${REVIEW_TAG_MAX}개까지 선택해 주세요.`;
  const contentDetailGuide = isInterview ? "경험을 자유롭게 작성해 주세요." : "근무 경험을 자유롭게 작성해 주세요.";
  const CONTENT_RECOMMENDED_MAX = isInterview ? 350 : 150;
  /**
   * 열람권 지급 대상 — 면접 후기와 **약국 재직 후기**다.
   *
   * 약국 재직 후기가 지급 대상이 된 것은 그쪽도 열람권으로 잠기기 때문이다(PharmacyReviewsListClient).
   * 잠긴 후기의 CTA가 "후기 작성하고 열람권 받기"로 이 폼을 가리키는데 정작 써도 지급되지 않으면
   * 그 CTA가 거짓말이 된다. 두 후기 종류가 지갑 하나를 나눠 쓰므로 지급도 같은 규칙을 따른다.
   *
   * 다른 세 트랙의 재직 후기는 여전히 미지급이다 — 잠기지 않아 열람권을 쓸 일 자체가 없다.
   */
  const grantsReviewCredits = isInterview || isPharmacyReview;
  const submitHint = grantsReviewCredits
    ? "작성한 후기는 운영팀 검토 후 게시되며, 게시되면 열람권이 지급됩니다."
    : "작성한 리뷰는 운영팀 검토 후 게시됩니다.";

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
      router.push(getLeaveHref());
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

      {isPharmacyReview ? (
        /* 보조문구(basicInfoGuide·tagSelectGuide)는 넘기지 않는다 — 약국 폼은 섹션 제목만으로 서고,
           그 둘은 제목이 이미 말한 것을 한 번 더 말하고 있었다. 나머지 세 트랙은 종전 그대로다. */
        <PharmacyReviewFormSections
          jobRole={jobRole}
          onJobRoleChange={setJobRole}
          jobRolePlaceholder={JOB_ROLE_PLACEHOLDERS[track]}
          authorStatus={authorStatus}
          onAuthorStatusChange={setAuthorStatus}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
        />
      ) : (
        <>
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
                      className="h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-9 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
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
            <p className="mt-1.5 text-right text-[12px] font-normal text-[#a0a9b7]">
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
                      className="h-11 w-full appearance-none border border-[#d8e0e8] bg-white px-3.5 pr-9 text-[13px] font-normal text-[#303946] outline-none transition hover:border-[#b0bac6] focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/[0.08]"
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
        </>
      )}

      {/* 안내는 버튼 위 한 줄로 쌓는다 — 같은 행에 두면 390px에서 문구가 버튼에 밀려 3줄로 쪼개진다. */}
      <div className="grid gap-3">
        <InlineInfoHint>{submitHint}</InlineInfoHint>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => router.push(getLeaveHref())}>
            취소
          </Button>
          <Button type="button" variant="gradient" onClick={handleSubmit}>
            작성 완료
          </Button>
        </div>
      </div>

      {showToast ? (
        <div className="fixed right-6 top-[84px] z-[80] border border-border bg-white px-5 py-3 text-[13px] font-medium text-[#303946] shadow-[0_10px_28px_rgba(17,24,39,0.08)]">
          작성이 완료되었습니다. 운영팀 검토 후 게시됩니다.
        </div>
      ) : null}
    </div>
  );
}
