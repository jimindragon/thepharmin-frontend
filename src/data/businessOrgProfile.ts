import type { HospitalOperator, HospitalType, PharmacyType } from "@/types/jobs";
import type { FileStatus } from "@/data/businessCompanyProfile";

/** 약국/병원 "기관 특징" 반복 입력 항목([제목 + 내용]). id는 편집 중 안정적인 key용으로만 쓰인다 */
export interface OrgFeatureItem {
  id: string;
  label: string;
  text: string;
}

export interface OrgVisibilitySettings {
  publicCompanyPage: boolean;
  exposeOnJobs: boolean;
  exposeOnSearch: boolean;
}

export const pharmacySoftwareOptions = ["PM+20", "팜IT3000", "유팜", "이팜", "온팜", "기타"];

export const dispensingEquipmentOptions = ["자동조제기", "산제포장기", "계수기", "반자동정제분할기"];

export interface PharmacyOrgProfile {
  orgTrack: "pharmacy";
  // 인증 정보 (읽기 전용)
  businessNumber: string;
  pharmacyName: string;
  representativeName: string;
  approvedAt: string;
  pharmacistLicenseNumber: string;
  institutionCode: string;
  pharmacistLicenseFile: { name: string; status: FileStatus };
  // 약국 정보 — 유형·특성
  pharmacyType: PharmacyType;
  /** 약국 특성, 단일선택(선택 항목). pharmacyFeatureOptions(config/jobFilters/pharmacyFilters.ts)의 id를 재사용 */
  pharmacyFeatureIds?: string;
  // 약국 정보 — 기본 사항·연락처
  address: string;
  foundedYear: string;
  headPharmacistName: string;
  phone: string;
  email: string;
  businessHours: string;
  // 공개 프로필
  logoUrl: string | null;
  shortIntro: string;
  features: OrgFeatureItem[];
  // 근무·조제 환경
  staffPharmacistCount: string;
  staffSupportCount: string;
  avgDailyPrescriptions: string;
  mainDepartments: string;
  software: string;
  dispensingEquipment: string[];
  parkingTransit: string;
  visibilitySettings: OrgVisibilitySettings;
}

export const initialPharmacyOrgProfile: PharmacyOrgProfile = {
  orgTrack: "pharmacy",
  // 가입 위저드(PharmacyVerificationStep)에서 받는 값 — 신규 가입자도 이미 가짐
  businessNumber: "123-45-67890",
  pharmacyName: "은행약국",
  representativeName: "정*래",
  approvedAt: "2025.12.28",
  pharmacistLicenseNumber: "제 12***호",
  institutionCode: "31*****9",
  pharmacistLicenseFile: { name: "약사면허증.pdf", status: "approved" },
  pharmacyType: "local",
  // 조제 특성 미선택(선택 항목) — 기존 clinic_front 하드코딩 값은 옵션 재정비로 제거됨
  pharmacyFeatureIds: undefined,
  // 가입 후 약국정보 관리 페이지에서 채우는 상세값 — 신규 가입 직후엔 비어 있어야 함
  address: "",
  foundedYear: "",
  headPharmacistName: "",
  phone: "",
  email: "",
  businessHours: "",
  logoUrl: null,
  shortIntro: "",
  features: [],
  staffPharmacistCount: "",
  staffSupportCount: "",
  avgDailyPrescriptions: "",
  mainDepartments: "",
  software: "",
  dispensingEquipment: [],
  parkingTransit: "",
  visibilitySettings: {
    publicCompanyPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

/** 브랜드 페이지 미리보기의 "부족한 정보 채우기"가 참조하는 약국 트랙 필수/권장 항목.
 * getMissingRequiredCompanyFields(businessCompanyProfile.ts)와 동일한 목적의 약국 전용 버전 — 산업 트랙과
 * 필드 구성이 달라 하나의 배열로 합치지 않는다. */
export const requiredPharmacyProfileFields: Array<{ label: string; sectionId: string; missing: (profile: PharmacyOrgProfile) => boolean }> = [
  { label: "대표 주소", sectionId: "pharmacy-info", missing: (p) => !p.address.trim() },
  { label: "개국 연도", sectionId: "pharmacy-info", missing: (p) => !p.foundedYear.trim() },
  { label: "약국 전화번호", sectionId: "pharmacy-info", missing: (p) => !p.phone.trim() },
  { label: "이메일", sectionId: "pharmacy-info", missing: (p) => !p.email.trim() },
  { label: "약국 로고", sectionId: "profile", missing: (p) => !p.logoUrl },
  { label: "한 줄 소개", sectionId: "profile", missing: (p) => !p.shortIntro.trim() },
  { label: "약국 특징", sectionId: "profile", missing: (p) => p.features.length === 0 },
];

export function getMissingRequiredPharmacyFields(profile: PharmacyOrgProfile) {
  return requiredPharmacyProfileFields.filter((field) => field.missing(profile));
}

export const specialistPharmacistOptions = ["감염", "종양", "정맥영양(TPN)", "항응고"];

export interface HospitalOrgProfile {
  orgTrack: "hospital";
  // 인증 정보 (읽기 전용)
  businessNumber: string;
  institutionName: string;
  representativeName: string;
  approvedAt: string;
  institutionCode: string;
  businessLicenseFile: { name: string; status: FileStatus };
  // 병원 정보 — 유형
  /** 공고 등록 프리필 연동은 이번 구현 범위 아님. hospitalType은 공고 필터의 사업장 분류(hospitalTypeOptions)와 동일한 slug를 쓴다 */
  hospitalType: HospitalType;
  /** hospitalType이 "hospital"(병원)일 때만 노출되는 보건복지부 지정 전문병원 분야명. 선택 입력 */
  specialtyLabel: string;
  hospitalOperator: HospitalOperator;
  // 병원 정보 — 기본 사항·연락처
  address: string;
  foundedYear: string;
  bedCount: string;
  /** 진료과목(필수, 다중선택). medicalDepartmentOptions(config/jobFilters/hospitalFilters.ts)의 id를 재사용한다 */
  medicalDepartments: string[];
  homepageUrl: string;
  phone: string;
  email: string;
  // 공개 프로필
  logoUrl: string | null;
  shortIntro: string;
  features: OrgFeatureItem[];
  // 약제부 근무 환경
  pharmacyStaffCount: string;
  dutySystem: string;
  annualClinicalTrials: string;
  clinicalTrialCenterOperating: boolean;
  specialistPharmacists: string[];
  /** 약제부 업무 영역(선택, 다중선택). pharmacyDutyAreaOptions(config/jobFilters/hospitalFilters.ts)의 id를 재사용한다.
   * specialistPharmacists(전문약사 자격)와는 별개 개념(업무 vs 자격)이라 공존한다. */
  pharmacyDutyAreas: string[];
  visibilitySettings: OrgVisibilitySettings;
}

/** 브랜드 페이지 미리보기의 "부족한 정보 채우기"가 참조하는 병원 트랙 필수/권장 항목. requiredPharmacyProfileFields 참고 */
export const requiredHospitalProfileFields: Array<{ label: string; sectionId: string; missing: (profile: HospitalOrgProfile) => boolean }> = [
  { label: "대표 주소", sectionId: "hospital-info", missing: (p) => !p.address.trim() },
  { label: "설립 연도", sectionId: "hospital-info", missing: (p) => !p.foundedYear.trim() },
  { label: "대표 전화번호", sectionId: "hospital-info", missing: (p) => !p.phone.trim() },
  { label: "이메일", sectionId: "hospital-info", missing: (p) => !p.email.trim() },
  { label: "진료과목", sectionId: "hospital-info", missing: (p) => p.medicalDepartments.length === 0 },
  { label: "기관 로고", sectionId: "profile", missing: (p) => !p.logoUrl },
  { label: "한 줄 소개", sectionId: "profile", missing: (p) => !p.shortIntro.trim() },
  { label: "기관 특징", sectionId: "profile", missing: (p) => p.features.length === 0 },
];

export function getMissingRequiredHospitalFields(profile: HospitalOrgProfile) {
  return requiredHospitalProfileFields.filter((field) => field.missing(profile));
}

export const initialHospitalOrgProfile: HospitalOrgProfile = {
  orgTrack: "hospital",
  // 가입 위저드(OrgVerificationStep, institutionType==="hospital")에서 받는 값 — 신규 가입자도 이미 가짐
  businessNumber: "124-82-*****",
  institutionName: "분당서울대학교병원",
  representativeName: "송정한",
  approvedAt: "2025.12.30",
  institutionCode: "31*****2",
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  // 가입 후 병원정보 관리 페이지에서 채우는 상세값 — 신규 가입 직후엔 비어 있어야 함.
  // hospitalType/hospitalOperator는 가입 시 받지 않는 값이라 세그먼트 선택형 특성상 완전한 "빈값"이 없어
  // 가장 중립적인 기본 옵션(병원/민간)으로 둔다 — 상급종합병원·대학병원처럼 특정 지위를 미리 단정하지 않기 위함.
  hospitalType: "hospital",
  specialtyLabel: "",
  hospitalOperator: "private",
  address: "",
  foundedYear: "",
  bedCount: "",
  medicalDepartments: [],
  homepageUrl: "",
  phone: "",
  email: "",
  logoUrl: null,
  shortIntro: "",
  features: [],
  pharmacyStaffCount: "",
  dutySystem: "",
  annualClinicalTrials: "",
  clinicalTrialCenterOperating: false,
  specialistPharmacists: [],
  pharmacyDutyAreas: [],
  visibilitySettings: {
    publicCompanyPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};
