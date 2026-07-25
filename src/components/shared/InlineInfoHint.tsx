import type { ReactNode } from "react";
import { Info } from "lucide-react";

/**
 * 정적 인포 배너(무박스형). Info 아이콘 + 회색 안내 문구를 배경·테두리 없이 인라인으로 표시한다.
 * 폼필드 부속 헬프텍스트·빈 상태 메시지처럼 박스가 오히려 과한 보조 문구에 사용.
 * 통합 전 12/14로 갈리던 아이콘 크기는 14, 색은 #8a94a3 계열로 수렴. 박스형 안내는 InfoNoticeBox.
 */
export function InlineInfoHint({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-[12px] font-normal leading-[1.55] text-[#8a94a3]">
      <Info size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
