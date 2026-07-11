export type IndustryNewsCategory = "기업뉴스" | "산업뉴스";

export interface IndustryNewsItem {
  id: string;
  category: IndustryNewsCategory;
  date: string;
  source: "더파마뉴스";
  title: string;
  summary: string;
  imageUrl?: string;  // 기사 썸네일 (현재 미지정, 나중에 채움)
  url: string;
}

// 기업별 직접 기사 (companyId → 기업뉴스)
export const companyNewsByCompanyId: Record<string, IndustryNewsItem[]> = {
  "samsung-biologics": [
    {
      id: "news-sbl-capacity-eu",
      category: "기업뉴스",
      date: "2026.06.24",
      source: "더파마뉴스",
      title: "삼성바이오로직스, '132만5000L' 생산능력 확보 및 유럽 거점 확대",
      summary: "삼성바이오로직스, 네덜란드 세일즈 오피스 신설 통한 글로벌 영업망 강화",
      url: "https://thepharmanews.net/article/samsungbiologics-cdmo-adc-mqrsz7w8",
    },
    {
      id: "news-sbl-labor-union",
      category: "기업뉴스",
      date: "2026.06.11",
      source: "더파마뉴스",
      title: "\"연대는 끝났다\"…삼성바이오 노조, 초기업노조 탈퇴 승부수",
      summary: "노사 양측 법적 대응 통한 대치 국면 심화",
      url: "https://thepharmanews.net/article/samsungbiologics-labordispute-cdmo-mq8r9am9",
    },
    {
      id: "news-sbl-q1-earnings",
      category: "기업뉴스",
      date: "2026.04.22",
      source: "더파마뉴스",
      title: "삼성바이오로직스, 1분기 영업이익 '5808억'... 전년비 35% 급증",
      summary: "삼성바이오로직스, 1분기 매출 1조2571억원 달성... 1~4공장 풀가동 효과",
      url: "https://thepharmanews.net/article/samsungbiologics-cdmo-earnings",
    },
    {
      id: "news-sbl-aacr-crdmo",
      category: "기업뉴스",
      date: "2026.04.20",
      source: "더파마뉴스",
      title: "삼성바이오로직스, AACR서 '초기 단계' CRDMO 플랫폼 경쟁력 강화",
      summary: "삼성바이오로직스, AACR 최초 참가 통한 조기 록인 전략 가동",
      url: "https://thepharmanews.net/article/samsungbiologics-crdmo-aacr",
    },
  ],
};

// 직접 기사 없을 때 fallback (산업뉴스 공통 풀)
export const industryFallbackNews: IndustryNewsItem[] = [
  {
    id: "news-ind-peptron-glp1",
    category: "산업뉴스",
    date: "2026.07.10",
    source: "더파마뉴스",
    title: "펩트론, '마운자로 제외' 발언에 주가 하한가…\"공동연구 축소·중단 아니다\"",
    summary: "최호일 대표 \"터제파타이드 포함되지 않아\" 발언 보도 후 투자심리 급랭",
    url: "https://thepharmanews.net/article/peptron-stock-plunges-global-pharma-collaboration-clarification?from=pharma-bio",
  },
  {
    id: "news-ind-astrazeneca-tqc",
    category: "산업뉴스",
    date: "2026.07.10",
    source: "더파마뉴스",
    title: "아스트라제네카, 시노바이오와 최대 21억달러 규모 TQC3721 기술이전 계약",
    summary: "임상 2상서 폐 기능 최대 147mL 개선…중국에서는 임상 3상 진행",
    url: "https://thepharmanews.net/article/astrazeneca-sino-copd-tqc3721-merck-ohtuvayre-2-1b-deal?from=pharma-bio",
  },
  {
    id: "news-ind-gcbiopharma-cmo",
    category: "산업뉴스",
    date: "2026.07.10",
    source: "더파마뉴스",
    title: "GC녹십자, 한국백신과 '백신 CMO' 협력... 공급망 리스크 분산",
    summary: "GC녹십자, 한국백신과 프리필드시린지 CMO 사업 협약 체결",
    url: "https://thepharmanews.net/article/gcbiopharma-cmo-gcflu-mre6iqhq?from=pharma-bio",
  },
  {
    id: "news-ind-glp1-china",
    category: "산업뉴스",
    date: "2026.07.08",
    source: "더파마뉴스",
    title: "먹는 GLP-1 중국 3상 성공…체중 9.8% 줄였지만 구토 68.6%",
    summary: "비만 임상 3상서 44주 체중 최대 9.8% 감소…중국 허가 신청 추진",
    url: "https://thepharmanews.net/article/hengrui-hrs-7535-obesity-mrauihgh",
  },
];

// 조회: companyId로 직접 기사 있으면 그것(기업뉴스), 없으면 fallback(산업뉴스)
export function getIndustryNews(companyId: string | null): IndustryNewsItem[] {
  if (companyId && companyNewsByCompanyId[companyId]?.length) {
    return companyNewsByCompanyId[companyId];
  }
  return industryFallbackNews;
}

// 직접 기사 유무 판별 (렌더에서 fallback 안내 문구 표시용)
export function hasDirectCompanyNews(companyId: string | null): boolean {
  return !!(companyId && companyNewsByCompanyId[companyId]?.length);
}
