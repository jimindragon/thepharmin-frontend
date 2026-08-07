import { companyExampleImages, companyLogos } from "@/config/companyImages";

export interface CompanyMetric {
  label: string;
  value: string;
  caption?: string;
}

export interface CompanyDetailField {
  label: string;
  /** 정보가 없는 경우 임의로 채우지 않고 null로 둔다 */
  value: string | null;
}

export interface CompanyProduct {
  name: string;
  description: string;
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

/** 기관 특징(병원·약국 트랙 "요약" 카드의 특징 행 리스트). 값이 없으면 섹션 자체를 숨긴다 */
export interface CompanyProfileFeature {
  label: string;
  text: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  /**
   * 로고 이미지(logoImage)가 없을 때 로고 칸에 대신 그릴 글자. CompanyHero가 이 값을 가공 없이 그대로 찍는다.
   *
   * 전체 이름을 넣지 말 것 — 가장 작은 로고 칸(74×30, RecommendedJobs의 Standard 티어)이 6자에서 넘치고,
   * 기관명 중앙값이 6~7자라 전체 이름은 어느 칸에서도 성립하지 않는다. 대략 4자 이내로 둔다.
   * 영문 약어(PHARMA·YUHAN·SBL 등)와, 한미약품·메디코아처럼 알아보기 쉬운 축약은 그대로 둔다.
   *
   * 이 필드를 손으로 채우지 않는 경로(기업센터 미리보기 변환기 businessProfilePreview.ts)는
   * getCompanyInitial(name)으로 앞 2글자를 잘라 자동 생성한다. 손으로 고른 값이 있으면 그쪽이 이긴다
   * — 기쁨(화곡 기쁨약국)·센트럴(불당센트럴약국)처럼 자동 생성이 낼 수 없는 더 나은 이니셜을 살리기 위해서다.
   */
  logoText: string;
  logoImage?: string;
  tagline: string;
  tags: string[];
  coverImage: string;
  /** DART 연동 전까지는 mock이거나 아예 비어 있을 수 있다 — 없으면 "한눈에 보는 기업" 재무 지표 그리드를 숨긴다 */
  metrics?: CompanyMetric[];
  businessSummary: CompanyDetailField[];
  recruitSummary: string;
  /** 폼의 본문 소개(fullIntro) 대응. recruitSummary와의 관계는 트랙별 개요 재설계(STEP 2)에서 정리한다 */
  fullIntro?: string;
  /** 기업 정보 폼의 대표 전화 대응 */
  phone?: string;
  /** 기업 정보 폼의 대표 이메일 대응 */
  email?: string;
  details: CompanyDetailField[];
  keywords: string[];
  news: CompanyProfileNews[];
  /** 기관 특징([제목|내용] 행 리스트). 병원·약국 트랙 "요약" 카드용 — 값이 없으면 섹션 자체를 숨긴다 */
  features?: CompanyProfileFeature[];
  /** 병원 트랙 전용 */
  dutySystem?: string;
  /** 병원 트랙 전용. medicalDepartmentOptions(config/jobFilters/hospitalFilters.ts)의 id를 재사용한다. 미등록 시 "진료과목" 블록 자체를 숨긴다 */
  medicalDepartments?: string[];
  /** 병원 트랙 전용. 미등록 시 "전문약사 보유" 블록 자체를 숨긴다 */
  specialistPharmacists?: string[];
  /** 병원 트랙 전용. 폼의 HospitalOrgProfile.pharmacyEnvironmentDescription 대응. "약제부 근무환경" 블록 하단 서술문 —
   * 값이 없으면 렌더하지 않는다(STEP 3a는 렌더만 추가, 데이터 이관은 STEP 3b) */
  pharmacyEnvironmentDescription?: string;
  /** 약국 트랙 전용 */
  pharmacySoftware?: string;
  /** 약국 트랙 전용 */
  businessHours?: string;
  /** 약국 트랙 전용. 미등록 시 "조제 환경·장비" 블록 자체를 숨긴다 */
  dispensingEquipment?: string[];
  /** 약국 트랙 전용, 단일선택. pharmacyFeatureOptions(config/jobFilters/pharmacyFilters.ts)의 id를 재사용한다 */
  pharmacyFeatures?: string;
  /** 연구 트랙 전용. researchInstitutionTypeOptions(config/jobFilters/researchFilters.ts)의 id를 재사용한다 */
  institutionTypeId?: string;
  /** 연구 트랙 전용. researchStaffScaleOptions(config/jobFilters/researchFilters.ts)의 id를 재사용한다("연구 인력 규모") */
  staffScaleId?: string;
  /** 연구 트랙 전용. researchFieldCategoryOptions(config/researchFields.ts) 소분류 id 목록. 미등록 시 "연구 분야" 행 자체를 숨긴다 */
  researchFields?: string[];
  /** 연구 트랙 전용. 연구 장비·인프라 서술문. 미등록 시 "연구 환경" 블록 내 해당 행을 숨긴다 */
  equipmentInfra?: string;
  /** 연구 트랙 전용. 주요 연구 성과 서술문. 미등록 시 해당 행을 숨긴다 */
  achievements?: string;
  /** 산업 트랙 전용 재무 슬롯. DART 연동 전까지는 비어 있을 수 있고, 세 값이 모두 없으면 "재무 정보" 블록 자체를 숨긴다.
   * 기존 metrics 배열의 매출액/영업이익/R&D 투자비율 항목과는 별개다 — 병원·약국 트랙은 여전히 metrics를 그대로 쓴다 */
  revenue?: string;
  operatingProfit?: string;
  rndRatio?: string;
  /** revenue/operatingProfit/rndRatio 공통 기준 연도. 세 값이 실제로 항상 같은 회계연도를 가리켜(동일 공시 기준)
   * 필드별 연도 대신 단일 값으로 둔다. 카드 라벨에 "매출액 (2023)" 형태로 흡수해 표시한다 */
  financialYear?: string;
  sidebar: {
    interestedCount: string;
    reviewKeywordCount: string;
    products: CompanyProduct[];
    address: string;
  };
}

export const companyProfiles: CompanyProfile[] = [
  {
    id: "thepharmin-pharma",
    name: "더파마제약(주)",
    logoText: "PHARMA",
    tagline: "인류의 건강한 삶을 위해 혁신을 연구합니다.",
    tags: ["제약/바이오", "코스닥 123456", "설립 2012년", "사원수 1,250명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics(매출액/영업이익/R&D 투자비율)를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "2,850억 원",
    operatingProfit: "480억 원",
    rndRatio: "18.6%",
    financialYear: "2023",
    businessSummary: [
      { label: "주요 사업", value: "전문의약품 · 일반의약품 · 바이오의약품" },
      { label: "주요 제품", value: "파마정 · 바이오신 · 헬스인" },
      { label: "글로벌 진출", value: "12개국" },
      { label: "특허 보유", value: "156건+" },
    ],
    recruitSummary:
      "항암, 면역, 대사질환 영역에서 차별화된 파이프라인을 보유하고 있으며, R&D 중심의 지속적인 혁신으로 글로벌 시장에서 경쟁력을 강화하고 있습니다.",
    fullIntro:
      "항암, 면역, 대사질환 영역에서 차별화된 파이프라인을 보유하고 있으며, R&D 중심의 지속적인 혁신으로 글로벌 시장에서 경쟁력을 강화하고 있습니다.",
    details: [
      { label: "본사 위치", value: "서울특별시 강남구 테헤란로 123" },
      { label: "홈페이지", value: "www.thepharma.co.kr" },
      // 기관 유형은 companies.ts industry="전문의약품 제조업" → 제약사(폼 옵션) 매핑
      { label: "기관 유형", value: "제약사" },
      { label: "설립 연도", value: "2012년" },
      { label: "사업 분야", value: "의약품 개발·제조 · 바이오의약품 연구개발" },
      // 직원 수는 companies.ts employeeCount="320명" → 101~500명(폼 4구간) 매핑
      { label: "직원 수", value: "101~500명" },
    ],
    keywords: ["신약개발", "글로벌 진출", "R&D 중심", "도전과 혁신", "환자 중심", "전문성 존중"],
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
      reviewKeywordCount: "26개",
      products: [
        { name: "나보타", description: "전문의약품" },
        { name: "펙수클루", description: "위식도역류질환 치료제" },
        { name: "엔블로", description: "당뇨병 치료제" },
      ],
      address: "서울특별시 강남구 테헤란로 123",
    },
  },
  {
    id: "yuhan",
    name: "(주)유한양행",
    logoText: "YUHAN",
    logoImage: companyLogos["유한양행"],
    tagline: "좋은 상품을 만들어 국가와 동포에게 도움을 주는 기업",
    tags: ["제약/바이오", "코스피 000100", "설립 1926년", "사원수 2,123명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "2조 1,056억 원",
    operatingProfit: "1,101억 원",
    rndRatio: "11.1%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "의약품·생활용품·동물약품 제조 (신약 파이프라인 33개)" },
      { label: "주요 제품", value: "렉라자 · 삐콤씨 · 안티푸라민" },
      { label: "글로벌 진출", value: "10개국+" },
      { label: "특허 보유", value: "100건+" },
    ],
    recruitSummary:
      "비소세포폐암 표적항암제 렉라자를 중심으로 글로벌 허가를 잇달아 획득하며 항암·면역 분야 R&D와 해외 인허가 역량을 빠르게 확장하고 있습니다.",
    fullIntro:
      "비소세포폐암 표적항암제 렉라자를 중심으로 글로벌 허가를 잇달아 획득하며 항암·면역 분야 R&D와 해외 인허가 역량을 빠르게 확장하고 있습니다.",
    details: [
      { label: "본사 위치", value: "서울 동작구 노량진로 74 (유한양행빌딩)" },
      { label: "홈페이지", value: "www.yuhan.co.kr" },
      // 기관 유형은 companies.ts industry="완제 의약품 제조업" → 제약사(폼 옵션) 매핑
      { label: "기관 유형", value: "제약사" },
      { label: "설립 연도", value: "1926년" },
      { label: "사업 분야", value: "의약품·생활용품·동물약품 제조" },
      // 직원 수는 companies.ts employeeCount="2,123명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
      { label: "자본금", value: "813억 9천만 원 (2025.12.31)" },
      { label: "평균 근속", value: "12년" },
      { label: "대졸 초임", value: "5,045만 원" },
      { label: "평균 연봉", value: "9,744만 원" },
      { label: "남녀 성비", value: "남성 71.9% / 여성 28.1%" },
    ],
    keywords: ["신약개발", "글로벌 진출", "R&D 중심", "사회적 책임", "항암·면역", "버들표 신뢰"],
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
      reviewKeywordCount: "54개",
      products: [
        { name: "렉라자", description: "비소세포폐암 표적항암제" },
        { name: "삐콤씨", description: "비타민제" },
        { name: "안티푸라민", description: "소염진통제" },
      ],
      address: "서울 동작구 노량진로 74 (유한양행빌딩)",
    },
  },
  {
    id: "samsung-biologics",
    name: "삼성바이오로직스(주)",
    logoText: "SBL",
    logoImage: companyLogos["삼성바이오로직스"],
    tagline: "글로벌 No.1 바이오의약품 CDMO 기업",
    tags: ["바이오/CDMO", "코스피 207940", "설립 2011년", "사원수 5,455명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯(revenue/operatingProfit/rndRatio)은 의도적으로 비워둔다 — 실제 공시값이 있는 상장사라 임의 수치를 넣지 않는다(STEP 2 정합성 정비)
    businessSummary: [
      { label: "주요 사업", value: "바이오의약품 위탁개발생산(CDMO/CMO/CDO)" },
      { label: "주요 제품", value: "항체의약품 CDMO · CDO 플랫폼 · ADC" },
      { label: "글로벌 진출", value: "해외 매출 비중 80%, 글로벌 제약사 위탁생산 중심" },
      { label: "특허 보유", value: "100건+" },
    ],
    recruitSummary:
      "글로벌 제약사의 항체의약품 위탁개발생산을 중심으로 송도 바이오캠퍼스 생산 능력을 지속 확장하고 있으며, ADC 등 신규 모달리티로 사업 영역을 넓히고 있습니다.",
    /** industryJobDetails.ts의 samsungbio-bioprocess org.description과 동일 — 기업 정보 폼의 본문 소개 대응 */
    fullIntro:
      "삼성바이오로직스는 글로벌 제약·바이오 기업의 바이오의약품 생산을 맡는 CDMO로, 생산 공정과 품질·안전 기준에 맞춘 현장 운영 체계를 갖추고 있습니다.",
    details: [
      { label: "대표자", value: "존림(John Rim)" },
      { label: "본사 위치", value: "인천 연수구 송도바이오대로 300 (송도동, 삼성바이오로직스)" },
      { label: "홈페이지", value: "www.samsungbiologics.com" },
      // 기관 유형은 industryJobDetails.ts org.orgType과 동일 값으로 맞춘다(폼 기준 정합성)
      { label: "기관 유형", value: "CRO·CDMO" },
      { label: "설립 연도", value: "2011년" },
      { label: "사업 분야", value: "바이오의약품 위탁개발생산(CDMO/CMO/CDO)" },
      // 직원 수는 industryJobDetails.ts org.employeeCount(폼 세그먼트 단위)와 동일하게 맞춘다 — tags의 "사원수 5,455명"은 별도 표기라 유지
      { label: "직원 수", value: "501명 이상" },
      { label: "자본금", value: "1,157억 2천만 원 (2025.12.31)" },
      // TODO: 평균 근속 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 근속", value: null },
      { label: "대졸 초임", value: "3,295만 원" },
      // TODO: 평균 연봉 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 연봉", value: null },
      // TODO: 남녀 성비 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "남녀 성비", value: null },
    ],
    keywords: ["CDMO", "글로벌 위탁생산", "송도 바이오캠퍼스", "ESG", "항체의약품", "ADC"],
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
      reviewKeywordCount: "37개",
      products: [
        { name: "CDMO", description: "항체의약품 위탁개발생산" },
        { name: "CDO 플랫폼", description: "S-Cellerate · S-DUAL 등" },
        { name: "ADC", description: "항체약물접합체 생산" },
      ],
      address: "인천 연수구 송도바이오대로 300 (송도동, 삼성바이오로직스)",
    },
  },
  {
    id: "hugel",
    name: "휴젤(주)",
    logoText: "HUGEL",
    logoImage: companyLogos["휴젤(주)"],
    tagline: "삶의 질 향상을 추구하는 글로벌 바이오의약품 전문기업",
    tags: ["바이오/에스테틱", "코스닥 145020", "설립 2001년", "사원수 629명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "2,928억 원",
    operatingProfit: "1,068억 원",
    rndRatio: "10%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "보툴리눔 톡신·HA필러·바이오 화장품 제조 및 도소매" },
      { label: "주요 제품", value: "보툴렉스(Letybo) · 더채움 · 바이리즌 · 웰라쥬" },
      { label: "글로벌 진출", value: "25개국 진출 / 30여개국 인허가 추진 중" },
      { label: "특허 보유", value: "50건+" },
    ],
    recruitSummary:
      "보툴리눔 톡신 보툴렉스(수출명 Letybo)와 HA필러 더채움을 중심으로 25개국 이상에 수출하며, 더마 코스메틱까지 영역을 넓힌 글로벌 에스테틱 전문기업입니다.",
    fullIntro:
      "보툴리눔 톡신 보툴렉스(수출명 Letybo)와 HA필러 더채움을 중심으로 25개국 이상에 수출하며, 더마 코스메틱까지 영역을 넓힌 글로벌 에스테틱 전문기업입니다.",
    details: [
      { label: "본사 위치", value: "강원 춘천시 동내면 거두단지1길 23 (거두리, 휴젤)" },
      { label: "홈페이지", value: "www.hugel-inc.com" },
      // 기관 유형은 companies.ts industry="제약·보건·바이오(생물학적 제제)" + description의 "바이오의약품 전문기업" → 바이오텍(폼 옵션) 매핑
      { label: "기관 유형", value: "바이오텍" },
      { label: "설립 연도", value: "2001년" },
      { label: "사업 분야", value: "보툴리눔 톡신·HA필러·바이오 화장품 제조 및 도소매" },
      // 직원 수는 companies.ts employeeCount="629명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
      // TODO: 자본금 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "자본금", value: null },
      // TODO: 평균 근속 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 근속", value: null },
      { label: "대졸 초임", value: "4,003만 원" },
      // TODO: 평균 연봉 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "평균 연봉", value: null },
      // TODO: 남녀 성비 실데이터 확보 시 반영 — 공개된 수치 없음
      { label: "남녀 성비", value: null },
    ],
    keywords: ["보툴리눔 톡신", "HA필러", "글로벌 수출", "에스테틱", "R&D", "더마 코스메틱"],
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
      reviewKeywordCount: "15개",
      products: [
        { name: "보툴렉스", description: "보툴리눔 톡신(수출명 Letybo)" },
        { name: "더채움", description: "HA필러" },
        { name: "웰라쥬", description: "더마 코스메틱" },
      ],
      address: "강원 춘천시 동내면 거두단지1길 23 (거두리, 휴젤)",
    },
  },
  {
    id: "celltrion",
    name: "셀트리온",
    logoText: "CELLTRION",
    logoImage: companyLogos["셀트리온"],
    tagline: "바이오시밀러를 넘어 신약으로, 글로벌 바이오 기업",
    tags: ["제약/바이오", "설립 1991년", "사원수 2,300명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "3조 5,573억 원",
    operatingProfit: "6,048억 원",
    rndRatio: "18.2%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "항체 바이오시밀러·신약 개발 및 생산" },
      { label: "주요 제품", value: "램시마 · 트룩시마 · 짐펜트라" },
      { label: "글로벌 진출", value: "110개국+" },
    ],
    recruitSummary:
      "램시마SC와 짐펜트라의 글로벌 확대를 중심으로 바이오시밀러 포트폴리오를 넓히며, 항체 신약과 ADC 분야로 파이프라인을 확장하고 있습니다.",
    fullIntro:
      "램시마SC와 짐펜트라의 글로벌 확대를 중심으로 바이오시밀러 포트폴리오를 넓히며, 항체 신약과 ADC 분야로 파이프라인을 확장하고 있습니다.",
    // 사업 분야: companies.ts description("바이오시밀러를 넘어 신약으로")이 슬로건 성격이라 무리하게 도출하지 않고 비워둔다(보고 대상)
    details: [
      { label: "본사 위치", value: "인천 연수구 아카데미로 23" },
      { label: "홈페이지", value: "www.celltrion.com" },
      // 기관 유형은 companies.ts industry="생물학적 제제 제조업" + description의 "바이오 기업" → 바이오텍(폼 옵션) 매핑
      { label: "기관 유형", value: "바이오텍" },
      { label: "설립 연도", value: "1991년" },
      // 직원 수는 companies.ts employeeCount="2,300명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["바이오시밀러", "글로벌 진출", "항체의약품", "생산 강자", "신약 도전"],
    news: [
      {
        id: "celltrion-news-1",
        date: "2026.03.12",
        title: "셀트리온, 짐펜트라 유럽 적응증 확대 승인",
        source: "더파마뉴스",
        category: "글로벌·허가",
        summary: "글로벌 RA·메디컬 어페어즈 직무 수요가 이어질 수 있습니다.",
        tags: ["글로벌", "허가"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/celltrion-news-1",
      },
      {
        id: "celltrion-news-2",
        date: "2025.11.05",
        title: "셀트리온, 3공장 상업 생산 본격 가동",
        source: "더파마뉴스",
        category: "생산·품질",
        summary: "생산·QA·QC 인력 채용이 확대되는 흐름입니다.",
        tags: ["생산", "품질"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/celltrion-news-2",
      },
    ],
    sidebar: {
      interestedCount: "18,000+",
      reviewKeywordCount: "17개",
      products: [
        { name: "램시마", description: "자가면역질환 치료제" },
        { name: "트룩시마", description: "혈액암 치료제" },
        { name: "짐펜트라", description: "램시마SC 미국 브랜드" },
      ],
      address: "인천 연수구 아카데미로 23",
    },
  },
  {
    id: "celltrion-pharm",
    name: "셀트리온제약",
    logoText: "CELLTRION",
    logoImage: companyLogos["셀트리온제약"],
    tagline: "바이오시밀러 국내 유통과 케미컬의약품 개발·생산을 담당하는 셀트리온 그룹 계열사입니다.",
    tags: ["제약사", "코스닥 상장", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    businessSummary: [
      { label: "주요 사업", value: "바이오시밀러 국내 유통 및 케미컬의약품 개발·생산" },
    ],
    recruitSummary:
      "셀트리온제약은 바이오시밀러의 국내 유통과 케미컬의약품의 개발·생산을 함께 담당하는 제약기업입니다.",
    fullIntro:
      "셀트리온제약은 바이오시밀러의 국내 유통과 케미컬의약품의 개발·생산을 함께 담당하는 제약기업입니다.",
    details: [
      { label: "본사 위치", value: "경기 과천시" },
      { label: "기관 유형", value: "제약사" },
      { label: "사업 분야", value: "바이오시밀러 유통 · 케미컬의약품 제조" },
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["바이오시밀러", "케미컬의약품", "의약품 제조", "셀트리온 그룹"],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [
        { name: "바이오시밀러 제품군", description: "셀트리온 그룹이 개발한 바이오시밀러 제품의 국내 유통을 담당합니다." },
        { name: "케미컬의약품 제품군", description: "제네릭을 포함한 케미컬의약품을 개발·생산합니다." },
      ],
      address: "경기 과천시",
    },
  },
  {
    id: "gsk-korea",
    name: "GSK(글락소스미스클라인)",
    logoText: "GSK",
    logoImage: companyLogos["GSK(글락소스미스클라인)"],
    tagline: "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업의 한국법인입니다.",
    tags: ["제약사", "다국적 제약사", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    businessSummary: [
      { label: "주요 사업", value: "백신 및 호흡기·면역·항암·HIV 전문의약품 공급" },
    ],
    recruitSummary:
      "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업 GSK의 한국법인입니다.",
    fullIntro:
      "호흡기·면역·항암·HIV·감염질환 영역에 집중하는 글로벌 바이오제약 기업 GSK의 한국법인입니다.",
    details: [
      { label: "본사 위치", value: "서울 용산구" },
      { label: "기관 유형", value: "제약사" },
      { label: "사업 분야", value: "백신 · 호흡기·면역·항암·HIV 전문의약품" },
      { label: "직원 수", value: "101~500명" },
    ],
    keywords: ["글로벌 바이오제약", "백신", "항암", "면역질환"],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [
        { name: "백신", description: "감염질환 예방을 위한 백신 제품군을 국내에 공급합니다." },
        { name: "전문의약품", description: "호흡기·면역·항암·HIV·감염질환 영역의 전문의약품을 공급합니다." },
      ],
      address: "서울 용산구",
    },
  },
  {
    id: "roche-korea",
    name: "한국로슈",
    logoText: "ROCHE",
    logoImage: companyLogos["한국로슈"],
    tagline: "항암·면역질환 영역의 전문의약품을 국내에 공급하는 글로벌 제약사 로슈의 한국법인입니다.",
    tags: ["제약사", "다국적 제약사", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    businessSummary: [
      { label: "주요 사업", value: "항암·면역질환 전문의약품 공급" },
    ],
    recruitSummary:
      "한국로슈는 다국적 제약사 로슈의 한국법인으로, 항암·면역질환 영역의 전문의약품을 국내에 공급합니다.",
    fullIntro:
      "한국로슈는 다국적 제약사 로슈의 한국법인으로, 항암·면역질환 영역의 전문의약품을 국내에 공급합니다.",
    details: [
      { label: "본사 위치", value: "서울 서초구" },
      { label: "기관 유형", value: "제약사" },
      { label: "사업 분야", value: "항암 전문의약품 · 면역질환 전문의약품" },
      { label: "직원 수", value: "101~500명" },
    ],
    keywords: ["글로벌 제약사", "항암", "면역질환", "GMP"],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [
        { name: "항암 전문의약품", description: "항암 영역의 전문의약품을 국내에 공급합니다." },
        { name: "면역질환 전문의약품", description: "면역질환 영역의 전문의약품을 국내에 공급합니다." },
      ],
      address: "서울 서초구",
    },
  },
  {
    id: "hanmi-pharm",
    name: "한미약품(주)",
    logoText: "한미약품",
    logoImage: companyLogos["한미약품"],
    tagline: "R&D로 성장하는 신약개발 중심 제약기업",
    tags: ["제약/바이오", "설립 1973년", "사원수 2,400명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "1조 5,842억 원",
    operatingProfit: "2,315억 원",
    rndRatio: "13.8%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "개량신약·전문의약품 및 신약 파이프라인 개발" },
      { label: "주요 제품", value: "아모잘탄 · 로수젯 · 팔팔" },
      { label: "파이프라인", value: "30개+" },
    ],
    recruitSummary:
      "대사질환·항암 중심의 신약 파이프라인과 개량신약 포트폴리오를 함께 운영하며, 국내 R&D 투자 상위권을 유지하고 있는 연구 중심 제약사입니다.",
    fullIntro:
      "대사질환·항암 중심의 신약 파이프라인과 개량신약 포트폴리오를 함께 운영하며, 국내 R&D 투자 상위권을 유지하고 있는 연구 중심 제약사입니다.",
    // 사업 분야: companies.ts description("R&D로 성장하는 신약개발 중심 제약기업")이 슬로건 성격이라 무리하게 도출하지 않고 비워둔다(보고 대상)
    details: [
      { label: "본사 위치", value: "서울 송파구 위례성대로 14" },
      { label: "홈페이지", value: "www.hanmi.co.kr" },
      // 기관 유형은 companies.ts industry="완제 의약품 제조업" → 제약사(폼 옵션) 매핑
      { label: "기관 유형", value: "제약사" },
      { label: "설립 연도", value: "1973년" },
      // 직원 수는 companies.ts employeeCount="2,400명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["신약개발", "R&D 중심", "개량신약", "대사질환", "오픈이노베이션"],
    news: [
      {
        id: "hanmi-pharm-news-1",
        date: "2026.01.28",
        title: "한미약품, 비만 치료 신약 국내 3상 진입",
        source: "더파마뉴스",
        category: "국내·임상",
        summary: "임상 운영·메디컬 직무 수요가 늘어날 수 있습니다.",
        tags: ["국내", "임상"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/hanmi-pharm-news-1",
      },
      {
        id: "hanmi-pharm-news-2",
        date: "2025.08.14",
        title: "한미약품, 항암 파이프라인 글로벌 기술이전 계약",
        source: "더파마뉴스",
        category: "글로벌·파트너십",
        summary: "BD·라이선싱 직무의 역할이 커지는 흐름입니다.",
        tags: ["글로벌", "파트너십"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/hanmi-pharm-news-2",
      },
    ],
    sidebar: {
      interestedCount: "12,000+",
      reviewKeywordCount: "15개",
      products: [
        { name: "아모잘탄", description: "고혈압 복합제" },
        { name: "로수젯", description: "이상지질혈증 복합제" },
        { name: "팔팔", description: "발기부전 치료제" },
      ],
      address: "서울 송파구 위례성대로 14",
    },
  },
  {
    id: "chongkundang",
    name: "(주)종근당",
    logoText: "종근당",
    logoImage: companyLogos["(주)종근당"],
    tagline: "신약과 개량신약을 아우르는 국내 대표 제약기업",
    tags: ["제약/바이오", "설립 1941년", "사원수 2,200명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "1조 6,694억 원",
    operatingProfit: "1,528억 원",
    rndRatio: "12.1%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "전문의약품·개량신약 개발 및 제조" },
      { label: "주요 제품", value: "종근당글리아티린 · 이모튼 · 딜라트렌" },
    ],
    recruitSummary:
      "전문의약품 중심의 안정적인 매출 기반 위에서 합성신약과 바이오 분야 파이프라인을 확대하고 있으며, CMC·품질 직무 채용이 꾸준한 기업입니다.",
    fullIntro:
      "전문의약품 중심의 안정적인 매출 기반 위에서 합성신약과 바이오 분야 파이프라인을 확대하고 있으며, CMC·품질 직무 채용이 꾸준한 기업입니다.",
    // 사업 분야: companies.ts description("신약과 개량신약을 아우르는 국내 대표 제약기업")이 슬로건 성격이라 무리하게 도출하지 않고 비워둔다(보고 대상)
    details: [
      { label: "본사 위치", value: "서울 서대문구 충정로 8" },
      { label: "홈페이지", value: "www.ckdpharm.com" },
      // 기관 유형은 companies.ts industry="완제 의약품 제조업" → 제약사(폼 옵션) 매핑
      { label: "기관 유형", value: "제약사" },
      { label: "설립 연도", value: "1941년" },
      // 직원 수는 companies.ts employeeCount="2,200명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["전문의약품", "CMC·품질", "꾸준한 채용", "안정성", "신약 파이프라인"],
    news: [
      {
        id: "chongkundang-news-1",
        date: "2026.02.19",
        title: "종근당, 합성신약 후보물질 임상 1상 승인",
        source: "더파마뉴스",
        category: "국내·임상",
        summary: "비임상·임상 초기 단계 인력 수요가 생기고 있습니다.",
        tags: ["국내", "임상"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/chongkundang-news-1",
      },
      {
        id: "chongkundang-news-2",
        date: "2025.09.30",
        title: "종근당, 천안공장 스마트팩토리 전환 투자 발표",
        source: "더파마뉴스",
        category: "생산·품질",
        summary: "공정기술·밸리데이션 직무 채용이 이어질 수 있습니다.",
        tags: ["생산", "품질"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/chongkundang-news-2",
      },
    ],
    sidebar: {
      interestedCount: "8,500+",
      reviewKeywordCount: "12개",
      products: [
        { name: "종근당글리아티린", description: "뇌기능개선제" },
        { name: "이모튼", description: "관절 기능성 제제" },
        { name: "딜라트렌", description: "심부전 치료제" },
      ],
      address: "서울 서대문구 충정로 8",
    },
  },
  {
    id: "greencross",
    name: "(주)녹십자",
    logoText: "녹십자",
    logoImage: companyLogos["녹십자"],
    tagline: "백신과 혈액제제로 공중보건을 지켜온 바이오 전문기업",
    tags: ["제약/바이오", "설립 1967년", "사원수 2,100명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics를 그대로 이관, 해외 매출 비중은 새 스펙에 없어 폐기(STEP 2.5)
    revenue: "1조 7,208억 원",
    operatingProfit: "682억 원",
    rndRatio: "11.4%",
    financialYear: "2025",
    businessSummary: [
      { label: "주요 사업", value: "혈액제제·백신 개발 및 제조" },
      { label: "주요 제품", value: "알리글로 · 지씨플루 · 헌터라제" },
    ],
    recruitSummary:
      "혈액제제 알리글로의 미국 시장 안착을 계기로 글로벌 매출 비중을 늘리고 있으며, 백신·희귀질환 치료제 중심의 특화 포트폴리오를 운영합니다.",
    fullIntro:
      "혈액제제 알리글로의 미국 시장 안착을 계기로 글로벌 매출 비중을 늘리고 있으며, 백신·희귀질환 치료제 중심의 특화 포트폴리오를 운영합니다.",
    // 사업 분야: companies.ts description("백신과 혈액제제로 공중보건을 지켜온 바이오 전문기업")이 슬로건 성격이라 무리하게 도출하지 않고 비워둔다(보고 대상)
    details: [
      { label: "본사 위치", value: "경기 용인시 기흥구 이현로30번길 107" },
      { label: "홈페이지", value: "www.gccorp.com" },
      // 기관 유형은 companies.ts industry="생물학적 제제 제조업" + description의 "바이오 전문기업" → 바이오텍(폼 옵션) 매핑
      { label: "기관 유형", value: "바이오텍" },
      { label: "설립 연도", value: "1967년" },
      // 직원 수는 companies.ts employeeCount="2,100명" → 501명 이상(폼 4구간) 매핑
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["혈액제제", "백신", "글로벌 진출", "희귀질환", "콜드체인"],
    news: [
      {
        id: "greencross-news-1",
        date: "2026.04.08",
        title: "녹십자, 알리글로 미국 매출 분기 최대 실적",
        source: "더파마뉴스",
        category: "글로벌·수출",
        summary: "글로벌 생산·품질 및 SCM 직무의 중요성이 커지고 있습니다.",
        tags: ["글로벌", "수출"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/greencross-news-1",
      },
      {
        id: "greencross-news-2",
        date: "2025.10.22",
        title: "녹십자, 독감백신 국가출하승인 물량 확대",
        source: "더파마뉴스",
        category: "국내·백신",
        summary: "시즌별 생산·QC 인력 수요가 반복되는 구조입니다.",
        tags: ["국내", "백신"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/greencross-news-2",
      },
    ],
    sidebar: {
      interestedCount: "7,200+",
      reviewKeywordCount: "9개",
      products: [
        { name: "알리글로", description: "면역글로불린" },
        { name: "지씨플루", description: "독감백신" },
        { name: "헌터라제", description: "헌터증후군 치료제" },
      ],
      address: "경기 용인시 기흥구 이현로30번길 107",
    },
  },
  {
    id: "medicoa-cro",
    name: "메디코아CRO(주)",
    logoText: "메디코아",
    logoImage: companyLogos["메디코아"],
    tagline: "국내 임상부터 글로벌 다국가 임상까지, 풀서비스 CRO",
    tags: ["CRO·CDMO", "설립 2011년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯: 기존 metrics의 매출액/영업이익만 그대로 이관 — R&D 투자비율 항목 자체가 없어 rndRatio는 비워둔다.
    // 글로벌 과제 비중은 새 스펙에 없어 폐기, "진행 과제"는 재무가 아닌 운영 지표라 metrics에 남긴다(STEP 2.5)
    revenue: "892억 원",
    operatingProfit: "96억 원",
    financialYear: "2025",
    metrics: [{ label: "진행 과제", value: "연간 140건+" }],
    businessSummary: [
      { label: "주요 사업", value: "임상 1~4상 운영·모니터링·DM·통계 수탁" },
      { label: "주요 고객", value: "국내 제약사·바이오벤처·글로벌 스폰서" },
    ],
    recruitSummary:
      "국내 제약사와 바이오벤처의 임상을 폭넓게 수탁하며, 다국가 임상 비중을 늘려가는 성장기 CRO입니다. CRA·DM·통계 직군의 채용이 꾸준합니다.",
    fullIntro:
      "국내 제약사와 바이오벤처의 임상을 폭넓게 수탁하며, 다국가 임상 비중을 늘려가는 성장기 CRO입니다. CRA·DM·통계 직군의 채용이 꾸준합니다.",
    details: [
      { label: "본사 위치", value: "서울 구로구 디지털로 300" },
      { label: "홈페이지", value: "www.medicoacro.co.kr" },
      // 기관 유형은 companies.ts industry="임상시험 수탁기관(CRO)" → CRO·CDMO(폼 옵션) 매핑
      { label: "기관 유형", value: "CRO·CDMO" },
      { label: "설립 연도", value: "2011년" },
      // 사업 분야: chip 라벨형으로 교정됨 — companies.ts description을 그대로 문장형으로 옮기던 값을 정본 chip 표기로 대체
      { label: "사업 분야", value: "임상시험 수탁(CRO) · 다국가 임상" },
      // 직원 수는 companies.ts employeeCount가 이미 "101~500명"으로 폼과 동일 구간 표기라 그대로 사용
      { label: "직원 수", value: "101~500명" },
    ],
    keywords: ["풀서비스 CRO", "CRA 채용", "다국가 임상", "성장기", "커리어 시작"],
    news: [
      {
        id: "medicoa-cro-news-1",
        date: "2026.03.02",
        title: "메디코아CRO, 글로벌 스폰서 항암 3상 수주",
        source: "더파마뉴스",
        category: "사업·수주",
        summary: "CRA·임상 QA 채용이 확대될 수 있습니다.",
        tags: ["사업", "수주"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/medicoa-cro-news-1",
      },
      {
        id: "medicoa-cro-news-2",
        date: "2025.07.16",
        title: "메디코아CRO, 재택·거점 근무제 정식 도입",
        source: "더파마뉴스",
        category: "조직·복지",
        summary: "모니터링 직군의 근무 유연성이 개선되고 있습니다.",
        tags: ["조직", "복지"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/medicoa-cro-news-2",
      },
    ],
    sidebar: {
      interestedCount: "3,400+",
      reviewKeywordCount: "12개",
      products: [],
      address: "서울 구로구 디지털로 300",
    },
  },
  {
    id: "snubh",
    name: "분당서울대학교병원",
    logoText: "분당",
    logoImage: companyLogos["분당서울대병원"],
    tagline: "진료와 임상연구를 함께 운영하는 상급종합병원",
    tags: ["병원", "설립 2003년", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "임상시험센터와 의료정보화 역량을 갖춘 연구 중심 병원으로, 병원약사·CRC 등 보건의료 직군과 임상연구 직군의 채용이 꾸준히 발생합니다.",
    metrics: [
      { label: "병상 수", value: "1,335병상" },
      { label: "약제부 인력", value: "110명+" },
    ],
    businessSummary: [{ label: "특징", value: "국내 최초 전면 디지털 병원 (HIMSS 최고 등급 경험)" }],
    recruitSummary:
      "임상시험센터와 의료정보화 역량을 갖춘 연구 중심 병원으로, 병원약사·CRC 등 보건의료 직군과 임상연구 직군의 채용이 꾸준히 발생합니다.",
    details: [
      { label: "설립 연도", value: "2003년" },
      { label: "본사 위치", value: "경기 성남시 분당구 구미로173번길 82" },
      { label: "홈페이지", value: "www.snubh.org" },
    ],
    keywords: ["상급종합병원", "병원약사", "임상시험센터", "스마트병원", "교육 체계"],
    dutySystem: "야간 당직 월 2~3회",
    medicalDepartments: [
      "family_medicine",
      "tuberculosis",
      "internal_medicine",
      "anesthesiology_pain_medicine",
      "radiation_oncology",
      "pathology",
      "urology",
      "obstetrics_gynecology",
      "plastic_surgery",
      "pediatrics",
      "neurology",
      "neurosurgery",
      "ophthalmology",
      "radiology",
      "preventive_medicine",
      "surgery",
      "emergency_medicine",
      "otolaryngology",
      "rehabilitation_medicine",
      "psychiatry",
      "orthopedics",
      "occupational_environmental_medicine",
      "laboratory_medicine",
      "dermatology",
      "nuclear_medicine",
      "thoracic_surgery",
    ],
    features: [
      { label: "신입 교육", text: "신입 약사 6개월 조제·병동 로테이션, 프리셉터 배정 운영" },
      { label: "임상연구 환경", text: "임상시험센터 상시 운영, CRC·연구약사 채용이 주기적으로 발생" },
      { label: "의료정보화", text: "국내 최초 전면 디지털 병원, HIMSS 최고 등급 인증 경험" },
    ],
    specialistPharmacists: ["감염", "종양", "정맥영양"],
    news: [
      {
        id: "snubh-news-1",
        date: "2026.02.10",
        title: "분당서울대병원, 상반기 약무직 정기 채용 진행",
        source: "더파마뉴스",
        category: "병원·채용",
        summary: "병원약사 정기 채용 사이클이 유지되고 있습니다.",
        tags: ["병원", "채용"],
        thumbnail: companyExampleImages.hero,
        href: "https://www.thepharmanews.com/news/snubh-news-1",
      },
      {
        id: "snubh-news-2",
        date: "2025.12.01",
        title: "분당서울대병원, 임상시험센터 확장 개소",
        source: "더파마뉴스",
        category: "연구·임상",
        summary: "CRC·임상 코디네이터 수요가 늘어날 수 있습니다.",
        tags: ["연구", "임상"],
        thumbnail: companyExampleImages.workspace,
        href: "https://www.thepharmanews.com/news/snubh-news-2",
      },
    ],
    sidebar: {
      interestedCount: "5,100+",
      reviewKeywordCount: "9개",
      products: [],
      address: "경기 성남시 분당구 구미로173번길 82",
    },
  },
  {
    id: "national-fire-hospital",
    name: "국립소방병원",
    logoText: "소방",
    logoImage: companyLogos["국립소방병원"],
    tagline: "소방·재난 대응을 아우르는 공공 종합병원",
    tags: ["병원", "설립 2025년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    fullIntro: "새롭게 문을 연 공공 종합병원에서 약제 업무 체계를 함께 만들어갈 약사를 찾습니다.",
    metrics: [{ label: "병상 수", value: "302병상" }],
    businessSummary: [
      { label: "유형", value: "충북 음성 소재 공공 종합병원" },
      { label: "규모", value: "302병상 규모, 2025년 정식 개원한 신설 병원" },
      { label: "운영 주체", value: "서울대학교병원이 위탁 운영" },
    ],
    recruitSummary: "새롭게 문을 연 공공 종합병원에서 약제 업무 체계를 함께 만들어갈 약사를 찾습니다.",
    details: [
      { label: "설립 연도", value: "2025년" },
      { label: "본사 위치", value: "충북 음성군 맹동면 용두4길 19 국립소방병원" },
    ],
    keywords: ["공공병원", "종합병원", "소방 특화", "신설"],
    dutySystem: "약제팀 교대 근무 기반, 공공병원 표준 근무 체계 운영",
    medicalDepartments: ["internal_medicine", "surgery", "psychiatry", "rehabilitation_medicine"],
    features: [
      { label: "진료 특성", text: "화상·정신건강·재활·건강증진 등 소방 특화 진료" },
      { label: "약제 업무", text: "입원·외래 조제, 복약지도, 의약품 관리" },
      { label: "근무 형태", text: "공공병원 정규 근무 체계" },
      { label: "운영 주체", text: "서울대학교병원 위탁 운영" },
      { label: "개원", text: "2025년 정식 개원한 신설 공공병원" },
      { label: "특화 분야", text: "화상·재활·정신건강 등 소방 재난 대응 특화" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "4개",
      products: [],
      address: "충북 음성군 맹동면 용두4길 19 국립소방병원",
    },
  },
  {
    id: "mirae-care-hospital",
    name: "미래요양병원",
    logoText: "미래",
    logoImage: companyLogos["미래요양병원"],
    tagline: "노인성·만성질환 중심의 재활 요양병원",
    tags: ["병원", "설립 2009년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    fullIntro: "요양병원에서 만성질환 복약 관리와 입원 조제를 담당할 약사를 찾습니다.",
    businessSummary: [
      { label: "유형", value: "경기 수원 팔달구 소재 요양병원" },
      { label: "규모", value: "노인성·만성질환 입원 환자 중심 운영" },
      { label: "진료 특성", value: "재활 치료와 만성질환 관리 중심" },
    ],
    recruitSummary: "요양병원에서 만성질환 복약 관리와 입원 조제를 담당할 약사를 찾습니다.",
    details: [
      { label: "설립 연도", value: "2009년" },
      { label: "본사 위치", value: "경기 수원시 팔달구 매산로 88 미래요양병원" },
    ],
    keywords: ["요양병원", "재활", "만성질환", "입원"],
    dutySystem: "약제팀 주간 근무 중심, 입원 환자 조제 대응 체계 운영",
    medicalDepartments: ["internal_medicine", "surgery", "neurosurgery", "family_medicine", "rehabilitation_medicine"],
    features: [
      { label: "진료 특성", text: "노인성 질환·만성질환 입원, 재활 치료 병행" },
      { label: "약제 업무", text: "입원 조제, 만성질환 복약 관리, 의약품 관리" },
      { label: "근무 형태", text: "요양병원 정규 근무" },
      { label: "진료 대상", text: "노인성·만성질환 입원 환자 중심" },
      { label: "특화 분야", text: "재활 치료 병행 요양" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "3개",
      products: [],
      address: "경기 수원시 팔달구 매산로 88 미래요양병원",
    },
  },
  {
    id: "jeil-orthopedic-hospital",
    name: "제일정형외과병원",
    logoText: "제일",
    logoImage: companyLogos["제일정형외과병원"],
    tagline: "척추·관절 중심의 정형외과 전문병원",
    tags: ["병원", "설립 2002년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    fullIntro: "정형외과 전문병원에서 수술 전후 복약 관리와 조제를 담당할 약사를 찾습니다.",
    metrics: [{ label: "병상 수", value: "139병상" }],
    businessSummary: [
      { label: "유형", value: "서울 강남 소재 정형외과 전문병원" },
      { label: "규모", value: "139병상 규모의 전문병원" },
      { label: "진료 특성", value: "척추·관절 질환 중심의 전문 진료" },
    ],
    recruitSummary: "정형외과 전문병원에서 수술 전후 복약 관리와 조제를 담당할 약사를 찾습니다.",
    details: [
      { label: "설립 연도", value: "2002년" },
      { label: "본사 위치", value: "서울 강남구 영동대로 726 제일정형외과병원" },
    ],
    keywords: ["전문병원", "정형외과", "척추·관절"],
    dutySystem: "약제팀 교대 근무, 수술 일정에 맞춘 조제 대응 체계",
    medicalDepartments: ["orthopedics", "rehabilitation_medicine", "internal_medicine"],
    features: [
      { label: "진료 특성", text: "척추·관절·재활 및 내과 진료" },
      { label: "약제 업무", text: "수술 전후 조제, 통증 관리 복약지도, 의약품 관리" },
      { label: "근무 형태", text: "전문병원 정규 근무" },
      { label: "진료 분야", text: "척추·관절 중심 정형외과 전문" },
      { label: "규모", text: "139병상 전문병원" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "3개",
      products: [],
      address: "서울 강남구 영동대로 726 제일정형외과병원",
    },
  },
  {
    id: "sungae-hospital",
    name: "성애병원",
    logoText: "성애",
    logoImage: companyLogos["성애병원"],
    tagline: "다양한 진료과를 갖춘 지역 종합병원",
    tags: ["병원", "설립 1982년", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    fullIntro: "여러 진료과 처방을 다루는 종합병원에서 폭넓은 약제 경험을 쌓을 약사를 찾습니다.",
    businessSummary: [
      { label: "유형", value: "서울 영등포 소재 종합병원" },
      { label: "규모", value: "다양한 진료과를 운영하는 종합병원" },
      { label: "운영 주체", value: "의료법인 성애의료재단" },
    ],
    recruitSummary: "여러 진료과 처방을 다루는 종합병원에서 폭넓은 약제 경험을 쌓을 약사를 찾습니다.",
    details: [
      { label: "설립 연도", value: "1982년" },
      { label: "본사 위치", value: "서울 영등포구 여의대방로53길 22 성애병원" },
    ],
    keywords: ["종합병원", "응급의료", "지역 거점"],
    dutySystem: "약제팀 교대 근무 및 당직 체계, 응급 조제 대응 운영",
    medicalDepartments: ["internal_medicine", "surgery", "emergency_medicine"],
    specialistPharmacists: ["종양", "중환자", "감염"],
    features: [
      { label: "진료 특성", text: "종합진료·응급·검진·인공신장·간호간병통합" },
      { label: "약제 업무", text: "입원·외래 조제, 다진료과 복약 관리, 의약품 관리" },
      { label: "근무 형태", text: "종합병원 교대 근무" },
      { label: "운영 주체", text: "의료법인 성애의료재단" },
      { label: "진료 범위", text: "응급·검진·인공신장·간호간병통합 등 종합 진료" },
      { label: "설립", text: "1982년 개원한 지역 거점 종합병원" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "5개",
      products: [],
      address: "서울 영등포구 여의대방로53길 22 성애병원",
    },
  },
  // ---- 오산한국병원 (STEP 3b 신설) — hospitalJobDetails.ts osanHospitalJobDetail.org 값을 정본으로 재사용 ----
  {
    id: "osan-hankook-hospital",
    name: "오산한국병원",
    logoText: "오산",
    logoImage: companyLogos["오산한국병원"],
    tagline: "경기 오산 지역의 진료를 담당하는 종합병원입니다.",
    tags: ["병원", "설립 1989년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "오산한국병원은 지역 주민의 외래·입원 진료를 담당하는 종합병원입니다. 약제부는 조제와 복약상담, 병동 투약 관리를 함께 수행하며, 근무 일정과 인수인계 체계를 안정적으로 운영하고 있습니다.",
    metrics: [
      { label: "병상 수", value: "320병상 내외" },
      { label: "약제부 인력", value: "8명 내외" },
    ],
    businessSummary: [],
    recruitSummary:
      "오산한국병원은 지역 주민의 외래·입원 진료를 담당하는 종합병원입니다. 약제부는 조제와 복약상담, 병동 투약 관리를 함께 수행하며, 근무 일정과 인수인계 체계를 안정적으로 운영하고 있습니다.",
    details: [
      { label: "설립 연도", value: "1989년" },
      { label: "본사 위치", value: "경기 오산시 밀머리로1번길 16 오산한국병원 신관 1층 약제과" },
      { label: "홈페이지", value: "www.osan-hankook-hospital.example" },
    ],
    keywords: ["종합병원", "경기남부", "당직근무", "안정적 처방"],
    dutySystem:
      "평일은 정규 근무 체계로 운영되며, 일요일에는 당직 약사가 단독으로 근무합니다. 당직 일정은 월 단위로 사전 조율합니다.",
    medicalDepartments: ["internal_medicine", "surgery", "orthopedics", "emergency_medicine", "radiology"],
    specialistPharmacists: ["감염", "중환자"],
    pharmacyEnvironmentDescription:
      "약사와 지원 인력이 함께 근무하며, 당직 시 인수인계 문서를 기준으로 업무를 진행합니다. 처방 검토와 조제 감사는 이중 확인 절차를 유지하고 있습니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "경기 오산시 밀머리로1번길 16 오산한국병원 신관 1층 약제과",
    },
  },
  // ---- 국군서울지구병원 (STEP 3b 신설) — hospitalJobDetails.ts armedForcesSeoulDistrictHospitalJobDetail.org 값을 정본으로 재사용 ----
  {
    id: "armed-forces-seoul-district-hospital",
    name: "국군서울지구병원",
    logoText: "국군",
    logoImage: companyLogos["국군서울지구병원"],
    tagline: "군 장병과 군무원의 진료를 담당하는 군 병원입니다.",
    tags: ["병원", "설립 1971년", "사원수 101~500명"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "국군서울지구병원은 수도권 군 장병과 군무원의 외래·입원 진료를 담당하는 군 병원입니다. 약제부는 조제·투약 관리와 의약품 수급 관리를 수행하며, 규정에 따른 안정적인 근무 환경을 갖추고 있습니다.",
    metrics: [
      { label: "병상 수", value: "150병상 내외" },
      { label: "약제부 인력", value: "12명 내외" },
    ],
    businessSummary: [],
    recruitSummary:
      "국군서울지구병원은 수도권 군 장병과 군무원의 외래·입원 진료를 담당하는 군 병원입니다. 약제부는 조제·투약 관리와 의약품 수급 관리를 수행하며, 규정에 따른 안정적인 근무 환경을 갖추고 있습니다.",
    details: [
      { label: "설립 연도", value: "1971년" },
      { label: "본사 위치", value: "서울 종로구 삼청로10길 13 국군서울지구병원" },
      { label: "홈페이지", value: "www.afsdh-hospital.example" },
    ],
    keywords: ["군병원", "공공기관", "약제행정", "정규직"],
    dutySystem:
      "약제부는 주간 근무 체계로 운영되며, 별도 당직 근무는 없습니다. 처방 접수와 조제, 검수 업무가 규정에 따라 분담됩니다.",
    medicalDepartments: ["internal_medicine", "surgery", "orthopedics", "psychiatry", "rehabilitation_medicine"],
    specialistPharmacists: ["감염", "정맥영양", "중환자"],
    pharmacyEnvironmentDescription:
      "약제부는 조제, 검수, 약무 행정으로 업무가 구분되어 있으며, 규정과 지침에 따라 표준화된 절차로 운영됩니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 종로구 삼청로10길 13 국군서울지구병원",
    },
  },
  {
    id: "national-central-hospital",
    name: "국립중앙의료원",
    logoText: "의료원",
    logoImage: companyLogos["국립중앙의료원"],
    tagline: "공공보건의료를 선도하는 국가중심병원입니다.",
    tags: ["병원", "설립 1958년", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "1958년 설립된 국가중심병원으로, 메르스와 코로나19 등 국가 감염병 위기 대응의 중심 역할을 해왔습니다. 공공의료 격차 해소를 사명으로 하며, 중앙감염병병원 건립과 신축·이전을 추진하고 있습니다.",
    metrics: [],
    businessSummary: [],
    recruitSummary: "공공보건의료를 선도하는 국가중심병원입니다.",
    details: [
      { label: "설립 연도", value: "1958년" },
      { label: "본사 위치", value: "서울 중구 을지로 245" },
      { label: "홈페이지", value: "www.nmc.or.kr" },
    ],
    keywords: ["공공의료", "국가중심병원", "감염병 대응"],
    dutySystem:
      "야간은 3개 근무조가 3일 간격으로 교대하며, 주말·공휴일에는 단시간 약사가 별도 근무합니다.",
    pharmacyEnvironmentDescription:
      "병동 입원환자와 응급실 환자의 처방 감사·조제·투약, 복약지도, 반납약품 처리와 해외유입감염병 치료제 투약 업무를 수행합니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 중구 을지로 245",
    },
  },
  {
    id: "snuh",
    name: "서울대학교병원",
    logoText: "서울대",
    logoImage: companyLogos["서울대학교병원"],
    tagline: "국가중앙병원 역할을 수행하는 상급종합병원입니다.",
    tags: ["병원", "설립 1978년", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "서울 연건동에 위치한 상급종합병원으로, 본원과 어린이병원·암병원을 함께 운영합니다. 약제부는 입원·외래·주사조제, 임상약료, 의약정보, 소아·암병원 전담 파트로 나뉘어 있으며 조제 자동화 등 약제 업무 선진화를 추진하고 있습니다.",
    metrics: [],
    businessSummary: [],
    recruitSummary: "국가중앙병원 역할을 수행하는 상급종합병원입니다.",
    details: [
      { label: "설립 연도", value: "1978년" },
      { label: "본사 위치", value: "서울 종로구 대학로 101" },
      { label: "홈페이지", value: "www.snuh.org" },
    ],
    keywords: ["상급종합병원", "전공약사", "임상약료"],
    dutySystem: "직무 특성에 따라 야간·휴일 근무와 교대 근무가 운영됩니다.",
    pharmacyEnvironmentDescription:
      "약제부는 입원·외래·주사조제 파트와 임상약료, 의약정보, 소아·암병원 전담 파트로 구분되어 있으며, 1983년부터 전공약사 수련 제도를 운영하고 있습니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 종로구 대학로 101",
    },
  },
  {
    id: "eunhaeng-pharmacy",
    name: "은행약국",
    logoText: "은행",
    // N3 PART B 확정 문구로 교체 (기존의 평가성 문구 → 사실 서술)
    tagline: "내과·이비인후과 의원 처방을 주로 조제하는 의원층 약국",
    tags: ["약국", "설립 2026.02.11"],
    coverImage: companyExampleImages.hero,
    /** pharmacyJobDetails.ts eunhaengPharmacyJobDetail.org.fullIntro와 동일(V2 정본, STEP 3b) */
    fullIntro:
      "인근 의원 처방이 많아 처방 흐름이 안정적인 편입니다. 약사와 직원이 함께 근무하며 조제, 검수, 응대를 나누어 진행합니다. 신규 약사님께는 전산 입력, 조제 검수, 복약지도 흐름을 차근차근 안내드립니다.",
    metrics: [
      // 값은 pharmacyJobDetails.ts org.avgDailyPrescriptions(V2 정본)로 교체
      { label: "일평균 처방", value: "170건 내외" },
      { label: "주요 처방과", value: "내과·이비인후과·정형외과" },
    ],
    businessSummary: [
      { label: "근무 약사", value: "3명" },
      { label: "직원", value: "2명" },
      // 아래 2건은 pharmacyJobDetails.ts org.mainHospitals/location.parkingTransit을 그대로 이관(V2 정본)
      { label: "주요 처방 병원", value: "양지내과의원 · 양지이비인후과의원 · 인근 정형외과 의원" },
      {
        label: "주차·교통",
        value: "건물 지하주차장 2시간 무료 지원. 양지IC에서 차량 5분 거리이며, 양지사거리 정류장에서 도보 3분 내 접근 가능합니다.",
      },
    ],
    recruitSummary:
      "같은 건물 의원 처방 중심이라 처방 패턴이 안정적이고, 신규 약사 교육과 복약지도 루틴이 정리되어 있는 의원층 약국입니다.",
    details: [
      { label: "본사 위치", value: "경기 용인시 처인구 양지읍 양지로138번길 14 2층" },
    ],
    keywords: ["의원층 약국", "안정적 처방", "근무 협의 가능", "교육 루틴"],
    pharmacySoftware: "유팜",
    // pharmacyJobDetails.ts org.businessHours(V2 정본)로 교체
    businessHours: "평일 09:00–19:00, 토요일 09:00–14:00, 일요일·공휴일 휴무",
    // pharmacyJobDetails.ts org.dispensingEquipment(V2 정본)로 교체
    dispensingEquipment: ["자동조제기", "산제포장기"],
    features: [
      { label: "근무 형태", text: "주 5일 협의 가능, 마감 시간 준수 문화" },
      { label: "교육 루틴", text: "신규 약사 대상 조제 검토·복약지도 루틴 교육, 재고·마약류 관리 체계 정리됨" },
    ],
    // 약국 특성은 pharmacyJobDetails.ts org.pharmacyFeatureId("prescription_focused")와 일치시켰다(V2 정본)
    pharmacyFeatures: "prescription_focused",
    news: [],
    sidebar: {
      // 원고에 사이드바 수치(관심기업/응답률/평균응답)가 없어 이 회사의 다른 필드(사원수 등)와 동일하게
      // 데이터 없음을 뜻하는 기존 관례("-")를 사용했다
      interestedCount: "-",
      reviewKeywordCount: "9개",
      products: [],
      address: "경기 용인시 처인구 양지읍 양지로138번길 14 2층",
    },
  },
  {
    id: "buldang-central-pharmacy",
    name: "불당센트럴약국",
    logoText: "센트럴",
    tagline: "불당동 주민 곁의 동네 일반약국",
    tags: ["일반약국", "설립 2026.01.01"],
    coverImage: companyExampleImages.hero,
    fullIntro: "소규모 약국에서 처방조제부터 일반약 상담까지 두루 경험하고 싶은 분께 적합합니다.",
    businessSummary: [
      // businessSummary의 기존 "규모" 서술("약사 1명·직원 1명이 함께 운영")에 명시된 인원수를 그대로 이관
      { label: "근무 약사", value: "1명" },
      { label: "직원", value: "1명" },
    ],
    recruitSummary: "소규모 약국에서 처방조제부터 일반약 상담까지 두루 경험하고 싶은 분께 적합합니다.",
    details: [{ label: "본사 위치", value: "충남 천안시 서북구 번영로 100 센트럴프라자 1층" }],
    keywords: ["일반약국", "처방조제", "소규모"],
    pharmacySoftware: "PM+20",
    businessHours: "평일 08:40~18:40 · 토 08:40~14:00 · 일요일·공휴일 휴무",
    dispensingEquipment: ["자동 정제 분류기"],
    pharmacyFeatures: "otc_focused",
    features: [
      { label: "운영 시간", text: "평일 08:40~18:40 · 토 08:40~14:00" },
      { label: "주요 업무", text: "처방조제, 일반의약품 상담" },
      { label: "근무 형태", text: "소규모 팀 근무" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "5개",
      products: [],
      address: "충남 천안시 서북구 번영로 100 센트럴프라자 1층",
    },
  },
  {
    id: "hyundai-pharmacy",
    name: "현대약국",
    logoText: "현대",
    tagline: "약사 6명이 함께하는 100평 규모 대형 문전약국",
    tags: ["병의원 문전약국", "설립 2002.02.01"],
    coverImage: companyExampleImages.hero,
    fullIntro: "체계적으로 분업화된 대형 문전약국에서 조제 실무를 깊이 있게 쌓고 싶은 분께 적합합니다.",
    businessSummary: [
      // businessSummary의 기존 "규모" 서술("약사 6명·직원 15명이 근무")에 명시된 인원수를 그대로 이관
      { label: "근무 약사", value: "6명" },
      { label: "직원", value: "15명" },
    ],
    recruitSummary: "체계적으로 분업화된 대형 문전약국에서 조제 실무를 깊이 있게 쌓고 싶은 분께 적합합니다.",
    details: [{ label: "본사 위치", value: "경기 가림시 서천면 방독길 51 (방독리) 현대약국" }],
    keywords: ["문전약국", "대형약국", "처방조제", "팀 근무"],
    pharmacySoftware: "유팜",
    businessHours: "평일 09:00~19:00 · 토 09:00~15:00 · 일요일·공휴일 휴무",
    dispensingEquipment: ["전자동 정제 분류기(ATC)", "산제 자동 분포기", "조제 로봇 보조 시스템"],
    pharmacyFeatures: "mixed",
    features: [
      { label: "주요 업무", text: "병의원 처방조제, 복약지도, 일반의약품 상담" },
      { label: "근무 형태", text: "약사·직원 다인 팀 근무, 파트 분담" },
      { label: "규모 특성", text: "대량 처방을 처리하는 분업 체계" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "8개",
      products: [],
      address: "경기 가림시 서천면 방독길 51 (방독리) 현대약국",
    },
  },
  {
    id: "hwagok-gibeum-pharmacy",
    name: "화곡 기쁨약국",
    logoText: "기쁨",
    tagline: "화곡역 인근, 처방과 일반약을 함께 다루는 동네 약국",
    tags: ["일반약국", "설립 2021.02.02"],
    coverImage: companyExampleImages.hero,
    fullIntro: "역세권 약국에서 처방조제와 일반약 상담을 균형 있게 경험하고 싶은 분께 적합합니다.",
    businessSummary: [
      // businessSummary의 기존 "규모" 서술("약사 2명이 근무")에 명시된 인원수를 그대로 이관 — 직원 수는 서술에 없어 비움
      { label: "근무 약사", value: "2명" },
    ],
    recruitSummary: "역세권 약국에서 처방조제와 일반약 상담을 균형 있게 경험하고 싶은 분께 적합합니다.",
    details: [{ label: "본사 위치", value: "서울 강서구 화곡로 지하 168 (화곡동, 화곡역 5호선) 1층 약국" }],
    keywords: ["일반약국", "처방조제", "역세권"],
    pharmacySoftware: "PM+20",
    businessHours: "평일 09:00~20:00 · 토 09:00~16:00 · 일요일·공휴일 휴무",
    dispensingEquipment: ["자동 정제 분류기", "키오스크 접수 시스템"],
    pharmacyFeatures: "otc_focused",
    features: [
      { label: "운영 시간", text: "평일 09:00~20:00 · 토 09:00~16:00" },
      { label: "주요 업무", text: "처방조제, 일반의약품 상담, 접수 응대" },
      { label: "근무 형태", text: "약사 2인 중심 근무" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "6개",
      products: [],
      address: "서울 강서구 화곡로 지하 168 (화곡동, 화곡역 5호선) 1층 약국",
    },
  },
  {
    id: "hyeongang-pharmacy",
    name: "현강약국",
    logoText: "현강",
    tagline: "여러 진료과 처방을 아우르는 메디컬빌딩 문전약국",
    tags: ["병의원 문전약국", "설립 2015.06.01"],
    coverImage: companyExampleImages.hero,
    fullIntro: "여러 진료과 처방을 다루며 폭넓은 조제 경험을 쌓고 싶은 분께 적합합니다.",
    metrics: [
      // businessSummary의 기존 "처방 특성" 서술("내과·산부인과·외과 등 다양한 진료과 처방 응대")에서 진료과 목록만 이관
      { label: "주요 처방과", value: "내과·산부인과·외과 등" },
    ],
    businessSummary: [],
    recruitSummary: "여러 진료과 처방을 다루며 폭넓은 조제 경험을 쌓고 싶은 분께 적합합니다.",
    details: [{ label: "본사 위치", value: "전주 완주군 덕문로 5 현강약국" }],
    keywords: ["문전약국", "다과 처방", "처방조제"],
    pharmacySoftware: "PM+20",
    businessHours: "평일 09:00~19:00 · 토 09:00~14:00 · 일요일·공휴일 휴무",
    dispensingEquipment: ["전자동 정제 분류기(ATC)", "산제 자동 분포기"],
    pharmacyFeatures: "mixed",
    features: [
      { label: "주요 업무", text: "다진료과 처방조제, 복약지도, 일반의약품 상담" },
      { label: "처방 특성", text: "내과·산부인과·외과 등 진료과별 처방 대응" },
      { label: "근무 형태", text: "문전약국 팀 근무" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "6개",
      products: [],
      address: "전주 완주군 덕문로 5 현강약국",
    },
  },
  {
    id: "munmu-pharmacy",
    name: "문무약국",
    logoText: "문무",
    tagline: "내과 처방 중심의 ATC 조제 문전약국",
    tags: ["일반약국", "설립 2024.12.13"],
    coverImage: companyExampleImages.hero,
    fullIntro: "내과 처방과 ATC 조제 실무를 집중적으로 경험하고 싶은 분께 적합합니다.",
    metrics: [
      // businessSummary의 기존 "처방 특성" 서술("내과 처방 중심")에서 진료과만 이관
      { label: "주요 처방과", value: "내과" },
    ],
    businessSummary: [],
    recruitSummary: "내과 처방과 ATC 조제 실무를 집중적으로 경험하고 싶은 분께 적합합니다.",
    details: [{ label: "본사 위치", value: "경북 경주시 문무대왕면 어일3길 14-5 1층" }],
    keywords: ["문전약국", "내과 처방", "ATC 조제"],
    pharmacySoftware: "팜IT3000",
    businessHours: "평일 08:30~18:30 · 토요일 오전 · 일요일·공휴일 휴무",
    dispensingEquipment: ["전자동 정제 분류기(ATC)"],
    pharmacyFeatures: "mixed",
    features: [
      { label: "운영 시간", text: "평일 08:30~18:30" },
      { label: "주요 업무", text: "내과 처방조제, 복약지도" },
      { label: "조제 방식", text: "ATC 자동조제 중심" },
    ],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "4개",
      products: [],
      address: "경북 경주시 문무대왕면 어일3길 14-5 1층",
    },
  },
  {
    id: "yeongdong-365-pharmacy",
    name: "365열린영동약국",
    logoText: "영동",
    tagline: "연중무휴로 운영하는 영동읍 중심가 약국입니다.",
    tags: ["약국", "설립 2026.04"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "영동읍 중심가 중앙로 대로변 건물 1층에 자리한 약국입니다. 평일과 주말, 공휴일까지 연중 운영하며 처방 조제와 일반의약품 판매를 함께 합니다. 동물약국으로 정식 등록되어 동물용의약품도 취급합니다.",
    metrics: [],
    businessSummary: [],
    recruitSummary: "연중무휴로 운영하는 영동읍 중심가 약국입니다.",
    details: [
      { label: "본사 위치", value: "충북 영동군 영동읍 중앙로 29, 1층 102호" },
    ],
    keywords: ["연중무휴", "동물약국", "영동읍 중심가"],
    businessHours: "매일 08:30–20:30, 일요일 09:00–20:00",
    features: [
      { label: "근무 환경", text: "평일·주말·공휴일 연중 운영으로 근무 요일 협의 폭이 넓습니다." },
      { label: "동물약국", text: "정식 등록된 동물용의약품 취급 약국입니다." },
    ],
    pharmacyFeatures: "mixed",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "충북 영동군 영동읍 중앙로 29, 1층 102호",
    },
  },
  {
    id: "shin-jungang-pharmacy",
    name: "신중앙약국",
    logoText: "신중앙",
    tagline: "중앙대학교병원 정문 앞에서 자정까지 운영하는 문전 약국입니다.",
    tags: ["약국", "설립 2013.09"],
    coverImage: companyExampleImages.hero,
    fullIntro:
      "2013년 개국해 중앙대학교병원 정문 앞에서 운영 중인 약국입니다. 흑석역에서 도보 5분 거리로, 병원 처방 환자와 인근 대학생·직장인이 주로 찾습니다. 자정까지 운영하며 처방 조제와 일반의약품, 동물용의약품을 취급합니다.",
    metrics: [],
    businessSummary: [
      { label: "주요 처방 병원", value: "중앙대학교병원" },
    ],
    recruitSummary: "중앙대학교병원 정문 앞에서 자정까지 운영하는 문전 약국입니다.",
    details: [
      { label: "본사 위치", value: "서울 동작구 흑석로 103" },
    ],
    keywords: ["병원 문전", "심야 운영", "동물약국"],
    businessHours: "월–토 08:30–24:00, 일·공휴일 13:00–24:00",
    features: [
      { label: "심야 운영", text: "평일·토요일 자정까지 문을 엽니다." },
      { label: "병원 문전", text: "중앙대학교병원 정문 앞, 흑석역 도보 5분입니다." },
    ],
    pharmacyFeatures: "prescription_focused",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 동작구 흑석로 103",
    },
  },
  {
    id: "dentium",
    name: "(주)덴티움",
    logoText: "DENTIUM",
    logoImage: companyLogos["(주)덴티움"],
    tagline: "치과용 의료기기와 의료장비를 개발·제조하는 기업입니다.",
    tags: ["의료기기(코스피)", "사원수 501명 이상"],
    coverImage: companyExampleImages.hero,
    // 재무 슬롯(revenue/operatingProfit/rndRatio)은 확보된 데이터가 없어 비워둔다(STEP 2 정합성 정비)
    businessSummary: [
      { label: "주요 사업", value: "치과용 의료기기 · 의료장비 · 글로벌 인증" },
      { label: "대표 제품", value: "치과용 임플란트 · 의료장비" },
    ],
    recruitSummary:
      "덴티움은 치과용 임플란트를 중심으로 다양한 의료기기와 의료장비를 만들며, 국내외 인증과 인허가 대응 경험을 쌓아 왔습니다.",
    /** industryJobDetails.ts의 dentium-device-ra org.description과 동일 — 기업 정보 폼의 본문 소개 대응 */
    fullIntro:
      "덴티움은 치과용 임플란트를 중심으로 다양한 의료기기와 의료장비를 만들며, 국내외 인증과 인허가 대응 경험을 쌓아 왔습니다.",
    details: [
      { label: "대표자", value: null },
      { label: "본사 위치", value: "경기 용인시 처인구 양지읍 양지로138번길 14" },
      { label: "홈페이지", value: null },
      // 기관 유형·직원 수는 기존 metrics 항목(=industryJobDetails.ts org.orgType/employeeCount)과 동일 값을 details로 옮겼다
      { label: "기관 유형", value: "의료기기" },
      { label: "설립 연도", value: null },
      { label: "사업 분야", value: "치과용 의료기기 · 의료장비 · 글로벌 인증" },
      { label: "직원 수", value: "501명 이상" },
    ],
    keywords: ["의료기기", "치과용 임플란트", "글로벌 인증", "RA"],
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [
        { name: "치과용 임플란트", description: "국내외 치과 시장을 대상으로 임플란트 제품을 개발하고 제조합니다." },
        { name: "의료장비", description: "국가별 인증과 품질 기준에 맞춰 의료장비를 개발하고 인허가를 진행합니다." },
      ],
      address: "경기 용인시 처인구 양지읍 양지로138번길 14",
    },
  },
  // 아래 2건은 연구 트랙 Company 승격(STEP 4) — 값은 researchJobDetails.ts의 org를 전량 재사용한다.
  // labName/labIntro는 넣지 않는다: 연구실은 공고 단위 정보이고 이 프로필은 기관 단위 정보다.
  {
    id: "kist",
    name: "한국과학기술연구원(KIST)",
    logoText: "KIST",
    logoImage: companyLogos["한국과학기술연구원(KIST)"],
    tagline: "기초·응용 융합 연구를 수행하는 정부출연연구기관입니다.",
    tags: ["연구기관", "설립 1966년"],
    coverImage: companyExampleImages.research,
    fullIntro:
      "한국과학기술연구원(KIST)은 다양한 분야의 기초·응용 연구를 수행하는 정부출연연구기관입니다. 연구 그룹별로 독립적인 연구 주제를 운영하며, 공동 장비와 연구 지원 체계를 갖추고 있습니다.",
    businessSummary: [],
    recruitSummary: "기초·응용 융합 연구를 수행하는 정부출연연구기관입니다.",
    // phone/email: 창작하지 않고 비운다
    details: [
      { label: "설립 연도", value: "1966년" },
      { label: "본사 위치", value: "서울 성북구 화랑로14길 5" },
      { label: "홈페이지", value: "www.kist.re.kr" },
    ],
    keywords: ["정부출연연구기관", "뇌과학연구소", "융합연구"],
    institutionTypeId: "government_research_institute",
    staffScaleId: "51_100",
    researchFields: ["neuroscience", "disease-model"],
    equipmentInfra:
      "연구 그룹 단위의 실험 공간과 공동 기기실을 운영하며, 실험 장비와 분석 인프라를 공동으로 활용할 수 있습니다.",
    achievements: "국내외 학술지 논문 발표와 국가 연구 과제 수행을 지속하고 있습니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 성북구 화랑로14길 5",
    },
  },
  {
    id: "seoul-asan-hospital",
    name: "서울아산병원",
    logoText: "아산",
    logoImage: companyLogos["서울아산병원"],
    tagline: "임상과 연계한 의학 연구를 수행하는 병원 연구소입니다.",
    tags: ["연구기관", "설립 1989년"],
    coverImage: companyExampleImages.research,
    fullIntro:
      "서울아산병원 대장항문외과 연구실은 임상 데이터와 연계한 의학 연구를 수행합니다. 임상의와 연구원이 협업하는 구조로, 연구 주제에 따라 실험 연구와 데이터 분석을 함께 진행합니다.",
    businessSummary: [],
    recruitSummary: "임상과 연계한 의학 연구를 수행하는 병원 연구소입니다.",
    // phone/email: 창작하지 않고 비운다
    details: [
      { label: "설립 연도", value: "1989년" },
      { label: "본사 위치", value: "서울 송파구 올림픽로43길 88" },
      { label: "홈페이지", value: "www.amc.seoul.kr" },
    ],
    keywords: ["상급종합병원", "대장항문외과", "임상연계연구"],
    institutionTypeId: "hospital_research_institute",
    staffScaleId: "under_10",
    researchFields: ["cancer-biology", "organoid", "translational-research"],
    equipmentInfra: "병원 내 연구 공간에서 근무하며, 원내 공동 연구 장비와 임상 연구 지원 부서를 활용할 수 있습니다.",
    // achievements: 없음 — researchJobDetails.ts org에도 값이 없어 행 숨김 검증 케이스
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "서울 송파구 올림픽로43길 88",
    },
  },
  {
    id: "kbri",
    name: "한국뇌연구원",
    logoText: "KBRI",
    logoImage: companyLogos["한국뇌연구원"],
    tagline: "뇌연구촉진법에 따라 설립된 국가 뇌연구 거점 정부출연연구기관입니다.",
    tags: ["연구기관", "설립 2011년"],
    coverImage: companyExampleImages.research,
    fullIntro:
      "과학기술정보통신부 산하 정부출연연구기관으로, 기초 뇌과학부터 뇌질환 중개연구까지 35개 이상의 독립 연구그룹이 활동하고 있습니다. 한국뇌은행과 공동 연구 인프라를 운영하며 DGIST 등 협력 대학과 학연 프로그램을 두고 있습니다.",
    businessSummary: [],
    recruitSummary: "뇌연구촉진법에 따라 설립된 국가 뇌연구 거점 정부출연연구기관입니다.",
    details: [
      { label: "설립 연도", value: "2011년" },
      { label: "본사 위치", value: "대구 동구 첨단로 61" },
      { label: "홈페이지", value: "www.kbri.re.kr" },
    ],
    keywords: ["정부출연연구기관", "뇌과학", "중개연구"],
    institutionTypeId: "government_research_institute",
    staffScaleId: "over_100",
    researchFields: ["neuroscience", "translational-research"],
    equipmentInfra:
      "한국뇌은행, 뇌영상·전기생리 장비센터, 실험동물센터, 뇌데이터센터를 공동 연구 인프라로 운영합니다.",
    achievements: "기초·중개 뇌연구 분야의 학술 성과와 국가 연구개발 과제를 지속 수행하고 있습니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "대구 동구 첨단로 61",
    },
  },
  {
    id: "kangwon-univ-natural-product",
    name: "강원대학교 천연물의약합성 연구실",
    logoText: "강원대",
    logoImage: companyLogos["강원대학교 천연물의약합성 연구실"],
    tagline: "천연물 유래 의약 후보물질과 촉매 합성법을 연구하는 대학 연구실입니다.",
    tags: ["연구기관", "대학 연구실"],
    coverImage: companyExampleImages.research,
    fullIntro:
      "강원대학교 춘천캠퍼스의 유기합성 연구실로, 전이금속 촉매를 이용한 효율적 합성법 개발과 천연물 유래 생리활성물질 연구를 수행합니다. 학내 벤처기업과 연계해 기초연구와 응용연구를 병행하고 있습니다.",
    businessSummary: [],
    recruitSummary: "천연물 유래 의약 후보물질과 촉매 합성법을 연구하는 대학 연구실입니다.",
    details: [
      { label: "본사 위치", value: "강원 춘천시 강원대학길 1 의생명과학관" },
      { label: "홈페이지", value: "bismuth.kangwon.ac.kr" },
    ],
    keywords: ["유기합성", "천연물화학", "의약화학"],
    institutionTypeId: "university_lab",
    staffScaleId: "10_30",
    researchFields: ["medicinal-chemistry"],
    equipmentInfra:
      "유기합성 실험 공간과 HPLC 등 분리·분석 장비를 갖추고 있으며, 학내 공동기기 인프라를 활용합니다.",
    achievements: "촉매 기반 합성 방법론과 천연물 유도체 관련 연구 논문을 발표하고 있습니다.",
    news: [],
    sidebar: {
      interestedCount: "-",
      reviewKeywordCount: "-",
      products: [],
      address: "강원 춘천시 강원대학길 1 의생명과학관",
    },
  },
];

export function getCompanyProfile(companyId: string) {
  return companyProfiles.find((company) => company.id === companyId);
}
