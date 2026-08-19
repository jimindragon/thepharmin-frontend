"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { FieldLabel, Segmented, TextInput } from "@/components/business/BusinessFormControls";
import { InlineInfoHint } from "@/components/shared/InlineInfoHint";
import { FormSection, SELECT_CLASS, TEXTAREA_CLASS } from "@/components/company/ReviewFormSection";
import { ReviewTagSelector } from "@/components/company/ReviewTagSelector";
import {
  PHARMACY_REVIEW_PRIVACY_NOTICE,
  PHARMACY_REVIEW_RATING_LABEL,
  PHARMACY_REVIEW_RATING_MAX,
  PHARMACY_REVIEW_WORK_YEAR_LABEL,
  emptyPharmacyReviewChoices,
  pharmacyReviewAtmosphereQuestion,
  pharmacyReviewBasicQuestions,
  pharmacyReviewEnvironmentQuestions,
  pharmacyReviewNarrativeFields,
  pharmacyReviewRehireQuestion,
  pharmacyReviewWorkYearOptions,
  type PharmacyReviewChoiceFieldId,
  type PharmacyReviewNarrativeFieldId,
  type PharmacyReviewQuestion,
} from "@/config/pharmacyReviewForm";

interface PharmacyReviewFormSectionsProps {
  jobRole: string;
  onJobRoleChange: (value: string) => void;
  jobRolePlaceholder: string;
  authorStatus: "현직자" | "전직자";
  onAuthorStatusChange: (value: "현직자" | "전직자") => void;
  basicInfoGuide: string;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  tagSelectGuide: string;
}

/** 문항 사이 세로 간격 — 기존 폼이 필드 사이에 쓰던 gap-y-[18px]과 같은 값이다. */
const QUESTION_LIST_CLASS = "grid gap-y-[18px]";

/**
 * 단일 선택 문항 한 줄. 컨트롤은 작성자 상태(현직자/전직자)와 같은 Segmented 문법이고,
 * 선택지가 4개인 문항도 같은 컨트롤을 쓴다 — Segmented가 이미 flex-wrap이라 좁은 폭에서 줄만 늘어난다.
 *
 * 같은 값을 다시 누르면 선택이 풀린다. 이 문항들에는 기본값으로 삼을 만한 답이 없어
 * (작성자 상태와 달리) 미선택이 출발점이고, 그렇다면 되돌아갈 길도 있어야 한다 —
 * 면접 후기의 합격 여부·면접 시기 반기가 이미 같은 방식이다.
 */
function ChoiceQuestion({
  question,
  value,
  onChange,
}: {
  question: PharmacyReviewQuestion;
  value: string;
  onChange: (id: PharmacyReviewChoiceFieldId, value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{question.label}</FieldLabel>
      <div className="mt-1.5">
        {/* choices는 문항 정의가 `as const`라 readonly다 — Segmented는 일반 배열을 받으므로 여기서 편다 */}
        <Segmented<string>
          value={value}
          options={[...question.choices]}
          onChange={(next) => onChange(question.id, next === value ? "" : next)}
        />
      </div>
    </div>
  );
}

/**
 * 종합 평가 별점.
 *
 * 이 화면의 다른 컨트롤과 같은 규칙을 따른다 — radius 0, 그림자 없음, 브랜드 그라데이션 없음.
 * 채운 별은 본문 검정(#111111), 빈 별은 채운 회색(#e6e9ee)이다. 빈 별을 외곽선으로 두면
 * 다섯 칸이 서로 다른 굵기로 읽혀 몇 점인지가 한눈에 들어오지 않는다.
 *
 * 버튼은 44px 정사각이라 잉크(26px)보다 크다 — 별 사이를 좁게 두고도 터치 타깃이 남는다.
 */
function StarRating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: PHARMACY_REVIEW_RATING_MAX }, (_, index) => index + 1).map((score) => {
        const filled = score <= value;
        return (
          <button
            key={score}
            type="button"
            onClick={() => onChange(value === score ? 0 : score)}
            aria-label={`${score}점`}
            aria-pressed={filled}
            className="grid h-11 w-11 place-items-center transition hover:bg-[#f7f8fa]"
          >
            <Star size={26} className={filled ? "fill-[#111111] text-[#111111]" : "fill-[#e6e9ee] text-[#e6e9ee]"} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 약국 재직 후기(기업 리뷰 · track === "pharmacy") 본문 섹션 01~07.
 *
 * 자유서술 한 칸으로 받던 것을 문항으로 가른 이유는 읽는 쪽에 있다 — 근무 형태·휴게·정시 퇴근·연차는
 * 약국을 고를 때 실제로 비교하는 값인데, 문장 안에 섞여 있으면 후기 열 건을 읽어도 비교가 되지 않는다.
 * 자유서술은 없애지 않고 좋았던 점·아쉬웠던 점 두 칸으로 남긴다(문항이 담지 못하는 것이 거기 있다).
 *
 * 직무·작성자 상태·태그는 4트랙 공통이라 상위(ReviewWriteClient)의 state를 그대로 받아 쓴다.
 * 약국 전용 문항의 값만 이 컴포넌트가 들고 있다 — 다른 트랙에서는 존재조차 하지 않는 값이라
 * 상위에 올려 두면 쓰지 않는 state가 세 트랙에 함께 실린다. 제출은 상위가 하고, 이 단계에서는
 * 실제 저장이 없어 값을 위로 올릴 곳도 아직 없다.
 */
export function PharmacyReviewFormSections({
  jobRole,
  onJobRoleChange,
  jobRolePlaceholder,
  authorStatus,
  onAuthorStatusChange,
  basicInfoGuide,
  selectedTags,
  onToggleTag,
  tagSelectGuide,
}: PharmacyReviewFormSectionsProps) {
  const [choices, setChoices] = useState(emptyPharmacyReviewChoices);
  const [workYear, setWorkYear] = useState<number | "">("");
  const [rating, setRating] = useState(0);
  const [narrative, setNarrative] = useState<Record<PharmacyReviewNarrativeFieldId, string>>({
    goodPoints: "",
    badPoints: "",
  });

  const handleChoiceChange = (id: PharmacyReviewChoiceFieldId, value: string) => {
    setChoices((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <>
      <FormSection number="01" title="기본 정보" description={<p>{basicInfoGuide}</p>}>
        {/* 직무·작성자 상태는 다른 트랙의 기업 리뷰와 같은 2열 배치를 그대로 쓴다 */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[44px] gap-y-[18px] max-[640px]:grid-cols-1">
          <div>
            <FieldLabel>직무</FieldLabel>
            <div className="mt-1.5">
              <TextInput value={jobRole} onChange={onJobRoleChange} placeholder={jobRolePlaceholder} />
            </div>
          </div>
          <div>
            <FieldLabel>작성자 상태</FieldLabel>
            <div className="mt-1.5">
              <Segmented
                value={authorStatus}
                options={[
                  { id: "현직자", label: "현직자" },
                  { id: "전직자", label: "전직자" },
                ]}
                onChange={onAuthorStatusChange}
              />
            </div>
          </div>
        </div>

        {/* 근무 형태·근무 기간은 선택지가 3~4개라 2열에 넣으면 좁은 열 안에서 다시 접힌다 — 전폭 한 줄씩 세운다 */}
        <div className={`mt-[18px] ${QUESTION_LIST_CLASS}`}>
          {pharmacyReviewBasicQuestions.map((question) => (
            <ChoiceQuestion key={question.id} question={question} value={choices[question.id]} onChange={handleChoiceChange} />
          ))}
          <div>
            <FieldLabel>{PHARMACY_REVIEW_WORK_YEAR_LABEL}</FieldLabel>
            <div className="relative mt-1.5 w-[160px] max-[640px]:w-full">
              <select
                value={workYear}
                onChange={(event) => setWorkYear(event.target.value ? Number(event.target.value) : "")}
                className={SELECT_CLASS}
                aria-label={PHARMACY_REVIEW_WORK_YEAR_LABEL}
              >
                <option value="">선택 안 함</option>
                {pharmacyReviewWorkYearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8a95a5]" size={16} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection number="02" title="종합 평가">
        <FieldLabel>{PHARMACY_REVIEW_RATING_LABEL}</FieldLabel>
        {/* 별 버튼이 잉크보다 큰 정사각이라 왼쪽 여백이 라벨과 어긋난다 — 그만큼(9px) 당겨 세로선을 맞춘다 */}
        <div className="mt-1.5 -ml-[9px]">
          <StarRating value={rating} onChange={setRating} />
        </div>
      </FormSection>

      <FormSection number="03" title="근무 환경">
        <div className={QUESTION_LIST_CLASS}>
          {pharmacyReviewEnvironmentQuestions.map((question) => (
            <ChoiceQuestion key={question.id} question={question} value={choices[question.id]} onChange={handleChoiceChange} />
          ))}
        </div>
      </FormSection>

      <FormSection number="04" title="근무 분위기">
        <ChoiceQuestion
          question={pharmacyReviewAtmosphereQuestion}
          value={choices[pharmacyReviewAtmosphereQuestion.id]}
          onChange={handleChoiceChange}
        />
      </FormSection>

      <FormSection number="05" title="종합">
        <ChoiceQuestion
          question={pharmacyReviewRehireQuestion}
          value={choices[pharmacyReviewRehireQuestion.id]}
          onChange={handleChoiceChange}
        />
      </FormSection>

      <FormSection number="06" title="태그 선택" description={<p>{tagSelectGuide}</p>}>
        <ReviewTagSelector track="pharmacy" reviewType="company" selected={selectedTags} onToggle={onToggleTag} />
      </FormSection>

      <FormSection number="07" title="상세 내용">
        <div className="grid gap-5">
          {pharmacyReviewNarrativeFields.map((field) => (
            <div key={field.id}>
              <FieldLabel>{field.label}</FieldLabel>
              <div className="mt-1.5">
                <textarea
                  value={narrative[field.id]}
                  onChange={(event) => setNarrative((prev) => ({ ...prev, [field.id]: event.target.value }))}
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder={field.placeholder}
                />
              </div>
            </div>
          ))}
          <InlineInfoHint>{PHARMACY_REVIEW_PRIVACY_NOTICE}</InlineInfoHint>
        </div>
      </FormSection>
    </>
  );
}
