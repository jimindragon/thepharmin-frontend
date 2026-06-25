import { companies, companyReviews } from "@/data/companies";
import { companyProfiles } from "@/data/companyProfiles";
import type { JobTrack } from "@/types/jobs";

export type IndustryGroup = "pharma_bio" | "cro_cdmo";

export interface CompanyDirectoryEntry {
  id: string;
  name: string;
  track: JobTrack;
  /** track === "industry"일 때만 의미 있다. 산업 트랙 기업을 제약·바이오/CRO·CDMO 큐레이션 탭으로 나누는 세분류 */
  industryGroup?: IndustryGroup;
  /** 기업·기관 유형(예: 전문의약품 제조업, 의원(층)약국). Company.industry를 그대로 쓴다 */
  type: string;
  region: string;
  logoText: string;
  logoUrl?: string;
  logoColor: string;
  logoAccent?: string;
  verified: boolean;
  /** 기업 리뷰 + 면접 후기 총합. 정렬(리뷰순)에 쓴다 */
  reviewCount: number;
  companyReviewCount: number;
  interviewReviewCount: number;
  /** 실제 관심기업 수 데이터가 없으면 임의로 만들지 않고 null로 둔다(화면에서 항목 자체를 숨김) */
  interestedCount: number | null;
  activeJobCount: number;
  /** companyProfiles.ts에 프로필이 있으면 기본 상세 페이지(/companies/{id}), 없으면 항상 렌더되는 리뷰 페이지(/companies/{id}/reviews)로 폴백한다 */
  detailHref: string;
}

/**
 * companies.ts 각 기업이 속한 트랙은 Company 타입에 없는 정보라 여기서만 한 번 매핑한다.
 * 새 기업이 companies.ts에 추가되면 이 매핑도 함께 추가해야 한다.
 */
const trackById: Record<string, JobTrack> = {
  "thepharmin-pharma": "industry",
  "eunhaeng-pharmacy": "pharmacy",
  yuhan: "industry",
  "samsung-biologics": "industry",
  hugel: "industry",
};

/**
 * 산업(industry) 트랙 기업을 제약·바이오/CRO·CDMO 큐레이션 탭으로 나누는 수동 매핑.
 * Company 타입에는 이 구분이 없어 trackById와 같은 방식으로 여기서만 관리한다.
 * 매핑이 없는 산업 기업은 기본값 "pharma_bio"로 분류한다 — 새 CRO·CDMO 기업이 추가되면 여기에 추가해야 한다.
 */
const industryGroupById: Record<string, IndustryGroup> = {
  "thepharmin-pharma": "pharma_bio",
  yuhan: "pharma_bio",
  // 배지·태그가 "바이오/CDMO"로 명시된 위탁개발생산 전문기업이라 CRO·CDMO 탭으로 분류한다
  "samsung-biologics": "cro_cdmo",
  hugel: "pharma_bio",
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
  const track = trackById[company.id] ?? "industry";
  const reviewsForCompany = companyReviews.filter((review) => review.companyId === company.id);

  return {
    id: company.id,
    name: company.name,
    track,
    industryGroup: track === "industry" ? industryGroupById[company.id] ?? "pharma_bio" : undefined,
    type: company.industry,
    region: regionFromAddress(company.address),
    logoText: company.logoText,
    logoUrl: company.logoUrl,
    logoColor: company.logoColor,
    logoAccent: company.logoAccent,
    verified: company.verified,
    reviewCount: reviewsForCompany.length,
    companyReviewCount: reviewsForCompany.filter((review) => review.type === "company").length,
    interviewReviewCount: reviewsForCompany.filter((review) => review.type === "interview").length,
    interestedCount: parseCount(profile?.sidebar.interestedCount),
    activeJobCount: company.activeJobCount,
    detailHref: profile ? `/companies/${company.id}` : `/companies/${company.id}/reviews`,
  };
});
