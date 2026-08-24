import { companies, companyReviews } from "@/data/companies";
import { companyProfiles } from "@/data/companyProfiles";
import { jobs } from "@/data/jobs";
import { companyLogos } from "@/config/companyImages";
import { MOCK_TODAY_DATE } from "@/config/mockToday";
import { getPharmacyRegistryEntry, pharmacyRegistry } from "@/data/pharmacyRegistry";
import type { PharmacyClaimStatus } from "@/data/pharmacyDetail";
import type { Job, JobTrack } from "@/types/jobs";
import { getCompanyInitial } from "@/utils/companyInitial";

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
  /** 기업 리뷰 + 면접 후기 총합. 정렬(후기순)의 1차 기준이자 나머지 정렬의 2차 기준으로 쓴다 */
  reviewCount: number;
  companyReviewCount: number;
  interviewReviewCount: number;
  /** 실제 관심기업 수 데이터가 없으면 임의로 만들지 않고 null로 둔다(화면에서 항목 자체를 숨김) */
  interestedCount: number | null;
  activeJobCount: number;
  /** companyProfiles.ts에 프로필이 있으면 기본 상세 페이지(/companies/{id}), 없으면 항상 렌더되는 리뷰 페이지(/companies/{id}/reviews)로 폴백한다 */
  detailHref: string;
  /** 약국 트랙에만 있다. 등록부에만 있는(주인 없는) 약국을 목록에서 갈라 내는 축 — 다른 트랙은 undefined다 */
  claimStatus?: PharmacyClaimStatus;
  /** 약국 트랙에만 채운다. 목록 검색이 이름 외에 주소도 훑어야 하는 것은 동명 약국이 흔해서다(다른 트랙은 undefined) */
  address?: string;
}

/**
 * companies.ts 각 기업이 속한 트랙은 Company 타입에 없는 정보라 여기서만 한 번 매핑한다.
 * 새 기업이 companies.ts에 추가되면 이 매핑도 함께 추가해야 한다.
 * 등록부에만 있는 약국은 매핑 없이 pharmacy로 파생된다(getCompanyTrack 참고).
 */
const trackById: Record<string, JobTrack> = {
  "thepharmin-pharma": "industry",
  "eunhaeng-pharmacy": "pharmacy",
  "hyundai-pharmacy": "pharmacy",
  "hwagok-gibeum-pharmacy": "pharmacy",
  "hyeongang-pharmacy": "pharmacy",
  "yeongdong-365-pharmacy": "pharmacy",
  "bichina-pharmacy": "pharmacy",
  "masan-yugil-pharmacy": "pharmacy",
  "shin-jungang-pharmacy": "pharmacy",
  "munmu-pharmacy": "pharmacy",
  "buldang-central-pharmacy": "pharmacy",
  "thepharma-pharmacy": "pharmacy",
  yuhan: "industry",
  "samsung-biologics": "industry",
  hugel: "industry",
  celltrion: "industry",
  "hanmi-pharm": "industry",
  chongkundang: "industry",
  greencross: "industry",
  "medicoa-cro": "industry",
  // 아래 10곳은 종전까지 매핑 없이 기본값("industry")으로 떨어지고 있었다 — 이 파일이 트랙의 단일 출처라
  // 기본값에 기대지 않고 명시한다(위 주석의 "새 기업이 추가되면 이 매핑도 함께 추가" 규칙과 같은 이유).
  "otsuka-korea": "industry",
  bukwang: "industry",
  "lgchem-life-science": "industry",
  "yuyu-pharm": "industry",
  cellbion: "industry",
  "samsung-pharm": "industry",
  oreon: "industry",
  "aju-pharm": "industry",
  "samo-pharm": "industry",
  "kolon-biotech": "industry",
  snubh: "hospital",
  "hanbit-general-hospital": "hospital",
  "mirae-care-hospital": "hospital",
  "national-special-medical-center": "hospital",
  "hmcseoul-hospital": "hospital",
  "national-central-hospital": "hospital",
  "jeil-orthopedic-hospital": "hospital",
  "muju-county-care-hospital": "hospital",
  "national-fire-hospital": "hospital",
  "sungae-hospital": "hospital",
  "armed-forces-seoul-district-hospital": "hospital",
  "osan-hankook-hospital": "hospital",
  snuh: "hospital",
  kist: "research",
  "seoul-asan-hospital": "research",
  kbri: "research",
  "kangwon-univ-natural-product": "research",
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
  celltrion: "pharma_bio",
  "hanmi-pharm": "pharma_bio",
  chongkundang: "pharma_bio",
  greencross: "pharma_bio",
  // 원고에서 카테고리를 "CRO·CDMO"로 명시한 임상시험 수탁기관이라 CRO·CDMO 탭으로 분류한다
  "medicoa-cro": "cro_cdmo",
  // 프로필의 기관 유형·태그가 "CRO·CDMO"로 명시된 바이오의약품 위탁생산 기업이라 CRO·CDMO 탭으로 분류한다
  "kolon-biotech": "cro_cdmo",
};

/** 기업정보 허브 랜딩 로고 스트립에서 맨 앞에 고정 노출할 기업 id(이후 프로필 보유 기업 → 나머지 로고 보유 기업 순으로 이어붙인다). companyProfiles.ts에 프로필이 있는 기업 중 수동 선정 */
export const FEATURED_COMPANY_IDS = ["celltrion", "hanmi-pharm"];

export function regionFromAddress(address: string) {
  return address.split(" ").slice(0, 2).join(" ");
}

/**
 * 약국 트랙 전용 지역 표기 — 시도·시군구에 한 토큰(읍면동)을 더 붙인다.
 *
 * 약국은 동명이 흔해서("중앙약국"이 시군구 안에 여럿 있다) 두 토큰만으로는 목록에서 어느 약국인지
 * 갈라지지 않는다. 세 번째 토큰이 숫자로 시작하면(도로명 번지·"1620-3" 같은 지번) 지역이 아니라
 * 주소의 나머지라 두 토큰으로 되돌린다.
 *
 * 다른 세 트랙은 regionFromAddress를 그대로 쓴다 — 그쪽은 기관 수가 적어 시군구로 충분하고,
 * 지금 렌더를 바꿀 이유가 없다.
 */
export function pharmacyRegionFromAddress(address: string) {
  const tokens = address.split(" ");
  const third = tokens[2];
  if (!third || /^[0-9]/.test(third)) return tokens.slice(0, 2).join(" ");
  return tokens.slice(0, 3).join(" ");
}

/** 시·도 단위(주소 첫 토큰)만 비교할 때 쓴다. "같은 지역" 매칭(예: 약국 상세의 같은 지역 채용중 약국)은
 * regionFromAddress의 시·도+시/군/구 두 토큰이 아니라 이 한 토큰 기준이다. */
export function provinceFromAddress(address: string) {
  return address.split(" ")[0];
}

/** companies.ts 각 기업이 속한 트랙 조회. companyDirectory 배열을 만들 필요 없이 단건 조회할 때 사용.
 * companies.ts에 없는 id는 등록부(pharmacyRegistry)에 있으면 약국으로 파생한다 — 전국 약국은
 * 수동 매핑에 담을 수 없고, 등록부에 있다는 사실 자체가 약국이라는 뜻이다. */
export function getCompanyTrack(companyId: string): JobTrack {
  return trackById[companyId] ?? (getPharmacyRegistryEntry(companyId) ? "pharmacy" : "industry");
}

/** "(주)"·"주식회사"·공백을 제거해 표기가 다른 동일 기업명을 비교할 수 있게 정규화한다. 실제 이름 문자열은 건드리지 않고 비교 시점에만 적용한다 */
function normalizeCompanyName(name: string) {
  return name.replace(/\(주\)|주식회사/g, "").replace(/\s+/g, "");
}

/** "채용중" 판정 — 마감일이 지난 공고는 제외한다. 상시채용(closingStatus: "always"/deadlineType: "untilHired")과
 * 마감일 정보가 없는 공고는 계속 채용중으로 취급한다. job-detail/shared.tsx의 deadlineLabel()과 동일한 마감 판정 규칙이다 */
export function isJobActive(job: Job, referenceDate: Date = MOCK_TODAY_DATE) {
  if (job.isClosed) return false;
  if (job.deadlineType === "untilHired" || job.closingStatus === "always") return true;
  if (!job.deadline) return true;

  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  return new Date(`${job.deadline}T00:00:00`).getTime() >= today.getTime();
}

/**
 * 채용중 공고 목록의 단일 소스 — 홈 카드/기업 인사이트 리스트·상세(탭 숫자·미리보기 카드 목록)가 모두 이 함수를 쓴다.
 * companyProfiles.ts의 jobs 배열(상세 페이지용 큐레이션 미리보기)은 집계 대상이 아니다 — 실제 공고 원장인 jobs.ts만 조회한다.
 * 매칭 우선순위: ① job.companyId 명시 연결 → ② company.name과 job.company 이름 정규화 비교 →
 * ③ company.name과 job.researchLab.institution 이름 정규화 비교. 매칭 후보에서도 마감 지난 공고는 제외한다.
 */
export function getActiveJobs(companyId: string): Job[] {
  const companyName = companies.find((company) => company.id === companyId)?.name;
  const normalizedName = companyName ? normalizeCompanyName(companyName) : null;

  return jobs.filter((job) => {
    if (!isJobActive(job)) return false;
    if (job.companyId === companyId) return true;
    if (!normalizedName) return false;
    if (normalizeCompanyName(job.company) === normalizedName) return true;
    if (job.researchLab?.institution && normalizeCompanyName(job.researchLab.institution) === normalizedName) return true;
    return false;
  });
}

/** getActiveJobs와 같은 필터를 공유해 목록·카운트가 어긋나지 않는다. 카운트만 필요할 때 쓴다 */
export function getActiveJobCount(companyId: string) {
  return getActiveJobs(companyId).length;
}

/**
 * 기업 상세가 세는 목적지별 건수(채용공고·면접 후기·기업 리뷰·뉴스).
 *
 * 라우트 탭 행(CompanyDetailTabs)과 ≤760px 섹션 앵커(SectionAnchorNav)가 같은 숫자를 쓴다 —
 * 761px 이상에서는 탭 행이, ≤760px에서는 앵커 행이 그 숫자를 보여주는 구조라 두 곳이 어긋나면
 * 폭을 넘나드는 순간 같은 항목의 건수가 달라진다. 값은 전부 실제 데이터 length다.
 */
export function getCompanyDetailCounts(companyId: string) {
  const profile = companyProfiles.find((item) => item.id === companyId);
  const countReviews = (type: "interview" | "company") =>
    companyReviews.filter((review) => review.companyId === companyId && review.type === type).length;

  return {
    jobs: getActiveJobCount(companyId),
    interviews: countReviews("interview"),
    reviews: countReviews("company"),
    news: profile?.news.length ?? 0,
  };
}

/**
 * 사이드바 표기용 문자열("1,245"·"25,000+"·"-")을 정렬용 숫자로 읽는다.
 * 후행 "+"는 "그 이상"이라는 어림수 표기라 하한값으로 받는다 — "25,000+" → 25000.
 * 종전에는 콤마만 벗겨 "25000+"를 Number()에 넘겼고, 그 NaN이 null로 떨어지면서
 * "+"가 붙은 9곳이 전부 관심순 정렬에서 0으로 취급됐다(유효값이 "1,245" 한 곳뿐이었다).
 * 표기 자체는 상세 사이드바(CompanyCoreInfoCard)가 원본 문자열을 그대로 쓰므로 여기서 벗겨도 화면은 그대로다.
 */
function parseCount(value?: string) {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").replace(/\+$/, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * 등록부에만 있는(주인 없는) 약국을 목록 항목으로 옮긴다.
 *
 * 여기서 새로 만드는 값은 없다 — 이름·주소는 등록부가 정본이고, 후기·공고 수는 등록된 기업과 **같은
 * 함수**로 센다(지금은 전부 0이지만, 공고가 그 id로 붙는 날 자동으로 따라 올라간다).
 * logoText/logoColor는 이 목록의 행이 읽지 않는 값이다(로고 칸은 logoUrl 아니면 getCompanyInitial로
 * 떨어진다) — 타입이 필수로 들고 있어 이름 기반 이니셜과 기존 약국의 색을 그대로 채운다.
 */
function buildRegistryPharmacyEntries(): CompanyDirectoryEntry[] {
  return pharmacyRegistry
    .filter((entry) => !entry.companyId)
    .map((entry) => {
      const reviewsForPharmacy = companyReviews.filter((review) => review.companyId === entry.id);

      return {
        id: entry.id,
        name: entry.name,
        track: "pharmacy" as const,
        /** 등록부는 약국 유형을 내려주지 않는다 — companies.ts 약국이 가장 많이 쓰는 값을 그대로 쓴다 */
        type: "일반약국",
        region: pharmacyRegionFromAddress(entry.address),
        logoText: getCompanyInitial(entry.name),
        logoColor: "#111111",
        /** 인증 절차를 지나지 않았다 — 행의 인증 배지가 서지 않는다 */
        verified: false,
        reviewCount: reviewsForPharmacy.length,
        companyReviewCount: reviewsForPharmacy.filter((review) => review.type === "company").length,
        interviewReviewCount: reviewsForPharmacy.filter((review) => review.type === "interview").length,
        /** 관심 등록 수는 프로필에만 있는 값이라 지어내지 않는다 */
        interestedCount: null,
        activeJobCount: getActiveJobCount(entry.id),
        detailHref: `/companies/${entry.id}`,
        claimStatus: "unclaimed" as const,
        address: entry.address,
      };
    });
}

/** 기업정보 홈의 "기업·기관 탐색" 목록. companies.ts/companyProfiles.ts에 실제로 등록된 기업·기관과,
 * 등록부에만 있는 약국을 이어붙인다 — 예시를 위해 새 기관을 추가하지 않는다.
 * 정렬·그룹 분할은 소비처(CompaniesHomeClient)가 하므로 여기서는 순서를 만들지 않는다. */
const registeredDirectory: CompanyDirectoryEntry[] = companies.map((company) => {
  const profile = companyProfiles.find((item) => item.id === company.id);
  const track = trackById[company.id] ?? "industry";
  const reviewsForCompany = companyReviews.filter((review) => review.companyId === company.id);

  return {
    id: company.id,
    name: company.name,
    track,
    industryGroup: track === "industry" ? industryGroupById[company.id] ?? "pharma_bio" : undefined,
    type: company.industry,
    /** 약국만 읍면동까지 — 동명 약국이 흔해 시군구로는 갈라지지 않는다(다른 트랙은 종전 두 토큰 그대로) */
    region: track === "pharmacy" ? pharmacyRegionFromAddress(company.address) : regionFromAddress(company.address),
    logoText: company.logoText,
    // 다른 화면(JobCard·홈·공고 상세)과 같은 "직접 필드 ?? 이름으로 조회" 순서. companies.ts에 logoUrl을
    // 채우는 대신 여기서 폴백해야 companyLogos가 로고 자산의 단일 출처로 남는다
    logoUrl: company.logoUrl ?? companyLogos[company.name],
    logoColor: company.logoColor,
    logoAccent: company.logoAccent,
    verified: company.verified,
    reviewCount: reviewsForCompany.length,
    companyReviewCount: reviewsForCompany.filter((review) => review.type === "company").length,
    interviewReviewCount: reviewsForCompany.filter((review) => review.type === "interview").length,
    interestedCount: parseCount(profile?.sidebar.interestedCount),
    activeJobCount: getActiveJobCount(company.id),
    detailHref: profile ? `/companies/${company.id}` : `/companies/${company.id}/reviews`,
    /** 사이트에 등록돼 있다는 것이 곧 주인이 있다는 뜻이다(다른 트랙은 이 축 자체가 없어 undefined) */
    claimStatus: track === "pharmacy" ? ("claimed" as const) : undefined,
    address: track === "pharmacy" ? company.address : undefined,
  };
});

export const companyDirectory: CompanyDirectoryEntry[] = [...registeredDirectory, ...buildRegistryPharmacyEntries()];
