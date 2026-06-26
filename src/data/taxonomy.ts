import type { ThemeId } from "@/types/jobs";

export type ThemeVariant = "company" | "job";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  subtitle: string;
  description: string;
  variant: ThemeVariant;
  /** "이 채용관의 기업" 섹션 배경에 사용할 기존 이미지 경로 */
  thumbnail: string;
  /** 직무형(T5~T9)에서 노출할 관련 키워드 칩 */
  keywords?: string[];
}

export const THEME_META: Record<ThemeId, ThemeMeta> = {
  T1: {
    id: "T1",
    label: "글로벌 빅파마 한국법인",
    subtitle: "외국계 제약·바이오 한국법인",
    description:
      "한국에 진출한 글로벌 제약·바이오 기업의 채용을 한곳에 모았습니다. 영어 환경과 체계적인 글로벌 시스템 안에서 커리어를 쌓고 싶은 분께 맞는 포지션입니다.",
    variant: "company",
    thumbnail: "/images/company/company_pic_example_2.jpg",
  },
  T2: {
    id: "T2",
    label: "누구나 아는 대형 제약사",
    subtitle: "국내 대표 제약기업",
    description:
      "누구나 이름을 아는 국내 대형 제약사들의 채용 공고입니다. 안정적이고 검증된 기업 문화 속에서 성장 가능한 포지션을 모았습니다.",
    variant: "company",
    thumbnail: "/images/company/company_pic_example_3.jpg",
  },
  T3: {
    id: "T3",
    label: "바이오 생산 강자",
    subtitle: "CDMO·바이오 생산",
    description:
      "바이오 의약품 생산을 선도하는 CDMO·대형 바이오사들의 공고입니다. 생산·품질·공정 역량을 쌓고 싶은 분께 맞는 포지션을 모았습니다.",
    variant: "company",
    thumbnail: "/images/home/hero-industry-factory.jpg",
  },
  T4: {
    id: "T4",
    label: "주목받는 혁신 바이오벤처",
    subtitle: "차세대 신약 도전",
    description:
      "차세대 신약과 혁신 기술로 주목받는 바이오벤처들의 채용입니다. 빠른 성장과 도전적인 환경에서 일하고 싶은 분께 맞는 포지션입니다.",
    variant: "company",
    thumbnail: "/images/home/hero-research-biology.jpg",
  },
  T5: {
    id: "T5",
    label: "RA·인허가 전문관",
    subtitle: "허가·규제 직무",
    description:
      "의약품·의료기기 인허가 및 규제 대응 전문 직무입니다. RA, CMC, 글로벌 허가 전략 경험자에게 적합한 공고를 모았습니다.",
    variant: "job",
    thumbnail: "/images/company/company_pic_example_7.jpg",
    keywords: ["RA", "CTD", "인허가", "MFDS", "FDA", "EMA", "CMC", "글로벌 허가"],
  },
  T6: {
    id: "T6",
    label: "임상 전문관",
    subtitle: "임상 운영·관리 직무",
    description:
      "임상시험 운영·관리 전문 직무입니다. CRO, 제약사 임상팀에서 GCP 기반으로 일하고 싶은 분께 맞는 포지션입니다.",
    variant: "job",
    thumbnail: "/images/home/hero-hospital.jpg",
    keywords: ["임상PM", "GCP", "CRO", "IND", "임상시험", "모니터링", "CRA"],
  },
  T7: {
    id: "T7",
    label: "QA·QC 품질 전문관",
    subtitle: "품질보증·관리 직무",
    description:
      "의약품 품질보증(QA)·품질관리(QC) 전문 직무입니다. GMP 환경에서 품질 관리 역량을 키워갈 수 있는 공고를 모았습니다.",
    variant: "job",
    thumbnail: "/images/company/company_pic_example_4.jpg",
    keywords: ["QA", "QC", "GMP", "CAPA", "일탈", "품질보증", "분석시험"],
  },
  T8: {
    id: "T8",
    label: "MSL·메디컬 전문관",
    subtitle: "메디컬·MSL 직무",
    description:
      "Medical Science Liaison(MSL)을 포함한 메디컬 어페어스 전문 직무입니다. KOL 관리와 의학 커뮤니케이션에 관심 있는 분께 맞습니다.",
    variant: "job",
    thumbnail: "/images/home/hero-pharmacy.jpg",
    keywords: ["MSL", "KOL", "Medical Affairs", "메디컬", "임상근거", "학술"],
  },
  T9: {
    id: "T9",
    label: "BD·라이선싱 전문관",
    subtitle: "사업개발·라이선싱 직무",
    description:
      "제약·바이오 산업의 사업개발(BD)과 라이선싱 전문 직무입니다. 기술이전, 파트너십, 계약 협상 경험자에게 맞는 공고를 모았습니다.",
    variant: "job",
    thumbnail: "/images/company/company_pic_example_5.jpg",
    keywords: ["BD", "라이선싱", "기술이전", "파트너십", "Deal", "사업개발"],
  },
};

/** @deprecated THEME_META.T*.label 사용 권장 */
export const THEME_LABELS: Record<ThemeId, string> = Object.fromEntries(
  Object.entries(THEME_META).map(([k, v]) => [k, v.label]),
) as Record<ThemeId, string>;

/**
 * 직무 대분류/소분류 id 상수. 실제 분류 체계는 `src/config/jobFilters/industryFilters.ts`의
 * `industryJobCategoryOptions`가 단일 소스이며, 여기서는 그 id를 가리키는 이름만 모아 오타를 방지한다.
 * (대분류는 `Job.jobSubcategoryIds` + track으로부터 항상 derive되므로 별도 필드로 중복 저장하지 않는다.)
 */
export const JOB_SUBCATEGORY = {
  QA: "qa",
  QC: "qc",
  PV_DRUG_SAFETY: "pv-drug-safety",
  BD_LICENSING: "bd-licensing",
  PHARMA_PHARMACY: "pharma-pharmacy",
  BIOLOGICS_FORMULATION_ANALYSIS: "biologics-formulation-analysis",
  MEDICAL_DEVICE_RA: "medical-device-ra",
  CLINICAL_PM: "clinical-pm",
  MANUFACTURING: "manufacturing",
  RA: "ra",
  CLINICAL_OPS: "clinical-ops",
  MSL: "msl",
  NEW_DRUG: "new-drug",
  PRECLINICAL: "preclinical",
} as const;
