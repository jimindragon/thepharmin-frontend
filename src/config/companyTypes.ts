import type { HospitalOperator, HospitalType, PharmacyType } from "@/types/jobs";

export const pharmacyTypeLabels: Record<PharmacyType, string> = {
  local: "로컬 약국",
  "clinic-front": "문전 약국",
  large: "대형 약국",
  beauty: "뷰티 특화 약국",
};

export function getPharmacyTypeLabel(type: PharmacyType): string {
  return pharmacyTypeLabels[type];
}

export const hospitalTypeLabels: Record<HospitalType, string> = {
  tertiary: "상급종합병원",
  general: "종합병원",
  "long-term": "요양병원",
  psychiatric: "정신병원",
  hospital: "병원",
  "public-health": "보건기관",
};

export function getHospitalTypeLabel(type: HospitalType): string {
  return hospitalTypeLabels[type];
}

export const hospitalOperatorLabels: Record<HospitalOperator, string> = {
  private: "민간",
  public: "공공",
  military: "군",
  university: "대학",
};

export function getHospitalOperatorLabel(operator: HospitalOperator): string {
  return hospitalOperatorLabels[operator];
}

/**
 * 병원 기관 분류 조합 렌더 규칙: operator가 "private"이면 유형 라벨만, 그 외엔 "{운영주체}·{유형}".
 * type이 "hospital"(병원)이고 specialtyLabel이 있으면(보건복지부 지정 전문병원) 유형 라벨 자리에
 * "{specialtyLabel} 전문병원"을 쓴다 — 전문병원은 병원급 의료기관이라 이 조합에서만 나타난다.
 */
export function getHospitalCombinedTypeLabel(type: HospitalType, operator: HospitalOperator, specialtyLabel?: string): string {
  const typeLabel = type === "hospital" && specialtyLabel ? `${specialtyLabel} 전문병원` : hospitalTypeLabels[type];
  return operator === "private" ? typeLabel : `${hospitalOperatorLabels[operator]}·${typeLabel}`;
}
