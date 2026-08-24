import type { OrgTrack } from "@/data/businessCompanyProfile";
import { pharmacyFeatureOptions } from "@/config/jobFilters/pharmacyFilters";
import type { PharmacyType } from "@/types/jobs";

/** STEP A에서 고르는 "기관 유형" — 기업정보 관리 페이지의 CompanyType(기업 형태)과는 별개 분류다. */
export type SignupInstitutionType = "hospital" | "pharma" | "biotech" | "medical_device" | "cro_cdmo" | "research";

export const signupInstitutionTypeOptions: Array<{ id: SignupInstitutionType; label: string }> = [
  { id: "hospital", label: "병원" },
  { id: "pharma", label: "제약사" },
  { id: "biotech", label: "바이오텍" },
  { id: "medical_device", label: "의료기기" },
  { id: "cro_cdmo", label: "CRO·CDMO" },
  { id: "research", label: "연구기관" },
];

/** 병원은 orgTrack "hospital", 연구기관은 "research", 나머지는 "industry" 폼을 쓴다. */
export function getOrgTrackForInstitutionType(type: SignupInstitutionType): OrgTrack {
  if (type === "hospital") return "hospital";
  if (type === "research") return "research";
  return "industry";
}

/** 트랙별 정보관리 페이지 경로 — 트랙 미상 화면의 분배기(BusinessOrgProfilePageClient)와
 * 트랙을 이미 알고 있는 화면(가입완료, 브랜드 페이지 미리보기)이 함께 쓰는 공유 매핑이다. */
export const trackProfilePath: Record<OrgTrack, string> = {
  industry: "/business/industry/profile",
  hospital: "/business/hospital/profile",
  pharmacy: "/business/pharmacy/profile",
  research: "/business/research/profile",
};

const ORG_TRACK_KEY = "thepharmin_signup_org_track";
const PHARMACY_TYPE_KEY = "thepharmin_signup_pharmacy_type";
const PHARMACY_FEATURE_KEY = "thepharmin_signup_pharmacy_feature";
const PHARMACY_ID_KEY = "thepharmin_signup_pharmacy_id";

const validOrgTracks: OrgTrack[] = ["industry", "hospital", "pharmacy", "research"];
const validPharmacyTypes: PharmacyType[] = ["local", "clinic-front", "large", "beauty"];
const validPharmacyFeatureIds: string[] = pharmacyFeatureOptions.map((option) => option.id);

/** 가입 완료 시 저장된 orgTrack — 트랙 정보가 없는 화면(결제내역, 1:1 문의 등)의 진입점인
 * /business/company/profile(BusinessOrgProfilePageClient)이 trackProfilePath 중 어디로 리다이렉트할지
 * 결정하는 데 쓰인다. 가입완료·브랜드 페이지 미리보기처럼 트랙을 이미 알고 있는 화면은 이 분배기를
 * 거치지 않고 trackProfilePath로 직접 이동한다. */
export function readSignupOrgTrack(): OrgTrack | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ORG_TRACK_KEY);
  return (validOrgTracks as string[]).includes(value ?? "") ? (value as OrgTrack) : null;
}

export function writeSignupOrgTrack(track: OrgTrack) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORG_TRACK_KEY, track);
}

/** 약국 가입 STEP1에서 고른 약국 유형 — 약국 정보 관리 페이지(PharmacyOrgProfileClient)에 프리필된다. */
export function readSignupPharmacyType(): PharmacyType | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(PHARMACY_TYPE_KEY);
  return (validPharmacyTypes as string[]).includes(value ?? "") ? (value as PharmacyType) : null;
}

export function writeSignupPharmacyType(type: PharmacyType) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PHARMACY_TYPE_KEY, type);
}

/** 약국 가입 STEP1에서 고른 조제 특성(선택) — 약국 정보 관리 페이지(PharmacyOrgProfileClient)에 프리필된다. */
export function readSignupPharmacyFeatureId(): string | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(PHARMACY_FEATURE_KEY);
  return validPharmacyFeatureIds.includes(value ?? "") ? value : null;
}

export function writeSignupPharmacyFeatureId(id: string | undefined) {
  if (typeof window === "undefined") return;
  if (!id) {
    window.localStorage.removeItem(PHARMACY_FEATURE_KEY);
    return;
  }
  window.localStorage.setItem(PHARMACY_FEATURE_KEY, id);
}

/**
 * 약국 가입 STEP1에서 고른 약국의 등록부 id(암호화 요양기호).
 *
 * 가입을 마친 계정이 어느 약국을 지목했는지 아는 유일한 자리다 — 인증 게이트(PharmacyClaimGate)가
 * 이 값을 읽어 그 약국을 미리 세운다. 다른 세 키와 달리 검증 목록이 없다: 등록부 id는 열거할 수 있는
 * 값이 아니라, 읽는 쪽이 등록부에서 찾아 보고 없으면 버린다.
 *
 * 직접 입력으로 가입한 약국은 등록부 id가 없어 이 키가 비어 있다(그쪽은 운영팀 검토로 이어진다).
 */
export function readSignupPharmacyId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PHARMACY_ID_KEY);
}

export function writeSignupPharmacyId(id: string | undefined) {
  if (typeof window === "undefined") return;
  if (!id) {
    window.localStorage.removeItem(PHARMACY_ID_KEY);
    return;
  }
  window.localStorage.setItem(PHARMACY_ID_KEY, id);
}
