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

export interface InsightJobWikiEntry {
  code: string;
  title: string;
  englishLabel: string;
  description: string;
  jobSubcategoryId: string;
  thumbnail: string;
}

export const insightCategories: InsightCategory[] = [
  "전체",
  "현직자 인터뷰",
  "산업 인사이트",
  "기업 이야기",
  "데이터 인사이트",
  "직무백과",
  "취업·이직 가이드",
];

export const insightCategoryMeta: Record<Exclude<InsightCategory, "전체">, { eyebrow: string; description: string }> = {
  "현직자 인터뷰": { eyebrow: "IN THEIR WORDS", description: "현장에서 일하는 사람들의 언어로 듣는 직무와 커리어." },
  "산업 인사이트": { eyebrow: "INDUSTRY", description: "채용 시장의 무게중심이 어디로 움직이는지 데이터로 짚습니다." },
  "기업 이야기": { eyebrow: "COMPANIES", description: "물질에서 시장까지, 기업과 그 안의 사람들 이야기." },
  "데이터 인사이트": { eyebrow: "DATA", description: "공시·공고·설문으로 읽는 제약·바이오 노동시장." },
  직무백과: { eyebrow: "JOB WIKI", description: "RA·QA·CRA·임상 PM까지, 직무가 하는 일을 한 장으로 정리합니다." },
  "취업·이직 가이드": { eyebrow: "CAREER", description: "전환·면접·이력서 — 다음 선택에 필요한 실전 가이드." },
};

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
    thumbnail: companyExampleImages.hero,
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
    thumbnail: companyExampleImages.workspace,
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
    title: "이력서에 쓸 게 없다면 — 직무 경험 정리법",
    description: "부족한 경험을 구조화하는 법",
    date: "2026.06.05",
    tags: ["이력서", "경험", "정리"],
    views: 870,
    thumbnail: companyExampleImages.lab,
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
    thumbnail: companyExampleImages.meeting,
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
    thumbnail: companyExampleImages.office,
  },
  // 현직자 인터뷰
  {
    id: "ra-pharmacist-cra",
    slug: "pharmacist-nurse-to-cra",
    category: "현직자 인터뷰",
    title: "약사·간호사에서 CRA로, 임상 현장으로 건너간 사람들",
    description: "전공의 벽을 넘어 임상시험 모니터링으로 직무를 옮긴 세 사람의 전환 과정과 현실.",
    date: "2026.06.18",
    tags: ["CRA", "커리어전환", "임상"],
    views: 1500,
    thumbnail: companyExampleImages.research,
  },
  {
    id: "ra-5year-daily",
    slug: "ra-5year-daily",
    category: "현직자 인터뷰",
    title: "신제품이 시장에 나갈 길을 만든다 — RA 5년차의 하루",
    description: "허가의 최전선에서 일하는 RA 스페셜리스트의 업무 흐름을 따라가 봤습니다.",
    date: "2026.06.14",
    tags: ["RA", "허가", "일과"],
    views: 1100,
    thumbnail: companyExampleImages.primary,
  },
  {
    id: "qa-manager-system",
    slug: "qa-manager-system-and-usable",
    category: "현직자 인터뷰",
    title: "제도가 있는 것과 쓸 수 있는 것은 다릅니다 — QA 매니저",
    description: "품질보증 현장에서 기준을 세우고 지키는 일의 무게.",
    date: "2026.06.10",
    tags: ["QA", "품질", "조직문화"],
    views: 980,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "nonclinical-to-medical-writer",
    slug: "nonclinical-to-medical-writer",
    category: "현직자 인터뷰",
    title: "비임상 연구원에서 메디컬 라이터로",
    description: "데이터를 정확한 글로 옮기는 직무로 건너간 이유.",
    date: "2026.06.06",
    tags: ["메디컬라이팅", "비임상"],
    views: 870,
    thumbnail: companyExampleImages.workspace,
  },
  {
    id: "factory-to-hq-12years",
    slug: "factory-to-hq-12years",
    category: "현직자 인터뷰",
    title: "공장에서 본사로, 생산기술 12년의 기록",
    description: "현장을 아는 사람이 가진 강점에 대하여.",
    date: "2026.06.02",
    tags: ["생산기술", "커리어"],
    views: 760,
    thumbnail: companyExampleImages.culture,
  },
  {
    id: "clinical-pm-weight",
    slug: "clinical-pm-weight-of-project",
    category: "현직자 인터뷰",
    title: "임상 PM이 말하는 프로젝트의 무게",
    description: "일정과 사람을 동시에 끌고 가는 자리.",
    date: "2026.05.29",
    tags: ["임상PM", "프로젝트"],
    views: 690,
    thumbnail: companyExampleImages.lab,
  },
  // 산업 인사이트
  {
    id: "factory-qc-qa",
    slug: "factory-qc-qa-hiring",
    category: "산업 인사이트",
    title: "신공장 증설이 QC·QA 채용에 미치는 영향",
    description: "설비 투자가 인력 수요로 이어지는 경로.",
    date: "2026.06.18",
    tags: ["QC", "QA", "증설"],
    views: 1800,
    thumbnail: companyExampleImages.meeting,
  },
  {
    id: "cro-cra-market",
    slug: "cro-cra-market",
    category: "산업 인사이트",
    title: "CRO 시장 성장과 CRA 채용 전망",
    description: "위탁 연구의 확대가 만드는 일자리.",
    date: "2026.06.16",
    tags: ["CRO", "CRA", "전망"],
    views: 1200,
    thumbnail: companyExampleImages.office,
  },
  {
    id: "approval-ra-pv-demand",
    slug: "approval-ra-pv-demand",
    category: "산업 인사이트",
    title: "신약 허가 이후 RA·PV 직무 수요는 어떻게 변하나",
    description: "허가 이후 안전성 관리와 글로벌 규제 대응 인력이 왜 중요해지는지 살펴봅니다.",
    date: "2026.06.17",
    tags: ["RA", "PV", "인허가"],
    views: 1500,
    thumbnail: companyExampleImages.research,
  },
  {
    id: "cdmo-expansion-production",
    slug: "cdmo-expansion-production-jobs",
    category: "산업 인사이트",
    title: "CDMO 확장기, 생산·공정 직무가 늘어나는 이유",
    description: "위탁생산 수요와 인력 구조의 변화.",
    date: "2026.06.12",
    tags: ["CDMO", "생산", "공정"],
    views: 1000,
    thumbnail: companyExampleImages.primary,
  },
  {
    id: "adc-pipeline-demand",
    slug: "adc-pipeline-analysis-quality-demand",
    category: "산업 인사이트",
    title: "ADC 파이프라인 확대와 분석·품질 인력 수요",
    description: "항체·약물 접합체가 바꾸는 직무 지형.",
    date: "2026.06.08",
    tags: ["ADC", "품질", "분석"],
    views: 920,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "obesity-drug-sales-marketing",
    slug: "obesity-drug-sales-marketing-hiring",
    category: "산업 인사이트",
    title: "비만치료제 열풍이 바꾸는 영업·마케팅 채용",
    description: "GLP-1 시대의 상업화 인력.",
    date: "2026.06.04",
    tags: ["비만치료제", "영업", "마케팅"],
    views: 880,
    thumbnail: companyExampleImages.workspace,
  },
  // 기업 이야기
  {
    id: "ra-org-build",
    slug: "how-thepharmin-pharma-builds-ra-org",
    category: "기업 이야기",
    title: "더팜인제약이 RA 조직을 키우는 방식",
    description: "허가 역량을 내재화하는 회사의 선택.",
    date: "2026.06.11",
    tags: ["RA", "조직", "기업문화"],
    views: 940,
    thumbnail: companyExampleImages.culture,
  },
  {
    id: "biotech-first-quality-system",
    slug: "biotech-first-quality-system",
    category: "기업 이야기",
    title: "바이오 벤처의 첫 품질 시스템, 0에서 1까지",
    description: "작은 조직이 GMP를 세우는 과정.",
    date: "2026.06.07",
    tags: ["바이오벤처", "GMP", "품질"],
    views: 810,
    thumbnail: companyExampleImages.lab,
  },
  {
    id: "global-cdmo-path",
    slug: "global-cdmo-path-company-choice",
    category: "기업 이야기",
    title: "글로벌 CDMO로 가는 길 — OO바이오의 선택",
    description: "위탁생산 전환의 전략과 사람.",
    date: "2026.06.03",
    tags: ["CDMO", "전환", "전략"],
    views: 720,
    thumbnail: companyExampleImages.meeting,
  },
  {
    id: "lab-learning-culture",
    slug: "lab-started-internal-learning-culture",
    category: "기업 이야기",
    title: "연구소에서 시작된 사내 학습 문화",
    description: "논문을 함께 읽는 조직의 힘.",
    date: "2026.05.30",
    tags: ["R&D", "학습", "문화"],
    views: 650,
    thumbnail: companyExampleImages.office,
  },
  // 데이터 인사이트
  {
    id: "job-posting-trend-1year",
    slug: "job-category-posting-trend-1year",
    category: "데이터 인사이트",
    title: "직무별 채용 공고, 1년간 어떻게 움직였나",
    description: "RA·QA·CRA·PV 공고 추이 분석.",
    date: "2026.06.13",
    tags: ["공고추이", "직무", "데이터"],
    views: 1100,
    thumbnail: companyExampleImages.research,
  },
  {
    id: "job-change-survey-200",
    slug: "pharma-job-change-survey-200",
    category: "데이터 인사이트",
    title: "제약·바이오 이직자 200명, 무엇을 보고 옮겼나",
    description: "설문으로 본 이직 동인.",
    date: "2026.06.09",
    tags: ["이직", "설문", "동인"],
    views: 990,
    thumbnail: companyExampleImages.primary,
  },
  {
    id: "entry-job-required-skills",
    slug: "entry-job-most-required-skills",
    category: "데이터 인사이트",
    title: "신입 채용 공고에서 가장 많이 요구된 역량",
    description: "공고 텍스트 분석으로 본 키워드.",
    date: "2026.06.05",
    tags: ["신입", "역량", "분석"],
    views: 840,
    thumbnail: companyExampleImages.hero,
  },
  {
    id: "region-job-distribution",
    slug: "regional-pharma-job-distribution",
    category: "데이터 인사이트",
    title: "지역별 제약·바이오 일자리 분포",
    description: "수도권·충청·호남의 채용 지형.",
    date: "2026.06.01",
    tags: ["지역", "일자리", "분포"],
    views: 700,
    thumbnail: companyExampleImages.workspace,
  },
  // 취업·이직 가이드
  {
    id: "nonclinical-to-clinical-reality",
    slug: "nonclinical-to-clinical-job-change-reality",
    category: "취업·이직 가이드",
    title: "비임상에서 임상으로: 직무 이동의 현실",
    description: "전환 가능성과 준비해야 할 것들.",
    date: "2026.06.14",
    tags: ["직무전환", "임상", "가이드"],
    views: 910,
    thumbnail: companyExampleImages.culture,
  },
  {
    id: "ra-interview-questions",
    slug: "ra-interview-frequent-questions",
    category: "취업·이직 가이드",
    title: "제약 RA 면접에서 자주 나오는 질문",
    description: "허가 사례 중심의 면접 대비.",
    date: "2026.06.09",
    tags: ["RA", "면접", "질문"],
    views: 1000,
    thumbnail: companyExampleImages.lab,
  },
  {
    id: "first-job-roadmap",
    slug: "pharma-first-job-roadmap",
    category: "취업·이직 가이드",
    title: "제약·바이오 신입, 무엇부터 준비할까",
    description: "자격·인턴·포트폴리오 로드맵.",
    date: "2026.06.01",
    tags: ["신입", "준비", "로드맵"],
    views: 800,
    thumbnail: companyExampleImages.meeting,
  },
  {
    id: "salary-negotiation-standard",
    slug: "salary-negotiation-industry-standard",
    category: "취업·이직 가이드",
    title: "연봉 협상 전 알아야 할 산업 기준",
    description: "직무·연차별 범위 읽기.",
    date: "2026.05.27",
    tags: ["연봉", "협상", "기준"],
    views: 740,
    thumbnail: companyExampleImages.office,
  },
];

export const featuredInsightIds = [
  "salary-tenure-map",
  "cra-career-change",
  "pharma-trend-2026",
  "global-pharma-people",
];

export const newsLinkedInsightIds = ["factory-qc-qa", "approval-ra-pv-demand", "cro-cra-market"];

export const insightDataCards: InsightDataCard[] = [
  { label: "평균 연봉", value: "8,640만원", change: "+4.2%", caption: "전년 대비" },
  { label: "평균 근속연수", value: "7.2년", change: "+0.3년", caption: "전년 대비" },
  { label: "육아휴직 사용률", value: "42.3%", change: "+5.1%", caption: "전년 대비" },
  { label: "채용 공고 수", value: "1,245건", change: "+12.7%", caption: "전주 대비" },
];

export const insightJobWikiEntries: InsightJobWikiEntry[] = [
  { code: "RA", title: "인허가", englishLabel: "Regulatory Affairs", description: "허가 전략부터 CTD 제출까지, 규제 대응의 중심.", jobSubcategoryId: "ra", thumbnail: companyExampleImages.research },
  { code: "QA", title: "품질보증", englishLabel: "Quality Assurance", description: "GMP 체계를 세우고 지키는 품질의 최종 책임.", jobSubcategoryId: "qa", thumbnail: companyExampleImages.primary },
  { code: "QC", title: "품질관리", englishLabel: "Quality Control", description: "원료부터 완제품까지 시험으로 품질을 증명.", jobSubcategoryId: "qc", thumbnail: companyExampleImages.hero },
  { code: "CRA", title: "임상 모니터링", englishLabel: "Clinical Research Associate", description: "임상시험 현장을 점검하고 데이터 신뢰성을 지킨다.", jobSubcategoryId: "cra", thumbnail: companyExampleImages.workspace },
  { code: "PV", title: "약물감시", englishLabel: "Pharmacovigilance", description: "시판 후 안전성 정보를 수집·평가·보고한다.", jobSubcategoryId: "pv-drug-safety", thumbnail: companyExampleImages.culture },
  { code: "PM", title: "임상 프로젝트 관리", englishLabel: "Clinical Project Manager", description: "일정·예산·사람을 묶어 임상을 끌고 간다.", jobSubcategoryId: "clinical-pm", thumbnail: companyExampleImages.lab },
  { code: "CMC", title: "제조·품질 연계", englishLabel: "Chemistry, Manufacturing & Controls", description: "물질·공정·규격을 문서로 연결하는 기술 허브.", jobSubcategoryId: "cmc-ra", thumbnail: companyExampleImages.meeting },
  { code: "MW", title: "메디컬 라이팅", englishLabel: "Medical Writer", description: "데이터를 규제·학술 문서로 정확히 옮긴다.", jobSubcategoryId: "medical-writing", thumbnail: companyExampleImages.office },
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
