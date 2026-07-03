import type { HospitalOperator, HospitalType, PharmacyType } from "@/types/jobs";

export const pharmacyTypeLabels: Record<PharmacyType, string> = {
  general: "일반약국",
  "clinic-floor": "의원층약국",
  "clinic-front": "병의원 문전약국",
  "hospital-front": "대형병원 문전약국",
};

export function getPharmacyTypeLabel(type: PharmacyType): string {
  return pharmacyTypeLabels[type];
}

export const hospitalTypeLabels: Record<HospitalType, string> = {
  tertiary: "상급종합병원",
  general: "종합병원",
  hospital: "병원",
  specialty: "전문병원",
  "long-term": "요양병원",
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
 * type이 "specialty"면 유형 라벨 자리에 specialtyLabel을 붙인 "{specialtyLabel} 전문병원"을 쓴다.
 */
export function getHospitalCombinedTypeLabel(type: HospitalType, operator: HospitalOperator, specialtyLabel?: string): string {
  const typeLabel = type === "specialty" && specialtyLabel ? `${specialtyLabel} 전문병원` : hospitalTypeLabels[type];
  return operator === "private" ? typeLabel : `${hospitalOperatorLabels[operator]}·${typeLabel}`;
}

/**
 * 약국 유형 → 특성(pharmacyFeatureOptions id) 기본 매핑. N3 PART B(등록폼 프리체크 구현)에서 사용 예정 —
 * 아직 어떤 UI도 이 상수를 참조하지 않는다.
 * LOCKED: 기관이 해제 불가(자동 확정). DEFAULT: 프리체크 상태로 시작하되 기관이 해제 가능.
 */
export const PHARMACY_TYPE_LOCKED_FEATURE_ID: Partial<Record<PharmacyType, string>> = {
  "clinic-front": "clinic_front",
  "hospital-front": "tertiary_hospital_front",
};

export const PHARMACY_TYPE_DEFAULT_FEATURE_ID: Partial<Record<PharmacyType, string>> = {
  "clinic-floor": "clinic_front",
};
