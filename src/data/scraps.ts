import type { JobTrack } from "@/types/jobs";

export type ScrapedOrganizationType = "company" | "hospital" | "pharmacy";

export interface ScrapedOrganization {
  id: string;
  name: string;
  type: ScrapedOrganizationType;
  logoText: string;
  logoColor: string;
  summary: string;
  activeJobCount: number;
  /** 프로필 페이지가 있으면 해당 경로, 없으면 채용공고 검색으로 연결되는 자연스러운 대체 경로 */
  href: string;
}

const typeTrack: Record<ScrapedOrganizationType, JobTrack> = {
  company: "industry",
  hospital: "hospital",
  pharmacy: "pharmacy",
};

function fallbackHref(name: string, type: ScrapedOrganizationType) {
  return `/jobs?track=${typeTrack[type]}&keyword=${encodeURIComponent(name)}`;
}

/**
 * 마이페이지 스크랩 화면이 사용하는 목업 데이터.
 * 실제 백엔드 연동 전까지는 이 배열을 초기 상태로 쓰고, 이후에는 API 응답으로 교체하면 된다.
 * 상세 페이지 이동을 시연할 수 있도록 slug가 있는 공고(101, 102, 106, 108)로만 구성했다.
 */
export const scrapedJobIds: number[] = [101, 102, 106, 108];

export const scrapedOrganizations: ScrapedOrganization[] = [
  {
    id: "thepharmin-pharma",
    name: "더팜인제약(주)",
    type: "company",
    logoText: "더팜인제약",
    logoColor: "#111111",
    summary: "전문의약품 제조업 · 인허가/RA 중심 중견 제약사",
    activeJobCount: 4,
    href: "/companies/thepharmin-pharma",
  },
  {
    id: "bionex",
    name: "바이오넥스(주)",
    type: "company",
    logoText: "바이오넥스",
    logoColor: "#1f6f5c",
    summary: "바이오의약품 개발 · 글로벌 인허가",
    activeJobCount: 2,
    href: fallbackHref("바이오넥스", "company"),
  },
  {
    id: "snuh",
    name: "서울대학교병원",
    type: "hospital",
    logoText: "서울대병원",
    logoColor: "#1d4ed8",
    summary: "상급종합병원 · 임상시험센터(CRC·CRA) 채용",
    activeJobCount: 3,
    href: fallbackHref("서울대학교병원", "hospital"),
  },
  {
    id: "onnuri-jongno",
    name: "온누리약국 종로점",
    type: "pharmacy",
    logoText: "온누리",
    logoColor: "#b45309",
    summary: "지역약국 · 약무/복약지도",
    activeJobCount: 1,
    href: fallbackHref("온누리약국", "pharmacy"),
  },
];
