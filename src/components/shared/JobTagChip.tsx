import type { ReactNode } from "react";

/**
 * 직무 태그 칩 — 소형 티어 표시용 공용 컴포넌트.
 * 목록/카드 밀집 컨텍스트(대시보드 이력서 행, 이력서 관리 카드)에서 사용.
 * 직각(radius 없음), 테두리는 border-border 토큰 유지.
 * 소형 표시 칩(직무 태그·카테고리)은 이 컴포넌트, 상세 뷰 대형 필은 DetailPill 담당.
 */
export function JobTagChip({ children }: { children: ReactNode }) {
  return (
    <span className="border border-border bg-[#f7f8fa] px-2.5 py-0.5 text-[13px] font-medium text-[#596373]">
      {children}
    </span>
  );
}
