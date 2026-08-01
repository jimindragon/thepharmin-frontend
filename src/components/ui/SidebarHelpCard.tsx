import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { sharedRoutes } from "@/config/routes";

/**
 * 기업센터·마이페이지 좌측 사이드바 하단에 공통으로 쓰는 고객센터 안내 행.
 * 회색 박스가 아니라 상단 구분선 + 행 전체 클릭으로 처리한다 —
 * 사이드바 내비가 아이콘 없는 텍스트 목록이라 박스 하나만 튀지 않게 하려는 것.
 */
export function SidebarHelpCard() {
  return (
    <div className="mt-10 max-[1040px]:hidden">
      <div className="h-px bg-[#e5e9ef]" />
      <Link
        href={sharedRoutes.support}
        className="group flex w-full items-center justify-between gap-3 py-4 transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111]"
      >
        <span className="flex flex-col">
          <span className="text-[14px] font-bold text-[#2c3440] group-hover:text-[#111111]">고객센터</span>
          <span className="mt-0.5 text-[13px] font-normal text-[#7b8491]">도움이 필요하신가요?</span>
        </span>
        <ChevronRight size={16} aria-hidden="true" className="shrink-0 text-[#6b7280] group-hover:text-[#4b5563]" />
      </Link>
    </div>
  );
}
