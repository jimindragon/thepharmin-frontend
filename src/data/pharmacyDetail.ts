import { companies } from "@/data/companies";
import { getCompanyProfile, type CompanyProfile } from "@/data/companyProfiles";
import {
  getPharmacyRegistryEntry,
  getPharmacyRegistryEntryByCompanyId,
  type PharmacyRegistryEntry,
} from "@/data/pharmacyRegistry";
import type { Company } from "@/types/jobs";

/**
 * 읽기 전용 조립 계층. 등록부=기본 정보, Company/CompanyProfile=추가 정보.
 * 여기에 데이터를 적지 말 것. 장기적으로 공통 기본정보 정본을 등록부로 통합하는 마이그레이션 검토 예정.
 */

/** "pending"은 다음 사이클(서비스 상태)에서 추가 */
export type PharmacyClaimStatus = "unclaimed" | "claimed";

export interface PharmacyDetailModel {
  /** URL 키. 프로필이 있으면 CompanyProfile.id, 없으면 등록부 id */
  id: string;
  name: string;
  address: string;
  phone?: string;
  openedOn?: string;
  claimStatus: PharmacyClaimStatus;
  registry: PharmacyRegistryEntry;
  company?: Company;
  profile?: CompanyProfile;
}

/**
 * CompanyDetailSections의 detailValue와 같은 조회다 — 그쪽이 "본사 위치" 행을 이렇게 꺼내므로
 * 여기서도 같은 규칙을 써야 프로필 있는 약국의 주소가 지금 화면과 어긋나지 않는다.
 * 헬퍼를 공유하지 않는 것은 그쪽이 컴포넌트 파일의 로컬 함수라서다.
 */
function profileAddress(profile: CompanyProfile): string | undefined {
  return profile.details.find((item) => item.label === "본사 위치")?.value ?? undefined;
}

/**
 * URL 세그먼트 하나로 약국 상세의 재료를 모은다.
 *
 * 받는 값은 두 갈래다 — 등록부 id(암호화 요양기호, 프로필 없는 약국)와 기업 id(사이트 등록 약국).
 * 앞을 먼저 보는 것은 등록부가 기본 정보의 출처이기 때문이고, 기업 id는 그 항목의 companyId로
 * 역조회한다. 어느 쪽으로도 등록부 항목에 닿지 못하면 약국이 아니므로 null이다.
 *
 * **값 우선순위는 회귀 방지용 임시 규칙이다.** 지금 화면에 이미 서 있는 약국 11곳의 렌더가 바뀌면
 * 안 되므로, 프로필이 있으면 프로필 값이 이기고 없을 때만 등록부로 내려간다. 두 곳이 같은 사실을
 * 서로 다르게 들고 있는 상태 자체는 위 주석의 마이그레이션에서 정리한다.
 */
export function resolvePharmacyDetail(param: string): PharmacyDetailModel | null {
  const registry = getPharmacyRegistryEntry(param) ?? getPharmacyRegistryEntryByCompanyId(param);
  if (!registry) return null;

  const company = registry.companyId ? companies.find((item) => item.id === registry.companyId) : undefined;
  const profile = registry.companyId ? getCompanyProfile(registry.companyId) : undefined;

  return {
    id: profile ? profile.id : registry.id,
    name: profile?.name ?? registry.name,
    address: (profile ? profileAddress(profile) : undefined) ?? registry.address,
    phone: (profile ? profile.phone : undefined) ?? registry.phone,
    openedOn: registry.openedOn,
    /** 파생값이다 — 어디에도 저장하지 않는다 */
    claimStatus: registry.companyId ? "claimed" : "unclaimed",
    registry,
    company,
    profile,
  };
}
