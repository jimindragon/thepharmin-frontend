// ============================================================
// 병원 공고 상세 정본 (job/org 이원 구조)
// job = 공고 등록 폼(HospitalJobPostingForm) 입력값 / org = 병원 정보 관리 폼(HospitalOrgProfileClient) 입력값
// pharmacyJobDetails.ts와 동일한 패턴. 화면 렌더 정책: 중복 개념은 job 우선, job 빈값이면 org fallback
// 정형 선택지 = id 저장 + 라벨 매핑 상수로 표시 / 자유입력 = 입력 문자열 그대로
// 폼에 입력 UI가 없는 필드(specialtyLabel 등)는 이 정본에 포함하지 않는다.
// ============================================================

import { companyLogos } from "@/config/companyImages";
import { medicalDepartmentOptions, shiftTypeOptions } from "@/config/jobFilters/hospitalFilters";
import type { HospitalOperator, HospitalType } from "@/types/jobs";

export const employmentTypeLabelMap: Record<string, string> = {
  permanent: "정규직",
  contract: "계약직",
  intern: "인턴",
  "part-time": "파트타임",
  freelance: "프리랜서",
};

export const experienceLabelMap: Record<string, string> = {
  any: "경력무관",
  new: "신입",
  "under-1": "1년 미만",
  "1-3": "1~3년",
  "3-5": "3~5년",
  "5-10": "5~10년",
  "10-20": "10~20년",
  "20-plus": "20년 이상",
};

export const educationLabelMap: Record<string, string> = {
  any: "학력무관",
  associate: "전문학사",
  bachelor: "학사 (4년제)",
  pharmacy: "약사 면허",
  master: "석사",
  doctor: "박사",
  professional: "의약학 전문학위 (6년제)",
};

export const applyMethodLabelMap: Record<string, string> = {
  quick: "간편지원",
  phone: "전화 지원",
  email: "이메일 지원",
  homepage: "기업 홈페이지 지원",
};

/** 병원 공고폼(§3 근무조건) 복리후생 12종. 폼(WELFARE_OPTS)이 id 없이 라벨 문자열 자체를 값으로 쓰므로
 * 여기서는 동일 문자열의 항등 매핑으로 "라벨 매핑 상수" 관례를 맞춘다. */
export const hospitalBenefitLabelMap: Record<string, string> = {
  "퇴직연금": "퇴직연금",
  "연차·휴가": "연차·휴가",
  "의료비 지원": "의료비 지원",
  "식대 지원": "식대 지원",
  "구내식당": "구내식당",
  "당직·휴일수당": "당직·휴일수당",
  "교육 지원": "교육 지원",
  "학회·연수 지원": "학회·연수 지원",
  "전문약사 교육 지원": "전문약사 교육 지원",
  "경조사 지원": "경조사 지원",
  "직원 주차": "직원 주차",
  "기숙사·사택": "기숙사·사택",
};

/** config/jobFilters/hospitalFilters.ts의 shiftTypeOptions를 그대로 재사용한 id→라벨 매핑 */
export const shiftTypeLabelMap: Record<string, string> = Object.fromEntries(
  shiftTypeOptions.map((option) => [option.id, option.label]),
);

/** config/jobFilters/hospitalFilters.ts의 medicalDepartmentOptions(26종)를 그대로 재사용한 id→라벨 매핑 */
export const medicalDepartmentLabelMap: Record<string, string> = Object.fromEntries(
  medicalDepartmentOptions.map((option) => [option.id, option.label]),
);

export interface HospitalJobPosting {
  id: string;
  companyId: string;
  title: string;

  /** 모집 직무 1차·2차 라벨 (hospitalJobCategoryOptions와 1:1) */
  jobCategory: { main: string; sub: string };
  headcount: string;
  employmentTypeId: string;
  experienceId: string;
  educationId: string;
  isLeadership?: boolean;

  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred?: string[];

  /** shiftTypeOptions(config/jobFilters/hospitalFilters.ts)의 id */
  shiftTypeIds: string[];
  /** 근무 요일 — 폼의 월~일 칩 값 그대로 (WEEKDAY_OPTS) */
  workDays?: string[];
  address: string;
  /** 폼 급여 Segmented 값 그대로(예: "기관 내규", "3,000만↑") */
  salary: string;
  /** hospitalBenefitLabelMap의 키(=폼 WELFARE_OPTS 라벨) */
  benefitIds?: string[];
  workConditionDetail?: string;

  coreKeywords?: string[];
  additionalNotes?: string;
  detailImages?: string[];
  attachments?: { name: string; url: string }[];
  hiringProcess?: string[];
  requiredDocuments?: string[];

  /** 지원 정보: method 단일 id(applyMethodLabelMap). 로그인 잠금은 렌더 단계. */
  apply: {
    method: string;
    email: string;
    phone: string;
    notice: string;
  };
  deadlineLabel: string;
  isRolling: boolean;
}

export interface HospitalOrg {
  companyId: string;
  hospitalName: string;
  /** 병원 정보 관리 폼(HospitalOrgProfileClient) 필수 업로드 이미지. IndustryOrg.logoUrl과 동일 목적 */
  logoUrl?: string;

  /** hospitalTypeLabels(config/companyTypes.ts) 재사용 */
  hospitalTypeId: HospitalType;
  /** hospitalOperatorLabels(config/companyTypes.ts) 재사용 */
  hospitalOperatorId: HospitalOperator;
  foundedYear?: string;
  homepageUrl?: string;

  shortIntro: string;
  fullIntro?: string;
  keywords?: string[];

  bedCount?: string;
  /** medicalDepartmentLabelMap의 키(=medicalDepartmentOptions의 id) */
  medicalDepartments?: string[];
  pharmacyStaffCount?: string;
  dutySystem?: string;
  /** specialistPharmacistOptions(data/businessOrgProfile.ts)의 값 자체(라벨=값, 별도 id 체계 없음) */
  specialistPharmacists?: string[];
  pharmacyEnvironmentDescription?: string;

  /** 약국 V2(PharmacyOrg.location)와 동일 목적. 단, 병원 기관 폼엔 주차·교통 자유서술 필드가 없어
   * parkingTransit은 포함하지 않는다(폼에 입력 UI 없는 필드는 만들지 않는다는 원칙 적용). */
  location: {
    address: string;
    detailAddress: string;
  };
}

export interface HospitalJobDetail {
  id: string;
  slug: string;
  companyId: string;
  job: HospitalJobPosting;
  org: HospitalOrg;
}

// ---- 오산한국병원 정본 ----

export const osanHospitalJobDetail: HospitalJobDetail = {
  id: "osan-hankook-hospital-416",
  slug: "osan-korea-hospital-contract-sunday-oncall-pharmacist",
  companyId: "osan-hankook-hospital",

  job: {
    id: "osan-hankook-hospital-416",
    companyId: "osan-hankook-hospital",
    title: "계약직(휴직대체) 및 일요당직약사 채용",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "any",

    summary: "휴직 대체 및 일요일 당직 근무를 담당할 약사님을 모십니다.",
    responsibilities: [
      "외래·입원 처방 조제 및 감사",
      "병동 투약 관리 및 인수인계",
      "복약상담 및 의약품 관리",
    ],
    requirements: ["약사 면허 소지자"],
    preferred: ["병원 약제부 근무 경험자", "당직 근무 가능자"],

    shiftTypeIds: ["day_shift", "weekend_work"],
    workDays: ["일"],
    address: "경기 오산시 밀머리로1번길 16 오산한국병원 (신관 1층 약제과)",
    salary: "기관 내규",
    benefitIds: ["당직·휴일수당", "식대 지원", "직원 주차"],
    workConditionDetail:
      "일요일 당직 근무 중심의 계약직 포지션입니다. 당직 일정은 월 단위로 사전 협의하며, 당직·휴일수당이 지급됩니다.",

    coreKeywords: ["휴직대체", "일요당직", "종합병원", "경기남부"],
    // additionalNotes: 없음 — 추가 안내 섹션 숨김 검증 케이스
    // detailImages/attachments: 없음

    apply: {
      method: "email",
      email: "pharmacy-recruit@osan-hankook-hospital.example",
      phone: "",
      notice: "이력서와 약사 면허증 사본을 이메일로 보내 주세요. 당직 가능 요일을 함께 기재해 주세요.",
    },
    deadlineLabel: "채용 시 마감",
    isRolling: true,
  },

  org: {
    companyId: "osan-hankook-hospital",
    hospitalName: "오산한국병원",
    logoUrl: companyLogos["오산한국병원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "private",
    foundedYear: "1989",
    homepageUrl: "https://www.osan-hankook-hospital.example",

    shortIntro: "경기 오산 지역의 진료를 담당하는 종합병원입니다.",
    fullIntro:
      "오산한국병원은 지역 주민의 외래·입원 진료를 담당하는 종합병원입니다. 약제부는 조제와 복약상담, 병동 투약 관리를 함께 수행하며, 근무 일정과 인수인계 체계를 안정적으로 운영하고 있습니다.",
    keywords: ["종합병원", "경기남부", "당직근무", "안정적 처방"],

    bedCount: "320병상 내외",
    medicalDepartments: ["internal_medicine", "surgery", "orthopedics", "emergency_medicine", "radiology"],
    pharmacyStaffCount: "8명 내외",
    dutySystem:
      "평일은 정규 근무 체계로 운영되며, 일요일에는 당직 약사가 단독으로 근무합니다. 당직 일정은 월 단위로 사전 조율합니다.",
    specialistPharmacists: ["감염", "중환자"],
    pharmacyEnvironmentDescription:
      "약사와 지원 인력이 함께 근무하며, 당직 시 인수인계 문서를 기준으로 업무를 진행합니다. 처방 검토와 조제 감사는 이중 확인 절차를 유지하고 있습니다.",

    location: {
      address: "경기 오산시 밀머리로1번길 16 오산한국병원",
      detailAddress: "신관 1층 약제과",
    },
  },
};

// ---- 국군서울지구병원 정본 ----

export const armedForcesSeoulDistrictHospitalJobDetail: HospitalJobDetail = {
  id: "armed-forces-seoul-district-hospital-415",
  slug: "armed-forces-seoul-district-hospital-pharmacy-manager",
  companyId: "armed-forces-seoul-district-hospital",

  job: {
    id: "armed-forces-seoul-district-hospital-415",
    companyId: "armed-forces-seoul-district-hospital",
    title: "약제과장·약제담당 채용 (일반임기제 군무원)",

    jobCategory: { main: "관리·행정", sub: "약제부 관리" },
    headcount: "1명",
    employmentTypeId: "permanent",
    experienceId: "5-10",
    educationId: "pharmacy",
    isLeadership: true,

    summary: "약제부 운영을 담당할 관리 약사님을 모십니다.",
    responsibilities: [
      "약제부 운영 및 인력 관리",
      "의약품 수급·재고 관리",
      "처방 검토 및 조제 감사 총괄",
      "마약류 관리 및 약무 행정",
    ],
    requirements: ["약사 면허 소지자", "병원 약제부 경력 3년 이상"],
    preferred: ["약제부 관리 경력자", "마약류 관리 업무 경험자"],

    shiftTypeIds: ["day_shift"],
    workDays: ["월", "화", "수", "목", "금"],
    address: "서울 종로구 삼청로10길 13 국군서울지구병원",
    salary: "7,000만↑",
    benefitIds: ["연차·휴가", "의료비 지원", "교육 지원"],
    workConditionDetail: "주간 근무 중심이며, 규정에 따른 연차와 공휴일 휴무가 보장됩니다.",

    coreKeywords: ["군무원", "약제과장", "공공기관", "관리약사"],
    additionalNotes: "군 병원 특성상 채용 시 신원조회 절차가 진행됩니다.",
    // detailImages/attachments: 없음
    hiringProcess: ["서류 전형", "실무 면접", "신원조회", "최종합격"],
    requiredDocuments: ["이력서", "면허증 사본"],

    apply: {
      method: "email",
      email: "pharmacy-recruit@afsdh-hospital.example",
      phone: "",
      notice: "이력서와 경력증명서를 이메일로 제출해 주세요. 서류 검토 후 순차 안내드립니다.",
    },
    deadlineLabel: "2026년 8월 14일 마감",
    isRolling: false,
  },

  org: {
    companyId: "armed-forces-seoul-district-hospital",
    hospitalName: "국군서울지구병원",
    logoUrl: companyLogos["국군서울지구병원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "military",
    foundedYear: "1971",
    homepageUrl: "https://www.afsdh-hospital.example",

    shortIntro: "군 장병과 군무원의 진료를 담당하는 군 병원입니다.",
    fullIntro:
      "국군서울지구병원은 수도권 군 장병과 군무원의 외래·입원 진료를 담당하는 군 병원입니다. 약제부는 조제·투약 관리와 의약품 수급 관리를 수행하며, 규정에 따른 안정적인 근무 환경을 갖추고 있습니다.",
    keywords: ["군병원", "공공기관", "약제행정", "정규직"],

    bedCount: "150병상 내외",
    medicalDepartments: ["internal_medicine", "surgery", "orthopedics", "psychiatry", "rehabilitation_medicine"],
    pharmacyStaffCount: "12명 내외",
    dutySystem:
      "약제부는 주간 근무 체계로 운영되며, 별도 당직 근무는 없습니다. 처방 접수와 조제, 검수 업무가 규정에 따라 분담됩니다.",
    specialistPharmacists: ["감염", "정맥영양", "중환자"],
    pharmacyEnvironmentDescription:
      "약제부는 조제, 검수, 약무 행정으로 업무가 구분되어 있으며, 규정과 지침에 따라 표준화된 절차로 운영됩니다.",

    location: {
      address: "서울 종로구 삼청로10길 13 국군서울지구병원",
      detailAddress: "",
    },
  },
};

// ---- 국립소방병원 정본 ----

export const nationalFireHospitalJobDetail: HospitalJobDetail = {
  id: "national-fire-hospital-413",
  slug: "national-firefighters-hospital-pharmacy-staff",
  companyId: "national-fire-hospital",

  job: {
    id: "national-fire-hospital-413",
    companyId: "national-fire-hospital",
    title: "약무직 신규직원 채용",

    jobCategory: { main: "관리·행정", sub: "약무행정" },
    headcount: "7명",
    employmentTypeId: "permanent",
    experienceId: "any",
    educationId: "any",

    summary: "국립소방병원 약제부에서 함께 근무할 약사를 공개 채용합니다.",
    responsibilities: [
      "입원·외래 조제 업무",
      "주사제 조제 및 병동 불출 관리",
      "의약품 안전사용 관리 업무 지원",
    ],
    requirements: ["약사 면허 보유", "병원 약제부 근무 가능자"],
    preferred: ["병원 약무 경력자", "공공기관 근무 경험자"],

    shiftTypeIds: ["day_shift"],
    workDays: ["월", "화", "수", "목", "금"],
    address: "충북 음성군 맹동면 용두4길 19 국립소방병원",
    salary: "연봉 7,100~8,600만원",
    workConditionDetail:
      "주간 근무 중심으로 운영되며, 신설 병원 특성상 주거지원이 예정되어 있습니다.",

    coreKeywords: ["공공기관", "신입가능", "주거지원", "약무직", "종합병원"],
    // additionalNotes/detailImages: 없음
    attachments: [
      { name: "국립소방병원 약무직 신규직원 채용공고문.pdf", url: "#" },
      { name: "응시원서 및 자기소개서 양식.hwp", url: "#" },
    ],
    hiringProcess: ["서류전형", "1차 면접", "최종합격"],
    requiredDocuments: ["지원서 (지정 양식, 채용 공고문 참고)"],

    apply: {
      method: "homepage",
      email: "",
      phone: "",
      notice: "채용 공고문을 확인한 후 병원 홈페이지 채용 페이지에서 접수해 주세요.",
    },
    deadlineLabel: "2026년 7월 31일 마감",
    isRolling: false,
  },

  org: {
    companyId: "national-fire-hospital",
    hospitalName: "국립소방병원",
    logoUrl: companyLogos["국립소방병원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "public",
    foundedYear: "2025",
    homepageUrl: "https://www.nfh.example",

    shortIntro: "소방·재난 대응을 아우르는 공공 종합병원입니다.",
    fullIntro: "새롭게 문을 연 공공 종합병원에서 약제 업무 체계를 함께 만들어갈 약사를 찾습니다.",
    keywords: ["공공병원", "종합병원", "소방 특화", "신설"],

    bedCount: "302병상",
    medicalDepartments: ["internal_medicine", "surgery", "psychiatry", "rehabilitation_medicine"],
    dutySystem: "약제팀 교대 근무 기반, 공공병원 표준 근무 체계 운영",
    pharmacyEnvironmentDescription:
      "약제팀은 입원·외래 조제와 복약지도, 의약품 관리를 담당하며, 신설 병원 특성상 업무 체계를 함께 구축해갈 수 있습니다.",

    location: {
      address: "충북 음성군 맹동면 용두4길 19 국립소방병원",
      detailAddress: "",
    },
  },
};

// ---- 성애병원 정본 ----

export const sungaeHospitalJobDetail: HospitalJobDetail = {
  id: "sungae-hospital-414",
  slug: "sungae-hospital-morning-parttime-pharmacist",
  companyId: "sungae-hospital",

  job: {
    id: "sungae-hospital-414",
    companyId: "sungae-hospital",
    title: "오전 파트약사 모집",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "인원 미정",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "professional",

    summary: "평일 오전 시간대에 근무할 파트타임 약사를 모십니다.",
    responsibilities: ["외래 처방 조제 및 감사", "오전 시간대 복약 상담"],
    requirements: ["약사 면허 보유", "평일 오전 정기 근무 가능자"],
    preferred: ["병원 약제부 근무 경험자"],

    shiftTypeIds: ["day_shift"],
    workDays: ["월", "화", "수", "목", "금"],
    address: "서울 영등포구 여의대방로53길 22 성애병원",
    salary: "연봉 3,180~3,230만원",
    workConditionDetail: "평일 오전(08:30~12:30) 근무이며, 오후 시간 활용이 가능합니다.",

    coreKeywords: ["오전근무", "파트타임", "종합병원", "워라밸", "육아병행"],
    // detailImages/attachments/additionalNotes: 3종 모두 없음
    hiringProcess: ["서류전형", "1차 면접", "2차 면접", "최종합격"],
    requiredDocuments: [
      "입사지원서 (자사양식)",
      "졸업증명서 1부 (서류전형 합격자에 한함)",
      "약사 면허증 사본 1부 (서류전형 합격자에 한함)",
    ],

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요.",
    },
    deadlineLabel: "채용 시 마감",
    isRolling: true,
  },

  org: {
    companyId: "sungae-hospital",
    hospitalName: "성애병원",
    logoUrl: companyLogos["성애병원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "private",
    foundedYear: "1982",
    homepageUrl: "https://www.sungae-hospital.example",

    shortIntro: "다양한 진료과를 갖춘 지역 종합병원입니다.",
    fullIntro: "여러 진료과 처방을 다루는 종합병원에서 폭넓은 약제 경험을 쌓을 약사를 찾습니다.",
    keywords: ["종합병원", "응급의료", "지역 거점"],

    medicalDepartments: ["internal_medicine", "surgery", "emergency_medicine"],
    dutySystem: "약제팀 교대 근무 및 당직 체계, 응급 조제 대응 운영",
    specialistPharmacists: ["종양", "중환자", "감염"],
    pharmacyEnvironmentDescription:
      "약제팀은 입원·외래 조제와 다진료과 복약 관리를 담당하며, 응급 조제 대응 체계를 갖추고 있습니다.",

    location: {
      address: "서울 영등포구 여의대방로53길 22 성애병원",
      detailAddress: "",
    },
  },
};

export const hospitalJobDetails: HospitalJobDetail[] = [
  osanHospitalJobDetail,
  armedForcesSeoulDistrictHospitalJobDetail,
  nationalFireHospitalJobDetail,
  sungaeHospitalJobDetail,
];

export function getHospitalJobDetail(slug: string): HospitalJobDetail | undefined {
  return hospitalJobDetails.find((d) => d.slug === slug);
}
