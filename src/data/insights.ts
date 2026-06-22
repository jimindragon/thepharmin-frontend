import { companyExampleImages } from "@/config/companyImages";

export type InsightCategory =
  | "전체"
  | "직무백과"
  | "현직자 인터뷰"
  | "산업 인사이트"
  | "기업 이야기"
  | "취업·이직 가이드"
  | "데이터 인사이트";

export interface InsightArticle {
  id: string;
  slug: string;
  category: Exclude<InsightCategory, "전체">;
  title: string;
  description: string;
  date: string;
  tags: string[];
  views: number;
  thumbnail: string;
  imageTone?: "dark" | "light";
}

export interface InsightDataCard {
  label: string;
  value: string;
  change: string;
  caption: string;
}

export interface InsightChartPoint {
  company: string;
  salary: number;
  tenure: number;
  revenueSize: "1조원 이상" | "5천억~1조원" | "1천억~5천억" | "1천억 미만";
}

export interface InsightSalaryTableRow {
  revenueSize: string;
  averageSalary: string;
  averageTenure: string;
  companyCount: number;
}

export const insightCategories: InsightCategory[] = [
  "전체",
  "직무백과",
  "현직자 인터뷰",
  "산업 인사이트",
  "기업 이야기",
  "취업·이직 가이드",
  "데이터 인사이트",
];

export const insights: InsightArticle[] = [
  {
    id: "salary-tenure-map",
    slug: "pharma-salary-tenure-map",
    category: "데이터 인사이트",
    title: "제약바이오 기업 연봉·근속 연차 매핑",
    description: "DART 사업보고서 기반 상장 제약바이오 기업 30곳 분석",
    date: "2026.06.20",
    tags: ["DART", "평균연봉", "평균근속"],
    views: 1800,
    thumbnail: companyExampleImages.primary,
  },
  {
    id: "cra-career-change",
    slug: "cra-career-change",
    category: "현직자 인터뷰",
    title: "CRA로 커리어 전환, 현실과 성장의 이야기",
    description: "약사·간호사·생명과학 전공자가 CRA로 이동하는 과정",
    date: "2026.06.18",
    tags: ["CRA", "커리어전환"],
    views: 1240,
    thumbnail: companyExampleImages.workspace,
  },
  {
    id: "pharma-trend-2026",
    slug: "pharma-trend-2026",
    category: "산업 인사이트",
    title: "2026 제약바이오 산업 5대 트렌드 전망",
    description: "ADC, CGT, 비만치료제, CDMO, CRO 트렌드가 채용시장에 미치는 영향",
    date: "2026.06.17",
    tags: ["산업트렌드", "채용전망"],
    views: 1530,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "global-pharma-people",
    slug: "global-pharma-people",
    category: "기업 이야기",
    title: "글로벌 무대에서 성장하는 OO제약 사람들",
    description: "해외 인허가, 사업개발, 품질 협업을 만드는 현장의 이야기",
    date: "2026.06.16",
    tags: ["글로벌", "기업문화"],
    views: 980,
    thumbnail: companyExampleImages.culture,
  },
  {
    id: "pharma-resume-guide",
    slug: "pharma-resume-guide",
    category: "취업·이직 가이드",
    title: "제약바이오 이력서 작성 핵심 체크리스트",
    description: "직무별 경험을 데이터와 근거 중심으로 정리하는 방법",
    date: "2026.06.19",
    tags: ["이력서", "이직"],
    views: 1200,
    thumbnail: companyExampleImages.workspace,
  },
  {
    id: "research-org-career",
    slug: "research-org-career",
    category: "직무백과",
    title: "연구개발 조직문화는 어떻게 다를까",
    description: "기업 연구소, 공공 연구기관, 병원 연구센터의 일하는 방식 비교",
    date: "2026.06.18",
    tags: ["R&D", "조직문화"],
    views: 890,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "pv-day",
    slug: "pv-day",
    category: "현직자 인터뷰",
    title: "PV 담당자는 어떤 하루를 보낼까",
    description: "안전성 정보 관리와 규제 대응 업무를 현직자의 언어로 정리했습니다.",
    date: "2026.06.16",
    tags: ["PV", "커리어"],
    views: 760,
    thumbnail: companyExampleImages.primary,
  },
];

export const featuredInsightIds = [
  "salary-tenure-map",
  "cra-career-change",
  "pharma-trend-2026",
  "global-pharma-people",
];

export const insightDataCards: InsightDataCard[] = [
  { label: "평균 연봉", value: "8,640만원", change: "+4.2%", caption: "전년 대비" },
  { label: "평균 근속연수", value: "7.2년", change: "+0.3년", caption: "전년 대비" },
  { label: "육아휴직 사용률", value: "42.3%", change: "+5.1%", caption: "전년 대비" },
  { label: "채용 공고 수", value: "1,245건", change: "+12.7%", caption: "전주 대비" },
];

export const newsLinkedInsights: InsightArticle[] = [
  {
    id: "factory-qc-qa",
    slug: "factory-qc-qa-hiring",
    category: "산업 인사이트",
    title: "신공장 증설이 QC·QA 채용에 미치는 영향",
    description: "생산설비 투자 이후 품질관리, 밸리데이션, 공정개발 직무 수요를 해석했습니다.",
    date: "2026.06.15",
    tags: ["QC", "QA", "생산"],
    views: 1020,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "approval-ra-pv",
    slug: "approval-ra-pv-demand",
    category: "산업 인사이트",
    title: "신약 허가 이후 RA·PV 직무 수요 변화",
    description: "허가 이후 안전성 관리와 글로벌 규제 대응 인력이 왜 중요해지는지 살펴봅니다.",
    date: "2026.06.13",
    tags: ["RA", "PV", "인허가"],
    views: 1320,
    thumbnail: companyExampleImages.primary,
  },
  {
    id: "cro-cra-market",
    slug: "cro-cra-market",
    category: "산업 인사이트",
    title: "CRO 시장 성장과 CRA 채용 전망",
    description: "임상개발 외주화 확대가 CRA, PM, DM 직무에 미치는 변화를 정리했습니다.",
    date: "2026.06.12",
    tags: ["CRO", "CRA", "임상"],
    views: 1110,
    thumbnail: companyExampleImages.workspace,
  },
];

export const salaryTenureChartPoints: InsightChartPoint[] = [
  { company: "A사", salary: 13200, tenure: 18.8, revenueSize: "1조원 이상" },
  { company: "B사", salary: 11850, tenure: 16.2, revenueSize: "1조원 이상" },
  { company: "C사", salary: 9800, tenure: 12.5, revenueSize: "5천억~1조원" },
  { company: "D사", salary: 9200, tenure: 9.8, revenueSize: "5천억~1조원" },
  { company: "E사", salary: 8600, tenure: 7.2, revenueSize: "1천억~5천억" },
  { company: "F사", salary: 7400, tenure: 6.1, revenueSize: "1천억~5천억" },
  { company: "G사", salary: 6900, tenure: 4.8, revenueSize: "1천억~5천억" },
  { company: "H사", salary: 5600, tenure: 3.5, revenueSize: "1천억 미만" },
  { company: "I사", salary: 5100, tenure: 2.9, revenueSize: "1천억 미만" },
  { company: "J사", salary: 10800, tenure: 14.8, revenueSize: "5천억~1조원" },
  { company: "K사", salary: 6400, tenure: 8.1, revenueSize: "1천억~5천억" },
  { company: "L사", salary: 7800, tenure: 10.2, revenueSize: "1천억~5천억" },
  { company: "M사", salary: 12400, tenure: 19.6, revenueSize: "1조원 이상" },
  { company: "N사", salary: 8350, tenure: 11.5, revenueSize: "5천억~1조원" },
  { company: "O사", salary: 4300, tenure: 2.2, revenueSize: "1천억 미만" },
  { company: "P사", salary: 7100, tenure: 13.4, revenueSize: "1천억~5천억" },
  { company: "Q사", salary: 9450, tenure: 17.3, revenueSize: "5천억~1조원" },
  { company: "R사", salary: 5750, tenure: 5.8, revenueSize: "1천억 미만" },
  { company: "S사", salary: 11200, tenure: 20.1, revenueSize: "1조원 이상" },
  { company: "T사", salary: 6850, tenure: 9.4, revenueSize: "1천억~5천억" },
];

export const salaryTenureTableRows: InsightSalaryTableRow[] = [
  { revenueSize: "1조원 이상", averageSalary: "11,892", averageTenure: "9.8", companyCount: 8 },
  { revenueSize: "5천억~1조원", averageSalary: "9,276", averageTenure: "7.1", companyCount: 9 },
  { revenueSize: "1천억~5천억", averageSalary: "7,081", averageTenure: "6.2", companyCount: 9 },
  { revenueSize: "1천억 미만", averageSalary: "5,432", averageTenure: "4.3", companyCount: 4 },
  { revenueSize: "전체 평균", averageSalary: "8,640", averageTenure: "7.2", companyCount: 30 },
];

export const salaryInsightSummary = [
  "평균 연봉과 평균 근속연수는 기업 규모, R&D 비중, 글로벌 매출 비중에 따라 뚜렷한 차이를 보였습니다.",
  "상위권 그룹은 글로벌 매출 비중이 높고, 근속연수도 평균보다 긴 경향이 나타났습니다.",
  "본 분석은 2024년 사업보고서 기준이며, 기업별 공시 기준 차이를 고려해야 합니다.",
];

export const insightRelatedJobIds = [101, 102, 103, 104];
