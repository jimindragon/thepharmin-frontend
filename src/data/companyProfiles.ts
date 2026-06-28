import { companyExampleImages, companyLogos } from "@/config/companyImages";

export interface CompanyMetric {
  label: string;
  value: string;
  caption?: string;
  /** 공개 수치가 없어 사업구조 기준으로 추정한 값인지 여부. true면 실데이터와 구분되게 표시한다 */
  estimated?: boolean;
}

export interface CompanyDetailField {
  label: string;
  /** 정보가 없는 경우 임의로 채우지 않고 null로 둔다 */
  value: string | null;
  /** 공개 수치가 없어 사업구조 기준으로 추정한 값인지 여부. true면 실데이터와 구분되게 표시한다 */
  estimated?: boolean;
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
    /** 동종업계 내 순위(예: "완제 의약품 제조업 1위"). 데이터가 없으면 생략하고, 생략 시 화면에 행 자체를 숨긴다 */
    industryRank?: string;
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
    name: "더팜인제약(주)",
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
    jobCount: 4,
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
        title: "더팜인제약, 혁신 신약 TP-001 글로벌 임상 2상 진입",
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
        title: "더팜인제약, 유럽 제약사와 신약 공동개발 협약 체결",
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
        title: "더팜인제약, 1분기 매출 전년 대비 15% 성장",
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
        title: "더팜인제약, 글로벌 임상 3상 IND 승인 획득",
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
      responseRate: "88%",
      averageResponseTime: "1.8일",
      followers: "1,892",
      reviewKeywordCount: "26개",
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
  {
    id: "yuhan",
    name: "(주)유한양행",
    logoText: "YUHAN",
    logoImage: companyLogos["유한양행"],
    verifiedLabel: "운영팀 확인 기업",
    premiumLabel: "프리미엄 기업",
    tagline: "좋은 상품을 만들어 국가와 동포에게 도움을 주는 기업",
    tags: ["제약/바이오", "코스피 000100", "설립 1926년", "사원수 2,123명"],
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "매출액", value: "2조 1,056억 원", caption: "2025년" },
      { label: "영업이익", value: "1,101억 원", caption: "2025년" },
      { label: "R&D 투자비율", value: "11.1%", caption: "2025년" },
      { label: "해외 매출 비중", value: "15%", caption: "2025년", estimated: true },
    ],
    businessSummary: [
      { label: "주요 사업", value: "의약품·생활용품·동물약품 제조 (신약 파이프라인 33개)" },
      { label: "주요 제품", value: "렉라자 · 삐콤씨 · 안티푸라민" },
      { label: "글로벌 진출", value: "10개국+", estimated: true },
      { label: "특허 보유", value: "100건+", estimated: true },
    ],
    recruitSummary:
      "비소세포폐암 표적항암제 렉라자를 중심으로 글로벌 허가를 잇달아 획득하며 항암·면역 분야 R&D와 해외 인허가 역량을 빠르게 확장하고 있습니다.",
    details: [
      { label: "대표자", value: "조욱제" },
      { label: "설립일", value: "1926년 06월 20일" },
      { label: "본사 위치", value: "서울 동작구 노량진로 74 (유한양행빌딩)" },
      { label: "홈페이지", value: "www.yuhan.co.kr" },
      { label: "기업 형태", value: "중견기업" },
      { label: "업종", value: "완제 의약품 제조업" },
      { label: "사업 분야", value: "의약품·생활용품·동물약품 제조" },
      { label: "자본금", value: "813억 9천만 원 (2025.12.31)" },
      { label: "평균 근속", value: "12년" },
      { label: "대졸 초임", value: "5,045만 원" },
      { label: "평균 연봉", value: "9,744만 원" },
      { label: "남녀 성비", value: "남성 71.9% / 여성 28.1%" },
      {
        label: "계열사",
        value:
          "(주)유한코스메틱, (주)프로젠, 퍼멘텍(주), (주)유한메디카, (주)유한화학, (주)유한클로락스, (주)와이즈메디, 에스비바이오팜(주), (주)에이투젠, (주)이뮨온시아, (주)유한건강생활, 애드파마(주), (주)유코스토리",
      },
    ],
    keywords: ["신약개발", "글로벌 진출", "R&D 중심", "사회적 책임", "항암·면역", "버들표 신뢰"],
    jobCount: 1,
    jobs: [
      {
        id: "yuhan-office-support-2026",
        title: "2026년 본사 사무지원 계약직(장애인력) 채용",
        href: "/jobs?keyword=유한양행",
        dDay: "D-36",
        tags: ["사무지원"],
        career: "신입·고졸↑",
        location: "서울",
      },
    ],
    interviewReviewCount: 2,
    interviewTopKeywords: ["AI 인적성검사", "PT 발표면접", "실무진 면접", "편안한 분위기", "임원 면접"],
    interviewReviews: [
      {
        id: "yuhan-interview-1",
        role: "임상개발",
        career: "신입",
        date: "2025.10",
        keywords: ["AI 인적성", "PT 발표면접", "실무진 면접", "임원 면접"],
        summary: "AI 인적성검사부터 PT 발표면접, 실무진 면접, 임원 면접까지 다단계로 진행되었고 전반적인 난이도는 보통이었습니다.",
        helpfulCount: 14,
      },
      {
        id: "yuhan-interview-2",
        role: "생산",
        career: "신입",
        date: "2024.04",
        keywords: ["조별 면접", "편안한 분위기", "1인 1질문"],
        summary: "조별로 진행된 면접에서 1인 1질문 방식으로 편안한 분위기 속에 대화가 이어졌습니다.",
        helpfulCount: 9,
      },
    ],
    // TODO: 기업 후기(임직원 리뷰) 실데이터 확보 시 반영 — 현재 제공된 자료에 없어 빈 배열로 둔다
    employeeReviewCount: 0,
    employeeTopKeywords: [],
    employeePositiveKeywords: [],
    employeeImprovementKeywords: [],
    employeeReviews: [],
    newsCount: 5,
    news: [
      {
        id: "yuhan-news-1",
        date: "2025.08.20",
        title: "유한양행, 렉라자+아미반타맙 병용요법 중국 NMPA 시판 허가 승인",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "중국 시장 진입 확대로 글로벌 인허가·약가협상 직무 수요가 늘어날 수 있습니다.",
        tags: ["렉라자", "중국"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/lazertinib-china-nmpa",
      },
      {
        id: "yuhan-news-2",
        date: "2025.06.15",
        title: "유한양행, 렉라자+아미반타맙 병용요법 한국 식약처 시판 허가 승인",
        source: "더파마뉴스",
        category: "국내·허가",
        summary: "국내 허가 획득에 따라 마케팅·학술 직무의 출시 준비 업무가 활발해지고 있습니다.",
        tags: ["렉라자", "국내"],
        thumbnail: companyExampleImages.primary,
        href: "https://www.thepharmanews.com/news/lazertinib-korea-mfds",
      },
      {
        id: "yuhan-news-3",
        date: "2025.03.10",
        title: "유한양행, 렉라자+아미반타맙 병용요법 일본 PMDA 시판 허가 승인",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "일본 진출 확대로 해외 인허가 및 임상 운영 경험이 중요해지고 있습니다.",
        tags: ["렉라자", "일본"],
        thumbnail: companyExampleImages.culture,
        href: "https://www.thepharmanews.com/news/lazertinib-japan-pmda",
      },
      {
        id: "yuhan-news-4",
        date: "2025.01.20",
        title: "유한양행, 렉라자+아미반타맙 병용요법 유럽 EC 시판 허가 승인",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "유럽 허가 획득으로 글로벌 RA·메디컬 어페어즈 직무 채용이 이어질 수 있습니다.",
        tags: ["렉라자", "유럽"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/lazertinib-eu-ec",
      },
      {
        id: "yuhan-news-5",
        date: "2024.08.05",
        title: "유한양행, 렉라자+아미반타맙 병용요법 미국 FDA 허가 취득",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "미국 허가 취득 이후 글로벌 임상·상업화 직무의 중요성이 커지고 있습니다.",
        tags: ["렉라자", "미국"],
        thumbnail: companyExampleImages.lab,
        href: "https://www.thepharmanews.com/news/lazertinib-us-fda",
      },
    ],
    sidebar: {
      interestedCount: "25,000+",
      responseRate: "95%",
      averageResponseTime: "0.8일",
      followers: "25,000+",
      reviewKeywordCount: "54개",
      industryRank: "완제 의약품 제조업 1위",
      products: [
        { name: "렉라자", description: "비소세포폐암 표적항암제" },
        { name: "삐콤씨", description: "비타민제" },
        { name: "안티푸라민", description: "소염진통제" },
      ],
      address: "서울 동작구 노량진로 74 (유한양행빌딩)",
    },
    extraCards: [
      { title: "연봉 정보", description: "직무별 연봉 범위와 보상 구조를 준비 중입니다.", status: "준비중" },
      { title: "복지 및 문화", description: "복리후생, 근무 문화, 성장 지원 정보를 정리하고 있습니다.", status: "미리보기" },
      { title: "채용 정보", description: "전형 방식과 채용 일정 데이터를 연결할 예정입니다.", status: "연결 예정" },
      { title: "ESG 경영", description: "지속가능경영과 사회공헌 정보를 제공할 예정입니다.", status: "준비중" },
    ],
    relatedCompanies: [
      { id: "jongkundang", name: "(주)종근당", description: "CMC·품질 직무 채용 중", href: "/jobs?keyword=종근당" },
      { id: "greencross", name: "(주)녹십자", description: "백신·혈액제제 전문 인력 채용", href: "/jobs?keyword=녹십자" },
      { id: "hanmi-pharm", name: "한미약품(주)", description: "신약개발·임상 전문 인력 채용", href: "/jobs?keyword=한미약품" },
    ],
  },
  {
    id: "samsung-biologics",
    name: "삼성바이오로직스(주)",
    logoText: "SBL",
    logoImage: companyLogos["삼성바이오로직스"],
    verifiedLabel: "운영팀 확인 기업",
    premiumLabel: "프리미엄 기업",
    tagline: "글로벌 No.1 바이오의약품 CDMO 기업",
    tags: ["바이오/CDMO", "코스피 207940", "설립 2011년", "사원수 5,455명"],
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "매출액", value: "4조 5,569억 원", caption: "2025년" },
      { label: "영업이익", value: "2조 680억 원", caption: "2025년" },
      { label: "R&D 투자비율", value: "6%", caption: "2025년", estimated: true },
      { label: "해외 매출 비중", value: "80%", caption: "2025년", estimated: true },
    ],
    businessSummary: [
      { label: "주요 사업", value: "바이오의약품 위탁개발생산(CDMO/CMO/CDO)" },
      { label: "주요 제품", value: "항체의약품 CDMO · CDO 플랫폼 · ADC" },
      { label: "글로벌 진출", value: "해외 매출 비중 80%, 글로벌 제약사 위탁생산 중심", estimated: true },
      { label: "특허 보유", value: "100건+", estimated: true },
    ],
    recruitSummary:
      "글로벌 제약사의 항체의약품 위탁개발생산을 중심으로 송도 바이오캠퍼스 생산 능력을 지속 확장하고 있으며, ADC 등 신규 모달리티로 사업 영역을 넓히고 있습니다.",
    details: [
      { label: "대표자", value: "존림(John Rim)" },
      { label: "설립일", value: "2011년 04월 22일" },
      { label: "본사 위치", value: "인천 연수구 송도바이오대로 300 (송도동, 삼성바이오로직스)" },
      { label: "홈페이지", value: "www.samsungbiologics.com" },
      { label: "기업 형태", value: "대기업" },
      { label: "업종", value: "생물학적 제제 제조업" },
      { label: "사업 분야", value: "바이오의약품 위탁개발생산(CDMO/CMO/CDO)" },
      { label: "자본금", value: "1,157억 2천만 원 (2025.12.31)" },
      // TODO: 평균 근속 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 근속", value: null },
      { label: "대졸 초임", value: "3,295만 원" },
      // TODO: 평균 연봉 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 연봉", value: null },
      // TODO: 남녀 성비 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "남녀 성비", value: null },
      {
        label: "계열사",
        value: "삼성전자(주), 삼성물산(주), 삼성SDI(주), 삼성전기(주), 삼성중공업(주), 세메스(주), 스테코(주), 삼성벤처투자(주) 등",
      },
    ],
    keywords: ["CDMO", "글로벌 위탁생산", "송도 바이오캠퍼스", "ESG", "항체의약품", "ADC"],
    // TODO: 채용공고 실데이터 확보 시 반영 — 현재 진행 중인 공고 없음(실)
    jobCount: 0,
    jobs: [],
    // TODO: 면접 후기 실데이터 확보 시 반영 — 제공된 자료에 본문 없음(잡코리아 게시물 77건만 존재가 언급됨)
    interviewReviewCount: 0,
    interviewTopKeywords: [],
    interviewReviews: [],
    // TODO: 기업 후기(임직원 리뷰) 실데이터 확보 시 반영 — 현재 제공된 자료에 없어 빈 배열로 둔다
    employeeReviewCount: 0,
    employeeTopKeywords: [],
    employeePositiveKeywords: [],
    employeeImprovementKeywords: [],
    employeeReviews: [],
    newsCount: 5,
    news: [
      {
        id: "sbl-news-1",
        date: "2025.12.10",
        title: "삼성바이오로직스, 미국 메릴랜드주 록빌 바이오의약품 생산시설 인수계약 체결",
        source: "더파마뉴스",
        category: "글로벌·M&A",
        summary: "미국 현지 생산시설 인수로 글로벌 생산운영·품질 직무 수요가 늘어날 수 있습니다.",
        tags: ["미국", "생산시설"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/rockville-facility-acquisition",
      },
      {
        id: "sbl-news-2",
        date: "2025.11.18",
        title: "삼성바이오로직스, 글로벌 규제기관 제조 승인 건수 400건 돌파",
        source: "더파마뉴스",
        category: "품질·인허가",
        summary: "규제기관 제조 승인 누적 확대로 품질·RA 분야 전문 인력 수요가 꾸준합니다.",
        tags: ["GMP", "품질"],
        thumbnail: companyExampleImages.primary,
        href: "https://www.thepharmanews.com/news/gmp-approval-400",
      },
      {
        id: "sbl-news-3",
        date: "2025.11.05",
        title: "삼성바이오로직스, 인적분할로 삼성에피스홀딩스(주) 분할 신설",
        source: "더파마뉴스",
        category: "사업구조",
        summary: "사업구조 재편에 따라 CDMO 본업 중심의 직무 채용이 이어질 것으로 보입니다.",
        tags: ["인적분할", "에피스"],
        thumbnail: companyExampleImages.culture,
        href: "https://www.thepharmanews.com/news/spin-off-epis-holdings",
      },
      {
        id: "sbl-news-4",
        date: "2025.09.12",
        title: "삼성바이오로직스, 미국 제약사와 1조 8,001억 원 규모 위탁생산 계약 체결",
        source: "더파마뉴스",
        category: "수주·계약",
        summary: "대규모 위탁생산 계약 수주로 생산·공정 엔지니어링 직무 채용이 확대될 수 있습니다.",
        tags: ["CDMO", "미국"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/cdmo-contract-1-8001",
      },
      {
        id: "sbl-news-5",
        date: "2025.01.22",
        title: "삼성바이오로직스, 미국 제약사와 2조 747억 원 규모 위탁생산 계약 체결",
        source: "더파마뉴스",
        category: "수주·계약",
        summary: "연초부터 이어진 대형 위탁생산 계약으로 송도 캠퍼스 인력 채용이 활발합니다.",
        tags: ["CDMO", "미국"],
        thumbnail: companyExampleImages.research,
        href: "https://www.thepharmanews.com/news/cdmo-contract-2-747",
      },
    ],
    sidebar: {
      interestedCount: "17,000+",
      responseRate: "82%",
      averageResponseTime: "2.3일",
      followers: "17,000+",
      reviewKeywordCount: "37개",
      industryRank: "생물학적 제제 제조업 1위",
      products: [
        { name: "CDMO", description: "항체의약품 위탁개발생산" },
        { name: "CDO 플랫폼", description: "S-Cellerate · S-DUAL 등" },
        { name: "ADC", description: "항체약물접합체 생산" },
      ],
      address: "인천 연수구 송도바이오대로 300 (송도동, 삼성바이오로직스)",
    },
    extraCards: [
      { title: "연봉 정보", description: "직무별 연봉 범위와 보상 구조를 준비 중입니다.", status: "준비중" },
      { title: "복지 및 문화", description: "복리후생, 근무 문화, 성장 지원 정보를 정리하고 있습니다.", status: "미리보기" },
      { title: "채용 정보", description: "전형 방식과 채용 일정 데이터를 연결할 예정입니다.", status: "연결 예정" },
      { title: "ESG 경영", description: "지속가능경영과 사회공헌 정보를 제공할 예정입니다.", status: "준비중" },
    ],
    relatedCompanies: [
      { id: "hugel", name: "휴젤(주)", description: "보툴리눔 톡신·HA필러 전문기업", href: "/companies/hugel" },
      { id: "sk-bioscience", name: "에스케이바이오사이언스(주)", description: "백신·바이오 전문 인력 채용", href: "/jobs?keyword=에스케이바이오사이언스" },
      { id: "medytox", name: "(주)메디톡스", description: "보툴리눔 톡신·미용의료 전문 인력 채용", href: "/jobs?keyword=메디톡스" },
    ],
  },
  {
    id: "hugel",
    name: "휴젤(주)",
    logoText: "HUGEL",
    verifiedLabel: "운영팀 확인 기업",
    premiumLabel: "프리미엄 기업",
    tagline: "삶의 질 향상을 추구하는 글로벌 바이오의약품 전문기업",
    tags: ["바이오/에스테틱", "코스닥 145020", "설립 2001년", "사원수 629명"],
    coverImage: companyExampleImages.hero,
    metrics: [
      { label: "매출액", value: "2,928억 원", caption: "2025년" },
      { label: "영업이익", value: "1,068억 원", caption: "2025년" },
      { label: "R&D 투자비율", value: "10%", caption: "2025년", estimated: true },
      { label: "해외 매출 비중", value: "50%", caption: "2025년", estimated: true },
    ],
    businessSummary: [
      { label: "주요 사업", value: "보툴리눔 톡신·HA필러·바이오 화장품 제조 및 도소매" },
      { label: "주요 제품", value: "보툴렉스(Letybo) · 더채움 · 바이리즌 · 웰라쥬" },
      { label: "글로벌 진출", value: "25개국 진출 / 30여개국 인허가 추진 중" },
      { label: "특허 보유", value: "50건+", estimated: true },
    ],
    recruitSummary:
      "보툴리눔 톡신 보툴렉스(수출명 Letybo)와 HA필러 더채움을 중심으로 25개국 이상에 수출하며, 더마 코스메틱까지 영역을 넓힌 글로벌 에스테틱 전문기업입니다.",
    details: [
      { label: "대표자", value: "장두현" },
      { label: "설립일", value: "2001년 11월 22일" },
      { label: "본사 위치", value: "강원 춘천시 동내면 거두단지1길 23 (거두리, 휴젤)" },
      { label: "홈페이지", value: "www.hugel-inc.com" },
      { label: "기업 형태", value: "중소기업" },
      { label: "업종", value: "제약·보건·바이오(생물학적 제제)" },
      { label: "사업 분야", value: "보툴리눔 톡신·HA필러·바이오 화장품 제조 및 도소매" },
      // TODO: 자본금 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "자본금", value: null },
      // TODO: 평균 근속 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 근속", value: null },
      { label: "대졸 초임", value: "4,003만 원" },
      // TODO: 평균 연봉 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 연봉", value: null },
      // TODO: 남녀 성비 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "남녀 성비", value: null },
      { label: "계열사", value: "(주)GS, 지에스칼텍스(주), 자이에스앤디(주), 지에스이피에스(주), 지에스파워(주), 인천종합에너지(주) 등" },
    ],
    keywords: ["보툴리눔 톡신", "HA필러", "글로벌 수출", "에스테틱", "R&D", "더마 코스메틱"],
    jobCount: 5,
    jobs: [
      {
        id: "hugel-global-product-planning",
        title: "[화장품상품기획팀] 글로벌 상품기획(웰라쥬 BM)",
        href: "/jobs?keyword=휴젤",
        dDay: "D-59",
        tags: ["상품기획"],
        career: "경력·초대졸↑",
        location: "서울",
      },
      {
        id: "hugel-logistics-management",
        title: "[국내물류팀] 조직은행 물류관리 담당",
        href: "/jobs?keyword=휴젤",
        dDay: "D-16",
        tags: ["물류관리"],
        career: "경력·대졸↑",
        location: "경기",
      },
      {
        id: "hugel-production-staff",
        title: "생산직 사원 채용",
        href: "/jobs?keyword=휴젤",
        dDay: "상시",
        tags: ["생산"],
        career: "신입·경력·고졸↑",
        location: "강원",
      },
      {
        id: "hugel-regional-talent-rnd",
        title: "지역우수인재 채용 - 연구개발",
        href: "/jobs?keyword=휴젤",
        dDay: "상시",
        tags: ["연구개발"],
        career: "신입",
        location: "강원",
      },
      {
        id: "hugel-regional-talent-quality",
        title: "지역우수인재 채용 - 품질",
        href: "/jobs?keyword=휴젤",
        dDay: "상시",
        tags: ["품질"],
        career: "신입",
        location: "강원",
      },
    ],
    // TODO: 면접 후기 실데이터 확보 시 반영 — 제공된 자료에 본문 없음
    interviewReviewCount: 0,
    interviewTopKeywords: [],
    interviewReviews: [],
    // TODO: 기업 후기(임직원 리뷰) 실데이터 확보 시 반영 — 현재 제공된 자료에 없어 빈 배열로 둔다
    employeeReviewCount: 0,
    employeeTopKeywords: [],
    employeePositiveKeywords: [],
    employeeImprovementKeywords: [],
    employeeReviews: [],
    newsCount: 5,
    news: [
      {
        id: "hugel-news-1",
        date: "2026.03.05",
        title: "휴젤, 한국거래소 '2025년 코스닥시장 공시우수법인' 선정",
        source: "더파마뉴스",
        category: "공시·IR",
        summary: "공시 우수기업 선정으로 안정적인 경영 환경에서 직무 전문성을 쌓을 수 있습니다.",
        tags: ["코스닥", "IR"],
        thumbnail: companyExampleImages.primary,
        href: "https://www.thepharmanews.com/news/kosdaq-disclosure-award-2025",
      },
      {
        id: "hugel-news-2",
        date: "2025.12.05",
        title: "휴젤, 제62회 무역의 날 '1억 수출의 탑' 수상",
        source: "더파마뉴스",
        category: "수출·실적",
        summary: "수출 성과 인정으로 해외영업·수출 직무의 역할이 더욱 중요해지고 있습니다.",
        tags: ["수출", "무역의날"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/trade-day-100m-export-tower",
      },
      {
        id: "hugel-news-3",
        date: "2025.08.18",
        title: "휴젤 웰라쥬, '2025 올해의 브랜드 대상' 더마 코스메틱 부문 1위",
        source: "더파마뉴스",
        category: "브랜드",
        summary: "브랜드 인지도 상승으로 마케팅·브랜드 기획 직무 채용이 늘어날 수 있습니다.",
        tags: ["웰라쥬", "코스메틱"],
        thumbnail: companyExampleImages.culture,
        href: "https://www.thepharmanews.com/news/wellage-brand-award-2025",
      },
      {
        id: "hugel-news-4",
        date: "2025.01.15",
        title: "휴젤 보툴렉스, 아랍에미리트(UAE) 품목허가 획득",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "중동 시장 진입 확대로 글로벌 인허가 직무 경험이 더욱 중요해지고 있습니다.",
        tags: ["보툴렉스", "UAE"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/botulax-uae-approval",
      },
      {
        id: "hugel-news-5",
        date: "2024.02.20",
        title: "휴젤 보툴렉스(수출명 Letybo), 미국 품목허가 획득",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "미국 품목허가 획득 이후 글로벌 임상·RA 직무 수요가 이어지고 있습니다.",
        tags: ["Letybo", "미국"],
        thumbnail: companyExampleImages.lab,
        href: "https://www.thepharmanews.com/news/letybo-us-approval",
      },
    ],
    sidebar: {
      interestedCount: "3,100+",
      responseRate: "78%",
      averageResponseTime: "2.8일",
      followers: "3,100+",
      reviewKeywordCount: "15개",
      industryRank: "생물학적 제제 제조업 2위",
      products: [
        { name: "보툴렉스", description: "보툴리눔 톡신(수출명 Letybo)" },
        { name: "더채움", description: "HA필러" },
        { name: "웰라쥬", description: "더마 코스메틱" },
      ],
      address: "강원 춘천시 동내면 거두단지1길 23 (거두리, 휴젤)",
    },
    extraCards: [
      { title: "연봉 정보", description: "직무별 연봉 범위와 보상 구조를 준비 중입니다.", status: "준비중" },
      { title: "복지 및 문화", description: "복리후생, 근무 문화, 성장 지원 정보를 정리하고 있습니다.", status: "미리보기" },
      { title: "채용 정보", description: "전형 방식과 채용 일정 데이터를 연결할 예정입니다.", status: "연결 예정" },
      { title: "ESG 경영", description: "지속가능경영과 사회공헌 정보를 제공할 예정입니다.", status: "준비중" },
    ],
    relatedCompanies: [
      { id: "samsung-biologics", name: "삼성바이오로직스(주)", description: "글로벌 CDMO·항체의약품 생산 전문기업", href: "/companies/samsung-biologics" },
      { id: "medytox", name: "(주)메디톡스", description: "보툴리눔 톡신·미용의료 전문 인력 채용", href: "/jobs?keyword=메디톡스" },
      { id: "sk-bioscience", name: "에스케이바이오사이언스(주)", description: "백신·바이오 전문 인력 채용", href: "/jobs?keyword=에스케이바이오사이언스" },
    ],
  },
];

export function getCompanyProfile(companyId: string) {
  return companyProfiles.find((company) => company.id === companyId);
}
