"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * 모바일(≤760px) 우측 슬라이드 패널.
 *
 * 헤더 앵커 드롭다운(알림 벨·계정 메뉴)이 좁은 폭에서 화면의 95%를 덮으면서도 화면 밖으로
 * 잘려 나가는 문제를 위한 대체 표면이다. ModalShell·OverlayPanel과 같은 "오버레이 + 패널"
 * 계열이지만 가운데 정렬이 아니라 오른쪽 모서리에 붙는다는 점만 다르다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다
 * (ModalShell·OverlayPanel과 같은 방식). Escape·스크롤 잠금 effect가 마운트 시점에만
 * 걸려야 하기 때문이다. 노출 폭 판정도 호출부 몫이다 — 드롭다운과 둘 중 하나만 마운트되어야
 * 데스크톱에서 스크롤이 잠기지 않는다(useIsMobileDrawerViewport 참고).
 */

/** 드로어가 드롭다운을 대신하는 상한 폭. 하단 탭바의 min-[761px]:hidden과 같은 경계다. */
export const MOBILE_DRAWER_MAX_WIDTH = 760;

/**
 * 현재 뷰포트가 드로어 구간(≤760px)인지. 서버·수화 직후에는 false(=드롭다운)를 돌려주지만,
 * 패널은 사용자가 트리거를 누른 뒤에만 마운트되므로 그 시점엔 이미 effect가 값을 채운 뒤다.
 */
export function useIsMobileDrawerViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${MOBILE_DRAWER_MAX_WIDTH}px)`);
    setIsMobile(query.matches);
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function MobileDrawer({
  title,
  ariaLabel,
  onClose,
  children,
}: {
  /** 헤더 왼쪽 제목. 본문 머리가 제목 노릇을 하는 메뉴(계정 메뉴)에서는 생략한다. */
  title?: ReactNode;
  /** 스크린리더용 이름. 미지정 시 title을 쓴다 — title이 없거나 ReactNode일 때만 지정할 것. */
  ariaLabel?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  // 마운트 직후 한 프레임 뒤에 켜서 translate-x-full → 0 전환이 실제로 일어나게 한다.
  // 닫힘은 즉시 언마운트다 — 들어올 때만 움직이는 dropdown-panel과 같은 규칙.
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    // z-[75] — 헤더(50)·탭바(40)는 물론 모달 계열(70)보다도 위. 토스트(80)만 남겨 둔다.
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className={clsx(
          "absolute inset-y-0 right-0 flex w-[min(85vw,360px)] flex-col border-l border-[#d8dee6] bg-white",
          // 그림자는 "떠 있음"을 알리는 기능적 예외 — 모달 계열의 하드코딩 값을 그대로 쓴다.
          "shadow-[0_18px_48px_rgba(0,0,0,0.22)]",
          !prefersReducedMotion && "transition-transform duration-200 ease-out",
          entered ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* 헤더 — 제목이 없어도 닫기 X는 남는다(드로어를 닫을 유일한 확정 조작). */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2">
          {title ? <h2 className="text-[15px] font-semibold text-[#17202c]">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-10 w-10 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
