import { industryJobCategoryOptions } from "@/config/jobFilters/industryFilters";
import { researchJobCategoryOptions } from "@/config/jobFilters/researchFilters";
import { MOCK_TODAY_DATE } from "@/config/mockToday";

/** 개인 가입 프로필의 "소속 유형". 리크루트의 JobTrack(산업/연구/병원/약국)과는 별개 축이다. */
export type MemberAffiliationId =
  | "pharma_bio"
  | "cro_cdmo"
  | "medical_device"
  | "distribution"
  | "hospital"
  | "pharmacy"
  | "research"
  | "government"
  | "finance"
  | "media"
  | "student"
  | "job_seeking"
  | "etc";

export interface MemberOption {
  id: string;
  label: string;
}

export const memberAffiliationOptions: Array<{ id: MemberAffiliationId; label: string }> = [
  { id: "pharma_bio", label: "제약·바이오 기업" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "medical_device", label: "의료기기·진단" },
  { id: "distribution", label: "의약품 유통·도매" },
  { id: "hospital", label: "병원·의료기관" },
  { id: "pharmacy", label: "약국" },
  { id: "research", label: "연구기관·학계" },
  { id: "government", label: "정부·공공·협회" },
  { id: "finance", label: "투자·금융" },
  { id: "media", label: "언론·미디어" },
  { id: "student", label: "학생" },
  { id: "job_seeking", label: "구직 중" },
  { id: "etc", label: "기타" },
];

/** 산업/연구 직무는 여기서 목록을 다시 적지 않고 공고 필터의 정본에서 **대분류만** 가져온다(소분류 미사용). */
const industryJobGroups: MemberOption[] = industryJobCategoryOptions.map(({ id, label }) => ({ id, label }));
const researchJobGroups: MemberOption[] = researchJobCategoryOptions.map(({ id, label }) => ({ id, label }));

/** 아래 4종은 리크루트 직무 분류와 별개 축이라 여기서 직접 정의한다. */
const hospitalRoleOptions: MemberOption[] = [
  { id: "pharmacist", label: "약사" },
  { id: "doctor", label: "의사" },
  { id: "nurse", label: "간호사" },
  { id: "herbal_pharmacist", label: "한약사" },
  { id: "clinical_trial", label: "임상시험(CRC 등)" },
  { id: "admin_etc", label: "행정·기타" },
];

const pharmacyRoleOptions: MemberOption[] = [
  { id: "owner_pharmacist", label: "대표약사" },
  { id: "staff_pharmacist", label: "근무약사" },
  { id: "herbal_pharmacist", label: "한약사" },
  { id: "etc", label: "기타" },
];

const governmentRoleOptions: MemberOption[] = [
  { id: "pharmacist", label: "약사" },
  { id: "medical", label: "의사·의료인" },
  { id: "researcher", label: "연구직" },
  { id: "policy", label: "행정·정책" },
  { id: "etc", label: "기타" },
];

const studentMajorOptions: MemberOption[] = [
  { id: "pharmacy", label: "약학" },
  { id: "medicine_nursing", label: "의학·간호" },
  { id: "life_science", label: "생명과학" },
  { id: "chemistry_engineering", label: "화학·공학" },
  { id: "business_humanities", label: "경영·인문" },
  { id: "etc", label: "기타" },
];

/** 구직 중 = 신입 선택지 + 산업 직무 대분류 + 면허 직군. 산업 id와 겹치는 값이 없다. */
const jobSeekingOptions: MemberOption[] = [
  { id: "none_new", label: "아직 없음(신입)" },
  ...industryJobGroups,
  { id: "pharmacist", label: "약사" },
  { id: "herbal_pharmacist", label: "한약사" },
  { id: "nurse", label: "간호사" },
];

/** 학년 저장의 기준 연도. 실제 시계가 아니라 시연 기준일에서 뽑는다. */
export const GRADE_BASE_YEAR = MOCK_TODAY_DATE.getFullYear();

/**
 * 학년은 해마다 올라가므로 값 하나로는 시간이 지나면 틀린 정보가 된다.
 * "어느 해 기준의 몇 학년"으로 저장해 두면 나중에 경과 연수를 더해 현재 학년을 계산할 수 있다.
 */
export interface StudentGrade {
  /** baseYear 시점의 학년(1~6). 전공별로 라벨만 다르고 숫자 체계는 하나다 */
  grade: number;
  baseYear: number;
}

/**
 * 라벨 목록에서 학년 선택지를 만든다 — 번호는 순서에서 뽑는다.
 * id를 손으로 적으면 라벨과 번호가 갈릴 자리가 생기고, 그 어긋남은 저장된 값이 틀려야 드러난다.
 */
function gradeOptions(labels: string[]): MemberOption[] {
  return labels.map((label, index) => ({ id: String(index + 1), label }));
}

/** 약대는 6년제다. 예비약사 인증이 붙는 유일한 전공이기도 하다. */
const pharmacyGradeOptions = gradeOptions(["1학년", "2학년", "3학년", "4학년", "5학년", "6학년"]);

/**
 * 의·치·한의는 예과 2년 + 본과 4년이고 간호는 4년이다. 두 학제가 한 계열에 묶여 있어
 * 라벨은 6년제 쪽으로 두고, 4년제 전공자는 본과 1~4학년을 쓰도록 안내(hint)로 가른다.
 * 내부 값은 1~6으로 약학과 같다 — 저장 형태(StudentGrade)를 전공마다 갈라 두지 않는다.
 */
const medicineNursingGradeOptions = gradeOptions([
  "예과 1학년",
  "예과 2학년",
  "본과 1학년",
  "본과 2학년",
  "본과 3학년",
  "본과 4학년",
]);

/** 나머지 계열(생명과학·화학공학·경영인문·기타)은 4년제다. */
const fourYearGradeOptions = gradeOptions(["1학년", "2학년", "3학년", "4학년"]);

/** 어느 전공이든 저장 형태가 같으므로 이 문장은 공통이다. */
const GRADE_BASE_YEAR_HINT = `${GRADE_BASE_YEAR}년 기준으로 저장됩니다.`;

/** 예비약사 인증 대상 전공. 학생 2차 선택(전공 계열)의 id다. */
export const PRELIMINARY_PHARMACIST_MAJOR = "pharmacy";

/** 예비약사 인증 대상 학년. 약대 6학년(졸업예정자)만 해당한다. */
export const PRELIMINARY_PHARMACIST_GRADE = 6;

export interface StudentGradeField {
  options: MemberOption[];
  /** 학년 목록 아래 안내. 기준 연도 문장에 전공별 안내가 덧붙는다. */
  hint: string;
}

/**
 * 전공 계열별 학년 칸. 세 화면(가입·소속 확인·회원정보)이 이 하나를 함께 쓴다 —
 * 종전에는 1~6학년 한 벌을 전공 구분 없이 세 곳이 각자 렌더해, 의학·간호에 "5학년"이 뜨고
 * 4년제 전공에도 6학년이 남았다.
 *
 * 전공을 아직 고르지 않았으면 4년제로 둔다. 폼에서 전공 칸이 학년 칸보다 위에 있어 스쳐 가는
 * 상태이고, 전공을 고르는 순간 학년은 비워지므로(각 화면의 2차 선택 변경 처리) 남지 않는다.
 */
export function getStudentGradeField(majorId: string): StudentGradeField {
  if (majorId === PRELIMINARY_PHARMACIST_MAJOR) {
    return { options: pharmacyGradeOptions, hint: GRADE_BASE_YEAR_HINT };
  }
  if (majorId === "medicine_nursing") {
    return {
      options: medicineNursingGradeOptions,
      hint: `${GRADE_BASE_YEAR_HINT} 간호 등 4년제 전공은 본과 1~4학년을 선택해 주세요.`,
    };
  }
  return { options: fourYearGradeOptions, hint: GRADE_BASE_YEAR_HINT };
}

/**
 * 예비약사 자격의 만료 기준일 — "다가오는 약사 국가시험 이후".
 * 국시는 보통 1월이라 기준일이 1월 안이면 그해 1월 말, 아니면 다음 해 1월 말이 만료일이 된다.
 * 6학년은 1년이면 졸업하므로 이 자격은 영구적이지 않다.
 */
export function upcomingPharmacistExamExpiry(from: Date = MOCK_TODAY_DATE): string {
  const year = from.getMonth() === 0 ? from.getFullYear() : from.getFullYear() + 1;
  return `${year}.01.31`;
}

/**
 * 약대 6학년의 재학증명서 인증. 약사 면허 인증과는 별개 축이다
 * — 면허는 영구 자격이고 이쪽은 졸업하면 끝나는 한시 자격이다.
 *
 * 학생증은 받지 않는다. 학생증에는 대부분 학번과 이름만 있고 현재 학년이 없어
 * 6학년인지 확인할 수 없다. 학년이 찍히는 재학증명서만 받는다.
 */
export interface PreliminaryPharmacistVerification {
  /** 등록한 재학증명서 파일명. 목데이터 단계라 파일 자체는 보관하지 않는다. */
  certificateFileName: string;
  /**
   * 승인 시 확정되는 만료일. 승인 파이프라인이 아직 없어 지금은 항상 null이다.
   * 저장소가 붙으면 서버가 승인 시각 기준으로 계산해 이 자리에 기록한다.
   */
  expiresAt: string | null;
  /** 승인되면 만료일이 될 날짜 — upcomingPharmacistExamExpiry()로 미리 계산해 둔다. */
  expiresAtOnApproval: string;
}

export const memberPositionOptions: MemberOption[] = [
  { id: "intern", label: "인턴" },
  { id: "staff", label: "사원/신입" },
  { id: "assistant_manager", label: "주임/대리급" },
  { id: "manager", label: "과장급" },
  { id: "senior_manager", label: "차장/부장급" },
  { id: "executive", label: "임원급" },
  { id: "c_level", label: "최고경영진" },
  { id: "etc", label: "기타" },
];

export interface AffiliationSecondary {
  /** 2차 선택 필드 라벨 */
  label: string;
  /** 목록 위에 덧붙는 안내 문구 */
  hint?: string;
  options: MemberOption[];
}

export interface AffiliationConfig {
  /** 없으면 2차 선택 자체가 없는 소속 */
  secondary?: AffiliationSecondary;
  /** 소속명 입력 라벨. null이면 소속명 칸을 감춘다 */
  orgNameLabel: string | null;
  /** 학년 선택(학생 전용). 나오는 소속에서는 필수다 — 가입 폼과 소속 확인 화면이 함께 쓴다. */
  showGrade?: boolean;
  /** 직급 칸. 나오는 소속에서는 필수다(학생·구직 중은 애초에 감춘다). */
  showPosition: boolean;
  /**
   * auto     — 2차 선택이 licenseTriggerIds에 들면 면허 칸이 자동으로 나온다
   * checkbox — "약사 면허를 보유하고 있습니다" 체크 시 면허 칸이 나온다
   * none     — 면허 칸 없음
   */
  licenseMode: "auto" | "checkbox" | "none";
  licenseTriggerIds?: string[];
}

const COMPANY_LIKE: AffiliationConfig = {
  secondary: { label: "직무", options: industryJobGroups },
  orgNameLabel: "회사명",
  showPosition: true,
  licenseMode: "checkbox",
};

export const affiliationConfig: Record<MemberAffiliationId, AffiliationConfig> = {
  pharma_bio: COMPANY_LIKE,
  cro_cdmo: COMPANY_LIKE,
  medical_device: COMPANY_LIKE,
  distribution: COMPANY_LIKE,
  hospital: {
    secondary: { label: "직무", options: hospitalRoleOptions },
    orgNameLabel: "병원명",
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist", "herbal_pharmacist"],
  },
  pharmacy: {
    secondary: { label: "직무", options: pharmacyRoleOptions },
    orgNameLabel: "약국명",
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["owner_pharmacist", "staff_pharmacist", "herbal_pharmacist"],
  },
  research: {
    secondary: { label: "직무", options: researchJobGroups },
    orgNameLabel: "기관명",
    showPosition: true,
    licenseMode: "checkbox",
  },
  government: {
    secondary: { label: "직무", options: governmentRoleOptions },
    orgNameLabel: "기관명",
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist"],
  },
  finance: {
    orgNameLabel: "회사명",
    showPosition: true,
    licenseMode: "checkbox",
  },
  media: {
    orgNameLabel: "회사명",
    showPosition: true,
    licenseMode: "checkbox",
  },
  student: {
    secondary: { label: "전공 계열", options: studentMajorOptions },
    orgNameLabel: "학교명",
    showGrade: true,
    showPosition: false,
    licenseMode: "none",
  },
  job_seeking: {
    secondary: {
      label: "희망 직무",
      hint: "앞으로 희망하시는 직무를 선택해 주세요.",
      options: jobSeekingOptions,
    },
    orgNameLabel: null,
    showPosition: false,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist", "herbal_pharmacist"],
  },
  etc: {
    orgNameLabel: "소속명",
    showPosition: true,
    licenseMode: "checkbox",
  },
};

/**
 * 현재 소속·전공·학년에서 예비약사 인증 칸을 보여줄지.
 *
 * 약학 6학년만이다 — 종전에는 학년 칸이 있는 소속의 6학년이면 전공을 보지 않아, 의학·간호
 * 6학년(본과 4학년)에도 "예비약사 인증"이 떴다. 약사 면허 칸과는 서로 배타적이다
 * (학생 소속은 licenseMode가 "none"이라 면허 칸이 애초에 나오지 않는다).
 */
export function shouldShowPreliminaryPharmacist(
  config: AffiliationConfig,
  secondaryId: string,
  studentGrade: StudentGrade | null,
): boolean {
  return (
    Boolean(config.showGrade) &&
    secondaryId === PRELIMINARY_PHARMACIST_MAJOR &&
    studentGrade?.grade === PRELIMINARY_PHARMACIST_GRADE
  );
}

/** 현재 소속·2차 선택·체크박스 상태에서 약사 면허 칸을 보여줄지 */
export function shouldShowLicenseField(
  config: AffiliationConfig,
  secondaryId: string,
  hasLicenseChecked: boolean,
): boolean {
  if (config.licenseMode === "auto") return Boolean(secondaryId) && (config.licenseTriggerIds ?? []).includes(secondaryId);
  if (config.licenseMode === "checkbox") return hasLicenseChecked;
  return false;
}
