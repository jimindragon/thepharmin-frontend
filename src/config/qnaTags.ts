// src/config/qnaTags.ts
// 채용 QNA 글 작성 시 선택하는 태그 풀 — 필터·집계·작성 폼이 모두 이 풀을 정본으로 참조한다.
// pharmacist/industry 각각 고정된 9개 태그로 구성되며, 자유 태그 추가는 없다.

import type { QnaType } from "@/types/qna";

/** 작성 폼에서 선택 가능한 최대 태그 개수 */
export const QNA_TAG_MAX = 2;

export const qnaTagPool: Record<QnaType, string[]> = {
  pharmacist: ["취업·이직", "연봉", "약국 실무", "복약지도", "약국 운영", "개국", "병원약사", "산업약사", "공공기관"],
  industry: ["취업·이직", "서류", "면접", "연봉·처우", "커리어", "품질", "인허가·임상", "연구", "생산"],
};

/** 타입별 태그 풀을 꺼낸다. */
export function getQnaTagPool(type: QnaType): string[] {
  return qnaTagPool[type];
}
