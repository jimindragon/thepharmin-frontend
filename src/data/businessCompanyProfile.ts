export type CompanyVerificationStatus = "approved" | "pending" | "rejected" | "change_requested";
export type CompanyType = "pharma" | "biotech" | "medical_device" | "cro_cdmo" | "distribution" | "etc";
export type EmployeeCountRange = "under_50" | "51_100" | "101_500" | "over_501";
export type FileStatus = "approved" | "pending" | "rejected" | "change_requested";

/** 기업정보 관리 페이지가 어떤 트랙 폼을 그려야 하는지 결정하는 값. 기본은 항상 "industry". */
export type OrgTrack = "industry" | "hospital" | "pharmacy" | "research";

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
  products: string[];
  visibilitySettings: {
    publicCompanyPage: boolean;
    exposeOnJobs: boolean;
    exposeOnSearch: boolean;
  };
}

export interface CompanyManager {
  managerName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  accountId: string;
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

export const initialBusinessCompanyProfile: CompanyProfileMaster = {
  orgTrack: "industry",
  id: "thepharma-news",
  // 가입 위저드(OrgVerificationStep)에서 받는 값 — 신규 가입자도 이미 가짐
  displayName: "더파마뉴스",
  businessNumber: "570-86-03548",
  representativeName: "홍길동",
  verificationStatus: "approved",
  approvedAt: "2024.02.21",
  companyType: "etc",
  // 가입 후 기업정보 관리 페이지에서 채우는 상세값 — 신규 가입 직후엔 비어 있어야 함
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

export const businessCompanyManager: CompanyManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

/* ────────────────────────────────────────────────────────────────────────
 * 기관 정보 청사진 STEP 4-a — 4트랙(산업/병원/약국/연구) 공통 타입.
 * CompanyProfileMaster/initialBusinessCompanyProfile은 헤더·대시보드·공고등록폼 등에서
 * 아직 사용 중이라 존치한다(STEP 8-b에서 죽은 나머지 구 타입만 정리). Base 타입 통합은
 * STEP 9·10 이후 별도 작업으로 다룬다.
 * ──────────────────────────────────────────────────────────────────────── */

export interface OrgVisibilitySettings {
  publicPage: boolean;
  exposeOnJobs: boolean;
  exposeOnSearch: boolean;
}

/** 4트랙(산업/병원/약국/연구) 기관 프로필 공통 필드. orgType은 트랙별 분류값(산업=CompanyType 등)을 그대로 받는다 */
export interface OrgProfileBase<TOrgTrack extends OrgTrack = OrgTrack, TOrgType extends string = string> {
  id: string;
  orgTrack: TOrgTrack;
  orgType: TOrgType;
  name: string;
  foundedYear: string;
  zipCode: string;
  address: string;
  detailAddress: string;
  phone: string;
  email: string;
  homepageUrl: string;
  logoUrl: string | null;
  coverImageUrl: string | null;
  shortIntro: string;
  fullIntro: string;
  keywords: string[];
  visibilitySettings: OrgVisibilitySettings;
}

/** 인증 정보(읽기전용). §1에서 노출하며 운영팀 검토를 거쳐야 바뀐다 */
export interface OrgAdmin {
  businessNumber: string;
  representativeName: string;
  approvedAt: string;
  businessLicenseFile: { name: string; status: FileStatus };
  verificationStatus: CompanyVerificationStatus;
}

/** 담당자 정보. accountId는 §6(계정·노출 설정)으로 분리되어 여기서는 표시용으로만 남는다 */
export interface OrgManager {
  managerName: string;
  department: string;
  position: string;
  email: string;
  phone: string;
  accountId: string;
}

export interface IndustryOrgProduct {
  name: string;
  description: string;
}

/** §4 "사업·제품 분야" 옵션. 기관 유형(어떤 회사인가)·대표 제품(구체적으로 무엇인가)과 겹치지 않도록
 * 의료기기/CRO·CDMO/유통·도매(=기관 유형 값)는 의도적으로 제외했다 */
export const businessFieldOptions = [
  "신약개발",
  "바이오의약품",
  "합성의약품",
  "제네릭·개량신약",
  "백신",
  "세포·유전자치료제",
  "원료의약품(API)",
  "진단·검사",
  "건강기능식품",
  "디지털헬스케어",
  "동물의약품",
  "기타",
];

/** orgType은 CompanyType | "" — 가입 시 받는 institutionType(트랙 분기용, 연구 포함)과는 별개 enum이라
 * 승계하지 않고 신규 가입 직후엔 미선택("") 상태로 시작한다 */
export interface IndustryOrgProfile extends OrgProfileBase<"industry", CompanyType | ""> {
  employeeCount: EmployeeCountRange;
  /** 필수 아님. 기관 유형(§2)·대표 제품(§4)과 함께 "어떤 회사인가 → 무엇을 다루는가 → 구체적으로 무엇인가"로 구체화되는 계단 구조의 중간 단계 */
  businessFields?: string[];
  products: IndustryOrgProduct[];
}

export const initialIndustryOrgProfile: IndustryOrgProfile = {
  id: "thepharma-news",
  orgTrack: "industry",
  orgType: "",
  name: "더파마뉴스",
  foundedYear: "",
  zipCode: "",
  address: "",
  detailAddress: "",
  phone: "",
  email: "",
  homepageUrl: "",
  logoUrl: null,
  coverImageUrl: null,
  shortIntro: "",
  fullIntro: "",
  keywords: [],
  employeeCount: "under_50",
  businessFields: [],
  products: [],
  visibilitySettings: {
    publicPage: true,
    exposeOnJobs: true,
    exposeOnSearch: true,
  },
};

export const initialIndustryOrgAdmin: OrgAdmin = {
  businessNumber: "570-86-03548",
  representativeName: "홍길동",
  approvedAt: "2025.12.23",
  businessLicenseFile: { name: "사업자등록증명원.pdf", status: "approved" },
  verificationStatus: "approved",
};

export const initialIndustryOrgManager: OrgManager = {
  managerName: "이길동",
  department: "마케팅팀",
  position: "채용 담당자",
  email: "manager@thepharmanews.net",
  phone: "010-1234-5678",
  accountId: "biz-thepharma-news",
};

/** 미리보기 "부족한 정보 채우기" 딥링크용 — businessOrgProfile.ts(Hospital/Pharmacy)와 동일하게
 * predicate 기반으로 판정한다. sectionId는 BusinessCompanyProfileClient의 SectionCard id와 일치해야 한다. */
export interface RequiredIndustryOrgField {
  label: string;
  sectionId: string;
  missing: (profile: IndustryOrgProfile, admin: OrgAdmin) => boolean;
}

export const requiredIndustryOrgFields: RequiredIndustryOrgField[] = [
  { label: "인증 상태", sectionId: "verification", missing: (_profile, admin) => admin.verificationStatus !== "approved" },
  { label: "기관 유형", sectionId: "basic", missing: (profile) => !profile.orgType },
  { label: "기관명", sectionId: "basic", missing: (profile) => !profile.name.trim() },
  { label: "주소", sectionId: "basic", missing: (profile) => !profile.address.trim() },
  { label: "로고", sectionId: "profile", missing: (profile) => !profile.logoUrl },
  { label: "한 줄 소개", sectionId: "profile", missing: (profile) => !profile.shortIntro.trim() },
  { label: "본문 소개", sectionId: "profile", missing: (profile) => !profile.fullIntro.trim() },
];

export function getMissingRequiredIndustryOrgFields(profile: IndustryOrgProfile, admin: OrgAdmin) {
  return requiredIndustryOrgFields.filter((field) => field.missing(profile, admin));
}

/** 트랙별 프로필 미리보기 draft — 기관정보 관리(/business/{track}/profile)와 미리보기(/business/company/preview)가
 * 서로 다른 라우트라 props를 직접 넘길 수 없어 sessionStorage로 편집 중인 state를 넘긴다. 서버 저장은 하지 않는다. */
export function orgProfileDraftKey(track: OrgTrack): string {
  return `thepharmin_${track}_profile_preview_draft`;
}

export function saveIndustryOrgProfileDraft(profile: IndustryOrgProfile) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(orgProfileDraftKey("industry"), JSON.stringify(profile));
}

export function readIndustryOrgProfileDraft(): IndustryOrgProfile | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(orgProfileDraftKey("industry"));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IndustryOrgProfile;
  } catch {
    return null;
  }
}
