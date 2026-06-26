import { companyExampleImages } from "@/config/companyImages";
import type { JobTrack } from "@/types/jobs";

export type HomeTrackFilter = "all" | JobTrack;

export function trackToJobTrack(track: HomeTrackFilter): JobTrack {
  return track === "all" ? "industry" : track;
}

export const homeHeroSlides: Array<{
  id: number;
  track: HomeTrackFilter;
  title: string;
  tags: string[];
  positionCount: string;
  deadline: string;
  href: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
}> = [
  {
    id: 1,
    track: "research",
    title: "바이오 원천기술 R&D, 박사후연구원·연구원 모집",
    tags: ["신약", "유전자치료", "바이오신소재"],
    positionCount: "18개 포지션 보기",
    deadline: "채용 마감 D-10",
    href: "/jobs?track=research",
    image: "/images/home/hero-research-biology.jpg",
    imageAlt: "DNA 이중나선 구조 시각화",
    imagePosition: "center",
  },
  {
    id: 2,
    track: "industry",
    title: "세계 1위 CDMO와 함께 성장할 경력직·전문직 채용",
    tags: ["공정개발", "QA·QC", "생산기술", "RA"],
    positionCount: "28개 포지션 보기",
    deadline: "채용 마감 D-12",
    href: "/jobs?track=industry",
    image: "/images/home/hero-industry-factory.jpg",
    imageAlt: "제약·바이오 생산 플랜트 전경",
    imagePosition: "center 62%",
  },
  {
    id: 3,
    track: "hospital",
    title: "상급종합병원 약제부, 임상약학 전문 인력 채용",
    tags: ["병원약사", "임상약사", "임상시험"],
    positionCount: "8개 포지션 보기",
    deadline: "채용 마감 D-8",
    href: "/jobs?track=hospital",
    image: "/images/home/hero-hospital.jpg",
    imageAlt: "종합병원 로비 전경",
    imagePosition: "center 38%",
  },
  {
    id: 4,
    track: "pharmacy",
    title: "전국 거점 약국에서 근무·관리약사를 찾습니다",
    tags: ["근무약사", "관리약사", "파트타임"],
    positionCount: "34개 포지션 보기",
    deadline: "상시 채용",
    href: "/jobs?track=pharmacy",
    image: "/images/home/hero-pharmacy.jpg",
    imageAlt: "약국 내부, 안내 자료를 살펴보는 모습",
    imagePosition: "center 30%",
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

export const homeRecommendationJobIds = [102, 103, 104, 109];
