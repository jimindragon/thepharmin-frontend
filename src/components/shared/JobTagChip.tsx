import type { ReactNode } from "react";

/**
 * 직무 태그 칩 — 소형 티어 표시용 공용 컴포넌트.
 * 목록/카드 밀집 컨텍스트(대시보드 이력서 행, 이력서 관리 카드)에서 사용.
 * 직각(radius 없음), 테두리는 border-border 토큰 유지.
 * 대형 티어(ResumeContentView·BusinessApplicantDetail의 Pill)는 이 컴포넌트 범위 밖.
 */
export function JobTagChip({ children }: { children: ReactNode }) {
  return (
    <span className="border border-border bg-[#f7f8fa] px-2.5 py-0.5 text-[12px] font-medium text-[#596373]">
      {children}
    </span>
  );
}
