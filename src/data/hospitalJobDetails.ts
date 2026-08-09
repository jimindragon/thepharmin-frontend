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
      // 이 스키마엔 지원 URL 전용 필드가 없다. ApplyCard가 homepage일 때 target(=email)을
      // window.open에 그대로 넘기므로, jobs.ts 413의 applicationUrl을 이 자리에 둔다.
      method: "homepage",
      email: "https://recruit.nfh.example",
      phone: "",
      notice: "채용 공고문을 확인한 후 병원 홈페이지 채용 페이지에서 접수해 주세요.",
    },
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

// ---- 국립중앙의료원 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const nationalCentralHospitalJobDetail: HospitalJobDetail = {
  id: "national-central-hospital-410",
  slug: "nch-pharmacy-dept-manager",
  companyId: "national-central-hospital",

  job: {
    id: "national-central-hospital-410",
    companyId: "national-central-hospital",
    title: "약제부 관리 약사",

    jobCategory: { main: "관리·행정", sub: "약제부 관리" },
    headcount: "1명",
    employmentTypeId: "permanent",
    experienceId: "5-10",
    educationId: "pharmacy",

    summary: "약제부 운영과 의약품 관리를 총괄할 관리 약사님을 모십니다.",
    responsibilities: [
      "병동·응급실 처방 감사와 조제 운영 관리",
      "의약품 구매·재고와 마약류 관리 체계 운영",
      "DUR·처방 심사 및 약사위원회 업무 지원",
      "약제부 인력 근무 편성과 교육 관리",
    ],
    requirements: ["약사 면허 소지자", "병원 약제부 경력 5년 이상"],
    preferred: ["공공의료기관 근무 경험자", "약제부 관리·행정 업무 경험자"],

    shiftTypeIds: ["day_shift"],
    workDays: ["월", "화", "수", "목", "금"],
    address: "서울 중구 을지로 245 국립중앙의료원",
    salary: "기관 내규",
    benefitIds: ["연차·휴가", "의료비 지원", "구내식당", "교육 지원", "경조사 지원", "직원 주차"],
    workConditionDetail:
      "주간 근무(월–금 09:00–18:00) 중심이며, 보수는 공무원 보수 체계를 준용해 근속·호봉 기준으로 산정합니다.",

    coreKeywords: ["약제부 관리", "의약품 구매", "DUR", "처방심사", "공공기관"],
    additionalNotes:
      "본 채용은 블라인드 채용으로, 편견을 유발할 수 있는 요소를 지원서에 기재하지 않도록 유의해 주세요.",
    // detailImages/attachments: 없음
    hiringProcess: ["서류심사 (블라인드)", "NCS 기반 직무역량 면접", "최종합격"],
    requiredDocuments: ["이력서", "약사 면허증 사본", "경력증명서"],

    apply: {
      // 이 스키마엔 지원 URL 전용 필드가 없다. ApplyCard가 homepage일 때 target(=email)을
      // window.open에 그대로 넘기므로, jobs.ts 410의 applicationUrl을 이 자리에 둔다.
      method: "homepage",
      email: "https://recruit.nch.example",
      phone: "",
      notice: "채용 홈페이지에서 온라인 지원해 주세요. 블라인드 전형으로 진행됩니다.",
    },
    isRolling: false,
  },

  org: {
    companyId: "national-central-hospital",
    hospitalName: "국립중앙의료원",
    logoUrl: companyLogos["국립중앙의료원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "public",
    foundedYear: "1958",
    homepageUrl: "https://www.nmc.or.kr",

    shortIntro: "공공보건의료를 선도하는 국가중심병원입니다.",
    fullIntro:
      "1958년 설립된 국가중심병원으로, 메르스와 코로나19 등 국가 감염병 위기 대응의 중심 역할을 해왔습니다. 공공의료 격차 해소를 사명으로 하며, 중앙감염병병원 건립과 신축·이전을 추진하고 있습니다.",
    keywords: ["공공의료", "국가중심병원", "감염병 대응"],

    // bedCount/pharmacyStaffCount/medicalDepartments/specialistPharmacists: 없음 — 프로필에도 미등록이라 비워 둔다
    dutySystem:
      "야간은 3개 근무조가 3일 간격으로 교대하며, 주말·공휴일에는 단시간 약사가 별도 근무합니다.",
    pharmacyEnvironmentDescription:
      "병동 입원환자와 응급실 환자의 처방 감사·조제·투약, 복약지도, 반납약품 처리와 해외유입감염병 치료제 투약 업무를 수행합니다.",

    location: {
      address: "서울 중구 을지로 245",
      detailAddress: "약제부",
    },
  },
};

// ---- 서울대학교병원 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const snuhPharmacyStaffJobDetail: HospitalJobDetail = {
  id: "snuh-417",
  slug: "snuh-pharmacy-staff",
  companyId: "snuh",

  job: {
    id: "snuh-417",
    companyId: "snuh",
    title: "약무직 신규 직원 채용",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "15명",
    employmentTypeId: "permanent",
    experienceId: "any",
    educationId: "pharmacy",

    summary: "약제부에서 근무할 약무직 신규 직원을 모집합니다.",
    responsibilities: [
      "입원·외래 처방 조제 및 감사",
      "주사조제·복약상담 등 배치 파트별 약제 업무",
      "의약품 관리 및 약제 행정 지원",
    ],
    requirements: [
      "약사 면허 소지자 또는 취득 예정자(졸업예정자 지원 가능)",
      "국내 시행 공인영어성적 제출 가능자",
    ],
    preferred: ["병원 약제 실무 실습 경험자", "영어 의사소통 가능자"],

    shiftTypeIds: ["day_shift", "shift_work"],
    address: "서울 종로구 대학로 101 서울대학교병원",
    salary: "기관 내규",
    benefitIds: ["교육 지원", "학회·연수 지원", "전문약사 교육 지원"],
    workConditionDetail:
      "주간 근무 중심이며, 직무 특성에 따라 야간·휴일 근무와 교대 근무가 운영됩니다. 임용후보자 등록(유효기간 1년) 후 결원 발생 시 정규직으로 임용됩니다.",

    coreKeywords: ["상급종합병원", "전공약사", "블라인드 채용", "신입가능", "임상약료"],
    additionalNotes:
      "본 채용은 블라인드 공개채용입니다. 출신학교 등 편견 요소를 기재하지 않도록 유의해 주세요.",
    // detailImages/attachments: 없음
    hiringProcess: ["서류전형", "실무면접", "최종면접", "신체검사"],
    requiredDocuments: ["졸업(예정)증명서", "성적증명서", "공인영어성적표", "약사 면허증 사본(해당자)"],

    apply: {
      // 이 스키마엔 지원 URL 전용 필드가 없다. ApplyCard가 homepage일 때 target(=email)을
      // window.open에 그대로 넘기므로, jobs.ts 417의 applicationUrl을 이 자리에 둔다.
      method: "homepage",
      email: "https://recruit.snuh.example",
      phone: "",
      notice: "채용 홈페이지에서 온라인 지원해 주세요.",
    },
    isRolling: false,
  },

  org: {
    companyId: "snuh",
    hospitalName: "서울대학교병원",
    logoUrl: companyLogos["서울대학교병원"],

    hospitalTypeId: "tertiary",
    hospitalOperatorId: "university",
    foundedYear: "1978",
    homepageUrl: "https://www.snuh.org",

    shortIntro: "국가중앙병원 역할을 수행하는 상급종합병원입니다.",
    fullIntro:
      "서울 연건동에 위치한 상급종합병원으로, 본원과 어린이병원·암병원을 함께 운영합니다. 약제부는 입원·외래·주사조제, 임상약료, 의약정보, 소아·암병원 전담 파트로 나뉘어 있으며 조제 자동화 등 약제 업무 선진화를 추진하고 있습니다.",
    keywords: ["상급종합병원", "전공약사", "임상약료"],

    // bedCount/pharmacyStaffCount/medicalDepartments/specialistPharmacists: 없음 — 프로필에도 미등록이라 비워 둔다
    dutySystem: "직무 특성에 따라 야간·휴일 근무와 교대 근무가 운영됩니다.",
    pharmacyEnvironmentDescription:
      "약제부는 입원·외래·주사조제 파트와 임상약료, 의약정보, 소아·암병원 전담 파트로 구분되어 있으며, 1983년부터 전공약사 수련 제도를 운영하고 있습니다.",

    location: {
      address: "서울 종로구 대학로 101",
      detailAddress: "본관 지하 1층 약제부",
    },
  },
};

// ---- 제일정형외과병원 정본 ----

export const jeilOrthopedicHospitalJobDetail: HospitalJobDetail = {
  id: "jeil-orthopedic-hospital-411",
  slug: "jeil-orthopedic-hospital-parttime-pharmacist",
  companyId: "jeil-orthopedic-hospital",

  job: {
    id: "jeil-orthopedic-hospital-411",
    companyId: "jeil-orthopedic-hospital",
    title: "평일 단시간 근무 약사 모집 (수·목·금 오후)",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "1명",
    employmentTypeId: "part-time",
    experienceId: "3-5",
    educationId: "bachelor",

    summary: "수·목·금 오후 3시간 근무할 파트타임 약사를 모집합니다.",
    responsibilities: ["외래 처방 조제 및 감사", "의약품 재고 관리"],
    requirements: ["약사 면허 소지자", "경력 3년 이상"],
    preferred: ["인근 거주자"],

    shiftTypeIds: ["day_shift"],
    workDays: ["수", "목", "금"],
    address: "서울 강남구 영동대로 726 제일정형외과병원",
    salary: "시급 30,000원",
    // benefitIds: 없음 — jobs.ts 411의 benefits가 비어 있고 원본에도 복리후생 기재가 없다
    workConditionDetail: "주 3일 (수~금) 15:00~18:00 근무이며, 급여는 시급 30,000원입니다.",

    coreKeywords: ["파트타임", "단시간", "오후근무", "전문병원", "외래조제"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "1차 면접", "최종합격"],
    requiredDocuments: ["이력서", "자기소개서"],

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요. 이력서와 자기소개서를 함께 제출해 주세요.",
    },
    isRolling: true,
  },

  org: {
    companyId: "jeil-orthopedic-hospital",
    hospitalName: "제일정형외과병원",
    logoUrl: companyLogos["제일정형외과병원"],

    hospitalTypeId: "hospital",
    hospitalOperatorId: "private",
    // foundedYear/homepageUrl: 없음 — 원본에 근거 없음

    shortIntro: "서울 강남구 청담동에 위치한 정형외과 전문병원입니다.",
    fullIntro: "제일정형외과병원은 서울 강남구 청담동에 위치한 정형외과 전문병원입니다.",
    keywords: ["전문병원", "정형외과", "강남구 청담동"],

    // bedCount/pharmacyStaffCount/dutySystem/specialistPharmacists: 없음 — 원본에 근거 없음
    medicalDepartments: ["orthopedics"],
    pharmacyEnvironmentDescription: "외래 처방 조제와 의약품 재고 관리를 담당합니다.",

    location: {
      address: "서울 강남구 영동대로 726 제일정형외과병원",
      detailAddress: "",
    },
  },
};

// ---- 무주군립요양병원 정본 ----

export const mujuCountyCareHospitalJobDetail: HospitalJobDetail = {
  id: "muju-county-care-hospital-412",
  slug: "muju-county-care-hospital-twice-weekly-pharmacist",
  companyId: "muju-county-care-hospital",

  job: {
    id: "muju-county-care-hospital-412",
    companyId: "muju-county-care-hospital",
    title: "요양병원 약사 모집 (주 2회 근무)",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "1명",
    employmentTypeId: "permanent",
    experienceId: "any",
    educationId: "bachelor",

    summary: "주 2회 근무할 요양병원 약사를 모집합니다. 기숙사 또는 교통비 지원을 협의할 수 있습니다.",
    responsibilities: ["입원환자 처방 조제 및 감사", "의약품 재고 및 관리"],
    requirements: ["약사 면허 소지자", "신입·경력 1년 이상 지원 가능"],
    // preferred: 없음 — 원본에 우대 사항 표기 없음

    shiftTypeIds: ["day_shift"],
    // workDays: 없음 — 주 2회라는 횟수만 있고 요일이 특정되지 않았다
    address: "전북 무주군 무주읍 당산강변로 284 무주군립요양병원",
    salary: "월급 300만원",
    benefitIds: ["기숙사·사택"],
    workConditionDetail:
      "주 2회 09:00~18:00, 16시간 근무입니다. 기숙사 제공 또는 교통비 실비 지원을 협의할 수 있으며, 약무보조 1명과 자동약 포장기를 갖추고 있습니다.",

    coreKeywords: ["요양병원", "주2회", "기숙사", "지방근무", "유연근무"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "1차 면접", "최종합격"],
    requiredDocuments: ["이력서", "약사 면허증 사본"],

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요. 이력서와 약사 면허증 사본을 함께 제출해 주세요.",
    },
    isRolling: false,
  },

  org: {
    companyId: "muju-county-care-hospital",
    hospitalName: "무주군립요양병원",
    logoUrl: companyLogos["무주군립요양병원"],

    hospitalTypeId: "long-term",
    hospitalOperatorId: "public",
    // foundedYear/homepageUrl: 없음 — 원본에 근거 없음

    shortIntro: "전북 무주군 무주읍에 위치한 요양병원입니다.",
    fullIntro:
      "무주군립요양병원은 전북 무주군 무주읍에 위치한 요양병원으로, 사단법인 소산이 운영하고 있습니다.",
    keywords: ["요양병원", "군립", "지방근무"],

    // bedCount/medicalDepartments/pharmacyStaffCount/dutySystem/specialistPharmacists: 없음 — 원본에 근거 없음
    pharmacyEnvironmentDescription: "약무보조 1명과 자동약 포장기를 갖추고 입원환자 조제 업무를 담당합니다.",

    location: {
      address: "전북 무주군 무주읍 당산강변로 284 무주군립요양병원",
      detailAddress: "",
    },
  },
};

// ---- 한빛종합병원 정본 ----

export const hanbitGeneralHospitalJobDetail: HospitalJobDetail = {
  id: "hanbit-general-hospital-406",
  slug: "hanbit-hospital-multi-dept-pharmacist",
  companyId: "hanbit-general-hospital",

  job: {
    id: "hanbit-general-hospital-406",
    companyId: "hanbit-general-hospital",
    title: "약사 (입원조제·임상약사 동시모집)",

    // jobs.ts 406은 jobSubcategoryIds가 hospital_pharmacist·clinical_pharmacist 두 개지만 이 스키마의
    // jobCategory는 단일 쌍이라 입원·조제 약사로 단일화한다. 잃는 정보는 두 곳에 보존한다 —
    // 업무 구분은 responsibilities의 (공통)/(입원조제)/(ASP) 접두, 자격·급여 차이는 additionalNotes.
    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "총 2명",
    employmentTypeId: "permanent",
    // jobs.ts 406은 experienceMin 1·experienceMax null("경력 1년 이상")이라 하한 구간을 쓴다(411과 같은 방식).
    experienceId: "1-3",
    educationId: "pharmacy",

    summary: "2026년 하반기 약제부 확장을 앞두고 입원조제파트와 ASP팀 임상약사를 동시모집합니다.",
    responsibilities: [
      "(공통) 약사 면허 기반 처방 검토 및 의약품 관리",
      "(입원조제) 입원환자 처방 조제·감사, 마약·항암제 관리 보조",
      "(ASP) 중증 환자 약물 최적화 상담, 감염·항응고 프로토콜 모니터링",
      "(ASP) 처방 데이터 분석 및 약물 정보 제공",
    ],
    requirements: [
      "약사 면허 소지자",
      "입원조제파트: 경력 1년 이상 (신입 우대 가능)",
      "ASP팀: 경력 3년 이상, 임상 근무 경험 필수",
    ],
    preferred: [
      "전문약사 자격증 소지자 (심장, 항응고, 감염 등)",
      "EMR/처방 전산 시스템 운용 경험자",
      "다학제 팀 활동 경험자",
    ],

    shiftTypeIds: ["day_shift"],
    // workDays: 없음 — jobs.ts 406의 근무일정이 "주간 (09:00~18:00)"까지라 요일이 특정되지 않았다
    address: "서울 마포구 월드컵로 123 한빛종합병원",
    salary: "직군별 상이 (면접 후 협의)",
    // 4대보험·퇴직금은 hospitalBenefitLabelMap 12종에 없어 workConditionDetail 문장으로 옮겼다
    benefitIds: ["연차·휴가", "의료비 지원", "구내식당", "교육 지원", "경조사 지원", "직원 주차"],
    workConditionDetail:
      "주간 (09:00~18:00) 근무이며, ASP팀은 비직이 주 2~3회 있습니다. 급여는 직군별 내규 기준으로 면접 후 확정합니다. 4대보험과 퇴직금이 적용됩니다.",

    coreKeywords: ["입원조제", "임상약사", "처방검토", "다직종협업", "복수모집"],
    additionalNotes:
      "입원조제파트는 경력 1년 이상, ASP팀은 경력 3년 이상이며 임상 근무 경험이 필요합니다. 급여는 직군별로 상이하며 면접 후 협의합니다.",
    // detailImages/attachments/requiredDocuments: 없음 — jobs.ts 406에 근거 없음
    hiringProcess: ["서류심사", "실무면접", "최종합격"],

    apply: {
      method: "email",
      email: "recruit@hanbit-hospital.example",
      phone: "",
      notice: "이메일 제목에 '지원부문_성명'을 기재해 주세요. (예: 입원조제파트_홍길동)",
    },
    isRolling: false,
  },

  org: {
    companyId: "hanbit-general-hospital",
    hospitalName: "한빛종합병원",
    logoUrl: companyLogos["한빛종합병원"],

    hospitalTypeId: "general",
    hospitalOperatorId: "private",
    foundedYear: "1994년",
    // homepageUrl: 없음 — companies.ts website가 빈 값이다

    shortIntro: "서울 마포구에 위치한 지역 거점 종합병원입니다.",
    fullIntro:
      "한빛종합병원은 서울 마포구에 위치한 종합병원으로, 내과·외과·심장·항암 등 주요 진료과를 운영하며 지역 거점 의료기관 역할을 하고 있습니다.",
    // keywords/bedCount/pharmacyStaffCount/dutySystem: 없음 — companyProfiles.ts에 프로필이 없다
    // medicalDepartments: 없음 — companyDescription의 "내과·외과·심장·항암"은 자유서술이라 id로 승격하지 않는다
    // specialistPharmacists: 없음 — jobs.ts 406의 전문약사 언급은 지원자 우대 자격이지 기관 보유 현황이 아니다
    pharmacyEnvironmentDescription:
      "약제부는 이번 인력 확충을 통해 입원 환자 조제 서비스 질 향상과 임상약사 역할 확대를 동시에 추진합니다. 주간 근무 중심이며, ASP팀은 중증 환자 약물 상담·처방 검토·다직종 협업에 집중하는 역할입니다.",

    location: {
      address: "서울 마포구 월드컵로 123 한빛종합병원",
      detailAddress: "",
    },
  },
};

// ---- 국립특수의료원 정본 ----

export const nationalSpecialMedicalCenterJobDetail: HospitalJobDetail = {
  id: "national-special-medical-center-407",
  slug: "nsmc-clinical-specialist-pharmacist",
  companyId: "national-special-medical-center",

  job: {
    id: "national-special-medical-center-407",
    companyId: "national-special-medical-center",
    title: "임상·전문약사 (종양·감염 분야)",

    jobCategory: { main: "약사 직무", sub: "임상·전문약사" },
    headcount: "1명",
    employmentTypeId: "permanent",
    // jobs.ts 407은 experienceMin 3·experienceMax null("경력 3년 이상")이라 하한 구간을 쓴다.
    experienceId: "3-5",
    educationId: "pharmacy",

    summary: "전문약사 훈련 지정기관에서 종양·감염 분야 임상약사를 모집합니다.",
    responsibilities: [
      "종양·감염 환자 약물 모니터링 및 최적화 상담",
      "처방 검토 및 항생제 스튜어드십 프로그램 운영 참여",
      "다학제 팀 (의사·간호사·영양사) 협업",
      "약물 이상반응 보고 및 안전성 데이터 분석",
      "전공의·간호사 대상 약물 정보 교육",
    ],
    requirements: [
      "약사 면허 소지자",
      "경력 3년 이상 (병원 임상 근무 필수)",
      "종양 또는 감염 분야 임상 경험 보유자",
    ],
    preferred: [
      "전문약사 자격증 소지자 (종양, 감염, 중환자 등)",
      "영어 의학 논문 독해 가능자",
      "임상 연구 또는 QI 프로젝트 참여 경험자",
    ],

    shiftTypeIds: ["day_shift"],
    workDays: ["월", "화", "수", "목", "금"],
    address: "서울 중구 을지로 245 국립특수의료원",
    salary: "연봉 6,000만원 이상 (성과급 별도)",
    benefitIds: [
      "연차·휴가",
      "의료비 지원",
      "구내식당",
      "교육 지원",
      "학회·연수 지원",
      "전문약사 교육 지원",
      "경조사 지원",
      "직원 주차",
    ],
    workConditionDetail:
      "주간 (월~금 09:00~18:00) 근무이며, 급여는 연봉 6,000만원 이상 + 성과급 (호봉 기준)입니다. 전문약사 취득 비용 및 학회 참가비를 지원합니다. 4대보험과 퇴직금이 적용됩니다.",

    coreKeywords: ["전문약사", "종양약학", "감염관리", "임상약학", "처방분석"],
    // additionalNotes/detailImages/attachments/requiredDocuments: 없음 — jobs.ts 407에 근거 없음
    hiringProcess: ["서류심사", "1차 면접 (실무)", "2차 면접 (임원)", "신체검사 (채용검진)", "최종합격"],

    apply: {
      // 이 스키마엔 지원 URL 전용 필드가 없다. ApplyCard가 homepage일 때 target(=email)을
      // window.open에 그대로 넘기므로, jobs.ts 407의 applicationUrl을 이 자리에 둔다.
      method: "homepage",
      email: "https://recruit.nsmc.example",
      phone: "",
      notice: "채용 홈페이지에서 온라인 지원해 주세요.",
    },
    isRolling: false,
  },

  org: {
    companyId: "national-special-medical-center",
    hospitalName: "국립특수의료원",
    // logoUrl: companyLogos에 "국립특수의료원" 키가 없어 생략 — CompanyLogo가 이름 기반으로 폴백한다

    hospitalTypeId: "tertiary",
    hospitalOperatorId: "public",
    // foundedYear/homepageUrl: 없음 — 원본에 근거 없음

    shortIntro: "서울 중구 소재 상급종합병원이자 임상약사 훈련 지정기관입니다.",
    fullIntro:
      "국립특수의료원은 서울 중구 소재 상급종합병원으로, 감염병·종양·중환자 분야 전문 의료를 제공하며 임상약사 훈련 지정기관으로 운영되고 있습니다.",
    // keywords/bedCount/medicalDepartments/pharmacyStaffCount/dutySystem: 없음 — companyProfiles.ts에 프로필이 없다
    // specialistPharmacists: 없음 — jobs.ts 407의 "종양, 감염, 중환자"는 지원자 우대 자격이지 기관 보유 현황이 아니다
    pharmacyEnvironmentDescription:
      "약제팀은 종양, 감염, 중환자 분야의 임상약사 훈련 지정기관으로서, 전문약사 취득을 지원하는 교육 체계를 갖추고 있습니다.",

    location: {
      address: "서울 중구 을지로 245 국립특수의료원",
      detailAddress: "",
    },
  },
};

// ---- 한강상급종합병원 정본 ----

export const hmcseoulHospitalJobDetail: HospitalJobDetail = {
  id: "hmcseoul-hospital-408",
  slug: "hmcseoul-night-inpatient-pharmacist",
  companyId: "hmcseoul-hospital",

  job: {
    id: "hmcseoul-hospital-408",
    companyId: "hmcseoul-hospital",
    title: "야간전담 입원·조제 약사",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "1명",
    employmentTypeId: "contract",
    // jobs.ts 408은 experienceMin 1·experienceMax 5("경력 1~5년")인데 experienceId는 단일 구간이라
    // 하한에 맞춘 "1-3"을 쓴다. 상한 5년은 이 필드로 표현되지 않는다.
    experienceId: "1-3",
    educationId: "pharmacy",

    summary: "야간 전담 입원조제 약사로서 응급·입원 환자의 야간 조제·투약 관리를 담당합니다.",
    responsibilities: [
      "야간 입원환자 처방 조제 및 감사",
      "응급 투약 요청 처리 및 마약·고위험 의약품 관리",
      "야간 당직 의료진 협력 및 약물 정보 제공",
      "다음 근무자 인수인계 및 이상반응 보고",
    ],
    requirements: ["약사 면허 소지자", "경력 1년 이상 (병원 근무 경험 우대)", "야간 교대 근무 가능자"],
    preferred: ["상급종합병원 약제부 근무 경험자", "응급·중환자 조제 경험자"],

    shiftTypeIds: ["night_on_call", "shift_work"],
    // workDays: 없음 — 야간 교대라 요일이 특정되지 않았다
    address: "서울 용산구 이촌로 340 한강상급종합병원",
    salary: "연 9,000만원 수준 (야간수당 포함)",
    // 야간수당·비직수당은 hospitalBenefitLabelMap 12종에 없어(당직·휴일수당과 같은 항목이 아니다)
    // 4대보험·퇴직금과 함께 workConditionDetail 문장으로 옮겼다
    benefitIds: ["의료비 지원", "구내식당", "직원 주차"],
    workConditionDetail:
      "야간·비직 전담 (17:00 ~ 다음날 08:00) 근무입니다. 급여는 기본급 + 야간수당 + 비직수당으로 구성되며, 연간 수입은 약 9,000만원 수준 (수당 합산)입니다. 근무 형태는 격주 교대 또는 3인 순환 (입사 후 협의)입니다. 4대보험과 퇴직금이 적용되고, 사내식당에서 야식이 제공됩니다.",

    coreKeywords: ["야간전담", "입원조제", "야간수당", "비직수당", "교대근무"],
    // additionalNotes/detailImages/attachments/requiredDocuments: 없음 — jobs.ts 408에 근거 없음
    hiringProcess: ["서류심사", "면접 (1차)", "최종합격"],

    apply: {
      method: "email",
      email: "pharmrecruit@hmcseoul.example",
      phone: "",
      // jobs.ts 408에 applicationGuide가 없어 지원 방법만 안내한다
      notice: "이메일로 지원해 주세요.",
    },
    isRolling: false,
  },

  org: {
    companyId: "hmcseoul-hospital",
    hospitalName: "한강상급종합병원",
    // logoUrl: companyLogos에 "한강상급종합병원" 키가 없어 생략 — CompanyLogo가 이름 기반으로 폴백한다

    hospitalTypeId: "tertiary",
    hospitalOperatorId: "private",
    // foundedYear/homepageUrl: 없음 — 원본에 근거 없음

    shortIntro: "서울 용산구에 위치한 24시간 운영 상급종합병원입니다.",
    fullIntro:
      "한강상급종합병원은 서울 용산구에 위치한 상급종합병원으로, 응급·중환자·외상 분야에 특화된 24시간 운영 체계를 갖추고 있습니다.",
    // keywords/bedCount/medicalDepartments/pharmacyStaffCount/specialistPharmacists: 없음 — companyProfiles.ts에 프로필이 없다
    dutySystem: "야간·비직 전담 약사를 두고 격주 교대 또는 3인 순환으로 운영합니다.",
    pharmacyEnvironmentDescription:
      "약제부는 17:00부터 다음날 08:00까지 야간 교대 근무로 응급·입원 환자의 조제와 투약 관리를 담당합니다.",

    location: {
      address: "서울 용산구 이촌로 340 한강상급종합병원",
      detailAddress: "",
    },
  },
};

// ---- 미래요양병원 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const miraeCareHospitalJobDetail: HospitalJobDetail = {
  id: "mirae-care-hospital-409",
  slug: "mirae-care-weekend-parttime-pharmacist",
  companyId: "mirae-care-hospital",

  job: {
    id: "mirae-care-hospital-409",
    companyId: "mirae-care-hospital",
    title: "주말·파트타임 입원·조제 약사",

    jobCategory: { main: "약사 직무", sub: "입원·조제 약사" },
    headcount: "1명",
    employmentTypeId: "part-time",
    experienceId: "any",
    educationId: "pharmacy",

    summary: "주말 이틀 또는 하루만 근무 가능한 파트타임 입원조제 약사를 모집합니다.",
    responsibilities: ["주말 입원환자 처방 조제·감사", "의약품 재고 확인 및 관리", "주말 당직 의료진 협력"],
    requirements: ["약사 면허 소지자", "주말 근무 가능자 (경력 무관)"],
    preferred: ["병원 또는 약국 근무 경험자", "요양 환자 대상 조제 경험자"],

    shiftTypeIds: ["weekend_work"],
    workDays: ["토", "일"],
    address: "경기 수원시 팔달구 매산로 88 미래요양병원",
    salary: "시급 협의 (주 16시간 기준)",
    // 4대보험(시간 비례)·식사 제공은 hospitalBenefitLabelMap 12종에 없어 workConditionDetail 문장으로 옮겼다
    benefitIds: ["직원 주차"],
    workConditionDetail:
      "토·일 09:00~18:00 주 16시간 근무이며, 근무 옵션은 A안 토·일 / B안 토 또는 일 선택 (협의 가능)입니다. 급여는 시급 협의로 경력·자격 기준 면접 후 결정합니다. 4대보험이 시간 비례로 적용되고 식사가 제공됩니다.",

    coreKeywords: ["파트타임", "주말근무", "요양병원", "유연근무", "단시간"],
    // additionalNotes/detailImages/attachments/requiredDocuments: 없음 — jobs.ts 409에 근거 없음
    hiringProcess: ["서류심사", "면접", "최종합격"],

    apply: {
      method: "quick",
      email: "",
      phone: "",
      notice: "간편지원으로 접수해 주세요.",
    },
    isRolling: true,
  },

  org: {
    companyId: "mirae-care-hospital",
    hospitalName: "미래요양병원",
    logoUrl: companyLogos["미래요양병원"],

    hospitalTypeId: "long-term",
    hospitalOperatorId: "private",
    foundedYear: "2009년",
    // homepageUrl: 없음 — companies.ts website가 빈 값이다

    shortIntro: "노인성·만성질환 중심의 재활 요양병원입니다.",
    fullIntro:
      "미래요양병원은 경기 수원시 팔달구에 위치한 요양병원으로, 노인성 질환·만성질환 환자 중심의 입원 서비스를 운영하고 있습니다.",
    keywords: ["요양병원", "재활", "만성질환", "입원"],

    // bedCount/pharmacyStaffCount: 없음 — companyProfiles.ts에 metrics가 없다
    medicalDepartments: ["internal_medicine", "surgery", "neurosurgery", "family_medicine", "rehabilitation_medicine"],
    dutySystem: "약제팀 주간 근무 중심, 입원 환자 조제 대응 체계 운영",
    // specialistPharmacists: 없음 — 원본에 기관 보유 현황 기재가 없다
    pharmacyEnvironmentDescription: "입원 조제, 만성질환 복약 관리, 의약품 관리를 담당합니다.",

    location: {
      address: "경기 수원시 팔달구 매산로 88 미래요양병원",
      detailAddress: "",
    },
  },
};

export const hospitalJobDetails: HospitalJobDetail[] = [
  osanHospitalJobDetail,
  armedForcesSeoulDistrictHospitalJobDetail,
  nationalFireHospitalJobDetail,
  sungaeHospitalJobDetail,
  nationalCentralHospitalJobDetail,
  snuhPharmacyStaffJobDetail,
  jeilOrthopedicHospitalJobDetail,
  mujuCountyCareHospitalJobDetail,
  hanbitGeneralHospitalJobDetail,
  nationalSpecialMedicalCenterJobDetail,
  hmcseoulHospitalJobDetail,
  miraeCareHospitalJobDetail,
];

export function getHospitalJobDetail(slug: string): HospitalJobDetail | undefined {
  return hospitalJobDetails.find((d) => d.slug === slug);
}
