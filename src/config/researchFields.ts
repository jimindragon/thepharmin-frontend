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
      { id: "cell-biology", label: "세포생물학", categoryId: "life-science" },
      { id: "molecular-biology", label: "분자생물학", categoryId: "life-science" },
      { id: "neurobiology", label: "신경생물학", categoryId: "life-science" },
      { id: "aging-cancer-biology", label: "노화·암생물학", categoryId: "life-science" },
      { id: "developmental-biology", label: "발생생물학", categoryId: "life-science" },
      { id: "immunology", label: "면역학", categoryId: "life-science" },
      { id: "microbiology", label: "미생물학", categoryId: "life-science" },
      { id: "biochemistry", label: "생화학", categoryId: "life-science" },
      { id: "structural-biology", label: "구조생물학", categoryId: "life-science" },
    ],
  },
  {
    id: "medicine",
    label: "의약학",
    subcategories: [
      { id: "oncology", label: "종양의학", categoryId: "medicine" },
      { id: "neurology", label: "신경의학", categoryId: "medicine" },
      { id: "immune-medicine", label: "면역의학", categoryId: "medicine" },
      { id: "genetics-genomics", label: "유전·유전체의학", categoryId: "medicine" },
      { id: "pharmacology", label: "약리학", categoryId: "medicine" },
      { id: "physiology", label: "생리학", categoryId: "medicine" },
      { id: "pathology", label: "병리학", categoryId: "medicine" },
    ],
  },
  {
    id: "bio-medical-convergence",
    label: "바이오·의료융합",
    subcategories: [
      { id: "cognitive-neuroscience", label: "뇌인지과학", categoryId: "bio-medical-convergence" },
      { id: "bioimaging", label: "바이오이미징", categoryId: "bio-medical-convergence" },
      { id: "bio-medical-convergence-field", label: "바이오·의료융합", categoryId: "bio-medical-convergence" },
      { id: "biomedical-engineering", label: "의공학", categoryId: "bio-medical-convergence" },
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
