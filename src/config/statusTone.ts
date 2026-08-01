/**
 * 기업센터 표 상태색 3단 원칙의 단일 소스.
 *
 *   회색 = 진행 안 함 / 파랑 = 진행 중 / 초록 = 완료·긍정 결과 / 빨강 = 부정 결과
 *
 * 표마다 상태 유니온이 다르지만(ApplicantStage 6값, HeadhuntingRequestStatus 5값 …)
 * "성격"은 아래 6종으로 수렴한다. 각 표는 유니온 → StatusTone 매핑 하나만 들고 있으면 되고,
 * 실제 색 문자열은 이 파일에만 존재한다.
 */
export type StatusTone = "idle" | "progress" | "success" | "danger" | "ended" | "urgent";

export const STATUS_TONE: Record<StatusTone, { text: string; dot: string | null }> = {
  /** 아직 시작 안 함 — 신규·상담중·추천됨·보류 */
  idle: { text: "text-[#596373]", dot: "bg-status-neutral-dot" },
  /** 프로세스가 도는 중 — 게시 중·서류 검토·면접·처우 협의 */
  progress: { text: "text-status-pending", dot: "bg-status-pending-dot" },
  /** 완료·긍정 결과 — 채용 완료·입사 확정·합격 제안·결제완료 */
  success: { text: "text-status-positive", dot: "bg-status-positive-dot" },
  /** 부정 결과 — 불합격 */
  danger: { text: "text-status-error", dot: "bg-status-error-dot" },
  /**
   * 끝남 — 마감·부스트 종료·결제취소.
   * idle(#596373)과 색이 다른 이유: #8a94a3은 "종료 행 전체 흐려짐"의 일부라
   * 제목·주요값이 함께 내려앉는 층에 속한다. idle은 아직 살아 있는 행의 중립색이다.
   */
  ended: { text: "text-[#8a94a3]", dot: "bg-status-neutral-dot" },
  /**
   * 시간 압박 — D-day·종료 임박. 3단(진행 축) 밖의 별도 축이다.
   * dot이 null인 유일한 tone — --status-urgent-dot 토큰이 아직 없고,
   * 현재 소비처(대시보드 D-2 배지)도 점 없이 텍스트만 쓴다.
   */
  urgent: { text: "text-status-urgent", dot: null },
};
