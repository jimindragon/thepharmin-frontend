import { resourceExampleImages } from "@/config/resourceImages";

export type ResourceCategory = "전체" | "기업분석" | "면접후기" | "자기소개서" | "직무가이드" | "연봉·협상" | "약국·개국";

export interface ResourceFile {
  id: string;
  slug: string;
  category: Exclude<ResourceCategory, "전체">;
  /** 카드/상세 상단에 쓰는 영문 라벨. 보통 category와 1:1이지만 일부 카드는 이미지 원본 그대로 다른 라벨을 쓴다(예: 산업 전환 로드맵 → "CAREER") */
  englishLabel: string;
  isFree: boolean;
  /** 할인가(또는 무료면 0). 패키지처럼 정가가 따로 있으면 originalPrice를 같이 채운다 */
  price: number;
  originalPrice?: number;
  pageCount: number;
  /** 실제 다운로드/구매 수 데이터가 없으면 비워 두고 화면에서 숨긴다 */
  downloadCount?: number;
  title: string;
  /** 카드용 한 줄 소개. 별도 상세 소개문이 없는 자료는 상세페이지에도 그대로 쓴다 */
  shortDescription: string;
  description: string;
  coverImage: string;
  /** 교보문고/크몽 PDF 참고 — 매우 긴 세로형 소개 이미지. 없으면 상세페이지에서 섹션 자체를 숨긴다 */
  introImageUrl?: string;
  tableOfContents?: { label: string; pageCount: number }[];
  recommendedFor?: string[];
  /** 패키지 전용 "패키지 구성" 목록 */
  packageContents?: string[];
  /** 명시적으로 큐레이션된 관련 자료(패키지의 "함께 보면 좋은 자료"). 없으면 같은 카테고리 자료로 대체 노출 */
  relatedResourceIds?: string[];
  isPackage?: boolean;
}

export const resourceCategories: ResourceCategory[] = ["전체", "기업분석", "면접후기", "자기소개서", "직무가이드", "연봉·협상", "약국·개국"];

export const featuredPackageId = "pharma-job-package";

/** "인기 자료" 사이드바 순서 — 다운로드 수 정렬이 아니라 큐레이션 순서(첨부 이미지 그대로) */
export const popularResourceIds = [
  "interview-review-30",
  "bio-company-analysis-30",
  "rnd-clinical-job-guide",
  "cover-letter-30",
  "salary-negotiation-guide",
];

export const resources: ResourceFile[] = [
  {
    id: "pharma-job-package",
    slug: "pharma-job-package",
    category: "기업분석",
    englishLabel: "THE PHARMA PACKAGE",
    isFree: false,
    price: 39900,
    originalPrice: 67500,
    pageCount: 168 + 184 + 96 + 120 + 48,
    title: "제약·바이오 취업 올인원 패키지",
    shortDescription: "기업분석·면접후기·자기소개서·직무가이드까지, 제약·바이오 취업에 필요한 더파마 핵심 전자책 5종을 하나로 묶었습니다.",
    description:
      "기업분석·면접후기·자기소개서·직무가이드까지, 제약·바이오 취업에 필요한 더파마 핵심 전자책 5종을 하나로 묶었습니다. 개별 구매가보다 크게 저렴하게, 취업 준비의 처음부터 끝까지 한 번에 준비하세요.",
    coverImage: resourceExampleImages.building,
    introImageUrl: resourceExampleImages.writing,
    tableOfContents: [
      { label: "바이오기업 분석 30선", pageCount: 168 },
      { label: "제약회사 기업 분석 30선", pageCount: 184 },
      { label: "면접 후기 30선", pageCount: 96 },
      { label: "합격 자기소개서 30선", pageCount: 120 },
      { label: "제약·바이오 연봉 협상 가이드", pageCount: 48 },
    ],
    recommendedFor: ["제약·바이오 취업을 처음 준비하는 분", "기업 분석부터 면접까지 한 번에 끝내고 싶은 분", "개별 구매보다 합리적으로 준비하고 싶은 분"],
    packageContents: ["바이오기업 분석 30선", "제약회사 기업 분석 30선", "면접 후기 30선", "합격 자기소개서 30선", "제약·바이오 연봉 협상 가이드"],
    relatedResourceIds: ["bio-company-analysis-30", "pharma-company-analysis-30", "interview-review-30", "cover-letter-30"],
    isPackage: true,
  },
  {
    id: "bio-company-analysis-30",
    slug: "bio-company-analysis-30",
    category: "기업분석",
    englishLabel: "COMPANY ANALYSIS",
    isFree: false,
    price: 19900,
    pageCount: 168,
    downloadCount: 2840,
    title: "바이오기업 분석 30선",
    shortDescription: "국내 대표 바이오텍 30곳의 파이프라인·재무·채용 동향을 한 권에 정리했습니다.",
    description: "국내 대표 바이오텍 30곳의 파이프라인·재무·채용 동향을 한 권에 정리했습니다.",
    coverImage: resourceExampleImages.building,
  },
  {
    id: "pharma-company-analysis-30",
    slug: "pharma-company-analysis-30",
    category: "기업분석",
    englishLabel: "COMPANY ANALYSIS",
    isFree: false,
    price: 19900,
    pageCount: 184,
    downloadCount: 2310,
    title: "제약회사 기업 분석 30선",
    shortDescription: "전통 제약사부터 글로벌 빅파마 한국법인까지 기업별 사업·채용을 심층 분석.",
    description: "전통 제약사부터 글로벌 빅파마 한국법인까지 기업별 사업·채용을 심층 분석.",
    coverImage: resourceExampleImages.building,
  },
  {
    id: "interview-review-30",
    slug: "interview-review-30",
    category: "면접후기",
    englishLabel: "INTERVIEW",
    isFree: false,
    price: 12900,
    pageCount: 96,
    downloadCount: 3120,
    title: "면접 후기 30선",
    shortDescription: "제약·바이오 직무별 실제 면접 질문과 합격자의 답변을 그대로 복기했습니다.",
    description: "제약·바이오 직무별 실제 면접 질문과 합격자의 답변을 그대로 복기했습니다.",
    coverImage: resourceExampleImages.handshake,
  },
  {
    id: "cover-letter-30",
    slug: "cover-letter-30",
    category: "자기소개서",
    englishLabel: "COVER LETTER",
    isFree: false,
    price: 14900,
    pageCount: 120,
    downloadCount: 1980,
    title: "합격 자기소개서 30선",
    shortDescription: "서류를 통과한 자기소개서 30편과 항목별 작성 포인트 해설을 담았습니다.",
    description: "서류를 통과한 자기소개서 30편과 항목별 작성 포인트 해설을 담았습니다.",
    coverImage: resourceExampleImages.writing,
  },
  {
    id: "rnd-clinical-job-guide",
    slug: "rnd-clinical-job-guide",
    category: "직무가이드",
    englishLabel: "JOB GUIDE",
    isFree: true,
    price: 0,
    pageCount: 64,
    downloadCount: 5400,
    title: "R&D·임상개발 직무 가이드",
    shortDescription: "연구개발부터 임상까지 직무별 하는 일과 필요 역량, 커리어 경로를 정리한 입문서.",
    description: "연구개발부터 임상까지 직무별 하는 일과 필요 역량, 커리어 경로를 정리한 입문서.",
    coverImage: resourceExampleImages.presentation,
  },
  {
    id: "ra-approval-job-guide",
    slug: "ra-approval-job-guide",
    category: "직무가이드",
    englishLabel: "JOB GUIDE",
    isFree: false,
    price: 9900,
    pageCount: 88,
    downloadCount: 1460,
    title: "RA 인허가 직무 완전 정복",
    shortDescription: "국내외 등록·변경허가 실무와 RA 커리어 경로의 모든 것.",
    description: "국내외 등록·변경허가 실무와 RA 커리어 경로의 모든 것.",
    coverImage: resourceExampleImages.presentation,
  },
  {
    id: "salary-negotiation-guide",
    slug: "salary-negotiation-guide",
    category: "연봉·협상",
    englishLabel: "SALARY",
    isFree: true,
    price: 0,
    pageCount: 48,
    downloadCount: 4210,
    title: "제약·바이오 연봉 협상 가이드",
    shortDescription: "직무·연차별 연봉 테이블과 오퍼 협상 실전 스크립트.",
    description: "직무·연차별 연봉 테이블과 오퍼 협상 실전 스크립트.",
    coverImage: resourceExampleImages.handshake,
  },
  {
    id: "pharmacy-opening-guide",
    slug: "pharmacy-opening-guide",
    category: "약국·개국",
    englishLabel: "PHARMACY",
    isFree: false,
    price: 16900,
    pageCount: 132,
    downloadCount: 870,
    title: "약국 개국·양수도 실전 가이드",
    shortDescription: "입지 분석, 권리금 산정, 인수 절차까지 개국 전 과정을 담았습니다.",
    description: "입지 분석, 권리금 산정, 인수 절차까지 개국 전 과정을 담았습니다.",
    coverImage: resourceExampleImages.building,
  },
  {
    id: "hospital-to-industry-roadmap",
    slug: "hospital-to-industry-roadmap",
    category: "직무가이드",
    englishLabel: "CAREER",
    isFree: true,
    price: 0,
    pageCount: 52,
    downloadCount: 2650,
    title: "병원약사 → 산업 전환 로드맵",
    shortDescription: "임상 경험을 산업 언어로 옮기는 직무 전환 5단계 가이드.",
    description: "임상 경험을 산업 언어로 옮기는 직무 전환 5단계 가이드.",
    coverImage: resourceExampleImages.presentation,
  },
];
