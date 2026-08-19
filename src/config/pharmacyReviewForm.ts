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
 * 저장 타입(CompanyReview.pharmacyAnswers)은 이 파일에서 파생한다(PharmacyReviewAnswers) —
 * 선택지 id를 저장 쪽에 다시 적어 두면 문항을 고칠 때 두 곳이 갈린다. 문항이 이 파일의 정본이다.
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
  /** readonly인 것은 아래 정의들이 `as const`라서다 — 저장 타입(PharmacyReviewAnswers)이 이 배열에서
   * 선택지 id 유니온을 직접 뽑아 쓰므로, id가 string으로 넓어지면 안 된다. */
  choices: readonly PharmacyReviewChoice[];
}

/** 01 기본 정보 — 직무·작성자 상태(4트랙 공통) 아래에 약국만 추가로 받는 두 문항 */
export const pharmacyReviewBasicQuestions = [
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
] as const satisfies readonly PharmacyReviewQuestion[];

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
export const PHARMACY_REVIEW_RATING_LABEL = "이 약국에서의 근무 경험을 전반적으로 평가해 주세요.";
export const PHARMACY_REVIEW_RATING_MAX = 5;

/** 03 근무 환경 — 6문항. 강도 → 인력 → 휴게 → 퇴근 → 연차 → 급여 순으로, 하루 안에서 겪는 순서를 따른다. */
export const pharmacyReviewEnvironmentQuestions = [
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
] as const satisfies readonly PharmacyReviewQuestion[];

/** 04 근무 분위기 — 1문항 */
export const pharmacyReviewAtmosphereQuestion = {
  id: "atmosphere",
  label: "함께 일하는 분위기는 어땠나요?",
  choices: [
    { id: "good", label: "좋았어요" },
    { id: "fine", label: "무난했어요" },
    { id: "hard", label: "힘들었어요" },
  ],
} as const satisfies PharmacyReviewQuestion;

/** 05 종합 — 1문항. 위 문항들의 결론에 해당해 별도 섹션으로 세운다. */
export const pharmacyReviewRehireQuestion = {
  id: "rehireIntent",
  label: "이 약국에서 다시 근무할 의향이 있나요?",
  choices: [
    { id: "yes", label: "다시 근무하고 싶어요" },
    { id: "depends", label: "조건에 따라 고려할 것 같아요" },
    { id: "no", label: "다시 근무하고 싶지 않아요" },
  ],
} as const satisfies PharmacyReviewQuestion;

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
    placeholder: "예: 바쁜 시간대에는 휴게시간이 짧아지는 편이었어요.",
  },
];

/**
 * 서술 섹션 하단 안내. 약국은 근무 인원이 적어 특정 사건 하나로 작성자가 드러나는데,
 * 그 위험은 쓰기 직전이 아니라 쓰는 자리에서 알려야 읽힌다.
 *
 * 앞에 있던 위험 설명("특정 인물이나 구체적인 사건을 언급하면 작성자가 드러날 수 있어요")은 뺐다 —
 * 두 문장이 같은 말을 경고와 요청으로 두 번 하고 있었고, 쓰는 자리에서 필요한 것은 무엇을
 * 쓰라는 쪽이다.
 */
export const PHARMACY_REVIEW_PRIVACY_NOTICE =
  "개인을 특정할 수 있는 내용보다 근무 환경을 중심으로 작성해 주세요.";

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

/** 단일 선택 문항 10개를 정의 순서대로 한 줄에 세운 목록. 라벨 조회와 저장 타입 파생이 함께 쓴다. */
export const pharmacyReviewQuestions = [
  ...pharmacyReviewBasicQuestions,
  ...pharmacyReviewEnvironmentQuestions,
  pharmacyReviewAtmosphereQuestion,
  pharmacyReviewRehireQuestion,
] as const;

type PharmacyReviewQuestionUnion = (typeof pharmacyReviewQuestions)[number];

/** 문항 하나가 받을 수 있는 선택지 id 유니온 */
type ChoiceIdOf<Q extends { choices: readonly { id: string }[] }> = Q["choices"][number]["id"];

/**
 * 저장되는 답변 묶음. 각 키의 값 타입을 위 문항 정의에서 그대로 뽑아 쓴다 —
 * "workIntensity는 relaxed|moderate|busy|very_busy" 같은 목록을 저장 타입 쪽에 옮겨 적으면
 * 문항에서 선택지를 하나 지웠을 때 목데이터가 컴파일을 통과해 버린다.
 *
 * workYear만 문항이 아니라 연도 select라 number다(pharmacyReviewWorkYearOptions의 값).
 */
export type PharmacyReviewAnswers = {
  [Id in PharmacyReviewChoiceFieldId]: ChoiceIdOf<Extract<PharmacyReviewQuestionUnion, { id: Id }>>;
} & {
  /** 근무를 시작한 연도 */
  workYear: number;
};

/** 종합 평가 별점. 0(미평가)은 저장하지 않는다 — 값이 없으면 필드 자체가 없다. */
export type PharmacyReviewRating = 1 | 2 | 3 | 4 | 5;

/** 문항 id → 선택지 id → 라벨. 아래 조회 함수가 매번 배열을 훑지 않도록 모듈 로드 시 한 번만 만든다. */
const choiceLabelIndex = new Map<string, Map<string, string>>(
  pharmacyReviewQuestions.map((question) => [question.id, new Map(question.choices.map((choice) => [choice.id, choice.label]))]),
);

/**
 * 저장된 선택지 id를 화면 문구로 되돌린다. 카드·목록이 id를 그대로 찍지 않게 하는 유일한 통로다.
 *
 * 없는 id에는 undefined를 돌려준다 — 문항에서 선택지가 사라졌는데 옛 후기가 그 값을 들고 있는
 * 경우가 실제로 생기고, 그때 id 문자열("very_busy")이 화면에 그대로 찍히는 것보다 그 줄이
 * 빠지는 편이 낫다(호출부가 값 없음으로 다룬다).
 */
export function getPharmacyReviewChoiceLabel(field: PharmacyReviewChoiceFieldId, choiceId: string): string | undefined {
  return choiceLabelIndex.get(field)?.get(choiceId);
}

/**
 * 후기 카드에 값까지 펼쳐 보여 줄 문항 셋과 그때 쓰는 짧은 라벨.
 *
 * 열한 개를 다 늘어놓으면 카드가 표가 되고 목록에서 후기끼리 견줄 수 없어, 고를 때 가장 먼저 보는
 * 세 가지만 남긴다 — 얼마나 바쁜지, 정시에 나올 수 있는지, 그래서 다시 갈 것인지.
 *
 * 라벨을 문항 문구 대신 따로 두는 것은 문항이 묻는 말("업무 강도는 어땠나요?")이라서다.
 * 카드에서는 답을 이미 들고 있으므로 물음이 아니라 항목 이름이 필요하다.
 */
export const pharmacyReviewCardHighlights = [
  { field: "workIntensity", label: "업무 강도" },
  { field: "leaveOnTime", label: "퇴근시간" },
  { field: "rehireIntent", label: "재근무 의향" },
] as const satisfies readonly { field: PharmacyReviewChoiceFieldId; label: string }[];

/** 카드에서 서술 두 블록에 붙이는 라벨. 폼 쪽 라벨("좋았던 점을 알려주세요")은 묻는 말이라 읽는 화면에 맞지 않는다. */
export const pharmacyReviewNarrativeCardLabels: Record<PharmacyReviewNarrativeFieldId, string> = {
  goodPoints: "좋았던 점",
  badPoints: "아쉬웠던 점",
};
