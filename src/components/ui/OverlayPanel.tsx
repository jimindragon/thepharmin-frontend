"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * 오버레이 위에 패딩 박스 하나를 띄우는 모달 겉틀.
 *
 * ModalShell과는 **다른 계열**이다. 저쪽은 구분선이 있는 헤더 바 아래로 본문·푸터가 붙지만,
 * 이쪽은 패널 전체가 하나의 패딩 박스이고 닫기 X가 본문 첫 줄 오른쪽에 함께 놓인다.
 * z-index(50 vs 70)·배경 농도(45% vs 40%)·보더(#20242b vs #d8dee6)·그림자가 서로 달라
 * 한쪽 값으로 맞추지 않는다 — 두 계열을 하나로 합치는 것은 별건이다.
 *
 * 안쪽 구성은 호출부가 정한다. 이 부품이 갖는 것은 겉틀(오버레이·패널·닫기 X)과
 * 닫기 동작(Escape·배경 클릭)·body 스크롤 잠금뿐이다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다(ModalShell과 같은 방식).
 * Escape·스크롤 잠금 effect가 마운트 시점에만 걸려야 하기 때문이다.
 */
export function OverlayPanel({
  ariaLabel,
  header,
  children,
  onClose,
  /** 패널 최대 폭 Tailwind 클래스. 기본값은 로그인 게이트가 쓰는 값이다. */
  maxWidth = "max-w-[420px]",
  /** 패널 안쪽 여백 Tailwind 클래스. 게이트는 p-6, 목록형은 p-5를 쓴다. */
  padding = "p-6",
  /**
   * 첫 줄(본문 머리 + 닫기 X)의 교차축 정렬.
   * 머리가 여러 줄로 긴 경우 X가 위에 붙어야 자연스러워 "start"가 기본이다.
   */
  headerAlign = "start",
}: {
  /**
   * 스크린리더가 읽는 대화상자 이름. 머리 내용이 자유 구성이라 제목을 자동으로 뽑을 수 없어
   * 호출부가 직접 넘긴다 — 같은 안내가 화면마다 다른 맥락에서 뜨므로 화면 성격까지 담는다.
   */
  ariaLabel: string;
  /** 첫 줄 왼쪽에 놓일 내용. 닫기 X는 이 부품이 오른쪽에 붙인다. */
  header: ReactNode;
  children: ReactNode;
  onClose: () => void;
  maxWidth?: string;
  padding?: string;
  headerAlign?: "start" | "center";
}) {
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
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-5"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={clsx("w-full border border-[#20242b] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.24)]", maxWidth, padding)}>
        <div className={clsx("flex justify-between gap-4", headerAlign === "center" ? "items-center" : "items-start")}>
          {/* 클래스 없는 래퍼 — 이전 3곳이 모두 이 자리에 빈 div를 두고 있었다 */}
          <div>{header}</div>
          <button type="button" className="grid h-8 w-8 place-items-center hover:bg-[#f2f3f5]" onClick={onClose} aria-label="닫기">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
