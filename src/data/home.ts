import type { JobTrack } from "@/types/jobs";

export type HomeTrackFilter = "all" | JobTrack;

export const homeTrackTabs: Array<{
  id: HomeTrackFilter;
  label: string;
}> = [
  { id: "all", label: "전체" },
  { id: "industry", label: "산업" },
  { id: "research", label: "연구" },
  { id: "hospital", label: "병원" },
  { id: "pharmacy", label: "약국" },
];

export const homeHeroSlides: Array<{
  id: number;
  track: HomeTrackFilter;
  title: string;
  tags: string[];
  positionCount: string;
  deadline: string;
  href: string;
}> = [
  {
    id: 1,
    track: "research",
    title: "바이오 원천기술 R&D, 박사후연구원·연구원 모집",
    tags: ["신약", "유전자치료", "바이오신소재"],
    positionCount: "18개 포지션 보기",
    deadline: "채용 마감 D-10",
    href: "/jobs?track=research",
  },
  {
    id: 2,
    track: "industry",
    title: "세계 1위 CDMO와 함께 성장할 경력직·전문직 채용",
    tags: ["공정개발", "QA·QC", "생산기술", "RA"],
    positionCount: "28개 포지션 보기",
    deadline: "채용 마감 D-12",
    href: "/jobs?track=industry",
  },
  {
    id: 3,
    track: "hospital",
    title: "상급종합병원 약제부, 임상약학 전문 인력 채용",
    tags: ["병원약사", "임상약사", "임상시험"],
    positionCount: "8개 포지션 보기",
    deadline: "채용 마감 D-8",
    href: "/jobs?track=hospital",
  },
  {
    id: 4,
    track: "pharmacy",
    title: "전국 거점 약국에서 근무·관리약사를 찾습니다",
    tags: ["근무약사", "관리약사", "파트타임"],
    positionCount: "34개 포지션 보기",
    deadline: "상시 채용",
    href: "/jobs?track=pharmacy",
  },
];

export const premiumCompanies: Array<{
  id: string;
  name: string;
  lines: string[];
  positionCount: string;
  track: HomeTrackFilter;
  logoText: string;
  logoTone?: "dark" | "light" | "plus";
}> = [
  {
    id: "yuhan",
    name: "유한양행",
    lines: ["국내 신약개발 선도", "R&D·RA 경력직 채용"],
    positionCount: "24개 포지션",
    track: "industry",
    logoText: "YH",
  },
  {
    id: "samsung-biologics",
    name: "삼성바이오로직스",
    lines: ["세계 1위 CDMO", "경력직·전문직 채용"],
    positionCount: "28개 포지션",
    track: "industry",
    logoText: "SB",
  },
  {
    id: "celltrion",
    name: "셀트리온",
    lines: ["글로벌 바이오시밀러 리더", "생산·QA·RA 채용"],
    positionCount: "15개 포지션",
    track: "industry",
    logoText: "CT",
  },
  {
    id: "kbsi",
    name: "한국기초과학지원연구원",
    lines: ["첨단 연구장비·분석 전문", "연구·행정 인력 채용"],
    positionCount: "12개 포지션",
    track: "research",
    logoText: "KBSI",
  },
  {
    id: "kribb",
    name: "한국생명공학연구원",
    lines: ["바이오 원천기술 R&D", "박사후연구원 모집"],
    positionCount: "18개 포지션",
    track: "research",
    logoText: "KRIBB",
  },
  {
    id: "snuh",
    name: "서울대학교병원",
    lines: ["병원약사·임상약학", "전문 인력 채용"],
    positionCount: "8개 포지션",
    track: "hospital",
    logoText: "SNUH",
  },
  {
    id: "onnuri",
    name: "온누리약국 네트워크",
    lines: ["전국 가맹약국", "근무·관리약사 채용"],
    positionCount: "34개 포지션",
    track: "pharmacy",
    logoText: "+",
    logoTone: "plus",
  },
  {
    id: "kpa",
    name: "대한약사회 파트너약국",
    lines: ["지역 거점 약국", "근무약사 상시 채용"],
    positionCount: "21개 포지션",
    track: "pharmacy",
    logoText: "+",
    logoTone: "plus",
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
    id: "core-biotech",
    title: "주목받는 혁신 바이오기업",
    subtitle: "성장하는 스타트업 모음",
    image: "/images/recommend-dna.svg",
    href: "/jobs?track=industry&companyType=biotech",
  },
  {
    id: "large-pharma",
    title: "누구나 아는 대형 제약사",
    subtitle: "대기업 계열 채용",
    image: "/images/company-office.svg",
    href: "/jobs?track=industry&companyType=pharma",
  },
  {
    id: "long-reward",
    title: "장기근속 포상이 있는 기업",
    subtitle: "복지 좋은 곳",
    image: "/images/job-cover-lab.svg",
    href: "/jobs?track=industry",
  },
  {
    id: "popular",
    title: "이번 주 지원 많은 공고",
    subtitle: "지금 인기 채용",
    image: "/images/recommend-lab.svg",
    href: "/jobs?sort=popular",
  },
  {
    id: "urgent",
    title: "마감 임박 얼리버드 공고",
    subtitle: "빠른 지원 필요",
    image: "/images/recommend-microscope.svg",
    href: "/jobs?sort=deadline",
  },
];

export const homeRecommendationJobIds = [102, 103, 104, 109];
