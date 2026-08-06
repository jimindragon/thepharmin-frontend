"use client";

import { AlertTriangle, Lock, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

/**
 * 되돌리기 어렵거나 한 번 더 확인받아야 하는 동작 앞에 세우는 공용 확인 모달.
 *
 * tone은 아이콘과 확인 버튼 색을 한 축으로 묶는다.
 *   danger(기본) — 빨간 확인 버튼 + 경고 아이콘. 삭제처럼 되돌릴 수 없는 동작.
 *   neutral      — 검정 확인 버튼, 아이콘 없음. 되돌릴 수 있는 동작(공고 게시 전 확인).
 *   info         — 검정 확인 버튼 + 회색 잠금 아이콘. 파괴적이지 않지만 비용이 드는 동작(열람권 사용).
 * 기본값이 danger이므로 tone을 넘기지 않던 호출부의 렌더는 그대로다.
 *
 * 배경 클릭으로는 닫지 않는다 — 확인 다이얼로그는 실수로 닫히면 안 되는 성격이라 의도적으로
 * 뺐다(ModalShell·OverlayPanel과 다른 점). Escape는 취소와 같은 뜻이라 onCancel로 잇는다.
 *
 * 열림 여부는 이 컴포넌트가 갖지 않는다 — 호출부가 조건부로 마운트한다.
 * Escape·스크롤 잠금 effect가 마운트 시점에만 걸려야 하기 때문이다.
 */

/** tone별 아이콘. neutral은 아이콘 자체가 없어 이 표에 없다. */
const ICON_BY_TONE = {
  danger: { Icon: AlertTriangle, className: "bg-[#fdf2f0] text-danger" },
  info: { Icon: Lock, className: "bg-[#f4f6f8] text-[#596373]" },
} as const;

export function ConfirmDialog({
  ariaLabel,
  title,
  description,
  descriptionSize = "sm",
  note,
  confirmLabel = "삭제",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  /**
   * 스크린리더가 읽는 대화상자 이름. 제목만으로는 어느 화면의 확인창인지 갈리지 않는 경우가 있어
   * (4개 트랙의 공고 게시 확인이 모두 "게시 전에 확인해 주세요"다) 호출부가 직접 넘긴다.
   */
  ariaLabel: string;
  title: string;
  /** 줄바꿈이 필요한 경우를 위해 ReactNode를 받는다. 문자열이면 그대로 한 줄이다. */
  description: ReactNode;
  /** 설명 글자 크기. sm(기본) 13px / md 15px */
  descriptionSize?: "sm" | "md";
  /** 설명 아래 한 줄짜리 부가 정보(예: "보유 2장 → 1장"). 없으면 렌더하지 않는다. */
  note?: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "neutral" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // 확인 버튼은 색만 갈린다 — 높이·여백·타이포는 세 톤이 같아야 한다.
  const confirmColorClass = tone === "danger" ? "border-danger bg-danger" : "border-[#111111] bg-[#111111]";
  /**
   * hover도 톤을 따라간다. 검정 버튼에 brightness-95를 걸면 변화가 눈에 잡히지 않아
   * 한 단계 밝은 색으로 바꿔 준다 — 빨간 danger 버튼은 brightness로 충분히 드러난다.
   */
  const confirmHoverClass = tone === "danger" ? "hover:brightness-95" : "hover:bg-[#2a2a2a]";
  const icon = tone === "neutral" ? null : ICON_BY_TONE[tone];

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-5" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      <div className="w-full max-w-[400px] border border-border bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center ${icon.className}`}>
                <icon.Icon size={18} />
              </span>
            ) : null}
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h3>
              <p className={`mt-1.5 ${descriptionSize === "md" ? "text-[15px]" : "text-[13px]"} font-normal leading-[1.6] text-[#68717e]`}>{description}</p>
              {note ? <p className="mt-2 text-[13px] font-medium text-[#3f4855]">{note}</p> : null}
            </div>
          </div>
          <button type="button" onClick={onCancel} aria-label="닫기" className="grid h-8 w-8 shrink-0 place-items-center text-[#8a94a3] hover:bg-[#f4f5f6]">
            <X size={16} />
          </button>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-[#d8e0e8] bg-white px-4 text-[13px] font-medium text-[#44505f] hover:border-[#111111] hover:text-[#111111]"
          >
            취소
          </button>
          <button type="button" onClick={onConfirm} className={`h-10 border ${confirmColorClass} px-4 text-[13px] font-medium text-white ${confirmHoverClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
