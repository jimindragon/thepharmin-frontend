import { companyExampleImages } from "@/config/companyImages";
import { jobTrackLabels } from "@/config/jobTracks";
import { jobs } from "@/data/jobs";
import type { JobTrack } from "@/types/jobs";

export type HomeTrackFilter = "all" | JobTrack;

export function trackToJobTrack(track: HomeTrackFilter): JobTrack {
  return track === "all" ? "industry" : track;
}

export interface HomeHeroSlide {
  id: number;
  kind: "track" | "company";
  track: HomeTrackFilter;
  title: string;
  subtitle: string;
  tags: string[];
  href: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
}

export const homeHeroSlides: HomeHeroSlide[] = [
  {
    id: 1,
    kind: "track",
    track: "research",
    title: "새로운 발견이 시작되는 연구 현장",
    subtitle: "대학·병원·출연연의 연구 인재 채용",
    tags: ["박사후연구원·포닥", "연구원", "임상시험 운영"],
    href: "/jobs/research",
    image: "/images/home/hero-research-biology.jpg",
    imageAlt: "DNA 이중나선 구조 시각화",
    imagePosition: "center",
  },
  {
    id: 2,
    kind: "track",
    track: "industry",
    title: "제약·바이오 산업을 움직이는 사람들",
    subtitle: "허가·임상부터 생산·품질까지, 전문직 채용",
    tags: ["RA", "CRA", "QA", "MSL"],
    href: "/jobs/industry",
    image: "/images/home/hero-industry-factory.jpg",
    imageAlt: "제약·바이오 생산 플랜트 전경",
    imagePosition: "center 62%",
  },
  {
    id: 3,
    kind: "track",
    track: "hospital",
    title: "의료 현장에서 이어가는 약사의 전문성",
    subtitle: "공공·종합병원 약제부의 인재 채용",
    tags: ["입원·조제 약사", "임상·전문약사", "약무행정"],
    href: "/jobs/hospital",
    image: "/images/home/hero-hospital.jpg",
    imageAlt: "종합병원 로비 전경",
    imagePosition: "center 38%",
  },
  {
    id: 4,
    kind: "track",
    track: "pharmacy",
    title: "좋은 약국에서 시작하는 더 나은 커리어",
    subtitle: "문전 약국부터 로컬 약국까지, 근무약사 채용",
    tags: ["문전 약국", "로컬 약국", "대형 약국"],
    href: "/jobs/pharmacy",
    image: "/images/home/hero-pharmacy.jpg",
    imageAlt: "약국 내부, 안내 자료를 살펴보는 모습",
    imagePosition: "center 30%",
  },
];

/**
 * CTA 라벨용 트랙별 전체 공고 수. 마감 여부로 거르지 않아 /jobs/{track} 목록 총계와 일치한다.
 * job.track은 deriveJobTrack으로 파생된 값이므로 트랙 판정을 다시 하지 않고 그대로 센다.
 */
function countJobsByTrack(track: JobTrack): number {
  return jobs.filter((job) => job.track === track).length;
}

/** 히어로 CTA 라벨. "{트랙명} 공고 {N}건 보기" 형식으로 실제 공고 수에서 파생한다. */
export function getHeroSlideCtaLabel(slide: HomeHeroSlide): string {
  const track = trackToJobTrack(slide.track);
  return `${jobTrackLabels[track]} 공고 ${countJobsByTrack(track)}건 보기`;
}

// id는 companies.ts 실존 id만 사용한다 — 카드 링크(/companies/{id})·로고(companyLogos[name])·채용중 공고 수가
// 전부 이 id/name을 단일 소스(companies.ts·companyProfiles.ts·jobs.ts)에서 파생하므로, 실존하지 않는 id는 dead end가 된다.
// name은 companyLogos 키와 완전 일치해야 로고가 뜬다(예: KIST는 "한국과학기술연구원(KIST)" 표기라야 매칭). 약국 2곳은 로고 키가 없어 텍스트 폴백이 정상.
export const premiumCompanies: Array<{
  id: string;
  name: string;
  lines: string[];
  track: HomeTrackFilter;
}> = [
  {
    id: "yuhan",
    name: "유한양행",
    lines: ["국내 신약개발 선도", "R&D·RA 경력직 채용"],
    track: "industry",
  },
  {
    id: "samsung-biologics",
    name: "삼성바이오로직스",
    lines: ["세계 1위 CDMO", "경력직·전문직 채용"],
    track: "industry",
  },
  {
    id: "celltrion-pharm",
    name: "셀트리온제약",
    lines: ["셀트리온 그룹 케미컬 부문", "RA·임상 채용"],
    track: "industry",
  },
  {
    id: "kist",
    name: "한국과학기술연구원(KIST)",
    lines: ["정부출연 융합연구기관", "학생연구원(인턴) 모집"],
    track: "research",
  },
  {
    id: "sungae-hospital",
    name: "성애병원",
    lines: ["다양한 진료과 종합병원", "파트약사 모집"],
    track: "hospital",
  },
  {
    id: "national-fire-hospital",
    name: "국립소방병원",
    lines: ["소방·재난 공공병원", "약무직 신규 채용"],
    track: "hospital",
  },
  {
    id: "eunhaeng-pharmacy",
    name: "은행약국",
    lines: ["의원층 처방 중심 약국", "파트타임 약사 채용"],
    track: "pharmacy",
  },
  {
    id: "hyundai-pharmacy",
    name: "현대약국",
    lines: ["100평 대형 문전약국", "풀타임 근무약사 채용"],
    track: "pharmacy",
  },
];

export const themeCurationCards: Array<{
  id: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
}> = [
  {
    id: "T1",
    title: "글로벌 빅파마 한국법인",
    subtitle: "외국계 제약·바이오 한국법인",
    image: companyExampleImages.meeting,
    href: "/themes/T1",
  },
  {
    id: "T2",
    title: "누구나 아는 대형 제약사",
    subtitle: "국내 대표 제약기업",
    image: companyExampleImages.primary,
    href: "/themes/T2",
  },
  {
    id: "T3",
    title: "바이오 생산 강자",
    subtitle: "CDMO·바이오 생산",
    image: companyExampleImages.lab,
    href: "/themes/T3",
  },
  {
    id: "T4",
    title: "주목받는 혁신 바이오벤처",
    subtitle: "차세대 신약 도전",
    image: companyExampleImages.research,
    href: "/themes/T4",
  },
  {
    id: "T5",
    title: "RA·인허가 전문관",
    subtitle: "허가·규제 직무",
    image: companyExampleImages.hero,
    href: "/themes/T5",
  },
  {
    id: "T6",
    title: "임상 전문관",
    subtitle: "임상 운영·관리 직무",
    image: companyExampleImages.workspace,
    href: "/themes/T6",
  },
  {
    id: "T7",
    title: "QA·QC 품질 전문관",
    subtitle: "품질보증·관리 직무",
    image: companyExampleImages.culture,
    href: "/themes/T7",
  },
  {
    id: "T8",
    title: "MSL·메디컬 전문관",
    subtitle: "메디컬·MSL 직무",
    image: companyExampleImages.office,
    href: "/themes/T8",
  },
  {
    id: "T9",
    title: "BD·라이선싱 전문관",
    subtitle: "사업개발·라이선싱 직무",
    image: companyExampleImages.culture,
    href: "/themes/T9",
  },
];

export const homeRecommendationJobIds = [123, 122, 120, 126]; // celltrionph-bd, kolonbiotech-qaqc, samo-bd, gsk-vaccine-msl-cvmd
