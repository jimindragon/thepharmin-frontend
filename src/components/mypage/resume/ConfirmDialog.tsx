"use client";

import { AlertTriangle, X } from "lucide-react";

/**
 * 삭제처럼 되돌리기 어려운 동작 전에 사용하는 공용 확인 모달.
 *
 * tone="neutral"은 되돌릴 수 있는 동작(예: 공고 게시 전 내용 확인)용이다 — 파괴적 동작이 아니라
 * 빨간 확인 버튼과 경고 아이콘을 쓰지 않는다. 기본값은 danger이므로 기존 호출부의 렌더는 그대로다.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "삭제",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  /** danger(기본) = 빨간 확인 버튼 + 경고 아이콘 / neutral = 검정 확인 버튼, 아이콘 없음 */
  tone?: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // 확인 버튼은 색만 갈린다 — 높이·여백·타이포는 두 톤이 같아야 한다.
  const confirmColorClass = tone === "danger" ? "border-danger bg-danger" : "border-[#111111] bg-[#111111]";

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 px-5" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[400px] border border-border bg-white shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            {tone === "danger" ? (
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center bg-[#fdf2f0] text-danger">
                <AlertTriangle size={18} />
              </span>
            ) : null}
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[#242b36]">{title}</h3>
              <p className="mt-1.5 text-[13px] font-normal leading-[1.6] text-[#68717e]">{description}</p>
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
          <button type="button" onClick={onConfirm} className={`h-10 border ${confirmColorClass} px-4 text-[13px] font-medium text-white hover:brightness-95`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
