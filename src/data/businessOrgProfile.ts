import type { HospitalOperator, HospitalType, LabInstitutionType, PharmacyType, ResearchStaffScale } from "@/types/jobs";
import { orgProfileDraftKey, type FileStatus, type OrgManager, type OrgVisibilitySettings } from "@/data/businessCompanyProfile";

/** 약국/병원 "기관 특징" 반복 입력 항목([제목 + 내용]). id는 편집 중 안정적인 key용으로만 쓰인다 */
export interface OrgFeatureItem {
  id: string;
  label: string;
  text: string;
}

export const pharmacySoftwareOptions = ["PM+20", "팜IT3000", "유팜", "이팜", "온팜", "기타"];

export const dispensingEquipmentOptions = ["자동조제기", "산제포장기", "계수기", "반자동정제분할기"];

export interface PharmacyOrgProfile {
  id: string;
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
  zipCode: string;
  address: string;
  detailAddress: string;
  foundedYear: string;
  headPharmacistName: string;
  phone: string;
  email: string;
  businessHours: string;
  // 공개 프로필
  logoUrl: string | null;
  coverImageUrl: string | null;
  shortIntro: string;
  /** 본문 소개(자유 서술) — 산업 트랙(BusinessCompanyProfileClient)의 fullIntro와 동일 목적 */
  fullIntro: string;
  features: OrgFeatureItem[];
  keywords: string[];
  // 근무·조제 환경
  staffPharmacistCount: string;
  staffSupportCount: string;
  avgDailyPrescriptions: string;
  mainDepartments: string;
  software: string;
  dispensingEquipment: string[];
  mainHospitals: string[];
  parkingTransit: string;
  visibilitySettings: OrgVisibilitySettings;
}

export const initialPharmacyOrgProfile: PharmacyOrgProfile = {
  id: "",
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
  zipCode: "",
  address: "",
  detailAddress: "",
  foundedYear: "",
  headPharmacistName: "",
  phone: "",
  email: "",
  businessHours: "",
  logoUrl: null,
  coverImageUrl: null,
  shortIntro: "",
  fullIntro: "",
  features: [],
  keywords: [],
  staffPharmacistCount: "",
  staffSupportCount: "",
  avgDailyPrescriptions: "",
  mainDepartments: "",
  software: "",
  dispensingEquipment: [],
  mainHospitals: [],
  parkingTransit: "",
  visibilitySettings: {
    publicPage: true,
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

export const specialistPharmacistOptions = [
  "감염", "내분비", "노인", "소아", "심혈관",
  "장기이식", "정맥영양", "종양", "중환자",
];

export interface HospitalOrgProfile {
  id: string;
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
  zipCode: string;
  address: string;
  detailAddress: string;
  foundedYear: string;
  bedCount: string;
  /** 진료과목(필수, 다중선택). medicalDepartmentOptions(config/jobFilters/hospitalFilters.ts)의 id를 재사용한다 */
  medicalDepartments: string[];
  homepageUrl: string;
  phone: string;
  email: string;
  // 공개 프로필
  logoUrl: string | null;
  coverImageUrl: string | null;
  shortIntro: string;
  /** 본문 소개(자유 서술) — 약국 트랙(PharmacyOrgProfile)의 fullIntro와 동일 목적. 선택 입력 */
  fullIntro?: string;
  features: OrgFeatureItem[];
  keywords: string[];
  // 약제부 근무 환경
  pharmacyStaffCount: string;
  dutySystem: string;
  specialistPharmacists: string[];
  pharmacyEnvironmentDescription: string;
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
  id: "",
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
  zipCode: "",
  address: "",
  detailAddress: "",
  foundedYear: "",
  bedCount: "",
  medicalDepartments: [],
  homepageUrl: "",
  phone: "",
  email: "",
  logoUrl: null,
  coverImageUrl: null,
  shortIntro: "",
  features: [],
  keywords: [],
  pharmacyStaffCount: "",
  dutySystem: "",
  specialistPharmacists: [],
  pharmacyEnvironmentDescription: "",
  visibilitySettings: {
    publicPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

/** 병원 §5(담당자 정보) 편집 state 초기값. businessCompanyManager(구 정적 상수)와 동일한 값을 그대로 옮겨
 * 편집 가능한 OrgManager state로 승격한다 — 문구·이름은 임의로 바꾸지 않는다. */
export const initialHospitalOrgManager: OrgManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

/** 약국 §5(담당자 정보) 편집 state 초기값. initialHospitalOrgManager와 동일한 이유로 businessCompanyManager
 * 값을 그대로 옮긴다 — 문구·이름은 임의로 바꾸지 않는다. */
export const initialPharmacyOrgManager: OrgManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

export function saveHospitalOrgProfileDraft(profile: HospitalOrgProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(orgProfileDraftKey("hospital"), JSON.stringify(profile));
}

export function readHospitalOrgProfileDraft(): HospitalOrgProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(orgProfileDraftKey("hospital"));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as HospitalOrgProfile;
  } catch {
    return null;
  }
}

export function savePharmacyOrgProfileDraft(profile: PharmacyOrgProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(orgProfileDraftKey("pharmacy"), JSON.stringify(profile));
}

export function readPharmacyOrgProfileDraft(): PharmacyOrgProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(orgProfileDraftKey("pharmacy"));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PharmacyOrgProfile;
  } catch {
    return null;
  }
}

export interface ResearchOrgProfile {
  id: string;
  orgTrack: "research";
  // 인증 정보 (읽기 전용) — 병원 패턴
  businessNumber: string;
  institutionName: string;
  representativeName: string;
  approvedAt: string;
  businessLicenseFile: { name: string; status: FileStatus };
  // 기관 정보 — 기본 사항·연락처 (병원과 동일 골격, 유형/병상 등 병원 특화 제외)
  zipCode: string;
  address: string;
  detailAddress: string;
  foundedYear: string;
  homepageUrl: string;
  phone: string;
  email: string;
  // 공개 프로필
  logoUrl: string | null;
  coverImageUrl: string | null;
  shortIntro: string;
  features: OrgFeatureItem[];
  keywords: string[];
  // 연구 환경
  /** 기관 유형. 빈값 시작(필수 입력). researchInstitutionTypeOptions의 id = LabInstitutionType */
  institutionType: "" | LabInstitutionType;
  /** 연구 분야(다중). researchFieldCategoryOptions의 서브 field id를 저장 */
  researchFieldIds: string[];
  /** 연구 인력 규모(단일, 선택). 빈값=미선택 */
  staffScale: ResearchStaffScale;
  /** 주요 연구 장비·인프라(자유서술) */
  equipmentInfra: string;
  /** 주요 연구 성과(자유서술) */
  achievements: string;
  visibilitySettings: OrgVisibilitySettings;
}

export const initialResearchOrgProfile: ResearchOrgProfile = {
  id: "",
  orgTrack: "research",
  businessNumber: "224-82-*****",
  institutionName: "한국과학기술연구원(KIST)",
  representativeName: "이길동",
  approvedAt: "2025.12.30",
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  // 가입 후 연구기관정보 관리 페이지에서 채우는 상세값 — 신규 가입 직후엔 비어 있어야 함
  zipCode: "",
  address: "",
  detailAddress: "",
  foundedYear: "",
  homepageUrl: "",
  phone: "",
  email: "",
  logoUrl: null,
  coverImageUrl: null,
  shortIntro: "",
  features: [],
  keywords: [],
  institutionType: "",
  researchFieldIds: [],
  staffScale: "",
  equipmentInfra: "",
  achievements: "",
  visibilitySettings: {
    publicPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

/** 연구 §5(담당자 정보) 편집 state 초기값. initialHospitalOrgManager와 동일한 이유로 businessCompanyManager
 * 값을 그대로 옮긴다 — 문구·이름은 임의로 바꾸지 않는다. */
export const initialResearchOrgManager: OrgManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

export function saveResearchOrgProfileDraft(profile: ResearchOrgProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(orgProfileDraftKey("research"), JSON.stringify(profile));
}

export function readResearchOrgProfileDraft(): ResearchOrgProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(orgProfileDraftKey("research"));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ResearchOrgProfile;
  } catch {
    return null;
  }
}
