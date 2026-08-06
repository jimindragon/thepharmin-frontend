"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * 모달 겉틀(오버레이·패널·헤더·닫기 동작) 공용 부품.
 *
 * 기업센터·마이페이지의 큰 모달 5곳(StageMoveModal / BoostModal / BillingDocumentModal /
 * InterestPromptModal / 이력서 미리보기)이 같은 마크업을 각자 복제하고 있다. 값은 그 복제본들과
 * 동일하게 맞췄으니, 새 모달은 이 부품을 쓰고 기존 5곳은 별도 회차에 옮긴다.
 *
 * 본문·푸터는 호출부가 children으로 채운다 — 스크롤 영역(overflow-y-auto)과 버튼 줄의 여백은
 * 모달마다 달라서 여기서 고정하지 않는다. 패널이 flex-col이므로 children에 shrink-0을 주면
 * 고정 영역, 안 주면 늘어나는 영역이 된다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다(ConfirmDialog와 같은 방식).
 * Escape·스크롤 잠금 effect가 마운트 시점에만 걸려야 하기 때문이다.
 */
export function ModalShell({
  title,
  onClose,
  children,
  /** 패널 최대 폭 Tailwind 클래스. 480px 이하에서는 max-w-none이 이겨 전체 폭 바텀시트가 된다. */
  maxWidth = "max-w-[560px]",
  /** 스크린리더용 이름. 미지정 시 title을 쓴다 — 제목이 ReactNode일 때만 지정할 것. */
  ariaLabel,
}: {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
  ariaLabel?: string;
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
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 py-6 max-[480px]:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={clsx(
          "flex w-full flex-col border border-[#d8dee6] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]",
          "max-h-[92dvh] max-[480px]:max-h-[calc(100dvh-24px)] max-[480px]:max-w-none max-[480px]:self-end",
          maxWidth,
        )}
      >
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-[17px] font-bold tracking-[-0.02em] text-[#17202c]">{title}</h2>
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
