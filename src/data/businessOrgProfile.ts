import { companyLogos } from "@/config/companyImages";
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

export const pharmacySoftwareOptions = ["유팜", "팜IT3000", "팜트리", "비트", "이지팜", "기타"];

export const dispensingEquipmentOptions = ["자동조제기(ATC)", "파우치 포장기", "산제 분쇄기", "정제 분할기"];

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
  /** pharmacyFeatureOptions(config/jobFilters/pharmacyFilters.ts)의 id를 재사용 */
  pharmacyFeatureIds: string[];
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
  businessNumber: "123-45-67890",
  pharmacyName: "은행약국",
  representativeName: "정*래",
  approvedAt: "2025.12.28",
  pharmacistLicenseNumber: "제 12***호",
  institutionCode: "31*****9",
  pharmacistLicenseFile: { name: "약사면허증.pdf", status: "approved" },
  pharmacyType: "clinic-floor",
  pharmacyFeatureIds: ["clinic_front"],
  address: "경기 용인시 처인구 양지읍 양지로138번길 14 2층",
  foundedYear: "2026.02.11",
  headPharmacistName: "",
  phone: "031-123-4567",
  email: "eunhaeng@pharm.co.kr",
  businessHours: "평일 09:00~19:00 · 토요일 격주",
  logoUrl: null,
  shortIntro: "내과·이비인후과 의원 처방을 주로 조제하는 의원층 약국",
  features: [
    { id: "feature-1", label: "근무 형태", text: "주 5일 협의 가능, 마감 시간 준수 문화" },
    { id: "feature-2", label: "교육 루틴", text: "신규 약사 대상 조제 검토·복약지도 루틴 교육, 재고·마약류 관리 체계 정리됨" },
  ],
  staffPharmacistCount: "3",
  staffSupportCount: "2",
  avgDailyPrescriptions: "180",
  mainDepartments: "내과 · 이비인후과 · 정형외과",
  software: "유팜",
  dispensingEquipment: ["자동조제기(ATC)", "파우치 포장기"],
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
  businessNumber: "124-82-*****",
  institutionName: "분당서울대학교병원",
  representativeName: "송정한",
  approvedAt: "2025.12.30",
  institutionCode: "31*****2",
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  hospitalType: "tertiary",
  specialtyLabel: "",
  hospitalOperator: "university",
  address: "경기 성남시 분당구 구미로173번길 82",
  foundedYear: "2003",
  bedCount: "1,335",
  medicalDepartments: [
    "family_medicine",
    "tuberculosis",
    "internal_medicine",
    "anesthesiology_pain_medicine",
    "radiation_oncology",
    "pathology",
    "urology",
    "obstetrics_gynecology",
    "plastic_surgery",
    "pediatrics",
    "neurology",
    "neurosurgery",
    "ophthalmology",
    "radiology",
    "preventive_medicine",
    "surgery",
    "emergency_medicine",
    "otolaryngology",
    "rehabilitation_medicine",
    "psychiatry",
    "orthopedics",
    "occupational_environmental_medicine",
    "laboratory_medicine",
    "dermatology",
    "nuclear_medicine",
    "thoracic_surgery",
  ],
  homepageUrl: "www.snubh.org",
  phone: "031-787-0114",
  email: "pharm@snubh.org",
  logoUrl: companyLogos["분당서울대병원"],
  shortIntro: "진료와 임상연구를 함께 운영하는 상급종합병원",
  features: [
    { id: "feature-1", label: "신입 교육", text: "신입 약사 6개월 조제·병동 로테이션, 프리셉터 배정 운영" },
    { id: "feature-2", label: "임상연구 환경", text: "임상시험센터 상시 운영, CRC·연구약사 채용이 주기적으로 발생" },
    { id: "feature-3", label: "의료정보화", text: "국내 최초 전면 디지털 병원, HIMSS 최고 등급 인증 경험" },
  ],
  pharmacyStaffCount: "110명+",
  dutySystem: "야간 당직 월 2~3회",
  annualClinicalTrials: "600건+",
  clinicalTrialCenterOperating: true,
  specialistPharmacists: ["감염", "종양", "정맥영양(TPN)"],
  pharmacyDutyAreas: [],
  visibilitySettings: {
    publicCompanyPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};
