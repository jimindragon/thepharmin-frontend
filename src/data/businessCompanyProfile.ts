export type CompanyVerificationStatus = "approved" | "pending" | "rejected" | "change_requested";
export type CompanyType = "pharma" | "biotech" | "medical_device" | "cro_cdmo" | "distribution" | "etc";
export type EmployeeCountRange = "under_50" | "51_100" | "101_500" | "over_501";
export type FileStatus = "approved" | "pending" | "rejected" | "change_requested";

/** 기업정보 관리 페이지가 어떤 트랙 폼을 그려야 하는지 결정하는 값. 기본은 항상 "industry". */
export type OrgTrack = "industry" | "hospital" | "pharmacy";

export interface CompanyProfileMaster {
  orgTrack: "industry";
  id: string;
  displayName: string;
  legalName: string;
  businessNumber: string;
  corporateRegistrationNumber: string;
  representativeName: string;
  verificationStatus: CompanyVerificationStatus;
  approvedAt: string;
  companyType: CompanyType;
  industry: string;
  address: string;
  zipCode: string;
  detailAddress: string;
  homepageUrl: string;
  foundedYear: string;
  employeeCount: EmployeeCountRange;
  phone: string;
  fax: string;
  email: string;
  logoUrl: string | null;
  shortIntro: string;
  fullIntro: string;
  mainBusinessAreas: string[];
  mainJobCategories: string[];
  products: string[];
  keywords: string[];
  visibilitySettings: {
    publicCompanyPage: boolean;
    exposeOnJobs: boolean;
    exposeOnSearch: boolean;
  };
}

export interface CompanyVerification {
  businessLicenseFile: { name: string; status: FileStatus };
  additionalFiles: Array<{ name: string; status: FileStatus }>;
  verificationStatus: CompanyVerificationStatus;
  changeRequestStatus: "none" | "requested" | "reviewing";
}

export interface CompanyManager {
  managerName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  accountId: string;
}

export interface CompanyStats {
  activeJobCount: number;
  favoriteCount: number;
  followerCount: number;
  responseRate: string;
  averageResponseTime: string;
}

export const companyTypeOptions: Array<{ id: CompanyType; label: string }> = [
  { id: "pharma", label: "제약사" },
  { id: "biotech", label: "바이오텍" },
  { id: "medical_device", label: "의료기기" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "distribution", label: "유통·도매" },
  { id: "etc", label: "기타" },
];

export const employeeCountOptions: Array<{ id: EmployeeCountRange; label: string }> = [
  { id: "under_50", label: "50명 이하" },
  { id: "51_100", label: "51~100명" },
  { id: "101_500", label: "101~500명" },
  { id: "over_501", label: "501명 이상" },
];

export const businessAreaOptions = [
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

export const jobCategoryOptions = [
  "RA",
  "CRA",
  "MSL",
  "PV",
  "QC/QA",
  "생산",
  "R&D",
  "약무",
  "영업·마케팅",
  "BD",
  "Medical Affairs",
  "Market Access",
];

export const keywordOptions = [
  "환자 중심",
  "글로벌 진출",
  "R&D 중심",
  "품질 중심",
  "규제 대응",
  "신약개발",
  "생산시설 보유",
  "해외 인허가",
  "디지털 헬스케어",
];

export const initialBusinessCompanyProfile: CompanyProfileMaster = {
  orgTrack: "industry",
  id: "thepharma-news",
  displayName: "더파마뉴스",
  legalName: "주식회사 더파마뉴스",
  businessNumber: "570-86-03548",
  corporateRegistrationNumber: "110111-1234567",
  representativeName: "홍길동",
  verificationStatus: "approved",
  approvedAt: "2024.02.21",
  companyType: "etc",
  industry: "제약·바이오 산업 전문 채용 플랫폼",
  address: "서울특별시 강남구 테헤란로 123, 6층",
  zipCode: "06277",
  detailAddress: "삼성빌딩 6층 (역삼동)",
  homepageUrl: "https://www.thepharmanews.net",
  foundedYear: "2012",
  employeeCount: "101_500",
  phone: "02-1234-5678",
  fax: "02-1234-5679",
  email: "info@thepharmanews.net",
  logoUrl: "mock-logo",
  shortIntro: "제약·바이오 산업 정보와 채용 서비스를 제공하는 전문 플랫폼",
  fullIntro:
    "더파마뉴스는 제약·바이오 산업 정보를 기반으로 채용 정보와 기업 정보를 제공하는 전문 플랫폼입니다. 데이터 기반 매칭과 산업 특화 콘텐츠를 통해 기업과 구직자가 더 쉽게 연결될 수 있도록 돕습니다.",
  mainBusinessAreas: ["규제·인허가(RA)", "품질관리(QA/QC)", "의약·메디컬"],
  mainJobCategories: ["RA", "PV", "QC/QA", "Medical Affairs"],
  products: ["전문 뉴스 서비스", "데이터 리포트", "컨설팅 서비스", "교육/세미나"],
  keywords: ["글로벌 진출", "R&D 중심", "규제 대응", "디지털 헬스케어"],
  visibilitySettings: {
    publicCompanyPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

export const businessCompanyVerification: CompanyVerification = {
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  additionalFiles: [{ name: "기타 인증 서류.pdf", status: "pending" }],
  verificationStatus: "approved",
  changeRequestStatus: "none",
};

export const businessCompanyManager: CompanyManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

export const businessCompanyStats: CompanyStats = {
  activeJobCount: 12,
  favoriteCount: 1245,
  followerCount: 3452,
  responseRate: "92%",
  averageResponseTime: "1.2일",
};

export const requiredCompanyProfileFields: Array<{
  key: keyof CompanyProfileMaster | "verified";
  label: string;
  /** 브랜드 페이지 미리보기의 "부족한 정보 채우기"가 딥링크할 기업정보 관리 SectionCard id */
  sectionId: string;
}> = [
  { key: "displayName", label: "기업명", sectionId: "basic" },
  { key: "logoUrl", label: "기업 로고", sectionId: "profile" },
  { key: "verified", label: "인증 상태", sectionId: "verification" },
  { key: "shortIntro", label: "한 줄 소개", sectionId: "profile" },
  { key: "industry", label: "업종/산업 분야", sectionId: "basic" },
  { key: "companyType", label: "기업 형태", sectionId: "basic" },
  { key: "employeeCount", label: "사원수", sectionId: "basic" },
  { key: "foundedYear", label: "설립연도", sectionId: "basic" },
  { key: "address", label: "대표 주소", sectionId: "basic" },
];

export function getMissingRequiredCompanyFields(profile: CompanyProfileMaster) {
  return requiredCompanyProfileFields.filter((field) => {
    if (field.key === "verified") return profile.verificationStatus !== "approved";
    return !String(profile[field.key] ?? "").trim();
  });
}
