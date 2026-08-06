"use client";

import { Lock } from "lucide-react";
import { OverlayPanel } from "@/components/ui/OverlayPanel";

/**
 * 비로그인 상태에서 회원 기능을 눌렀을 때 보여주는 안내.
 *
 * 캘린더(RecruitmentCalendarClient)와 공고 목록 사이드바(SidebarQuickLinks)가 각자 들고 있던
 * 같은 마크업을 하나로 합쳤다. 제목("로그인이 필요합니다")과 버튼 두 개는 두 곳이 동일했고,
 * 실제로 달랐던 것은 설명 문구뿐이라 그것만 prop으로 받는다.
 *
 * 제목은 20px로 고정한다 — 합치기 전 캘린더 24px / 사이드바 20px로 갈려 있었지만 같은 문구·같은
 * 폭의 패널이라 의도된 차이가 아니었고, 앱의 다른 모달 제목(16~22px)과도 20px 쪽이 맞다.
 *
 * 실제 로그인 라우트가 없어 `onLogin`은 호출부의 로컬 로그인 상태만 되돌린다.
 */
export function LoginGateModal({
  ariaLabel,
  description,
  onClose,
  onLogin,
}: {
  /** 같은 안내가 캘린더·공고 목록 양쪽에서 뜨므로 어느 화면의 안내인지까지 담는다. */
  ariaLabel: string;
  /** 무엇이 회원 기능인지 알려주는 문구. 화면마다 다르다. */
  description: string;
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <OverlayPanel
      ariaLabel={ariaLabel}
      onClose={onClose}
      header={
        <>
          <div className="grid h-10 w-10 place-items-center bg-[#111111] text-white">
            <Lock size={18} />
          </div>
          <h2 className="mt-5 text-[20px] font-bold leading-tight tracking-[-0.02em] text-[#171b20]">로그인이 필요합니다</h2>
          <p className="mt-3 text-[13px] font-medium leading-6 text-[#7a8490]">{description}</p>
        </>
      }
    >
      <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
        <button type="button" className="h-11 bg-[#111111] px-5 text-[13px] font-medium text-white" onClick={onLogin}>
          로그인하고 보기
        </button>
        <button type="button" className="h-11 border border-[#d9dee5] px-5 text-[13px] font-medium text-[#4b5563]" onClick={onClose}>
          닫기
        </button>
      </div>
    </OverlayPanel>
  );
}
