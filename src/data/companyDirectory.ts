import { companies, companyReviews } from "@/data/companies";
import { companyProfiles } from "@/data/companyProfiles";
import type { JobTrack } from "@/types/jobs";

export interface CompanyDirectoryEntry {
  id: string;
  name: string;
  track: JobTrack;
  /** 기업·기관 유형(예: 전문의약품 제조업, 의원(층)약국). Company.industry를 그대로 쓴다 */
  type: string;
  region: string;
  logoText: string;
  logoUrl?: string;
  logoColor: string;
  logoAccent?: string;
  verified: boolean;
  reviewCount: number;
  /** 실제 관심기업 수 데이터가 없으면 임의로 만들지 않고 null로 둔다(화면에서 항목 자체를 숨김) */
  interestedCount: number | null;
  activeJobCount: number;
  /** /companies/[id]/reviews는 companies.ts에 등록된 기업이면 항상 렌더되므로(리뷰 0건이어도 빈 상태) 항상 연결한다 */
  detailHref: string;
}

/**
 * companies.ts 각 기업이 속한 트랙은 Company 타입에 없는 정보라 여기서만 한 번 매핑한다.
 * 새 기업이 companies.ts에 추가되면 이 매핑도 함께 추가해야 한다.
 */
const trackById: Record<string, JobTrack> = {
  "thepharmin-pharma": "industry",
  "eunhaeng-pharmacy": "pharmacy",
};

function regionFromAddress(address: string) {
  return address.split(" ").slice(0, 2).join(" ");
}

function parseCount(value?: string) {
  if (!value) return null;
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

/** 기업정보 홈의 "기업·기관 탐색" 목록. companies.ts/companyProfiles.ts에 실제로 등록된 기업·기관만 포함한다 — 예시를 위해 새 기관을 추가하지 않는다. */
export const companyDirectory: CompanyDirectoryEntry[] = companies.map((company) => {
  const profile = companyProfiles.find((item) => item.id === company.id);

  return {
    id: company.id,
    name: company.name,
    track: trackById[company.id] ?? "industry",
    type: company.industry,
    region: regionFromAddress(company.address),
    logoText: company.logoText,
    logoUrl: company.logoUrl,
    logoColor: company.logoColor,
    logoAccent: company.logoAccent,
    verified: company.verified,
    reviewCount: companyReviews.filter((review) => review.companyId === company.id).length,
    interestedCount: parseCount(profile?.sidebar.interestedCount),
    activeJobCount: company.activeJobCount,
    detailHref: `/companies/${company.id}/reviews`,
  };
});
