export type ResearchVerificationStatus = "approved" | "pending" | "rejected" | "change_requested";
export type ResearchInstitutionType = "pharma" | "biotech" | "medical_device" | "cro_cdmo" | "distribution" | "etc";
export type ResearchEmployeeCountRange = "under_50" | "51_100" | "101_500" | "over_501";
export type ResearchFileStatus = "approved" | "pending" | "rejected" | "change_requested";

export interface ResearchProfileMaster {
  orgTrack: "research";
  id: string;
  displayName: string;
  legalName: string;
  businessNumber: string;
  corporateRegistrationNumber: string;
  representativeName: string;
  verificationStatus: ResearchVerificationStatus;
  approvedAt: string;
  institutionType: ResearchInstitutionType;
  industry: string;
  address: string;
  zipCode: string;
  detailAddress: string;
  homepageUrl: string;
  foundedYear: string;
  employeeCount: ResearchEmployeeCountRange;
  phone: string;
  fax: string;
  email: string;
  logoUrl: string | null;
  shortIntro: string;
  fullIntro: string;
  mainBusinessAreas: string[];
  products: string[];
  visibilitySettings: {
    publicCompanyPage: boolean;
    exposeOnJobs: boolean;
    exposeOnSearch: boolean;
  };
}

export interface ResearchOrgVerification {
  businessLicenseFile: { name: string; status: ResearchFileStatus };
  additionalFiles: Array<{ name: string; status: ResearchFileStatus }>;
  verificationStatus: ResearchVerificationStatus;
  changeRequestStatus: "none" | "requested" | "reviewing";
}

export interface ResearchOrgManager {
  managerName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  accountId: string;
}

export interface ResearchOrgStats {
  activeJobCount: number;
  favoriteCount: number;
  followerCount: number;
  responseRate: string;
  averageResponseTime: string;
}

export const institutionTypeOptions: Array<{ id: ResearchInstitutionType; label: string }> = [
  { id: "pharma", label: "제약사" },
  { id: "biotech", label: "바이오텍" },
  { id: "medical_device", label: "의료기기" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "distribution", label: "유통·도매" },
  { id: "etc", label: "기타" },
];

export const researchEmployeeCountOptions: Array<{ id: ResearchEmployeeCountRange; label: string }> = [
  { id: "under_50", label: "50명 이하" },
  { id: "51_100", label: "51~100명" },
  { id: "101_500", label: "101~500명" },
  { id: "over_501", label: "501명 이상" },
];

export const researchAreaOptions = [
  "연구개발(R&D)",
  "생산·제조",
  "영업·마케팅",
  "임상개발",
  "의약·메디컬",
  "규제·인허가(RA)",
  "품질관리(QA/QC)",
  "약무",
  "데이터/IT",
  "기타",
];

export const initialResearchOrgProfile: ResearchProfileMaster = {
  orgTrack: "research",
  id: "thepharma-news",
  // 가입 위저드(OrgVerificationStep)에서 받는 값 — 신규 가입자도 이미 가짐
  displayName: "더파마뉴스",
  businessNumber: "570-86-03548",
  representativeName: "홍길동",
  verificationStatus: "approved",
  approvedAt: "2024.02.21",
  institutionType: "etc",
  // 가입 후 기관정보 관리 페이지에서 채우는 상세값 — 신규 가입 직후엔 비어 있어야 함
  legalName: "",
  corporateRegistrationNumber: "",
  industry: "",
  address: "",
  zipCode: "",
  detailAddress: "",
  homepageUrl: "",
  foundedYear: "",
  employeeCount: "under_50",
  phone: "",
  fax: "",
  email: "",
  logoUrl: null,
  shortIntro: "",
  fullIntro: "",
  mainBusinessAreas: [],
  products: [],
  visibilitySettings: {
    publicCompanyPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

export const researchOrgVerification: ResearchOrgVerification = {
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  additionalFiles: [{ name: "기타 인증 서류.pdf", status: "pending" }],
  verificationStatus: "approved",
  changeRequestStatus: "none",
};

export const researchOrgManager: ResearchOrgManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

export const researchOrgStats: ResearchOrgStats = {
  activeJobCount: 12,
  favoriteCount: 1245,
  followerCount: 3452,
  responseRate: "92%",
  averageResponseTime: "1.2일",
};

export const requiredResearchProfileFields: Array<{
  key: keyof ResearchProfileMaster | "verified";
  label: string;
  /** 브랜드 페이지 미리보기의 "부족한 정보 채우기"가 딥링크할 기관정보 관리 SectionCard id */
  sectionId: string;
}> = [
  { key: "displayName", label: "기관명", sectionId: "basic" },
  { key: "logoUrl", label: "기관 로고", sectionId: "profile" },
  { key: "verified", label: "인증 상태", sectionId: "verification" },
  { key: "shortIntro", label: "한 줄 소개", sectionId: "profile" },
  { key: "industry", label: "업종/산업 분야", sectionId: "basic" },
  { key: "institutionType", label: "기관 형태", sectionId: "basic" },
  { key: "employeeCount", label: "사원수", sectionId: "basic" },
  { key: "foundedYear", label: "설립연도", sectionId: "basic" },
  { key: "address", label: "대표 주소", sectionId: "basic" },
];

export function getMissingRequiredResearchFields(profile: ResearchProfileMaster) {
  return requiredResearchProfileFields.filter((field) => {
    if (field.key === "verified") return profile.verificationStatus !== "approved";
    return !String(profile[field.key] ?? "").trim();
  });
}
