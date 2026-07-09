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

const ORG_TRACK_KEY = "thepharmin_signup_org_track";
const PHARMACY_TYPE_KEY = "thepharmin_signup_pharmacy_type";
const PHARMACY_FEATURE_KEY = "thepharmin_signup_pharmacy_feature";

const validOrgTracks: OrgTrack[] = ["industry", "hospital", "pharmacy", "research"];
const validPharmacyTypes: PharmacyType[] = ["local", "clinic-front", "large", "beauty"];
const validPharmacyFeatureIds: string[] = pharmacyFeatureOptions.map((option) => option.id);

/** 가입 완료 시 저장된 orgTrack — /business/company/profile(BusinessOrgProfilePageClient)이 어느 트랙 전용 정보관리 페이지(/business/{track}/profile)로 리다이렉트할지 결정하는 데 쓰인다. */
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
