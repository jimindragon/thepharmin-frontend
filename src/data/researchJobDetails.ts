// ============================================================
// 연구 공고 상세 정본 (job/org 이원 구조)
// job = 공고 등록 폼(ResearchJobPostingForm) 입력값 / org = 연구 기관 정보 관리 폼(ResearchOrgProfileClient) 입력값
// hospitalJobDetails.ts와 동일한 패턴을 모델로 하되, 연구 트랙은 Company 엔티티가 없으므로
// companyId를 항상 null로 고정하고 기관 정보(org)를 이 파일 안에 인라인으로 보유한다
// (industryJobDetails.ts의 IndustryJobDetail.companyId: string | null nullable 패턴 참조).
// 로고 이미지 파일이 없어 logoUrl 대신 jobs.ts의 해당 공고가 가진 logoText/logoColor(이니셜 배지)를
// org로 그대로 옮겨 담는다.
// 폼(공고 등록 + 기관 정보)에 입력 UI가 없는 필드(researchDegree, researchEligibility,
// overseasSupport, institutionIntro, scope/country/secondment, researchDocuments,
// researchRecruitType 등)는 이 정본에 포함하지 않는다.
// 정형 선택지 = id 저장 + 라벨 매핑 상수로 표시 / 자유입력 = 입력 문자열 그대로
// ============================================================

import { educationOptions, employmentTypeOptions, experienceOptions, workModeOptions } from "@/config/jobFilters/shared";
import { researchInstitutionTypeOptions, researchStaffScaleOptions } from "@/config/jobFilters/researchFilters";

export const employmentTypeLabelMap: Record<string, string> = Object.fromEntries(
  employmentTypeOptions.map((option) => [option.id, option.label]),
);

export const experienceLabelMap: Record<string, string> = Object.fromEntries(
  experienceOptions.map((option) => [option.id, option.label]),
);

export const educationLabelMap: Record<string, string> = Object.fromEntries(
  educationOptions.map((option) => [option.id, option.label]),
);

/** config/jobFilters/shared.ts의 workModeOptions를 그대로 재사용한 id→라벨 매핑.
 * ResearchJobPosting.workMode 자체는 폼과 동일하게 라벨 문자열을 직접 저장한다(id 아님). */
export const workModeLabelMap: Record<string, string> = Object.fromEntries(
  workModeOptions.map((option) => [option.id, option.label]),
);

/** config/jobFilters/researchFilters.ts의 researchInstitutionTypeOptions를 그대로 재사용한 id→라벨 매핑 */
export const institutionTypeLabelMap: Record<string, string> = Object.fromEntries(
  researchInstitutionTypeOptions.map((option) => [option.id, option.label]),
);

/** config/jobFilters/researchFilters.ts의 researchStaffScaleOptions를 그대로 재사용한 id→라벨 매핑 */
export const staffScaleLabelMap: Record<string, string> = Object.fromEntries(
  researchStaffScaleOptions.map((option) => [option.id, option.label]),
);

/** ResearchJobPostingForm §6 지원 방식(url/quick/email) 3종에 대응. 병원 폼의 4종(quick/phone/email/homepage)과는
 * 값 체계가 다르므로 별도로 정의한다. */
export const applyMethodLabelMap: Record<string, string> = {
  url: "기관 채용페이지 지원",
  quick: "더파마 간편지원",
  email: "이메일 지원",
};

/** 연구 공고폼(§4 근무조건) 복리후생 12종. 폼(WELFARE_OPTS)이 id 없이 라벨 문자열 자체를 값으로 쓰므로
 * hospitalBenefitLabelMap과 동일하게 동일 문자열의 항등 매핑으로 관례를 맞춘다. */
export const researchBenefitLabelMap: Record<string, string> = {
  "연차·휴가": "연차·휴가",
  "유연근무제": "유연근무제",
  "식대 지원": "식대 지원",
  "교통 지원": "교통 지원",
  "주거 지원": "주거 지원",
  "건강검진": "건강검진",
  "교육 지원": "교육 지원",
  "어학 지원": "어학 지원",
  "학회·세미나 지원": "학회·세미나 지원",
  "연구활동 지원": "연구활동 지원",
  "논문·출판 지원": "논문·출판 지원",
  "장비·인프라 지원": "장비·인프라 지원",
};

export interface ResearchJobPosting {
  id: string;
  title: string;

  /** 모집 직무 1차·2차 라벨 (researchJobCategoryOptions와 1:1) */
  jobCategory: { main: string; sub: string };
  headcount: string;
  employmentTypeId: string;
  experienceId: string;
  educationId: string;

  summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred?: string[];

  /** 폼 근무 방식 select 대응. workModeOptions의 라벨 문자열을 직접 저장한다. */
  workMode: string;
  address: string;
  /** 폼 급여 Segmented 값 그대로(예: "기관 내규", "5,000만↑") */
  salary: string;
  /** 폼 §4 "계약 기간" select 대응. contractPeriodOptions의 라벨 문자열을 직접 저장한다(id 아님). */
  contractPeriod?: string;
  /** researchBenefitLabelMap의 키(=폼 WELFARE_OPTS 라벨) */
  benefitIds?: string[];
  workConditionDetail?: string;

  keywords?: string[];
  additionalNotes?: string;
  detailImages?: string[];
  attachments?: { name: string; url: string }[];

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

export interface ResearchOrg {
  institutionName: string;
  /** 로고 이미지 파일이 없어 jobs.ts의 logoText/logoColor(이니셜 배지)를 그대로 옮겨 담는다 */
  logoText: string;
  logoColor: string;

  /** institutionTypeLabelMap의 키(=researchInstitutionTypeOptions의 id) */
  institutionTypeId: string;
  foundedYear?: string;
  homepageUrl?: string;

  shortIntro: string;
  fullIntro?: string;
  keywords?: string[];

  /** researchFieldCategoryOptions(config/researchFields.ts) 소분류 id 목록 */
  researchFields?: string[];
  /** staffScaleLabelMap의 키(=researchStaffScaleOptions의 id) */
  staffScaleId?: string;

  /** 폼 §2 "연구실 정보" 대응 — 기관 산하 개별 연구실 단위 정보 */
  labName?: string;
  piName?: string;
  labHomepageUrl?: string;
  labIntro?: string;

  equipmentInfra?: string;
  achievements?: string;

  location: {
    address: string;
    detailAddress: string;
  };
}

export interface ResearchJobDetail {
  id: string;
  slug: string;
  /** 연구 트랙은 Company 엔티티가 없으므로 항상 null로 고정한다. org 정보는 이 정본 안에 인라인으로 보유한다. */
  companyId: null;
  job: ResearchJobPosting;
  org: ResearchOrg;
}

// ---- 한국과학기술연구원(KIST) 정본 ----

export const kistNeurochannelPostdocJobDetail: ResearchJobDetail = {
  id: "kist-neurochannel-postdoc",
  slug: "kist-neurochannel-postdoc",
  companyId: null,

  job: {
    id: "kist-neurochannel-postdoc",
    title: "서울 KIST, 신경생리연구실, 포스닥 구인 (중추신경발달, 오가노이드, 정신질환)",

    jobCategory: { main: "연구직", sub: "박사후연구원·포닥" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "doctor",

    summary: "중추신경 분야 연구를 함께할 박사후연구원을 모집합니다.",
    responsibilities: [
      "중추신경 관련 연구 과제 수행",
      "실험 설계 및 데이터 분석",
      "연구 결과 정리 및 논문 작성",
      "연구실 세미나 및 공동 연구 참여",
    ],
    requirements: ["생명과학·신경과학 등 관련 분야 박사 학위 소지자(또는 취득 예정자)"],
    preferred: ["전기생리학 또는 분자신경과학 실험 경험자", "영어 논문 작성 경험자"],

    workMode: "연구실 근무",
    address: "서울 성북구 화랑로14길 5 한국과학기술연구원(KIST)",
    salary: "5,000만↑",
    contractPeriod: "과제 기간 연동",
    benefitIds: ["학회·세미나 지원", "장비·인프라 지원"],
    workConditionDetail:
      "계약 기간은 연 단위이며, 연구 성과와 과제 상황에 따라 갱신을 협의합니다. 4대 보험이 적용됩니다.",

    keywords: ["neurogenesis", "중추신경발달", "이온채널", "뇌오가노이드", "칼슘이미징", "RNAscope"],
    additionalNotes:
      "지원 서류는 이력서와 연구 실적 목록을 포함해 제출해 주세요. 서류 검토 후 개별 면접 일정을 안내드립니다.",
    // detailImages/attachments: 없음

    apply: {
      method: "email",
      email: "neurochannel-recruit@kist.re.kr",
      phone: "",
      notice: "이력서(연구 실적 목록 포함)와 영문 자기소개서를 이메일로 제출해 주세요.",
    },
    deadlineLabel: "채용 시 마감",
    isRolling: true,
  },

  org: {
    institutionName: "한국과학기술연구원(KIST)",
    logoText: "KIST",
    logoColor: "#1e3a5f",

    institutionTypeId: "government_research_institute",
    foundedYear: "1966",
    homepageUrl: "https://www.kist.re.kr",

    shortIntro: "기초·응용 융합 연구를 수행하는 정부출연연구기관입니다.",
    fullIntro:
      "한국과학기술연구원(KIST)은 다양한 분야의 기초·응용 연구를 수행하는 정부출연연구기관입니다. 연구 그룹별로 독립적인 연구 주제를 운영하며, 공동 장비와 연구 지원 체계를 갖추고 있습니다.",
    keywords: ["정부출연연구기관", "뇌과학연구소", "융합연구"],

    researchFields: ["neuroscience", "disease-model"],
    staffScaleId: "51_100",

    labName: "중추신경 연구그룹",
    // piName: 없음 — 행 숨김 검증 케이스
    labIntro:
      "중추신경 발달과 신경질환 기전을 연구하는 그룹입니다. 전기생리학과 분자신경과학 기법을 함께 활용합니다.",

    equipmentInfra:
      "연구 그룹 단위의 실험 공간과 공동 기기실을 운영하며, 실험 장비와 분석 인프라를 공동으로 활용할 수 있습니다.",
    achievements: "국내외 학술지 논문 발표와 국가 연구 과제 수행을 지속하고 있습니다.",

    location: {
      address: "서울 성북구 화랑로14길 5",
      detailAddress: "한국과학기술연구원(KIST)",
    },
  },
};

// ---- 서울아산병원 대장항문외과 정본 ----

export const amcColorectalSurgeryResearcherJobDetail: ResearchJobDetail = {
  id: "amc-colorectal-surgery-researcher",
  slug: "amc-colorectal-surgery-researcher",
  companyId: null,

  job: {
    id: "amc-colorectal-surgery-researcher",
    title: "서울아산병원 대장항문외과 연구원 채용",

    jobCategory: { main: "연구직", sub: "연구원" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "대장항문외과 연구를 함께할 연구원을 모집합니다.",
    responsibilities: [
      "연구 과제 관련 실험 수행 및 데이터 정리",
      "연구 시료 관리",
      "연구 행정 및 과제 보고 지원",
    ],
    requirements: ["생명과학 관련 분야 석사 학위 이상"],
    preferred: ["세포·분자생물학 실험 경험자", "연구 과제 수행 경험자"],

    workMode: "연구실 근무",
    address: "서울 송파구 올림픽로43길 88",
    salary: "5,000만↑",
    contractPeriod: "1~2년",
    benefitIds: ["학회·세미나 지원"],
    workConditionDetail: "주간 근무 기준이며, 계약 기간과 처우는 면접 시 협의합니다.",

    keywords: ["organoid", "PDX", "tumor research"],
    // additionalNotes: 없음 — 추가 안내 섹션 숨김 검증 케이스
    // detailImages/attachments: 없음

    apply: {
      method: "email",
      email: "colorectal-lab-recruit@amc.seoul.kr",
      phone: "",
      notice: "이력서와 학위증명서를 이메일로 제출해 주세요.",
    },
    deadlineLabel: "채용 시 마감",
    isRolling: true,
  },

  org: {
    institutionName: "서울아산병원",
    logoText: "서울아산병원",
    logoColor: "#44505e",

    institutionTypeId: "hospital_research_institute",
    foundedYear: "1989",
    homepageUrl: "https://www.amc.seoul.kr",

    shortIntro: "임상과 연계한 의학 연구를 수행하는 병원 연구소입니다.",
    fullIntro:
      "서울아산병원 대장항문외과 연구실은 임상 데이터와 연계한 의학 연구를 수행합니다. 임상의와 연구원이 협업하는 구조로, 연구 주제에 따라 실험 연구와 데이터 분석을 함께 진행합니다.",
    keywords: ["상급종합병원", "대장항문외과", "임상연계연구"],

    researchFields: ["cancer-biology", "organoid", "translational-research"],
    staffScaleId: "under_10",

    labName: "대장항문외과 연구실",
    // piName: 없음 — 행 숨김 검증 케이스
    // labIntro: 없음 — org.fullIntro가 이미 연구실 단위 소개라 중복 방지 겸 행 숨김 검증 케이스
    // labHomepageUrl: 없음

    equipmentInfra: "병원 내 연구 공간에서 근무하며, 원내 공동 연구 장비와 임상 연구 지원 부서를 활용할 수 있습니다.",
    // achievements: 없음 — 행 숨김 검증 케이스

    location: {
      address: "서울 송파구 올림픽로43길 88",
      detailAddress: "",
    },
  },
};

export const researchJobDetails: ResearchJobDetail[] = [
  kistNeurochannelPostdocJobDetail,
  amcColorectalSurgeryResearcherJobDetail,
];

export function getResearchJobDetail(slug: string): ResearchJobDetail | undefined {
  return researchJobDetails.find((d) => d.slug === slug);
}
