import type { MemberAffiliationId } from "@/config/memberAffiliation";

/**
 * 기존 더파마뉴스 회원의 직종(12종) → 새 소속 체계(memberAffiliation.ts) 변환표.
 *
 * 절반은 자동 변환이 되지 않는다. "임상"은 제약사·CRO·병원 중 어디인지 알 수 없고,
 * "의사·약사·간호사"는 병원인지 약국인지 알 수 없다 — 기존 분류가 소속과 직무를 한 축에 섞어
 * 두었기 때문이다. 그래서 변환 가능한 것만 미리 채우고 나머지는 회원에게 다시 묻는다.
 *
 * burden은 그 "다시 묻는 정도"이고, 화면 문구가 이 값으로 갈린다:
 *   light  — 소속까지 확정. 확인만 받으면 된다
 *   medium — 한쪽 축만 확정(소속만 또는 직무만). 나머지 한 축을 고르면 된다
 *   heavy  — 양쪽 다 알 수 없다. 처음부터 골라야 하므로 왜 다시 묻는지 설명이 필요하다
 *
 * secondaryId는 memberAffiliation.ts가 industryJobCategoryOptions에서 가져오는
 * 산업 대분류 id와 같은 체계다. 소속이 null인 medium 항목의 secondaryId는 회원이 소속을
 * 고른 뒤에야 적용된다 — 그 소속의 2차 선택지에 같은 id가 있을 때만이다.
 */
export type LegacyOccupationId =
  | "rd"
  | "clinical"
  | "qc-qa"
  | "ra"
  | "bd-strategy"
  | "marketing-sales"
  | "finance"
  | "medical-professional"
  | "professor-researcher"
  | "student"
  | "media"
  | "etc";

/** 다시 물어야 하는 정도 — 화면 머리말이 이 값으로 갈린다. */
export type MigrationBurden = "light" | "medium" | "heavy";

export interface LegacyOccupation {
  id: LegacyOccupationId;
  /** 기존 회원이 보던 그대로의 이름. heavy 안내 문장에 그대로 인용한다. */
  label: string;
  /** 자동 변환되는 소속 유형. 알 수 없으면 null */
  affiliationId: MemberAffiliationId | null;
  /** 자동 변환되는 2차 선택. 알 수 없으면 null */
  secondaryId: string | null;
  burden: MigrationBurden;
}

export const legacyOccupations: LegacyOccupation[] = [
  // ── light: 소속까지 확정된다 ────────────────────────────────────────────────
  { id: "finance", label: "투자·금융·애널리스트", affiliationId: "finance", secondaryId: null, burden: "light" },
  { id: "media", label: "언론·미디어", affiliationId: "media", secondaryId: null, burden: "light" },
  { id: "etc", label: "기타", affiliationId: "etc", secondaryId: null, burden: "light" },
  // 학생은 소속이 확정이지만 전공 계열(2차)이 남는다 — 그래도 고를 것이 하나뿐이라 light로 둔다.
  { id: "student", label: "학생", affiliationId: "student", secondaryId: null, burden: "light" },

  // ── medium: 한쪽 축만 확정된다 ─────────────────────────────────────────────
  // 소속만 아는 경우
  { id: "professor-researcher", label: "교수·연구원", affiliationId: "research", secondaryId: null, burden: "medium" },
  // 직무만 아는 경우 — 제약사인지 CRO인지 의료기기인지가 남는다
  { id: "ra", label: "RA·허가", affiliationId: null, secondaryId: "regulatory", burden: "medium" },
  { id: "bd-strategy", label: "사업개발·전략", affiliationId: null, secondaryId: "strategy-investment", burden: "medium" },
  { id: "marketing-sales", label: "마케팅·영업·MR", affiliationId: null, secondaryId: "sales-marketing", burden: "medium" },
  { id: "qc-qa", label: "QC·QA", affiliationId: null, secondaryId: "production-quality", burden: "medium" },

  // ── heavy: 양쪽 다 알 수 없다 ──────────────────────────────────────────────
  // R&D·임상은 제약사/CRO/병원/연구기관 어디든 될 수 있고, 의사·약사·간호사는 병원인지 약국인지 모른다.
  { id: "rd", label: "R&D", affiliationId: null, secondaryId: null, burden: "heavy" },
  { id: "clinical", label: "임상", affiliationId: null, secondaryId: null, burden: "heavy" },
  { id: "medical-professional", label: "의사·약사·간호사", affiliationId: null, secondaryId: null, burden: "heavy" },
];

/** 회원 데이터가 아직 없어 기본값이 필요할 때 쓰는 항목 — 가장 손이 많이 가는 heavy 케이스로 둔다. */
export const defaultLegacyOccupationId: LegacyOccupationId = "clinical";

export function getLegacyOccupation(id: string | null | undefined): LegacyOccupation {
  return (
    legacyOccupations.find((occupation) => occupation.id === id) ??
    legacyOccupations.find((occupation) => occupation.id === defaultLegacyOccupationId)!
  );
}
