// ============================================================
// 연구 공고 상세 정본 (job/org 이원 구조)
// job = 공고 등록 폼(ResearchJobPostingForm) 입력값 / org = 연구 기관 정보 관리 폼(ResearchOrgProfileClient) 입력값
// hospitalJobDetails.ts와 동일한 패턴을 모델로 한다. 연구 트랙도 STEP 4에서 Company 승격이 완료되어
// companyId로 companies.ts/companyProfiles.ts 엔티티(예: "kist", "seoul-asan-hospital")와 연결되지만,
// 기관 정보(org)는 여전히 이 파일 안에 인라인으로 보유한다 — org는 공고 폼이 실제로 입력하는 값(job/org 이원 구조)이고
// Company/CompanyProfile은 그 값을 재사용해 만든 별도의 인사이트 엔티티라, org 자체를 없애지 않는다.
// 로고는 jobs.ts의 해당 공고가 가진 logoText/logoColor(이니셜 배지)를 org로 그대로 옮겨 담되,
// 실제 로고 자산이 있는 기관은 logoUrl도 companyLogos의 실제 키로 명시한다(이니셜은 로딩 실패 시 안전망으로 유지).
// 폼(공고 등록 + 기관 정보)에 입력 UI가 없는 필드(researchDegree, researchEligibility,
// overseasSupport, institutionIntro, scope/country/secondment, researchDocuments,
// researchRecruitType 등)는 이 정본에 포함하지 않는다.
// 정형 선택지 = id 저장 + 라벨 매핑 상수로 표시 / 자유입력 = 입력 문자열 그대로
// ============================================================

import { companyLogos } from "@/config/companyImages";
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

export interface ResearchOrg {
  institutionName: string;
  /**
   * jobs.ts의 logoText/logoColor(이니셜 배지)를 그대로 옮겨 담는다.
   * 상세 화면은 이 값을 읽지 않는다 — 로고는 logoUrl로 그린다. 로딩 실패나 자산 부재 시에는
   * 이니셜이 아니라 건물 아이콘이 나온다: 상세 화면이 쓰는 CompanyLogo(job-detail/shared.tsx)가
   * EntityLogo에 fallback을 넘기지 않아 EntityLogo의 기본 폴백(Building2 아이콘)으로 빠진다.
   */
  logoText: string;
  logoColor: string;
  /** 기업정보 폼 업로드 이미지. industryJobDetails.ts의 IndustryOrg.logoUrl과 동일 목적 */
  logoUrl?: string;

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
  /** companies.ts Company 엔티티 id (STEP 4에서 Company 승격 완료). 아직 승격되지 않은 기관은 null. */
  companyId: string | null;
  job: ResearchJobPosting;
  org: ResearchOrg;
}

// ---- 한국과학기술연구원(KIST) 정본 ----

export const kistNeurochannelPostdocJobDetail: ResearchJobDetail = {
  id: "kist-neurochannel-postdoc",
  slug: "kist-neurochannel-postdoc",
  companyId: "kist",

  job: {
    id: "kist-neurochannel-postdoc",
    title: "KIST 신경생리연구실 연구원 모집 (중추신경발달·오가노이드)",

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

    coreKeywords: ["neurogenesis", "중추신경발달", "이온채널", "뇌오가노이드", "칼슘이미징", "RNAscope"],
    additionalNotes: "입사 후 연구실 안전교육과 기관 공통 교육이 진행됩니다.",
    // detailImages/attachments: 없음
    hiringProcess: ["서류 전형", "1차 면접", "최종합격"],
    requiredDocuments: ["이력서", "연구 실적 목록"],

    apply: {
      method: "email",
      email: "neurochannel-recruit@kist.re.kr",
      phone: "",
      notice: "이력서(연구 실적 목록 포함)와 영문 자기소개서를 이메일로 제출해 주세요.",
    },
    isRolling: true,
  },

  org: {
    institutionName: "한국과학기술연구원(KIST)",
    logoText: "KIST",
    logoColor: "#1e3a5f",
    logoUrl: companyLogos["한국과학기술연구원(KIST)"],

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

// ---- 한국과학기술연구원(KIST) 2호 정본 (중추신경 연구그룹 학생연구원) ----

export const kistNeurophysiologyInternJobDetail: ResearchJobDetail = {
  id: "kist-neurophysiology-intern",
  slug: "kist-neurophysiology-intern",
  companyId: "kist",

  job: {
    id: "kist-neurophysiology-intern",
    title: "KIST 중추신경 연구그룹 학생연구원(인턴) 모집",

    jobCategory: { main: "연구직", sub: "테크니션·연구보조" },
    headcount: "1명",
    employmentTypeId: "intern",
    experienceId: "any",
    educationId: "bachelor",

    summary: "오가노이드 기반 신경생리 연구에 참여할 학생연구원을 모집합니다.",
    responsibilities: [
      "세포·오가노이드 배양 실험 보조",
      "실험 데이터 정리 및 기초 분석",
      "연구실 세미나 참여",
    ],
    requirements: ["생명과학·약학 등 관련 전공 학부 3학년 이상 또는 석사과정", "주 3일 이상 출근 가능자"],
    preferred: ["세포배양 실험 경험자"],

    workMode: "연구실 근무",
    address: "서울 성북구 화랑로14길 5 한국과학기술연구원(KIST)",
    salary: "기관 내규에 따른 활동비 지급",
    workConditionDetail: "주 3일 이상 출근 가능자를 대상으로 하며, 학기 중에도 유연하게 근무 일정을 조율합니다.",

    coreKeywords: ["중추신경발달", "뇌오가노이드", "칼슘이미징", "학생연구원"],
    // additionalNotes/detailImages/attachments: 3종 모두 없음
    hiringProcess: ["서류 전형", "1차 면접", "최종합격"],
    requiredDocuments: ["이력서", "재학증명서"],

    apply: {
      method: "email",
      email: "neurochannel-recruit@kist.re.kr",
      phone: "",
      notice: "이력서와 재학증명서를 이메일로 제출해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "한국과학기술연구원(KIST)",
    logoText: "KIST",
    logoColor: "#1e3a5f",
    logoUrl: companyLogos["한국과학기술연구원(KIST)"],

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
    // piName: 없음 — 행 숨김 검증 케이스 (kist-neurochannel-postdoc과 동일 처리)
    labIntro: "중추신경 발달과 신경질환 기전을 연구하는 그룹입니다. 전기생리학과 분자신경과학 기법을 함께 활용합니다.",

    equipmentInfra: "연구 그룹 단위의 실험 공간과 공동 기기실을 운영하며, 실험 장비와 분석 인프라를 공동으로 활용할 수 있습니다.",
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
  companyId: "seoul-asan-hospital",

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

    coreKeywords: ["organoid", "PDX", "tumor research"],
    // additionalNotes: 없음 — 추가 안내 섹션 숨김 검증 케이스
    // detailImages/attachments: 없음

    apply: {
      method: "email",
      email: "colorectal-lab-recruit@amc.seoul.kr",
      phone: "",
      notice: "이력서와 학위증명서를 이메일로 제출해 주세요.",
    },
    isRolling: true,
  },

  org: {
    institutionName: "서울아산병원",
    logoText: "서울아산병원",
    logoColor: "#44505e",
    logoUrl: companyLogos["서울아산병원"],

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

// ---- 한국뇌연구원 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const kbriDementiaPostdocJobDetail: ResearchJobDetail = {
  id: "kbri-dementia-postdoc",
  slug: "kbri-dementia-postdoc",
  companyId: "kbri",

  job: {
    id: "kbri-dementia-postdoc",
    title: "치매연구그룹 박사후 연수연구원 모집",

    jobCategory: { main: "연구직", sub: "박사후연구원·포닥" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "doctor",

    summary: "치매 연구를 함께할 박사후 연수연구원을 모집합니다.",
    responsibilities: [
      "뇌질환 관련 연구 과제 수행",
      "조직·분자 실험(IHC, Western blot, Real-time PCR) 및 데이터 분석",
      "연구 결과 정리와 논문 작성",
      "그룹 세미나 및 공동 연구 참여",
    ],
    requirements: ["생명과학·신경과학 등 관련 분야 박사 학위 소지자(또는 취득 예정자)"],
    preferred: ["뇌질환 동물모델 실험 경험자", "환경 요인과 뇌질환 연관성 연구 경험자"],

    workMode: "연구실 근무",
    address: "대구 동구 첨단로 61 한국뇌연구원",
    // 폼 SALARY_OPTS는 기관 내규/3,000만↑/5,000만↑/7,000만↑/9,000만↑ 5종뿐이라
    // jobs.ts 212의 실값(연봉 4,500만원)을 담을 수 있는 유효 구간은 "3,000만↑"이다.
    salary: "3,000만↑",
    contractPeriod: "1~2년",
    // benefitIds: 없음 — jobs.ts 212의 benefits는 "4대 보험" 1종뿐인데 연구 WELFARE_OPTS에 대응 값이 없다
    workConditionDetail: "계약 기간은 1~2년이며 연구 성과에 따라 갱신을 협의합니다.",

    coreKeywords: ["PM2.5", "미세플라스틱", "뇌질환", "IHC", "Western blot", "Real-time PCR"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서", "자기소개서", "연구 실적 목록"],

    apply: {
      method: "email",
      email: "dementia-recruit@kbri.example",
      phone: "",
      notice: "이력서와 연구 실적 목록을 이메일로 제출해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "한국뇌연구원",
    logoText: "한국뇌연구원",
    logoColor: "#1e3a5f",
    logoUrl: companyLogos["한국뇌연구원"],

    institutionTypeId: "government_research_institute",
    foundedYear: "2011",
    homepageUrl: "https://www.kbri.re.kr",

    shortIntro: "뇌연구촉진법에 따라 설립된 국가 뇌연구 거점 정부출연연구기관입니다.",
    fullIntro:
      "과학기술정보통신부 산하 정부출연연구기관으로, 기초 뇌과학부터 뇌질환 중개연구까지 35개 이상의 독립 연구그룹이 활동하고 있습니다. 한국뇌은행과 공동 연구 인프라를 운영하며 DGIST 등 협력 대학과 학연 프로그램을 두고 있습니다.",
    keywords: ["정부출연연구기관", "뇌과학", "중개연구"],

    researchFields: ["neuroscience", "translational-research"],
    staffScaleId: "over_100",

    labName: "치매연구그룹",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro:
      "치매를 비롯한 퇴행성 뇌질환의 기전을 연구하는 그룹입니다. 환경 요인과 뇌질환의 연관성을 조직·분자 수준에서 분석합니다.",

    equipmentInfra:
      "한국뇌은행, 뇌영상·전기생리 장비센터, 실험동물센터, 뇌데이터센터를 공동 연구 인프라로 운영합니다.",
    achievements: "기초·중개 뇌연구 분야의 학술 성과와 국가 연구개발 과제를 지속 수행하고 있습니다.",

    location: {
      address: "대구 동구 첨단로 61",
      detailAddress: "한국뇌연구원",
    },
  },
};

// ---- 강원대학교 천연물의약합성 연구실 정본 — org는 companyProfiles.ts의 프로필 값을 재사용한다 ----

export const kangwonNaturalProductPostdocJobDetail: ResearchJobDetail = {
  id: "kangwon-univ-natural-product-postdoc",
  slug: "kangwon-univ-natural-product-postdoc",
  companyId: "kangwon-univ-natural-product",

  job: {
    id: "kangwon-univ-natural-product-postdoc",
    title: "천연물·의약합성 연구 박사후연구원·석사급 연구원 모집",

    jobCategory: { main: "연구직", sub: "박사후연구원·포닥" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "천연물 유래 의약 후보물질 연구를 함께할 박사후연구원·석사급 연구원을 모집합니다.",
    responsibilities: [
      "천연물 유래 유효성분·유도체 합성 연구",
      "유기합성 및 구조분석",
      "국가연구개발과제 수행과 보고서 작성",
      "논문·특허 작성",
    ],
    requirements: ["화학·약학·생명과학 등 관련 분야 석사 이상", "유기합성 실험 수행 가능자"],
    preferred: [
      "천연물 기반 생리활성 물질 연구 경험자",
      "카나비노이드 유도체 연구 경험자",
      "정부과제 수행 경험자",
    ],

    workMode: "연구실 근무",
    address: "강원 춘천시 강원대학길 1 생명과학관 B303호",
    // kbri와 동일 — jobs.ts 210의 실값(연봉 4,000만~7,000만원) 하한을 담는 유효 구간은 "3,000만↑"이다.
    salary: "3,000만↑",
    contractPeriod: "1~2년",
    benefitIds: ["연차·휴가", "주거 지원", "건강검진", "교육 지원"],
    workConditionDetail: "1년 단위 계약으로 연장 가능하며, 주 5일 근무입니다. 기숙사 입주를 지원합니다.",

    coreKeywords: ["천연물화학", "의약화학", "전기합성", "신약 후보물질", "카나비노이드", "구조분석"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접", "최종합격"],
    requiredDocuments: ["이력서", "자기소개서", "논문·연구 실적 목록", "학위증명서"],

    apply: {
      method: "email",
      email: "np-lab-recruit@kangwon.example",
      phone: "",
      notice:
        "이력서와 연구 실적 목록을 이메일로 제출해 주세요. 학내 벤처기업 소속 지원도 함께 안내드립니다.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "강원대학교 천연물의약합성 연구실",
    logoText: "강원대",
    logoColor: "#374151",
    logoUrl: companyLogos["강원대학교 천연물의약합성 연구실"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 프로필·companies.ts 모두 "-"라 값이 없다
    homepageUrl: "https://bismuth.kangwon.ac.kr",

    shortIntro: "천연물 유래 의약 후보물질과 촉매 합성법을 연구하는 대학 연구실입니다.",
    fullIntro:
      "강원대학교 춘천캠퍼스의 유기합성 연구실로, 전이금속 촉매를 이용한 효율적 합성법 개발과 천연물 유래 생리활성물질 연구를 수행합니다. 학내 벤처기업과 연계해 기초연구와 응용연구를 병행하고 있습니다.",
    keywords: ["유기합성", "천연물화학", "의약화학"],

    researchFields: ["medicinal-chemistry"],
    staffScaleId: "10_30",

    labName: "천연물의약합성 연구실",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro:
      "전이금속 촉매를 이용한 새로운 합성법 개발과 천연물 유래 생리활성물질 합성을 연구하는 실험실입니다.",

    equipmentInfra:
      "유기합성 실험 공간과 HPLC 등 분리·분석 장비를 갖추고 있으며, 학내 공동기기 인프라를 활용합니다.",
    achievements: "촉매 기반 합성 방법론과 천연물 유도체 관련 연구 논문을 발표하고 있습니다.",

    location: {
      address: "강원 춘천시 강원대학길 1",
      detailAddress: "생명과학관 B303호",
    },
  },
};

// ---- University of North Texas 정본 — 유일한 해외(J-1 파견) 케이스 ----

export const untBrainOrganoidPostdocJobDetail: ResearchJobDetail = {
  id: "unt-brain-organoid-postdoc",
  slug: "unt-brain-organoid-postdoc",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "unt-brain-organoid-postdoc",
    title: "뇌 오가노이드 박사후연구원(J-1) 모집",

    jobCategory: { main: "연구직", sub: "박사후연구원·포닥" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "doctor",

    summary: "인간 iPSC 기반 뇌 오가노이드 연구를 수행할 박사후연구원을 모집합니다. (J-1 비자 파견)",
    responsibilities: [
      "인간 iPSC 유지·확장, Forebrain/Cortical organoid 분화",
      "오가노이드 재현성 품질 관리",
      "면역염색(Neuronal/Synaptic marker), 공초점 현미경 운용",
      "Calcium imaging, Synaptic function 분석",
      "qPCR, Western blot",
      "CRISPR activation/interference용 recombinant lentivirus 증폭, Guide RNA 디자인",
    ],
    requirements: [
      "신경과학·줄기세포생물학·바이오 분야 박사 학위 취득자 또는 취득 예정자",
      "영어로 연구 커뮤니케이션 가능한 분",
      "J-1 비자 취득 가능 조건을 갖춘 분(한국인)",
    ],
    preferred: ["신진 박사(Fresh Ph.D.) 적극 지원 환영"],

    workMode: "연구실 근무",
    // jobs.ts 213의 researchLab에는 address가 없어 명세의 소재지 표기를 그대로 쓴다
    address: "University of North Texas (UNT), Denton, TX, USA",
    // jobs.ts 213의 실값(연봉 6,000만~6,800만원) 하한을 담는 유효 구간은 "5,000만↑"이다.
    salary: "5,000만↑",
    contractPeriod: "1~2년",
    // 명세 복리후생 중 연구 WELFARE_OPTS에 대응하는 값은 "주거 지원" 하나뿐이다
    // (4대 보험·주 5일 근무·민간 건강보험·퇴직금·비자 지원은 대응 항목이 없어 근무조건 상세로 옮겼다)
    benefitIds: ["주거 지원"],
    workConditionDetail:
      "주 5일 근무이며 4대 보험과 민간 건강보험, 퇴직금이 적용됩니다. 비한국인 지원자에게는 주거를 지원합니다. J-1 비자로 미국 현지 파견되며, 세종대학교 단기 파견을 병행할 수 있습니다. 비자 발급을 지원합니다.",

    coreKeywords: ["iPSC", "brain organoid", "Calcium imaging", "CRISPR", "Confocal imaging", "Western blot"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서(CV)", "성적증명서", "학위증명서", "졸업논문 요약", "Cover letter", "추천인 2인 연락처"],

    apply: {
      method: "email",
      email: "brain-organoid-recruit@unt.example",
      phone: "",
      notice:
        "이력서(CV)와 Cover letter, 추천인 2인 연락처를 이메일로 제출해 주세요. 채용이 확정되면 마감됩니다.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "University of North Texas",
    logoText: "UNT",
    logoColor: "#374151",
    logoUrl: companyLogos["University of North Texas"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    homepageUrl: "https://engineering.unt.edu/bme/research/labs/bioprinting/",

    shortIntro: "인간 iPSC와 뇌 오가노이드를 기반으로 신경생물학·기능 분석 연구를 수행하는 대학 연구실입니다.",
    fullIntro:
      "University of North Texas(UNT)의 연구실로, 인간 iPSC 유지·확장과 Forebrain/Cortical organoid 분화를 기반으로 신경생물학 및 기능 분석 연구를 수행합니다. CRISPR 기반 유전자 조절 연구를 병행하며, 세종대학교와 단기 파견 형태의 연구 협력을 두고 있습니다.",
    keywords: ["뇌 오가노이드", "iPSC", "신경생물학"],

    researchFields: ["organoid", "neuroscience", "stem-cell-regenerative"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    // labName: 없음 — 원본에 연구실명이 별도로 없다(Bioprinting Lab 페이지만 존재)
    // piName: 없음 — 개인 실명 미기재 방침
    // labIntro: 없음 — 연구실 단위 소개가 원본에 없어 fullIntro로 갈음한다

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "Denton, TX, USA",
      detailAddress: "University of North Texas",
    },
  },
};

// ---- 포항공과대학교 생명과학과 정본 ----

export const postechStructuralBiologyResearcherJobDetail: ResearchJobDetail = {
  id: "postech-life-sciences-structural-biology-researcher",
  slug: "postech-life-sciences-structural-biology-researcher",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "postech-life-sciences-structural-biology-researcher",
    title: "생명과학과 연구계약직 연구원 채용",

    jobCategory: { main: "연구직", sub: "연구원" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "구조생물학 연구를 위한 클로닝·단백질 정제 실험을 담당할 연구계약직 연구원을 모집합니다.",
    responsibilities: ["클로닝, cell culture", "단백질 분리·정제", "연구 참여 및 보조 업무"],
    requirements: ["석사 이상 학위 소지자", "신입/경력 무관"],
    preferred: ["관련 분야 경력자"],

    workMode: "연구실 근무",
    address: "경북 포항시 남구 지곡로 47 포항공과대학교 바이오오픈이노베이션(BOIC) 3202호",
    // jobs.ts 214의 실값(연봉 2,600만~3,000만원) 하한을 담는 유효 구간이 SALARY_OPTS에 없어 "기관 내규"로 둔다.
    salary: "기관 내규",
    contractPeriod: "1~2년",
    // benefitIds: 명세 복리후생이 "4대 보험" 1종뿐인데 연구 WELFARE_OPTS에 대응 값이 없어 비운다
    benefitIds: [],
    workConditionDetail:
      "4대 보험이 적용됩니다. 연봉은 협의 후 결정하며, 최초 임용일로부터 3개월의 수습 기간을 운영할 수 있습니다.",

    coreKeywords: ["구조생물학", "cloning", "protein purification", "cell culture"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: [
      "입사지원서",
      "자기소개서",
      "졸업증명서",
      "성적증명서",
      "경력증명서(해당자)",
      "자격증 사본(해당자)",
    ],

    apply: {
      method: "email",
      email: "bio-recruit@postech.example",
      phone: "",
      notice: "입사지원서와 자기소개서를 이메일로 제출해 주세요. 채용이 확정되면 마감됩니다.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "포항공과대학교",
    logoText: "포스텍",
    logoColor: "#374151",
    logoUrl: companyLogos["포항공과대학교"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    // homepageUrl: 없음 — 원본에 기관·연구실 홈페이지 없음

    shortIntro: "구조생물학을 기반으로 단백질의 구조와 기능을 연구하는 대학 생명과학과입니다.",
    fullIntro:
      "포항공과대학교 생명과학과의 연구실로, 클로닝과 세포배양, 단백질 분리·정제를 기반으로 구조생물학 연구를 수행합니다. 바이오오픈이노베이션센터(BOIC)에 연구 공간을 두고 있습니다.",
    keywords: ["구조생물학", "단백질 정제", "생명과학"],

    researchFields: ["molecular-cell-biology"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    labName: "생명과학과 구조생물학 연구실",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro: "클로닝·세포배양·단백질 분리 정제를 통해 단백질의 구조와 기능을 규명하는 실험실입니다.",

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "경북 포항시 남구 지곡로 47",
      detailAddress: "포항공과대학교 바이오오픈이노베이션(BOIC) 3202호",
    },
  },
};

// ---- 동국대학교 약학대학 약물학/약동학 실험실 정본 ----

export const donggukDmpkResearcherJobDetail: ResearchJobDetail = {
  id: "dongguk-pharmacy-dmpk-researcher",
  slug: "dongguk-pharmacy-dmpk-researcher",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "dongguk-pharmacy-dmpk-researcher",
    title: "약물학/약동학 실험실 연구원 모집 (생체시료 분석 경험자 우대)",

    jobCategory: { main: "연구직", sub: "연구원" },
    // 원본 "00명" → 인원 미정
    headcount: "○명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "PK-PD 모델링과 생체시료 분석 기반 DMPK 연구를 함께할 연구원을 모집합니다.",
    responsibilities: [
      "in vitro/in vivo PK-PD 실험",
      "data analysis (network pharmacology, PD modeling)",
      "LC-MS/MS 및 TOF 분석을 통한 생체시료 분석 및 PD 마커 발굴",
    ],
    requirements: ["분석학·약동학/약물학 관련 전공자 (교육을 통한 실험업무 가능자도 지원 가능)"],
    preferred: ["LC-MS/MS 및 q-TOF 사용 경험자", "랩노트·결과보고서 작성 경험자"],

    workMode: "연구실 근무",
    address: "경기 고양시 일산동구 식사동 동국대학교 약학대학 635호",
    // jobs.ts 215의 실값(연봉 2,600만~3,600만원) 하한을 담는 유효 구간이 SALARY_OPTS에 없어 "기관 내규"로 둔다.
    salary: "기관 내규",
    contractPeriod: "1~2년",
    // benefitIds: 명세 복리후생(4대 보험·주 5일 근무)에 대응하는 연구 WELFARE_OPTS 값이 없어 비운다
    benefitIds: [],
    workConditionDetail:
      "주 5일 근무이며 4대 보험이 적용됩니다. 경력에 따라 2~3개월 인턴 기간이 있을 수 있으며, 연봉은 경력과 근무조건에 따라 협의합니다.",

    coreKeywords: ["PK-PD", "DMPK", "LC-MS/MS", "network pharmacology", "생체시료 분석"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서", "자기소개서", "학위증명서", "성적증명서"],

    apply: {
      method: "email",
      email: "dmpk-recruit@dongguk.example",
      phone: "",
      notice: "이력서와 자기소개서를 이메일로 제출해 주세요. 학위증명서와 성적증명서를 함께 첨부해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "동국대학교",
    logoText: "동국대",
    logoColor: "#374151",
    logoUrl: companyLogos["동국대학교"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    // homepageUrl: 없음 — 원본 채용 웹페이지 값이 "http://"뿐이라 유효하지 않다

    shortIntro: "저분자·천연물·펩타이드·miRNA의 체내동태와 약효를 평가하는 대학 약학대학 실험실입니다.",
    fullIntro:
      "동국대학교 약학대학의 약물학/약동학 실험실로, 저분자·천연물 성분·펩타이드·miRNA 등의 체내동태-약효 평가와 기전 연구를 수행합니다. 난치성 만성 질환의 정량적 치료효과와 기전을 규명해 예측 가능한 단일·병용 요법 개발을 목표로 합니다.",
    keywords: ["약동학", "약물학", "생체시료 분석"],

    researchFields: ["pharmacology-toxicology", "pharmaceutics"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    labName: "약학대학 약물학/약동학 실험실",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro:
      "PKPD 모델링 기반 병용요법 모델을 구축하고, 난치성 질환의 발병·치료 기전과 약물 DMPK의 상관성을 평가하는 실험실입니다.",

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "경기 고양시 일산동구 식사동",
      detailAddress: "동국대학교 약학대학 635호",
    },
  },
};

// ---- 부산대학교 구강점막면역 연구실 정본 ----

export const pnuOralMucosalImmunologyResearcherJobDetail: ResearchJobDetail = {
  id: "pnu-oral-mucosal-immunology-researcher",
  slug: "pnu-oral-mucosal-immunology-researcher",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "pnu-oral-mucosal-immunology-researcher",
    title: "구강점막면역 연구실 연구원 모집",

    jobCategory: { main: "연구직", sub: "연구원" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "점막 조직에서 미생물-숙주 상호작용을 규명할 연구원을 모집합니다.",
    responsibilities: ["세포·분자생물학, 면역학, 미생물학 기반 기초 연구", "질환 실험 동물모델 개발 및 구축"],
    requirements: [
      "생명과학·치의학·의학·약학 등 관련 분야 석사 졸업자",
      "세포분자생물학·면역학·미생물학 등 기초(치)의학 연구에 관심 있는 자",
      "실험 동물모델 개발·구축에 관심 있는 자",
    ],
    // preferred: 없음 — 원본에 우대 사항이 별도로 구분되어 있지 않다

    workMode: "연구실 근무",
    address: "경남 양산시 물금읍 부산대학로 49 치의학관 613호",
    // jobs.ts 216의 실값(연봉 2,600만~3,000만원) 하한을 담는 유효 구간이 SALARY_OPTS에 없어 "기관 내규"로 둔다.
    salary: "기관 내규",
    contractPeriod: "1~2년",
    // benefitIds: 명세 복리후생(4대 보험·성과급·주 5일 근무)에 대응하는 연구 WELFARE_OPTS 값이 없어 비운다
    benefitIds: [],
    workConditionDetail: "주 5일 근무이며 4대 보험이 적용되고 성과급(인센티브)을 운영합니다.",

    coreKeywords: ["점막면역", "숙주-미생물 상호작용", "염증", "미생물총", "동물모델"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서", "자기소개서", "학위증명서", "성적증명서"],

    apply: {
      method: "email",
      email: "lomi-recruit@pusan.example",
      phone: "",
      notice: "이력서와 자기소개서를 이메일로 제출해 주세요. 학위증명서와 성적증명서를 함께 첨부해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "부산대학교",
    logoText: "부산대",
    logoColor: "#374151",
    logoUrl: companyLogos["부산대학교"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    homepageUrl: "https://lomi.pusan.ac.kr/sites/lomi/index.do",

    shortIntro: "점막 조직의 미생물-숙주 세포 상호작용을 분자생물학적으로 규명하는 대학 연구실입니다.",
    fullIntro:
      "부산대학교의 구강점막면역 연구실로, 구강·피부·장 등 점막 조직에서 미생물과 숙주 세포의 상호작용을 연구합니다. 미생물 불균형이 조직 염증과 질병으로 이어지는 기전을 규명하고 새로운 치료·진단 전략 개발을 목표로 합니다.",
    keywords: ["점막면역", "미생물총", "감염·염증"],

    researchFields: ["immunology"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    labName: "구강점막면역 연구실",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro:
      "숙주-미생물 상호작용과 염증 반응 조절 기전, 병원체의 인체 침투 및 병인 기전을 연구하며, 인체 미생물총과 전신질환의 연관성을 함께 살펴봅니다.",

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "경남 양산시 물금읍 부산대학로 49",
      detailAddress: "치의학관 613호",
    },
  },
};

// ---- 건양대학교 명곡안연구소 정본 ----

export const konyangMyunggokEyeResearcherJobDetail: ResearchJobDetail = {
  id: "konyang-myunggok-eye-researcher",
  slug: "konyang-myunggok-eye-researcher",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "konyang-myunggok-eye-researcher",
    title: "명곡안연구소 연구원 모집",

    jobCategory: { main: "연구직", sub: "연구원" },
    headcount: "2명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "master",

    summary: "망막재생·망막오가노이드 기반 안질환 치료기술 연구를 함께할 연구원을 모집합니다.",
    responsibilities: [
      "줄기세포연구: 환자 유래 iPS Cells 제작·배양, 망막오가노이드 제작",
      "전임상연구: 마우스·랫을 이용한 세포/조직 이식 효능 분석",
    ],
    requirements: ["석사 이상 (생물학 관련 모든 분야)"],
    // preferred: 없음 — 원본에 우대 사항 표기 없음

    workMode: "연구실 근무",
    address: "대전 서구 관저동로 158 L보건학관 명곡안연구소",
    // jobs.ts 217의 실값(연봉 3,400만~4,400만원) 하한을 담는 유효 구간은 "3,000만↑"이다.
    salary: "3,000만↑",
    contractPeriod: "1~2년",
    // benefitIds: 명세 복리후생(4대 보험·퇴직금·주 5일 근무)에 대응하는 연구 WELFARE_OPTS 값이 없어 비운다
    benefitIds: [],
    workConditionDetail:
      "주 5일 근무이며 4대 보험과 퇴직금이 적용됩니다. 급여는 석사급 기준이며 경력에 따라 산정하고 협상할 수 있습니다.",

    coreKeywords: ["망막재생", "iPS Cells", "망막오가노이드", "줄기세포", "전임상"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서", "자기소개서", "학위증명서(또는 졸업예정증명서)", "성적증명서"],

    apply: {
      method: "email",
      email: "myunggok-recruit@konyang.example",
      phone: "",
      notice: "이력서와 자기소개서를 이메일로 제출해 주세요. 학위증명서(또는 졸업예정증명서)를 함께 첨부해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "건양대학교 명곡안연구소",
    logoText: "건양대",
    logoColor: "#374151",
    logoUrl: companyLogos["건양대학교 명곡안연구소"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    // homepageUrl: 없음 — 원본에 기관 홈페이지 없음

    shortIntro: "망막재생과 망막오가노이드를 기반으로 안질환 치료기술을 연구하는 대학의료원 산하 연구소입니다.",
    fullIntro:
      "건양대학교의료원 산하의 명곡안연구소로, 내인성 줄기세포를 이용한 망막재생 유도기술과 iPS Cells 유래 망막오가노이드 제조·이식용 시트 개발을 연구합니다. 망막질환 첨단융복합치료제의 비임상 유효성·안전성 평가도 함께 수행합니다.",
    keywords: ["망막재생", "망막오가노이드", "안질환"],

    researchFields: ["organoid", "stem-cell-regenerative", "cell-gene-therapy"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    // labName: 없음 — 기관명에 연구소가 포함되어 별도 연구실명이 없다
    // piName: 없음 — 개인 실명 미기재 방침
    // labIntro: 없음 — 연구실 단위 소개가 원본에 없어 fullIntro로 갈음한다

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "대전 서구 관저동로 158",
      detailAddress: "L보건학관 명곡안연구소",
    },
  },
};

// ---- 한림대학교 의과대학 미생물학교실 정본 ----

export const hallymMicrobiologyLabManagerJobDetail: ResearchJobDetail = {
  id: "hallym-microbiology-lab-manager",
  slug: "hallym-microbiology-lab-manager",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "hallym-microbiology-lab-manager",
    title: "의과대학 미생물학교실 랩매니저 모집",

    jobCategory: { main: "연구지원·운영", sub: "연구실 운영·장비관리" },
    headcount: "1명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "bachelor",

    summary: "호흡기·인수공통 바이러스 연구실의 운영과 연구행정을 담당할 랩매니저를 모집합니다.",
    responsibilities: [
      "실험실 운영 및 유지(안전점검, 비품 주문·관리)",
      "과제 관련 행정서류 작성·관리(협약서류, 연구원 등록, 인건비 변경, 연구비 정산·결제)",
      "연구실 운영 행정(IBC/IACUC 계획서 작성·제출, LMO 수입신고, 병원체 분양)",
    ],
    requirements: ["학사 졸업 이상", "경력 단절 여성(과학자) 지원 가능"],
    // preferred: 없음 — 원본에 우대 사항 표기 없음

    workMode: "연구실 근무",
    address: "강원특별자치도 춘천시 한림대학길 1 의학관 3512호",
    // jobs.ts 218의 실값(연봉 2,600만~3,600만원) 하한을 담는 유효 구간이 SALARY_OPTS에 없어 "기관 내규"로 둔다.
    salary: "기관 내규",
    contractPeriod: "1~2년",
    // 명세 복리후생 중 연구 WELFARE_OPTS에 대응하는 값은 연차 항목 하나뿐이다
    // (4대 보험·성과급·주 5일 근무는 대응 항목이 없어 근무조건 상세로 옮겼다)
    benefitIds: ["연차·휴가"],
    workConditionDetail:
      "주 5일 근무이며 4대 보험이 적용되고 성과 인센티브를 운영합니다. 연차는 12일이며 매년 1일씩 추가됩니다.",

    coreKeywords: ["바이러스", "NGS", "Virome", "항바이러스", "랩매니저", "연구행정"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서(CV)", "자기소개서"],

    apply: {
      method: "email",
      email: "microbiology-recruit@hallym.example",
      phone: "",
      notice: "이력서(CV)와 자기소개서를 이메일로 제출해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "한림대학교 의과대학",
    logoText: "한림대",
    logoColor: "#374151",
    logoUrl: companyLogos["한림대학교 의과대학"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    homepageUrl: "https://www.hallym.ac.kr/hallym_univ/sub01/cP7/sCP1/tab1",

    shortIntro: "호흡기·인수공통 바이러스의 감시·진단·치료제 개발을 연구하는 의과대학 교실입니다.",
    fullIntro:
      "한림대학교 의과대학 미생물학교실로, 호흡기 및 인수공통 바이러스에 대한 감시·진단·치료제·대응책 개발 연구를 수행합니다. 광범위 항바이러스 치료제 개발과 NGS 기반 바이러스 유전체 분석을 함께 진행합니다.",
    keywords: ["바이러스", "감염의학", "연구행정"],

    researchFields: ["genetics-genomics"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    labName: "미생물학교실",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro:
      "Coronavirus·Paramyxovirus·Flavivirus·Hantavirus를 대상으로 광범위 항바이러스 치료제를 개발하고, Metagenomic sequencing 기반 Virome 연구로 신종 바이러스를 발굴하며 바이러스-숙주 상호작용을 연구합니다.",

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "강원특별자치도 춘천시 한림대학길 1",
      detailAddress: "의학관 3512호",
    },
  },
};

// ---- 인제대학교 심혈관 및 대사질환 핵심연구지원센터 정본 ----

export const injeCardiovascularCoreFacilityResearcherJobDetail: ResearchJobDetail = {
  id: "inje-cardiovascular-core-facility-researcher",
  slug: "inje-cardiovascular-core-facility-researcher",
  // companyId: 없음 — companies.ts에 대응 기업 엔티티가 아직 없다
  companyId: null,

  job: {
    id: "inje-cardiovascular-core-facility-researcher",
    title: "심혈관 및 대사질환 핵심연구지원센터 전담운영인력 채용",

    jobCategory: { main: "연구지원·운영", sub: "연구실 운영·장비관리" },
    // 원본 "0명" → 인원 미정
    headcount: "○명",
    employmentTypeId: "contract",
    experienceId: "any",
    educationId: "bachelor",

    summary: "심혈관·대사질환 연구지원 인프라의 연구장비 운영과 전임상 실험을 담당할 연구원을 모집합니다.",
    responsibilities: ["연구장비 운영 및 관리", "전임상 및 실험 수행"],
    requirements: ["학사 이상"],
    // preferred: 없음 — 원본에 우대 사항 표기 없음

    workMode: "연구실 근무",
    address: "부산 부산진구 진사로83번길 81 미래의생명센터 1층",
    // jobs.ts 219의 실값(연봉 2,600만~3,000만원) 하한을 담는 유효 구간이 SALARY_OPTS에 없어 "기관 내규"로 둔다.
    salary: "기관 내규",
    contractPeriod: "1~2년",
    // benefitIds: 명세 복리후생(4대 보험·주 5일 근무)에 대응하는 연구 WELFARE_OPTS 값이 없어 비운다
    benefitIds: [],
    workConditionDetail: "주 5일 근무이며 4대 보험이 적용됩니다.",

    coreKeywords: ["심혈관질환", "대사질환", "전임상", "연구장비", "영상장비"],
    // additionalNotes/detailImages/attachments: 없음
    hiringProcess: ["서류전형", "면접전형"],
    requiredDocuments: ["이력서", "자기소개서", "학위증명서", "성적증명서"],

    apply: {
      method: "email",
      email: "coredream-recruit@inje.example",
      phone: "",
      notice: "이력서와 자기소개서를 이메일로 제출해 주세요. 학위증명서와 성적증명서를 함께 첨부해 주세요.",
    },
    isRolling: false,
  },

  org: {
    institutionName: "인제대학교 심혈관 및 대사질환 핵심연구지원센터",
    logoText: "인제대",
    logoColor: "#374151",
    logoUrl: companyLogos["인제대학교 심혈관 및 대사질환 핵심연구지원센터"],

    institutionTypeId: "university_lab",
    // foundedYear: 없음 — 원본에 설립 연도 정보 없음
    homepageUrl: "https://www.coredream.kr/",

    shortIntro: "심혈관질환·대사질환 전임상 연구를 장비와 분석으로 지원하는 대학 핵심연구지원센터입니다.",
    fullIntro:
      "인제대학교의 심혈관 및 대사질환 핵심연구지원센터로, 소동물 MRI·CT와 Echocardiography 등 첨단 영상장비와 분자·세포 분석장비를 갖추고 심혈관질환·대사질환 전임상 연구를 지원합니다.",
    keywords: ["심혈관질환", "대사질환", "연구지원"],

    researchFields: ["disease-model"],
    // staffScaleId: 없음 — 원본에 규모 정보 없음

    labName: "인프라고도화시설",
    // piName: 없음 — 개인 실명 미기재 방침
    labIntro: "첨단 연구장비를 기반으로 심혈관·대사질환의 기능평가와 분석을 지원하는 시설입니다.",

    // equipmentInfra/achievements: 없음 — 원본에 근거 없음

    location: {
      address: "부산 부산진구 진사로83번길 81",
      detailAddress: "미래의생명센터 1층",
    },
  },
};

export const researchJobDetails: ResearchJobDetail[] = [
  kistNeurochannelPostdocJobDetail,
  amcColorectalSurgeryResearcherJobDetail,
  kistNeurophysiologyInternJobDetail,
  kbriDementiaPostdocJobDetail,
  kangwonNaturalProductPostdocJobDetail,
  untBrainOrganoidPostdocJobDetail,
  postechStructuralBiologyResearcherJobDetail,
  donggukDmpkResearcherJobDetail,
  pnuOralMucosalImmunologyResearcherJobDetail,
  konyangMyunggokEyeResearcherJobDetail,
  hallymMicrobiologyLabManagerJobDetail,
  injeCardiovascularCoreFacilityResearcherJobDetail,
];

export function getResearchJobDetail(slug: string): ResearchJobDetail | undefined {
  return researchJobDetails.find((d) => d.slug === slug);
}
