import type { ReactNode } from "react";
import { Info } from "lucide-react";

/**
 * 정적 인포 배너(박스형). Info 아이콘 + 항상 보이는 안내 문구를 옅은 회색 박스로 감싼다.
 * 폼 섹션 안내·가입/인증 안내·이력서 정책 안내 등 "섹션/페이지 수준 안내 박스"에 공통 사용.
 * 기준 스타일은 가입·인증 3곳에서 이미 수렴해 있던 e2e8ef/fbfcfd 계열. 경고 분화(tone)는 별도 결정 사항이라 두지 않는다.
 * 무박스 보조 문구(헬프텍스트·빈 상태)는 InlineInfoHint.
 */
export function InfoNoticeBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 border border-[#e2e8ef] bg-[#fbfcfd] px-4 py-3 text-[12px] font-normal leading-[1.6] text-[#6f7783]">
      <Info size={15} className="mt-0.5 shrink-0 text-[#7b8491]" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
