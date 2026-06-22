import { companyExampleImages } from "@/config/companyImages";

export interface CompanyMetric {
  label: string;
  value: string;
  caption?: string;
}

export interface CompanyDetailField {
  label: string;
  value: string;
}

export interface CompanyProduct {
  name: string;
  description: string;
}

export interface CompanyProfileJob {
  id: string;
  title: string;
  href: string;
  dDay: string;
  tags: string[];
  career: string;
  location: string;
}

export interface KeywordReview {
  id: string;
  role: string;
  career: string;
  date: string;
  keywords: string[];
  summary: string;
  helpfulCount?: number;
}

export interface CompanyProfileNews {
  id: string;
  date: string;
  title: string;
  source: "더파마뉴스";
  category: string;
  summary: string;
  tags: string[];
  thumbnail: string;
  href: string;
}

export interface RelatedCompany {
  id: string;
  name: string;
  description: string;
  href: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoText: string;
  logoImage?: string;
  verifiedLabel: string;
  premiumLabel: string;
  tagline: string;
  tags: string[];
  coverImage: string;
  metrics: CompanyMetric[];
  businessSummary: CompanyDetailField[];
  recruitSummary: string;
  details: CompanyDetailField[];
  keywords: string[];
  jobCount: number;
  jobs: CompanyProfileJob[];
  interviewReviewCount: number;
  interviewTopKeywords: string[];
  interviewReviews: KeywordReview[];
  employeeReviewCount: number;
  employeeTopKeywords: string[];
  employeePositiveKeywords: string[];
  employeeImprovementKeywords: string[];
  employeeReviews: KeywordReview[];
  newsCount: number;
  news: CompanyProfileNews[];
  sidebar: {
    interestedCount: string;
    responseRate: string;
    averageResponseTime: string;
    followers: string;
    reviewKeywordCount: string;
    products: CompanyProduct[];
    address: string;
  };
  extraCards: Array<{
    title: string;
    description: string;
    status: string;
  }>;
  relatedCompanies: RelatedCompany[];
}

export const companyProfiles: CompanyProfile[] = [
  {
    id: "thepharmin-pharma",
    name: "더파마제약(주)",
    logoText: "PHARMA",
    verifiedLabel: "운영팀 확인 기업",
    premiumLabel: "프리미엄 기업",
    tagline: "인류의 건강한 삶을 위해 혁신을 연구합니다.",
    tags: ["제약/바이오", "코스닥 123456", "설립 2012년", "사원수 1,250명"],
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "매출액", value: "2,850억 원", caption: "2023년" },
      { label: "영업이익", value: "480억 원", caption: "2023년" },
      { label: "R&D 투자비율", value: "18.6%", caption: "2023년" },
      { label: "해외 매출 비중", value: "42%", caption: "2023년" },
    ],
    businessSummary: [
      { label: "주요 사업", value: "전문의약품 · 일반의약품 · 바이오의약품" },
      { label: "주요 제품", value: "파마정 · 바이오신 · 헬스인" },
      { label: "글로벌 진출", value: "12개국" },
      { label: "특허 보유", value: "156건+" },
    ],
    recruitSummary:
      "항암, 면역, 대사질환 영역에서 차별화된 파이프라인을 보유하고 있으며, R&D 중심의 지속적인 혁신으로 글로벌 시장에서 경쟁력을 강화하고 있습니다.",
    details: [
      { label: "대표자", value: "김파마" },
      { label: "설립일", value: "2012년 06월 18일" },
      { label: "본사 위치", value: "서울특별시 강남구 테헤란로 123" },
      { label: "홈페이지", value: "www.thepharma.co.kr" },
      { label: "기업 형태", value: "중견기업" },
      { label: "업종", value: "의약품 제조업" },
      { label: "사업 분야", value: "의약품 개발 및 제조, 바이오의약품 연구개발" },
      { label: "계열사", value: "더파마헬스케어, 더파마바이오" },
    ],
    keywords: ["신약개발", "글로벌 진출", "R&D 중심", "도전과 혁신", "환자 중심", "전문성 존중"],
    jobCount: 12,
    jobs: [
      { id: "ra", title: "RA Specialist", href: "/jobs/ra-specialist", dDay: "D-12", tags: ["RA"], career: "경력 3~5년", location: "서울" },
      { id: "cra", title: "Clinical Research Associate", href: "/jobs?keyword=CRA", dDay: "D-18", tags: ["CRA"], career: "경력 2~4년", location: "전국" },
      { id: "rnd", title: "신약개발 연구원", href: "/jobs?keyword=신약개발", dDay: "D-24", tags: ["연구개발"], career: "신입/경력", location: "대전" },
      { id: "pv", title: "PV Specialist", href: "/jobs?keyword=PV", dDay: "D-30", tags: ["PV"], career: "경력 2~6년", location: "서울" },
    ],
    interviewReviewCount: 128,
    interviewTopKeywords: ["직무역량 평가", "실무 중심 질문", "차분한 분위기", "일정 안내 명확", "전형 과정 보통"],
    interviewReviews: [
      {
        id: "interview-1",
        role: "RA",
        career: "경력 1-3년",
        date: "2024.05",
        keywords: ["직무 적합성", "면접 분위기", "질문 난이도"],
        summary: "실무 경험 질문 위주로 진행되며, 근거를 차분히 설명할 수 있는 분위기였습니다.",
        helpfulCount: 18,
      },
      {
        id: "interview-2",
        role: "CRA",
        career: "경력 2-4년",
        date: "2024.04",
        keywords: ["커뮤니케이션", "전공 지식", "회사 이해도"],
        summary: "실제 임상 운영 상황에 대한 질문이 많았고, 회사 비전에 대한 관심도 중요하게 보였습니다.",
        helpfulCount: 12,
      },
      {
        id: "interview-3",
        role: "신약개발",
        career: "신입",
        date: "2024.03",
        keywords: ["실무 중심", "비전 공유", "일정 안내 명확"],
        summary: "연구 경험과 협업 태도에 대한 질문이 중심이었고, 전형 일정 안내가 명확했습니다.",
        helpfulCount: 9,
      },
    ],
    employeeReviewCount: 356,
    employeeTopKeywords: ["수평적인 조직문화", "자율성 있는 편", "R&D 투자 활발", "직무 전문성 성장", "복지 만족", "업무량 있음"],
    employeePositiveKeywords: ["직무 전문성", "안정적인 프로세스", "연구개발 투자", "복지 만족"],
    employeeImprovementKeywords: ["업무 프로세스 개선 필요", "의사결정 속도", "일정 압박"],
    employeeReviews: [
      {
        id: "employee-1",
        role: "연구개발",
        career: "경력 3-5년",
        date: "2024.05",
        keywords: ["연구개발 지원", "자율성과 책임", "복지 만족"],
        summary: "R&D 투자가 활발하고 연구에 집중할 수 있는 환경이 잘 조성되어 있습니다.",
        helpfulCount: 31,
      },
      {
        id: "employee-2",
        role: "RA",
        career: "경력 2-4년",
        date: "2024.04",
        keywords: ["글로벌 경험", "업무 효율성", "동료 관계"],
        summary: "글로벌 프로젝트 경험을 쌓기에 좋고, 동료 간 협업 문화가 긍정적입니다.",
        helpfulCount: 24,
      },
      {
        id: "employee-3",
        role: "생산/품질",
        career: "경력 5년 이상",
        date: "2024.03",
        keywords: ["안정적 근무", "복지 만족", "워라밸"],
        summary: "근무 환경이 안정적이며, 워크라이프 밸런스를 중요하게 생각합니다.",
        helpfulCount: 17,
      },
    ],
    newsCount: 24,
    news: [
      {
        id: "news-1",
        date: "2024.05.20",
        title: "더파마제약, 혁신 신약 TP-001 글로벌 임상 2상 진입",
        source: "더파마뉴스",
        category: "임상·R&D",
        summary: "글로벌 임상 확대에 따라 RA, PV, 임상개발 직무 수요가 이어질 수 있습니다.",
        tags: ["임상", "R&D"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/tp-001",
      },
      {
        id: "news-2",
        date: "2024.05.15",
        title: "더파마제약, 유럽 제약사와 신약 공동개발 협약 체결",
        source: "더파마뉴스",
        category: "글로벌",
        summary: "해외 파트너십 확대로 글로벌 사업개발과 인허가 협업 경험이 중요해지고 있습니다.",
        tags: ["글로벌", "사업개발"],
        thumbnail: companyExampleImages.primary,
        href: "https://www.thepharmanews.com/news/global-partner",
      },
      {
        id: "news-3",
        date: "2024.05.10",
        title: "더파마제약, 1분기 매출 전년 대비 15% 성장",
        source: "더파마뉴스",
        category: "실적",
        summary: "핵심 제품 성장세와 해외 매출 증가가 채용 포지션 확대로 이어지고 있습니다.",
        tags: ["실적", "성장"],
        thumbnail: companyExampleImages.culture,
        href: "https://www.thepharmanews.com/news/quarter-growth",
      },
      {
        id: "news-4",
        date: "2024.05.02",
        title: "더파마제약, 글로벌 임상 3상 IND 승인 획득",
        source: "더파마뉴스",
        category: "인허가",
        summary: "인허가와 임상 운영 직무에서 글로벌 규제 경험의 비중이 높아지고 있습니다.",
        tags: ["IND", "RA"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/ind-approval",
      },
    ],
    sidebar: {
      interestedCount: "1,245",
      responseRate: "92%",
      averageResponseTime: "1.2일",
      followers: "3,452",
      reviewKeywordCount: "42개",
      products: [
        { name: "나보타", description: "전문의약품" },
        { name: "펙수클루", description: "위식도역류질환 치료제" },
        { name: "엔블로", description: "당뇨병 치료제" },
      ],
      address: "서울특별시 강남구 테헤란로 123",
    },
    extraCards: [
      { title: "연봉 정보", description: "직무별 연봉 범위와 보상 구조를 준비 중입니다.", status: "준비중" },
      { title: "복지 및 문화", description: "복리후생, 근무 문화, 성장 지원 정보를 정리하고 있습니다.", status: "미리보기" },
      { title: "채용 정보", description: "전형 방식과 채용 일정 데이터를 연결할 예정입니다.", status: "연결 예정" },
      { title: "ESG 경영", description: "지속가능경영과 사회공헌 정보를 제공할 예정입니다.", status: "준비중" },
    ],
    relatedCompanies: [
      { id: "bio-nex", name: "바이오넥스(주)", description: "RA·임상 직무 채용 중", href: "/jobs?keyword=바이오넥스" },
      { id: "celltrion", name: "셀트리온", description: "생산·QA·RA 전문 인력 채용", href: "/jobs?keyword=셀트리온" },
      { id: "hanmi", name: "한미정밀화학(주)", description: "QC·CMC 직무 중심 채용", href: "/jobs?keyword=한미정밀화학" },
    ],
  },
];

export function getCompanyProfile(companyId: string) {
  return companyProfiles.find((company) => company.id === companyId);
}
