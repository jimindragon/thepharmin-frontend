import { industryJobCategoryOptions } from "@/config/jobFilters/industryFilters";
import { researchJobCategoryOptions } from "@/config/jobFilters/researchFilters";

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
  /** 학번 칸(학생 전용) */
  showStudentId: boolean;
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
  showStudentId: false,
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
    showStudentId: false,
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist", "herbal_pharmacist"],
  },
  pharmacy: {
    secondary: { label: "직무", options: pharmacyRoleOptions },
    orgNameLabel: "약국명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["owner_pharmacist", "staff_pharmacist", "herbal_pharmacist"],
  },
  research: {
    secondary: { label: "직무", options: researchJobGroups },
    orgNameLabel: "기관명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "checkbox",
  },
  government: {
    secondary: { label: "직무", options: governmentRoleOptions },
    orgNameLabel: "기관명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist"],
  },
  finance: {
    orgNameLabel: "회사명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "checkbox",
  },
  media: {
    orgNameLabel: "회사명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "checkbox",
  },
  student: {
    secondary: { label: "전공 계열", options: studentMajorOptions },
    orgNameLabel: "학교명",
    showStudentId: true,
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
    showStudentId: false,
    showPosition: false,
    licenseMode: "auto",
    licenseTriggerIds: ["pharmacist", "herbal_pharmacist"],
  },
  etc: {
    orgNameLabel: "소속명",
    showStudentId: false,
    showPosition: true,
    licenseMode: "checkbox",
  },
};

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
