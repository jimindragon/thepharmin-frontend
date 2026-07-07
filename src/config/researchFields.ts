import type { JobCategoryOption } from "@/types/jobs";

/**
 * 연구 전공분야 계층(상위 분류 > 하위 전공). 산업 직무 분류(researchJobCategoryOptions)와는
 * 별개의 분류 체계이므로 같은 도메인 모델(JobCategoryOption/JobSubcategoryOption)을 재사용하되
 * categoryId는 항상 이 파일의 그룹 id를 가리킨다.
 */
export const researchFieldCategoryOptions: JobCategoryOption[] = [
  {
    id: "life-science",
    label: "생명과학",
    subcategories: [
      { id: "molecular-cell-biology", label: "분자·세포생물학", categoryId: "life-science" },
      { id: "immunology", label: "면역학", categoryId: "life-science" },
      { id: "neuroscience", label: "신경과학", categoryId: "life-science" },
      { id: "cancer-biology", label: "암생물학", categoryId: "life-science" },
      { id: "genetics-genomics", label: "유전학·유전체학", categoryId: "life-science" },
    ],
  },
  {
    id: "pharma-medicine",
    label: "의약학",
    subcategories: [
      { id: "pharmacology-toxicology", label: "약리·독성", categoryId: "pharma-medicine" },
      { id: "pharmaceutics", label: "약제학·제형", categoryId: "pharma-medicine" },
      { id: "medicinal-chemistry", label: "의약화학", categoryId: "pharma-medicine" },
      { id: "disease-model", label: "질환모델", categoryId: "pharma-medicine" },
    ],
  },
  {
    id: "clinical-translational",
    label: "임상·중개연구",
    subcategories: [
      { id: "clinical-research", label: "임상연구", categoryId: "clinical-translational" },
      { id: "translational-research", label: "중개연구", categoryId: "clinical-translational" },
      { id: "clinical-specimen", label: "임상검체 연구", categoryId: "clinical-translational" },
      { id: "cohort-registry", label: "코호트·레지스트리", categoryId: "clinical-translational" },
    ],
  },
  {
    id: "bio-medical-convergence",
    label: "바이오·의료융합",
    subcategories: [
      { id: "organoid", label: "오가노이드", categoryId: "bio-medical-convergence" },
      { id: "stem-cell-regenerative", label: "줄기세포·재생의학", categoryId: "bio-medical-convergence" },
      { id: "cell-gene-therapy", label: "세포·유전자치료", categoryId: "bio-medical-convergence" },
      { id: "biomarker-precision", label: "바이오마커·정밀의학", categoryId: "bio-medical-convergence" },
    ],
  },
  {
    id: "data-ai",
    label: "데이터·AI",
    subcategories: [
      { id: "bioinformatics", label: "바이오인포매틱스", categoryId: "data-ai" },
      { id: "ngs-single-cell", label: "NGS·단일세포분석", categoryId: "data-ai" },
      { id: "multiomics", label: "멀티오믹스", categoryId: "data-ai" },
      { id: "ai-drug-discovery", label: "AI 신약개발", categoryId: "data-ai" },
    ],
  },
  {
    id: "medical-device-eng",
    label: "의료기기·공학",
    subcategories: [
      { id: "biomedical-engineering", label: "의공학", categoryId: "medical-device-eng" },
      { id: "medical-imaging", label: "의료영상", categoryId: "medical-device-eng" },
      { id: "diagnostic-device", label: "진단기기", categoryId: "medical-device-eng" },
      { id: "digital-health", label: "디지털헬스", categoryId: "medical-device-eng" },
    ],
  },
  {
    id: "field-etc",
    label: "기타 분야",
    subcategories: [
      { id: "field-etc-sub", label: "기타", categoryId: "field-etc" },
    ],
  },
];

interface ResearchFieldLookup {
  groupLabel: string;
  fieldLabel: string;
}

function lookupResearchField(fieldId: string): ResearchFieldLookup | null {
  for (const group of researchFieldCategoryOptions) {
    const field = group.subcategories.find((subcategory) => subcategory.id === fieldId);
    if (field) {
      return { groupLabel: group.label, fieldLabel: field.label };
    }
  }

  return null;
}

/** "생명과학 > 신경생물학"처럼 상위·하위 분류가 보이는 표시용 라벨. 알 수 없는 id는 건너뛴다. */
export function getResearchFieldLabel(fieldId: string): string | null {
  const found = lookupResearchField(fieldId);
  return found ? `${found.groupLabel} > ${found.fieldLabel}` : null;
}

/** 칩 등 좁은 영역에 쓰는 하위 전공명만의 짧은 라벨. */
export function getResearchFieldShortLabel(fieldId: string): string | null {
  return lookupResearchField(fieldId)?.fieldLabel ?? null;
}

export function getResearchFieldLabels(fieldIds: string[]): string[] {
  return fieldIds.map((id) => getResearchFieldLabel(id)).filter((label): label is string => Boolean(label));
}
