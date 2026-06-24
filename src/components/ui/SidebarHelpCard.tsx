import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { sharedRoutes } from "@/config/routes";

/**
 * 기업센터·마이페이지 좌측 사이드바 하단에 공통으로 쓰는 고객센터 안내 카드.
 */
export function SidebarHelpCard() {
  return (
    <div className="mt-8 border border-[#dfe4ea] bg-[#fbfcfd] p-4 max-[1040px]:hidden">
      <div className="flex items-center gap-2 text-[13px] font-black text-[#2c3440]">
        <HelpCircle size={17} />
        도움이 필요하신가요?
      </div>
      <p className="mt-2 text-[12px] font-semibold leading-[1.7] text-[#7b8491]">고객센터를 이용해 주세요.</p>
      <Link href={sharedRoutes.support} className="mt-4 inline-flex h-9 items-center border border-[#d2dae4] bg-white px-4 text-[12px] font-black text-[#3c4654] hover:border-[#111111]">
        고객센터
      </Link>
    </div>
  );
}
