"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * 모달 겉틀(오버레이·패널·헤더·닫기 동작) 공용 부품.
 *
 * 본문·푸터는 호출부가 children으로 채운다 — 스크롤 영역(overflow-y-auto)과 버튼 줄의 여백은
 * 모달마다 달라서 여기서 고정하지 않는다. 패널이 flex-col이므로 children에 shrink-0을 주면
 * 고정 영역, 안 주면 늘어나는 영역이 된다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다(ConfirmDialog와 같은 방식).
 * Escape·스크롤 잠금 effect가 마운트 시점에만 걸려야 하기 때문이다.
 */

/**
 * 헤더 모양 3종. 자유 조합이 아니라 화면에 실제로 있던 세 가지 형태를 그대로 옮긴 것이다 —
 * 새 조합이 필요해지면 그때 값을 정해 넷째 항목으로 추가할 것.
 *
 *   plain    — 제목 한 줄. 설명을 넘겨도 무시한다.
 *   emphasis — 큰 제목 + 설명. 처음 만난 사용자에게 무엇을 묻는지 알리는 안내창용.
 *   caption  — 제목 + 작은 회색 부제. 제목이 콘텐츠 이름이라 부제로 성격을 덧붙이는 화면용.
 */
const HEADER_BY_VARIANT = {
  plain: {
    header: "flex shrink-0 items-center justify-between border-b border-border px-6 py-4",
    title: "text-[17px] font-bold tracking-[-0.02em] text-[#17202c]",
    description: null,
  },
  emphasis: {
    header: "flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5",
    title: "text-[22px] font-bold tracking-[-0.02em] text-[#17202c]",
    description: "mt-2 text-[14px] font-normal leading-[1.6] text-[#68717e]",
  },
  caption: {
    header: "flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-4",
    title: "text-[17px] font-bold tracking-[-0.02em] text-[#17202c]",
    description: "mt-1 text-[13px] font-normal text-[#8a94a3]",
  },
} as const;

/**
 * 어느 폭부터 "가운데 다이얼로그"가 아니라 "화면 하단에 붙는 바텀시트"가 되는지.
 *
 * 480 — 기본값. 지금까지의 모든 모달이 쓰던 경계다.
 * 760 — 하단 탭바·모바일 전용 화면과 같은 경계(MobileTabBar의 min-[761px]:hidden). 모바일에서
 *       시트가 본체인 화면(공고 필터)이 쓴다. 그 구간에선 좌우 여백도 지워 화면 폭을 꽉 채우고,
 *       뒤의 목록이 살짝 비치도록 100dvh가 아니라 86dvh에서 멈춘다.
 *
 * 두 항목 모두 완성된 클래스 문자열이어야 한다 — Tailwind는 조립된 클래스명을 스캔하지 못한다.
 */
const SHEET_BREAKPOINT_CLASSES = {
  480: {
    overlay: "max-[480px]:pb-0",
    panel: "max-[480px]:max-h-[calc(100dvh-24px)] max-[480px]:max-w-none max-[480px]:self-end",
  },
  760: {
    overlay: "max-[760px]:px-0 max-[760px]:pb-0",
    panel: "max-[760px]:max-h-[86dvh] max-[760px]:max-w-none max-[760px]:self-end",
  },
} as const;

export function ModalShell({
  title,
  onClose,
  children,
  /** 패널 최대 폭 Tailwind 클래스. 시트 구간에서는 max-w-none이 이겨 전체 폭 바텀시트가 된다. */
  maxWidth = "max-w-[560px]",
  /** 스크린리더용 이름. 미지정 시 title을 쓴다 — 제목이 ReactNode일 때만 지정할 것. */
  ariaLabel,
  /** 헤더 모양. 기본값 plain은 제목 한 줄이며 description을 넘겨도 렌더하지 않는다. */
  headerVariant = "plain",
  /** 제목 아래 한 줄. headerVariant가 emphasis·caption일 때만 렌더된다. */
  description,
  /** 바텀시트로 바뀌는 상한 폭. 기본 480은 기존 모달의 동작 그대로다. */
  sheetBreakpoint = 480,
  /**
   * 패널에 덧붙일 클래스. 기본 클래스 뒤에 와서 높이 같은 값을 호출부가 덮어쓸 수 있다.
   * 미지정이면 아무것도 붙지 않는다 — 기존 사용처의 렌더는 그대로다.
   */
  panelClassName,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  ariaLabel?: string;
  headerVariant?: keyof typeof HEADER_BY_VARIANT;
  description?: ReactNode;
  sheetBreakpoint?: keyof typeof SHEET_BREAKPOINT_CLASSES;
  panelClassName?: string;
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

  const headerStyle = HEADER_BY_VARIANT[headerVariant];
  const sheetStyle = SHEET_BREAKPOINT_CLASSES[sheetBreakpoint];

  return (
    <div
      className={clsx("fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6", sheetStyle.overlay)}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={clsx(
          "flex w-full flex-col border border-[#d8dee6] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]",
          "max-h-[92dvh]",
          sheetStyle.panel,
          maxWidth,
          panelClassName,
        )}
      >
        {/* 헤더 */}
        <div className={headerStyle.header}>
          {/* 설명이 없는 변형은 h2를 감싸지 않는다 — 래퍼가 생기면 plain의 DOM이 달라진다 */}
          {headerStyle.description && description ? (
            <div>
              <h2 className={headerStyle.title}>{title}</h2>
              <p className={headerStyle.description}>{description}</p>
            </div>
          ) : (
            <h2 className={headerStyle.title}>{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="grid h-8 w-8 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]"
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
