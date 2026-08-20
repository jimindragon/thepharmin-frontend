"use client";

import type { Dispatch, SetStateAction } from "react";
import { AlertCircle, ChevronDown, Star } from "lucide-react";
import { FieldLabel, Segmented, TextInput } from "@/components/business/BusinessFormControls";
import { InlineInfoHint } from "@/components/shared/InlineInfoHint";
import { FormSection, SELECT_CLASS, TEXTAREA_CLASS } from "@/components/company/ReviewFormSection";
import { ReviewTagSelector } from "@/components/company/ReviewTagSelector";
import {
  PHARMACY_REVIEW_PRIVACY_NOTICE,
  PHARMACY_REVIEW_RATING_LABEL,
  PHARMACY_REVIEW_RATING_MAX,
  PHARMACY_REVIEW_REHIRE_LABELS,
  PHARMACY_REVIEW_WORK_YEAR_LABEL,
  pharmacyReviewAtmosphereQuestion,
  pharmacyReviewBasicQuestions,
  pharmacyReviewEnvironmentQuestions,
  pharmacyReviewNarrativeFields,
  pharmacyReviewRehireQuestion,
  pharmacyReviewWorkYearOptions,
  type PharmacyReviewChoiceFieldId,
  type PharmacyReviewErrors,
  type PharmacyReviewFieldKey,
  type PharmacyReviewFormValues,
  type PharmacyReviewQuestion,
} from "@/config/pharmacyReviewForm";

interface PharmacyReviewFormSectionsProps {
  jobRole: string;
  onJobRoleChange: (value: string) => void;
  jobRolePlaceholder: string;
  authorStatus: "현직자" | "전직자";
  onAuthorStatusChange: (value: "현직자" | "전직자") => void;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  /** 약국 전용 문항 값. 제출부가 필수 검증에 쓰므로 상위가 들고 있다. */
  values: PharmacyReviewFormValues;
  onValuesChange: Dispatch<SetStateAction<PharmacyReviewFormValues>>;
  /** 제출이 한 번 막힌 뒤에만 채워진다 — 처음 여는 폼에 빨간 줄이 깔려 있지 않도록. */
  errors: PharmacyReviewErrors;
  /** 미입력 문항으로 스크롤할 수 있게 제출부가 필드 위치를 잡아 두는 통로 */
  registerField: (key: PharmacyReviewFieldKey) => (element: HTMLDivElement | null) => void;
}

/**
 * 문항 아래 한 줄짜리 미입력 안내.
 *
 * 어느 문항인지는 이 줄이 놓인 자리가 말하므로 문구는 무엇을 해야 하는지만 말한다.
 * 색은 상태 토큰(text-status-error)이다 — 라벨의 필수 별표(*)가 쓰는 강조 빨강과 달리
 * 이쪽은 읽어야 하는 문장이라 본문 크기에서 대비가 서는 값이어야 한다.
 */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-status-error">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
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
  error,
  fieldRef,
}: {
  question: PharmacyReviewQuestion;
  value: string;
  onChange: (id: PharmacyReviewChoiceFieldId, value: string) => void;
  error?: string;
  fieldRef: (element: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={fieldRef}>
      {/* 단일 선택 문항 열 개는 모두 필수다 — required를 문항별로 받지 않는다 */}
      <FieldLabel required>{question.label}</FieldLabel>
      <div className="mt-1.5">
        {/* choices는 문항 정의가 `as const`라 readonly다 — Segmented는 일반 배열을 받으므로 여기서 편다 */}
        <Segmented<string>
          value={value}
          options={[...question.choices]}
          onChange={(next) => onChange(question.id, next === value ? "" : next)}
        />
      </div>
      <FieldError message={error} />
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
 * 값은 전부 상위(ReviewWriteClient)가 들고, 이 컴포넌트는 받아 그리기만 한다 — 직무·재직 상태·태그는
 * 4트랙 공통이라 처음부터 그랬고, 약국 전용 문항 값도 필수 검증이 생기면서 따라 올라갔다.
 * 제출을 누르는 곳이 상위이므로 값이 그 아래에 있으면 무엇이 비었는지 볼 수가 없다.
 * 저장은 여전히 하지 않는다 — 검증을 통과하면 종전처럼 토스트 후 이동이다.
 *
 * 일곱 섹션 모두 안내 문구(FormSection의 description)가 없다. 섹션 제목이 무엇을 묻는지 이미
 * 말하고 문항 자체가 물음 형태라, 그 사이에 낀 한 줄은 같은 말을 세 번째로 하는 자리였다.
 * 나머지 세 트랙의 폼은 자유서술 한 칸이라 안내가 실제로 일을 하므로 종전 그대로 둔다.
 */
export function PharmacyReviewFormSections({
  jobRole,
  onJobRoleChange,
  jobRolePlaceholder,
  authorStatus,
  onAuthorStatusChange,
  selectedTags,
  onToggleTag,
  values,
  onValuesChange,
  errors,
  registerField,
}: PharmacyReviewFormSectionsProps) {
  const { choices, workYear, rating, narrative } = values;

  const handleChoiceChange = (id: PharmacyReviewChoiceFieldId, value: string) => {
    onValuesChange((prev) => ({ ...prev, choices: { ...prev.choices, [id]: value } }));
  };

  /** 재근무 의향은 문항 문구만 재직 상태로 갈린다 — 선택지도 id도 한 벌 그대로다. */
  const rehireQuestion = { ...pharmacyReviewRehireQuestion, label: PHARMACY_REVIEW_REHIRE_LABELS[authorStatus] };

  return (
    <>
      <FormSection number="01" title="근무 정보" emphasizeHeading>
        {/* 직무·작성자 상태는 다른 트랙의 기업 리뷰와 같은 2열 배치를 그대로 쓴다 */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-[44px] gap-y-[18px] max-[640px]:grid-cols-1">
          <div ref={registerField("jobRole")}>
            <FieldLabel required>직무</FieldLabel>
            <div className="mt-1.5">
              <TextInput value={jobRole} onChange={onJobRoleChange} placeholder={jobRolePlaceholder} />
            </div>
            <FieldError message={errors.jobRole} />
          </div>
          <div ref={registerField("authorStatus")}>
            <FieldLabel required>재직 상태</FieldLabel>
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
            <FieldError message={errors.authorStatus} />
          </div>
        </div>

        {/* 근무 형태·근무 기간은 선택지가 3~4개라 2열에 넣으면 좁은 열 안에서 다시 접힌다 — 전폭 한 줄씩 세운다 */}
        <div className={`mt-[18px] ${QUESTION_LIST_CLASS}`}>
          {pharmacyReviewBasicQuestions.map((question) => (
            <ChoiceQuestion
              key={question.id}
              question={question}
              value={choices[question.id]}
              onChange={handleChoiceChange}
              error={errors[question.id]}
              fieldRef={registerField(question.id)}
            />
          ))}
          <div ref={registerField("workYear")}>
            <FieldLabel required>{PHARMACY_REVIEW_WORK_YEAR_LABEL}</FieldLabel>
            <div className="relative mt-1.5 w-[160px] max-[640px]:w-full">
              <select
                value={workYear}
                onChange={(event) =>
                  onValuesChange((prev) => ({ ...prev, workYear: event.target.value ? Number(event.target.value) : "" }))
                }
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
            <FieldError message={errors.workYear} />
          </div>
        </div>
      </FormSection>

      <FormSection number="02" title="전체 만족도" emphasizeHeading>
        <div ref={registerField("rating")}>
          <FieldLabel required>{PHARMACY_REVIEW_RATING_LABEL}</FieldLabel>
          {/* 별 버튼이 잉크보다 큰 정사각이라 왼쪽 여백이 라벨과 어긋난다 — 그만큼(9px) 당겨 세로선을 맞춘다 */}
          <div className="mt-1.5 -ml-[9px]">
            <StarRating value={rating} onChange={(next) => onValuesChange((prev) => ({ ...prev, rating: next }))} />
          </div>
          <FieldError message={errors.rating} />
        </div>
      </FormSection>

      <FormSection number="03" title="근무 조건" emphasizeHeading>
        <div className={QUESTION_LIST_CLASS}>
          {pharmacyReviewEnvironmentQuestions.map((question) => (
            <ChoiceQuestion
              key={question.id}
              question={question}
              value={choices[question.id]}
              onChange={handleChoiceChange}
              error={errors[question.id]}
              fieldRef={registerField(question.id)}
            />
          ))}
        </div>
      </FormSection>

      <FormSection number="04" title="근무 분위기" emphasizeHeading>
        <ChoiceQuestion
          question={pharmacyReviewAtmosphereQuestion}
          value={choices[pharmacyReviewAtmosphereQuestion.id]}
          onChange={handleChoiceChange}
          error={errors[pharmacyReviewAtmosphereQuestion.id]}
          fieldRef={registerField(pharmacyReviewAtmosphereQuestion.id)}
        />
      </FormSection>

      <FormSection number="05" title="재근무 의향" emphasizeHeading>
        <ChoiceQuestion
          question={rehireQuestion}
          value={choices[rehireQuestion.id]}
          onChange={handleChoiceChange}
          error={errors[rehireQuestion.id]}
          fieldRef={registerField(rehireQuestion.id)}
        />
      </FormSection>

      <FormSection number="06" title="근무 특징" emphasizeHeading>
        <ReviewTagSelector track="pharmacy" reviewType="company" selected={selectedTags} onToggle={onToggleTag} />
      </FormSection>

      <FormSection number="07" title="상세 후기" emphasizeHeading>
        <div className="grid gap-5">
          {pharmacyReviewNarrativeFields.map((field) => (
            <div key={field.id} ref={registerField(field.id)}>
              <FieldLabel required={field.required}>{field.label}</FieldLabel>
              <div className="mt-1.5">
                <textarea
                  value={narrative[field.id]}
                  onChange={(event) =>
                    onValuesChange((prev) => ({ ...prev, narrative: { ...prev.narrative, [field.id]: event.target.value } }))
                  }
                  rows={4}
                  className={TEXTAREA_CLASS}
                  placeholder={field.placeholder}
                />
              </div>
              <FieldError message={errors[field.id]} />
            </div>
          ))}
          <InlineInfoHint>{PHARMACY_REVIEW_PRIVACY_NOTICE}</InlineInfoHint>
        </div>
      </FormSection>
    </>
  );
}
