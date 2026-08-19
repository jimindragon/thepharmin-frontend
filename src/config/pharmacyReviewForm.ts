import { MOCK_TODAY_DATE } from "@/config/mockToday";

/**
 * 약국 재직 후기(기업 리뷰 중 track === "pharmacy") 전용 구조화 문항.
 *
 * 다른 세 트랙의 기업 리뷰는 여전히 "태그 + 자유서술" 한 벌이라 이 파일을 읽지 않는다 —
 * 약국은 근무 조건이 후기의 실질이고(근무 형태·휴게·정시 퇴근·연차), 그 값들은 자유서술에
 * 섞여 있으면 비교가 되지 않아 문항으로 받는다.
 *
 * 선택지 id는 표시 문구가 아니라 slug다. 이 프로젝트가 이미 그렇게 옮겨 온 자리이고
 * (pharmacyFeatureOptions·LabInstitutionType·HospitalType), 다음 단계인 표시·집계 개편이
 * 키로 삼을 값이라 문구가 다듬어져도 흔들리지 않아야 한다. 화면에 찍히는 것은 label뿐이다.
 *
 * 저장 타입(CompanyReview)은 이 단계에서 건드리지 않는다 — 폼은 로컬 state로만 값을 들고 있고,
 * 실제 저장·표시·집계는 다음 단계에서 붙는다.
 */

export interface PharmacyReviewChoice {
  id: string;
  label: string;
}

/** 단일 선택 문항 10개의 필드 키. 폼 state(Record)의 키가 이 union이라 문항이 늘면 초기값도 함께 걸린다. */
export type PharmacyReviewChoiceFieldId =
  | "workType"
  | "workPeriod"
  | "workIntensity"
  | "assistantStaff"
  | "breakTime"
  | "leaveOnTime"
  | "annualLeave"
  | "salary"
  | "atmosphere"
  | "rehireIntent";

export interface PharmacyReviewQuestion {
  id: PharmacyReviewChoiceFieldId;
  /** 화면의 FieldLabel에 그대로 찍는 문항 문구 */
  label: string;
  choices: PharmacyReviewChoice[];
}

/** 01 기본 정보 — 직무·작성자 상태(4트랙 공통) 아래에 약국만 추가로 받는 두 문항 */
export const pharmacyReviewBasicQuestions: PharmacyReviewQuestion[] = [
  {
    id: "workType",
    label: "근무 형태",
    choices: [
      { id: "full_time", label: "정규직(풀타임)" },
      { id: "part_time", label: "파트타임" },
      { id: "short_term", label: "단기·대체 근무" },
    ],
  },
  {
    id: "workPeriod",
    label: "근무 기간",
    choices: [
      { id: "under_3m", label: "3개월 미만" },
      { id: "3m_to_1y", label: "3개월~1년" },
      { id: "1y_to_3y", label: "1~3년" },
      { id: "over_3y", label: "3년 이상" },
    ],
  },
];

/** 01 기본 정보 — "근무 시기" 연도 select의 라벨 */
export const PHARMACY_REVIEW_WORK_YEAR_LABEL = "근무 시기";

/**
 * 근무 시기 연도 목록(최근 7년). 면접 후기의 "면접 시기"와 달리 **반기를 받지 않는다** —
 * 재직은 기간이라 시작 시점을 반기까지 쪼개도 읽는 쪽에 더해지는 것이 없고,
 * 기간 자체는 위 workPeriod 문항이 이미 받는다.
 *
 * 실제 시계를 쓰지 않는 것은 사이트 전역 원칙 그대로다(MOCK_TODAY_DATE).
 */
export const pharmacyReviewWorkYearOptions: number[] = Array.from(
  { length: 7 },
  (_, index) => MOCK_TODAY_DATE.getFullYear() - index,
);

/** 02 종합 평가 — 별점 */
export const PHARMACY_REVIEW_RATING_LABEL = "이 약국에서의 근무를 종합적으로 평가해 주세요";
export const PHARMACY_REVIEW_RATING_MAX = 5;

/** 03 근무 환경 — 6문항. 강도 → 인력 → 휴게 → 퇴근 → 연차 → 급여 순으로, 하루 안에서 겪는 순서를 따른다. */
export const pharmacyReviewEnvironmentQuestions: PharmacyReviewQuestion[] = [
  {
    id: "workIntensity",
    label: "업무 강도는 어땠나요?",
    choices: [
      { id: "relaxed", label: "여유로웠어요" },
      { id: "moderate", label: "적당했어요" },
      { id: "busy", label: "바빴어요" },
      { id: "very_busy", label: "매우 바빴어요" },
    ],
  },
  {
    id: "assistantStaff",
    label: "조제 보조인력이 있었나요?",
    choices: [
      { id: "yes", label: "있었어요" },
      { id: "no", label: "없었어요" },
    ],
  },
  {
    id: "breakTime",
    label: "점심·휴게시간은 잘 보장됐나요?",
    choices: [
      { id: "guaranteed", label: "잘 보장됐어요" },
      { id: "varied", label: "상황에 따라 달랐어요" },
      { id: "rarely", label: "거의 보장되지 않았어요" },
    ],
  },
  {
    id: "leaveOnTime",
    label: "정해진 퇴근시간이 잘 지켜졌나요?",
    choices: [
      { id: "mostly_kept", label: "대체로 잘 지켜졌어요" },
      { id: "sometimes_late", label: "가끔 늦어졌어요" },
      { id: "often_late", label: "자주 늦어졌어요" },
    ],
  },
  {
    id: "annualLeave",
    label: "연차나 휴무를 사용하기 편했나요?",
    choices: [
      { id: "easy", label: "편하게 사용할 수 있었어요" },
      { id: "some_pressure", label: "눈치가 조금 보였어요" },
      { id: "difficult", label: "사용하기 어려웠어요" },
    ],
  },
  {
    id: "salary",
    label: "급여 수준에 만족했나요?",
    choices: [
      { id: "satisfied", label: "만족했어요" },
      { id: "average", label: "보통이었어요" },
      { id: "disappointed", label: "아쉬웠어요" },
    ],
  },
];

/** 04 근무 분위기 — 1문항 */
export const pharmacyReviewAtmosphereQuestion: PharmacyReviewQuestion = {
  id: "atmosphere",
  label: "함께 일하는 분위기는 어땠나요?",
  choices: [
    { id: "good", label: "좋았어요" },
    { id: "fine", label: "무난했어요" },
    { id: "hard", label: "힘들었어요" },
  ],
};

/** 05 종합 — 1문항. 위 문항들의 결론에 해당해 별도 섹션으로 세운다. */
export const pharmacyReviewRehireQuestion: PharmacyReviewQuestion = {
  id: "rehireIntent",
  label: "이 약국에서 다시 근무할 의향이 있나요?",
  choices: [
    { id: "yes", label: "다시 근무하고 싶어요" },
    { id: "depends", label: "조건에 따라 고려할 것 같아요" },
    { id: "no", label: "다시 근무하고 싶지 않아요" },
  ],
};

export type PharmacyReviewNarrativeFieldId = "goodPoints" | "badPoints";

export interface PharmacyReviewNarrativeField {
  id: PharmacyReviewNarrativeFieldId;
  label: string;
  placeholder: string;
}

/** 07 상세 내용 — 한 칸짜리 자유서술을 좋았던 점·아쉬웠던 점 두 칸으로 가른다. */
export const pharmacyReviewNarrativeFields: PharmacyReviewNarrativeField[] = [
  {
    id: "goodPoints",
    label: "좋았던 점을 알려주세요",
    placeholder: "예: 조제 동선이 효율적이고, 궁금한 점을 편하게 물어볼 수 있는 분위기였어요",
  },
  {
    id: "badPoints",
    label: "아쉬웠던 점을 알려주세요",
    placeholder: "예: 성수기에는 휴게시간이 짧아지는 편이었어요",
  },
];

/**
 * 서술 섹션 하단 안내. 약국은 근무 인원이 적어 특정 사건 하나로 작성자가 드러나는데,
 * 그 위험은 쓰기 직전이 아니라 쓰는 자리에서 알려야 읽힌다.
 */
export const PHARMACY_REVIEW_PRIVACY_NOTICE =
  "특정 인물이나 구체적인 사건을 언급하면 작성자가 드러날 수 있어요. 개인을 특정할 수 있는 내용보다 근무 환경을 중심으로 작성해 주세요.";

/** 단일 선택 문항 10개의 폼 state. 미선택은 빈 문자열이다(Segmented의 토글 해제와 같은 값). */
export type PharmacyReviewChoiceState = Record<PharmacyReviewChoiceFieldId, string>;

export const emptyPharmacyReviewChoices: PharmacyReviewChoiceState = {
  workType: "",
  workPeriod: "",
  workIntensity: "",
  assistantStaff: "",
  breakTime: "",
  leaveOnTime: "",
  annualLeave: "",
  salary: "",
  atmosphere: "",
  rehireIntent: "",
};
