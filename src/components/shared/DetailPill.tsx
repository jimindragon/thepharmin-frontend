import type { ReactNode } from "react";

/**
 * 읽기 전용 상세 뷰(이력서 미리보기·지원자 상세)의 대형 표시 필. 소형 밀집 컨텍스트는 JobTagChip.
 */
export function DetailPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-border bg-[#f7f8fa] px-3.5 py-1.5 text-[13px] font-medium text-[#596373]">
      {children}
    </span>
  );
}
